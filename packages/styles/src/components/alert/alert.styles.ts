// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const alertStyles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 16,
    backgroundColor: tokens.surface,
    paddingInline: 16,
    paddingBlock: 12,
    boxShadow: tokens.shadowSurface,
    borderRadius: `min(32px, ${tokens.radius3xl})`,
  },
  content: {
    display: "flex",
    height: "100%",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  indicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    userSelect: "none",
  },
  icon: { width: 16, height: 16, boxSizing: "content-box" },
  title: { fontSize: 14, lineHeight: "24px", fontWeight: 500 },
  description: { fontSize: 14, lineHeight: "20px", color: tokens.muted },
});
export const alertColors = stylex.create({
  default: { color: tokens.foreground },
  accent: { color: tokens.accentSoftForeground },
  success: { color: tokens.successSoftForeground },
  warning: { color: tokens.warningSoftForeground },
  danger: { color: tokens.dangerSoftForeground },
});
