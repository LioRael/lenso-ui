// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const popoverStyles = stylex.create({
  trigger: {
    display: "inline-block",
    cursor: tokens.cursorInteractive,
    outline: "none",
    transitionProperty: "color, background-color, box-shadow",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
    opacity: {
      default: 1,
      ":disabled": tokens.disabledOpacity,
      ':is([aria-disabled="true"])': tokens.disabledOpacity,
    },
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
  },
  positioner: { zIndex: tokens.zIndexOverlay, maxWidth: "var(--available-width)" },
  popup: {
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    borderRadius: "min(32px, var(--radius-3xl))",
    boxShadow: tokens.shadowOverlay,
    padding: 16,
    fontSize: 14,
    lineHeight: "20px",
    outline: "none",
    maxHeight: "var(--available-height)",
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
      ':is([data-starting-style]):is([data-side="left"],[data-side="inline-start"][data-direction="ltr"],[data-side="inline-end"][data-direction="rtl"])':
        "4px 0",
      ':is([data-starting-style]):is([data-side="right"],[data-side="inline-end"][data-direction="ltr"],[data-side="inline-start"][data-direction="rtl"])':
        "-4px 0",
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
  title: { fontSize: 14, fontWeight: 500, margin: 0 },
  description: { fontSize: 14, color: tokens.muted, margin: 0 },
  arrow: {
    display: "flex",
    width: 12,
    height: 12,
    fill: tokens.overlay,
    bottom: {
      default: -12,
      ':is([data-side="bottom"],[data-side="left"],[data-side="right"],[data-side="inline-start"],[data-side="inline-end"])':
        "auto",
    },
    top: { default: "auto", ':is([data-side="bottom"])': -12 },
    right: {
      default: "auto",
      ':is([data-side="left"],[data-side="inline-start"][data-direction="ltr"],[data-side="inline-end"][data-direction="rtl"])':
        -12,
    },
    left: {
      default: "auto",
      ':is([data-side="right"],[data-side="inline-end"][data-direction="ltr"],[data-side="inline-start"][data-direction="rtl"])':
        -12,
    },
    rotate: {
      default: "0deg",
      ':is([data-side="bottom"])': "180deg",
      ':is([data-side="left"],[data-side="inline-start"][data-direction="ltr"],[data-side="inline-end"][data-direction="rtl"])':
        "-90deg",
      ':is([data-side="right"],[data-side="inline-end"][data-direction="ltr"],[data-side="inline-start"][data-direction="rtl"])':
        "90deg",
    },
  },
});
