// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const kbdStyles = stylex.create({
  root: {
    display: "inline-flex",
    height: 24,
    alignItems: "center",
    gap: 2,
    borderRadius: tokens.radiusLg,
    backgroundColor: tokens.default,
    paddingInline: 8,
    textAlign: "center",
    fontFamily: tokens.fontSans,
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    color: tokens.muted,
    wordSpacing: "-0.25rem",
  },
  abbr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    textDecoration: "none",
  },
  content: { display: "flex", justifyContent: "center", alignItems: "center" },
  light: { backgroundColor: "transparent" },
});
