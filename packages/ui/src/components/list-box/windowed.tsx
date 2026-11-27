"use client";

import * as React from "react";

import {
  collectionWindow,
  revealWindowRow,
  type WindowOptions,
} from "@lenso/primitives/table/core";
export type { WindowOptions } from "@lenso/primitives/table/core";

/** A fixed-height native collection window. Focused rows stay mounted during scroll. */
export function useCollectionWindow(
  count: number,
  options: WindowOptions | undefined,
  node: React.RefObject<HTMLElement | null>,
) {
  const [start, setStart] = React.useState(0);
  const [focused, setFocused] = React.useState<number | null>(null);
  const pending = React.useRef<number | null>(null);
  const indices = collectionWindow(count, start, options, focused);
  const scrollTo = React.useCallback(
    (index: number) => {
      if (!options || !node.current) return;
      const viewport = node.current;
      revealWindowRow(viewport, index, options);
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
      `[data-window-index="${pending.current}"] [data-lenso-slot="list-box-item"],[data-window-index="${pending.current}"][data-lenso-slot="table-row"] td`,
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
