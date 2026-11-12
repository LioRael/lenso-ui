import { colorFieldModel, serializeColor } from "./color-field-value.js";
import { parseColor } from "./color-value.js";
export function colorSliderModel(value: string, channel: string, space: string) {
  if (!value) throw new RangeError("ColorSlider requires a color value");
  const model = colorFieldModel(value, channel, space);
  if (!model) throw new RangeError("ColorSlider requires a numeric color channel");
  return model;
}
export function setColorSliderValue(value: string, channel: string, space: string, next: number) {
  const model = colorSliderModel(value, channel, space);
  const clamped = Math.min(model.range.maxValue, Math.max(model.range.minValue, next));
  if (!Number.isFinite(next)) throw new RangeError("ColorSlider value must be finite");
  return serializeColor(model.color.withChannelValue(model.key, clamped));
}
export function colorSliderPaint(
  value: string,
  channel: string,
  space: string,
  orientation: string,
  direction: string,
) {
  if (!["horizontal", "vertical"].includes(orientation) || !["ltr", "rtl"].includes(direction))
    throw new RangeError("Unknown ColorSlider orientation or direction");
  const model = colorSliderModel(value, channel, space);
  const color =
    channel === "hue"
      ? parseColor(`hsl(${model.color.getChannelValue("hue")}, 100%, 50%)`)
      : channel === "alpha"
        ? model.color
        : model.color.withChannelValue("alpha", 1);
  const stops =
    channel === "hue"
      ? [0, 60, 120, 180, 240, 300, 360]
      : channel === "lightness"
        ? [
            model.range.minValue,
            (model.range.maxValue + model.range.minValue) / 2,
            model.range.maxValue,
          ]
        : [model.range.minValue, model.range.maxValue];
  const colors = stops.map((stop) => color.withChannelValue(model.key, stop).toString("css"));
  return {
    gradient: `linear-gradient(to ${orientation === "vertical" ? "top" : direction === "rtl" ? "left" : "right"}, ${colors.join(", ")})`,
    start: colors[0]!,
    end: colors.at(-1)!,
    thumb: color.toString("css"),
  };
}
