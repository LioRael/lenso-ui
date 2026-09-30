// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const surfaceStyles = stylex.create({
  root: { position: "relative", color: tokens.foreground },
});
export const surfaceVariants = stylex.create({
  default: { backgroundColor: tokens.surface, color: tokens.surfaceForeground },
  secondary: { backgroundColor: tokens.surfaceSecondary, color: tokens.surfaceSecondaryForeground },
  tertiary: { backgroundColor: tokens.surfaceTertiary, color: tokens.surfaceTertiaryForeground },
  transparent: { backgroundColor: "transparent" },
});
