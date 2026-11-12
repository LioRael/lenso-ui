import { test, expect } from "bun:test";
import { nearestSection } from "../src/section-index-value";
// Collection selection tests do not cover geometric scrubbing between disabled index links.
test("section scrubbing chooses enabled centers, clamps endpoints and preserves ties", () => {
  const points = [
    { value: "", center: 10, disabled: false },
    { value: "blocked", center: 20, disabled: true },
    { value: "雪,🌕", center: 30, disabled: false },
  ];
  expect(nearestSection(points, -100)).toBe("");
  expect(nearestSection(points, 20)).toBe("");
  expect(nearestSection(points, 21)).toBe("雪,🌕");
  expect(nearestSection(points, 100)).toBe("雪,🌕");
  expect(
    nearestSection(
      points.map((p) => ({ ...p, disabled: true })),
      20,
    ),
  ).toBeUndefined();
  expect(nearestSection([], 0)).toBeUndefined();
});
