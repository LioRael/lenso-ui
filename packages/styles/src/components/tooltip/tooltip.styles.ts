// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const tooltipStyles = stylex.create({
  trigger: {
    display: "inline-block",
    outline: "none",
    transitionProperty: "color, background-color, box-shadow",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
  },
  positioner: { zIndex: tokens.zIndexOverlay, maxWidth: "var(--available-width)" },
  popup: {
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    boxShadow: tokens.shadowOverlay,
    borderRadius: "min(32px, var(--radius-xl))",
    padding: 8,
    maxWidth: 320,
    wordBreak: "break-all",
    fontSize: 12,
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
  arrow: {
    width: 12,
    height: 12,
    fill: tokens.overlay,
    stroke: "color-mix(in oklab, var(--border) 40%, transparent)",
    bottom: {
      default: -12,
      ':is([data-side="bottom"],[data-side="left"],[data-side="right"])': "auto",
    },
    top: { default: "auto", ':is([data-side="bottom"])': -12 },
    right: { default: "auto", ':is([data-side="left"])': -12 },
    left: { default: "auto", ':is([data-side="right"])': -12 },
    rotate: {
      default: "0deg",
      ':is([data-side="bottom"])': "180deg",
      ':is([data-side="left"])': "-90deg",
      ':is([data-side="right"])': "90deg",
    },
  },
});
