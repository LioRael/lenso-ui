/**
 * Copyright (c) 2019 Material-UI SAS.
 * Copyright (c) 2021-present Floating UI contributors. MIT License; see NOTICES.md.
 * Native-element adaptation of Base UI 1.9.0 Popover hover and patient clicks.
 */
import { createHoverCorridor } from "./popover-hover-corridor.js";

interface HoverHost {
  info(): { trigger: HTMLElement | undefined; touchPress: boolean };
  activate(trigger: HTMLElement, focus: boolean): void;
  sync(): void;
}
interface Trigger {
  node: HTMLElement;
  data: DOMStringMap;
  inside: boolean;
  enabled(): boolean;
  closeDelay(): number;
  block(): void;
  end(): void;
}
interface Session {
  trigger: Trigger;
  hover: boolean;
  openedAt: number;
  cancelClose(): void;
  traverse(event: PointerEvent): void;
  suspend(): void;
  resume(): void;
  promote(): void;
  dispose(): void;
}
const hosts = new WeakMap<HTMLElement, HoverHost>();
const triggers = new WeakMap<HTMLElement, Trigger>();
const sessions = new WeakMap<HTMLElement, Session>();
const inputTypes = new WeakMap<HTMLElement, string>();
const mouseLike = (type: string) => type === "mouse" || type === "pen" || type === "";
const delay = (value: string | undefined, fallback: number) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
};
const rootFor = (node: HTMLElement) => {
  const root = node.ownerDocument.getElementById(node.getAttribute("popovertarget") ?? "");
  return root?.dataset["lensoKind"] === "popover-positioner" ? root : undefined;
};
const open = (root: HTMLElement) => root.matches(":popover-open");
const hasChild = (root: HTMLElement) => Boolean(root.querySelector(":popover-open,dialog[open]"));

function overEnabledTrigger(target: EventTarget | null, root: HTMLElement) {
  if (!(target instanceof Element)) return false;
  const node = target.closest<HTMLElement>("button[popovertarget]");
  const candidate = node && triggers.get(node);
  return Boolean(candidate?.enabled() && rootFor(candidate.node) === root);
}

export function popoverInputType(trigger: HTMLElement | undefined) {
  return trigger ? inputTypes.get(trigger) : undefined;
}
export function isHoverPopover(root: HTMLElement) {
  return sessions.get(root)?.hover === true;
}
export function hoverPopoverTrigger(root: HTMLElement) {
  return sessions.get(root)?.trigger.node;
}
export function blockPopoverHover(trigger: HTMLElement | undefined) {
  if (trigger) triggers.get(trigger)?.block();
}
export function clearPopoverHover(root: HTMLElement) {
  sessions.get(root)?.dispose();
}
export function registerPopoverHoverHost(root: HTMLElement, host: HoverHost) {
  hosts.set(root, host);
  return () => {
    for (const node of root.ownerDocument.querySelectorAll<HTMLElement>("button[popovertarget]"))
      if (node.getAttribute("popovertarget") === root.id) triggers.get(node)?.block();
    clearPopoverHover(root);
    if (hosts.get(root) === host) hosts.delete(root);
  };
}

