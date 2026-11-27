import type { ColorChannel, ColorPickerSpace } from "@ui-sdk/core/color-picker";
const channels: Record<ColorPickerSpace, readonly [ColorChannel, ColorChannel, ColorChannel]> = {
  hsv: ["hue", "saturation", "brightness"],
  hsl: ["hue", "saturation", "lightness"],
  srgb: ["red", "green", "blue"],
  oklch: ["lightness", "chroma", "hue"],
};
export function getColorChannels(space: ColorPickerSpace) {
  return channels[space];
}
