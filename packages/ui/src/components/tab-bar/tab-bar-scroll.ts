import { useEffect, type RefObject } from "react";

const SCROLL_THRESHOLD = 8;

export function useTabBarScrollMinimize({
  enabled,
  minimizeDirection,
  scrollTarget,
  root,
  minimized,
  onChange,
}: {
  enabled: boolean;
  minimizeDirection: "up" | "down";
  scrollTarget?: RefObject<HTMLElement | null>;
  root: RefObject<HTMLElement | null>;
  minimized: boolean;
  onChange: (value: boolean) => void;
}) {
  useEffect(() => {
    if (!enabled) return;
    const element = scrollTarget?.current;
    if (scrollTarget && !element) return;
    const view = root.current?.ownerDocument.defaultView;
    if (!view) return;
    const source = element ?? view;
    const position = () => {
      const scrollRoot = view.document.scrollingElement;
      const offset = element ? element.scrollTop : view.scrollY;
      const max = element
        ? element.scrollHeight - element.clientHeight
        : (scrollRoot?.scrollHeight ?? 0) - view.innerHeight;
      return Math.max(0, Math.min(offset, Math.max(0, max)));
    };
    let previous = position();
    let direction = 0;
    let distance = 0;
    let requested = minimized;
    const scroll = () => {
      const next = position();
      const delta = next - previous;
      previous = next;
      if (next <= 0 && minimizeDirection === "down") {
        direction = 0;
        distance = 0;
        if (requested) {
          requested = false;
          onChange(false);
        }
        return;
      }
      if (!delta) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (direction !== nextDirection) {
        direction = nextDirection;
        distance = 0;
      }
      distance += Math.abs(delta);
      const nextMinimized = minimizeDirection === "down" ? direction > 0 : direction < 0;
      if (distance >= SCROLL_THRESHOLD && requested !== nextMinimized) {
        requested = nextMinimized;
        onChange(nextMinimized);
      }
    };
    source.addEventListener("scroll", scroll, { passive: true });
    return () => source.removeEventListener("scroll", scroll);
  }, [enabled, minimizeDirection, scrollTarget, root, minimized, onChange]);
}
