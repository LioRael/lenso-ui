import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

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
    justifyContent: "center",
    outline: "none",
    opacity: {
      default: tokens.opacityEnabled,
      ":disabled": tokens.opacityDisabled,
      '[data-visual-state="disabled"]': tokens.opacityDisabled,
    },
    padding: 0,
    position: "relative",
    transitionDuration: "120ms",
    transitionProperty: "background-color, color, opacity",
    transitionTimingFunction: "ease-out",
  },
  compact: {
    height: tokens.sizeIconButtonCompact,
    width: tokens.sizeIconButtonCompact,
  },
  default: {
    height: tokens.sizeIconButtonDefault,
    width: tokens.sizeIconButtonDefault,
  },
  rounded: {
    borderRadius: tokens.radiusRounded,
  },
  secondary: {
    backgroundColor: {
      default: tokens.colorSurfaceTranslucent,
      ":hover": tokens.colorSurfaceLevel3,
      ":active": tokens.colorSurfaceLevel3,
      ":disabled": tokens.colorSurfaceTranslucent,
      '[data-selected="true"]': tokens.colorSurfaceTranslucent,
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
      '[data-selected="true"]': tokens.colorSurfaceTranslucent,
      '[data-visual-state="hover"]': tokens.colorSurfaceQuaternary,
      '[data-visual-state="pressed"]': tokens.colorSurfaceQuaternary,
    },
    boxShadow: "inset 0 0 0 0.5px var(--color-border-transparent, transparent)",
    color: tokens.colorContentTertiary,
  },
  icon: {
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    height: tokens.sizeIconDefault,
    justifyContent: "center",
    pointerEvents: "none",
    width: tokens.sizeIconDefault,
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