function createSession(root: HTMLElement, trigger: Trigger): Session {
  clearPopoverHover(root);
  const doc = root.ownerDocument;
  let closeTimer = 0;
  let corridor: ReturnType<typeof createHoverCorridor> | undefined;
  let suspended = true;
  let disposed = false;
  let point: { x: number; y: number } | undefined;
  const stopCorridor = () => {
    corridor?.dispose();
    corridor = undefined;
    doc.removeEventListener("pointermove", move);
  };
  const cancelClose = () => window.clearTimeout(closeTimer);
  const close = (ms = trigger.closeDelay()) => {
    cancelClose();
    if (!session.hover || disposed || hasChild(root)) return;
    const run = () => {
      if (!disposed && session.hover && open(root) && !hasChild(root)) root.hidePopover();
    };
    if (ms) closeTimer = window.setTimeout(run, ms);
    else run();
  };
  const containsPoint = (node: HTMLElement) => {
    if (!point) return false;
    const r = node.getBoundingClientRect();
    return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
  };
  const move = (event: PointerEvent) => {
    if (!mouseLike(event.pointerType) || !session.hover || disposed) return;
    point = { x: event.clientX, y: event.clientY };
    corridor?.move(event);
  };
  const enter = (event: PointerEvent) => {
    if (!mouseLike(event.pointerType) || !session.hover) return;
    point = { x: event.clientX, y: event.clientY };
    cancelClose();
  };
  const leave = (event: PointerEvent) => {
    if (
      !mouseLike(event.pointerType) ||
      !session.hover ||
      overEnabledTrigger(event.relatedTarget, root)
    )
      return;
    point = { x: event.clientX, y: event.clientY };
    if (corridor) corridor.move(event);
    else close();
  };
  const childToggle = (event: Event) => {
    if (!(event.target instanceof Element) || event.target === root || !root.contains(event.target))
      return;
    if (session.hover && !hasChild(root) && !containsPoint(root) && !containsPoint(trigger.node)) {
      cancelClose();
      closeTimer = window.setTimeout(() => close(0));
    }
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target === root && event.newState === "closed") session.dispose();
  };
  const session: Session = {
    trigger,
    hover: true,
    openedAt: performance.now(),
    cancelClose,
    traverse(event) {
      if (!session.hover || suspended || disposed) return;
      cancelClose();
      stopCorridor();
      point = { x: event.clientX, y: event.clientY };
      corridor = createHoverCorridor({
        x: event.clientX,
        y: event.clientY,
        placement:
          root.querySelector<HTMLElement>(':scope > [data-slot="popover-popup"]')?.dataset[
            "side"
          ] ?? "bottom",
        reference: () => (trigger.node.isConnected ? trigger.node : undefined),
        floating: root,
        hasOpenChild: () => hasChild(root),
        onClose: () => {
          stopCorridor();
          close();
        },
      });
      doc.addEventListener("pointermove", move);
      corridor.move(event);
    },
    suspend() {
      if (suspended) return;
      suspended = true;
      cancelClose();
      stopCorridor();
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      doc.removeEventListener("toggle", childToggle, true);
    },
    resume() {
      if (!suspended || disposed || !session.hover) return;
      suspended = false;
      root.addEventListener("pointerenter", enter);
      root.addEventListener("pointerleave", leave);
      doc.addEventListener("toggle", childToggle, true);
    },
    promote() {
      session.suspend();
      session.hover = false;
      hosts.get(root)?.activate(trigger.node, true);
    },
    dispose() {
      if (disposed) return;
      session.suspend();
      disposed = true;
      cancelClose();
      stopCorridor();
      root.removeEventListener("beforetoggle", beforeToggle);
      if (sessions.get(root) === session) sessions.delete(root);
    },
  };
  sessions.set(root, session);
  root.addEventListener("beforetoggle", beforeToggle);
  session.resume();
  return session;
}

