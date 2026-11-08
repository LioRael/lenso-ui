import { expect, test } from "bun:test";
import { fusionGeometry } from "../src/fusion-geometry.js";

const circle = { x: 0, y: 0, width: 50, height: 50, radius: 25 };

// A covered stroke can pass mask tests while still retaining two independent lens normals.
test("a nearby pair has one neck and continuous shoulder normals", () => {
  const sample = fusionGeometry([circle, { ...circle, x: 58 }], 18);
  expect(sample(54, 25).distance).toBeGreaterThan(0);
  const left = sample(53.99, 8),
    right = sample(54.01, 8);
  expect(Math.abs(left.distance - right.distance)).toBeLessThan(0.03);
  expect(Math.abs(left.nx - right.nx)).toBeLessThan(0.01);
  expect(Math.abs(left.ny - right.ny)).toBeLessThan(0.01);
});

test("distant lens edges retain the isolated geometry and a separated gap stays clear", () => {
  const alone = fusionGeometry([circle], 18);
  const near = fusionGeometry([circle, { ...circle, x: 58 }], 18);
  expect(near(1, 25)).toEqual(alone(1, 25));
  const far = fusionGeometry([circle, { ...circle, x: 98 }], 18);
  expect(far(74, 25).distance).toBeLessThan(0);
});

test("the fast outline sampler agrees with the optical field", () => {
  const sample = fusionGeometry(
    [circle, { ...circle, x: 58, y: 10, width: 70, height: 30, radius: 15 }],
    18,
  );
  for (const x of [0, 25, 50, 54, 62, 90, 128])
    for (const y of [0, 10, 25, 40, 50])
      expect(sample.signedDistance(x, y)).toBeCloseTo(sample(x, y).distance, 10);
});

test("an enlarged circle forms a rounded neck that stays inside its outer shoulders", () => {
  const sample = fusionGeometry(
    [
      { x: 0, y: 0, width: 70, height: 70, radius: 35 },
      { x: 72, y: 10, width: 72, height: 50, radius: 25 },
    ],
    18,
  );
  expect(sample(71, 35).distance).toBeGreaterThan(0);
  expect(sample(71, 10).distance).toBeLessThan(0);
  expect(sample(71, 60).distance).toBeLessThan(0);
});

test("a tightly joined pair does not suppress a third member's longer neck", () => {
  const sample = fusionGeometry([circle, { ...circle, x: 52 }, { ...circle, x: 110 }], 18);
  expect(sample(51, 25).distance).toBeGreaterThan(0);
  expect(sample(106, 25).distance).toBeGreaterThan(0);
});

// A joined toolbar must be one lens, not two lenses with a seam inside the pill.
test("toolbar grouping starts as a whole capsule and pinches into separate controls", () => {
  const shapes = (progress: number) => [
    {
      x: 0,
      y: 0,
      width: 80,
      height: 44,
      radius: 22,
      corners: [22, 22 * progress, 22 * progress, 22] as const,
    },
    {
      x: 80 + 40 * progress,
      y: 0,
      width: 80,
      height: 44,
      radius: 22 * progress,
      corners: [22 * progress, 22, 22, 22 * progress] as const,
    },
  ];
  const joined = fusionGeometry(shapes(0), 18, true);
  expect(joined(80, 22).distance).toBe(22);
  expect(joined(80, 1).distance).toBe(1);
  const neck = fusionGeometry(shapes(0.4), 18, true);
  expect(neck(88, 22).distance).toBeGreaterThan(0);
  expect(neck(88, 0).distance).toBeLessThan(0);
  const split = fusionGeometry(shapes(0.8), 18, true);
  expect(split(96, 22).distance).toBeLessThan(0);
  expect(split(40, 22).distance).toBeGreaterThan(0);
  const detached = fusionGeometry(shapes(1), 18, true);
  expect(detached(100, 22).distance).toBeLessThan(0);
  for (const p of [0, 0.2, 0.4, 0.8, 1]) {
    const field = fusionGeometry(shapes(p), 18, true);
    expect(field.signedDistance(80 + 20 * p, 15)).toBeCloseTo(field(80 + 20 * p, 15).distance, 10);
  }
});

