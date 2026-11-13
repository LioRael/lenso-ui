// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const colorSliderStyles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    gap: {
      default: 4,
      ":not(:has([data-lenso-slot='label'])):not(:has([data-lenso-slot='color-slider-output']))": 0,
    },
    gridTemplateAreas: {
      default: '"label output" "track track"',
      ":has([data-lenso-slot='label']):not(:has([data-lenso-slot='color-slider-output']))":
        '"label" "track"',
      ":not(:has([data-lenso-slot='label'])):has([data-lenso-slot='color-slider-output'])":
        '"output" "track"',
      ":not(:has([data-lenso-slot='label'])):not(:has([data-lenso-slot='color-slider-output']))":
        '"track"',
    },
    gridTemplateColumns: {
      default: "1fr auto",
      ":not(:has([data-lenso-slot='label']))": "1fr",
      ":not(:has([data-lenso-slot='color-slider-output']))": "1fr",
    },
  },
  vertical: {
    height: "100%",
    width: "fit-content",
    gap: {
      default: 8,
      ":not(:has([data-lenso-slot='label'])):not(:has([data-lenso-slot='color-slider-output']))": 0,
    },
    gridTemplateAreas: {
      default: '"output" "track" "label"',
      ":has([data-lenso-slot='label']):not(:has([data-lenso-slot='color-slider-output']))":
        '"track" "label"',
      ":not(:has([data-lenso-slot='label'])):has([data-lenso-slot='color-slider-output'])":
        '"output" "track"',
      ":not(:has([data-lenso-slot='label'])):not(:has([data-lenso-slot='color-slider-output']))":
        '"track"',
    },
    gridTemplateColumns: "1fr",
    gridTemplateRows: {
      default: "auto minmax(0, 1fr) auto",
      ":has([data-lenso-slot='label']):not(:has([data-lenso-slot='color-slider-output']))":
        "minmax(0, 1fr) auto",
      ":not(:has([data-lenso-slot='label'])):has([data-lenso-slot='color-slider-output'])":
        "auto minmax(0, 1fr)",
      ":not(:has([data-lenso-slot='label'])):not(:has([data-lenso-slot='color-slider-output']))":
        "minmax(0, 1fr)",
    },
    alignItems: "center",
    justifyItems: "center",
  },
  label: { gridArea: "label", width: "fit-content", fontSize: 13, fontWeight: 600 },
  output: { gridArea: "output", fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" },
  track: {
    position: "relative",
    gridArea: "track",
    borderRadius: 0,
    height: 34,
    width: "calc(100% - 34px)",
    justifySelf: "center",
    boxShadow:
      "inset 0 1px 0 var(--lenso-control-border),inset 0 -1px 0 var(--lenso-control-border)",
  },
  verticalTrack: {
    width: 34,
    height: "calc(100% - 34px)",
    boxShadow:
      "inset 1px 0 0 var(--lenso-control-border),inset -1px 0 0 var(--lenso-control-border)",
  },
  thumb: {
    position: "absolute",
    width: 34,
    height: 34,
    top: "50%",
    borderWidth: 0,
    backgroundColor: "transparent",
    outline: "none",
    touchAction: "none",
    cursor: { default: "grab", ":is([data-dragging])": "grabbing" },
    zIndex: 1,
  },
  verticalThumb: { width: 34, height: 34, top: "auto", left: "50%" },
  optical: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: 999,
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: "white",
    boxShadow: "0 0 3px rgb(0 0 0 / .1)",
    scale: {
      default:
        "calc(1 + (var(--lg-slider-lift-x, .6551724) - .6551724) * .2) calc(1 + (var(--lg-slider-lift-y, .6315789) - .6315789) * .2)",
      ":is([data-lg-slider-thumb][data-orientation='vertical'] *)":
        "calc(1 + (var(--lg-slider-lift-y, .6315789) - .6315789) * .2) calc(1 + (var(--lg-slider-lift-x, .6551724) - .6551724) * .2)",
    },
    outline: {
      default: "none",
      ":is([data-lg-slider-thumb]:is(:focus-visible, :has(input:focus-visible)) *)":
        "2px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 3,
  },
  focused: { outline: "2px solid var(--lenso-focus-ring)", outlineOffset: 3 },
  dragging: { cursor: "grabbing" },
  disabled: { opacity: 0.35 },
  caps: {
    "::before": {
      content: '""',
      position: "absolute",
      pointerEvents: "none",
      top: 0,
      height: "100%",
      width: 17,
      insetInlineStart: -17,
      borderStartStartRadius: tokens.shapeContent2xl,
      borderEndStartRadius: tokens.shapeContent2xl,
      background:
        "linear-gradient(var(--track-start-color),var(--track-start-color)),var(--lenso-color-checkerboard) 50% / 16px 16px",
      boxShadow:
        "inset 1px 0 0 var(--lenso-control-border),inset 0 1px 0 var(--lenso-control-border),inset 0 -1px 0 var(--lenso-control-border)",
    },
    "::after": {
      content: '""',
      position: "absolute",
      pointerEvents: "none",
      top: 0,
      height: "100%",
      width: 17,
      insetInlineEnd: -17,
      borderStartEndRadius: tokens.shapeContent2xl,
      borderEndEndRadius: tokens.shapeContent2xl,
      backgroundColor: "var(--track-end-color)",
      boxShadow:
        "inset -1px 0 0 var(--lenso-control-border),inset 0 1px 0 var(--lenso-control-border),inset 0 -1px 0 var(--lenso-control-border)",
    },
  },
  verticalCaps: {
    "::before": {
      top: "auto",
      bottom: -17,
      left: 0,
      width: "100%",
      height: 17,
      insetInlineStart: "auto",
      borderStartStartRadius: 0,
      borderEndStartRadius: 999,
      borderEndEndRadius: 999,
    },
    "::after": {
      top: -17,
      left: 0,
      width: "100%",
      height: 17,
      insetInlineEnd: "auto",
      borderStartStartRadius: 999,
      borderStartEndRadius: 999,
      borderEndEndRadius: 0,
    },
  },
});
