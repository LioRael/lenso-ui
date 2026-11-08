import { expect, test } from "bun:test";
import { createSpring } from "../src/motion/spring.js";
import { advanceSpring } from "../src/motion/spring-state.js";

// Native keyframes and frame callbacks partition elapsed time differently.
test("analytical spring sampling is independent of frame partitioning", () => {
  for (const damping of [19, 2 * Math.sqrt(150), 40]) {
    const direct = { value: 0.3, target: 0.8, velocity: -1.2, stiffness: 150, damping };
    const sampled = { ...direct };
    advanceSpring(direct, 1);
    for (let frame = 0; frame < 120; frame++) advanceSpring(sampled, 1 / 120);
    expect(sampled.value).toBeCloseTo(direct.value, 12);
    expect(sampled.velocity).toBeCloseTo(direct.velocity, 12);
  }
});

test("coupled springs share a frame chain and become idle", () => {
  const names = ["document", "matchMedia", "requestAnimationFrame"] as const;
  const previous = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  let time = 0;
  Object.defineProperties(globalThis, {
    document: { configurable: true, value: { hidden: false, timeline: { currentTime: 0 } } },
    matchMedia: { configurable: true, value: () => ({ matches: false }) },
    requestAnimationFrame: {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        pending.set(++id, callback);
        return id;
      },
    },
  });
  let value = 0;
  const follower = createSpring(0, 150, 19, (next) => {
    value = next;
  });
  const leader = createSpring(0, 1024, 58.9, (next) => follower.set(next));
  try {
    leader.set(1);
    for (let i = 0; i < 300 && pending.size; i++) {
      expect(pending.size).toBe(1);
      const callbacks = [...pending.values()];
      pending.clear();
      time += 1000 / 60;
      callbacks.forEach((callback) => callback(time));
    }
    expect(pending.size).toBe(0);
    expect(value).toBe(1);
  } finally {
    leader.stop();
    follower.stop();
    names.forEach((name, index) => {
      const descriptor = previous[index];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
});

// Unmount and instant updates must release pending frames before another clock starts.
test("stopping the last spring or setting it instantly cancels its pending frame", () => {
  const names = [
    "document",
    "matchMedia",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ] as const;
  const previous = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  Object.defineProperties(globalThis, {
    document: { configurable: true, value: { hidden: false, timeline: { currentTime: 0 } } },
    matchMedia: { configurable: true, value: () => ({ matches: false }) },
    requestAnimationFrame: {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        pending.set(++id, callback);
        return id;
      },
    },
    cancelAnimationFrame: { configurable: true, value: (handle: number) => pending.delete(handle) },
  });
  const spring = createSpring(0, 150, 19, () => {});
  try {
    spring.set(1);
    expect(pending.size).toBe(1);
    spring.stop();
    expect(pending.size).toBe(0);
    spring.set(1);
    expect(pending.size).toBe(1);
    spring.set(0, true);
    expect(pending.size).toBe(0);
  } finally {
    spring.stop();
    names.forEach((name, index) => {
      const descriptor = previous[index];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
});
