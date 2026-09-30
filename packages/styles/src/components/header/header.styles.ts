// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const headerStyles = stylex.create({
  root: {
    width: "100%",
    paddingInline: 8,
    paddingTop: 6,
    paddingBottom: 4,
    textAlign: "start",
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 500,
    color: tokens.muted,
  },
});
