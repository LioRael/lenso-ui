// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
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
    borderRadius: tokens.radius3xl,
    fontSize: 12,
    lineHeight: 1.34,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tokens.background,
    backgroundClip: "padding-box",
    backgroundColor: tokens.default,
    color: tokens.defaultForeground,
  },
  label: { paddingInline: 2 },
  anchor: { position: "relative", display: "inline-flex", flexShrink: 0 },
});
export const badgeSizes = stylex.create({
  sm: { minHeight: 16, minWidth: 16, borderRadius: tokens.radiusXl, fontSize: 10 },
  md: {},
  lg: {
    minHeight: 32,
    minWidth: 32,
    borderRadius: tokens.radius2xl,
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
  default: { color: tokens.defaultForeground },
  accent: { color: tokens.accentSoftForeground },
  success: { color: tokens.successSoftForeground },
  warning: { color: tokens.warningSoftForeground },
  danger: { color: tokens.dangerSoftForeground },
});
export const badgePrimary = stylex.create({
  default: { backgroundColor: tokens.default, color: tokens.defaultForeground },
  accent: { backgroundColor: tokens.accent, color: tokens.accentForeground },
  success: { backgroundColor: tokens.success, color: tokens.successForeground },
  warning: { backgroundColor: tokens.warning, color: tokens.warningForeground },
  danger: { backgroundColor: tokens.danger, color: tokens.dangerForeground },
});
export const badgeSoft = stylex.create({
  default: { backgroundColor: tokens.defaultSoft, color: tokens.defaultSoftForeground },
  accent: { backgroundColor: tokens.accentSoft, color: tokens.accentSoftForeground },
  success: { backgroundColor: tokens.successSoft, color: tokens.successSoftForeground },
  warning: { backgroundColor: tokens.warningSoft, color: tokens.warningSoftForeground },
  danger: { backgroundColor: tokens.dangerSoft, color: tokens.dangerSoftForeground },
});
