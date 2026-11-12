import { ownMenuPopup } from "./menu-parts.js";
import { isMenuPointerFocusGuarded } from "./menu-pointer-focus.js";
/**
 * Native adaptation of Base UI 1.9.0 submenu hover and Lenso submenu parent poses.
 * Copyright (c) 2019 Material-UI SAS.
 * Copyright (c) 2021-present Floating UI contributors. MIT License; see NOTICES.md.
 */
import { createHoverCorridor } from "./popover-hover-corridor.js";

export function submenuLayout(root: HTMLElement, trigger: HTMLElement | undefined) {
  if (root.dataset["lensoSubmenu"] !== "true" || !trigger) return;
  const parent = trigger.closest<HTMLElement>('[popover][role="menu"]');
  const popup = parent ? ownMenuPopup(parent) : undefined;
  if (!parent || !popup || parent === root) return;
  const presentation = root.dataset["lensoPresentation"] ?? "auto";
  const stacked =
    presentation === "stacked" ||
    (presentation === "auto" && !matchMedia("(min-width: 768px)").matches);
  return { parent, popup, stacked, anchor: stacked ? popup : trigger };
}
interface ParentPose {
  retain(stacked: boolean): () => void;
}
const parents = new WeakMap<HTMLElement, ParentPose>();
function retainParent(popup: HTMLElement, stacked: boolean, child: HTMLElement) {
  let pose = parents.get(popup);
  if (!pose) {
    const surface = popup.querySelector<HTMLElement>(':scope > [data-slot="menu-surface"]');
    const content = popup.querySelector<HTMLElement>(':scope > [data-slot="menu-content"]');
    const count = popup.getAttribute("data-menu-child-count"),
      hidden = popup.getAttribute("aria-hidden");
    const snapshot = [surface, content].map((node) =>
      node
        ? {
            node,
            scale: node.style.scale,
            origin: node.style.transformOrigin,
            opacity: node.style.opacity,
            pointer: node.style.pointerEvents,
            inert: node.inert,
          }
        : undefined,
    );
    const leases = new Map<object, boolean>();
    const paint = () => {
      if (leases.size) popup.setAttribute("data-menu-child-count", String(leases.size));
      else if (count === null) popup.removeAttribute("data-menu-child-count");
      else popup.setAttribute("data-menu-child-count", count);
      const dim = [...leases.values()].some(Boolean);
      if (dim) popup.setAttribute("aria-hidden", "true");
      else if (hidden === null) popup.removeAttribute("aria-hidden");
      else popup.setAttribute("aria-hidden", hidden);
      for (const saved of snapshot) {
        if (!saved) continue;
        const { node } = saved;
        node.style.scale = dim ? "0.96" : saved.scale;
        node.style.transformOrigin = dim ? "top center" : saved.origin;
        if (node === content) {
          node.style.opacity = dim ? "0.45" : saved.opacity;
          node.style.pointerEvents = dim ? "none" : saved.pointer;
          node.inert = dim || saved.inert;
        }
      }
    };
    pose = {
      retain(isStacked) {
        const token = {};
        leases.set(token, isStacked);
        paint();
        let active = true;
        return () => {
          if (!active) return;
          active = false;
          leases.delete(token);
          paint();
          if (!leases.size) parents.delete(popup);
        };
      },
    };
    parents.set(popup, pose);
  }
  // A native top-layer popover still inherits inertness. Keep child positioners
  // outside the parent popup's content, as siblings of that popup in the Contract.
  if (stacked && popup.contains(child))
    throw new Error(
      "Stacked submenu positioners must be authored beside the parent MenuPopup, inside its MenuPositioner",
    );
  return pose.retain(stacked);
}
interface Host {
  leave?(event: PointerEvent, delay: number): void;
  open(trigger: HTMLElement, focus: boolean): void;
  refresh(): void;
}
interface Owner {
  sync(open: boolean, trigger: HTMLElement | undefined): void;
  press(): void;
  end(): void;
}
interface HoverTrigger {
  update(data: DOMStringMap): void;
  block(): void;
  end(): void;
}
const hosts = new WeakMap<HTMLElement, Host>();
const triggers = new WeakMap<HTMLElement, HoverTrigger>();
const mouse = (event: PointerEvent) => event.pointerType === "mouse" || event.pointerType === "";
const timeout = (value: string | undefined, fallback: number) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
};
const rootFor = (node: HTMLElement) =>
  node.ownerDocument.getElementById(
    node.dataset["lensoFor"] ?? node.getAttribute("popovertarget") ?? "",
  );
