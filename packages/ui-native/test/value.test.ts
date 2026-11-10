import { describe, expect, test } from "bun:test";
import { sliderValue } from "../src/value";

// Native callbacks can propose values outside the track or between discrete steps.
// These cases protect the value boundary shared by both platform controls.
describe("slider proposals", () => {
  test("snaps relative to the minimum", () => {
    expect(sliderValue(6, 3, 15, 4)).toBe(7);
    expect(sliderValue(-6, -10, 10, 3)).toBe(-7);
  });
  test("clamps overshoot and a final incomplete step", () => {
    expect(sliderValue(-20, 0, 10, 3)).toBe(0);
    expect(sliderValue(12, 0, 10, 3)).toBe(10);
    expect(sliderValue(10, 0, 10, 6)).toBe(10);
  });
  test("rejects invalid public values and ranges", () => {
    for (const args of [
      [NaN, 0, 1, 1],
      [0, 0, Infinity, 1],
      [0, 1, 1, 1],
      [0, 2, 1, 1],
      [0, 0, 1, -1],
    ] as const)
      expect(() => sliderValue(...args)).toThrow();
  });
  test("keeps continuous values when step is zero", () => {
    expect(sliderValue(0.125, 0, 1, 0)).toBe(0.125);
    expect(sliderValue(1.2, 0, 1, 0)).toBe(1);
  });
});
