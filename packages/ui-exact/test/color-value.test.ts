import { test, expect } from "bun:test";
import { colorKey, equalColors } from "../src/color-value";

test("picker identity matches equivalent RGB and HSL representations", () => {
  expect(equalColors("#0080ff", "rgb(0, 128, 255)")).toBe(true);
  expect(equalColors("hsl(0, 100%, 50%)", "#FF0000FF")).toBe(true);
});
test("picker identity retains alpha and separates an empty value from transparent black", () => {
  expect(equalColors("#ff000080", "#ff0000")).toBe(false);
  expect(colorKey("#ff000080")).toBe("#FF000080");
  expect(colorKey("")).toBe("");
  expect(equalColors("", "#00000000")).toBe(false);
});
test("invalid supplied colors fail rather than aliasing another selection", () => {
  expect(() => colorKey("invalid color")).toThrow();
});
