/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
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
    borderRadius: tokens.radiusLg,
    borderWidth: tokens.borderWidthField,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":is([data-slot='radio']:hover *)": tokens.fieldBorderHover,
      ":is([data-slot='radio'][data-checked] *)": "transparent",
      ":is([data-slot='radio'][data-invalid] *)": tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      ":is([data-slot='radio'][data-checked] *)": tokens.accent,
    },
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":is([data-slot='radio']:focus-visible *)": focusRing.outerElevated,
    },
    outline: "none",
    transform: { default: "scale(1)", ":is([data-slot='radio']:active *)": "scale(.95)" },
    transition: {
      default: `background-color 200ms ${tokens.easeOut}, transform 100ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  indicator: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    pointerEvents: "none",
    "::before": {
      content: { default: "none", ":empty": '""' },
      width: "100%",
      height: "100%",
      borderRadius: tokens.radiusLg,
      backgroundColor: {
        default: "inherit",
        ":is([data-checked])": tokens.accentForeground,
      },
      scale: {
        default: "1",
        ":is([data-checked])": ".4286",
        ":is([data-slot='radio']:active [data-checked])": ".5714",
      },
      transition: {
        default: `scale 200ms ${tokens.easeOut}, background-color 200ms ${tokens.easeOut}`,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  secondary: { backgroundColor: tokens.default, "--lenso-focus-elevation": "0 0 #0000" },
});
