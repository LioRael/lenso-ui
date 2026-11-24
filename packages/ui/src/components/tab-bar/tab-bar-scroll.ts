import { bindTabBarScroll } from "@lenso/glass/motion";
import { useEffect, type RefObject } from "react";

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
    if (root.current) {
      return bindTabBarScroll(
        root.current,
        element ?? undefined,
        minimizeDirection,
        minimized,
        onChange,
      );
    }
  }, [enabled, minimizeDirection, scrollTarget, root, minimized, onChange]);
}
