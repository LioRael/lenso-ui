import { ownMenuPopup } from "./menu-parts.js";
import { menuModal } from "./menu-modal.js";
import { menuPointerFocus } from "./menu-pointer-focus.js";
import {
  submenuLayout,
  registerSubmenu,
  submenuOpenedByHover,
  updateSubmenuTrigger,
  endSubmenuTrigger,
} from "./menu-submenu.js";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
  type VirtualElement,
} from "@floating-ui/dom";
import { attachGlass } from "@lenso/glass";
import { modalOwner, popoverTabbables } from "./modal-focus.js";

interface MenuController {
  update(data: DOMStringMap): void;
  open(trigger: HTMLElement, last: boolean, focus?: boolean, reference?: VirtualElement): void;
  trigger(): HTMLElement | undefined;
  armPointer(): void;
  finishPreviewReturn(): void;
  end(): void;
}
const menus = new WeakMap<HTMLElement, MenuController>();
const triggers = new WeakMap<HTMLElement, () => void>();
const rowSelector = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
function createMenu(root: HTMLElement, initial: DOMStringMap): MenuController {
  const pointerFocus = menuPointerFocus(root);
  const modality = menuModal(root);
  let data = initial,
    opener: HTMLElement | undefined,
    reference: VirtualElement | undefined,
    edgeLast = false,
    focusPending = false,
    closing = false,
    disposed = false;
  let epoch = 0,
    frame = 0,
    returnTimer = 0,
    opticsTimer = 0,
    searchTimer = 0,
    search = "";
  let submenu: ReturnType<typeof registerSubmenu> | undefined;
  let stopTracking: (() => void) | undefined,
    stopOptics: (() => void) | undefined,
    lens: HTMLElement | undefined;
  const attributes = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let saved = attributes.get(node);
    if (!saved) attributes.set(node, (saved = new Map()));
    if (!saved.has(name)) saved.set(name, node.getAttribute(name));
    if (value === null) {
      if (node.hasAttribute(name)) node.removeAttribute(name);
    } else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  };
  const original = (node: Element, name: string) =>
    attributes.get(node)?.has(name) ? attributes.get(node)!.get(name)! : node.getAttribute(name);
  const style = (node: HTMLElement, name: string, value: string) => {
    let saved = styles.get(node);
    if (!saved) styles.set(node, (saved = new Map()));
    if (!saved.has(name))
      saved.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const popup = () => ownMenuPopup(root);
  const isOpen = () => !closing && root.matches(":popover-open");
  const contextBackdrop = () =>
    root.querySelector<HTMLElement>(':scope > [data-lenso-kind="context-menu-backdrop"]');
  const rows = () =>
    [...root.querySelectorAll<HTMLElement>(rowSelector)].filter(
      (node) =>
        node.closest('[role="menu"]') === root &&
        !node.closest('[data-slot="context-menu-preview"]'),
    );
  const live = () =>
    rows().filter(
      (node) =>
        !node.matches(':disabled,[aria-disabled="true"]') &&
        node.checkVisibility({ visibilityProperty: true }),
    );
  const markTriggers = (shown: boolean) => {
    for (const node of root.ownerDocument.querySelectorAll<HTMLElement>(
      'button[popovertarget],button[data-lenso-for],[data-slot="context-menu-trigger"][data-lenso-for]',
    ))
      if (
        (node.getAttribute("popovertarget") ?? node.dataset["lensoFor"]) === root.id &&
        (node.dataset["lensoKind"] === "menu-submenu-trigger" ||
          node.getAttribute("popovertargetaction") !== "hide")
      ) {
        attr(node, "aria-controls", root.id);
        attr(node, "aria-expanded", String(shown && node === opener));
        attr(node, "data-popup-open", shown && node === opener ? "" : null);
      }
  };
  const accessible = (shown: boolean) => {
    attr(root, "inert", shown ? original(root, "inert") : "");
    attr(root, "aria-hidden", shown ? original(root, "aria-hidden") : "true");
    for (const row of rows()) {
      attr(row, "data-disabled", row.matches(':disabled,[aria-disabled="true"]') ? "" : null);
      attr(row, "data-highlighted", shown && row === root.ownerDocument.activeElement ? "" : null);
    }
  };
  const queries = [
    matchMedia("(prefers-reduced-transparency: reduce)"),
    matchMedia("(forced-colors: active)"),
    matchMedia("(prefers-contrast: more)"),
  ];
  const detach = () => {
    clearTimeout(opticsTimer);
    stopOptics?.();
    stopOptics = undefined;
  };
  const preferences = () => {
    const content = popup(),
      surface = content?.querySelector<HTMLElement>(':scope > [data-slot="menu-surface"]');
    const next = surface?.querySelector<HTMLElement>(':scope > [data-slot="menu-lens"]');
    if (lens !== next) {
      detach();
      lens = next ?? undefined;
    }
    const opaque =
      queries.some((q) => q.matches) ||
      root.closest("[data-contrast]")?.getAttribute("data-contrast") === "increased";
    if (content) attr(content, "data-material-opaque", opaque ? "" : null);
    if (surface) attr(surface, "data-material-opaque", opaque ? "" : null);
    if (opaque) detach();
    else if (isOpen() && lens) {
      clearTimeout(opticsTimer);
      stopOptics ??= attachGlass(lens, {
        profileKey: "glass-medium",
        liveGeometry: true,
        liveBackdrop: true,
      });
    }
  };
  const position = async () => {
    const content = popup();
    if (disposed || !isOpen() || !opener?.isConnected || !content) return;
    const layout = submenuLayout(root, opener);
    const anchor =
      reference ??
      layout?.anchor ??
      opener.closest<HTMLElement>('[data-slot="menu-bar"]') ??
      opener;
    const current = ++epoch;
    attr(root, "data-lenso-position-pending", "");
    let side = data["lensoSide"] ?? "bottom";
    if (side === "inline-start") side = data["lensoDirection"] === "rtl" ? "right" : "left";
    if (side === "inline-end") side = data["lensoDirection"] === "rtl" ? "left" : "right";
    if (layout?.stacked) side = "bottom";
    const align = layout?.stacked ? "start" : (data["lensoAlign"] ?? "end"),
      padding = Math.max(0, Number(data["lensoCollisionPadding"] ?? 8)),
      avoid = data["lensoCollisionAvoidance"] !== "false";
    const finite = (key: string, fallback: number) => {
      const n = Number(data[key] ?? fallback);
      return Number.isFinite(n) ? n : fallback;
    };
    const result = await computePosition(anchor, root, {
      placement: `${side}${align === "center" ? "" : `-${align}`}` as Placement,
      strategy: "fixed",
      middleware: [
        offset(({ rects }) => ({
          mainAxis: layout?.stacked
            ? -Math.min(rects.reference.height * 0.62, rects.floating.height + 8)
            : finite("lensoSideOffset", 8),
          crossAxis: layout?.stacked ? 0 : finite("lensoAlignOffset", 0),
        })),
        avoid && flip({ padding }),
        avoid && shift({ padding }),
        size({
          padding,
          apply({ availableWidth, availableHeight, rects }) {
            if (disposed || current !== epoch || !isOpen()) return;
            style(root, "--available-width", `${Math.max(0, availableWidth)}px`);
            style(root, "--available-height", `${Math.max(0, availableHeight)}px`);
            style(root, "--anchor-width", `${rects.reference.width}px`);
            style(root, "--anchor-height", `${rects.reference.height}px`);
          },
        }),
      ],
    });
    if (disposed || current !== epoch || !isOpen()) return;
    style(root, "--lenso-exact-menu-x", `${result.x}px`);
    style(root, "--lenso-exact-menu-y", `${result.y}px`);
    attr(root, "data-lenso-positioned", "");
    attr(root, "data-lenso-position-pending", null);
    modality.sync(true, opener);
    const resolved = result.placement.split("-")[0]!;
    attr(content, "data-side", resolved);
    attr(content, "data-align", result.placement.slice(resolved.length + 1) || "center");
    style(
      root,
      "--transform-origin",
      resolved === "top"
        ? "50% 100%"
        : resolved === "bottom"
          ? "50% 0%"
          : resolved === "left"
            ? "100% 50%"
            : "0% 50%",
    );
    if (focusPending) {
      focusPending = false;
      const active = root.ownerDocument.activeElement;
      if (
        active === opener ||
        active === root.ownerDocument.body ||
        active === root ||
        (active instanceof HTMLElement &&
          root.contains(active) &&
          !active.checkVisibility({ visibilityProperty: true }))
      ) {
        ((edgeLast ? live().at(-1) : live()[0]) ?? root).focus({ preventScroll: true });
      }
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!disposed && isOpen()) {
          attr(content, "data-starting-style", null);
          const backdrop = contextBackdrop();
          if (backdrop) attr(backdrop, "data-starting-style", null);
        }
        frame = 0;
      });
    });
  };
  const track = () => {
    stopTracking?.();
    stopTracking = undefined;
    if (!isOpen() || !opener?.isConnected) return;
    if (data["lensoDisableAnchorTracking"] === "true") void position();
    else
      stopTracking = autoUpdate(
        reference ??
          submenuLayout(root, opener)?.anchor ??
          opener.closest<HTMLElement>('[data-slot="menu-bar"]') ??
          opener,
        root,
        () => void position(),
      );
  };
  const transition = (opening: boolean, source?: Element | null) => {
    cancelAnimationFrame(frame);
    clearTimeout(returnTimer);
    ++epoch;
    closing = !opening;
    const content = popup();
    if (!closing) {
      const active = root.ownerDocument.activeElement;
      if (source instanceof HTMLElement) opener = source;
      else if (active instanceof HTMLElement && active.getAttribute("popovertarget") === root.id)
        opener = active;
      if (!opener?.isConnected)
        opener = [
          ...root.ownerDocument.querySelectorAll<HTMLButtonElement>("button[popovertarget]"),
        ].find(
          (n) =>
            n.getAttribute("popovertarget") === root.id &&
            n.getAttribute("popovertargetaction") !== "hide" &&
            !n.disabled,
        );
      focusPending = !submenuOpenedByHover(root) || submenuLayout(root, opener)?.stacked === true;
      modality.sync(true, opener);
      submenu?.sync(true, opener);
      accessible(true);
      markTriggers(true);
      if (content) {
        attr(content, "data-open", "");
        attr(content, "data-ending-style", null);
        attr(content, "data-starting-style", "");
      }
      const backdrop = contextBackdrop();
      if (backdrop) {
        attr(backdrop, "data-starting-style", "");
        attr(backdrop, "data-ending-style", null);
      }
      root.ownerDocument.addEventListener("focusin", focusIn);
      root.ownerDocument.addEventListener("keydown", keydown);
      preferences();
    } else {
      reference = undefined;
      modality.sync(false, opener);
      pointerFocus.clear();
      const parentForFocus = root.parentElement?.closest<HTMLElement>('[popover][role="menu"]');
      if (parentForFocus?.matches(":popover-open")) menus.get(parentForFocus)?.armPointer();
      const active = root.ownerDocument.activeElement,
        restore = root.contains(active) || active === root.ownerDocument.body;
      submenu?.sync(false, opener);
      const target = opener,
        closedAt = epoch;
      const parentMenu = root.parentElement?.closest<HTMLElement>('[popover][role="menu"]');
      let ancestorReturnTarget: HTMLElement | undefined;
      for (
        let parent = root.parentElement?.closest<HTMLElement>('[popover][role="menu"]');
        parent;
        parent = parent.parentElement?.closest<HTMLElement>('[popover][role="menu"]')
      )
        ancestorReturnTarget = menus.get(parent)?.trigger() ?? ancestorReturnTarget;
      accessible(false);
      markTriggers(false);
      focusPending = false;
      edgeLast = false;
      search = "";
      clearTimeout(searchTimer);
      stopTracking?.();
      stopTracking = undefined;
      attr(root, "data-lenso-position-pending", null);
      if (content) {
        attr(content, "data-open", null);
        attr(content, "data-starting-style", null);
        attr(content, "data-ending-style", "");
      }
      const backdrop = contextBackdrop();
      if (backdrop) {
        attr(backdrop, "data-starting-style", null);
        attr(backdrop, "data-ending-style", "");
      }
      root.ownerDocument.removeEventListener("focusin", focusIn);
      root.ownerDocument.removeEventListener("keydown", keydown);
      returnTimer = window.setTimeout(() => {
        const at = root.ownerDocument.activeElement;
        if (
          !disposed &&
          closedAt === epoch &&
          !isOpen() &&
          restore &&
          target?.isConnected &&
          (at === root.ownerDocument.body ||
            at === ancestorReturnTarget ||
            root.contains(at) ||
            (parentMenu?.matches(":popover-open") &&
              at instanceof Element &&
              at.closest('[popover][role="menu"]') === parentMenu))
        )
          target.focus({ preventScroll: true });
      });
      clearTimeout(opticsTimer);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) detach();
      else
        opticsTimer = window.setTimeout(
          detach,
          root.hasAttribute("data-context-preview-retain") ? 2000 : 160,
        );
    }
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target === root)
      transition(
        event.newState === "open",
        (event as ToggleEvent & { source?: Element | null }).source,
      );
  };
  const dialogToggle = (event: Event) => {
    // WebKit can dismiss a popover for showModal without firing its own toggle events.
    if (
      event.target instanceof HTMLDialogElement &&
      opener &&
      !closing &&
      !root.matches(":popover-open")
    )
      transition(false);
  };
  const toggle = (event: Event) => {
    if (event.target === root && isOpen()) {
      preferences();
      track();
    }
  };
  const focusIn = (event: FocusEvent) => {
    if (!isOpen() || !(event.target instanceof Element)) return;
    if (root.contains(event.target)) {
      accessible(true);
      return;
    }
    if (submenuOpenedByHover(root)) return;
    if (opener?.contains(event.target)) {
      accessible(true);
      return;
    }
    root.hidePopover();
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      !isOpen() ||
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const target = event.target;
    if (
      !(target instanceof Element) ||
      !root.contains(target) ||
      target.closest('[role="menu"]') !== root
    )
      return;
    const back = data["lensoDirection"] === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (data["lensoSubmenu"] === "true" && event.key === back) {
      event.preventDefault();
      root.hidePopover();
      return;
    }
    if (event.key === "Tab") {
      let top = root;
      for (
        let parent = top.parentElement?.closest<HTMLElement>('[popover][role="menu"]');
        parent;
        parent = top.parentElement?.closest<HTMLElement>('[popover][role="menu"]')
      )
        top = parent;
      const invoker = menus.get(top)?.trigger() ?? opener;
      const outside = popoverTabbables(modalOwner(top) ?? root.ownerDocument.body).filter(
        (n) => !top.contains(n),
      );
      const index = invoker ? outside.indexOf(invoker) : -1;
      event.preventDefault();
      const next =
        outside[index + (event.shiftKey ? -1 : 1)] ??
        outside[event.shiftKey ? outside.length - 1 : 0];
      next?.focus();
      if (top.matches(":popover-open")) top.hidePopover();
      return;
    }
    if (event.key === " " || [...event.key].length !== 1) return;
    const items = live();
    if (!items.length) return;
    event.preventDefault();
    clearTimeout(searchTimer);
    const key = event.key.toLocaleLowerCase();
    search += key;
    const repeated = [...search].every((c) => c === key),
      term = repeated ? key : search;
    const from = items.indexOf(root.ownerDocument.activeElement as HTMLElement),
      start = term.length === 1 ? from + 1 : Math.max(0, from);
    const matches = [...items.slice(start), ...items.slice(0, start)];
    const match = matches.find((n) =>
      (
        n.getAttribute("aria-label") ||
        n.querySelector('[data-slot="menu-item-label"]')?.textContent ||
        n.textContent ||
        ""
      )
        .trim()
        .toLocaleLowerCase()
        .startsWith(term),
    );
    match?.focus();
    searchTimer = window.setTimeout(() => {
      search = "";
    }, 500);
  };
  const click = (event: MouseEvent) => {
    const row =
      event.target instanceof Element ? event.target.closest<HTMLElement>(rowSelector) : null;
    if (!row || row.closest('[role="menu"]') !== root) return;
    if (row.matches(':disabled,[aria-disabled="true"]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (row.dataset["lensoCloseOnClick"] !== "false") {
      let top = root;
      for (
        let parent = top.parentElement?.closest<HTMLElement>('[popover][role="menu"]');
        parent;
        parent = top.parentElement?.closest<HTMLElement>('[popover][role="menu"]')
      )
        top = parent;
      if (top !== root && top.matches(":popover-open")) top.hidePopover();
    }
    if (
      row.dataset["lensoCloseOnClick"] !== "false" &&
      !row.hasAttribute("popovertarget") &&
      isOpen()
    )
      root.hidePopover();
  };
  const observer = new MutationObserver(() => {
    accessible(isOpen());
    preferences();
    markTriggers(isOpen());
    if (isOpen()) void position();
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-contrast", "disabled", "aria-disabled", "data-lenso-disabled"],
  });
  for (let node: HTMLElement | null = root.parentElement; node; node = node.parentElement)
    observer.observe(node, { attributes: true, attributeFilter: ["data-contrast"] });
  for (const query of queries) query.addEventListener("change", preferences);
  root.ownerDocument.addEventListener("toggle", dialogToggle, true);
  root.addEventListener("beforetoggle", beforeToggle);
  root.addEventListener("toggle", toggle);
  root.addEventListener("click", click, true);
  accessible(isOpen());
  preferences();
  const controller: MenuController = {
    trigger: () => opener,
    armPointer: () => pointerFocus.arm(),
    finishPreviewReturn() {
      if (!isOpen()) detach();
    },
    update(next) {
      data = next;
      submenu?.sync(isOpen(), opener);
      modality.sync(isOpen(), opener);
      style(root, "direction", data["lensoDirection"] ?? "ltr");
      accessible(isOpen());
      markTriggers(isOpen());
      preferences();
      if (isOpen()) track();
    },
    open(trigger, last, focus = true, anchor) {
      reference = anchor;
      if (trigger.dataset["lensoKind"] === "menu-submenu-trigger")
        trigger.setAttribute("popovertargetaction", "show");
      if (focus) {
        submenu?.press();
        pointerFocus.arm();
      }
      opener = trigger;
      edgeLast = last;
      if (!root.matches(":popover-open")) root.showPopover({ source: trigger });
      else {
        markTriggers(true);
        modality.sync(true, opener);
        root.dispatchEvent(new Event("lenso-menu-source-change"));
        focusPending = focus;
        track();
      }
    },
    end() {
      if (disposed) return;
      submenu?.end();
      pointerFocus.end();
      modality.end();
      disposed = true;
      ++epoch;
      cancelAnimationFrame(frame);
      clearTimeout(returnTimer);
      clearTimeout(searchTimer);
      detach();
      stopTracking?.();
      observer.disconnect();
      for (const query of queries) query.removeEventListener("change", preferences);
      root.ownerDocument.removeEventListener("toggle", dialogToggle, true);
      root.removeEventListener("beforetoggle", beforeToggle);
      root.removeEventListener("toggle", toggle);
      root.removeEventListener("click", click, true);
      root.ownerDocument.removeEventListener("focusin", focusIn);
      root.ownerDocument.removeEventListener("keydown", keydown);
      for (const [node, saved] of attributes)
        for (const [name, value] of saved)
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
      for (const [node, saved] of styles)
        for (const [name, [value, priority]] of saved)
          if (value) node.style.setProperty(name, value, priority);
          else node.style.removeProperty(name);
    },
  };
  if (initial["lensoSubmenu"] === "true")
    submenu = registerSubmenu(root, {
      open(trigger, focus) {
        controller.open(trigger, false, focus);
      },
      refresh() {
        const active = root.ownerDocument.activeElement;
        if (
          isOpen() &&
          ((active instanceof HTMLElement &&
            root.contains(active) &&
            !active.checkVisibility({ visibilityProperty: true })) ||
            (submenuLayout(root, opener)?.stacked && active === root.ownerDocument.body))
        ) {
          focusPending = true;
        }
        track();
      },
    });
  return controller;
}
export function updateMenu(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "menu-positioner") {
    let owner = menus.get(node);
    if (!owner) {
      owner = createMenu(node, data);
      menus.set(node, owner);
    }
    owner.update(data);
  } else if (menus.has(node)) {
    menus.get(node)!.end();
    menus.delete(node);
  }
  updateSubmenuTrigger(node, data);
  if (
    ["menu-trigger", "menu-expand-trigger", "menu-submenu-trigger"].includes(
      data["lensoKind"] ?? "",
    ) &&
    !triggers.has(node)
  ) {
    const keydown = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !node.matches(":disabled") &&
        ["Enter", " "].includes(event.key)
      ) {
        const root = node.ownerDocument.getElementById(
          node.getAttribute("popovertarget") ?? node.dataset["lensoFor"] ?? "",
        );
        if (root) menus.get(root)?.armPointer();
        return;
      }
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        node.matches(":disabled") ||
        !(
          data["lensoKind"] === "menu-submenu-trigger"
            ? [getComputedStyle(node).direction === "rtl" ? "ArrowLeft" : "ArrowRight"]
            : ["ArrowUp", "ArrowDown"]
        ).includes(event.key)
      )
        return;
      const root = node.ownerDocument.getElementById(
        node.getAttribute("popovertarget") ?? node.dataset["lensoFor"] ?? "",
      );
      if (!root) return;
      if (data["lensoKind"] !== "menu-submenu-trigger" && root.matches(":popover-open")) return;
      event.preventDefault();
      menus.get(root)?.open(node, event.key === "ArrowUp");
    };
    node.addEventListener("keydown", keydown);
    triggers.set(node, () => node.removeEventListener("keydown", keydown));
  } else if (
    !["menu-trigger", "menu-expand-trigger", "menu-submenu-trigger"].includes(
      data["lensoKind"] ?? "",
    )
  ) {
    triggers.get(node)?.();
    triggers.delete(node);
  }
}
export function endMenu(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  endSubmenuTrigger(node);
  triggers.get(node)?.();
  triggers.delete(node);
  menus.get(node)?.end();
  menus.delete(node);
}

/** Open the existing native Menu at a context point without a second popup owner. */
export function openContextMenu(
  root: HTMLElement,
  trigger: HTMLElement,
  point: { x: number; y: number; touch: boolean },
) {
  const owner = menus.get(root);
  if (!owner) return false;
  trigger.focus({ preventScroll: true });
  owner.open(trigger, false, true, {
    contextElement: trigger,
    getBoundingClientRect: () =>
      new DOMRect(point.x, point.y, point.touch ? 10 : 0, point.touch ? 10 : 0),
  });
  return root.matches(":popover-open");
}

export function closeContextMenu(root: HTMLElement, trigger: HTMLElement) {
  if (menus.get(root)?.trigger() === trigger && root.matches(":popover-open")) root.hidePopover();
}

export function menuSource(root: HTMLElement) {
  return menus.get(root)?.trigger();
}
export function finishMenuPreviewReturn(root: HTMLElement) {
  menus.get(root)?.finishPreviewReturn();
}
