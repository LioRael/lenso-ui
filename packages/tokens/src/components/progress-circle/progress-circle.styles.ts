// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const spin = stylex.keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
});
export const progressCircleStyles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    "--progress-circle-stroke": tokens.tint,
    opacity: {
      default: 1,
      ':is([aria-disabled="true"], [data-disabled="true"])': 0.5,
    },
    cursor: {
      default: "auto",
      ':is([aria-disabled="true"], [data-disabled="true"])': tokens.cursorDisabled,
    },
    pointerEvents: {
      default: "auto",
      ':is([aria-disabled="true"], [data-disabled="true"])': "none",
    },
  },
  track: { width: 28, height: 28 },
  trackCircle: { stroke: tokens.controlFill },
  fillCircle: {
    stroke: "var(--progress-circle-stroke)",
    transitionProperty: {
      default: "stroke-dashoffset",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    transitionDuration: "300ms",
    transitionTimingFunction: tokens.motionEaseOut,
  },
  indeterminate: {
    animationName: { default: spin, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
});
export const progressCircleSizes = stylex.create({
  sm: { width: 20, height: 20 },
  md: {},
  lg: { width: 36, height: 36 },
});
export const progressCircleColors = stylex.create({
  default: { "--progress-circle-stroke": tokens.labelPrimary },
  accent: { "--progress-circle-stroke": tokens.tint },
  success: { "--progress-circle-stroke": tokens.statusSuccessIndicator },
  warning: { "--progress-circle-stroke": tokens.statusWarningIndicator },
  danger: { "--progress-circle-stroke": tokens.statusErrorIndicator },
});
