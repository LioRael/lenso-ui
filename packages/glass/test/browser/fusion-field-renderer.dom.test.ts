import { expect, test } from "bun:test";
import { createFusionFieldRenderer } from "../../src/fusion-field-renderer.js";
import type { FusionFieldInput } from "../../src/fusion-fields.js";

// Browser pixel checks cover rendering. This seam catches stranded in-flight
// work on unmount and dead workers being reused after an asynchronous failure.
test("fusion planes share a worker and teardown settles only the owner's pending field", async () => {
  const previousWorker = globalThis.Worker;
  const previousCanvas = globalThis.OffscreenCanvas;
  const instances: FakeWorker[] = [];
  class FakeWorker {
    terminated = false;
    onmessage?: (event: MessageEvent) => void;
    onerror?: (event: ErrorEvent) => void;
    onmessageerror?: () => void;
    constructor() {
      instances.push(this);
    }
    postMessage() {}
    terminate() {
      this.terminated = true;
    }
  }
  globalThis.Worker = FakeWorker as unknown as typeof Worker;
  globalThis.OffscreenCanvas = class {} as unknown as typeof OffscreenCanvas;
  const renderer = createFusionFieldRenderer();
  const neighbor = createFusionFieldRenderer();
  try {
    expect(renderer.backend).toBe("worker");
    expect(instances.length).toBe(1);
    // The input remains in the worker until teardown, so no rasterizer runs here.
    const pending = renderer.render({} as FusionFieldInput);
    renderer.destroy();
    expect(await pending).toBeUndefined();
    expect(instances[0]!.terminated).toBe(false);
    expect(neighbor.backend).toBe("worker");
    neighbor.destroy();
    expect(instances[0]!.terminated).toBe(true);
    expect(await renderer.render({} as FusionFieldInput)).toBeUndefined();
  } finally {
    renderer.destroy();
    neighbor.destroy();
    globalThis.Worker = previousWorker;
    globalThis.OffscreenCanvas = previousCanvas;
  }
});

test("an idle worker failure selects the main-thread fallback before the next request", () => {
  const previousWorker = globalThis.Worker;
  const previousCanvas = globalThis.OffscreenCanvas;
  const instances: FakeWorker[] = [];
  class FakeWorker {
    terminated = false;
    onerror?: (event: { message: string; preventDefault(): void }) => void;
    constructor() {
      instances.push(this);
    }
    terminate() {
      this.terminated = true;
    }
  }
  globalThis.Worker = FakeWorker as unknown as typeof Worker;
  globalThis.OffscreenCanvas = class {} as unknown as typeof OffscreenCanvas;
  const renderer = createFusionFieldRenderer();
  try {
    instances[0]!.onerror!({ message: "worker blocked", preventDefault() {} });
    expect(renderer.backend).toBe("main");
    expect(instances[0]!.terminated).toBe(true);
  } finally {
    renderer.destroy();
    globalThis.Worker = previousWorker;
    globalThis.OffscreenCanvas = previousCanvas;
  }
});
