"use client";
import { useCallback, useEffect, useState, type RefObject } from "react";
import { useSafeLayoutEffect } from "./use-safe-layout-effect.js";

/** Adapted from HeroUI v3.2.6 (Apache-2.0). */
export function useMeasuredHeight(ref: RefObject<HTMLDivElement | null>): {
  height: number | undefined;
} {
  const [height, setHeight] = useState<number>();
  const calculateHeight = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const previous = element.style.height;
    element.style.height = "auto";
    const measured = element.scrollHeight;
    element.style.height = previous;
    setHeight((value) => (value === measured ? value : measured));
  }, [ref]);
  useSafeLayoutEffect(calculateHeight, [calculateHeight]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        calculateHeight();
      });
    };
    const mutations = new MutationObserver(schedule);
    mutations.observe(element, {
      attributeFilter: ["class"],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    // Ignore block-axis changes: consumers animate height, which must not feed back into measurement.
    let width = element.getBoundingClientRect().width;
    const resize = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next === undefined || Math.abs(next - width) < 0.5) return;
      width = next;
      schedule();
    });
    resize.observe(element);
    return () => {
      mutations.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [ref, calculateHeight]);
  return { height };
}
