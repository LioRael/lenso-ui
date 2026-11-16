import { expect, test } from "bun:test";
import { createSpring } from "../src/motion/spring.js";
import { advanceSpring } from "../src/motion/spring-state.js";

let schedulerId = 0;

async function withScheduler(
  run: (clock: {
    spring: typeof createSpring;
    pending: Map<number, FrameRequestCallback>;
    step: () => void;
  }) => void,
) {
  // Each case owns its module state, including when the broken scheduler is poisoned.
  const { createSpring: create } = await import(`../src/motion/spring.ts?case=${++schedulerId}`);
  const names = [
    "document",
    "matchMedia",
    "requestAnimationFrame",
    "cancelAnimationFrame",
  ] as const;
  const previous = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  const pending = new Map<number, FrameRequestCallback>();
  const springs: ReturnType<typeof createSpring>[] = [];
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
    cancelAnimationFrame: { configurable: true, value: (handle: number) => pending.delete(handle) },
  });
  try {
    run({
      spring: (...args) => {
        const spring = create(...args);
        springs.push(spring);
        return spring;
      },
      pending,
      step: () => {
        const callbacks = [...pending.values()];
        pending.clear();
        time += 1000 / 60;
        callbacks.forEach((callback) => callback(time));
      },
    });
  } finally {
    springs.forEach((spring) => spring.stop());
    names.forEach((name, index) => {
      const descriptor = previous[index];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
}

test("paint errors stay observable without poisoning other springs or future frames", async () => {
  await withScheduler(({ spring, pending, step }) => {
    const error = new Error("paint failed");
    const broken = spring(0, 150, 19, () => {
      throw error;
    });
    const values: number[] = [];
    const healthy = spring(0, 150, 19, (value) => values.push(value));
    broken.set(1);
    healthy.set(1);
    expect(step).toThrow(error);
    expect(values).toHaveLength(1);
    expect(pending.size).toBe(1);
    broken.stop();
    step();
    expect(values).toHaveLength(2);
    healthy.stop();
    expect(pending.size).toBe(0);
    healthy.set(2);
    expect(pending.size).toBe(1);
    step();
    expect(values).toHaveLength(3);
  });
});

test("all paint errors are reported after callbacks can stop or retarget", async () => {
  await withScheduler(({ spring, pending, step }) => {
    const errors = [new Error("first"), new Error("second")];
    const first = spring(0, 150, 19, () => {
      first.stop();
      throw errors[0];
    });
    let paints = 0;
    const second = spring(0, 150, 19, () => {
      if (++paints === 1) {
        second.set(2);
        throw errors[1];
      }
      second.stop();
    });
    first.set(1);
    second.set(1);
    let caught: unknown;
    try {
      step();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AggregateError);
    expect((caught as AggregateError).errors).toEqual(errors);
    expect(pending.size).toBe(1);
    step();
    expect(paints).toBe(2);
    expect(pending.size).toBe(0);
  });
});

test("a settled spring requeued by paint runs only once per frame", async () => {
  await withScheduler(({ spring, pending, step }) => {
    let paints = 0;
    const reentrant = spring(0, 150, 19, () => {
      // Bound the old live-Set loop rather than hanging the test runner.
      if (++paints < 4) reentrant.set(0);
    });
    reentrant.set(0);
    step();
    expect(paints).toBe(1);
    expect(pending.size).toBe(1);
    step();
    expect(paints).toBe(2);
  });
});

test("new springs wait until the next frame and canceled snapshot entries do not paint", async () => {
  await withScheduler(({ spring, pending, step }) => {
    const painted: string[] = [];
    const added = spring(0, 150, 19, () => painted.push("added"));
    const canceled = spring(0, 150, 19, () => painted.push("canceled"));
    const leader = spring(0, 150, 19, () => {
      painted.push("leader");
      canceled.stop();
      added.set(1);
      leader.stop();
    });
    leader.set(1);
    canceled.set(1);
    step();
    expect(painted).toEqual(["leader"]);
    expect(pending.size).toBe(1);
    step();
    expect(painted).toEqual(["leader", "added"]);
  });
});

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
