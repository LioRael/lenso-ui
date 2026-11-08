import { expect, test } from "bun:test";
import { sampleIconMenu, iconMenuDurations } from "../src/utils/interaction/menu-icon-shape.js";
import { createMenuTimeline } from "../src/utils/interaction/menu-timeline.js";

// Native ink is still slightly soft/refracted after width has reached its
// destination. Tying either effect to width incorrectly clears both early.
test("menu ink retains its late optical tail independently of width", () => {
  const late = sampleIconMenu(
    280,
    true,
    { x: 194, y: 0, width: 44, height: 44 },
    { width: 250, height: 201 },
    34,
  );
  expect(late.width).toBeGreaterThan(250);
  expect(late.blur).toBeGreaterThan(0);
  expect(late.blur).toBeLessThan(1);
  expect(late.refraction).toBeGreaterThan(0);
  expect(
    sampleIconMenu(
      442,
      true,
      { x: 194, y: 0, width: 44, height: 44 },
      { width: 250, height: 201 },
      34,
    ).refraction,
  ).toBe(0);
});

// Captured stream coordinates are independent of Web CSS transforms. These
// points catch applying the wide-label narrowing phase to a circular source.
const from = { x: 550, y: 88, width: 66, height: 66 };
const to = { width: 376, height: 220 };
const native = (time: number, open = true) =>
  sampleIconMenu(time, open, { ...from, x: from.x - 240, y: from.y - 88 }, to, 48.8);

test("icon widens and travels diagonally through the captured native opening", () => {
  const early = native(39);
  expect(early.width).toBeCloseTo(121, 5);
  expect(early.height).toBeCloseTo(111, 5);
  expect(early.left + 240).toBeCloseTo(474, 5);
  expect(early.top + 88).toBeCloseTo(109, 5);
  expect(early.corner).toBeCloseTo(55.5, 5);
  const taller = sampleIconMenu(
    39,
    true,
    { x: 194, y: 0, width: 44, height: 44 },
    { width: 238, height: 201 },
    34,
  );
  expect(taller.height).toBeGreaterThan(44);
  expect(taller.height / taller.width).toBeLessThan(1.5);
  const middle = native(139);
  expect(middle.width).toBeCloseTo(343, 5);
  expect(middle.left + 240).toBeCloseTo(267, 5);
  const end = native(iconMenuDurations.opening);
  expect(end).toMatchObject({ width: 376, height: 220, left: 0, top: 0, corner: 48.8 });
});

test("icon contracts into a circle and hands paint back with the small native rebound", () => {
  const contracting = native(149, false);
  expect(contracting.width).toBeCloseTo(172, 5);
  expect(contracting.height).toBeCloseTo(149, 5);
  expect(contracting.left + 240).toBeCloseTo(431, 5);
  expect(contracting.top + 88).toBeCloseTo(107, 5);
  const handoff = native(299, false);
  expect(handoff.opacity).toBe(0);
  expect(handoff.triggerOpacity).toBe(1);
  expect(handoff.triggerScale).toBeCloseTo(64 / 66, 5);
  expect(handoff.triggerLift).toBeCloseTo(-6, 5);
  const above = sampleIconMenu(299, false, { ...from, y: 250 }, to, 48.8);
  expect(above.triggerLift).toBeCloseTo(6, 5);
  const end = native(iconMenuDurations.closing, false);
  expect(end.triggerScale).toBe(1);
  expect(end.triggerLift).toBe(0);
});

test("icon timeline retains pose on reversal with its own measured durations", () => {
  const raf = globalThis.requestAnimationFrame,
    cancel = globalThis.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (key) => {
    frames.delete(key);
  };
  let pose = native(0);
  const timeline = createMenuTimeline(
    native,
    (next) => {
      pose = next;
    },
    iconMenuDurations,
  );
  try {
    timeline.set(1);
    const callback = frames.values().next().value!;
    frames.clear();
    callback(performance.now() + 100);
    const previous = { ...pose };
    timeline.set(0);
    for (const key of Object.keys(previous) as (keyof typeof pose)[])
      expect(pose[key]).toBeCloseTo(previous[key], 5);
    timeline.set(1, true);
    expect(pose.width).toBe(376);
  } finally {
    timeline.stop();
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = cancel;
  }
});
