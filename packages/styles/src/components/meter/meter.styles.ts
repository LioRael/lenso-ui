// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const meterStyles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    gap: 4,
    gridTemplateAreas: '"label output" "track track"',
    gridTemplateColumns: "1fr auto",
    "--meter-fill": tokens.accent,
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
    backgroundColor: "var(--meter-fill)",
    transitionProperty: { default: "width", "@media (prefers-reduced-motion: reduce)": "none" },
    transitionDuration: "300ms",
    transitionTimingFunction: tokens.easeOut,
  },
});
export const meterTrackSizes = stylex.create({
  sm: { height: 4, borderRadius: tokens.radiusXs },
  md: {},
  lg: { height: 12, borderRadius: tokens.radiusMd },
});
export const meterFillSizes = stylex.create({
  sm: { borderRadius: tokens.radiusXs },
  md: {},
  lg: { borderRadius: tokens.radiusMd },
});
export const meterColors = stylex.create({
  default: { "--meter-fill": tokens.defaultForeground },
  accent: { "--meter-fill": tokens.accent },
  success: { "--meter-fill": tokens.success },
  warning: { "--meter-fill": tokens.warning },
  danger: { "--meter-fill": tokens.danger },
});
