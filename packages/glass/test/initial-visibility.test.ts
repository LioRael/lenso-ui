import assert from "node:assert/strict";
import { afterEach, test } from "bun:test";
import { whenNearViewport } from "../src/initial-visibility.js";

const original = globalThis.IntersectionObserver;
const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  globalThis.IntersectionObserver = original;
});

function visibility() {
  let deliver: IntersectionObserverCallback;
  const elements = new Set<Element>();
  globalThis.IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      deliver = callback;
    }
    observe(element: Element) {
      elements.add(element);
    }
    unobserve(element: Element) {
      elements.delete(element);
    }
    disconnect() {
      elements.clear();
    }
  } as unknown as typeof IntersectionObserver;
  return (element: HTMLElement, isIntersecting: boolean) => {
    if (elements.has(element))
      deliver([{ target: element, isIntersecting } as unknown as IntersectionObserverEntry], null!);
  };
}

test("offscreen mounts prepare once when they approach the viewport", () => {
  const enter = visibility();
  const element = {} as HTMLElement;
  let starts = 0;
  cleanups.push(whenNearViewport(element, () => starts++));
  enter(element, false);
  assert.equal(starts, 0);
  enter(element, true);
  enter(element, false);
  enter(element, true);
  assert.equal(starts, 1);
});

test("unmount cancels its own preparation without dropping another owner", () => {
  const enter = visibility();
  const element = {} as HTMLElement;
  const starts: string[] = [];
  const cancel = whenNearViewport(element, () => starts.push("cancelled"));
  cleanups.push(
    cancel,
    whenNearViewport(element, () => starts.push("active")),
  );
  cancel();
  enter(element, true);
  assert.deepEqual(starts, ["active"]);
});

test("old cleanup cannot cancel a later attachment to the same element", () => {
  const enter = visibility();
  const element = {} as HTMLElement;
  let starts = 0;
  const old = whenNearViewport(element, () => starts++);
  cleanups.push(old);
  enter(element, true);
  cleanups.push(whenNearViewport(element, () => starts++));
  old();
  enter(element, true);
  assert.equal(starts, 2);
});

test("environments without visibility observation keep immediate preparation", () => {
  globalThis.IntersectionObserver = undefined!;
  let starts = 0;
  cleanups.push(whenNearViewport({} as HTMLElement, () => starts++));
  assert.equal(starts, 1);
});
