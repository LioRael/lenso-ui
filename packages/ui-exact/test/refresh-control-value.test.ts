import { expect, test } from "bun:test";
import { refreshAxis, refreshDistance, validateRefresh } from "../src/refresh-control-value";
// Existing range tests do not cover touch axis arbitration or resisted release thresholds.
test("refresh pulls lock only after slop on a downward vertical axis", () => {
  expect(refreshAxis(8, 8)).toBe("waiting");
  expect(refreshAxis(9, 8)).toBe("ignore");
  expect(refreshAxis(0, -9)).toBe("ignore");
  expect(refreshAxis(9, 9)).toBe("ignore");
  expect(refreshAxis(2, 9)).toBe("pull");
});
test("refresh release uses resisted distance, bounded overshoot and finite configuration", () => {
  expect(refreshDistance(144, 72)).toBe(72);
  expect(refreshDistance(1000, 72)).toBe(112);
  expect(refreshDistance(-20, 72)).toBe(0);
  for (const threshold of [0, -1, NaN, Infinity])
    expect(() => validateRefresh(threshold, "idle")).toThrow(RangeError);
  expect(() => validateRefresh(72, "armed")).toThrow(RangeError);
});
