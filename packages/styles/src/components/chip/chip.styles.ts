// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const chipStyles = stylex.create({
  root: {
    display: "inline-flex",
    width: "fit-content",
    flexShrink: 0,
    alignItems: "center",
    gap: 2,
    borderRadius: tokens.radius2xl,
    paddingInline: 8,
    paddingBlock: 2,
    fontSize: 12,
    lineHeight: "20px",
    fontWeight: 500,
    backgroundColor: tokens.default,
  },
  label: { paddingInline: 2 },
});
export const chipSizes = stylex.create({
  sm: { paddingInline: 4, paddingBlock: 0 },
  md: {},
  lg: { paddingInline: 12, paddingBlock: 4, fontSize: 14 },
});
export const chipColors = stylex.create({
  default: { color: tokens.defaultForeground },
  accent: { color: tokens.accentSoftForeground },
  success: { color: tokens.successSoftForeground },
  warning: { color: tokens.warningSoftForeground },
  danger: { color: tokens.dangerSoftForeground },
});
export const chipPrimary = stylex.create({
  default: { backgroundColor: tokens.default, color: tokens.defaultForeground },
  accent: { backgroundColor: tokens.accent, color: tokens.accentForeground },
  success: { backgroundColor: tokens.success, color: tokens.successForeground },
  warning: { backgroundColor: tokens.warning, color: tokens.warningForeground },
  danger: { backgroundColor: tokens.danger, color: tokens.dangerForeground },
});
export const chipSoft = stylex.create({
  default: { backgroundColor: tokens.defaultSoft, color: tokens.defaultSoftForeground },
  accent: { backgroundColor: tokens.accentSoft, color: tokens.accentSoftForeground },
  success: { backgroundColor: tokens.successSoft, color: tokens.successSoftForeground },
  warning: { backgroundColor: tokens.warningSoft, color: tokens.warningSoftForeground },
  danger: { backgroundColor: tokens.dangerSoft, color: tokens.dangerSoftForeground },
});
export const chipVariants = stylex.create({ tertiary: { backgroundColor: "transparent" } });
