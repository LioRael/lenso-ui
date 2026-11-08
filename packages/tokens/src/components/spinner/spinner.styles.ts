// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });
export const spinnerStyles = stylex.create({
  root: {
    pointerEvents: "none",
    display: "inline-flex",
    width: 30,
    height: 30,
    flexShrink: 0,
    animationName: { default: spin, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "1s",
    animationTimingFunction: "steps(8, end)",
    animationIterationCount: "infinite",
  },
  icon: { width: "100%", height: "100%" },
});
export const spinnerSizes = stylex.create({
  sm: { width: 22, height: 22 },
  md: {},
  lg: { width: 32, height: 32 },
  xl: { width: 40, height: 40 },
});
export const spinnerColors = stylex.create({
  secondary: { color: tokens.labelSecondary },
  current: { color: "inherit" },
  accent: { color: tokens.tint },
  success: { color: tokens.statusSuccessText },
  warning: { color: tokens.statusWarningText },
  danger: { color: tokens.statusErrorText },
});
