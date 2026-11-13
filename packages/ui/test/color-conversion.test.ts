import { expect, test } from "bun:test";
import { colorFromSDK } from "../src/utils/color-state.js";

test("SDK CSS color syntax converts to the domain model without quantizing alpha", () => {
  const rgb = colorFromSDK("rgb(57 198 255 / 0.5)");
  expect(rgb.getChannelValue("red")).toBeCloseTo(57);
  expect(rgb.getChannelValue("green")).toBeCloseTo(198);
  expect(rgb.getChannelValue("blue")).toBeCloseTo(255);
  expect(rgb.getChannelValue("alpha")).toBe(0.5);
  const hsl = colorFromSDK("hsl(120 100% 50% / 0.25)");
  expect(hsl.toString("hex")).toBe("#00FF00");
  expect(hsl.getChannelValue("alpha")).toBe(0.25);
});
