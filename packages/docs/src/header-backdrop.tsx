"use client";

import { useMemo, useSyncExternalStore } from "react";
import * as stylex from "@stylexjs/stylex";
import { ScrollEdge } from "@lenso/ui/scroll-edge";

const styles = stylex.create({
  edge: {
    position: "absolute",
    inset: 0,
    height: "100%",
    zIndex: -1,
  },
});

const subscribe = () => () => {};
const getViewport = () => document.scrollingElement as HTMLElement | null;
const getServerViewport = () => null;

export function DocsHeaderBackdrop() {
  const viewport = useSyncExternalStore(subscribe, getViewport, getServerViewport);
  const scrollRef = useMemo(() => ({ current: viewport }), [viewport]);
  return viewport ? (
    <ScrollEdge
      variant="hard"
      edge="top"
      scrollRef={scrollRef}
      data-docs-header-backdrop=""
      xstyle={styles.edge}
    />
  ) : (
    <div aria-hidden="true" data-docs-header-backdrop="" {...stylex.props(styles.edge)} />
  );
}
