import * as stylex from "@stylexjs/stylex";
import { colorSwatchStyles as swatch } from "@lenso/tokens/color-swatch";
import { colorSwatchPickerStyles as picker } from "@lenso/tokens/color-swatch-picker";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  checkerboard: {
    backgroundImage: "var(--lenso-color-checkerboard)",
    backgroundPosition: "50%",
    backgroundSize: "16px 16px",
  },
  fill: { position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none" },
  item: {
    outline: { default: "none", ":has(input:focus-visible)": "2px solid var(--lenso-focus-ring)" },
  },
  selectedSwatch: {
    transform: {
      default: "none",
      ":is([data-slot='color-swatch-picker-item']:has(input:checked) *)": "scale(.77)",
    },
  },
});
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
function size(value: string | undefined) {
  if (!sizes.includes(value as (typeof sizes)[number]))
    throw new RangeError(`Unknown color size: ${value}`);
  return value as (typeof sizes)[number];
}
export const colorKinds = ["color-swatch-fill"];
export function colorPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "color-swatch-fill") return [native.fill];
  if (kind === "color-swatch")
    return [
      swatch.root,
      swatch[size(data["lensoSize"])],
      data["lensoVariant"] === "square" && swatch.square,
      native.checkerboard,
    ];
  if (kind === "color-swatch-picker")
    return [
      picker.root,
      data["lensoLayout"] === "stack" && picker.stack,
      data["lensoLayout"] === "palette" && picker.palette,
    ];
  if (kind === "color-swatch-picker-item")
    return [
      picker.item,
      picker[size(data["lensoSize"])],
      data["lensoVariant"] === "square" && picker.square,
      data["lensoDisabled"] === "true" && picker.disabled,
      data["lensoLayout"] === "palette" && picker.paletteItem,
      native.item,
      data["lensoActive"] === "true" && picker.selected,
      data["lensoLayout"] === "palette" && data["lensoActive"] === "true" && picker.paletteSelected,
    ];
  if (kind === "color-swatch-picker-swatch")
    return [
      swatch.root,
      picker.swatch,
      data["lensoLayout"] === "palette" ? picker.paletteSwatch : native.selectedSwatch,
      native.checkerboard,
    ];
  return undefined;
}
