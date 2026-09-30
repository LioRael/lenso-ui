// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });
export const spinnerStyles = stylex.create({
  root: {
    pointerEvents: "none",
    display: "inline-flex",
    width: 24,
    height: 24,
    flexShrink: 0,
    animationName: { default: spin, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "750ms",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  icon: { width: "100%", height: "100%" },
});
export const spinnerSizes = stylex.create({
  sm: { width: 16, height: 16 },
  md: {},
  lg: { width: 32, height: 32 },
  xl: { width: 40, height: 40 },
});
export const spinnerColors = stylex.create({
  current: { color: "inherit" },
  accent: { color: tokens.accent },
  success: { color: tokens.success },
  warning: { color: tokens.warning },
  danger: { color: tokens.danger },
});
