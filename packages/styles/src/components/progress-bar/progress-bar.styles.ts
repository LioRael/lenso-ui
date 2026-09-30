// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const indeterminate = stylex.keyframes({
  "0%": { transform: "translateX(-100%)" },
  "100%": { transform: "translateX(350%)" },
});
export const progressBarStyles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    gap: 4,
    gridTemplateAreas: '"label output" "track track"',
    gridTemplateColumns: "1fr auto",
    "--progress-bar-fill": tokens.accent,
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
  label: {
    gridArea: "label",
    width: "fit-content",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
  },
  output: {
    gridArea: "output",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    gridArea: "track",
    position: "relative",
    overflow: "hidden",
    borderRadius: tokens.radiusSm,
    backgroundColor: tokens.default,
    height: 8,
  },
  fill: {
    position: "absolute",
    insetInlineStart: 0,
    top: 0,
    height: "100%",
    borderRadius: tokens.radiusSm,
    backgroundColor: "var(--progress-bar-fill)",
    transitionProperty: { default: "width", "@media (prefers-reduced-motion: reduce)": "none" },
    transitionDuration: "300ms",
    transitionTimingFunction: tokens.easeOut,
  },
  indeterminate: {
    width: "40%",
    animationName: { default: indeterminate, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "1.5s",
    animationTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
    animationIterationCount: "infinite",
  },
});
export const progressBarTrackSizes = stylex.create({
  sm: { height: 4, borderRadius: tokens.radiusXs },
  md: {},
  lg: { height: 12, borderRadius: tokens.radiusMd },
});
export const progressBarFillSizes = stylex.create({
  sm: { borderRadius: tokens.radiusXs },
  md: {},
  lg: { borderRadius: tokens.radiusMd },
});
export const progressBarColors = stylex.create({
  default: { "--progress-bar-fill": tokens.defaultForeground },
  accent: { "--progress-bar-fill": tokens.accent },
  success: { "--progress-bar-fill": tokens.success },
  warning: { "--progress-bar-fill": tokens.warning },
  danger: { "--progress-bar-fill": tokens.danger },
});
