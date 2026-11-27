import { useLayoutEffect, useRef, type RefObject } from "react";
import { bindTabBarMinimize } from "@lenso/glass/motion";
import type { TabBarLayout } from "./tab-bar.js";

export function useTabBarMinimize(
  ref: RefObject<HTMLDivElement | null>,
  minimized: boolean,
  separate: boolean,
  layout: TabBarLayout,
) {
  const motion = useRef<ReturnType<typeof bindTabBarMinimize>>(undefined);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const binding = bindTabBarMinimize(ref.current, separate, layout);
    motion.current = binding;
    return () => {
      binding?.destroy();
      motion.current = undefined;
    };
  }, [ref, separate, layout]);
  useLayoutEffect(() => {
    motion.current?.setMinimized(minimized);
  }, [ref, minimized, separate, layout]);
}
