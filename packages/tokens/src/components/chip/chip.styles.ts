// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const chipStyles = stylex.create({
  root: {
    display: "inline-flex",
    width: "fit-content",
    flexShrink: 0,
    alignItems: "center",
    gap: 2,
    borderRadius: tokens.shapeContent2xl,
    paddingInline: 8,
    paddingBlock: 2,
    fontSize: 12,
    lineHeight: "20px",
    fontWeight: 500,
    backgroundColor: tokens.controlFill,
  },
  label: { paddingInline: 2 },
});
export const chipSizes = stylex.create({
  sm: { paddingInline: 4, paddingBlock: 0 },
  md: {},
  lg: { paddingInline: 12, paddingBlock: 4, fontSize: 14 },
});
export const chipColors = stylex.create({
  default: { color: tokens.labelPrimary },
  accent: { color: tokens.tintText },
  success: { color: tokens.statusSuccessText },
  warning: { color: tokens.statusWarningText },
  danger: { color: tokens.statusErrorText },
});
export const chipPrimary = stylex.create({
  default: { backgroundColor: tokens.controlFill, color: tokens.labelPrimary },
  accent: { backgroundColor: tokens.tint, color: tokens.labelOnTint },
  success: { backgroundColor: tokens.statusSuccessFill, color: tokens.statusSuccessOnFill },
  warning: { backgroundColor: tokens.statusWarningFill, color: tokens.statusWarningOnFill },
  danger: { backgroundColor: tokens.statusErrorFill, color: tokens.statusErrorOnFill },
});
export const chipSoft = stylex.create({
  default: { backgroundColor: tokens.controlSubtleFill, color: tokens.labelPrimary },
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
export const chipVariants = stylex.create({ tertiary: { backgroundColor: "transparent" } });