// The default threshold must leave native-sized neighbors separate until one grows.
test("20px default blend stays clear at rest and connects when a control expands", () => {
  const a = { x: 0, y: 0, width: 44, height: 44, radius: 22 };
  const b = { x: 56, y: 0, width: 78, height: 44, radius: 22 };
  expect(fusionGeometry([a, b], 20)(50, 22).distance).toBeLessThan(0);
  expect(
    fusionGeometry([{ ...a, x: -3, y: -3, width: 50, height: 50, radius: 25 }, b], 20)(51.5, 22)
      .distance,
  ).toBeGreaterThan(0);
});

// Rest-state tests miss the discontinuity when the moving gap crosses spacing.
test("fusion shoulders converge continuously to isolated lenses at the spacing boundary", () => {
  const field = (gap: number) => fusionGeometry([circle, { ...circle, x: 50 + gap }], 12);
  const before = field(12 - 0.001),
    after = field(12 + 0.001);
  let largest = 0;
  for (let x = 40; x <= 72; x += 0.5) {
    for (let y = 5; y <= 45; y += 0.5) {
      largest = Math.max(
        largest,
        Math.abs(before.signedDistance(x, y) - after.signedDistance(x, y)),
      );
    }
  }
  expect(largest).toBeLessThan(0.01);
});

// Optical maps and the live clip must agree throughout the taper, not just at rest.
test("optical and contour distances agree through neck separation", () => {
  for (const gap of [9.5, 10.25, 11, 11.75, 12, 12.25]) {
    const field = fusionGeometry([circle, { ...circle, x: 50 + gap }], 12);
    for (const x of [45, 49, 50, 55, 56, 60, 62, 67])
      for (const y of [10, 18, 25, 32, 40])
        expect(field.signedDistance(x, y)).toBeCloseTo(field(x, y).distance, 10);
  }
});

// A neck can be numerically correct while a disconnected contour segment clips its face.
test("the traced union mask encloses the same islands and neck as the optical field", async () => {
  const { fusionOutline } = await import("../src/fusion-geometry.js");
  for (const gap of [0, 8, 18, 36]) {
    const shapes = [
      { ...circle, x: 12, y: 12 },
      { ...circle, x: 62 + gap, y: 12 },
    ];
    const field = fusionGeometry(shapes, 18);
    const svg = decodeURIComponent(fusionOutline(180, 80, shapes, 18).split(",")[1]!);
    const path = svg.match(/ d="([^"]*)"/)![1]!;
    const polygons = path
      .split("Z")
      .filter(Boolean)
      .map((part) =>
        [...part.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)].map((match) => [
          Number(match[1]),
          Number(match[2]),
        ]),
      );
    const contains = (x: number, y: number) =>
      polygons.some((points) => {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const a = points[i]!,
            b = points[j]!;
          if (
            a[1]! > y !== b[1]! > y &&
            x < ((b[0]! - a[0]!) * (y - a[1]!)) / (b[1]! - a[1]!) + a[0]!
          )
            inside = !inside;
        }
        return inside;
      });
    for (let y = 6; y < 75; y += 3)
      for (let x = 3; x < 170; x += 3) {
        const distance = field.signedDistance(x, y);
        if (Math.abs(distance) > 0.3) expect(contains(x, y)).toBe(distance > 0);
      }
  }
});

// Existing neck tests accept many blend widths. This catches an extra spacing
// multiplier against the reference's independently evaluated smooth union.
test("proximity spacing uses the reference smooth-union radius", () => {
  const shapes = [circle, { ...circle, x: 58 }, { ...circle, x: 116, y: 9 }];
  for (const spacing of [0, 12, 20, 36]) {
    const field = fusionGeometry(shapes, spacing);
    for (let y = -4; y < 65; y += 3.25)
      for (let x = -4; x < 174; x += 2.75) {
        let distance = Infinity;
        for (const shape of shapes) {
          const qx = Math.abs(x - shape.x - shape.width / 2) - shape.width / 2 + shape.radius;
          const qy = Math.abs(y - shape.y - shape.height / 2) - shape.height / 2 + shape.radius;
          const next =
            Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
            Math.min(Math.max(qx, qy), 0) -
            shape.radius;
          const h = Math.max(spacing - Math.abs(distance - next), 0) / (spacing || 1);
          distance = Math.min(distance, next) - (h * h * spacing) / 4;
        }
        expect(field.signedDistance(x, y)).toBeCloseTo(-distance, 10);
      }
  }
});
