import { useCallback, useEffect, useRef, type Ref, type RefObject } from "react";
import { assignRef } from "../interaction/ref.js";

import { bindScrollEdge, type ScrollEdgeSide } from "@lenso/glass/motion";
export type { ScrollEdgeSide };

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
    return bindScrollEdge(root, scroll, edge);
  }, [scrollRef, edge]);
  return mergedRef;
}
