/**
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles and UI SDK state selectors.
 * Glass geometry and thumb adapted from Copyright 2026 Kelvin Zhang (MIT).
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const switchStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: ".25rem",
    "--choice-supporting-indent": "4.5rem",
    minHeight: 44,
    justifyContent: "center",
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
    display: "block",
    flexShrink: 0,
    width: "calc(64px * var(--lg-scale, .375) / .375)",
    height: "calc(28px * var(--lg-scale, .375) / .375)",
    borderRadius: 999,
    backgroundColor: "var(--lenso-control-switch-track)",
    touchAction: "pan-y",
    WebkitTapHighlightColor: "transparent",
    outline: {
      default: "none",
      ":is([data-lenso-slot='switch']:focus-visible *)": "1.5px solid var(--lenso-focus-ring)",
      ":is([data-lenso-slot='fieldset-row'] [data-lenso-slot='switch']:focus-visible *)": "none",
    },
    outlineOffset: 2,
    "::before": {
      content: '""',
      position: "absolute",
      inset: "min(0px, calc((28px * var(--lg-scale, .375) / .375 - 44px) / 2)) -8px",
    },
  },
  track: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundColor: "var(--lenso-control-switch-on)",
      opacity: {
        default: "var(--lg-switch-fill, 0)",
        ":is([data-lenso-slot='switch'][data-checked] *)": "var(--lg-switch-fill, 1)",
      },
      pointerEvents: "none",
    },
  },
  thumb: {
    position: "absolute",
    zIndex: 1,
    top: "50%",
    left: "calc(-8px * var(--lg-scale, .375) / .375)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "calc(58px * var(--lg-scale, .375) / .375)",
    height: "calc(38px * var(--lg-scale, .375) / .375)",
    borderRadius: 999,
    pointerEvents: "none",
    "--control-knob-face": "var(--lg-switch-face, 1)",
    boxShadow: "0 0 6px rgb(0 0 0 / calc((1 - var(--lg-switch-face, 1)) / .91 * .5))",
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      zIndex: 0,
      backgroundColor: {
        default: "transparent",
        "@media (hover: hover) and (pointer: fine)": {
          default: null,
          ":is([data-lenso-slot='switch']:hover:not(:focus):not([data-disabled]) *)":
            "rgb(255 255 255 / .08)",
        },
        ":is([data-lenso-slot='switch']:focus:not([data-disabled]) *)": "rgb(255 255 255 / .12)",
      },
    },
    transform: {
      default:
        "translate(var(--lg-switch-x, 0px), -50%) scale(var(--lg-switch-lift-x, .6551724), var(--lg-switch-lift-y, .6315789))",
      ":is([data-checked])":
        "translate(var(--lg-switch-x, calc(22px * var(--lg-scale, .375) / .375)), -50%) scale(var(--lg-switch-lift-x, .6551724), var(--lg-switch-lift-y, .6315789))",
    },
  },
  icon: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  controlSm: { "--lg-scale": ".3" },
  controlLg: { "--lg-scale": ".45" },
  thumbSm: { "--lg-scale": ".3" },
  thumbLg: { "--lg-scale": ".45" },
  rootSm: { "--choice-supporting-indent": "3.75rem" },
  rootLg: { "--choice-supporting-indent": "5.25rem" },
});

// One conditional map prevents StyleX composition from replacing another family's indentation.
export { checkboxSupportingStyles as switchSupportingStyles } from "../checkbox/checkbox.styles.js";
