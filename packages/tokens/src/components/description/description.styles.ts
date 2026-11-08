// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const descriptionStyles = stylex.create({
  description: {
    fontSize: 12,
    lineHeight: "16px",
    color: tokens.labelSecondary,
    overflowWrap: "break-word",
    display: {
      default: "block",
      ":is([data-slot='text-field'][data-invalid] *, [data-slot='search-field'][data-invalid] *, [data-slot='number-field'][data-invalid] *)":
        "none",
    },
  },
});
