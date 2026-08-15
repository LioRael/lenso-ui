import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
});

export const stateLayer = stylex.defineVars({
  background: "transparent",
  border: "transparent",
});

export const styles = stylex.create({
  root: {
    [stateLayer.background]: {
      default: null,
      ":active": tokens.colorInteractionPressedOverlay,
      '[data-visual-state="pressed"]': tokens.colorInteractionPressedOverlay,
    },
    [stateLayer.border]: {
      default: null,
      ":focus-visible": tokens.colorFocusRing,
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    alignItems: "center",
    borderStyle: "none",
    borderWidth: 0,
    boxSizing: "border-box",
    cursor: {
      default: "pointer",
      ":disabled": "default",
      '[data-visual-state="disabled"]': "default",
    },
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: tokens.fontButton,
    fontWeight: 500,
    gap: tokens.space2,
    justifyContent: "center",
    lineHeight: "normal",
    outline: "none",
    opacity: {
      default: tokens.opacityEnabled,
      ":disabled": tokens.opacityDisabled,
      "[data-loading]": tokens.opacityEnabled,
      '[data-visual-state="disabled"]': tokens.opacityDisabled,
    },
    position: "relative",
    transitionDuration: "120ms",
    transitionProperty: "background-color, border-color, color, opacity",
    transitionTimingFunction: "ease-out",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  compact: {
    fontSize: "11px",
    height: tokens.sizeControlCompact,
    paddingInline: tokens.space3,
  },
  default: {
    fontSize: "12px",
    height: tokens.sizeControlDefault,
    paddingInline: tokens.space3,
  },
  rounded: { borderRadius: tokens.radiusRounded },
  primary: {
    backgroundColor: {
      default: tokens.colorActionPrimary,
      ":hover": tokens.colorActionPrimaryHover,
      ":active": tokens.colorActionPrimaryHover,
      ":disabled": tokens.colorActionPrimary,
      "[data-loading]": tokens.colorActionPrimary,
      '[data-visual-state="hover"]': tokens.colorActionPrimaryHover,
      '[data-visual-state="pressed"]': tokens.colorActionPrimaryHover,
    },
    boxShadow: "inset 0 0 0 0.5px var(--color-border-transparent, transparent)",
    color: tokens.colorActionPrimaryContent,
  },
  secondary: {
    backgroundColor: {
      default: tokens.colorSurfaceTranslucent,
      ":hover": tokens.colorSurfaceLevel3,
      ":active": tokens.colorSurfaceLevel3,
      ":disabled": tokens.colorSurfaceTranslucent,
      "[data-loading]": tokens.colorSurfaceTranslucent,
      '[data-visual-state="hover"]': tokens.colorSurfaceLevel3,
      '[data-visual-state="pressed"]': tokens.colorSurfaceLevel3,
    },
    boxShadow: "inset 0 0 0 0.5px var(--color-border-translucent, rgba(0, 0, 0, 0.08))",
    color: tokens.colorContentPrimary,
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSurfaceQuaternary,
      ":active": tokens.colorSurfaceQuaternary,
      ":disabled": "transparent",
      "[data-loading]": "transparent",
      '[data-visual-state="hover"]': tokens.colorSurfaceQuaternary,
      '[data-visual-state="pressed"]': tokens.colorSurfaceQuaternary,
    },
    boxShadow: "inset 0 0 0 0.5px var(--color-border-transparent, transparent)",
    color: tokens.colorContentTertiary,
  },
  danger: {
    backgroundColor: {
      default: tokens.colorActionDanger,
      ":hover": tokens.colorActionDangerHover,
      ":active": tokens.colorActionDangerHover,
      ":disabled": tokens.colorActionDanger,
      "[data-loading]": tokens.colorActionDanger,
      '[data-visual-state="hover"]': tokens.colorActionDangerHover,
      '[data-visual-state="pressed"]': tokens.colorActionDangerHover,
    },
    boxShadow: "inset 0 0 0 0.5px var(--color-border-transparent, transparent)",
    color: tokens.colorContentInverse,
  },
  spinner: {
    animationDuration: "650ms",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    display: "block",
    fill: "none",
    flexShrink: 0,
    height: "10px",
    transformBox: "fill-box",
    transformOrigin: "center",
    width: "10px",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "1.5s",
    },
  },
  stateLayer: {
    backgroundColor: stateLayer.background,
    borderColor: stateLayer.border,
    borderRadius: "inherit",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
});
