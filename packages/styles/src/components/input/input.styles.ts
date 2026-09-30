// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const inputStyles = stylex.create({
  input: {
    boxSizing: "border-box",
    minWidth: 0,
    borderRadius: tokens.fieldRadius,
    borderWidth: tokens.borderWidthField,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":hover:not(:disabled)": tokens.fieldBorderHover,
      ":focus": tokens.fieldBorderFocus,
      "[data-invalid]": tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      ":hover:not(:focus):not(:disabled)": tokens.fieldHover,
      ":focus": tokens.fieldFocus,
      "[data-invalid]": tokens.fieldFocus,
    },
    color: tokens.fieldForeground,
    paddingInline: 12,
    paddingBlock: 8,
    fontFamily: tokens.fontSans,
    fontSize: { default: 16, "@media (min-width: 640px)": 14 },
    lineHeight: "20px",
    boxShadow: tokens.fieldShadow,
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    outlineOffset: 2,
    opacity: {
      default: 1,
      ":disabled": tokens.disabledOpacity,
      "[data-disabled]": tokens.disabledOpacity,
    },
    transition: {
      default: `background-color 150ms ${tokens.easeSmooth}, border-color 150ms ${tokens.easeSmooth}, box-shadow 150ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    "::placeholder": { color: tokens.fieldPlaceholder },
  },
  secondary: {
    backgroundColor: {
      default: tokens.default,
      ":hover:not(:focus):not(:disabled)": tokens.defaultHover,
    },
    boxShadow: "none",
  },
  fullWidth: { width: "100%" },
});
