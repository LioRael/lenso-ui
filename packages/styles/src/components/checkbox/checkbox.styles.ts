/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and Base UI state selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const checkboxStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".25rem",
    "--choice-supporting-indent": "1.75rem",
    outline: "none",
    cursor: { default: "pointer", ":is([data-disabled])": "default" },
    opacity: { default: 1, ":is([data-disabled])": tokens.disabledOpacity },
  },
  content: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: ".75rem",
    fontSize: ".875rem",
    fontWeight: 500,
    color: tokens.foreground,
    userSelect: "none",
  },
  control: {
    position: "relative",
    display: "inline-flex",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: tokens.radiusMd,
    borderWidth: tokens.borderWidthField,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":is([data-slot='checkbox']:hover *)": tokens.fieldBorderHover,
      ":is([data-slot='checkbox'][data-checked] *)": "transparent",
      ":is([data-slot='checkbox'][data-indeterminate] *)": "transparent",
      ":is([data-slot='checkbox'][data-invalid] *)": tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      ":is([data-slot='checkbox'][data-indeterminate] *)": tokens.accent,
      ":is([data-slot='checkbox'][data-invalid][data-checked] *)": tokens.danger,
      ":is([data-slot='checkbox'][data-invalid][data-indeterminate] *)": tokens.danger,
    },
    color: {
      default: tokens.accentForeground,
      ":is([data-slot='checkbox'][data-invalid] *)": tokens.dangerForeground,
    },
    boxShadow: tokens.fieldShadow,
    outline: {
      default: "none",
      ":is([data-slot='checkbox']:focus-visible *)": `2px solid ${tokens.focus}`,
    },
    outlineOffset: 2,
    transition: {
      default: `background-color 200ms ${tokens.easeOut}, border-color 200ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      borderRadius: tokens.radiusMd,
      transformOrigin: "center",
      scale: { default: ".7", ":is([data-slot='checkbox'][data-checked] *)": "1" },
      opacity: { default: 0, ":is([data-slot='checkbox'][data-checked] *)": 1 },
      backgroundColor: {
        default: tokens.accent,
        ":is([data-slot='checkbox']:hover *)": tokens.accentHover,
        ":is([data-slot='checkbox'][data-invalid] *)": tokens.danger,
      },
      transition: {
        default: `scale 100ms linear, opacity 200ms linear, background-color 200ms ${tokens.easeOut}`,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  indicator: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    width: ".75rem",
    height: ".75rem",
    alignItems: "center",
    justifyContent: "center",
    color: "inherit",
  },
  checkmark: {
    display: { default: "block", ":is([data-indeterminate] *)": "none" },
    width: "var(--checkbox-checkmark-size, .625rem)",
    height: "var(--checkbox-checkmark-size, .625rem)",
    strokeWidth: 2.5,
    strokeDashoffset: { default: 66, ":is([data-checked] *)": 44 },
    transition: {
      default: "stroke-dashoffset 150ms linear 15ms",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  indeterminate: {
    display: { default: "none", ":is([data-indeterminate] *)": "block" },
    width: ".75rem",
    height: ".75rem",
  },
  secondary: { backgroundColor: tokens.default, boxShadow: "none" },
});

export const checkboxSupportingStyles = stylex.create({
  direct: {
    paddingInlineStart: {
      default: null,
      ":is([data-slot='checkbox'] > *, [data-slot='switch'] > *)":
        "var(--choice-supporting-indent)",
    },
    width: { default: null, ":is([data-slot='checkbox'] > *, [data-slot='switch'] > *)": "100%" },
    minWidth: { default: null, ":is([data-slot='checkbox'] > *, [data-slot='switch'] > *)": 0 },
    cursor: { default: null, ":is([data-slot='checkbox'] > *, [data-slot='switch'] *)": "default" },
    userSelect: {
      default: null,
      ":is([data-slot='checkbox'] > *, [data-slot='switch'] *)": "none",
    },
  },
  error: {
    color: {
      default: tokens.danger,
      ":is([data-slot='checkbox'] > *, [data-slot='switch'] > *)": tokens.muted,
    },
  },
});
