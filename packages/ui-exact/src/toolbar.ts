import { press } from "@lenso/glass/motion";

const rootSelector = '[data-slot="toolbar"]';
const groupSelector = '[data-slot="toolbar-group"]';
const itemSelector = '[data-slot="toolbar-button"], [data-slot="toolbar-link"]';
interface Controller {
  sync(): void;
  end(): void;
}
const roots = new WeakMap<HTMLElement, Controller>();

function createToolbar(root: HTMLElement): Controller {
  const originals = new Map<
    HTMLElement,
    { tab: string | null; disabled?: boolean; aria: string | null; marker: string | null }
  >();
  let current: HTMLElement | undefined;
  let within = false,
    disposed = false;
  const items = () =>
    [...root.querySelectorAll<HTMLElement>(itemSelector)].filter(
      (item) => item.closest(rootSelector) === root,
    );
  const restore = (item: HTMLElement) => {
    const original = originals.get(item);
    if (!original) return;
    for (const [name, value] of [
      ["tabindex", original.tab],
      ["aria-disabled", original.aria],
      ["data-disabled", original.marker],
    ]) {
      if (value === null) item.removeAttribute(name!);
      else item.setAttribute(name!, value!);
    }
    if (item instanceof HTMLButtonElement && original.disabled !== undefined)
      item.disabled = original.disabled;
    originals.delete(item);
  };
  const attribute = (item: HTMLElement, name: string, value: string) => {
    if (item.getAttribute(name) !== value) item.setAttribute(name, value);
  };
  const sync = () => {
    if (disposed) return;
    const all = items();
    for (const item of originals.keys()) if (!all.includes(item)) restore(item);
    const previous = current;
    const active = root.ownerDocument.activeElement;
    for (const item of all) {
      if (!originals.has(item))
        originals.set(item, {
          tab: item.getAttribute("tabindex"),
          disabled: item instanceof HTMLButtonElement ? item.disabled : undefined,
          aria: item.getAttribute("aria-disabled"),
          marker: item.getAttribute("data-disabled"),
        });
      if (item instanceof HTMLButtonElement) {
        const group = item.closest<HTMLElement>(groupSelector);
        const disabled =
          item.dataset["lensoOwnDisabled"] === "true" ||
          root.dataset["lensoDisabled"] === "true" ||
          (group?.closest(rootSelector) === root && group?.dataset["lensoDisabled"] === "true");
        const native = Boolean(disabled && item.dataset["lensoFocusableDisabled"] !== "true");
        if (item.disabled !== native) item.disabled = native;
        attribute(item, "aria-disabled", String(Boolean(disabled)));
        if (item.hasAttribute("data-disabled") !== Boolean(disabled))
          item.toggleAttribute("data-disabled", Boolean(disabled));
      }
    }
    const enabled = all.filter((item) =>
      item instanceof HTMLButtonElement
        ? !item.disabled
        : item.getAttribute("aria-disabled") !== "true",
    );
    current =
      enabled.find((item) => item === active) ??
      (current && enabled.includes(current) ? current : enabled[0]);
    for (const item of all) attribute(item, "tabindex", item === current ? "0" : "-1");
    if (
      within &&
      previous &&
      previous !== current &&
      current &&
      (active === root.ownerDocument.body || active === previous)
    )
      current.focus();
  };
  const focus = (event: FocusEvent) => {
    if (!(event.target instanceof HTMLElement) || event.target.closest(rootSelector) !== root)
      return;
    if (!event.target.matches(itemSelector)) return;
    within = true;
    current = event.target;
    sync();
  };
  const leave = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) within = false;
  };
  const navigate = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !(event.target instanceof Element)
    )
      return;
    if (
      event.target.closest(rootSelector) !== root ||
      event.target.closest("input,textarea,[contenteditable]")
    )
      return;
    const item = event.target.closest<HTMLElement>(itemSelector);
    const enabled = items().filter((item) =>
      item instanceof HTMLButtonElement
        ? !item.disabled
        : item.getAttribute("aria-disabled") !== "true",
    );
    const index = item ? enabled.indexOf(item) : -1;
    if (index < 0) return;
    const vertical = root.dataset["orientation"] === "vertical",
      rtl = getComputedStyle(root).direction === "rtl";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let destination: number;
    if (event.key === "Home") destination = 0;
    else if (event.key === "End") destination = enabled.length - 1;
    else if (event.key === next || event.key === previous) {
      destination = index + (event.key === next ? 1 : -1);
      destination =
        root.dataset["lensoLoopFocus"] === "true"
          ? (destination + enabled.length) % enabled.length
          : Math.max(0, Math.min(enabled.length - 1, destination));
    } else return;
    event.preventDefault();
    enabled[destination]?.focus();
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "disabled",
      "aria-disabled",
      "data-lenso-disabled",
      "data-lenso-own-disabled",
      "data-lenso-focusable-disabled",
      "data-lenso-direction",
      "data-orientation",
    ],
  });
  root.addEventListener("focusin", focus);
  root.addEventListener("focusout", leave);
  root.addEventListener("keydown", navigate);
  sync();
  return {
    sync,
    end() {
      disposed = true;
      observer.disconnect();
      root.removeEventListener("focusin", focus);
      root.removeEventListener("focusout", leave);
      root.removeEventListener("keydown", navigate);
      for (const item of originals.keys()) restore(item);
    },
  };
}

