import { test, expect } from "bun:test";
import { colorSliderModel, colorSliderPaint, setColorSliderValue } from "../src/color-slider-value";
import { colorKey } from "../src/color-value";

test("hue endpoint survives the string protocol without moving the thumb to zero", () => {
  const value = setColorSliderValue("hsl(210, 50%, 50%)", "hue", "hsl", 360);
  expect(colorSliderModel(value, "hue", "hsl").color.getChannelValue("hue")).toBe(360);
  expect(colorKey(value)).toBe(colorKey("hsl(0, 50%, 50%)"));
});
test("hue gradient remains a full rainbow even for achromatic or transparent values", () => {
  const gradient = colorSliderPaint("hsla(120, 0%, 50%, 0)", "hue", "hsl", "horizontal", "ltr");
  expect(gradient.gradient).toContain("to right");
  expect(gradient.gradient).toContain("hsla(240, 100%, 50%, 1)");
  expect(colorKey(gradient.start)).toBe(colorKey(gradient.end));
});
test("lightness gradient includes the saturated midpoint and follows orientation", () => {
  const gradient = colorSliderPaint("hsl(120, 100%, 50%)", "lightness", "hsl", "vertical", "rtl");
  expect(gradient.gradient).toContain("to top");
  expect(gradient.gradient).toContain("hsla(120, 100%, 50%, 1)");
  expect(gradient.start).toContain("0%");
  expect(gradient.end).toContain("100%");
});
test("alpha gradient retains transparent endpoints and edits preserve HSB coordinates", () => {
  const gradient = colorSliderPaint("#0080ff80", "alpha", "rgb", "horizontal", "rtl");
  expect(gradient.gradient).toContain("to left");
  expect(gradient.start).toBe("rgba(0, 128, 255, 0)");
  const next = setColorSliderValue("hsba(120, 0%, 50%, 0.4)", "hue", "hsb", 90);
  const model = colorSliderModel(next, "hue", "hsb");
  expect(model.color.getChannelValue("hue")).toBe(90);
  expect(model.color.getChannelValue("alpha")).toBe(0.4);
});
test("invalid slider channels and nonfinite proposals fail before interaction", () => {
  expect(() => colorSliderModel("#ff0000", "hex", "rgb")).toThrow();
  expect(() => setColorSliderValue("#ff0000", "red", "rgb", NaN)).toThrow();
});
