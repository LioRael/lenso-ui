// Gesture timing and movement contract adapted from Base UI ContextMenuTrigger 1.9.0.
// MIT License
//
// Copyright (c) 2019 Material-UI SAS
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { openContextMenu, closeContextMenu } from "./menu.js";
const selector = '[data-slot="context-menu-trigger"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(node: HTMLElement) {
  const doc = node.ownerDocument,
    view = doc.defaultView!;
  let disposed = false,
    timer = 0,
    suppressUntil = 0,
    touchOpened = false,
    releaseMenu: HTMLElement | undefined;
  let up: (() => void) | undefined;
  let touch: { id: number; x: number; y: number; start: TouchEvent } | undefined;
  const root = () => {
    const target = doc.getElementById(node.dataset["lensoFor"] ?? "");
    return target?.matches('[popover][role="menu"]') ? target : undefined;
  };
  const enabled = () => !disposed && node.isConnected && node.dataset["lensoDisabled"] !== "true";
  const own = (target: EventTarget | null) =>
    target instanceof Element && target.closest(selector) === node;
  const cancel = () => {
    view.clearTimeout(timer);
    timer = 0;
    touch = undefined;
  };
  function lease(
    menu: HTMLElement,
    point: { x: number; y: number; touch: boolean },
    startedAt: number,
  ) {
    up?.();
    let closedAt = -Infinity,
      closedInputAt = -Infinity,
      touchEndAt: number | undefined,
      finishTimer = 0;
    const closed = (e: ToggleEvent) => {
      if (e.target === menu && e.newState === "closed") {
        closedAt = view.performance.now();
        closedInputAt = e.timeStamp;
      }
    };
    const abort = () => up?.();
    const focus = (e: FocusEvent) => {
      if (e.target instanceof Element && !node.contains(e.target) && !menu.contains(e.target))
        abort();
    };
    const restore = () => {
      if (enabled() && root() === menu && !menu.matches(":popover-open"))
        openContextMenu(menu, node, point);
    };
    const release = (event: Event) => {
      if (point.touch) {
        touchEndAt = event.timeStamp;
        // A touch release can be followed by compatibility mouse events in the same gesture.
        finishTimer = view.setTimeout(() => up?.(), 700);
        if (
          !menu.matches(":popover-open") &&
          event.timeStamp <= closedInputAt &&
          view.performance.now() - closedAt < 32
        ) {
          view.clearTimeout(finishTimer);
          finishTimer = view.setTimeout(() => {
            restore();
            up?.();
          }, 0);
        }
        return;
      }
      const e = event as MouseEvent;
      if (e.button !== 2) return;
      const now = view.performance.now(),
        heldFor = e.timeStamp - startedAt,
        target = e.target;
      up?.();
      // Use physical input timestamps so Glass work does not turn a quick release into a long hold.
      if (
        heldFor >= 0 &&
        heldFor < 500 &&
        e.timeStamp <= closedInputAt &&
        now - closedAt < 32 &&
        !menu.matches(":popover-open")
      )
        view.queueMicrotask(restore);
      else if (
        heldFor >= 500 &&
        menu.matches(":popover-open") &&
        target instanceof Element &&
        (!menu.contains(target) ||
          target.closest('[data-slot="menu-backdrop"]')?.parentElement === menu) &&
        target.closest(selector)?.getAttribute("data-lenso-for") !== menu.id
      )
        menu.hidePopover();
    };
    const compatibilityRelease = (event: MouseEvent) => {
      if (
        !point.touch ||
        touchEndAt === undefined ||
        event.button !== 0 ||
        Math.abs(event.timeStamp - touchEndAt) > 32
      )
        return;
      const observedAt = view.performance.now();
      view.clearTimeout(finishTimer);
      // Native light-dismiss may run after mouseup dispatch, so reconcile after its default action.
      finishTimer = view.setTimeout(() => {
        if (closedAt >= observedAt && event.timeStamp <= closedInputAt) restore();
        up?.();
      }, 0);
    };
    const type = point.touch ? "touchend" : "mouseup";
    menu.addEventListener("beforetoggle", closed);
    doc.addEventListener("pointerdown", abort, true);
    doc.addEventListener("keydown", abort, true);
    doc.addEventListener("focusin", focus, true);
    doc.addEventListener(type, release, true);
    doc.addEventListener("touchcancel", abort, true);
    if (point.touch) doc.addEventListener("mouseup", compatibilityRelease, true);
    up = () => {
      view.clearTimeout(finishTimer);
      menu.removeEventListener("beforetoggle", closed);
      doc.removeEventListener("pointerdown", abort, true);
      doc.removeEventListener("keydown", abort, true);
      doc.removeEventListener("focusin", focus, true);
      doc.removeEventListener(type, release, true);
      doc.removeEventListener("touchcancel", abort, true);
      doc.removeEventListener("mouseup", compatibilityRelease, true);
      up = undefined;
    };
  }
  const open = (x: number, y: number, isTouch: boolean, holding = false, startedAt = 0) => {
    const menu = root();
    if (!enabled() || !menu) return false;
    const point = { x, y, touch: isTouch },
      shown = openContextMenu(menu, node, point);
    if (shown && isTouch) {
      touchOpened = holding;
      suppressUntil = holding ? Infinity : view.performance.now() + 700;
      releaseMenu = menu;
      if (holding) lease(menu, point, startedAt);
    }
    return shown;
  };
  const context = (event: MouseEvent) => {
    if (!enabled() || event.defaultPrevented || !own(event.target)) return;
    const holding = Boolean(touch) || touchOpened,
      isTouch = (event as PointerEvent).pointerType === "touch" || holding;
    cancel();
    if (!open(event.clientX, event.clientY, isTouch, holding, event.timeStamp)) return;
    event.preventDefault();
    event.stopPropagation();
    if (!isTouch && event.button === 2)
      lease(root()!, { x: event.clientX, y: event.clientY, touch: false }, event.timeStamp);
  };
  const backdropContext = (event: MouseEvent) => {
    const menu = root();
    if (
      enabled() &&
      menu?.matches(":popover-open") &&
      event.target instanceof Element &&
      event.target.closest('[data-slot="menu-backdrop"]')?.parentElement === menu
    )
      event.preventDefault();
  };
  const key = (event: KeyboardEvent) => {
    if (
      !enabled() ||
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !own(event.target) ||
      !(event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))
    )
      return;
    const b = node.getBoundingClientRect();
    cancel();
    if (open(b.left, b.bottom, false)) event.preventDefault();
  };
  const start = (event: TouchEvent) => {
    cancel();
    if (!enabled() || event.defaultPrevented || !own(event.target) || event.touches.length !== 1)
      return;
    const t = event.touches[0]!;
    touch = { id: t.identifier, x: t.clientX, y: t.clientY, start: event };
    event.stopPropagation();
    timer = view.setTimeout(() => {
      timer = 0;
      const active = touch;
      if (active && enabled() && !active.start.defaultPrevented)
        open(active.x, active.y, true, true, active.start.timeStamp);
    }, 500);
  };
  const move = (event: TouchEvent) => {
    const active = touch;
    if (!active) return;
    const t = [...event.touches].find((t) => t.identifier === active.id);
    if (
      !t ||
      event.touches.length !== 1 ||
      !enabled() ||
      event.defaultPrevented ||
      active.start.defaultPrevented
    ) {
      cancel();
      return;
    }
    if (timer && (Math.abs(t.clientX - active.x) > 10 || Math.abs(t.clientY - active.y) > 10)) {
      cancel();
      return;
    }
    if (!timer && root()?.matches(":popover-open") && event.cancelable) event.preventDefault();
  };
  const endTouch = () => {
    if (touchOpened) {
      touchOpened = false;
      suppressUntil = view.performance.now() + 700;
    }
    cancel();
  };
  const releasedTouch = () => {
    if (touchOpened) endTouch();
  };
  const newPointer = () => {
    if (!touchOpened) {
      suppressUntil = 0;
      releaseMenu = undefined;
    }
  };
  const click = (event: MouseEvent) => {
    if (
      event.target instanceof Element &&
      (own(event.target) || releaseMenu?.contains(event.target)) &&
      event.detail > 0 &&
      view.performance.now() < suppressUntil
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  let target = node.dataset["lensoFor"];
  const sync = () => {
    const next = node.dataset["lensoFor"];
    if (!enabled() || next !== target) {
      cancel();
      up?.();
    }
    target = next;
  };
  const observer = new MutationObserver(sync);
  observer.observe(node, {
    attributes: true,
    attributeFilter: ["data-lenso-disabled", "data-lenso-for"],
  });
  doc.addEventListener("contextmenu", backdropContext);
  node.addEventListener("contextmenu", context);
  node.addEventListener("keydown", key);
  node.addEventListener("touchstart", start, { passive: true });
  node.addEventListener("touchmove", move, { passive: false });
  node.addEventListener("touchend", endTouch);
  node.addEventListener("touchcancel", endTouch);
  view.addEventListener("click", click, true);
  doc.addEventListener("touchend", releasedTouch, true);
  doc.addEventListener("touchcancel", releasedTouch, true);
  doc.addEventListener("pointerdown", newPointer, true);
  return {
    sync,
    end() {
      if (disposed) return;
      const menu = root();
      if (menu) closeContextMenu(menu, node);
      disposed = true;
      cancel();
      up?.();
      observer.disconnect();
      doc.removeEventListener("contextmenu", backdropContext);
      node.removeEventListener("contextmenu", context);
      node.removeEventListener("keydown", key);
      node.removeEventListener("touchstart", start);
      node.removeEventListener("touchmove", move);
      node.removeEventListener("touchend", endTouch);
      node.removeEventListener("touchcancel", endTouch);
      view.removeEventListener("click", click, true);
      doc.removeEventListener("touchend", releasedTouch, true);
      doc.removeEventListener("touchcancel", releasedTouch, true);
      doc.removeEventListener("pointerdown", newPointer, true);
      owners.delete(node);
    },
  };
}
export function updateContextMenu(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  if (node.matches(selector)) {
    if (!owners.has(node)) owners.set(node, create(node));
    owners.get(node)?.sync();
  } else owners.get(node)?.end();
}
export function endContextMenu(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
