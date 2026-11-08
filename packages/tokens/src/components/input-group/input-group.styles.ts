// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const inputGroupStyles = stylex.create({
  root: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    minHeight: 36,
    minWidth: 0,
    borderRadius: tokens.shapeField,
    borderWidth: tokens.fieldStrokeWidth,
    borderStyle: "solid",
    borderColor: {
      default: tokens.controlFieldBorder,
      ":hover": tokens.controlBorder,
      ":focus-within": tokens.controlFieldBorder,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.statusErrorBorder,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:hover, :focus-within)":
        tokens.statusErrorBorder,
    },
    backgroundColor: {
      default: tokens.controlFieldFill,
      ":hover:not(:focus-within)": tokens.controlFieldHoverFill,
      ":focus-within": tokens.controlFieldFill,
      ":has(input:autofill)": tokens.controlFieldFocusFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.controlFieldFocusFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):hover:not(:focus-within)":
        tokens.controlFieldFocusFill,
    },
    color: tokens.labelPrimary,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":has(input:focus, textarea:focus)": focusRing.elevation,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, ${tokens.fieldShadow}`,
    },
    transition: {
      default: `background-color 150ms ${tokens.motionEaseSmooth}, border-color 150ms ${tokens.motionEaseSmooth}, box-shadow 150ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    // Adapt invalid-field-ring to native Base UI presence attributes. Each :is()
    // stays attached to the styled shell, including the Field.Root ancestor case.
    outline: {
      default: "none",
      ":has(input:focus-visible, textarea:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
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
    color: tokens.labelPrimary,
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
    "::placeholder": { color: tokens.labelPlaceholder },
    ":autofill": {
      WebkitTextFillColor: tokens.labelPrimary,
      caretColor: tokens.labelPrimary,
      boxShadow: "0 0 0 1000px transparent inset",
      transition: "background-color 9999s ease-in-out 0s",
    },
  },
  prefix: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 12,
    color: tokens.labelPlaceholder,
    borderInlineEnd: `1px solid ${tokens.controlFieldBorder}`,
  },
  suffix: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 12,
    color: tokens.labelPlaceholder,
    borderInlineStart: `1px solid ${tokens.controlFieldBorder}`,
  },
  secondary: {
    "--lenso-focus-elevation": "0 0 #0000",
    backgroundColor: {
      default: tokens.controlFill,
      ":hover:not(:focus-within)": tokens.controlHoverFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.controlFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):hover:not(:focus-within)":
        tokens.controlFill,
    },
    boxShadow: {
      default: "none",
      ":has(input:focus, textarea:focus)": focusRing.elevation,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
  },
  fullWidth: { width: "100%" },
  focusWithin: {
    boxShadow: {
      default: focusRing.elevation,
      ":focus-within": focusRing.elevation,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):focus-within": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, ${focusRing.elevation}`,
    },
  },
});

// Copyright (c) 2026 Kelvin Zhang. MIT.
const material =
  "inset 0 0 0 .5px var(--lenso-material-control-edge), 0 1px 3px var(--lenso-material-control-drop)";
export const inputGroupMaterialStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    gap: 10,
    width: "100%",
    maxWidth: 360,
    height: 40,
    minHeight: 40,
    paddingBlock: 0,
    paddingInline: 14,
    borderRadius: 20,
    borderWidth: 0,
    color: "var(--lenso-label-primary)",
    backgroundColor: {
      default: "var(--lenso-material-control-glass)",
      ":focus-within": "var(--lenso-material-control-glass-active)",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.controlFieldFocusFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:hover, :focus-within)":
        tokens.controlFieldFocusFill,
    },
    boxShadow: {
      default: material,
      ":focus-within": material,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, ${tokens.fieldShadow}`,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, ${tokens.fieldShadow}`,
    },
    outline: {
      default: "none",
      ":has(input:focus-visible, textarea:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-field-grouped] *, [data-slot='fieldset-row'] *):has(:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
    },
    outlineOffset: 2,
    opacity: { default: 1, ":has(input:disabled)": 0.35 },
    transition: "background-color 200ms ease",
  },
  secondary: {
    backgroundColor: {
      default: "var(--lenso-material-control-glass)",
      ":focus-within": "var(--lenso-material-control-glass-active)",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": tokens.controlFill,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:hover, :focus-within)":
        tokens.controlFill,
    },
    boxShadow: {
      default: material,
      ":focus-within": material,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
  },
  input: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    height: "100%",
    padding: 0,
    borderWidth: 0,
    outline: "none",
    borderRadius: 0,
    color: "inherit",
    backgroundColor: "transparent",
    boxShadow: "none",
    fontFamily: "inherit",
    fontStyle: "inherit",
    fontWeight: "inherit",
    fontSize: 14,
    lineHeight: "inherit",
    "::placeholder": { color: "var(--lenso-label-placeholder)" },
    "::-webkit-search-cancel-button": { display: "none" },
  },
  adornment: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderWidth: 0,
    color: "var(--lenso-label-secondary)",
  },
  fullWidth: { width: "100%", maxWidth: "none" },
});
