import { expect, test } from "bun:test";
import { sampleMenu } from "../src/utils/interaction/menu-shape.js";
import { sampleIconMenu } from "../src/utils/interaction/menu-icon-shape.js";

test("a tall text menu starts with a compact blob rather than a narrow column", () => {
  const early = sampleMenu(
    48,
    true,
    { x: 110, y: 0, width: 140, height: 44 },
    { width: 250, height: 600 },
    34,
  );
  expect(early.height / early.width).toBeLessThan(1.6);
});

test("a tall icon menu does not start a second height expansion after its width settles", () => {
  const height = (ms: number) =>
    sampleIconMenu(
      ms,
      true,
      { x: 206, y: 0, width: 44, height: 44 },
      { width: 250, height: 600 },
      34,
    ).height;
  const speeds = Array.from({ length: 19 }, (_, i) => (height((i + 1) * 16) - height(i * 16)) / 16);
  expect(Math.max(...speeds.slice(10))).toBeLessThan(Math.max(...speeds.slice(0, 10)) * 1.5);
});

test("measured opening knots preserve height velocity through the entire bloom", () => {
  const height = (ms: number) =>
    sampleIconMenu(
      ms,
      true,
      { x: 206, y: 0, width: 44, height: 44 },
      { width: 250, height: 600 },
      34,
    ).height;
  for (const t of [37, 79, 117, 150, 184, 233, 254, 286, 324, 354, 392]) {
    const before = (height(t) - height(t - 0.001)) / 0.001;
    const after = (height(t + 0.001) - height(t)) / 0.001;
    expect(Math.abs(after - before)).toBeLessThan(0.005);
  }
});

// The old exit shrank width while most panel height remained: a visible pole.
test("closing tall menus contract as a whole rather than leaving a narrow high column", () => {
  for (const width of [44, 140, 200])
    for (const sampler of [sampleMenu, sampleIconMenu]) {
      let previous = 600;
      for (let t = 0; t < 299; t++) {
        const pose = sampler(
          t,
          false,
          { x: 110, y: 0, width, height: 44 },
          { width: 250, height: 600 },
          34,
        );
        if (pose.opacity === 0) continue;
        expect(pose.height / pose.width).toBeLessThanOrEqual(2.4 * 1.1);
        expect(pose.height).toBeLessThanOrEqual(previous + 0.001);
        previous = pose.height;
      }
    }
});
