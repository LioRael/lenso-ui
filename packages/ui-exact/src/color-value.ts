import { parseColor, type Color, type ColorChannel, type ColorSpace } from "react-stately/Color";

export { parseColor };
export type { Color, ColorChannel, ColorSpace };
export function colorValue(value: string): Color | null {
  if (value === "") return null;
  const color = parseColor(value);
  // String round-trips must retain the hue slider's inclusive endpoint, not move its thumb to zero.
  return /^hs[lb]a?\(\s*360(?:\.0+)?\s*,/i.test(value.trim())
    ? color.withChannelValue("hue", 360)
    : color;
}
export function colorKey(value: string): string {
  return colorValue(value)?.toString("hexa") ?? "";
}
export function equalColors(a: string, b: string): boolean {
  return colorKey(a) === colorKey(b);
}
