import {
  autoUpdate,
  computePosition,
  offset,
  flip,
  shift,
  size,
  type Placement,
} from "@floating-ui/dom";
import { comboBoxFilter } from "./combo-box-filter.js";
const selector = '[data-slot="combo-box-root"],[data-slot="autocomplete-root"]';
const controllers = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function createComboBox(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const popupSearch = root.dataset["slot"] === "autocomplete-root";
  const queryFor = (query: string) =>
    popupSearch ? query.replaceAll("combo-box-", "autocomplete-") : query;
  const own = <T extends HTMLElement>(query: string) =>
    [...root.querySelectorAll<T>(queryFor(query))].filter((n) => n.closest(selector) === root);
  const input = own<HTMLInputElement>('[data-slot="combo-box-input"]')[0],
    anchor = own<HTMLElement>('[data-slot="combo-box-input-group"]')[0],
    popup = own<HTMLElement>('[data-slot="combo-box-positioner"]')[0],
    trigger = own<HTMLButtonElement>('[data-slot="combo-box-trigger"]')[0],
    list = own<HTMLElement>('[data-slot="combo-box-list"]')[0];
  if (!input || !anchor || !popup || !trigger || !list) return;
  const attrs = new Map<Element, Map<string, string | null>>(),
    styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, key: string, value: string | null) => {
    let values = attrs.get(node);
    if (!values) attrs.set(node, (values = new Map()));
    if (!values.has(key)) values.set(key, node.getAttribute(key));
    if (node.getAttribute(key) === value) return;
    if (value === null) node.removeAttribute(key);
    else node.setAttribute(key, value);
  };
  const style = (node: HTMLElement, key: string, value: string) => {
    let values = styles.get(node);
    if (!values) styles.set(node, (values = new Map()));
    if (!values.has(key))
      values.set(key, [node.style.getPropertyValue(key), node.style.getPropertyPriority(key)]);
    if (node.style.getPropertyValue(key) !== value) node.style.setProperty(key, value);
  };
  const canonical = () => root.dataset["lensoValue"] ?? "";
  const blocked = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const multiple = () => root.dataset["lensoMultiple"] === "true";
  let disposed = false,
    closing = false,
    filtering = popupSearch,
    active: HTMLButtonElement | undefined,
    keyboard = false,
    configuration = "",
    epoch = 0;
  let stopTracking: (() => void) | undefined,
    form: HTMLFormElement | null = null;
  let composing = false,
    compositionDraft = "",
    compositionBefore = "",
    ignoreCompositionEnd = false,
    committedComposition: string | undefined,
    compositionTimer = 0;
  let restoreOnClose = true;
  let keyboardRemoval = false,
    pendingQuery: string | undefined,
    previousCanonical = canonical(),
    settleFrame = 0;
  const settle = (after?: () => void) => {
    view.cancelAnimationFrame(settleFrame);
    settleFrame = view.requestAnimationFrame(() => {
      settleFrame = view.requestAnimationFrame(() => {
        if (disposed) return;
        pendingQuery = undefined;
        paint();
        if (!blocked()) after?.();
      });
    });
  };
  const shown = () => !closing && popup.matches(":popover-open");
  const rows = () => own<HTMLButtonElement>('[data-slot="combo-box-item"]');
  const visible = () => rows().filter((n) => !n.hidden);
  const enabled = () => visible().filter((n) => !n.disabled);
  const chips = () => own<HTMLElement>('[data-slot="combo-box-chip"]');
  const emit = (slot: string) => {
    const node = own<HTMLInputElement>(`[data-slot="${slot}"]`)[0];
    if (node && !disposed) node.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const projectHighlight = () => {
    for (const row of rows()) {
      attr(row, "data-highlighted", shown() && row === active ? "" : null);
      attr(row, "data-keyboard-highlight", shown() && keyboard && row === active ? "" : null);
    }
    attr(
      input,
      "aria-activedescendant",
      shown() && active && !active.hidden && !active.disabled ? active.id : null,
    );
  };
  const highlight = (row?: HTMLButtonElement, scroll = true) => {
    active = row;
    projectHighlight();
    if (row && scroll && shown()) row.scrollIntoView({ block: "nearest" });
  };
  const position = async () => {
    if (disposed || !shown()) return;
    const current = ++epoch,
      side = popup.dataset["lensoSide"] ?? "bottom",
      align = popup.dataset["lensoAlign"] ?? "start",
      distance = Number(popup.dataset["lensoSideOffset"] ?? 4),
      padding = Number(popup.dataset["lensoCollisionPadding"] ?? 8);
    if (
      !["top", "bottom", "left", "right"].includes(side) ||
      !["start", "center", "end"].includes(align) ||
      !Number.isFinite(distance) ||
      !Number.isFinite(padding)
    )
      throw new RangeError(
        "ComboBox positioning requires a physical side, alignment and finite distances",
      );
    const result = await computePosition(anchor, popup, {
      strategy: "fixed",
      placement: `${side}${align === "center" ? "" : `-${align}`}` as Placement,
      middleware: [
        offset(distance),
        flip({ padding }),
        shift({ padding }),
        size({
          padding,
          apply({ availableWidth, availableHeight, rects }) {
            if (disposed || current !== epoch || !shown()) return;
            style(popup, "--available-width", `${Math.max(0, availableWidth)}px`);
            style(popup, "--available-height", `${Math.max(0, availableHeight)}px`);
            style(popup, "--anchor-width", `${rects.reference.width}px`);
          },
        }),
      ],
    });
    if (disposed || current !== epoch || !shown()) return;
    style(popup, "--lenso-exact-menu-x", `${result.x}px`);
    style(popup, "--lenso-exact-menu-y", `${result.y}px`);
    attr(popup, "data-side", result.placement.split("-")[0]!);
    attr(popup, "data-lenso-positioned", "");
  };
  let formatter = new Intl.NumberFormat(root.dataset["lensoLocale"] || "en-US");
  let filter = comboBoxFilter(
    root.dataset["lensoFilter"] ?? "",
    root.dataset["lensoLocale"] || "en-US",
  );
  const paint = () => {
    if (disposed) return;
    const config = JSON.stringify([
      root.dataset["lensoFilter"],
      root.dataset["lensoLocale"],
      multiple(),
    ]);
    if (config !== configuration) {
      configuration = config;
      formatter = new Intl.NumberFormat(root.dataset["lensoLocale"] || "en-US");
      filter = comboBoxFilter(
        root.dataset["lensoFilter"] ?? "",
        root.dataset["lensoLocale"] || "en-US",
      );
      active = undefined;
    }
    if (composing && (blocked() || canonical() !== compositionBefore)) {
      composing = false;
      ignoreCompositionEnd = true;
    }
    if (canonical() !== previousCanonical) {
      previousCanonical = canonical();
      pendingQuery = undefined;
    }
    const text = composing ? compositionDraft : (pendingQuery ?? canonical());
    if (input.value !== text) input.value = text;
    attr(input, "aria-autocomplete", "list");
    attr(input, "aria-readonly", root.dataset["lensoReadonly"] === "true" ? "true" : null);
    attr(input, "aria-expanded", String(shown()));
    attr(trigger, "aria-expanded", String(shown()));
    attr(trigger, "aria-controls", list.id);
    attr(list, "aria-multiselectable", String(multiple()));
    for (const icon of own<SVGElement & HTMLElement>('[data-slot="combo-box-indicator"]'))
      attr(icon, "data-popup-open", shown() ? "" : null);
    const options = rows();
    for (const row of options) {
      attr(
        row,
        "hidden",
        filtering && !filter(row.getAttribute("aria-label") ?? "", text) ? "" : null,
      );
      attr(row, "data-selected", row.getAttribute("aria-selected") === "true" ? "" : null);
      attr(row, "data-disabled", row.disabled ? "" : null);
    }
    const displayed = visible();
    for (const [i, row] of displayed.entries()) {
      attr(row, "aria-posinset", String(i + 1));
      attr(row, "aria-setsize", String(displayed.length));
    }
    for (const group of own<HTMLElement>('[data-slot="combo-box-group"]'))
      attr(
        group,
        "hidden",
        [...group.querySelectorAll<HTMLElement>(queryFor('[data-slot="combo-box-item"]'))].some(
          (n) => n.closest(selector) === root && !n.hidden,
        )
          ? null
          : "",
      );
    for (const separator of own<HTMLElement>('[data-slot="combo-box-separator"]')) {
      const siblings = [...(separator.parentElement?.children ?? [])],
        index = siblings.indexOf(separator);
      const populated = (node: Element) =>
        displayed.some((row) => node === row || node.contains(row));
      attr(
        separator,
        "hidden",
        siblings.slice(0, index).some(populated) && siblings.slice(index + 1).some(populated)
          ? null
          : "",
      );
    }
    for (const empty of own<HTMLElement>('[data-slot="combo-box-empty"]'))
      attr(empty, "hidden", displayed.length ? "" : null);
    for (const status of own<HTMLElement>('[data-slot="combo-box-status"]')) {
      const count = formatter.format(displayed.length);
      const text = shown() ? (status.dataset["lensoLabel"] ?? "").replaceAll("{count}", count) : "";
      if (status.textContent !== text) status.textContent = text;
    }
    for (const chip of chips()) {
      attr(chip, "aria-disabled", root.dataset["lensoDisabled"] === "true" ? "true" : null);
      attr(chip, "aria-readonly", root.dataset["lensoReadonly"] === "true" ? "true" : null);
    }
    if (active && !enabled().includes(active)) active = undefined;
    if (shown() && !active && root.dataset["lensoActivateOnFocus"] === "true")
      active = enabled()[0];
    projectHighlight();
    for (const [node, values] of attrs)
      if (!node.isConnected && !root.contains(node)) {
        for (const [key, value] of values) {
          if (value === null) node.removeAttribute(key);
          else node.setAttribute(key, value);
        }
        attrs.delete(node);
      }
    for (const node of own<HTMLInputElement>(
      '[data-slot="combo-box-form"],[data-slot="combo-box-validity"]',
    )) {
      attr(node, "name", node.dataset["lensoName"] || null);
      attr(node, "form", node.dataset["lensoForm"] || null);
      if (node.matches(queryFor('[data-slot="combo-box-validity"]'))) {
        attr(node, "required", node.dataset["lensoRequired"] === "true" ? "" : null);
        attr(node, "readonly", root.dataset["lensoReadonly"] === "true" ? "" : null);
      }
    }
    attr(
      input,
      "form",
      own<HTMLInputElement>('[data-slot="combo-box-validity"]')[0]?.dataset["lensoForm"] || null,
    );
    const nextForm = own<HTMLInputElement>('[data-slot="combo-box-validity"]')[0]?.form ?? null;
    if (form !== nextForm) {
      form?.removeEventListener("reset", reset);
      form = nextForm;
      form?.addEventListener("reset", reset);
    }
    if (blocked() && shown()) close(false);
    if (shown()) void position();
  };
  const before = (event: ToggleEvent) => {
    if (event.target !== popup) return;
    if (event.newState === "open" && blocked()) {
      event.preventDefault();
      return;
    }
    closing = event.newState === "closed";
    if (closing) {
      view.cancelAnimationFrame(settleFrame);
      pendingQuery = undefined;
      ++epoch;
      stopTracking?.();
      stopTracking = undefined;
      active = undefined;
      filtering = popupSearch;
      attr(popup, "data-lenso-positioned", null);
      if (restoreOnClose) emit("combo-box-restore");
    }
    attr(input, "aria-expanded", String(!closing));
    attr(trigger, "aria-expanded", String(!closing));
    projectHighlight();
  };
  const toggle = (event: Event) => {
    if (event.target !== popup || disposed) return;
    if (shown()) {
      stopTracking?.();
      stopTracking = autoUpdate(anchor, popup, () => void position());
    }
    paint();
  };
  const open = (edge = 0) => {
    if (disposed || blocked()) return;
    closing = false;
    if (popupSearch && !shown()) popup.showPopover();
    input.focus({ preventScroll: true });
    if (!shown()) popup.showPopover();
    paint();
    if (edge) {
      keyboard = true;
      highlight(
        edge < 0
          ? enabled().at(-1)
          : (enabled().find((n) => n.getAttribute("aria-selected") === "true") ?? enabled()[0]),
      );
    }
  };
  const close = (focus = false, restore = true) => {
    const previous = restoreOnClose;
    restoreOnClose = restore;
    if (popup.matches(":popover-open")) popup.hidePopover();
    restoreOnClose = previous;
    if (focus && !disposed && !input.disabled)
      (popupSearch ? trigger : input).focus({ preventScroll: true });
  };
  const owns = (target: EventTarget | null): target is Element =>
    target instanceof Element && target.closest(selector) === root;
  const onInput = (event: Event) => {
    if (event.target !== input) return;
    if (blocked()) {
      event.stopImmediatePropagation();
      paint();
      return;
    }
    if (composing || (event as InputEvent).isComposing) {
      compositionDraft = input.value;
      event.stopImmediatePropagation();
      return;
    }
    if (committedComposition !== undefined && committedComposition === input.value) {
      committedComposition = undefined;
      event.stopImmediatePropagation();
      return;
    }
    const proposed = input.value;
    pendingQuery = proposed;
    active = undefined;
    keyboard = false;
    filtering = true;
    settle(() => {
      if (!popupSearch && proposed === "" && canonical() === "") {
        if (!multiple()) emit("combo-box-input-clear");
        close(false, false);
      }
    });
    queueMicrotask(() => {
      if (disposed) return;
      open();
      paint();
    });
  };
  const startComposition = () => {
    if (blocked()) return;
    composing = true;
    ignoreCompositionEnd = false;
    compositionBefore = canonical();
    compositionDraft = input.value;
  };
  const endComposition = (event: CompositionEvent) => {
    if (ignoreCompositionEnd) {
      ignoreCompositionEnd = false;
      composing = false;
      paint();
      return;
    }
    if (!composing) return;
    composing = false;
    if (blocked()) {
      paint();
      return;
    }
    input.dispatchEvent(
      new view.InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        data: event.data,
      }),
    );
    committedComposition = input.value;
    view.clearTimeout(compositionTimer);
    compositionTimer = view.setTimeout(() => {
      committedComposition = undefined;
    }, 0);
  };
  const click = (event: MouseEvent) => {
    if (!owns(event.target)) return;
    const target = event.target;
    if (trigger.contains(target)) {
      event.preventDefault();
      filtering = popupSearch;
      active = undefined;
      if (shown()) close(true);
      else open(1);
      return;
    }
    const row = target.closest<HTMLButtonElement>(queryFor('[data-slot="combo-box-item"]'));
    if (row && !row.disabled && !row.hidden) {
      highlight(row, false);
      filtering = true;
      pendingQuery = popupSearch || multiple() ? "" : (row.getAttribute("aria-label") ?? "");
      paint();
      settle(() => {
        if (disposed) return;
        if (!multiple()) close(true);
        else {
          input.focus({ preventScroll: true });
          paint();
        }
      });
    } else if (
      target.closest(queryFor('[data-slot="combo-box-clear"],[data-slot="combo-box-search-clear"]'))
    ) {
      filtering = true;
      active = undefined;
      pendingQuery = "";
      if (
        !popupSearch ||
        shown() ||
        target.closest(queryFor('[data-slot="combo-box-search-clear"]'))
      )
        open();
      settle(() => {
        if (popupSearch && !shown()) trigger.focus({ preventScroll: true });
      });
    }
  };
  const guard = (event: MouseEvent) => {
    if (owns(event.target) && blocked() && event.target.closest("button")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (
      owns(event.target) &&
      event.target.closest(queryFor('[data-slot="combo-box-chip-remove"]')) &&
      !keyboardRemoval
    )
      queueMicrotask(() => {
        if (!disposed) (popupSearch && !shown() ? trigger : input).focus({ preventScroll: true });
      });
  };
  const pointerdown = (event: PointerEvent) => {
    if (
      event.pointerType === "mouse" &&
      owns(event.target) &&
      event.target.closest(
        queryFor(
          '[data-slot="combo-box-item"],[data-slot="combo-box-trigger"],[data-slot="combo-box-clear"]',
        ),
      )
    )
      event.preventDefault();
  };
  let lastPoint: { x: number; y: number } | undefined;
  const pointermove = (event: PointerEvent) => {
    if (!shown() || blocked() || event.pointerType === "touch" || !owns(event.target)) return;
    if (lastPoint?.x === event.clientX && lastPoint.y === event.clientY) return;
    lastPoint = { x: event.clientX, y: event.clientY };
    const row = event.target.closest<HTMLButtonElement>(queryFor('[data-slot="combo-box-item"]'));
    if (row && !row.disabled && !row.hidden) {
      keyboard = false;
      highlight(row, false);
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      composing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !owns(event.target) ||
      blocked()
    )
      return;
    const chip = event.target.closest<HTMLElement>(queryFor('[data-slot="combo-box-chip"]')),
      allChips = chips(),
      rtl = root.dataset["lensoDirection"] === "rtl";
    if (chip && event.target === chip) {
      const index = allChips.indexOf(chip);
      if (["Delete", "Backspace"].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        keyboardRemoval = true;
        chip
          .querySelector<HTMLButtonElement>(queryFor('[data-slot="combo-box-chip-remove"]'))
          ?.click();
        keyboardRemoval = false;
        queueMicrotask(() => {
          if (disposed) return;
          if (chip.isConnected) {
            chip.focus();
            return;
          }
          const next = chips()[Math.min(index, chips().length - 1)];
          (next ?? (popupSearch && !shown() ? trigger : input)).focus({ preventScroll: true });
        });
        return;
      }
      if (
        event.key === (rtl ? "ArrowRight" : "ArrowLeft") ||
        event.key === (rtl ? "ArrowLeft" : "ArrowRight")
      ) {
        event.preventDefault();
        const delta = event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? -1 : 1;
        (allChips[index + delta] ?? (popupSearch && !shown() ? trigger : input)).focus({
          preventScroll: true,
        });
        return;
      }
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        if (popupSearch || event.key.startsWith("Arrow")) open(event.key === "ArrowUp" ? -1 : 1);
        else input.focus();
        return;
      }
      if ([...event.key].length === 1) input.focus();
      return;
    }
    if (popupSearch && event.target === trigger) {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        open(event.key === "ArrowUp" ? -1 : 1);
      } else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft") && allChips.length) {
        event.preventDefault();
        allChips.at(-1)!.focus();
      }
      return;
    }
    if (event.target !== input) return;
    if (event.shiftKey) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const cursor = event.key === "Home" ? 0 : input.value.length;
      input.setSelectionRange(cursor, cursor);
      input.scrollLeft =
        event.key === "Home" ? 0 : (rtl ? -1 : 1) * (input.scrollWidth - input.clientWidth);
      return;
    }
    if (event.key === "Tab") {
      close(popupSearch);
      return;
    }
    if (event.key === "Escape" && shown()) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Backspace" && multiple() && input.value === "") {
      const last = allChips.at(-1);
      if (last) {
        event.preventDefault();
        last
          .querySelector<HTMLButtonElement>(queryFor('[data-slot="combo-box-chip-remove"]'))
          ?.click();
      }
      return;
    }
    if (
      event.key === (rtl ? "ArrowRight" : "ArrowLeft") &&
      input.selectionStart === 0 &&
      input.selectionEnd === 0 &&
      allChips.length
    ) {
      event.preventDefault();
      close(false);
      allChips.at(-1)!.focus();
      return;
    }
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!shown()) {
        filtering = popupSearch;
        open(event.key === "ArrowUp" ? -1 : 1);
        return;
      }
      const options = enabled(),
        index = options.indexOf(active!),
        delta =
          event.key === "ArrowDown"
            ? 1
            : event.key === "ArrowUp"
              ? -1
              : event.key === "PageDown"
                ? 10
                : -10;
      const next =
        root.dataset["lensoLoop"] === "true"
          ? (((index + delta) % options.length) + options.length) % options.length
          : Math.max(0, Math.min(options.length - 1, index + delta));
      keyboard = true;
      highlight(options[next]);
      return;
    }
    if (event.key === "Enter" && shown()) {
      event.preventDefault();
      event.stopPropagation();
      active?.click();
    }
  };
  const focusin = (event: FocusEvent) => {
    if (shown() && event.target instanceof Node && !root.contains(event.target)) close(false);
  };
  const invalid = (event: Event) => {
    if (event.target === own('[data-slot="combo-box-validity"]')[0]) {
      event.preventDefault();
      (popupSearch ? trigger : input).focus();
    }
  };
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      composing = false;
      ignoreCompositionEnd = true;
      close(false, false);
      emit("combo-box-reset");
      paint();
    });
  root.addEventListener("input", onInput, true);
  root.addEventListener("click", guard, true);
  // Exact handles the native press before a bubbling listener can observe it.
  root.addEventListener("click", click, true);
  root.addEventListener("pointerdown", pointerdown, true);
  root.addEventListener("pointermove", pointermove);
  root.addEventListener("keydown", keydown, true);
  root.addEventListener("invalid", invalid, true);
  doc.addEventListener("focusin", focusin);
  input.addEventListener("compositionstart", startComposition);
  input.addEventListener("compositionend", endComposition);
  popup.addEventListener("beforetoggle", before);
  popup.addEventListener("toggle", toggle);
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "aria-selected",
      "aria-invalid",
      "disabled",
      "data-lenso-value",
      "data-lenso-disabled",
      "data-lenso-readonly",
      "data-lenso-multiple",
      "data-lenso-filter",
      "data-lenso-locale",
      "data-lenso-activate-on-focus",
      "data-lenso-loop",
      "data-lenso-form",
      "data-lenso-name",
      "data-lenso-required",
      "data-lenso-side",
      "data-lenso-align",
      "data-lenso-side-offset",
      "data-lenso-collision-padding",
      "data-lenso-direction",
    ],
  });
  const end = () => {
    if (disposed) return;
    disposed = true;
    ++epoch;
    observer.disconnect();
    stopTracking?.();
    view.clearTimeout(compositionTimer);
    view.cancelAnimationFrame(settleFrame);
    form?.removeEventListener("reset", reset);
    root.removeEventListener("input", onInput, true);
    root.removeEventListener("click", guard, true);
    root.removeEventListener("click", click, true);
    root.removeEventListener("pointerdown", pointerdown, true);
    root.removeEventListener("pointermove", pointermove);
    root.removeEventListener("keydown", keydown, true);
    root.removeEventListener("invalid", invalid, true);
    doc.removeEventListener("focusin", focusin);
    input.removeEventListener("compositionstart", startComposition);
    input.removeEventListener("compositionend", endComposition);
    popup.removeEventListener("beforetoggle", before);
    popup.removeEventListener("toggle", toggle);
    if (popup.matches(":popover-open")) popup.hidePopover();
    input.value = canonical();
    for (const [node, values] of attrs)
      for (const [key, value] of values) {
        if (value === null) node.removeAttribute(key);
        else node.setAttribute(key, value);
      }
    for (const [node, values] of styles)
      for (const [key, [value, priority]] of values) {
        if (value) node.style.setProperty(key, value, priority);
        else node.style.removeProperty(key);
      }
    for (const status of own<HTMLElement>('[data-slot="combo-box-status"]'))
      status.textContent = "";
    controllers.delete(root);
  };
  paint();
  if (shown()) stopTracking = autoUpdate(anchor, popup, () => void position());
  return { sync: paint, end };
}
export function updateComboBox(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!controllers.has(root)) {
    const controller = createComboBox(root);
    if (controller) controllers.set(root, controller);
  }
  controllers.get(root)?.sync();
}
export function endComboBox(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (
    root &&
    (root === node ||
      [
        "combo-box-input",
        "combo-box-positioner",
        "autocomplete-input",
        "autocomplete-positioner",
      ].includes(node.dataset["lensoKind"] ?? ""))
  )
    controllers.get(root)?.end();
}