export function updateToolbar(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "toolbar") {
    const owner = roots.get(node);
    if (owner) owner.sync();
    else roots.set(node, createToolbar(node));
  } else if (data["lensoKind"]?.startsWith("toolbar-")) {
    const root = node.closest<HTMLElement>(rootSelector);
    if (root) roots.get(root)?.sync();
  }
}
export function endToolbar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  roots.get(node)?.end();
  roots.delete(node);
}

export function connectToolbar(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLElement) ||
    !["toolbar", "toolbar-group", "toolbar-button"].includes(data["lensoKind"] ?? "")
  )
    return;
  const kind = data["lensoKind"],
    surface = kind !== "toolbar-button";
  const ownsMotion =
    kind === "toolbar" ? data["lensoAttached"] === "true" : data["lensoSurface"] !== "true";
  const shouldStart = (event: PointerEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(rootSelector) !== node.closest(rootSelector)) return false;
    if (
      target?.closest(
        '[data-slot="toolbar-button"][data-lenso-loading="true"], [data-slot="toolbar-button"][data-lenso-elastic="false"]',
      )
    )
      return false;
    return (
      data["lensoElastic"] === "true" || Boolean(target?.closest('[data-lenso-elastic="true"]'))
    );
  };
  const stop = ownsMotion
    ? press(node, shouldStart, surface ? "--toolbar-press" : "--lg-press")
    : undefined;
  if (!(node instanceof HTMLButtonElement) || kind !== "toolbar-button") return () => stop?.();
  const tint = data["lensoTint"] ?? "";
  if (tint && !CSS.supports("color", tint)) {
    stop?.();
    throw new RangeError(`Invalid Toolbar tint: ${tint}`);
  }
  const name = "--lenso-exact-toolbar-tint",
    original = node.style.getPropertyValue(name),
    priority = node.style.getPropertyPriority(name);
  if (tint) node.style.setProperty(name, tint);
  else node.style.removeProperty(name);
  const pending = node.getAttribute("data-pending");
  node.toggleAttribute("data-pending", data["lensoLoading"] === "true");
  let pointer: { id: number; x: number; y: number; moved: boolean } | undefined;
  let dragged = false;
  const move = (event: PointerEvent) => {
    if (
      pointer?.id === event.pointerId &&
      Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 8
    )
      pointer.moved = true;
  };
  const release = () => {
    dragged = pointer?.moved ?? false;
    pointer = undefined;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", cancel);
  };
  const cancel = () => {
    release();
    dragged = false;
  };
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancel();
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", cancel);
  };
  const guard = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
    const inactive =
      node.disabled ||
      node.getAttribute("aria-disabled") === "true" ||
      data["lensoLoading"] === "true";
    const drag =
      event instanceof MouseEvent && event.type === "click" && event.detail > 0 && dragged;
    if (inactive || drag) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.type === "click") dragged = false;
  };
  for (const type of ["click", "dblclick", "keydown", "keyup"])
    node.addEventListener(type, guard, true);
  node.addEventListener("pointerdown", down);
  return () => {
    stop?.();
    cancel();
    node.removeEventListener("pointerdown", down);
    for (const type of ["click", "dblclick", "keydown", "keyup"])
      node.removeEventListener(type, guard, true);
    if (original) node.style.setProperty(name, original, priority);
    else node.style.removeProperty(name);
    if (pending === null) node.removeAttribute("data-pending");
    else node.setAttribute("data-pending", pending);
  };
}
