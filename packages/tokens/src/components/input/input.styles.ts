// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: shared content fields and optional floating input shells.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { focusRing } from "../../focus-ring.stylex.const.js";

export const inputStyles = stylex.create({
  input: {
    appearance: "none",
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    maxWidth: 360,
    height: 52,
    margin: 0,
    paddingBlock: 0,
    paddingInline: 16,
    borderWidth: 0,
    borderRadius: 26,
    backgroundColor: tokens.backgroundGroupedSecondary,
    color: tokens.labelPrimary,
    caretColor: tokens.tint,
    fontFamily: "inherit",
    fontSize: 17,
    fontWeight: 400,
    lineHeight: "22px",
    boxShadow: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid]))": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
    outline: {
      default: "none",
      ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 2,
    opacity: { default: 1, ":is(:disabled, [data-disabled])": 0.4 },
    "::placeholder": { color: tokens.labelPlaceholder, opacity: 1 },
    "::-webkit-search-cancel-button": { display: "none" },
  },
  fieldGlass: {
    // The positioned backdrop copy must paint below native input text even
    // when elastic is off and no transform creates a foreground paint layer.
    position: "relative",
    backgroundColor: {
      default: "var(--lenso-material-action-fill)",
      ":is([data-material-filter])": "transparent",
    },
    boxShadow: {
      default: "var(--lg-foreground-shadow, var(--lenso-material-action-shadow))",
      ":is([data-invalid], [aria-invalid='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, var(--lg-foreground-shadow, var(--lenso-material-action-shadow))`,
    },
  },
  formGrouped: {
    maxWidth: "none",
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingInline: 0,
    outline: {
      default: "none",
      ":focus-visible": "none",
      ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))": "none",
      ":has(:focus-visible)": "none",
      ":has(input:focus-visible, textarea:focus-visible)": "none",
      ":has(input:focus-visible, textarea:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": "none",
    },
    boxShadow: {
      default: "none",
      ":focus-visible": "none",
      ":has(input:focus-visible, textarea:focus-visible)": "none",
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid]))": focusRing.errorUnderline,
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid])):is(:focus-visible, :has(input:focus-visible, textarea:focus-visible))":
        focusRing.errorUnderline,
    },
  },
  glass: {
    position: "relative",
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    maxWidth: 360,
    height: 44,
    paddingBlock: 0,
    paddingInlineStart: 11,
    paddingInlineEnd: 10,
    borderWidth: 0,
    borderRadius: 296,
    color: "var(--lenso-label-primary)",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 500,
    fontStyle: "inherit",
    fontSize: 17,
    lineHeight: "20px",
    backgroundColor: {
      default: "var(--lenso-material-action-fill)",
      ":is([data-material-filter])": "transparent",
    },
    outline: { default: "none", ":is([data-invalid])": "none" },
    opacity: { default: 1, ":disabled": 0.35, ":is([data-disabled])": 0.35 },
    // Void inputs cannot paint pseudo-elements. The native blur fallback uses
    // the shared action fill; copied/native SVG paths supply the full transfer.
    boxShadow: {
      default: "inset 0 0 0 100vmax transparent, var(--lenso-material-action-shadow)",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ':hover:not(:focus):not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
          "inset 0 0 0 100vmax var(--lenso-fill-tertiary), var(--lenso-material-action-shadow)",
      },
      ':focus:not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
        "inset 0 0 0 100vmax var(--lenso-fill-secondary), var(--lenso-material-action-shadow)",
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid]))": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, var(--lenso-material-action-shadow)`,
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid])):is(:hover, :focus, :focus-within):not(:disabled, [data-disabled])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, var(--lenso-material-action-shadow)`,
    },
    transitionProperty: "box-shadow",
    transitionDuration: { default: "120ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))": {
      outline: "1.5px solid var(--lenso-focus-ring)",
      outlineOffset: 2,
    },
    "::placeholder": { color: "var(--lenso-label-placeholder)" },
    "::-webkit-search-cancel-button": { display: "none" },
  },
  group: {
    opacity: { default: 1, ":has(input:disabled, textarea:disabled)": 0.35 },
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    height: "auto",
    borderRadius: 26,
    boxShadow: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid]))": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
    outline: {
      default: "none",
      ":has(input:focus-visible, textarea:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": "none",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *):is(:focus, :focus-visible, :focus-within, [data-focused='true'], [data-focus-visible='true'], [data-focus-within='true'])":
        "none",
    },
    outlineOffset: {
      default: 0,
      ":has(input:focus-visible, textarea:focus-visible)": 2,
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": 0,
    },
  },
  glassGroup: {
    height: "auto",
    minHeight: 52,
    borderRadius: 26,
  },
  groupedControl: {
    flex: 1,
    minWidth: 0,
    maxWidth: "none",
    paddingBlock: 0,
    paddingInline: 0,
    height: "auto",
    minHeight: 50,
    borderRadius: 0,
    backgroundColor: "transparent",
    boxShadow: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'])": "none",
      ":focus": "none",
      ":focus-visible": "none",
      ':focus:not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])': "none",
      "@media (hover: hover) and (pointer: fine)": {
        ':hover:not(:focus):not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
          "none",
      },
    },
    outline: {
      default: "none",
      ":focus-visible": "none",
      ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))": "none",
    },
  },
  groupedTextArea: { paddingBlock: 16, minHeight: 112, height: "auto", maxWidth: "none" },
  elastic: {
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
  },
  secondary: { backgroundColor: tokens.fillTertiary },
  fullWidth: { width: "100%", maxWidth: "none" },
});
