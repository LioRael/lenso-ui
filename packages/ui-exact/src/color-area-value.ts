import { colorValue, type ColorChannel, type ColorSpace } from "./color-value.js";
import { serializeColor } from "./color-field-value.js";
export function colorAreaModel(value: string, space: string, x: string, y: string) {
  if (!["rgb", "hsl", "hsb"].includes(space)) throw new RangeError("Unknown ColorArea color space");
  const parsed = colorValue(value);
  if (!parsed) throw new RangeError("ColorArea requires a color value");
  const color = parsed.toFormat(space as ColorSpace),
    channels = color.getColorChannels();
  if (
    x === y ||
    !channels.includes(x as (typeof channels)[number]) ||
    !channels.includes(y as (typeof channels)[number])
  )
    throw new RangeError("ColorArea axes must be distinct channels in its color space");
  const axes = color.getColorSpaceAxes({
    xChannel: x as ColorChannel,
    yChannel: y as ColorChannel,
  });
  const xRange = color.getChannelRange(axes.xChannel),
    yRange = color.getChannelRange(axes.yChannel);
  return {
    color,
    axes,
    xRange,
    yRange,
    x: color.getChannelValue(axes.xChannel),
    y: color.getChannelValue(axes.yChannel),
  };
}
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export function colorAreaPoint(
  value: string,
  space: string,
  x: string,
  y: string,
  px: number,
  py: number,
  rtl: boolean,
) {
  if (!Number.isFinite(px) || !Number.isFinite(py))
    throw new RangeError("ColorArea coordinates must be finite");
  const model = colorAreaModel(value, space, x, y);
  const snap = (ratio: number, range: typeof model.xRange) =>
    clamp(
      Math.round((clamp(ratio, 0, 1) * (range.maxValue - range.minValue)) / range.step) *
        range.step +
        range.minValue,
      range.minValue,
      range.maxValue,
    );
  const nextX = snap(rtl ? 1 - px : px, model.xRange),
    nextY = snap(1 - py, model.yRange);
  if (nextX === model.x && nextY === model.y) return value;
  return serializeColor(
    model.color
      .withChannelValue(model.axes.xChannel, nextX)
      .withChannelValue(model.axes.yChannel, nextY),
  );
}
export function colorAreaAxis(
  value: string,
  space: string,
  x: string,
  y: string,
  axis: "x" | "y",
  next: number,
) {
  if (!Number.isFinite(next)) throw new RangeError("ColorArea value must be finite");
  const model = colorAreaModel(value, space, x, y),
    range = axis === "x" ? model.xRange : model.yRange;
  const bounded = clamp(next, range.minValue, range.maxValue);
  return bounded === model[axis]
    ? value
    : serializeColor(
        model.color.withChannelValue(
          axis === "x" ? model.axes.xChannel : model.axes.yChannel,
          bounded,
        ),
      );
}
