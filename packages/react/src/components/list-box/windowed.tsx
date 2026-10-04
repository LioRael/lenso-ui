"use client";

import * as React from "react";

export interface WindowOptions {
  rowHeight: number;
  height: number;
  overscan?: number;
}

/** A fixed-height native collection window. Focused rows stay mounted during scroll. */
export function useCollectionWindow(
  count: number,
  options: WindowOptions | undefined,
  node: React.RefObject<HTMLElement | null>,
) {
  const [start, setStart] = React.useState(0);
  const [focused, setFocused] = React.useState<number | null>(null);
  const pending = React.useRef<number | null>(null);
  const overscan = options?.overscan ?? 3;
  const visible = options ? Math.ceil(options.height / options.rowHeight) : count;
  const first = options ? Math.max(0, start - overscan) : 0;
  const last = options ? Math.min(count, start + visible + overscan) : count;
  const indices = Array.from({ length: last - first }, (_, index) => first + index);
  if (focused !== null && focused >= 0 && focused < count && !indices.includes(focused))
    indices.push(focused);
  indices.sort((a, b) => a - b);
  const scrollTo = React.useCallback(
    (index: number) => {
      if (!options || !node.current) return;
      const top = index * options.rowHeight;
      const viewport = node.current;
      // oxlint-disable-next-line react/immutability -- Event-time scrolling mutates the browser viewport, not React-owned data.
      if (top < viewport.scrollTop) viewport.scrollTop = top;
      else if (top + options.rowHeight > viewport.scrollTop + options.height)
        // oxlint-disable-next-line react/immutability -- Keep the focused row in the imperative DOM viewport.
        viewport.scrollTop = top + options.rowHeight - options.height;
      setStart(Math.floor(viewport.scrollTop / options.rowHeight));
      setFocused(index);
      pending.current = index;
    },
    [options, node],
  );
  React.useEffect(() => {
    const viewport = node.current;
    if (!options || !viewport) return;
    const update = () => setStart(Math.floor(viewport.scrollTop / options.rowHeight));
    viewport.addEventListener("scroll", update, { passive: true });
    return () => viewport.removeEventListener("scroll", update);
  }, [options, node]);
  React.useLayoutEffect(() => {
    if (pending.current === null) return;
    const target = node.current?.querySelector<HTMLElement>(
      `[data-window-index="${pending.current}"] [data-slot="list-box-item"],[data-window-index="${pending.current}"][data-slot="table-row"] td`,
    );
    if (target) {
      target.focus();
      pending.current = null;
    }
  });
  return {
    indices,
    scrollTo,
    setFocused,
    onScroll() {
      if (options && node.current) setStart(Math.floor(node.current.scrollTop / options.rowHeight));
    },
  };
}
