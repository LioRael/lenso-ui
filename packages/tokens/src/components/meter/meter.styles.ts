// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const meterStyles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    gap: 4,
    gridTemplateAreas: '"label output" "track track"',
    gridTemplateColumns: "1fr auto",
    "--meter-fill": tokens.tint,
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
    borderRadius: tokens.shapeContentSm,
    backgroundColor: tokens.controlFill,
    height: 8,
  },
  fill: {
    position: "absolute",
    insetInlineStart: 0,
    top: 0,
    height: "100%",
    borderRadius: tokens.shapeContentSm,
    backgroundColor: "var(--meter-fill)",
    transitionProperty: { default: "width", "@media (prefers-reduced-motion: reduce)": "none" },
    transitionDuration: "300ms",
    transitionTimingFunction: tokens.motionEaseOut,
  },
});
export const meterTrackSizes = stylex.create({
  sm: { height: 4, borderRadius: tokens.shapeContentXs },
  md: {},
  lg: { height: 12, borderRadius: tokens.shapeContentMd },
});
export const meterFillSizes = stylex.create({
  sm: { borderRadius: tokens.shapeContentXs },
  md: {},
  lg: { borderRadius: tokens.shapeContentMd },
});
export const meterColors = stylex.create({
  default: { "--meter-fill": tokens.labelPrimary },
  accent: { "--meter-fill": tokens.tint },
  success: { "--meter-fill": tokens.statusSuccessIndicator },
  warning: { "--meter-fill": tokens.statusWarningIndicator },
  danger: { "--meter-fill": tokens.statusErrorIndicator },
});
