// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const avatarStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: tokens.shapeContent3xl,
    backgroundColor: tokens.controlFill,
    "--avatar-size": "2.5rem",
  },
  fallback: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.controlFill,
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
  },
  image: {
    position: "absolute",
    inset: 0,
    aspectRatio: "1",
    width: "100%",
    height: "100%",
    transitionProperty: "opacity",
    transitionDuration: { default: "250ms", "@media (prefers-reduced-motion: reduce)": "0s" },
  },
  soft: { backgroundColor: "transparent" },
  clippedFallback: {
    boxSizing: "border-box",
    paddingInlineEnd: "calc(var(--avatar-group-overlap, 0.5rem) * 0.35)",
  },
});
export const avatarSizes = stylex.create({
  sm: { width: 32, height: 32, borderRadius: tokens.shapeContent2xl, "--avatar-size": "2rem" },
  md: {},
  lg: { width: 48, height: 48, borderRadius: tokens.shapeContent3xl, "--avatar-size": "3rem" },
});
export const avatarFallbackSizes = stylex.create({
  sm: { fontSize: 12, lineHeight: "16px" },
  md: {},
  lg: { fontSize: 16, lineHeight: "24px" },
});
export const avatarColors = stylex.create({
  default: { color: tokens.labelPrimary },
  accent: { color: tokens.tintText },
  success: { color: tokens.statusSuccessText },
  warning: { color: tokens.statusWarningText },
  danger: { color: tokens.statusErrorText },
});
export const avatarSoft = stylex.create({
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
