/**
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and Base UI state selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
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
    opacity: { default: 1, ":is([data-disabled])": 0.5 },
  },
  content: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: ".75rem",
    fontSize: ".875rem",
    fontWeight: 500,
    color: tokens.labelPrimary,
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
    borderRadius: tokens.shapeContentMd,
    borderWidth: tokens.fieldStrokeWidth,
    borderStyle: "solid",
    borderColor: {
      default: tokens.controlFieldBorder,

      ":is([data-slot='checkbox'][data-checked] *)": "transparent",
      ":is([data-slot='checkbox'][data-indeterminate] *)": "transparent",
      ":is([data-slot='checkbox'][data-invalid] *)": tokens.statusErrorBorder,
    },
    backgroundColor: {
      default: tokens.controlFieldFill,
      ":is([data-slot='checkbox'][data-indeterminate] *)": tokens.tint,
      ":is([data-slot='checkbox'][data-invalid][data-checked] *)": tokens.statusErrorIndicator,
      ":is([data-slot='checkbox'][data-invalid][data-indeterminate] *)":
        tokens.statusErrorIndicator,
    },
    color: {
      default: tokens.labelOnTint,
      ":is([data-slot='checkbox'][data-invalid] *)": tokens.statusErrorOnFill,
    },
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":is([data-slot='checkbox']:focus-visible *)": focusRing.outerElevated,
    },
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      zIndex: 1,
      backgroundColor: {
        default: "transparent",
        "@media (hover: hover) and (pointer: fine)": {
          default: null,
          ":is([data-slot='checkbox']:hover:not(:focus):not([data-disabled]) *)":
            "var(--lenso-fill-secondary)",
        },
        ":is([data-slot='checkbox']:focus:not([data-disabled]) *)": "var(--lenso-fill-primary)",
      },
    },
    outline: "none",
    transition: {
      default: `background-color 200ms ${tokens.motionEaseOut}, border-color 200ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      borderRadius: tokens.shapeContentMd,
      transformOrigin: "center",
      scale: { default: ".7", ":is([data-slot='checkbox'][data-checked] *)": "1" },
      opacity: { default: 0, ":is([data-slot='checkbox'][data-checked] *)": 1 },
      backgroundColor: {
        default: tokens.tint,

        ":is([data-slot='checkbox'][data-invalid] *)": tokens.statusErrorIndicator,
      },
      transition: {
        default: `scale 100ms linear, opacity 200ms linear, background-color 200ms ${tokens.motionEaseOut}`,
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
  secondary: { backgroundColor: tokens.controlFill, "--lenso-focus-elevation": "0 0 #0000" },
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
      default: tokens.statusErrorText,
      ":is([data-slot='checkbox'] > *, [data-slot='switch'] > *)": tokens.labelSecondary,
    },
  },
});
