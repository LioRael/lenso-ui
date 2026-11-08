import { expect, test } from "bun:test";
import { afterGeometrySettles } from "../src/settled-geometry.js";

// Resizable-filter tests check decoded geometry, but cannot catch full optical
// maps being encoded on every frame of a drawer's layout animation.
test("continuous resizing reuses the current map and fits once after geometry settles", () => {
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (frame) => {
    frames.delete(frame);
  };
  const tick = () => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  };
  let fits = 0;
  let cancel: (() => void) | undefined;
  try {
    for (let frame = 0; frame < 30; frame++) {
      cancel?.();
      cancel = afterGeometrySettles(() => fits++);
      tick();
      expect(fits).toBe(0);
    }
    tick();
    expect(fits).toBe(1);
    tick();
    expect(fits).toBe(1);
    cancel = afterGeometrySettles(() => fits++);
    tick();
    cancel();
    tick();
    expect(fits).toBe(1);
    expect(frames.size).toBe(0);
  } finally {
    cancel?.();
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});
