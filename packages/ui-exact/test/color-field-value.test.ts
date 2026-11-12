import { test, expect } from "bun:test";
import { parseColor } from "../src/color-value";
import {
  formatColorField,
  parseColorField,
  stepColorField,
  colorFieldFormValue,
} from "../src/color-field-value";

test("hex editing canonicalizes alpha while retaining an explicit hexa display", () => {
  expect(parseColorField("f008", "", "hexa", "rgb", "en-US")).toBe("#FF000088");
  expect(formatColorField("#ff000088", "hex", "rgb", "en-US")).toBe("#FF0000");
  expect(formatColorField("#ff000088", "hexa", "rgb", "en-US")).toBe("#FF000088");
  expect(parseColorField("#12", "#ff0000", "hex", "rgb", "en-US")).toBeUndefined();
});
test("localized percent editing and native form values use the model fraction", () => {
  const result = parseColorField("25 %", "#0080ffff", "alpha", "rgb", "fr-FR")!;
  expect(parseColor(result).getChannelValue("alpha")).toBe(0.25);
  expect(colorFieldFormValue(result, "alpha", "rgb", "fr-FR")).toBe("0.25");
  expect(formatColorField(result, "alpha", "rgb", "en-US")).toBe("25%");
});
test("hundred-unit percent channels retain model units and submit fractions", () => {
  const result = parseColorField("25 %", "hsla(120, 50%, 50%, 0.4)", "saturation", "hsl", "fr-FR")!;
  expect(parseColor(result).getChannelValue("saturation")).toBe(25);
  expect(colorFieldFormValue(result, "saturation", "hsl", "fr-FR")).toBe("0.25");
});
test("channel edits retain hue and alpha in an achromatic color instead of round-tripping RGB", () => {
  const result = stepColorField("hsla(120, 0%, 50%, 0.4)", "hue", "hsl", "ArrowUp");
  const model = parseColor(result);
  expect(model.getColorSpace()).toBe("hsl");
  expect(model.getChannelValue("hue")).toBe(121);
  expect(model.getChannelValue("alpha")).toBe(0.4);
});
test("channel range clamps typed values and keyboard boundaries", () => {
  expect(
    parseColor(parseColorField("999", "#0080ffff", "red", "rgb", "en-US")!).getChannelValue("red"),
  ).toBe(255);
  expect(parseColor(stepColorField("#0080ffff", "red", "rgb", "Home")).getChannelValue("red")).toBe(
    0,
  );
  expect(parseColor(stepColorField("#0080ffff", "red", "rgb", "End")).getChannelValue("red")).toBe(
    255,
  );
  expect(parseColorField("not a number", "#0080ffff", "red", "rgb", "en-US")).toBeUndefined();
});
test("invalid channels and color spaces are not silently projected to another channel", () => {
  expect(() => formatColorField("#ff0000", "hue", "rgb", "en-US")).toThrow();
  expect(() => formatColorField("#ff0000", "red", "unknown", "en-US")).toThrow();
});

test("HSB brightness edits retain their color space and alpha", () => {
  const result = parseColor(
    parseColorField("25%", "hsba(120, 50%, 80%, 0.4)", "brightness", "hsb", "en-US")!,
  );
  expect(result.getColorSpace()).toBe("hsb");
  expect(result.getChannelValue("brightness")).toBe(25);
  expect(result.getChannelValue("alpha")).toBe(0.4);
});
