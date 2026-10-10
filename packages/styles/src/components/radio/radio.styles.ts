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
    marginBlockStart: {
      default: 0,
      ":is([data-slot='radio-group']:not([aria-orientation='horizontal']):not([data-orientation='horizontal']) *)":
        "1rem",
    },
    cursor: { default: tokens.cursorInteractive, ":is([data-disabled])": tokens.cursorDisabled },
    opacity: { default: 1, ":is([data-disabled])": tokens.disabledOpacity },
  },
  content: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: ".75rem",
    fontSize: ".875rem",
    lineHeight: "1.25rem",
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
      ":is([data-slot='radio']:not([data-disabled]):hover *)": tokens.fieldBorderHover,
      ":is([data-slot='radio'][data-checked] *)": "transparent",
    },
    backgroundColor: {
      default: "var(--radio-control-bg)",
      ":is([data-slot='radio'][data-checked] *)": tokens.accent,
      ":is([data-slot='radio'][data-checked]:not([data-disabled]):active *)": tokens.accentHover,
    },
    "--radio-control-bg": tokens.fieldBackground,
    "--radio-control-bg-hover": tokens.fieldHover,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: {
      default: focusRing.elevation,
      ":is([data-slot='radio']:focus-visible *)": focusRing.outerElevated,
      ":is([data-slot='radio'][data-invalid]:focus-within *, [data-slot='radio'][aria-invalid='true']:focus-within *)": `0 0 0 2px ${tokens.danger}, var(--lenso-focus-elevation, 0 0 #0000)`,
    },
    outline: {
      default: "none",
      ":is([data-slot='radio'][data-invalid] *, [data-slot='radio'][aria-invalid='true'] *)": `1px solid ${tokens.danger}`,
      ":is([data-slot='radio'][data-invalid]:focus-within *, [data-slot='radio'][aria-invalid='true']:focus-within *)":
        "none",
    },
    transform: {
      default: "scale(1)",
      ":is([data-slot='radio']:not([data-disabled]):active *)": "scale(.95)",
    },
    transition: {
      default: `background-color 200ms ${tokens.easeOut}, border-color 200ms ${tokens.easeOut}, transform 100ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  indicator: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    "::before": {
      content: { default: "none", ":empty": '""' },
      width: "100%",
      height: "100%",
      borderRadius: tokens.radiusLg,
      backgroundColor: {
        default: "var(--radio-control-bg)",
        ":is([data-slot='radio']:not([data-checked]):not([data-disabled]):hover *)":
          "var(--radio-control-bg-hover)",
        ":is([data-checked])": tokens.accentForeground,
      },
      scale: {
        default: "1",
        ":is([data-checked])": ".4286",
        ":is([data-slot='radio']:not([data-disabled]):active [data-checked])": ".5714",
      },
      transition: {
        default: `scale 200ms ${tokens.easeOut}, background-color 200ms ${tokens.easeOut}`,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  secondary: {
    "--radio-control-bg": tokens.default,
    "--radio-control-bg-hover": tokens.defaultHover,
    "--lenso-focus-elevation": "0 0 #0000",
  },
  supporting: {
    paddingInlineStart: "1.75rem",
    width: "100%",
    minWidth: 0,
    cursor: "default",
    fontSize: ".75rem",
    lineHeight: "1rem",
    color: tokens.muted,
    overflowWrap: "break-word",
    userSelect: "none",
  },
});
