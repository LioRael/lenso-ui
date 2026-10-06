/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX styles; Base UI owns range geometry.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const sliderStyles = stylex.create({
  root: {
    display: "grid",
    width: { default: "100%", ":is([data-orientation='vertical'])": "auto" },
    height: { default: "auto", ":is([data-orientation='vertical'])": "100%" },
    gap: { default: ".25rem", ":is([data-orientation='vertical'])": ".5rem" },
    gridTemplateAreas: {
      default: '"label output" "track track"',
      ":is([data-orientation='vertical'])": '"output" "track" "label"',
    },
    gridTemplateColumns: { default: "1fr auto", ":is([data-orientation='vertical'])": "1fr" },
    gridTemplateRows: {
      default: "auto auto",
      ":is([data-orientation='vertical'])": "auto 1fr auto",
    },
    opacity: { default: 1, ":is([data-disabled])": tokens.disabledOpacity },
  },
  label: { gridArea: "label", fontSize: ".875rem", fontWeight: 500, color: tokens.foreground },
  output: {
    gridArea: "output",
    fontSize: ".875rem",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    color: tokens.foreground,
  },
  control: {
    gridArea: "track",
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: { default: "1.25rem", ":is([data-orientation='vertical'])": "100%" },
    width: { default: "100%", ":is([data-orientation='vertical'])": "1.25rem" },
    minHeight: { default: "1.25rem", ":is([data-orientation='vertical'])": "6.25rem" },
    touchAction: "none",
    userSelect: "none",
    paddingInline: { default: ".75rem", ":is([data-orientation='vertical'])": 0 },
    paddingBlock: { default: 0, ":is([data-orientation='vertical'])": ".75rem" },
  },
  track: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: tokens.radiusXl,
    backgroundColor: tokens.default,
  },
  fill: {
    position: "absolute",
    height: { default: "100%", ":is([data-orientation='vertical'])": null },
    width: { default: null, ":is([data-orientation='vertical'])": "100%" },
    borderRadius: "inherit",
    pointerEvents: "none",
    backgroundColor: tokens.accent,
  },
  thumb: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: { default: "1.75rem", ":is([data-orientation='vertical'])": "1.25rem" },
    height: { default: "1.25rem", ":is([data-orientation='vertical'])": "1.75rem" },
    borderRadius: tokens.radiusXl,
    backgroundColor: tokens.accent,
    cursor: {
      default: "grab",
      ":is([data-dragging])": "grabbing",
      ":is([data-disabled])": "default",
    },
    outline: "none",
    boxShadow: {
      default: "none",
      ":is(:focus-visible, :has(input:focus-visible))": focusRing.outer,
    },
    "::after": {
      content: '""',
      position: "relative",
      zIndex: 1,
      width: { default: "1.5rem", ":is([data-orientation='vertical'])": "1rem" },
      height: { default: "1rem", ":is([data-orientation='vertical'])": "1.5rem" },
      borderRadius: tokens.radiusLg,
      backgroundColor: tokens.accentForeground,
      boxShadow: tokens.fieldShadow,
      scale: { default: "1", ":is([data-dragging])": ".9" },
      transition: {
        default: `scale 250ms ${tokens.easeOut}`,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  marks: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: ".75rem",
    color: tokens.muted,
  },
});
