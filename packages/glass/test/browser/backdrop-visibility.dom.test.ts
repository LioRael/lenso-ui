import { expect, mock, test } from "bun:test";
import type { observeBackdrop } from "../../src/backdrop-scheduler.js";
import type { SharedBackdropRegistration } from "../../src/gpu-backdrop.js";

// Registration tests drive visible() directly. These cover the copy controller
// combining source coverage with viewport visibility and async registration.
for (const lateRegistration of [true, false])
  test(`uncovered copies remain paused during ${lateRegistration ? "late registration" : "viewport re-entry"}`, async () => {
    const scheduler = { ...(await import("../../src/backdrop-scheduler.js")) };
    const renderer = { ...(await import("../../src/gpu-backdrop.js")) };
    const intersection = Object.getOwnPropertyDescriptor(globalThis, "IntersectionObserver");
    let notify: IntersectionObserverCallback | undefined;
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      value: class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    });
    let client: Parameters<typeof observeBackdrop>[0] | undefined;
    const visible: boolean[] = [];
    let stopped = 0;
    mock.module("../../src/backdrop-scheduler.js", () => ({
      ...scheduler,
      observeBackdrop(entry: Parameters<typeof observeBackdrop>[0]) {
        client = entry;
        return { invalidate() {}, visible() {}, stop() {} };
      },
    }));
    mock.module("../../src/gpu-backdrop.js", () => ({
      ...renderer,
      registerSharedBackdrop(): SharedBackdropRegistration {
        return {
          visible(value) {
            visible.push(value);
          },
          stop() {
            stopped++;
          },
          updateSource() {
            return undefined;
          },
          read() {
            return { native: true, write() {} };
          },
        };
      },
    }));
    const root = document.createElement("div"),
      source = document.createElement("div"),
      lens = document.createElement("button");
    let covered = true;
    source.style.backgroundColor = "rgb(100, 120, 150)";
    lens.style.cssText =
      "--lg-material:apple;--lg-blur:3px;border-radius:16px;opacity:1;visibility:visible;filter:none";
    source.getBoundingClientRect = () => new DOMRect(0, covered ? 0 : -500, 300, 300);
    lens.getBoundingClientRect = () => new DOMRect(20, 20, 72, 48);
    Object.defineProperties(source, { offsetWidth: { value: 300 }, offsetHeight: { value: 300 } });
    Object.defineProperties(lens, { offsetWidth: { value: 72 }, offsetHeight: { value: 48 } });
    root.append(source, lens);
    document.body.append(root);
    let stop: (() => void) | undefined;
    const flush = () => {
      const reads = new scheduler.BackdropReads();
      // Happy DOM lacks CSSStyleDeclaration's iterator. Paint values are not
      // under test here; preserve the real geometry and coverage reads.
      reads.values = (element, names = []) =>
        new Map([...names].map((name) => [name, getComputedStyle(element).getPropertyValue(name)]));
      client!.prepare();
      client!.read({ content: false, styles: true, animated: new Map() }, reads, true)();
    };
    try {
      const { copyBackdrop } = await import("../../src/backdrop.js");
      stop = copyBackdrop(lens, source);
      if (!lateRegistration) {
        flush();
        await new Promise((resolve) => setTimeout(resolve, 0));
        flush();
        expect(lens.hasAttribute("data-copy")).toBe(true);
      }
      covered = false;
      flush();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(visible.at(-1)).toBe(false);
      expect(lens.hasAttribute("data-copy")).toBe(false);
      if (!lateRegistration) {
        for (const isIntersecting of [false, true])
          notify!(
            [
              {
                target: lens,
                isIntersecting,
                intersectionRatio: Number(isIntersecting),
                boundingClientRect: lens.getBoundingClientRect(),
                intersectionRect: lens.getBoundingClientRect(),
                rootBounds: null,
                time: 0,
              },
            ],
            {} as IntersectionObserver,
          );
        expect(visible.at(-1)).toBe(false);
      }
      covered = true;
      flush();
      expect(visible.at(-1)).toBe(true);
      expect(lens.hasAttribute("data-copy")).toBe(true);
      stop();
      stop = undefined;
      expect(stopped).toBe(1);
    } finally {
      stop?.();
      root.remove();
      mock.module("../../src/backdrop-scheduler.js", () => scheduler);
      mock.module("../../src/gpu-backdrop.js", () => renderer);
      if (intersection) Object.defineProperty(globalThis, "IntersectionObserver", intersection);
      else Reflect.deleteProperty(globalThis, "IntersectionObserver");
    }
  });
