import * as stylex from "@stylexjs/stylex";
import { sliderStyles } from "@lenso/tokens/slider";
import { knobMaterialStyles } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: {
    gridTemplateAreas: {
      default: '"track track"',
      ":has(> [data-slot='slider-label'], > [data-slot='slider-output'])":
        '"label output" "track track"',
      ":is([data-orientation='vertical'])": '"output" "track" "label"',
      ":is([data-orientation='vertical']):has(> [data-slot='slider-label'], > [data-slot='slider-output'])":
        '"output" "track" "label"',
    },
    gridTemplateRows: {
      default: "auto",
      ":has(> [data-slot='slider-label'], > [data-slot='slider-output'])": "auto auto",
      ":is([data-orientation='vertical'])": "auto 1fr auto",
      ":is([data-orientation='vertical']):has(> [data-slot='slider-label'], > [data-slot='slider-output'])":
        "auto 1fr auto",
    },
  },
  input: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    padding: 0,
    opacity: 0,
    pointerEvents: "none",
    cursor: "inherit",
    zIndex: 2,
    touchAction: "none",
  },
  fill: { color: "var(--lenso-tint)" },
  thumb: {
    zIndex: {
      default: 0,
      ":is([data-lenso-last-thumb])": 1,
      ":is([data-lenso-active-thumb])": 2,
      ":focus-within": 2,
    },
  },
});
const parts = new Map<string, StyleInput>([
  ["slider", [sliderStyles.root, native.root]],
  ["slider-label", [sliderStyles.label]],
  ["slider-output", [sliderStyles.output]],
  ["slider-control", [sliderStyles.control]],
  ["slider-track", [sliderStyles.track]],
  ["slider-track-paint", [sliderStyles.trackPaint]],
  ["slider-fill", [sliderStyles.fill, native.fill]],
  ["slider-thumb", [sliderStyles.thumb, native.thumb]],
  ["slider-input", [native.input]],
  ["slider-optical", [sliderStyles.optical, sliderStyles.knobMaterial]],
  [
    "slider-knob-lens",
    [
      knobMaterialStyles.layer,
      knobMaterialStyles.slider,
      knobMaterialStyles.controlEdge,
      knobMaterialStyles.sliderEdge,
    ],
  ],
  ["slider-knob-face", [knobMaterialStyles.face]],
  ["slider-marks", [sliderStyles.marks]],
]);
export const sliderKinds = [...parts.keys()];
export function sliderPresentation(kind: string): StyleInput | undefined {
  return parts.get(kind);
}
