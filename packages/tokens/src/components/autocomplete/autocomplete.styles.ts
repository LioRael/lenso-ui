/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI popup-search selection, native states and StyleX composition.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
import { collectionFieldStyles as selectStyles } from "../../shared/collection-field.styles.js";
import { comboBoxStyles } from "../combo-box/combo-box.styles.js";

export const autocompleteStyles = stylex.create({
  input: {
    flexShrink: 0,
    minWidth: 0,
    width: "100%",
    paddingInline: ".75rem",
    paddingBlock: ".5rem",
    border: "none",
    outline: {
      default: "none",
      ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
    },
    outlineOffset: -2,
    borderRadius: 8,
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
    fontSize: { default: "1rem", "@media (min-width: 640px)": ".875rem" },
    lineHeight: { default: "1.5rem", "@media (min-width: 640px)": "1.25rem" },
    "::placeholder": { color: tokens.labelPlaceholder },
  },
  popover: {
    display: "flex",
    flexDirection: "column",
    width: "var(--anchor-width)",
    maxWidth: "var(--available-width)",
    maxHeight: "var(--available-height)",
    overflow: "hidden",
    paddingTop: ".5rem",
    borderRadius: tokens.shapeContent,
    backdropFilter: "blur(22px) saturate(1.9)",
    backgroundColor: tokens.presentationBackground,
    color: tokens.labelPrimary,
    boxShadow: tokens.overlayShadow,
    fontSize: ".875rem",
    lineHeight: "1.25rem",
    overscrollBehavior: "contain",
    scrollPaddingBlock: ".25rem",
    transformOrigin: "var(--transform-origin)",
    outline: "none",
    opacity: { default: 1, ":is([data-starting-style])": 0, ":is([data-ending-style])": 0 },
    transform: {
      default: "scale(1)",
      ":is([data-starting-style])": "scale(.95)",
      ":is([data-starting-style][data-side='top'])": "translateY(.25rem) scale(.95)",
      ":is([data-starting-style][data-side='bottom'])": "translateY(-.25rem) scale(.95)",
      ":is([data-starting-style][data-side='left'])": "translateX(.25rem) scale(.95)",
      ":is([data-starting-style][data-side='right'])": "translateX(-.25rem) scale(.95)",
      ":is([data-ending-style])": "scale(.95)",
    },
    pointerEvents: { default: "auto", ":is([data-ending-style])": "none" },
    transition: {
      default: `opacity 250ms ${tokens.motionEaseOutFluid}, transform 250ms ${tokens.motionEaseOutFluid}`,
      ":is([data-ending-style])": `opacity 100ms ${tokens.motionEaseOutQuad}, transform 100ms ${tokens.motionEaseOutQuad}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  list: {
    position: "relative",
    width: "100%",
    maxHeight: 320,
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: ".375rem",
    outline: "none",
    ":is(*):not([data-virtualized]) > * + *": { marginTop: ".25rem" },
  },
});

const sharedStyles = stylex.create({
  trigger: {
    cursor: { default: tokens.cursorInteractive, ":is([data-disabled])": tokens.cursorDisabled },
    paddingInlineEnd: ".75rem",
    ":has([data-slot='autocomplete-indicator'])": { paddingInlineEnd: "1.75rem" },
    borderColor: {
      default: tokens.controlFieldBorder,
      "@media (hover: hover)": {
        ":hover:not([data-invalid], [aria-invalid='true'], :focus-visible, :has([data-slot='autocomplete-clear-button']:hover))":
          tokens.controlBorder,
      },
      ":focus-visible:not([data-invalid], [aria-invalid='true']):not(:is([data-lenso-focus-method='pointer'] *))":
        tokens.focusRing,
      ":is([data-invalid], [aria-invalid='true'])": tokens.statusErrorIndicator,
    },
    backgroundColor: {
      default: tokens.controlFieldFill,
      "@media (hover: hover)": {
        ":hover:not([data-invalid], [aria-invalid='true'], :focus-visible, :has([data-slot='autocomplete-clear-button']:hover))":
          tokens.controlFieldHoverFill,
      },
      ":focus-visible:not([data-invalid], [aria-invalid='true']):not(:is([data-lenso-focus-method='pointer'] *))":
        tokens.controlFieldFocusFill,
      ":is([data-invalid], [aria-invalid='true'])": tokens.controlFieldFocusFill,
    },
    outline: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'])": "none",
      ":is([data-invalid], [aria-invalid='true']):focus-visible": "none",
    },
    outlineOffset: { default: 0, ":is([data-invalid], [aria-invalid='true'])": 0 },
    boxShadow: {
      default: focusRing.elevation,
      ":focus-visible": focusRing.elevation,
      ":focus-visible:not([data-invalid], [aria-invalid='true']):not(:is([data-lenso-focus-method='pointer'] *))":
        focusRing.outerElevated,
      ":is([data-invalid], [aria-invalid='true'])": `${focusRing.errorUnderline}, ${focusRing.elevation}`,
      ":is([data-invalid], [aria-invalid='true']):focus-visible": `${focusRing.errorUnderline}, ${focusRing.elevation}`,
    },
    transition: {
      default: `background-color 150ms ${tokens.motionEaseSmooth}, border-color 150ms ${tokens.motionEaseSmooth}, box-shadow 150ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  secondary: {
    backgroundColor: {
      default: tokens.controlFill,
      "@media (hover: hover)": {
        ":hover:not([data-invalid], [aria-invalid='true'], :focus-visible, :has([data-slot='autocomplete-clear-button']:hover))":
          tokens.controlHoverFill,
      },
      ":focus-visible:not([data-invalid], [aria-invalid='true'])": tokens.controlFill,
      ":is([data-invalid], [aria-invalid='true'])": tokens.controlFill,
    },
    "--lenso-focus-elevation": "0 0 #0000",
  },
  value: {
    flex: 1,
    minWidth: 0,
    textAlign: "start",
    overflowWrap: "break-word",
    color: { default: "inherit", ":is([data-placeholder] *)": tokens.labelPlaceholder },
    fontSize: { default: "1rem", "@media (min-width: 640px)": ".875rem" },
    lineHeight: { default: "1.5rem", "@media (min-width: 640px)": "1.25rem" },
    "[data-slot='autocomplete-item-indicator']": { display: "none" },
  },
  item: {
    boxSizing: "border-box",
    boxShadow: {
      default: "none",
      ":is([data-highlighted][data-keyboard-highlight]):not([data-disabled])": focusRing.outer,
    },
    paddingInlineEnd: ".625rem",
    ":has([data-slot='autocomplete-item-indicator'])": { paddingInlineEnd: "1.75rem" },
    cursor: { default: tokens.cursorInteractive, ":is([data-disabled])": tokens.cursorDisabled },
    backgroundColor: {
      default: "transparent",
      ":is([data-highlighted]):not([data-disabled])": tokens.controlFill,
    },
    transform: { default: "scale(1)", ":active:not([data-disabled])": "scale(.98)" },
    transition: {
      default: `transform 250ms ${tokens.motionEaseOutQuart}, box-shadow 150ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  separator: {
    marginInlineStart: "3%",
    width: "94%",
  },
});

const fieldStyles = stylex.create({
  clear: {
    flexShrink: 0,
    alignSelf: "center",
    userSelect: "none",
    cursor: { default: tokens.cursorInteractive, ":is([data-disabled])": tokens.cursorDisabled },
    transform: { default: "scale(1)", ":active:not([data-disabled])": "scale(.93)" },
  },
  empty: {
    padding: { default: ".75rem", ":empty": 0 },
    textAlign: "center",
    fontSize: ".875rem",
    color: `color-mix(in oklab, ${tokens.labelPrimary} 60%, transparent)`,
  },
});

// Only Autocomplete overrides the shared field/option defaults.
export const autocompleteFieldStyles = {
  ...comboBoxStyles,
  clear: [comboBoxStyles.clear, fieldStyles.clear],
  empty: fieldStyles.empty,
};
export const autocompleteSharedStyles = {
  ...selectStyles,
  trigger: [selectStyles.trigger, sharedStyles.trigger],
  secondary: sharedStyles.secondary,
  value: sharedStyles.value,
  item: [selectStyles.item, sharedStyles.item],
  separator: [selectStyles.separator, sharedStyles.separator],
};
