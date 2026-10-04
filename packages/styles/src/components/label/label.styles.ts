// HeroUI v3.2.6, Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const labelStyles = stylex.create({
  label: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: {
      default: tokens.foreground,
      "[data-invalid]": tokens.danger,
      ":is([data-invalid] *)": tokens.danger,
    },
    opacity: {
      default: 1,
      "[data-disabled]": tokens.disabledOpacity,
      ":is([data-disabled] *)": tokens.disabledOpacity,
    },
  },
  required: { "::after": { content: '"*" / ""', marginInlineStart: 2, color: tokens.danger } },
  contextualRequired: {
    ":is([data-required='true'] *)::after": {
      content: '"*" / ""',
      marginInlineStart: 2,
      color: tokens.danger,
    },
  },
});
