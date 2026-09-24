"use client";

import * as React from "react";

const guideHeightProperty = "--lenso-resize-guide-height";

export function useResizeGuideHeight<T extends HTMLElement>(forwardedRef?: React.ForwardedRef<T>) {
  const rootRef = React.useRef<T | null>(null);
  const setRef = React.useCallback(
    (node: T | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => root.style.setProperty(guideHeightProperty, `${root.clientHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.style.removeProperty(guideHeightProperty);
    };
  }, []);

  return setRef;
}
