// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
export { inputStyles as textAreaInputStyles } from "../input/input.styles.js";
export const textAreaStyles = stylex.create({
  textarea: {
    minHeight: 112,
    height: "auto",
    paddingBlock: 16,
    resize: "vertical",
    borderRadius: 26,
  },
  singleLine: { minHeight: 52, paddingBlock: 15 },
});
