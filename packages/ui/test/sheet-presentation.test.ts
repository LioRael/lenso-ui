import { expect, test } from "bun:test";
import {
  resolvePresentationPoints,
  sheetPresentationAt,
} from "../src/components/sheet/presentation.js";

// Snap selection tests cannot catch a detached low stop, a gap at full height,
// or a discontinuity while moving between stops.
test("three-stage sheets attach at both ends and float between them in either direction", () => {
  const points = resolvePresentationPoints([0.25, 0.525, 1], [0.25, 1], 800, 738, 16);
  expect(points.map((point) => point.height)).toEqual([200, 420, 738]);
  expect(sheetPresentationAt(points, 200)).toEqual({ floating: 0, solid: 0 });
  expect(sheetPresentationAt(points, 420)).toEqual({ floating: 1, solid: 0 });
  expect(sheetPresentationAt(points, 738)).toEqual({ floating: 0, solid: 1 });
  expect(sheetPresentationAt(points, 310)).toEqual({ floating: 0.5, solid: 0 });
  expect(sheetPresentationAt(points, 579)).toEqual({ floating: 0.5, solid: 0.5 });
  for (const height of [200, 420, 738]) {
    const left = sheetPresentationAt(points, height - 0.01);
    const right = sheetPresentationAt(points, height + 0.01);
    expect(Math.abs(left.floating - right.floating)).toBeLessThan(0.001);
    expect(Math.abs(left.solid - right.solid)).toBeLessThan(0.001);
  }
  expect(sheetPresentationAt(points, -50)).toEqual({ floating: 0, solid: 0 });
  expect(sheetPresentationAt(points, 900)).toEqual({ floating: 0, solid: 1 });
});

test("pixel and rem stops respect viewport limits, resizing and reordered configuration", () => {
  const snaps = [1 as const, "12.5rem" as const, "420px" as const, 0.9, Number.NaN];
  const points = resolvePresentationPoints(snaps, [1, "12.5rem"], 800, 700, 16);
  // The material model resolves duplicate heights using the last configured stop.
  expect(points).toEqual([
    { height: 200, attached: true },
    { height: 420, attached: false },
    { height: 700, attached: false },
  ]);
  expect(resolvePresentationPoints(["12.5rem", 1], [1], 500, 438, 20)).toEqual([
    { height: 250, attached: false },
    { height: 438, attached: true },
  ]);
  expect(resolvePresentationPoints(["25%", "content"], ["content"], 800, 700, 16)).toEqual([
    { height: 200, attached: false },
    { height: 700, attached: true },
  ]);
  expect(sheetPresentationAt([], 200)).toEqual({ floating: 0, solid: 0 });
});

test("corners and material ease into each detent without a velocity cusp", () => {
  const points = resolvePresentationPoints([0.25, 0.525, 1], [0.25, 1], 800, 738, 16);
  for (const height of [200, 420, 738]) {
    const at = sheetPresentationAt(points, height);
    for (const side of [-0.1, 0.1]) {
      const near = sheetPresentationAt(points, height + side);
      expect(Math.abs(near.floating - at.floating)).toBeLessThan(0.000001);
      expect(Math.abs(near.solid - at.solid)).toBeLessThan(0.000001);
    }
  }
});
