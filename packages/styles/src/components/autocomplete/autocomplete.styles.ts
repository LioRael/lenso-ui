/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: editable Base UI autocomplete; source popup constraints retained.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { selectStyles } from "../select/select.styles.js";
import { comboBoxStyles } from "../combo-box/combo-box.styles.js";

export const autocompleteStyles = stylex.create({
  input: {
    flexShrink: 0,
    minWidth: 0,
    width: "100%",
    paddingInline: ".75rem",
    paddingBlock: ".25rem",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: tokens.fieldForeground,
    fontSize: { default: "1rem", "@media (min-width: 640px)": ".875rem" },
    lineHeight: "1.5rem",
    "::placeholder": { color: tokens.fieldPlaceholder },
  },
  popover: {
    display: "flex",
    flexDirection: "column",
    width: "var(--anchor-width)",
    maxWidth: "var(--available-width)",
    maxHeight: "var(--available-height)",
    overflow: "hidden",
    paddingTop: ".5rem",
    borderRadius: `min(32px, ${tokens.radius3xl})`,
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    boxShadow: tokens.shadowOverlay,
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
      default: `opacity 250ms ${tokens.easeSmooth}, transform 250ms ${tokens.easeSmooth}`,
      ":is([data-ending-style])": `opacity 100ms ${tokens.easeSmooth}, transform 100ms ${tokens.easeSmooth}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  list: {
    maxHeight: 320,
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: ".375rem",
    outline: "none",
  },
});
export const autocompleteFieldStyles = comboBoxStyles;
export const autocompleteSharedStyles = selectStyles;
