import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

const spin = stylex.keyframes({
  to: { transform: "rotate(360deg)" },
});

export const styles = stylex.create({
  root: {
    alignItems: "center",
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxSizing: "border-box",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: tokens.fontButton,
    fontWeight: 500,
    gap: tokens.space2,
    justifyContent: "center",
    lineHeight: 1,
    outlineColor: {
      default: "transparent",
      ":focus-visible": tokens.colorFocusRing,
    },
    outlineOffset: "1px",
    outlineStyle: "solid",
    outlineWidth: {
      default: 0,
      ":focus-visible": "1px",
    },
    opacity: {
      default: tokens.opacityEnabled,
      ":disabled": tokens.opacityDisabled,
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
    },
    borderColor: tokens.colorBorderTransparent,
    color: tokens.colorActionPrimaryContent,
  },
  secondary: {
    backgroundColor: {
      default: tokens.colorSurfaceTranslucent,
      ":hover": tokens.colorSurfaceLevel3,
      ":active": tokens.colorSurfaceLevel3,
    },
    borderColor: tokens.colorBorderTranslucent,
    color: tokens.colorContentPrimary,
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSurfaceQuaternary,
      ":active": tokens.colorSurfaceQuaternary,
    },
    borderColor: tokens.colorBorderTransparent,
    color: tokens.colorContentTertiary,
  },
  danger: {
    backgroundColor: {
      default: tokens.colorActionDanger,
      ":hover": tokens.colorActionDangerHover,
      ":active": tokens.colorActionDangerHover,
    },
    borderColor: tokens.colorBorderTransparent,
    color: tokens.colorContentInverse,
  },
  spinner: {
    animationDuration: "650ms",
    animationIterationCount: "infinite",
    animationName: spin,
    animationTimingFunction: "linear",
    borderColor: "currentColor",
    borderRightColor: "transparent",
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    height: "10px",
    width: "10px",
    "@media (prefers-reduced-motion: reduce)": {
      animationDuration: "1.5s",
    },
  },
});
