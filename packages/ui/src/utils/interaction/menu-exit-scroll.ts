import { useRef, useState } from "react";
import { useScrollLock } from "@base-ui/utils/useScrollLock";
import type { Menu } from "@base-ui/react/menu";

const mousePresses = new WeakSet<Event>();

/** Base UI opens on mousedown, which by itself cannot distinguish a mouse from emulated touch. */
export function observeMenuPress(trigger: HTMLElement) {
  let mouse = false;
  let mouseGesture = false;
  let pointer: { id: number; x: number; y: number } | null = null;
  let dragged = false;
  const view = trigger.ownerDocument.defaultView;
  const move = (event: PointerEvent) => {
    if (
      event.pointerId === pointer?.id &&
      Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 8
    )
      dragged = true;
  };
  const stop = () => {
    view?.removeEventListener("pointermove", move, true);
    view?.removeEventListener("pointerup", finish, true);
    view?.removeEventListener("pointercancel", finish, true);
    pointer = null;
  };
  const finish = (event: PointerEvent) => {
    if (event.pointerId !== pointer?.id) return;
    move(event);
    if (event.type === "pointercancel") dragged = true;
    mouse = false;
    stop();
  };
  const start = (event: PointerEvent) => {
    mouse = event.pointerType === "mouse";
    mouseGesture = mouse;
    if (!event.isPrimary || event.button !== 0) return;
    stop();
    dragged = false;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    view?.addEventListener("pointermove", move, true);
    view?.addEventListener("pointerup", finish, true);
    view?.addEventListener("pointercancel", finish, true);
  };
  const end = () => {
    mouse = false;
  };
  const press = (event: MouseEvent) => {
    if (mouse) mousePresses.add(event);
    end();
  };
  const click = (event: MouseEvent) => {
    if (event.detail > 0 && dragged) {
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (event.detail > 0 && mouseGesture) {
      mousePresses.add(event);
    }
  };
  const cancel = () => {
    if (pointer) dragged = true;
    stop();
    mouse = false;
  };
  trigger.addEventListener("pointerdown", start, true);
  trigger.addEventListener("mousedown", press, true);
  trigger.addEventListener("click", click, true);
  view?.addEventListener("blur", cancel);
  return () => {
    stop();
    trigger.removeEventListener("pointerdown", start, true);
    trigger.removeEventListener("mousedown", press, true);
    trigger.removeEventListener("click", click, true);
    view?.removeEventListener("blur", cancel);
  };
}

function lockedByPopup(doc: Document) {
  return (
    doc.documentElement.hasAttribute("data-base-ui-scroll-locked") ||
    [doc.documentElement, doc.body].some((node) => node?.style.overflowY === "hidden")
  );
}

/** Keep an existing modal lock until the root's own exit animation finishes. */
export function useMenuExitScroll(mounted: boolean, modal: boolean) {
  const opening = useRef<Document | null>(null);
  const [anchor, retain] = useState<HTMLElement | null>(null);
  useScrollLock(mounted && modal && anchor !== null, anchor);
  return {
    change(open: boolean, details: Menu.Root.ChangeEventDetails, trigger: HTMLElement | null) {
      if (details.isCanceled) return;
      const doc = trigger?.ownerDocument;
      if (open) {
        // A second press during exit sees our own lock, not an unrelated modal's.
        const reopening = doc && opening.current === doc && anchor?.ownerDocument === doc;
        retain(null);
        const event = details.event;
        // Only a confirmed mouse or keyboard opening participates. Touch, hover, initially
        // open and externally locked documents keep Base UI's own release behavior.
        const explicitInput =
          mousePresses.has(event) ||
          event.type.startsWith("key") ||
          ("pointerType" in event && event.pointerType === "mouse") ||
          (event.type === "click" && "detail" in event && event.detail === 0);
        opening.current =
          modal &&
          doc &&
          explicitInput &&
          (reopening || !lockedByPopup(doc)) &&
          (details.reason === "trigger-press" || details.reason === "list-navigation")
            ? doc
            : null;
      } else if (modal && doc && opening.current === doc && lockedByPopup(doc)) {
        retain(trigger);
      }
    },
    complete() {
      opening.current = null;
      retain(null);
    },
  };
}
