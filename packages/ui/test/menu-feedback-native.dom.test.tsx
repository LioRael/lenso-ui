import { expect, test } from "bun:test";
import { advanceSpring } from "@lenso/glass/motion";
import { createNativeMenuFeedback } from "../src/utils/interaction/menu-feedback-native.js";

function setup() {
  const previous = {
    timeline: Object.getOwnPropertyDescriptor(document, "timeline"),
    now: performance.now,
    media: globalThis.matchMedia,
    raf: globalThis.requestAnimationFrame,
    cancel: globalThis.cancelAnimationFrame,
    supports: CSS.supports,
  };
  let time = 100,
    id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const reduced = new EventTarget() as MediaQueryList;
  Object.defineProperty(reduced, "matches", { configurable: true, value: false });
  Object.defineProperty(document, "timeline", { configurable: true, value: { currentTime: 0 } });
  performance.now = () => time;
  globalThis.matchMedia = () => reduced;
  globalThis.requestAnimationFrame = (callback) => {
    pending.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (handle) => {
    pending.delete(handle);
  };
  CSS.supports = () => true;
  const card = document.createElement("div");
  card.style.cssText = "scale:1;translate:0px;will-change:opacity";
  document.body.append(card);
  const animations: {
    frames: Keyframe[];
    options: KeyframeAnimationOptions;
    startTime: number | null;
    onfinish: (() => void) | null;
    cancelled: boolean;
    cancel(): void;
  }[] = [];
  card.animate = ((frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = {
      frames,
      options,
      startTime: null,
      onfinish: null,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    animations.push(animation);
    return animation as unknown as Animation;
  }) as typeof card.animate;
  const control = createNativeMenuFeedback(card)!;
  expect(control).toBeDefined();
  return {
    card,
    control,
    animations,
    pending,
    reduced,
    at(value: number) {
      time = value;
    },
    step() {
      time += 1000 / 60;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(time));
    },
    restore() {
      control.destroy();
      card.remove();
      if (previous.timeline) Object.defineProperty(document, "timeline", previous.timeline);
      else Reflect.deleteProperty(document, "timeline");
      performance.now = previous.now;
      globalThis.matchMedia = previous.media;
      globalThis.requestAnimationFrame = previous.raf;
      globalThis.cancelAnimationFrame = previous.cancel;
      CSS.supports = previous.supports;
    },
  };
}

// A frame-sampled document clock loses elapsed time during a long task.
test("native retargeting carries pose and velocity using the default timeline's wall clock", () => {
  const s = setup();
  try {
    s.control.scale.set(1.02);
    const first = s.animations[0]!;
    expect(first.startTime).toBe(100);
    expect(first.options.fill).toBe("backwards");
    expect(Number(first.frames[0]!["scale"])).toBe(1);
    expect(Number(first.frames.at(-1)!["scale"])).toBe(1.02);
    s.control.scale.paint();
    expect(s.card.style.scale).toBe("1.02");
    expect(s.pending.size).toBe(0);
    s.at(180);
    s.control.scale.tune(650, 2 * Math.sqrt(650));
    s.control.scale.set(1);
    const second = s.animations[1]!;
    const expected = { value: 1, target: 1.02, velocity: 0, stiffness: 650, damping: 36 };
    advanceSpring(expected, 0.08);
    expect(Number(second.frames[0]!["scale"])).toBeCloseTo(expected.value, 12);
    expected.target = 1;
    expected.damping = 2 * Math.sqrt(650);
    advanceSpring(expected, 1 / 120);
    expect(Number(second.frames[1]!["scale"])).toBeCloseTo(expected.value, 12);
    expect(second.startTime).toBe(180);
    expect(first.cancelled).toBe(true);
    first.onfinish?.();
    expect(second.cancelled).toBe(false);
    expect(s.card.style.willChange).toContain("opacity");
    expect(s.card.style.willChange).toContain("scale");
  } finally {
    s.restore();
  }
});

// Asynchronous copy attachment must not leave only the panel moving through a stall.
test("a newly attached optical copy resumes the same trajectory on the JS path", async () => {
  const s = setup();
  try {
    s.control.x.set(7, true);
    s.control.y.set(-3, true);
    s.control.x.tune(600, 2 * Math.sqrt(600));
    s.control.y.tune(600, 2 * Math.sqrt(600));
    s.control.x.set(0);
    s.control.y.set(0);
    expect(s.animations.at(-1)!.frames[0]!["translate"]).toBe("7px -3px");
    s.at(180);
    const copy = document.createElement("div");
    copy.setAttribute("data-copy", "");
    s.card.append(copy);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(s.animations.every((a) => a.cancelled)).toBe(true);
    expect(s.pending.size).toBeGreaterThan(0);
    const count = s.animations.length;
    for (let i = 0; i < 120 && s.pending.size; i++) s.step();
    expect(s.pending.size).toBe(0);
    expect(s.animations.length).toBe(count);
    expect(s.card.style.translate).toBe("0px 0px");
    s.control.x.set(5);
    s.control.destroy();
    expect(s.pending.size).toBe(0);
  } finally {
    s.restore();
  }
});

test("reduced motion settles native playback and cleanup preserves caller ownership", () => {
  const s = setup();
  try {
    s.control.scale.set(1.02);
    Object.defineProperty(s.reduced, "matches", { configurable: true, value: true });
    s.reduced.dispatchEvent(new Event("change"));
    expect(s.animations.every((a) => a.cancelled)).toBe(true);
    expect(s.card.style.scale).toBe("1.02");
    expect(s.card.style.willChange).toBe("opacity");
    s.card.style.scale = "2";
    s.control.destroy();
    expect(s.card.style.scale).toBe("2");
    expect(s.card.style.translate).toBe("0px");
    expect(s.card.style.willChange).toBe("opacity");
    const count = s.animations.length;
    s.control.scale.set(1.03);
    expect(s.animations.length).toBe(count);
  } finally {
    s.restore();
  }
});
