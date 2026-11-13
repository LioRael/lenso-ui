import { expect, test } from "bun:test";
import { attachGlass, createGlassContour, readLens } from "../../src/refraction.js";
import { createLiveRim } from "../../src/live-rim.js";

// A deferred optical owner must not erase the animation owner's live contour.
test("contour survives optical cleanup and responds to preferences while resting", async () => {
  const context = HTMLCanvasElement.prototype.getContext;
  const resize = globalThis.ResizeObserver;
  let resized: (() => void) | undefined;
  globalThis.ResizeObserver = class extends resize {
    constructor(callback: ResizeObserverCallback) {
      super(callback);
      resized = () => callback([], this);
    }
  };
  HTMLCanvasElement.prototype.getContext = ((kind: string) =>
    kind === "2d" ? { putImageData() {} } : null) as typeof context;
  const surface = document.createElement("div");
  const lens = document.createElement("span");
  lens.setAttribute("data-material-lens", "");
  lens.style.cssText = "--lg-material:apple;border-radius:20px";
  let width = 100;
  Object.defineProperties(lens, { offsetWidth: { get: () => width }, offsetHeight: { value: 40 } });
  surface.append(lens);
  document.body.append(surface);
  const contour = createGlassContour(surface);
  try {
    contour.paint(70, 36, 18, { width: 100, height: 40 });
    const canvas = lens.querySelector("canvas")!;
    expect(canvas).not.toBeNull();
    createLiveRim(lens).destroy();
    expect(lens.hasAttribute("data-material-live-rim")).toBe(true);
    expect(canvas.isConnected).toBe(true);
    lens.style.setProperty("--lenso-glass-transparency", "0");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lens.querySelector("canvas")).toBeNull();
    lens.style.setProperty("--lenso-glass-transparency", "1");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lens.querySelector("canvas")?.width).toBe(144);
    const resumed = lens.querySelector("canvas");
    surface.setAttribute("data-material-resting", "");
    width = 160;
    resized?.();
    expect(lens.querySelector("canvas")).toBe(resumed);
    expect(resumed?.width).toBe(324);
    contour.clear();
    resized?.();
    expect(lens.querySelector("canvas")).toBeNull();
  } finally {
    contour.destroy();
    surface.remove();
    HTMLCanvasElement.prototype.getContext = context;
    globalThis.ResizeObserver = resize;
  }
});

// Press-only coverage cannot catch a textarea resize or a CSS corner morph.
test("ordinary glass retains its live rim after layout and corner changes", () => {
  const context = HTMLCanvasElement.prototype.getContext;
  const resize = globalThis.ResizeObserver;
  const intersection = globalThis.IntersectionObserver;
  const raf = globalThis.requestAnimationFrame;
  const cancel = globalThis.cancelAnimationFrame;
  const agent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  const callbacks: (() => void)[] = [];
  HTMLCanvasElement.prototype.getContext = ((kind: string) =>
    kind === "2d" ? { putImageData() {} } : null) as typeof context;
  globalThis.ResizeObserver = class extends resize {
    constructor(callback: ResizeObserverCallback) {
      super(callback);
      callbacks.push(() => callback([], this));
    }
  };
  globalThis.IntersectionObserver = undefined!;
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Chrome/150" });
  const surface = document.createElement("div");
  const lens = document.createElement("span");
  lens.style.cssText = "--lg-material:apple;border-radius:20px";
  let width = 100;
  Object.defineProperties(lens, {
    offsetWidth: { get: () => width },
    offsetHeight: { value: 40 },
  });
  surface.append(lens);
  document.body.append(surface);
  const stop = attachGlass(lens);
  try {
    expect(lens.querySelector("canvas")).toBeNull();
    lens.style.borderRadius = "12px";
    const start = new Event("transitionrun", { bubbles: true });
    Object.defineProperty(start, "propertyName", { value: "border-top-left-radius" });
    lens.dispatchEvent(start);
    const canvas = lens.querySelector("canvas")!;
    expect(canvas.width).toBe(204);
    expect(readLens(lens)?.radius).toBe(12);
    const end = new Event("transitionend", { bubbles: true });
    Object.defineProperty(end, "propertyName", { value: "border-top-left-radius" });
    lens.dispatchEvent(end);
    width = 160;
    for (const callback of callbacks) callback();
    expect(lens.querySelector("canvas")).toBe(canvas);
    expect(canvas.width).toBe(324);
    expect(lens.hasAttribute("data-material-live-rim")).toBe(true);
  } finally {
    stop();
    surface.remove();
    HTMLCanvasElement.prototype.getContext = context;
    globalThis.ResizeObserver = resize;
    globalThis.IntersectionObserver = intersection;
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = cancel;
    if (agent) Object.defineProperty(navigator, "userAgent", agent);
    else Reflect.deleteProperty(navigator, "userAgent");
  }
});
