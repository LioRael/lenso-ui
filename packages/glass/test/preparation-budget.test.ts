import assert from "node:assert/strict";
import { test } from "bun:test";
import { createPreparationCheckpoint } from "../src/preparation-budget.js";

function clock() {
  let time = 0;
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const view = {
    performance: { now: () => time } as Performance,
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      frames.set(++id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
  };
  return {
    view,
    frames,
    advance: (duration: number) => (time += duration),
    paint: () => {
      time += 16;
      for (const [id, callback] of [...frames]) {
        frames.delete(id);
        callback(time);
      }
    },
  };
}

test("small preparation units continue until their shared time budget is spent", async () => {
  const page = clock();
  const checkpoint = createPreparationCheckpoint(new AbortController().signal, page.view);
  page.advance(3);
  assert.equal(await checkpoint(), true);
  assert.equal(page.frames.size, 0);
  page.advance(2);
  const yielded = checkpoint();
  assert.equal(page.frames.size, 1);
  page.paint();
  assert.equal(await yielded, true);
  page.advance(3);
  assert.equal(await checkpoint(), true);
  assert.equal(page.frames.size, 0);
});

test("cancelling preparation resolves a pending yield even without another browser frame", async () => {
  const page = clock();
  const abort = new AbortController();
  const checkpoint = createPreparationCheckpoint(abort.signal, page.view);
  page.advance(5);
  const pending = checkpoint();
  assert.equal(page.frames.size, 1);
  abort.abort();
  assert.equal(await pending, false);
  assert.equal(page.frames.size, 0);
});

test("an already cancelled request cannot queue more preparation", async () => {
  const page = clock();
  const abort = new AbortController();
  const checkpoint = createPreparationCheckpoint(abort.signal, page.view);
  abort.abort();
  page.advance(5);
  assert.equal(await checkpoint(), false);
  assert.equal(page.frames.size, 0);
});
