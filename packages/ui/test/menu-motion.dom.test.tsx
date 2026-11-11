import { expect, mock, test } from "bun:test";
import { sampleMenu, menuDurations } from "../src/utils/interaction/menu-shape.js";
import { createMenuTimeline } from "../src/utils/interaction/menu-timeline.js";
import { presentMenuFeedback } from "../src/utils/interaction/menu-feedback.js";

const sample = (time: number, open: boolean) =>
  sampleMenu(time, open, { width: 80, height: 44, x: 0, y: -50 }, { width: 240, height: 200 }, 20);

test("closing contracts the complete panel before handing paint back to its source", () => {
  const pose = sample(200, false);
  expect(pose.width).toBeGreaterThan(80);
  expect(pose.height).toBeGreaterThan(44);
  expect(pose.height).toBeLessThan(100);
  expect(pose.items).toBe(0);
  expect(pose.triggerScale).toBe(1);
  expect(sample(299, false).opacity).toBe(0);
  expect(sample(299, false).triggerOpacity).toBe(1);
  expect(sample(299, false).triggerScale).toBeGreaterThan(0.95);
  expect(sample(menuDurations.closing, false)).toMatchObject({
    opacity: 0,
    triggerOpacity: 1,
    triggerScale: 1,
    triggerLift: 0,
    blur: 0,
    refraction: 0,
  });
});

// Select and stationary sources keep their anchor while the whole lens returns.
test("stable sources stay undeformed and receive the lens at their actual box", () => {
  for (const [width, height] of [
    [44, 44],
    [140, 32],
  ])
    for (const y of [-50, 250]) {
      const from = { width: width!, height: height!, x: 0, y };
      const middle = sampleMenu(200, false, from, { width: 240, height: 200 }, 20, true);
      expect(middle.triggerScale).toBe(1);
      expect(middle.triggerLift).toBeCloseTo(0, 5);
      const end = sampleMenu(299, false, from, { width: 240, height: 200 }, 20, true);
      expect(end).toMatchObject({
        width,
        height,
        left: 0,
        top: y,
        opacity: 0,
        triggerScale: 1,
      });
      expect(end.triggerLift).toBeCloseTo(0, 5);
    }
});

// A mid-flight reversal must retain the rendered width and position, not just its height.
test("timeline preserves all channels when reversing and cancels pending frames", () => {
  const raf = globalThis.requestAnimationFrame;
  const caf = globalThis.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (key) => {
    frames.delete(key);
  };
  let current = sample(0, true);
  const measure = mock(() => {});
  const samplePose = mock(sample);
  const timeline = createMenuTimeline(
    samplePose,
    (pose) => {
      current = pose;
    },
    menuDurations,
    measure,
  );
  try {
    timeline.set(1);
    const callback = frames.values().next().value!;
    frames.clear();
    callback(performance.now() + 95);
    const before = { ...current };
    measure.mockClear();
    samplePose.mockClear();
    timeline.set(0);
    expect(measure).toHaveBeenCalledTimes(1);
    expect(samplePose.mock.calls).toEqual([
      [0, false],
      [1, false],
    ]);
    for (const key of Object.keys(before) as (keyof typeof before)[])
      expect(current[key]).toBeCloseTo(before[key], 6);
    timeline.set(1, true);
    expect(current.width).toBe(240);
    expect(current.items).toBe(1);
  } finally {
    timeline.stop();
    expect(frames.size).toBe(0);
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = caf;
  }
});

test("menu scrub activation keeps link modifiers and leaves touch scrolling native", () => {
  const card = document.createElement("div");
  card.setAttribute("data-open", "");
  card.setAttribute("data-slot", "menu-popup");
  card.innerHTML =
    '<div data-slot="menu-content"><div data-slot="menu-plate"></div><a role="menuitem">Open</a></div>';
  document.body.append(card);
  const content = card.firstElementChild as HTMLElement;
  const row = card.querySelector("a")!;
  const original = document.elementFromPoint;
  document.elementFromPoint = () => row;
  const stop = presentMenuFeedback(card);
  let activated: MouseEvent | undefined;
  row.addEventListener("click", (event) => {
    event.preventDefault();
    activated = event;
  });
  const dispatch = (type: string, pointerType: string) =>
    card.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        isPrimary: true,
        pointerId: 1,
        button: 0,
        pointerType,
        metaKey: true,
        shiftKey: true,
      }),
    );
  try {
    dispatch("pointerdown", "mouse");
    dispatch("pointerup", "mouse");
    expect(activated?.metaKey).toBe(true);
    expect(activated?.shiftKey).toBe(true);
    Object.defineProperties(content, {
      scrollHeight: { value: 800 },
      clientHeight: { value: 200 },
    });
    dispatch("pointerdown", "touch");
    expect(card.hasAttribute("data-pressed")).toBe(false);
  } finally {
    stop();
    card.remove();
    document.elementFromPoint = original;
  }
});
