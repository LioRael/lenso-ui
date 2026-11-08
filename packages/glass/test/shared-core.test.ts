import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";
import { coreOptics } from "../src/core-optics.js";
import type { Shape } from "../src/refraction.ts";
import { shaders } from "../src/shared-core/generated/shaders.js";
import { gzipSync } from "node:zlib";

const shape: Shape = {
  bezel: 30,
  thickness: undefined,
  level: 0.7,
  zoom: 1,
  saturation: 1,
  dispersion: 0.2,
  faceSaturation: 1,
  lightIntensity: 0.25,
  lightAngle: 0,
  bevel: 1,
  splay: 0.2,
  appleMode: "light",
  materialTint: undefined,
  materialProfile: "small",
  sourceBlur: 15.3,
};

// A silently selected approximation must not replace a user's tint or a different optical model.
test("analytic selection preserves unsupported material and optical preferences", () => {
  expect(coreOptics(120, 68, 24, shape)).toMatchObject({
    radius: 24,
    bezel: 30,
    profile: "small",
  });
  expect(coreOptics(120, 68, 24, { ...shape, materialForeground: true })).toMatchObject({
    foreground: true,
  });
  for (const preference of [
    { materialTint: "red" },
    { materialProfile: "large" },
    { zoom: 1.2 },
    { dispersion: 0 },
    { faceSaturation: 1.5 },
    { anchorEdge: true },
    { sourceBlur: 8 },
  ] as Partial<Shape>[])
    expect(coreOptics(120, 68, 24, { ...shape, ...preference })).toBeUndefined();
  expect(
    coreOptics(120, 68, 24, { ...shape, materialProfile: "medium", sourceBlur: 15.3 }),
  ).toBeDefined();
});

// A stale generated copy would invalidate both appearance parity and driver timing comparisons.
test("generated shader strings match the retained GLSL sources", async () => {
  const sources = await Promise.all(
    ["quad.vert", "blur.frag", "ios27.frag"].map((file) =>
      readFile(new URL(`../shaders/${file}`, import.meta.url), "utf8"),
    ),
  );
  expect(shaders).toEqual(sources);
});

// Keep Wasm initialization and its payload out of the default Web rendering graph.
test("default Web driver has no Wasm dependency and stays within its transfer budget", async () => {
  const build = await Bun.build({
    entrypoints: [new URL("../src/shared-core/batch.ts", import.meta.url).pathname],
    target: "browser",
    minify: true,
  });
  expect(build.success).toBe(true);
  const output = await build.outputs[0]!.text();
  expect(output.includes("WebAssembly")).toBe(false);
  expect(gzipSync(output).length).toBeLessThanOrEqual(8 * 1024);
});
