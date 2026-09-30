// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const cardStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflow: "visible",
    padding: 16,
    boxShadow: tokens.shadowSurface,
    borderRadius: `min(32px, ${tokens.radius3xl})`,
  },
  header: { display: "flex", flexDirection: "column" },
  title: { fontSize: 14, lineHeight: "24px", fontWeight: 500, color: tokens.foreground },
  description: { fontSize: 14, lineHeight: "20px", color: tokens.muted },
  content: { display: "flex", flex: 1, flexDirection: "column", gap: 4 },
  footer: { display: "flex", flexDirection: "row", alignItems: "center" },
});
export const cardVariants = stylex.create({
  default: { backgroundColor: tokens.surface },
  secondary: { backgroundColor: tokens.surfaceSecondary },
  tertiary: { backgroundColor: tokens.surfaceTertiary },
  transparent: { backgroundColor: "transparent", borderWidth: 0, boxShadow: "none" },
});
