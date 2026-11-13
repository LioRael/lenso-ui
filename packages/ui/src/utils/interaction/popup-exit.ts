import { useCallback, useInsertionEffect, useRef } from "react";

const pending = new WeakMap<HTMLElement, Animation>();

export function cancelPopupExit(popup: HTMLElement) {
  pending.get(popup)?.cancel();
  pending.delete(popup);
}

// Native presence waits for running WAAPI animations. Paused animations are ignored.
export function holdPopupExit(popup: HTMLElement) {
  if (popup.getAttribute("data-presentation") === "sheet") return;
  if (pending.get(popup)?.playState === "running" || !popup.animate) return;
  // Child panels return in sequence before their parent can return to its trigger.
  const panels = 1 + popup.querySelectorAll('[data-lenso-slot="menu-popup"]').length;
  const animation = popup.animate([], { duration: 1000 * panels });
  void animation.finished.catch(() => {});
  pending.set(popup, animation);
}

export function finishPopupExit(popup: HTMLElement) {
  pending.get(popup)?.finish();
  pending.delete(popup);
}

/** Connect native presence to Lenso's geometry timeline without changing painted styles. */
export function usePopupExit(open?: boolean) {
  const popup = useRef<HTMLDivElement>(null);
  const previous = useRef(open);
  useInsertionEffect(() => {
    if (popup.current && previous.current !== open) {
      if (open) cancelPopupExit(popup.current);
      else if (previous.current) holdPopupExit(popup.current);
    }
    previous.current = open;
  }, [open]);
  const holdExit = useCallback((open: boolean) => {
    if (popup.current) (open ? cancelPopupExit : holdPopupExit)(popup.current);
  }, []);
  const finishExit = useCallback(() => {
    if (popup.current) finishPopupExit(popup.current);
  }, []);
  return { popup, holdExit, finishExit };
}
