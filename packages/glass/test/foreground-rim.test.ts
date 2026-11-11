import { expect, test } from "bun:test";
import {
  foregroundRimPixels,
  foregroundRimTiles,
  hasForegroundRim,
} from "../src/foreground-rim.js";
import type { Shape } from "../src/optical-fields.js";

const shape: Shape = {
  bezel: undefined,
  thickness: undefined,
  level: 1,
  zoom: 1,
  saturation: 1,
  dispersion: 0,
  faceSaturation: 1,
  lightIntensity: 0.25,
  lightAngle: 0,
  bevel: undefined,
  splay: undefined,
  appleMode: "light",
  materialTint: undefined,
  sourceBlur: 15.3,
  materialProfile: "small",
};

// A nonempty shadow cannot catch the late hairline: moving and settled edges
// must retain the same subpixel coverage, even when opposing slices overlap.
test("live rim tiles preserve the fitted rim pixels without scaling corners", () => {
  for (const material of [
    shape,
    { ...shape, materialProfile: "medium" as const },
    { ...shape, materialProfile: "medium" as const, appleMode: "dark" as const },
  ]) {
    for (const radius of [16, 17.375, 20, 30]) {
      const render = foregroundRimTiles(radius, material);
      for (const [width, height] of [
        [311, 40],
        [192, 40],
        [311, 90],
        [60, 60],
      ]) {
        const r = Math.min(radius, width! / 2, height! / 2);
        if (r !== radius) continue;
        const actual = render(width!, height!);
        const expected = foregroundRimPixels(width!, height!, radius, material);
        expect(actual.width).toBe(expected.width);
        expect(actual.height).toBe(expected.height);
        let max = 0;
        for (let i = 0; i < actual.data.length; i++)
          max = Math.max(max, Math.abs(actual.data[i]! - expected.data[i]!));
        expect(max).toBeLessThanOrEqual(1);
      }
    }
  }
});

// The small reference has the same pixel pitch and corner radius as the large
// panel. Extending its straight edges must preserve the fractional corner coverage.
test("extending a panel preserves every corner and straight-edge pixel", () => {
  const width = 250.25,
    height = 524.125,
    radius = 24.75;
  const material = { ...shape, materialProfile: "medium" as const, lightAngle: 37 };
  const panel = foregroundRimPixels(width, height, radius, material);
  const side = 107;
  const reference = foregroundRimPixels(
    side * ((width + 2) / panel.width) - 2,
    side * ((height + 2) / panel.height) - 2,
    radius,
    material,
  );
  expect([reference.width, reference.height]).toEqual([side, side]);
  const middle = (side - 1) / 2;
  const source = (pixel: number, extent: number) =>
    pixel < middle ? pixel : pixel >= extent - middle ? side - (extent - pixel) : middle;
  const actual = new Uint32Array(panel.data.buffer);
  const expected = new Uint32Array(reference.data.buffer);
  let different = 0;
  for (let y = 0; y < panel.height; y++) {
    const row = side * source(y, panel.height);
    for (let x = 0; x < panel.width; x++)
      if (actual[y * panel.width + x] !== expected[row + source(x, panel.width)]) different++;
  }
  expect(different).toBe(0);
});

// These are image-code values sampled from the supplied Rex light screenshot,
// not values derived from the implementation's highlight equation.
test("light panel reflections follow the reference's white crest and inward decay", () => {
  const image = foregroundRimPixels(311, 40, 20, { ...shape, materialProfile: "medium" });
  const face = [224, 235, 247];
  for (const [offset, target] of [
    [0, [255, 255, 255]],
    [1, [255, 255, 255]],
    [2, [237, 249, 255]],
    [4, [232, 244, 254]],
    [6, [229, 240, 251]],
    [8, [227, 238, 250]],
    [12, [225, 236, 249]],
    [20, [224, 235, 247]],
  ] as const) {
    const at = ((offset + 2) * image.width + Math.floor(image.width / 2)) * 4;
    const alpha = image.data[at + 3]! / 255;
    for (let channel = 0; channel < 3; channel++) {
      const color = image.data[at + channel]! * alpha + face[channel]! * (1 - alpha);
      expect(Math.abs(color - target[channel]!)).toBeLessThanOrEqual(5);
    }
  }
});

// A standalone foreground must not double-paint a shared contour or replace
// colored/legacy/knob recipes. Pixel depth is exercised by glass-tinted-rim.mjs.
test("foreground eligibility separates standalone iOS 27 glass from other material owners", () => {
  for (const appleMode of ["light", "dark"] as const) {
    for (const materialProfile of ["small", "medium", "large", "clear"] as const)
      expect(hasForegroundRim({ ...shape, appleMode, materialProfile })).toBe(true);
  }
  for (const override of [
    { appleMode: undefined },
    { materialTint: "#0066cc" },
    { materialSurface: "group" as const },
    { materialProfile: "toggle-knob" as const },
    { materialProfile: "slider-knob" as const },
  ])
    expect(hasForegroundRim({ ...shape, ...override })).toBe(false);
});

// Values come from a separate 128×128 area integral of a 32px circle. These
// pixels straddle the dark-outside/light-inside boundary at oblique angles.
test("the subpixel hairline integrates coverage instead of choosing a single side", () => {
  const image = foregroundRimPixels(32, 32, 16, shape);
  const samples = [
    [11, 11, 31.338, 63.005],
    [12, 10, 32.706, 65.9],
    [10, 12, 27.339, 64.27],
    [13, 9, 29.803, 71.123],
    [11, 56, 31.338, 63.005],
    [56, 11, 31.338, 63.005],
    [56, 56, 31.338, 63.005],
    [10, 55, 27.339, 64.27],
  ] as const;
  for (const [x, y, premult, alpha] of samples) {
    const at = (y * image.width + x) * 4;
    const actualAlpha = image.data[at + 3]!;
    expect(Math.abs(actualAlpha - alpha)).toBeLessThan(2);
    expect(Math.abs((image.data[at]! * actualAlpha) / 255 - premult)).toBeLessThan(2);
  }
});

// On a pale panel, a detached shadow crest outlines a second rectangular face.
// Sample rendered RGBA over white rather than asserting a particular falloff formula.
test("panel inner depth fades from the rim without a detached rectangular shadow band", () => {
  const image = foregroundRimPixels(512, 114, 20, shape);
  const darkening = (x: number, y: number) => {
    const at = (Math.floor(y * 2 + 2) * image.width + Math.floor(x * 2 + 2)) * 4;
    return image.data[at + 3]! * (1 - image.data[at]! / 255);
  };
  const upper = Array.from({ length: 21 }, (_, i) => darkening(256, 4 + i));
  expect(Math.max(...upper)).toBeGreaterThan(1);
  for (let i = 1; i < upper.length; i++) expect(upper[i]!).toBeLessThanOrEqual(upper[i - 1]!);
  expect(darkening(2, 57)).toBeGreaterThan(darkening(8, 57));
  expect(darkening(24, 57)).toBe(0);
});
