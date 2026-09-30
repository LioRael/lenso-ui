/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and Base UI state selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const switchStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".25rem",
    "--choice-supporting-indent": "3.25rem",
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
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: tokens.radiusXl,
    width: "2.5rem",
    height: "1.25rem",
    backgroundColor: {
      default: `var(--switch-control-bg, ${tokens.default})`,
      ":is([data-slot='switch']:hover *)": `var(--switch-control-bg-hover, color-mix(in oklab, var(--switch-control-bg, ${tokens.default}) 80%, transparent))`,
      ":is([data-slot='switch']:active *)": `var(--switch-control-bg-pressed, var(--switch-control-bg-hover, color-mix(in oklab, var(--switch-control-bg, ${tokens.default}) 80%, transparent)))`,
      ":is([data-slot='switch'][data-checked] *)": `var(--switch-control-bg-checked, ${tokens.accent})`,
      ":is([data-slot='switch'][data-checked]:hover *)": `var(--switch-control-bg-checked-hover, ${tokens.accentHover})`,
      ":is([data-slot='switch'][data-checked]:active *)": `var(--switch-control-bg-checked-hover, ${tokens.accentHover})`,
    },
    outline: {
      default: "none",
      ":is([data-slot='switch']:focus-visible *)": `2px solid ${tokens.focus}`,
    },
    outlineOffset: 2,
    transition: {
      default: `background-color 250ms ${tokens.easeSmooth}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  thumb: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: tokens.radiusLg,
    width: "1.375rem",
    height: "1rem",
    marginInlineStart: {
      default: ".125rem",
      ":is([data-checked])": "calc(100% - 1.5rem)",
    },
    backgroundColor: {
      default: "white",
      ":is([data-checked])": tokens.accentForeground,
      ":is([data-disabled])": `color-mix(in oklab, ${tokens.defaultForeground} 20%, transparent)`,
    },
    color: { default: "black", ":is([data-checked])": tokens.accent },
    boxShadow: {
      default: tokens.fieldShadow,
      ":is([data-checked])":
        "0px 0px 5px 0px rgb(0 0 0 / .02), 0px 2px 10px 0px rgb(0 0 0 / .06), 0px 0px 1px 0px rgb(0 0 0 / .3)",
    },
    opacity: { default: 1, ":is([data-disabled][data-checked])": 0.4 },
    transition: {
      default: `margin 300ms ${tokens.easeOutFluid}, background-color 200ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
  },
  icon: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  controlSm: { width: "2rem", height: "1rem", borderRadius: tokens.radiusLg },
  controlLg: { width: "3rem", height: "1.5rem" },
  thumbSm: {
    width: "1.03125rem",
    height: ".75rem",
    borderRadius: tokens.radiusMd,
    marginInlineStart: { default: ".125rem", ":is([data-checked])": "calc(100% - 1.15625rem)" },
  },
  thumbLg: {
    width: "1.71875rem",
    height: "1.25rem",
    borderRadius: tokens.radiusXl,
    marginInlineStart: { default: ".125rem", ":is([data-checked])": "calc(100% - 1.84375rem)" },
  },
  rootSm: { "--choice-supporting-indent": "2.75rem" },
  rootLg: { "--choice-supporting-indent": "3.75rem" },
});

// One conditional map prevents StyleX composition from replacing another family's indentation.
export { checkboxSupportingStyles as switchSupportingStyles } from "../checkbox/checkbox.styles.js";
