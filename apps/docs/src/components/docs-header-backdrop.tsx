"use client";

import { useSyncExternalStore } from "react";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  edge: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    backdropFilter: "blur(12px)",
    backgroundColor: "color-mix(in srgb, var(--lenso-background-primary) 68%, transparent)",
    maskImage: "linear-gradient(to bottom, black 60%, transparent)",
    opacity: { default: 0, ":is([data-scrolled])": 1 },
    "@media (prefers-reduced-transparency: reduce)": {
      backdropFilter: "none",
      backgroundColor: "var(--lenso-background-primary)",
    },
  },
});
const subscribe = (update: () => void) => {
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update);
};
const isScrolled = () => window.scrollY > 0;
const atTop = () => false;

export function DocsHeaderBackdrop() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, atTop);
  return (
    <div
      aria-hidden="true"
      data-scrolled={scrolled || undefined}
      data-docs-header-backdrop=""
      {...stylex.props(s.edge)}
    />
  );
}
