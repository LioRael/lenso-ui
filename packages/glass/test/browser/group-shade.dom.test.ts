import { expect, test } from "bun:test";
import { appleShade, uniformFusionShade } from "../../src/apple-material.js";

// The SVG graph already omits group inner shade. Geometry tests cannot catch
// preparing an unused full-plane raster before the graph discards it.
test.each(["light", "dark"] as const)("%s group material needs no shade raster", (mode) => {
  const material = { mode, surface: "group" as const };
  expect(
    appleShade(120, 60, 2, material, () => {
      throw new Error("A group must not sample local shade coordinates");
    }),
  ).toBeUndefined();
  expect(
    uniformFusionShade(120, 60, 2, material, { top: 0, height: 60, count: 3 }),
  ).toBeUndefined();
});

// Group-only coverage misses a non-group material that must fall back without
// throwing and disabling the worker shared by otherwise eligible planes.
test("a material without repeatable rows declines the uniform shade", () => {
  expect(uniformFusionShade(120, 60, 2, { mode: "light" }, undefined)).toBeUndefined();
});
