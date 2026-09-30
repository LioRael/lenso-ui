// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
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
    borderRadius: tokens.radius3xl,
    backgroundColor: tokens.default,
    "--avatar-size": "2.5rem",
  },
  fallback: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.default,
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
  sm: { width: 32, height: 32, borderRadius: tokens.radius2xl, "--avatar-size": "2rem" },
  md: {},
  lg: { width: 48, height: 48, borderRadius: tokens.radius3xl, "--avatar-size": "3rem" },
});
export const avatarFallbackSizes = stylex.create({
  sm: { fontSize: 12, lineHeight: "16px" },
  md: {},
  lg: { fontSize: 16, lineHeight: "24px" },
});
export const avatarColors = stylex.create({
  default: { color: tokens.defaultSoftForeground },
  accent: { color: tokens.accentSoftForeground },
  success: { color: tokens.successSoftForeground },
  warning: { color: tokens.warningSoftForeground },
  danger: { color: tokens.dangerSoftForeground },
});
export const avatarSoft = stylex.create({
  default: { backgroundColor: tokens.defaultSoft, color: tokens.defaultSoftForeground },
  accent: { backgroundColor: tokens.accentSoft, color: tokens.accentSoftForeground },
  success: { backgroundColor: tokens.successSoft, color: tokens.successSoftForeground },
  warning: { backgroundColor: tokens.warningSoft, color: tokens.warningSoftForeground },
  danger: { backgroundColor: tokens.dangerSoft, color: tokens.dangerSoftForeground },
});
