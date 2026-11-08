import { useCallback, useEffect, useRef, type Ref, type RefObject } from "react";
import { assignRef } from "../interaction/ref.js";

export type ScrollEdgeSide = "top" | "bottom" | "inline-start" | "inline-end";

export function useScrollEdgeRef(
  ref: Ref<HTMLElement> | undefined,
  scrollRef: RefObject<HTMLElement | null> | undefined,
  edge: ScrollEdgeSide,
) {
  const element = useRef<HTMLElement | null>(null);
  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      element.current = node;
      if (node && scrollRef && !node.style.getPropertyValue("--material-edge-visibility"))
        node.style.setProperty("--material-edge-visibility", "0");
      const cleanup = assignRef(ref, node);
      return () => {
        element.current = null;
        cleanup();
      };
    },
    [ref, scrollRef],
  );
  useEffect(() => {
    const root = element.current;
    const scroll = scrollRef?.current;
    if (!root || !scroll) return;
    let frame = 0;
    let previous = "";
    const measure = () => {
      frame = 0;
      const vertical = edge === "top" || edge === "bottom";
      const maximum = Math.max(
        0,
        vertical
          ? scroll.scrollHeight - scroll.clientHeight
          : scroll.scrollWidth - scroll.clientWidth,
      );
      // Modern engines use negative scrollLeft from the RTL inline start.
      const position = Math.min(
        maximum,
        Math.max(0, vertical ? scroll.scrollTop : Math.abs(scroll.scrollLeft)),
      );
      const distance = edge === "top" || edge === "inline-start" ? position : maximum - position;
      const extent = vertical ? root.clientHeight : root.clientWidth;
      const progress =
        maximum <= 1 ? 0 : Math.min(1, distance / Math.max(1, Math.min(24, extent * 0.4)));
      const value = progress.toFixed(3);
      if (value === previous) return;
      previous = value;
      root.style.setProperty("--material-edge-visibility", value);
      root.toggleAttribute("data-scroll-active", progress > 0.001);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const observed = new Set<Element>();
    const observe = () => {
      const next = new Set([scroll, root, ...scroll.children]);
      for (const node of observed) {
        if (!next.has(node)) {
          resize.unobserve(node);
          observed.delete(node);
        }
      }
      for (const node of next) {
        if (!observed.has(node)) {
          resize.observe(node);
          observed.add(node);
        }
      }
    };
    const mutation = new MutationObserver(() => {
      observe();
      schedule();
    });
    mutation.observe(scroll, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "dir"],
    });
    observe();
    measure();
    const scrollEvents =
      scroll === scroll.ownerDocument.scrollingElement ? scroll.ownerDocument : scroll;
    scrollEvents.addEventListener("scroll", schedule, { passive: true });
    scroll.addEventListener("load", schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      scrollEvents.removeEventListener("scroll", schedule);
      scroll.removeEventListener("load", schedule, true);
      root.style.removeProperty("--material-edge-visibility");
      root.removeAttribute("data-scroll-active");
    };
  }, [scrollRef, edge]);
  return mergedRef;
}
