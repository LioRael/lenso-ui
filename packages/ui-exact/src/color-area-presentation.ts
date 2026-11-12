import * as stylex from "@stylexjs/stylex";
import { colorAreaStyles as s } from "@lenso/tokens/color-area";
import { sliderStyles } from "@lenso/tokens/slider";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  optical: {
    outline: {
      default: "none",
      ":is([data-lenso-kind='color-area']:has(input:focus-visible) *)":
        "2px solid var(--lenso-focus-ring)",
    },
  },
});
export const colorAreaKinds = [
  "color-area-thumb",
  "color-area-secondary",
  "color-area-optical",
  "color-area-face",
];
export function colorAreaPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "color-area")
    return [
      s.root,
      data["lensoDisabled"] === "true" && s.disabled,
      data["lensoDots"] === "true" && s.dots,
    ];
  if (kind === "color-area-thumb") return [s.thumb];
  if (kind === "color-area-secondary") return [s.secondaryAxis];
  if (kind === "color-area-optical") return [sliderStyles.optical, native.optical];
  if (kind === "color-area-face") return [sliderStyles.face];
  return undefined;
}
