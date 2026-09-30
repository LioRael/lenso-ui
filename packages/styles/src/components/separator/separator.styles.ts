// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const separatorStyles = stylex.create({
  root: {
    borderWidth: 0,
    backgroundColor: tokens.separator,
    flexShrink: 0,
    borderRadius: tokens.radiusSm,
  },
  horizontal: { width: "100%", height: 1 },
  vertical: { width: 1, height: "auto", minHeight: 8, alignSelf: "stretch" },
});
export const separatorVariants = stylex.create({
  default: { backgroundColor: tokens.separator },
  secondary: { backgroundColor: tokens.separatorSecondary },
  tertiary: { backgroundColor: tokens.separatorTertiary },
});
