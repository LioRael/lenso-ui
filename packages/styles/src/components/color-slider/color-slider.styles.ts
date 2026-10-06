/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const colorSliderStyles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    gap: {
      default: 4,
      ":not(:has([data-slot='label'])):not(:has([data-slot='color-slider-output']))": 0,
    },
    gridTemplateAreas: {
      default: '"label output" "track track"',
      ":has([data-slot='label']):not(:has([data-slot='color-slider-output']))": '"label" "track"',
      ":not(:has([data-slot='label'])):has([data-slot='color-slider-output'])": '"output" "track"',
      ":not(:has([data-slot='label'])):not(:has([data-slot='color-slider-output']))": '"track"',
    },
    gridTemplateColumns: {
      default: "1fr auto",
      ":not(:has([data-slot='label']))": "1fr",
      ":not(:has([data-slot='color-slider-output']))": "1fr",
    },
  },
  vertical: {
    height: "100%",
    width: "fit-content",
    gap: {
      default: 8,
      ":not(:has([data-slot='label'])):not(:has([data-slot='color-slider-output']))": 0,
    },
    gridTemplateAreas: {
      default: '"output" "track" "label"',
      ":has([data-slot='label']):not(:has([data-slot='color-slider-output']))": '"track" "label"',
      ":not(:has([data-slot='label'])):has([data-slot='color-slider-output'])": '"output" "track"',
      ":not(:has([data-slot='label'])):not(:has([data-slot='color-slider-output']))": '"track"',
    },
    gridTemplateColumns: "1fr",
    gridTemplateRows: {
      default: "auto minmax(0, 1fr) auto",
      ":has([data-slot='label']):not(:has([data-slot='color-slider-output']))":
        "minmax(0, 1fr) auto",
      ":not(:has([data-slot='label'])):has([data-slot='color-slider-output'])":
        "auto minmax(0, 1fr)",
      ":not(:has([data-slot='label'])):not(:has([data-slot='color-slider-output']))":
        "minmax(0, 1fr)",
    },
    alignItems: "center",
    justifyItems: "center",
  },
  label: { gridArea: "label", width: "fit-content", fontSize: 14, fontWeight: 500 },
  output: { gridArea: "output", fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums" },
  track: {
    position: "relative",
    gridArea: "track",
    borderRadius: tokens.radius2xl,
    height: 20,
    width: "calc(100% - 20px)",
    justifySelf: "center",
    boxShadow: "inset 0 1px 0 rgba(0,0,0,.1),inset 0 -1px 0 rgba(0,0,0,.1)",
  },
  verticalTrack: {
    width: 20,
    height: "calc(100% - 20px)",
    boxShadow: "inset 1px 0 0 rgba(0,0,0,.1),inset -1px 0 0 rgba(0,0,0,.1)",
  },
  thumb: {
    position: "absolute",
    top: "50%",
    display: "flex",
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius2xl,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "white",
    boxSizing: "border-box",
    "--lenso-focus-elevation": tokens.shadowOverlay,
    boxShadow: focusRing.elevation,
    cursor: "grab",
    zIndex: 1,
  },
  verticalThumb: { top: "auto", left: "50%" },
  focused: { outline: "none", boxShadow: focusRing.outerElevated, zIndex: 10 },
  dragging: { cursor: "grabbing" },
  disabled: { opacity: tokens.disabledOpacity },
  caps: {
    "::before": {
      content: '""',
      position: "absolute",
      pointerEvents: "none",
      top: 0,
      height: "100%",
      width: 10,
      insetInlineStart: -10,
      borderStartStartRadius: tokens.radius2xl,
      borderEndStartRadius: tokens.radius2xl,
      background:
        "linear-gradient(var(--track-start-color),var(--track-start-color)),repeating-conic-gradient(#efefef 0% 25%,#f7f7f7 0% 50%) 50% / 16px 16px",
      boxShadow:
        "inset 1px 0 0 rgba(0,0,0,.1),inset 0 1px 0 rgba(0,0,0,.1),inset 0 -1px 0 rgba(0,0,0,.1)",
    },
    "::after": {
      content: '""',
      position: "absolute",
      pointerEvents: "none",
      top: 0,
      height: "100%",
      width: 10,
      insetInlineEnd: -10,
      borderStartEndRadius: tokens.radius2xl,
      borderEndEndRadius: tokens.radius2xl,
      backgroundColor: "var(--track-end-color)",
      boxShadow:
        "inset -1px 0 0 rgba(0,0,0,.1),inset 0 1px 0 rgba(0,0,0,.1),inset 0 -1px 0 rgba(0,0,0,.1)",
    },
  },
  verticalCaps: {
    "::before": {
      top: "auto",
      bottom: -10,
      left: 0,
      width: "100%",
      height: 10,
      insetInlineStart: "auto",
      borderStartStartRadius: 0,
      borderEndStartRadius: 999,
      borderEndEndRadius: 999,
    },
    "::after": {
      top: -10,
      left: 0,
      width: "100%",
      height: 10,
      insetInlineEnd: "auto",
      borderStartStartRadius: 999,
      borderStartEndRadius: 999,
      borderEndEndRadius: 0,
    },
  },
});
