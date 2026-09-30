// HeroUI v3.2.6, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const inputGroupStyles = stylex.create({
  root: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    minHeight: 36,
    minWidth: 0,
    borderRadius: tokens.fieldRadius,
    borderWidth: tokens.borderWidthField,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":hover": tokens.fieldBorderHover,
      ":focus-within": tokens.fieldBorderFocus,
      ":has([data-invalid])": tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      ":hover:not(:focus-within)": tokens.fieldHover,
      ":focus-within": tokens.fieldFocus,
      ":has(input:autofill)": tokens.fieldFocus,
    },
    color: tokens.fieldForeground,
    boxShadow: tokens.fieldShadow,
    transition: {
      default: `background-color 150ms ${tokens.easeSmooth}, border-color 150ms ${tokens.easeSmooth}, box-shadow 150ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    outline: { default: "none", ":has(:focus-visible)": `2px solid ${tokens.focus}` },
    outlineOffset: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    color: tokens.fieldForeground,
    paddingInlineStart: {
      default: 12,
      ":is([data-slot='input-group']:has([data-slot='input-group-prefix']) *)": 0,
    },
    paddingInlineEnd: {
      default: 12,
      ":is([data-slot='input-group']:has([data-slot='input-group-suffix']) *)": 0,
    },
    paddingBlock: 8,
    boxShadow: "none",
    outline: "none",
    fontSize: { default: 16, "@media (min-width: 640px)": 14 },
    lineHeight: "20px",
    "::placeholder": { color: tokens.fieldPlaceholder },
    ":autofill": {
      WebkitTextFillColor: tokens.fieldForeground,
      caretColor: tokens.fieldForeground,
      boxShadow: "0 0 0 1000px transparent inset",
      transition: "background-color 9999s ease-in-out 0s",
    },
  },
  prefix: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 12,
    color: tokens.fieldPlaceholder,
    borderInlineEnd: `1px solid ${tokens.fieldBorder}`,
  },
  suffix: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 12,
    color: tokens.fieldPlaceholder,
    borderInlineStart: `1px solid ${tokens.fieldBorder}`,
  },
  secondary: {
    backgroundColor: { default: tokens.default, ":hover:not(:focus-within)": tokens.defaultHover },
    boxShadow: "none",
  },
  fullWidth: { width: "100%" },
});
