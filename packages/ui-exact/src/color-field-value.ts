import {
  colorValue,
  parseColor,
  type Color,
  type ColorChannel,
  type ColorSpace,
} from "./color-value.js";
import { parseNumber } from "./number-parse.js";
const channels = ["red", "green", "blue", "alpha", "hue", "saturation", "brightness", "lightness"];
export function colorFieldModel(value: string, channel: string, space: string) {
  if (channel === "hex" || channel === "hexa") return null;
  if (!channels.includes(channel)) throw new RangeError(`Unknown color channel: ${channel}`);
  if (!["rgb", "hsl", "hsb"].includes(space)) throw new RangeError(`Unknown color space: ${space}`);
  const color = (colorValue(value) ?? parseColor("#000000")).toFormat(space as ColorSpace);
  const key = channel as ColorChannel,
    range = color.getChannelRange(key),
    format = color.getChannelFormatOptions(key);
  return {
    color,
    key,
    range,
    format,
    multiplier: format.style === "percent" && range.maxValue === 100 ? 100 : 1,
  };
}
export function formatColorField(value: string, channel: string, space: string, locale: string) {
  const model = colorFieldModel(value, channel, space);
  if (!value) return "";
  return model
    ? model.color.formatChannelValue(model.key, locale)
    : colorValue(value)!.toString(channel as "hex" | "hexa");
}
export function serializeColor(color: Color) {
  return color.toString(
    color.getColorSpace() === "rgb" ? "rgba" : color.getColorSpace() === "hsl" ? "hsla" : "hsba",
  );
}
export function parseColorField(
  text: string,
  value: string,
  channel: string,
  space: string,
  locale: string,
): string | undefined {
  const model = colorFieldModel(value, channel, space);
  if (!text.trim()) return "";
  if (!model) {
    if (!/^#?(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{4}|[\da-f]{8})$/i.test(text.trim())) return undefined;
    return parseColor(text.trim().startsWith("#") ? text.trim() : `#${text.trim()}`).toString(
      "hexa",
    );
  }
  const parsed = parseNumber(text, locale, model.format);
  if (parsed === null || !Number.isFinite(parsed)) return undefined;
  const next = Math.min(
    model.range.maxValue,
    Math.max(model.range.minValue, parsed * model.multiplier),
  );
  return serializeColor(model.color.withChannelValue(model.key, next));
}
export function stepColorField(value: string, channel: string, space: string, command: string) {
  const model = colorFieldModel(value, channel, space);
  if (!model) {
    const current = colorValue(value)?.toHexInt() ?? 0;
    const next =
      command === "Home"
        ? 0
        : command === "End"
          ? 0xffffff
          : Math.min(
              0xffffff,
              Math.max(
                0,
                current +
                  (command === "ArrowDown" || command === "PageDown" ? -1 : 1) *
                    (command.startsWith("Page") ? 10 : 1),
              ),
            );
    return parseColor(`#${next.toString(16).padStart(6, "0")}`).toString("hexa");
  }
  const current = model.color.getChannelValue(model.key);
  const amount = command.startsWith("Page") ? model.range.pageSize : model.range.step;
  const next =
    command === "Home"
      ? model.range.minValue
      : command === "End"
        ? model.range.maxValue
        : Math.min(
            model.range.maxValue,
            Math.max(
              model.range.minValue,
              current + (command === "ArrowDown" || command === "PageDown" ? -amount : amount),
            ),
          );
  return serializeColor(model.color.withChannelValue(model.key, Number(next.toFixed(8))));
}
export function colorFieldFormValue(value: string, channel: string, space: string, locale: string) {
  const model = colorFieldModel(value, channel, space);
  return !value
    ? ""
    : model
      ? String(model.color.getChannelValue(model.key) / model.multiplier)
      : formatColorField(value, channel, space, locale);
}
