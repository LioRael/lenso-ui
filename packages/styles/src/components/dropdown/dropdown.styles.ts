// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const dropdownStyles = stylex.create({
  positioner: { zIndex: tokens.zIndexOverlay, maxWidth: "var(--available-width)" },
  popup: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: 6,
    fontSize: 14,
    minWidth: { default: 0, "@media (min-width: 768px)": 220 },
    maxWidth: "48svw",
    maxHeight: "var(--available-height)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    scrollPaddingBlock: 4,
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    borderRadius: "min(32px, var(--radius-3xl))",
    boxShadow: tokens.shadowOverlay,
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
});
