/**
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and Base UI state selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const radioStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".25rem",
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
    borderRadius: tokens.shapeContentLg,
    borderWidth: tokens.fieldStrokeWidth,
    borderStyle: "solid",
    borderColor: {
      default: tokens.controlFieldBorder,

      ":is([data-slot='radio'][data-checked] *)": "transparent",
      ":is([data-slot='radio'][data-invalid] *)": tokens.statusErrorBorder,
    },
    backgroundColor: {
      default: tokens.controlFieldFill,
      ":is([data-slot='radio'][data-checked] *)": tokens.tint,
    },
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":is([data-slot='radio']:focus-visible *)": focusRing.outerElevated,
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
          ":is([data-slot='radio']:hover:not(:focus):not([data-disabled]) *)":
            "var(--lenso-fill-secondary)",
        },
        ":is([data-slot='radio']:focus:not([data-disabled]) *)": "var(--lenso-fill-primary)",
      },
    },
    outline: "none",
    transform: { default: "scale(1)", ":is([data-slot='radio']:active *)": "scale(.95)" },
    transition: {
      default: `background-color 200ms ${tokens.motionEaseOut}, transform 100ms ${tokens.motionEaseOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  indicator: {
    zIndex: 2,
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    pointerEvents: "none",
    "::before": {
      content: { default: "none", ":empty": '""' },
      width: "100%",
      height: "100%",
      borderRadius: tokens.shapeContentLg,
      backgroundColor: {
        default: "inherit",
        ":is([data-checked])": tokens.labelOnTint,
      },
      scale: {
        default: "1",
        ":is([data-checked])": ".4286",
        ":is([data-slot='radio']:active [data-checked])": ".5714",
      },
      transition: {
        default: `scale 200ms ${tokens.motionEaseOut}, background-color 200ms ${tokens.motionEaseOut}`,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  secondary: { backgroundColor: tokens.controlFill, "--lenso-focus-elevation": "0 0 #0000" },
});
