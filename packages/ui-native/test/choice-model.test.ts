import { describe, expect, test } from "bun:test";
import { stepperValue, toggleSelection, validateSegments } from "../src/choice-model";

describe("native stepper bounds", () => {
  test("preserves UIKit values instead of snapping an off-grid owner value", () => {
    expect(stepperValue(7, 0, 10, 3)).toBe(7);
    expect(stepperValue(12, 0, 10, 3)).toBe(10);
    expect(stepperValue(-2, 0, 10, 3)).toBe(0);
    expect(stepperValue(4, 4, 4, 1)).toBe(4);
  });
  test("rejects unsafe native bounds and a zero step", () => {
    for (const args of [
      [0, 0, 10, 0],
      [0, 10, 0, 1],
      [NaN, 0, 10, 1],
      [0, 0, Infinity, 1],
    ]) {
      expect(() => stepperValue(args[0]!, args[1]!, args[2]!, args[3]!)).toThrow();
    }
  });
});
test("segment keys stay unambiguous when labels duplicate", () => {
  expect(() =>
    validateSegments([
      { value: "a", label: "Same" },
      { value: "b", label: "Same" },
    ]),
  ).not.toThrow();
  expect(() =>
    validateSegments([
      { value: "a", label: "One" },
      { value: "a", label: "Two" },
    ]),
  ).toThrow();
  expect(() => validateSegments([{ value: "", label: "Blank key" }])).toThrow();
});
test("group proposals preserve unknown owner values, order and immutable inputs", () => {
  const current = Object.freeze(["old-option", "a"]);
  expect(toggleSelection(current, "b", true)).toEqual(["old-option", "a", "b"]);
  expect(toggleSelection(current, "a", true)).toEqual(current);
  expect(toggleSelection(current, "a", false)).toEqual(["old-option"]);
  expect(current).toEqual(["old-option", "a"]);
});
