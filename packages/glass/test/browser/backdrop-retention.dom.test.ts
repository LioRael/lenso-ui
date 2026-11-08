import { expect, mock, test } from "bun:test";

// Exercise the real registration/manager lifecycle with deterministic GPU and
// capture adapters: hiding one owner must not destroy its visible sibling.
test("shared backdrop visibility preserves ready canvases and suspends drawing", async () => {
  const opticsModule = { ...(await import("../../src/gpu-optics.js")) };
  const captureModule = { ...(await import("../../src/gpu-capture.js")) };
  let builds = 0,
    submissions = 0,
    captured = false;
  const device = {
    createCommandEncoder: () => ({ finish: () => ({}) }),
    queue: {
      submit: () => {
        submissions++;
      },
    },
    lost: new Promise(() => {}),
    addEventListener() {},
    destroy() {},
  };
  const gpu = Object.getOwnPropertyDescriptor(navigator, "gpu");
  Object.defineProperty(navigator, "gpu", {
    configurable: true,
    value: { requestAdapter: async () => ({ requestDevice: async () => device }) },
  });
  const usage = Object.getOwnPropertyDescriptor(globalThis, "GPUTextureUsage");
  Object.defineProperty(globalThis, "GPUTextureUsage", {
    configurable: true,
    value: { RENDER_ATTACHMENT: 16, COPY_DST: 2 },
  });
  const context = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = ((kind: string) =>
    kind === "webgpu"
      ? { configure() {}, unconfigure() {}, getCurrentTexture: () => ({}) }
      : null) as typeof context;
  mock.module("../../src/gpu-optics.js", () => ({
    readOptics: () => ({
      field: { getAttribute: (name: string) => (name === "width" ? "64" : "44") },
      key: "fixture",
      material: "matrix",
    }),
    createOpticsBatch: async () => {
      builds++;
      return { padding: 0, bytes: 4096, update() {}, copy() {}, dispose() {} };
    },
  }));
  mock.module("../../src/gpu-capture.js", () => ({
    BackdropPaint: class {
      read() {
        return { opaque: false };
      }
      snapshot() {
        return {};
      }
      dispose() {}
    },
    createBackdropAtlas: () => ({
      update: async () => {
        if (captured) return;
        captured = true;
        return { pixels: {}, indices: [0, 1], columns: 2 };
      },
      dispose() {},
    }),
  }));
  const { registerSharedBackdrop } = await import("../../src/gpu-backdrop.js");
  const source = document.createElement("div");
  Object.defineProperties(source, { offsetWidth: { value: 300 }, offsetHeight: { value: 300 } });
  source.getBoundingClientRect = () => new DOMRect(0, 0, 300, 300);
  const entries = [0, 1].map((index) => {
    const element = document.createElement("div"),
      layer = document.createElement("div"),
      optics = document.createElement("div");
    element.style.cssText = "--lg-material:apple;--lg-blur:3px;filter:none;opacity:1;scale:none";
    Object.defineProperties(element, { offsetWidth: { value: 64 }, offsetHeight: { value: 44 } });
    element.getBoundingClientRect = () => new DOMRect(10 + index * 80, 10, 64, 44);
    document.body.append(element, layer, optics);
    const registration = registerSharedBackdrop(element, source, layer, optics, () => {})!;
    return { element, layer, optics, registration };
  });
  document.body.append(source);
  const { BackdropReads } = await import("../../src/backdrop-scheduler.js");
  const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
  try {
    for (const { registration } of entries)
      registration
        .read({ content: true, styles: true, animated: new Map() }, new BackdropReads(), 0)
        .write();
    await settle();
    const canvases = entries.map(({ layer }) => layer.querySelector("canvas")!);
    expect(canvases.every(Boolean)).toBe(true);
    expect(builds).toBe(1);
    entries[0]!.registration.visible(false);
    await settle();
    expect(canvases.every((canvas) => canvas.isConnected)).toBe(true);
    entries[1]!.registration.visible(false);
    await settle();
    const painted = submissions;
    expect(canvases.every((canvas) => canvas.isConnected && !canvas.hidden)).toBe(true);
    entries[0]!.registration.visible(true);
    await settle();
    expect(builds).toBe(1);
    expect(submissions).toBe(painted);
    expect(entries[0]!.layer.querySelector("canvas")).toBe(canvases[0]!);
    for (const { registration } of entries) registration.stop();
    expect(canvases.every((canvas) => !canvas.isConnected)).toBe(true);
  } finally {
    for (const { registration, element, layer, optics } of entries) {
      registration.stop();
      element.remove();
      layer.remove();
      optics.remove();
    }
    source.remove();
    HTMLCanvasElement.prototype.getContext = context;
    if (gpu) Object.defineProperty(navigator, "gpu", gpu);
    else Reflect.deleteProperty(navigator, "gpu");
    if (usage) Object.defineProperty(globalThis, "GPUTextureUsage", usage);
    else Reflect.deleteProperty(globalThis, "GPUTextureUsage");
    mock.module("../../src/gpu-optics.js", () => opticsModule);
    mock.module("../../src/gpu-capture.js", () => captureModule);
  }
});
