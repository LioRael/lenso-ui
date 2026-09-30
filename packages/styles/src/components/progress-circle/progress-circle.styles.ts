// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
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
    "--progress-circle-stroke": tokens.accent,
    opacity: {
      default: 1,
      ':is([aria-disabled="true"], [data-disabled="true"])': tokens.disabledOpacity,
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
  trackCircle: { stroke: tokens.default },
  fillCircle: {
    stroke: "var(--progress-circle-stroke)",
    transitionProperty: {
      default: "stroke-dashoffset",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    transitionDuration: "300ms",
    transitionTimingFunction: tokens.easeOut,
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
  default: { "--progress-circle-stroke": tokens.defaultForeground },
  accent: { "--progress-circle-stroke": tokens.accent },
  success: { "--progress-circle-stroke": tokens.success },
  warning: { "--progress-circle-stroke": tokens.warning },
  danger: { "--progress-circle-stroke": tokens.danger },
});
