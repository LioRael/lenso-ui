// HeroUI v3.2.6, Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const fieldErrorStyles = stylex.create({
  error: {
    paddingInline: 4,
    fontSize: 12,
    lineHeight: "16px",
    color: tokens.danger,
    overflowWrap: "break-word",
  },
});
