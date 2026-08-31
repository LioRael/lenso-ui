import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const sliderState = stylex.defineVars({
  thumbColor: tokens.colorActionPrimary,
  thumbRing: "transparent",
});

export const styles = stylex.create({
  root: {
    [sliderState.thumbColor]: {
      default: tokens.colorActionPrimary,
      ":hover": tokens.colorActionPrimaryHover,
      "[data-dragging]": tokens.colorActionPrimaryHover,
      '[data-visual-state="hover"]': tokens.colorActionPrimaryHover,
      '[data-visual-state="pressed"]': tokens.colorActionPrimaryHover,
    },
    [sliderState.thumbRing]: {
      default: "transparent",
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    boxSizing: "border-box",
    opacity: { default: 1, "[data-disabled]": tokens.opacityDisabled },
    touchAction: "none",
    userSelect: "none",
    width: "100%",
  },
  control: {
    alignItems: "center",
    boxSizing: "border-box",
    cursor: { default: "pointer", "[data-disabled]": "default" },
    display: "flex",
    height: "28px",
    touchAction: "none",
    userSelect: "none",
    width: "100%",
  },
  track: {
    backgroundColor: tokens.colorBorderControl,
    borderRadius: tokens.radiusRounded,
    height: "2px",
    position: "relative",
    userSelect: "none",
    width: "100%",
    "@media (forced-colors: active)": {
      backgroundColor: "GrayText",
      forcedColorAdjust: "none",
    },
  },
  indicator: {
    backgroundColor: tokens.colorActionPrimary,
    borderRadius: tokens.radiusRounded,
    userSelect: "none",
    "@media (forced-colors: active)": {
      backgroundColor: "CanvasText",
      forcedColorAdjust: "none",
    },
  },
  thumb: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: tokens.radiusRounded,
    boxSizing: "border-box",
    display: "flex",
    height: "28px",
    justifyContent: "center",
    outline: "none",
    userSelect: "none",
    width: "28px",
    "::before": {
      backgroundColor: sliderState.thumbColor,
      borderRadius: tokens.radiusRounded,
      content: "''",
      height: "14px",
      pointerEvents: "none",
      transitionDuration: "80ms",
      transitionProperty: "background-color",
      transitionTimingFunction: "ease-out",
      width: "14px",
      "@media (forced-colors: active)": {
        backgroundColor: "CanvasText",
      },
    },
    "::after": {
      borderColor: sliderState.thumbRing,
      borderRadius: tokens.radiusRounded,
      borderStyle: "solid",
      borderWidth: "2px",
      boxSizing: "border-box",
      content: "''",
      height: "20px",
      pointerEvents: "none",
      position: "absolute",
      width: "20px",
    },
    ":has(input:focus-visible)": {
      [sliderState.thumbRing]: {
        default: tokens.colorFocusRing,
        "@media (forced-colors: active)": "Highlight",
      },
    },
    "@media (forced-colors: active)": {
      forcedColorAdjust: "none",
    },
  },
});
