"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const shine = stylex.keyframes({
  from: { translate: "-100% 0" },
  to: { translate: "100% 0" },
});
const styles = stylex.create({
  panel: {
    width: 250,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderRadius: "var(--radius-xl)",
    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    padding: 16,
    boxShadow:
      "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 1px light-dark(rgb(0 0 0 / .05), rgb(255 255 255 / .1))",
  },
  text: { display: "flex", flexDirection: "column", gap: 12 },
  bone: {
    borderRadius: "var(--radius-lg)",
    backgroundColor: "light-dark(oklch(92.2% 0 0 / .9), oklch(26.9% 0 0 / .9))",
    "::after": {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      content: '""',
      translate: "-100% 0",
      backgroundImage:
        "linear-gradient(120deg, transparent 10%, light-dark(rgb(255 255 255 / .3), rgb(255 255 255 / .1)) 45%, light-dark(rgb(255 255 255 / .1), rgb(255 255 255 / .04)) 55%, transparent 90%)",
      animationName: { default: shine, "@media (prefers-reduced-motion: reduce)": "none" },
      animationDuration: "3s",
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
      pointerEvents: "none",
    },
  },
  picture: { height: 128 },
  short: { height: 12, width: "60%" },
  long: { height: 12, width: "80%" },
  shortest: { height: 12, width: "40%" },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.panel)}>
      <Skeleton xstyle={[styles.bone, styles.picture]} />
      <div {...stylex.props(styles.text)}>
        <Skeleton xstyle={[styles.bone, styles.short]} />
        <Skeleton xstyle={[styles.bone, styles.long]} />
        <Skeleton xstyle={[styles.bone, styles.shortest]} />
      </div>
    </div>
  );
}
export default CustomStyles;
