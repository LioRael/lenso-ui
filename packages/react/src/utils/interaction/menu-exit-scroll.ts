import { useRef, useState } from "react";
import { useScrollLock } from "@base-ui/utils/useScrollLock";
import type { Menu } from "@base-ui/react/menu";

const mousePresses = new WeakSet<Event>();

/** Base UI opens on mousedown, which by itself cannot distinguish a mouse from emulated touch. */
export function observeMenuPress(trigger: HTMLElement) {
  let mouse = false;
  const start = (event: PointerEvent) => {
    mouse = event.pointerType === "mouse";
  };
  const end = () => {
    mouse = false;
  };
  const press = (event: MouseEvent) => {
    if (mouse) mousePresses.add(event);
    end();
  };
  trigger.addEventListener("pointerdown", start, true);
  trigger.addEventListener("mousedown", press, true);
  trigger.addEventListener("pointerup", end, true);
  trigger.addEventListener("pointercancel", end, true);
  return () => {
    trigger.removeEventListener("pointerdown", start, true);
    trigger.removeEventListener("mousedown", press, true);
    trigger.removeEventListener("pointerup", end, true);
    trigger.removeEventListener("pointercancel", end, true);
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
