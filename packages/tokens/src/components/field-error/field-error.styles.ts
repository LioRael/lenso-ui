// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const fieldErrorStyles = stylex.create({
  error: {
    paddingInline: 4,
    fontSize: 12,
    lineHeight: "16px",
    color: tokens.statusErrorText,
    overflowWrap: "break-word",
  },
});
