import { expect, test } from "bun:test";
import { attachBackdropSnapshot } from "../../src/backdrop-snapshot.js";

// Running scroll timelines must not permanently block a static owned background.
test("scroll-driven shadows allow a snapshot and scrolling invalidates it", async () => {
  const view = document.defaultView!;
  const raf = view.requestAnimationFrame,
    cancel = view.cancelAnimationFrame;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "DocumentTimeline");
  class Timeline {
    currentTime = 0;
    duration = null;
  }
  Object.defineProperty(globalThis, "DocumentTimeline", { configurable: true, value: Timeline });
  const frames = new Map<number, FrameRequestCallback>();
  let serial = 0;
  view.requestAnimationFrame = (callback) => {
    frames.set(++serial, callback);
    return serial;
  };
  view.cancelAnimationFrame = (id) => {
    frames.delete(id);
  };
  const source = document.createElement("div"),
    lens = document.createElement("div");
  lens.style.backdropFilter = "blur(3px)";
  document.body.append(source, lens);
  let timeline: AnimationTimeline = new Timeline();
  source.getAnimations = () => [{ pending: false, playState: "running", timeline } as Animation];
  let prepared = 0,
    disposed = 0;
  const stop = attachBackdropSnapshot(lens, {
    source,
    ready: () => true,
    async prepare() {
      prepared++;
      return {
        surface: document.createElement("div"),
        dispose() {
          disposed++;
        },
      };
    },
  });
  async function step() {
    const current = [...frames.values()];
    frames.clear();
    for (const callback of current) callback(serial * 16);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  try {
    await step();
    await step();
    await step();
    expect(prepared).toBe(0);
    timeline = { currentTime: 0, duration: null };
    source.dispatchEvent(new Event("scroll"));
    await step();
    await step();
    await step();
    expect(prepared).toBe(1);
    expect(lens.previousElementSibling?.hasAttribute("data-glass-backdrop-snapshot")).toBe(true);
    source.dispatchEvent(new Event("scroll"));
    expect(disposed).toBe(1);
    expect(lens.style.backdropFilter).toBe("blur(3px)");
  } finally {
    stop();
    source.remove();
    lens.remove();
    view.requestAnimationFrame = raf;
    view.cancelAnimationFrame = cancel;
    if (descriptor) Object.defineProperty(globalThis, "DocumentTimeline", descriptor);
    else Reflect.deleteProperty(globalThis, "DocumentTimeline");
  }
});

// Retiring the lens's own filter does not retire its separately hoisted native paints.
test("complete owned materials hide native paints and restore them on invalidation", async () => {
  const { paintBackdrop } = await import("../../src/panel-backdrop.js");
  const view = document.defaultView!;
  const raf = view.requestAnimationFrame,
    cancel = view.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let serial = 0;
  view.requestAnimationFrame = (callback) => {
    frames.set(++serial, callback);
    return serial;
  };
  view.cancelAnimationFrame = (id) => {
    frames.delete(id);
  };
  const source = document.createElement("div"),
    lens = document.createElement("div");
  source.getAnimations = () => [];
  document.body.append(source, lens);
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const native = paintBackdrop(lens);
  const paints = lens.previousElementSibling as HTMLElement;
  const stop = attachBackdropSnapshot(
    lens,
    {
      source,
      ready: () => true,
      async prepare() {
        return { surface: document.createElement("div"), includesMaterial: true, dispose() {} };
      },
    },
    (active) => native.setVisible(!active),
  );
  const step = async () => {
    const callbacks = [...frames.values()];
    frames.clear();
    for (const callback of callbacks) callback(serial * 16);
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  try {
    expect(paints.style.display).toBe("");
    await step();
    await step();
    await step();
    expect(lens.nextElementSibling?.hasAttribute("data-glass-backdrop-snapshot")).toBe(true);
    expect(paints.style.display).toBe("none");
    const inspection = document.createElement("style");
    inspection.textContent = "body {}";
    document.head.append(inspection);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(paints.style.display).toBe("none");
    inspection.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(paints.style.display).toBe("none");
    inspection.textContent = "body { color: red; }";
    document.head.append(inspection);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(paints.style.display).toBe("");
    inspection.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await step();
    await step();
    await step();
    expect(paints.style.display).toBe("none");
    source.dispatchEvent(new Event("scroll"));
    expect(paints.style.display).toBe("");
    expect(lens.nextElementSibling?.hasAttribute("data-glass-backdrop-snapshot")).not.toBe(true);
  } finally {
    stop();
    native();
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
    source.remove();
    lens.remove();
    view.requestAnimationFrame = raf;
    view.cancelAnimationFrame = cancel;
  }
});