function createTrigger(node: HTMLElement, initial: DOMStringMap): Trigger {
  let timer = 0;
  let pointerType = "";
  let pending = false;
  let blocked = false;
  let lastPoint: { x: number; y: number } | undefined;
  const cancel = () => {
    window.clearTimeout(timer);
    pending = false;
  };
  const trigger: Trigger = {
    node,
    data: initial,
    inside: false,
    enabled: () =>
      trigger.data["lensoOpenOnHover"] === "true" &&
      !node.matches(':disabled,[aria-disabled="true"]'),
    closeDelay: () => delay(trigger.data["lensoCloseDelay"], 0),
    block() {
      blocked = true;
      cancel();
    },
    end() {
      cancel();
      const root = rootFor(node),
        session = root && sessions.get(root);
      if (root && session?.trigger === trigger) {
        if (root.isConnected && open(root)) root.hidePopover();
        session.dispose();
      }
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerout", out);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("keydown", keydown);
      node.removeEventListener("click", click, true);
      observer.disconnect();
      inputTypes.delete(node);
    },
  };
  const show = () => {
    pending = false;
    if (
      blocked ||
      !trigger.inside ||
      !trigger.enabled() ||
      !node.isConnected ||
      !node.checkVisibility()
    )
      return;
    const root = rootFor(node);
    if (!root) return;
    const host = hosts.get(root);
    if (open(root) && (host?.info().touchPress || host?.info().trigger === node)) return;
    const alreadyOpen = open(root),
      session = createSession(root, trigger);
    if (alreadyOpen) host?.activate(node, false);
    else {
      try {
        root.showPopover();
      } catch (error) {
        session.dispose();
        throw error;
      }
    }
  };
  const schedule = () => {
    cancel();
    const ms = delay(trigger.data["lensoHoverDelay"], 300);
    pending = true;
    if (ms) timer = window.setTimeout(show, ms);
    else show();
  };
  const enter = (event: PointerEvent) => {
    pointerType = event.pointerType;
    lastPoint = { x: event.clientX, y: event.clientY };
    trigger.inside = mouseLike(pointerType);
    blocked = false;
    if (!trigger.inside || !trigger.enabled()) return;
    const root = rootFor(node);
    const session = root && sessions.get(root);
    session?.cancelClose();
    if (root && open(root)) {
      if (hosts.get(root)?.info().trigger !== node) show();
      return;
    }
    const reentering =
      root &&
      hosts.get(root)?.info().trigger === node &&
      root.getAttribute("data-lenso-open-reason") === "hover" &&
      getComputedStyle(root).display !== "none";
    if (reentering || delay(trigger.data["lensoHoverDelay"], 300) === 0) show();
  };
  const move = (event: PointerEvent) => {
    // WebKit may report zero movementX/Y for a moving pointer.
    const dx = lastPoint ? event.clientX - lastPoint.x : event.movementX;
    const dy = lastPoint ? event.clientY - lastPoint.y : event.movementY;
    lastPoint = { x: event.clientX, y: event.clientY };
    if (blocked || !mouseLike(pointerType) || !trigger.inside || !trigger.enabled()) return;
    const root = rootFor(node);
    if (root && open(root)) return;
    if (pending && dx ** 2 + dy ** 2 < 2) return;
    schedule();
  };
  const leave = (event: PointerEvent) => {
    trigger.inside = false;
    cancel();
    if (!mouseLike(pointerType)) return;
    const root = rootFor(node),
      session = root && sessions.get(root);
    if (root && overEnabledTrigger(event.relatedTarget, root)) return;
    if (session?.trigger === trigger && session.hover) session.traverse(event);
  };
  const out = (event: PointerEvent) => {
    if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
    cancel();
  };
  const down = (event: PointerEvent) => {
    trigger.block();
    pointerType = event.pointerType;
    inputTypes.set(node, pointerType);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      trigger.block();
      inputTypes.set(node, "keyboard");
    }
  };
  const click = (event: MouseEvent) => {
    cancel();
    if (event.detail === 0 && inputTypes.get(node) !== "touch") inputTypes.set(node, "keyboard");
    if (node.matches(':disabled,[aria-disabled="true"]')) return;
    const root = rootFor(node),
      session = root && sessions.get(root);
    if (
      root &&
      open(root) &&
      session?.trigger === trigger &&
      session.hover &&
      performance.now() - session.openedAt < 500
    ) {
      event.preventDefault();
      session.promote();
    }
  };
  const observer = new MutationObserver(() => {
    if (!trigger.enabled()) {
      cancel();
      const root = rootFor(node),
        session = root && sessions.get(root);
      if (session?.trigger === trigger) session.suspend();
    }
  });
  observer.observe(node, {
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "data-lenso-open-on-hover"],
  });
  node.addEventListener("pointerenter", enter);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerleave", leave);
  node.addEventListener("pointerout", out);
  node.addEventListener("pointerdown", down);
  node.addEventListener("keydown", keydown);
  node.addEventListener("click", click, true);
  return trigger;
}

export function updatePopoverHover(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] !== "popover-trigger") {
    endPopoverHover(node);
    return;
  }
  let owner = triggers.get(node);
  if (!owner) {
    owner = createTrigger(node, data);
    triggers.set(node, owner);
  }
  owner.data = data;
  const hostRoot = rootFor(node);
  if (hostRoot) hosts.get(hostRoot)?.sync();
  const root = rootFor(node),
    session = root && sessions.get(root);
  if (session?.trigger === owner) {
    if (owner.enabled()) session.resume();
    else session.suspend();
  }
}
export function endPopoverHover(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  triggers.get(node)?.end();
  triggers.delete(node);
}
