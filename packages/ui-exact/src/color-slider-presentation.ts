import * as stylex from "@stylexjs/stylex";
import { colorSliderStyles as s } from "@lenso/tokens/color-slider";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  control: { touchAction: "none" },
  caps: {
    backgroundImage: {
      "::before":
        "linear-gradient(var(--track-start-color),var(--track-start-color)),var(--lenso-color-checkerboard)",
    },
    backgroundPosition: { "::before": "0 0,50%" },
    backgroundSize: { "::before": "auto,16px 16px" },
  },
});
export const colorSliderKinds = [
  "color-slider-label",
  "color-slider-output",
  "color-slider-optical",
];
export function colorSliderPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "color-slider-label") return [s.label];
  if (kind === "color-slider-output") return [s.output];
  if (kind === "color-slider-optical") return [s.optical];
  if (!["color-slider", "color-slider-track", "color-slider-thumb"].includes(kind))
    return undefined;
  const vertical = data["orientation"] === "vertical";
  if (kind === "color-slider")
    return [s.root, vertical && s.vertical, data["lensoDisabled"] === "true" && s.disabled];
  if (kind === "color-slider-track")
    return [
      s.track,
      s.caps,
      vertical && s.verticalTrack,
      vertical && s.verticalCaps,
      native.control,
      native.caps,
    ];
  return [s.thumb, vertical && s.verticalThumb];
}
