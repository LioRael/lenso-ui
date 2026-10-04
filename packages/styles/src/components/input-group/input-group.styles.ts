// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
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
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.danger,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:hover, :focus-within)":
        tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      ":hover:not(:focus-within)": tokens.fieldHover,
      ":focus-within": tokens.fieldFocus,
      ":has(input:autofill)": tokens.fieldFocus,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.fieldFocus,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):hover:not(:focus-within)":
        tokens.fieldFocus,
    },
    color: tokens.fieldForeground,
    boxShadow: {
      default: tokens.fieldShadow,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `0 0 0 2px ${tokens.danger}, ${tokens.fieldShadow}`,
    },
    transition: {
      default: `background-color 150ms ${tokens.easeSmooth}, border-color 150ms ${tokens.easeSmooth}, box-shadow 150ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    // Adapt invalid-field-ring to native Base UI presence attributes. Each :is()
    // stays attached to the styled shell, including the Field.Root ancestor case.
    outline: {
      default: "none",
      ":has(:focus-visible)": `2px solid ${tokens.focus}`,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": `1px solid ${tokens.danger}`,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])":
        "none",
    },
    outlineOffset: {
      default: 2,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": 0,
    },
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
    backgroundColor: {
      default: tokens.default,
      ":hover:not(:focus-within)": tokens.defaultHover,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.default,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):hover:not(:focus-within)":
        tokens.default,
    },
    boxShadow: {
      default: "none",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `0 0 0 2px ${tokens.danger}`,
    },
  },
  fullWidth: { width: "100%" },
});
