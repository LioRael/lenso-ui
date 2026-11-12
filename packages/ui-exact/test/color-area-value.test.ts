import { test, expect } from "bun:test";
import { colorAreaModel, colorAreaPoint } from "../src/color-area-value";
import { colorAreaGradient } from "../src/color-area-gradient";

test("two-axis pointer changes are one color retaining hue and alpha", () => {
  const value = colorAreaPoint(
    "hsba(210, 50%, 50%, 0.4)",
    "hsb",
    "saturation",
    "brightness",
    0.25,
    0.2,
    false,
  );
  const model = colorAreaModel(value, "hsb", "saturation", "brightness");
  expect(model.x).toBe(25);
  expect(model.y).toBe(80);
  expect(model.color.getChannelValue("hue")).toBe(210);
  expect(model.color.getChannelValue("alpha")).toBe(0.4);
});
test("RTL reverses only the horizontal point and coordinates clamp at boundaries", () => {
  const value = colorAreaPoint("#0080ff", "rgb", "red", "green", -1, 2, true);
  const model = colorAreaModel(value, "rgb", "red", "green");
  expect(model.x).toBe(255);
  expect(model.y).toBe(0);
  expect(model.color.getChannelValue("blue")).toBe(255);
});
test("hue as an area axis retains the inclusive endpoint", () => {
  const next = colorAreaPoint("hsla(210, 50%, 50%, 1)", "hsl", "hue", "saturation", 1, 0.5, false);
  expect(colorAreaModel(next, "hsl", "hue", "saturation").x).toBe(360);
});
test("RGB gradient separates additive layers and mirrors only its horizontal axis", () => {
  const model = colorAreaModel("#0080ff", "rgb", "red", "green");
  const gradient = colorAreaGradient(model.color, model.axes, "rtl");
  expect(gradient.backgroundBlendMode).toBe("screen");
  expect(gradient.background).toContain("to left");
  expect(gradient.background).toContain("to top");
});
test("HSB and HSL planes retain their fixed hue with ordinary gradient blending", () => {
  for (const [space, y] of [
    ["hsb", "brightness"],
    ["hsl", "lightness"],
  ]) {
    const model = colorAreaModel("#0080ff", space!, "saturation", y!);
    const gradient = colorAreaGradient(model.color, model.axes, "ltr");
    expect(gradient.backgroundBlendMode).toBe("normal");
    expect(gradient.background).toContain("to right");
  }
});
test("duplicate axes, alpha axes and nonfinite points are rejected", () => {
  expect(() => colorAreaModel("#ff0000", "rgb", "red", "red")).toThrow();
  expect(() => colorAreaModel("#ff0000", "rgb", "red", "alpha")).toThrow();
  expect(() => colorAreaPoint("#ff0000", "rgb", "red", "green", NaN, 0, false)).toThrow();
});
