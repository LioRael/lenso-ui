// HeroUI v3.2.6, Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const errorMessageStyles = stylex.create({
  error: { fontSize: 12, lineHeight: "16px", color: tokens.danger, overflowWrap: "break-word" },
});
