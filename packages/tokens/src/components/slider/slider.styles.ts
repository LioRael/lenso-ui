/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles; UI SDK owns range geometry.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const sliderStyles = stylex.create({
  field: { display: "contents" },
  root: {
    display: "grid",
    width: { default: "100%", ":is([data-orientation='vertical'])": "auto" },
    height: { default: "auto", ":is([data-orientation='vertical'])": "100%" },
    gap: {
      default: 0,
      ":has(> [data-lenso-slot='slider-label'], > [data-lenso-slot='slider-output'])": 4,
    },
    gridTemplateAreas: {
      default: '"track track"',
      ":has(> [data-lenso-slot='slider-label'], > [data-lenso-slot='slider-output'])":
        '"label output" "track track"',
      ":is([data-orientation='vertical'])": '"output" "track" "label"',
    },
    gridTemplateColumns: { default: "1fr auto", ":is([data-orientation='vertical'])": "1fr" },
    gridTemplateRows: {
      default: "auto",
      ":has(> [data-lenso-slot='slider-label'], > [data-lenso-slot='slider-output'])": "auto auto",
      ":is([data-orientation='vertical'])": "auto 1fr auto",
    },
    opacity: { default: 1, ":is([data-disabled])": 0.5 },
  },
  label: { gridArea: "label", fontSize: ".875rem", fontWeight: 500, color: tokens.labelPrimary },
  output: {
    gridArea: "output",
    fontSize: ".875rem",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    color: tokens.labelPrimary,
  },
  control: {
    gridArea: "track",
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: { default: 50, ":is([data-orientation='vertical'])": "100%" },
    width: { default: "100%", ":is([data-orientation='vertical'])": 40 },
    minHeight: { default: 50, ":is([data-orientation='vertical'])": 100 },
    touchAction: "pan-y",
    userSelect: "none",
    padding: 0,
  },
  track: {
    position: "relative",
    width: "100%",
    height: { default: 6, ":is([data-orientation='vertical'])": "100%" },
    maxWidth: { default: null, ":is([data-orientation='vertical'])": 6 },
    marginInline: "auto",
    borderRadius: 3,
    backgroundColor: "var(--lenso-fill-primary)",
  },
  trackPaint: { position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none" },
  fill: {
    height: "100%",
    width: "100%",
    borderRadius: "inherit",
    pointerEvents: "none",
    backgroundColor: "var(--lenso-tint)",
  },
  thumb: {
    width: 44,
    height: 44,
    backgroundColor: "transparent",
    borderWidth: 0,
    outline: "none",
    touchAction: "none",
    cursor: { default: "pointer", ":is([data-disabled])": "default" },
  },
  optical: {
    position: "absolute",
    pointerEvents: "none",
    borderRadius: 999,
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
    width: { default: 58, ":is([data-lg-slider-thumb][data-orientation='vertical'] *)": 38 },
    height: { default: 38, ":is([data-lg-slider-thumb][data-orientation='vertical'] *)": 58 },
    scale: {
      default: "var(--lg-slider-lift-x, .6551724) var(--lg-slider-lift-y, .6315789)",
      ":is([data-lg-slider-thumb][data-orientation='vertical'] *)":
        "var(--lg-slider-lift-y, .6315789) var(--lg-slider-lift-x, .6551724)",
    },
    backdropFilter: "blur(2px) brightness(1.15) saturate(1.5)",
    boxShadow:
      "0 6px 13px rgb(0 0 0 / .12), 0 .5px 4px rgb(0 0 0 / .12), inset 0 1px .5px rgb(255 255 255 / calc((1 - var(--lg-slider-face, 1)) * .28)), inset 0 -1px .5px rgb(255 255 255 / calc((1 - var(--lg-slider-face, 1)) * .28))",
    outline: {
      default: "none",
      ":is([data-lg-slider-thumb]:is(:focus-visible, :has(input:focus-visible)) *):not(:is([data-lenso-focus-method='pointer'] *))":
        "2px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 3,
  },
  knobMaterial: {
    backdropFilter: "none",
    "--control-knob-face": "var(--lg-slider-face, 1)",
    boxShadow:
      "0 6px 13px rgb(0 0 0 / calc(var(--lg-slider-face, 1) * .12)), 0 .5px 4px rgb(0 0 0 / calc(var(--lg-slider-face, 1) * .12)), 0 0 6px rgb(0 0 0 / calc((1 - var(--lg-slider-face, 1)) / .91 * .4))",
  },
  face: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    backgroundColor: "white",
    opacity: "var(--lg-slider-face, 1)",
  },
  marks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: ".75rem",
    color: tokens.labelSecondary,
  },
});
