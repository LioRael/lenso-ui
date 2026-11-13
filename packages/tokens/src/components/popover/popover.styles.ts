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
    transitionTimingFunction: tokens.motionEaseSmooth,
    opacity: {
      default: 1,
      ":disabled": 0.5,
      ':is([aria-disabled="true"])': 0.5,
    },
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
  },
  positioner: { zIndex: tokens.zIndexOverlay, maxWidth: "var(--available-width)" },
  popup: {
    position: "fixed",
    overflow: "visible",
    visibility: {
      default: null,
      ":is([popover]:not(:popover-open),[data-closed]:not([data-ending-style]))": "hidden",
    },
    borderWidth: 0,
    margin: 0,
    backgroundColor: "transparent",
    "--material-blur": "65px",
    color: tokens.labelPrimary,
    borderRadius: 38,
    boxShadow: "0 10px 100px rgb(0 0 0 / .3)",
    padding: 24,
    fontSize: 17,
    lineHeight: "22px",
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
      ':is([data-starting-style]):is([data-side="left"])': "4px 0",
      ':is([data-starting-style]):is([data-side="right"])': "-4px 0",
    },
    pointerEvents: { default: "auto", ":is([data-ending-style])": "none" },
    transitionProperty: "opacity, transform, translate",
    transitionTimingFunction: tokens.motionEaseSmooth,
    transitionDuration: {
      default: "150ms",
      ":is([data-ending-style])": "100ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
  },
  title: { fontSize: 17, lineHeight: "22px", fontWeight: 600, margin: 0 },
  description: { fontSize: 17, lineHeight: "22px", color: tokens.labelSecondary, margin: 0 },
  arrow: {
    width: {
      default: 56,
      ':is([data-side="left"],[data-side="right"])': 13,
    },
    height: {
      default: 13,
      ':is([data-side="left"],[data-side="right"])': 56,
    },
    bottom: {
      default: -12,
      ':is([data-side="bottom"],[data-side="left"],[data-side="right"])': "auto",
    },
    top: { default: "auto", ':is([data-side="bottom"])': -12 },
    right: {
      default: "auto",
      ':is([data-side="left"])': -12,
    },
    left: {
      default: "auto",
      ':is([data-side="right"])': -12,
    },
    "--popover-arrow-rotate": {
      default: "0deg",
      ':is([data-side="bottom"])': "180deg",
      ':is([data-side="left"])': "-90deg",
      ':is([data-side="right"])': "90deg",
    },
    "--popover-arrow-left": {
      default: "0px",
      ':is([data-side="bottom"])': "56px",
      ':is([data-side="right"])': "13px",
    },
    "--popover-arrow-top": {
      default: "0px",
      ':is([data-side="bottom"])': "13px",
      ':is([data-side="left"])': "56px",
    },
  },
  arrowMaterial: {
    position: "absolute",
    width: 56,
    height: 13,
    borderRadius: 0,
    left: "var(--popover-arrow-left)",
    top: "var(--popover-arrow-top)",
    rotate: "var(--popover-arrow-rotate)",
    transformOrigin: "0 0",
  },
});