const hovering = new WeakSet<HTMLElement>();
export function submenuOpenedByHover(root: HTMLElement) {
  return hovering.has(root);
}
function allowsHover(node: HTMLElement, data: DOMStringMap) {
  const root = rootFor(node);
  if (!root || node.matches(':disabled,[aria-disabled="true"]')) return false;
  const mode = data["lensoOpenOnHover"] ?? "auto";
  return mode === "true" || (mode === "auto" && submenuLayout(root, node)?.stacked === false);
}
export function registerSubmenu(root: HTMLElement, host: Host): Owner {
  hosts.set(root, host);
  let release: (() => void) | undefined,
    retained: HTMLElement | undefined,
    wasStacked = false,
    opener: HTMLElement | undefined;
  let corridor: ReturnType<typeof createHoverCorridor> | undefined,
    closeTimer = 0;
  let point: { x: number; y: number } | undefined;
  const initial = root.getAttribute("data-lenso-resolved-presentation");
  const stopCorridor = () => {
    corridor?.dispose();
    corridor = undefined;
    root.ownerDocument.removeEventListener("pointermove", move);
  };
  const cancel = () => {
    clearTimeout(closeTimer);
    closeTimer = 0;
  };
  const close = () => {
    stopCorridor();
    cancel();
    if (root.matches(":popover-open")) root.hidePopover();
  };
  const move = (event: PointerEvent) => {
    if (mouse(event)) {
      point = { x: event.clientX, y: event.clientY };
      corridor?.move(event);
    }
  };
  const enter = (event: PointerEvent) => {
    if (mouse(event)) {
      point = { x: event.clientX, y: event.clientY };
      cancel();
    }
  };
  const containsPoint = (node: HTMLElement | undefined) => {
    if (!node || !point) return false;
    const rect = node.getBoundingClientRect();
    return (
      point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
    );
  };
  const childToggle = (event: Event) => {
    if (
      event.target instanceof Node &&
      event.target !== root &&
      root.contains(event.target) &&
      hovering.has(root) &&
      !root.querySelector(":popover-open") &&
      point &&
      !containsPoint(root) &&
      !containsPoint(opener)
    )
      close();
  };
  const leave = (event: PointerEvent) => {
    if (mouse(event) && hovering.has(root)) corridor?.move(event);
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target === root && event.newState === "closed") {
      cancel();
      stopCorridor();
      hovering.delete(root);
    }
  };
  const changed = () => {
    owner.sync(root.matches(":popover-open"), opener);
    host.refresh();
  };
  const query = matchMedia("(min-width: 768px)");
  query.addEventListener("change", changed);
  root.addEventListener("pointerenter", enter);
  root.addEventListener("pointerleave", leave);
  root.addEventListener("beforetoggle", beforeToggle);
  root.ownerDocument.addEventListener("toggle", childToggle, true);
  const owner: Owner = {
    press() {
      hovering.delete(root);
      cancel();
      stopCorridor();
    },
    sync(shown, trigger) {
      opener = trigger;
      const layout = submenuLayout(root, trigger);
      const stacked = layout?.stacked ?? false;
      root.setAttribute("data-lenso-resolved-presentation", stacked ? "stacked" : "cascade");
      if (!shown || !layout || retained !== layout.popup || wasStacked !== stacked) {
        release?.();
        release = undefined;
        retained = undefined;
      }
      if (shown && layout && !release) {
        release = retainParent(layout.popup, stacked, root);
        retained = layout.popup;
        wasStacked = stacked;
      }
      if (!shown) {
        stopCorridor();
        cancel();
        hovering.delete(root);
      }
    },
    end() {
      for (const node of root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slot="menu-submenu-trigger"]',
      ))
        if ((node.dataset["lensoFor"] ?? node.getAttribute("popovertarget")) === root.id)
          triggers.get(node)?.block();
      release?.();
      release = undefined;
      stopCorridor();
      cancel();
      query.removeEventListener("change", changed);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("beforetoggle", beforeToggle);
      root.ownerDocument.removeEventListener("toggle", childToggle, true);
      hovering.delete(root);
      hosts.delete(root);
      if (initial === null) root.removeAttribute("data-lenso-resolved-presentation");
      else root.setAttribute("data-lenso-resolved-presentation", initial);
    },
  };
  host.leave = (event, delay) => {
    if (!hovering.has(root) || !opener) return;
    cancel();
    stopCorridor();
    point = { x: event.clientX, y: event.clientY };
    corridor = createHoverCorridor({
      x: event.clientX,
      y: event.clientY,
      placement: ownMenuPopup(root)?.dataset["side"] ?? "right",
      reference: () => opener,
      floating: root,
      hasOpenChild: () => Boolean(root.querySelector(":popover-open")),
      onClose: () => {
        stopCorridor();
        cancel();
        if (delay) closeTimer = window.setTimeout(close, delay);
        else close();
      },
    });
    root.ownerDocument.addEventListener("pointermove", move);
    corridor.move(event);
  };
  return owner;
}
export function updateSubmenuTrigger(node: HTMLElement, data: DOMStringMap) {
  if (data["lensoKind"] !== "menu-submenu-trigger") {
    triggers.get(node)?.end();
    triggers.delete(node);
    return;
  }
  let owner = triggers.get(node);
  if (owner) {
    owner.update(data);
    return;
  }
  const nativeTarget = node.getAttribute("popovertarget");
  const nativeAction = node.getAttribute("popovertargetaction");
  let current = data,
    timer = 0,
    inside = false,
    blocked = false,
    pointerType = "",
    point: { x: number; y: number } | undefined;
  const cancel = () => {
    clearTimeout(timer);
    timer = 0;
  };
  const show = () => {
    timer = 0;
    if (
      !inside ||
      blocked ||
      !allowsHover(node, current) ||
      !node.isConnected ||
      !node.checkVisibility()
    )
      return;
    const root = rootFor(node);
    if (root) {
      hovering.add(root);
      hosts.get(root)?.open(node, false);
    }
  };
  const schedule = () => {
    cancel();
    const ms = timeout(current["lensoHoverDelay"], 100);
    if (ms) timer = window.setTimeout(show, ms);
    else show();
  };
  const enter = (event: PointerEvent) => {
    pointerType = event.pointerType;
    inside = mouse(event);
    blocked = false;
    point = { x: event.clientX, y: event.clientY };
    if (!inside || !allowsHover(node, current)) return;
    if (!isMenuPointerFocusGuarded(node)) node.focus({ preventScroll: true });
    const root = rootFor(node);
    if (root?.matches(":popover-open")) return;
    if (!isMenuPointerFocusGuarded(node) && timeout(current["lensoHoverDelay"], 100) === 0)
      schedule();
  };
  const move = (event: PointerEvent) => {
    const dx = point ? event.clientX - point.x : 0,
      dy = point ? event.clientY - point.y : 0;
    point = { x: event.clientX, y: event.clientY };
    if (
      !inside ||
      blocked ||
      !allowsHover(node, current) ||
      rootFor(node)?.matches(":popover-open")
    )
      return;
    if (isMenuPointerFocusGuarded(node)) return;
    if (timer && dx * dx + dy * dy < 2) return;
    node.focus({ preventScroll: true });
    schedule();
  };
  const leave = (event: PointerEvent) => {
    inside = false;
    cancel();
    const root = rootFor(node);
    if (root && hovering.has(root))
      hosts.get(root)?.leave?.(event, timeout(current["lensoCloseDelay"], 0));
  };
  const out = (event: PointerEvent) => {
    if (!(event.relatedTarget instanceof Node) || !node.contains(event.relatedTarget)) cancel();
  };
  const down = (event: PointerEvent) => {
    pointerType = event.pointerType;
    if (
      inside &&
      !blocked &&
      allowsHover(node, current) &&
      !rootFor(node)?.matches(":popover-open")
    )
      schedule();
  };
  const click = (event: MouseEvent) => {
    const root = rootFor(node);
    if (!root) return;
    event.preventDefault();
    if (node.matches(':disabled,[aria-disabled="true"]')) return;
    if (
      event.detail !== 0 &&
      (pointerType === "mouse" || pointerType === "") &&
      allowsHover(node, current)
    ) {
      node.setAttribute("popovertargetaction", root.matches(":popover-open") ? "show" : "hide");
      return;
    }
    hovering.delete(root);
    blocked = true;
    cancel();
    const shown = root.matches(":popover-open");
    node.setAttribute("popovertargetaction", shown ? "hide" : "show");
    if (shown) root.hidePopover();
    else hosts.get(root)?.open(node, true);
  };
  const closed = (event: Event) => {
    if (event.target === rootFor(node) && !(event.target as HTMLElement).matches(":popover-open")) {
      blocked = true;
      cancel();
    }
  };
  node.addEventListener("pointerenter", enter);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerleave", leave);
  node.addEventListener("pointerout", out);
  node.addEventListener("pointerdown", down);
  node.addEventListener("click", click, true);
  node.ownerDocument.addEventListener("toggle", closed, true);
  owner = {
    block() {
      blocked = true;
      cancel();
    },
    update(next) {
      current = next;
      if (!allowsHover(node, current)) cancel();
    },
    end() {
      cancel();
      const root = rootFor(node);
      if (root?.matches(":popover-open")) root.hidePopover();
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerout", out);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("click", click, true);
      node.ownerDocument.removeEventListener("toggle", closed, true);
      if (nativeTarget === null) node.removeAttribute("popovertarget");
      else node.setAttribute("popovertarget", nativeTarget);
      if (nativeAction === null) node.removeAttribute("popovertargetaction");
      else node.setAttribute("popovertargetaction", nativeAction);
    },
  };
  triggers.set(node, owner);
}
export function endSubmenuTrigger(node: HTMLElement) {
  triggers.get(node)?.end();
  triggers.delete(node);
}
