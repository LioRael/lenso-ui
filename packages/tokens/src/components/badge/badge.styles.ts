// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const badgeStyles = stylex.create({
  root: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    fontWeight: 500,
    minHeight: 28,
    minWidth: 28,
    borderRadius: tokens.shapeContent3xl,
    fontSize: 12,
    lineHeight: 1.34,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    backgroundClip: "padding-box",
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
  },
  label: { paddingInline: 2 },
  anchor: { position: "relative", display: "inline-flex", flexShrink: 0 },
});
export const badgeSizes = stylex.create({
  sm: { minHeight: 16, minWidth: 16, borderRadius: tokens.shapeContentXl, fontSize: 10 },
  md: {},
  lg: {
    minHeight: 32,
    minWidth: 32,
    borderRadius: tokens.shapeContent2xl,
    fontSize: 14,
    lineHeight: 1.43,
  },
});
export const badgePlacements = stylex.create({
  "top-right": { position: "absolute", top: 0, right: 0, transform: "translate(25%, -25%)" },
  "top-left": { position: "absolute", top: 0, left: 0, transform: "translate(-25%, -25%)" },
  "bottom-right": { position: "absolute", bottom: 0, right: 0, transform: "translate(25%, 25%)" },
  "bottom-left": { position: "absolute", bottom: 0, left: 0, transform: "translate(-25%, 25%)" },
});
export const badgeColors = stylex.create({
  default: { color: tokens.labelPrimary },
  accent: { color: tokens.tintText },
  success: { color: tokens.statusSuccessText },
  warning: { color: tokens.statusWarningText },
  danger: { color: tokens.statusErrorText },
});
export const badgePrimary = stylex.create({
  default: { backgroundColor: "transparent", color: tokens.labelPrimary },
  accent: { backgroundColor: tokens.controlTintSubtleFill, color: tokens.tintText },
  success: {
    backgroundColor: tokens.controlStatusSuccessSoftFill,
    color: tokens.statusSuccessText,
  },
  warning: {
    backgroundColor: tokens.controlStatusWarningSoftFill,
    color: tokens.statusWarningText,
  },
  danger: { backgroundColor: tokens.controlStatusErrorSoftFill, color: tokens.statusErrorText },
});
export const badgeSoft = stylex.create({
  default: { backgroundColor: "transparent", color: tokens.labelPrimary },
  accent: { backgroundColor: tokens.controlTintSubtleFill, color: tokens.tintText },
  success: {
    backgroundColor: tokens.controlStatusSuccessSoftFill,
    color: tokens.statusSuccessText,
  },
  warning: {
    backgroundColor: tokens.controlStatusWarningSoftFill,
    color: tokens.statusWarningText,
  },
  danger: { backgroundColor: tokens.controlStatusErrorSoftFill, color: tokens.statusErrorText },
});
