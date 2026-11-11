import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from "@floating-ui/dom";
import { attachGlass } from "@lenso/glass";
import { modalOwner, popoverTabbables } from "./modal-focus.js";

const rootSelector = '[data-slot="select-root"]';
const controllers = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function createSelect(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(selector: string) =>
    [...root.querySelectorAll<T>(selector)].filter((node) => node.closest(rootSelector) === root);
  const trigger = own<HTMLButtonElement>('[data-slot="select-trigger"]')[0];
  const popup = own<HTMLElement>('[data-slot="select-positioner"]')[0];
  if (!trigger || !popup) return;
  const attrs = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let old = attrs.get(node);
    if (!old) attrs.set(node, (old = new Map()));
    if (!old.has(name)) old.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let old = styles.get(node);
    if (!old) styles.set(node, (old = new Map()));
    if (!old.has(name))
      old.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const blocked = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const multiple = () => root.dataset["lensoMultiple"] === "true";
  const open = () => popup.matches(":popover-open");
  const rows = () => own<HTMLButtonElement>('[data-slot="select-item"]');
  const live = () => rows().filter((n) => !n.disabled && n.dataset["lensoDisabled"] !== "true");
  let disposed = false,
    epoch = 0,
    focusFrame = 0,
    searchTimer = 0,
    search = "";
  let returning = false,
    initialEdge = 0,
    focusOnOpen = true;
  let active: HTMLButtonElement | undefined,
    stopTracking: (() => void) | undefined,
    stopOptics: (() => void) | undefined;
  let form: HTMLFormElement | null = null,
    point: { x: number; y: number } | undefined;
  const highlight = (node?: HTMLButtonElement, focus = true) => {
    active = node;
    for (const row of rows()) {
      attr(row, "data-highlighted", open() && row === node ? "" : null);
      attr(row, "tabindex", open() && row === node ? "0" : "-1");
    }
    if (node && focus && open()) {
      node.focus({ preventScroll: true });
      node.scrollIntoView({ block: "nearest" });
    }
  };
  const position = async () => {
    if (disposed || !open() || !trigger.isConnected) return;
    const current = ++epoch,
      data = popup.dataset;
    const side = data["lensoSide"] ?? "bottom",
      align = data["lensoAlign"] ?? "start";
    if (
      !["top", "bottom", "left", "right"].includes(side) ||
      !["start", "center", "end"].includes(align)
    )
      throw new RangeError("Select requires a physical side and start/center/end alignment");
    const distance = Number(data["lensoSideOffset"] ?? 4),
      padding = Number(data["lensoCollisionPadding"] ?? 8);
    if (!Number.isFinite(distance) || !Number.isFinite(padding))
      throw new RangeError("Select positioning distances must be finite");
    const result = await computePosition(trigger, popup, {
      placement: `${side}${align === "center" ? "" : `-${align}`}` as Placement,
      strategy: "fixed",
      middleware: [
        offset(distance),
        flip({ padding }),
        shift({ padding }),
        size({
          padding,
          apply({ availableWidth, availableHeight, rects }) {
            if (disposed || current !== epoch || !open()) return;
            style(popup, "--available-width", `${Math.max(0, availableWidth)}px`);
            style(popup, "--available-height", `${Math.max(0, availableHeight)}px`);
            style(popup, "--anchor-width", `${rects.reference.width}px`);
          },
        }),
      ],
    });
    if (disposed || current !== epoch || !open()) return;
    style(popup, "--lenso-exact-menu-x", `${result.x}px`);
    style(popup, "--lenso-exact-menu-y", `${result.y}px`);
    attr(popup, "data-lenso-positioned", "");
    attr(popup, "data-side", result.placement.split("-")[0]!);
  };
  const optics = () => {
    stopOptics?.();
    stopOptics = undefined;
    const surface = own<HTMLElement>('[data-slot="select-popover"]')[0];
    const lens = own<HTMLElement>('[data-slot="select-lens"]')[0];
    const opaque =
      view.matchMedia("(prefers-reduced-transparency: reduce)").matches ||
      view.matchMedia("(forced-colors: active)").matches;
    if (surface) attr(surface, "data-material-opaque", opaque ? "" : null);
    if (open() && lens && !opaque)
      stopOptics = attachGlass(lens, {
        profileKey: "glass-medium",
        liveGeometry: true,
        liveBackdrop: true,
      });
  };
  const state = (shown: boolean) => {
    clearTimeout(searchTimer);
    search = "";
    attr(trigger, "aria-expanded", String(shown));
    attr(trigger, "data-popup-open", shown ? "" : null);
    if (shown) {
      returning = false;
      const options = live(),
        selected = options.find((n) => n.getAttribute("aria-selected") === "true");
      active = selected ?? (initialEdge < 0 ? options.at(-1) : options[0]);
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (disposed || !open()) return;
        highlight(active, focusOnOpen);
        if (!active && focusOnOpen) own<HTMLElement>('[data-slot="select-list"]')[0]?.focus();
      });
    } else {
      ++epoch;
      cancelAnimationFrame(focusFrame);
      stopTracking?.();
      stopTracking = undefined;
      stopOptics?.();
      stopOptics = undefined;
      highlight(undefined, false);
      const current = doc.activeElement;
      if (returning || popup.contains(current)) trigger.focus({ preventScroll: true });
      returning = false;
    }
  };
  const close = (restore = false) => {
    returning = restore;
    if (open()) popup.hidePopover();
  };
  const before = (event: ToggleEvent) => {
    if (event.target !== popup) return;
    if (event.newState === "open" && blocked()) {
      event.preventDefault();
      return;
    }
    state(event.newState === "open");
  };
  const toggle = (event: Event) => {
    if (event.target !== popup || !open()) return;
    optics();
    stopTracking?.();
    stopTracking = autoUpdate(trigger, popup, () => void position());
  };
  const choose = (row: HTMLButtonElement) => {
    if (!blocked() && !row.disabled) row.click();
  };
  const find = (key: string, selection = false) => {
    clearTimeout(searchTimer);
    const letter = key.toLocaleLowerCase();
    search += letter;
    const term = [...search].every((c) => c === letter) ? letter : search;
    const options = live();
    const current = selection
      ? options.find((n) => n.getAttribute("aria-selected") === "true")
      : active;
    const index = options.indexOf(current!),
      start = term.length === 1 ? index + 1 : Math.max(0, index);
    const match = [...options.slice(start), ...options.slice(0, start)].find((n) =>
      (n.getAttribute("aria-label") ?? n.textContent ?? "")
        .trim()
        .toLocaleLowerCase()
        .startsWith(term),
    );
    if (match) {
      if (selection) choose(match);
      else highlight(match);
    }
    searchTimer = view.setTimeout(() => {
      search = "";
    }, 500);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest(rootSelector) !== root) return;
    if (blocked()) return;
    if (target === trigger && !open()) {
      if (
        ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key) &&
        !(event.key === " " && search)
      ) {
        event.preventDefault();
        initialEdge = event.key === "ArrowUp" ? -1 : 1;
        focusOnOpen = true;
        popup.showPopover();
      } else if (!multiple() && !event.altKey && [...event.key].length === 1) {
        event.preventDefault();
        find(event.key, true);
      }
      return;
    }
    if (!open()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      const nodes = popoverTabbables(modalOwner(root) ?? doc.body).filter(
        (n) => !popup.contains(n),
      );
      const index = nodes.indexOf(trigger);
      event.preventDefault();
      close(false);
      (
        nodes[index + (event.shiftKey ? -1 : 1)] ?? nodes[event.shiftKey ? nodes.length - 1 : 0]
      )?.focus();
      return;
    }
    if (event.altKey) return;
    const options = live(),
      index = options.indexOf(active!);
    if (["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key)) {
      event.preventDefault();
      let next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : index +
              (event.key === "ArrowDown"
                ? 1
                : event.key === "ArrowUp"
                  ? -1
                  : event.key === "PageDown"
                    ? 10
                    : -10);
      next = Math.max(0, Math.min(options.length - 1, next));
      highlight(options[next]);
    } else if (event.key === "Enter" || (event.key === " " && !search)) {
      event.preventDefault();
      if (active) choose(active);
    } else if ([...event.key].length === 1) {
      event.preventDefault();
      find(event.key);
    }
  };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element) || event.target.closest(rootSelector) !== root) return;
    const row = event.target.closest<HTMLButtonElement>('[data-slot="select-item"]');
    if (blocked() && (row || trigger.contains(event.target))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (row && !row.disabled) {
      highlight(row, false);
      if (!multiple())
        queueMicrotask(() => {
          if (!disposed) close(true);
        });
    } else if (trigger.contains(event.target)) {
      initialEdge = 0;
      focusOnOpen = true;
    }
  };
  const pointer = (event: PointerEvent) => {
    if (!open() || event.pointerType === "touch" || blocked()) return;
    const moved = !point || point.x !== event.clientX || point.y !== event.clientY;
    point = { x: event.clientX, y: event.clientY };
    if (!moved || !(event.target instanceof Element)) return;
    const row = event.target.closest<HTMLButtonElement>('[data-slot="select-item"]');
    if (row && row.closest(rootSelector) === root && !row.disabled) highlight(row);
  };
  const focus = (event: FocusEvent) => {
    if (!open() || !(event.target instanceof Element)) return;
    const row = event.target.closest<HTMLButtonElement>('[data-slot="select-item"]');
    if (row && row.closest(rootSelector) === root && !row.disabled) highlight(row, false);
    else if (!popup.contains(event.target) && !trigger.contains(event.target)) close();
  };
  const invalid = (event: Event) => {
    if (event.target === own('[data-slot="select-validity"]')[0]) {
      event.preventDefault();
      trigger.focus();
    }
  };
  const reset = (event: Event) => {
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      const input = own<HTMLInputElement>('[data-slot="select-reset"]')[0];
      input?.dispatchEvent(new view.Event("input", { bubbles: true }));
      close();
    });
  };
  const sync = () => {
    if (disposed) return;
    if (!trigger.isConnected || !popup.isConnected) {
      end();
      return;
    }
    if (blocked()) close();
    attr(trigger, "aria-readonly", root.dataset["lensoReadonly"] === "true" ? "true" : null);
    for (const list of own<HTMLElement>('[data-slot="select-list"]'))
      attr(list, "aria-multiselectable", String(multiple()));
    for (const row of rows()) {
      attr(row, "data-selected", row.getAttribute("aria-selected") === "true" ? "" : null);
      attr(row, "data-disabled", row.disabled ? "" : null);
    }
    attr(trigger, "data-disabled", root.dataset["lensoDisabled"] === "true" ? "" : null);
    attr(trigger, "data-invalid", trigger.getAttribute("aria-invalid") === "true" ? "" : null);
    for (const input of own<HTMLInputElement>(
      '[data-slot="select-form"],[data-slot="select-validity"]',
    )) {
      if (input.dataset["lensoName"]) attr(input, "name", input.dataset["lensoName"]!);
      else attr(input, "name", null);
      attr(input, "form", input.dataset["lensoForm"] || null);
      if (input.dataset["slot"] === "select-validity") {
        attr(input, "required", input.dataset["lensoRequired"] === "true" ? "" : null);
        attr(input, "readonly", root.dataset["lensoReadonly"] === "true" ? "" : null);
      }
    }
    const nextForm = own<HTMLInputElement>('[data-slot="select-validity"]')[0]?.form ?? null;
    if (nextForm !== form) {
      form?.removeEventListener("reset", reset);
      form = nextForm;
      form?.addEventListener("reset", reset);
    }
    if (open()) {
      if (!active?.isConnected || active.disabled) highlight(live()[0]);
      else highlight(active, false);
      void position();
    }
  };
  const observer = new MutationObserver(() => sync());
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-disabled",
      "data-lenso-readonly",
      "data-lenso-variant",
      "data-lenso-multiple",
      "data-lenso-full-width",
      "data-lenso-required",
      "data-lenso-form",
      "data-lenso-name",
      "data-lenso-side",
      "data-lenso-align",
      "data-lenso-side-offset",
      "data-lenso-collision-padding",
      "aria-selected",
      "aria-invalid",
      "disabled",
      "value",
    ],
  });
  const contrast = view.matchMedia("(forced-colors: active)"),
    transparency = view.matchMedia("(prefers-reduced-transparency: reduce)");
  popup.addEventListener("beforetoggle", before);
  popup.addEventListener("toggle", toggle);
  root.addEventListener("keydown", keydown);
  root.addEventListener("click", click, true);
  root.addEventListener("pointermove", pointer);
  root.addEventListener("invalid", invalid, true);
  doc.addEventListener("focusin", focus);
  contrast.addEventListener("change", optics);
  transparency.addEventListener("change", optics);
  const end = () => {
    if (disposed) return;
    disposed = true;
    ++epoch;
    observer.disconnect();
    cancelAnimationFrame(focusFrame);
    clearTimeout(searchTimer);
    stopTracking?.();
    stopOptics?.();
    form?.removeEventListener("reset", reset);
    popup.removeEventListener("beforetoggle", before);
    popup.removeEventListener("toggle", toggle);
    root.removeEventListener("keydown", keydown);
    root.removeEventListener("click", click, true);
    root.removeEventListener("pointermove", pointer);
    root.removeEventListener("invalid", invalid, true);
    doc.removeEventListener("focusin", focus);
    contrast.removeEventListener("change", optics);
    transparency.removeEventListener("change", optics);
    if (open()) popup.hidePopover();
    for (const [node, values] of attrs)
      for (const [name, value] of values) {
        if (value === null) node.removeAttribute(name);
        else node.setAttribute(name, value);
      }
    for (const [node, values] of styles)
      for (const [name, [value, priority]] of values) {
        if (value) node.style.setProperty(name, value, priority);
        else node.style.removeProperty(name);
      }
    controllers.delete(root);
  };
  sync();
  if (open()) {
    state(true);
    optics();
    stopTracking = autoUpdate(trigger, popup, () => void position());
  }
  return { sync, end };
}
export function updateSelect(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  const root = data["lensoKind"] === "select-root" ? node : node.closest<HTMLElement>(rootSelector);
  if (!root) return;
  if (!controllers.has(root)) {
    const controller = createSelect(root);
    if (controller) controllers.set(root, controller);
  }
  controllers.get(root)?.sync();
}
export function endSelect(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(rootSelector) ? node : node.closest<HTMLElement>(rootSelector);
  if (
    root &&
    (root === node ||
      ["select-trigger", "select-positioner"].includes(node.dataset["lensoKind"] ?? ""))
  )
    controllers.get(root)?.end();
}
