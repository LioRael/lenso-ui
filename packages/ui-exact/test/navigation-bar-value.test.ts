import { test, expect } from "bun:test";
import {
  navigationEdgeVisibility,
  navigationSoftBands,
  navigationSoftTintMask,
} from "../src/navigation-bar-value";
// Existing Toolbar tests do not cover document/element scroll edge clamping or the progressive blur model.
test("navigation edge opacity follows overflow, endpoint clamping and short edge extents", () => {
  expect(navigationEdgeVisibility(12, 600, 320, 84)).toBe(0.5);
  expect(navigationEdgeVisibility(-20, 600, 320, 84)).toBe(0);
  expect(navigationEdgeVisibility(900, 600, 320, 84)).toBe(1);
  expect(navigationEdgeVisibility(10, 320, 320, 84)).toBe(0);
  expect(navigationEdgeVisibility(4, 600, 320, 20)).toBe(0.5);
});
test("soft navigation edge preserves source blur variance and mask endpoints", () => {
  expect(navigationSoftBands).toHaveLength(6);
  const variance = navigationSoftBands.reduce((sum, band) => sum + parseFloat(band.blur) ** 2, 0);
  expect(variance).toBeCloseTo(4.2 ** 2, 10);
  expect(navigationSoftBands[0]!.mask).toContain("rgb(0 0 0 / 1.00000) 12.5%");
  expect(navigationSoftBands[0]!.mask).toContain("rgb(0 0 0 / 0.00000) 100%");
  expect(navigationSoftTintMask).toContain("var(--material-edge-direction)");
});
