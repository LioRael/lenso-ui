// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const menuStyles = stylex.create({
  popup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 4,
    minWidth: 192,
    maxHeight: "var(--available-height)",
    overflowY: "auto",
    fontSize: 14,
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    boxShadow: tokens.shadowOverlay,
    borderRadius: "min(32px, var(--radius-3xl))",
    outline: "none",
    transformOrigin: "var(--transform-origin)",
    opacity: { default: 1, ":is([data-starting-style],[data-ending-style])": 0 },
    transform: {
      default: "scale(1)",
      ":is([data-starting-style])": "scale(.9)",
      ":is([data-ending-style])": "scale(.95)",
    },
    translate: {
      default: "0 0",
      ':is([data-starting-style])[data-side="top"]': "0 4px",
      ':is([data-starting-style])[data-side="bottom"]': "0 -4px",
      ':is([data-starting-style])[data-side="left"]': "4px 0",
      ':is([data-starting-style])[data-side="right"]': "-4px 0",
    },
    pointerEvents: { default: "auto", ":is([data-ending-style])": "none" },
    transitionProperty: "opacity, transform, translate",
    transitionTimingFunction: tokens.easeSmooth,
    transitionDuration: {
      default: "150ms",
      ":is([data-ending-style])": "100ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
  },
  positioner: { zIndex: tokens.zIndexOverlay, maxWidth: "var(--available-width)" },
  separator: {
    marginInline: "3%",
    width: "94%",
    height: 1,
    backgroundColor: tokens.separator,
    marginBlock: 4,
  },
  arrow: { width: 12, height: 12, fill: tokens.overlay },
});
