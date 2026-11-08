/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles; shared source popover geometry with select.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
import { collectionFieldStyles as selectStyles } from "../../shared/collection-field.styles.js";

export const comboBoxStyles = stylex.create({
  inputGroup: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    alignItems: "center",
    minWidth: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    paddingBlock: ".5rem",
    paddingInlineStart: ".75rem",
    paddingInlineEnd: "1.75rem",
    color: tokens.labelPrimary,
    fontSize: { default: "1rem", "@media (min-width: 640px)": ".875rem" },
    lineHeight: "1.25rem",
    "::placeholder": { color: tokens.labelPlaceholder },
  },
  field: {
    boxSizing: "border-box",
    minHeight: "2.25rem",
    borderRadius: tokens.shapeField,
    borderWidth: tokens.fieldStrokeWidth,
    borderStyle: "solid",
    borderColor: {
      default: tokens.controlFieldBorder,
      ":hover:not(:focus-within, [data-invalid], :has(input[data-invalid]))": tokens.controlBorder,
      ":focus-within": tokens.controlFieldBorder,
      ":is([data-invalid], :has(input[data-invalid]))": tokens.statusErrorBorder,
    },
    backgroundColor: {
      default: tokens.controlFieldFill,
      ":hover:not(:focus-within, [data-invalid], :has(input[data-invalid]))":
        tokens.controlFieldHoverFill,
      ":focus-within": tokens.controlFieldFill,
      ":is([data-invalid], :has(input[data-invalid]))": tokens.controlFieldFocusFill,
    },
    color: tokens.labelPrimary,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":is(input:focus, :has(input:focus))": focusRing.elevation,
    },
    outline: {
      default: "none",
      ":is(input:focus-visible, :has(input:focus-visible)):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-field-grouped] *, [data-slot='fieldset-row'] *):is(input:focus-visible, :has(input:focus-visible)):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
    },
    outlineOffset: 2,
    opacity: {
      default: 1,
      ":is(:disabled, [data-disabled], :has(input:disabled))": 0.5,
    },
    transition: {
      default: `background-color 150ms ${tokens.motionEaseSmooth}, border-color 150ms ${tokens.motionEaseSmooth}, box-shadow 150ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  secondary: {
    backgroundColor: {
      default: tokens.controlFill,
      ":hover:not(:focus-within, [data-invalid], :has(input[data-invalid]))":
        tokens.controlHoverFill,
      ":focus-within": tokens.controlFill,
      ":is([data-invalid], :has(input[data-invalid]))": tokens.controlFill,
    },
    "--lenso-focus-elevation": "0 0 #0000",
  },
  groupedInput: {
    boxSizing: "border-box",
    border: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    outline: "none",
    ":autofill": {
      WebkitTextFillColor: tokens.labelPrimary,
      caretColor: tokens.labelPrimary,
      boxShadow: "0 0 0 1000px transparent inset",
      transition: "background-color 9999s ease-in-out 0s",
    },
  },
  trigger: {
    position: "absolute",
    insetInlineEnd: 0,
    insetBlock: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    border: "none",
    backgroundColor: "transparent",
    color: { default: tokens.labelPlaceholder, ":hover": tokens.labelPrimary },
    outline: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    borderRadius: tokens.shapeContentMd,
    cursor: { default: "pointer", ":is([data-disabled])": "default" },
  },
  standaloneInput: { paddingInlineEnd: 40 },
  groupedTrigger: {
    position: "relative",
    inset: "auto",
    width: 32,
    height: 32,
    flexShrink: 0,
    marginInlineEnd: -8,
    borderRadius: 16,
    boxShadow: { default: "none", ":focus-visible": "none" },
    outline: { default: "none", ":focus-visible": "1.5px solid var(--lenso-focus-ring)" },
    outlineOffset: -2,
  },
  standaloneTrigger: {
    opacity: { default: 1, ":is([data-disabled])": 0.5 },
  },
  icon: {
    width: "1rem",
    height: "1rem",
    display: "flex",
    transform: { default: "rotate(0deg)", ":is([data-popup-open])": "rotate(180deg)" },
    transition: {
      default: `transform 150ms ${tokens.motionEaseSmooth}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  value: { fontSize: ".875rem", color: tokens.labelPrimary, overflowWrap: "break-word" },
  clear: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    padding: ".25rem",
    border: "none",
    borderRadius: tokens.shapeContentXl,
    backgroundColor: { default: "transparent", ":hover": tokens.controlHoverFill },
    color: tokens.labelSecondary,
    cursor: "pointer",
    outline: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    "::after": { content: '""', position: "absolute", inset: -2 },
  },
  chips: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: ".25rem" },
  chip: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: ".25rem",
    paddingInline: ".5rem",
    paddingBlock: ".25rem",
    backgroundColor: tokens.controlFill,
    color: tokens.labelPrimary,
    borderRadius: tokens.shapeContentXl,
    fontSize: ".75rem",
    fontWeight: 500,
    lineHeight: "1rem",
    outline: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
  },
  chipRemove: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: ".75rem",
    height: ".75rem",
    padding: 0,
    border: "none",
    backgroundColor: "transparent",
    color: "inherit",
    cursor: "pointer",
    "::after": {
      content: '""',
      position: "absolute",
      width: 24,
      height: 24,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  },
  empty: {
    padding: ".75rem",
    textAlign: "center",
    fontSize: ".875rem",
    color: tokens.labelSecondary,
  },
});

const virtualFocusStyles = stylex.create({
  item: {
    boxShadow: {
      default: "none",
      ":is([data-highlighted][data-keyboard-highlight]):not([data-disabled])": focusRing.outer,
    },
  },
});

export const comboBoxSharedStyles = {
  ...selectStyles,
  item: [selectStyles.item, virtualFocusStyles.item],
};
