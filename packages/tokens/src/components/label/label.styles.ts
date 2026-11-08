// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const labelStyles = stylex.create({
  label: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: {
      default: tokens.labelPrimary,
      "[data-invalid]": tokens.statusErrorText,
      ":is([data-invalid] *)": tokens.statusErrorText,
    },
    opacity: {
      default: 1,
      "[data-disabled]": 0.5,
      ":is([data-disabled] *)": 0.5,
    },
  },
  required: {
    "::after": { content: '"*" / ""', marginInlineStart: 2, color: tokens.statusErrorText },
  },
  contextualRequired: {
    ":is([data-required='true'] *)::after": {
      content: '"*" / ""',
      marginInlineStart: 2,
      color: tokens.statusErrorText,
    },
  },
});
