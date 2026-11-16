import { expect, test } from "bun:test";
import { createBackdropAtlas } from "../../src/gpu-capture.js";

// Decoding can finish after the shared backdrop owner has released its atlas.
for (const mode of ["retained", "tiled", "moving"] as const) {
  test(`disposing a ${mode} atlas prevents late decode writes and output`, async () => {
    const context = HTMLCanvasElement.prototype.getContext;
    const decode = HTMLImageElement.prototype.decode;
    const decodes: (() => void)[] = [];
    let writes = 0;
    // Happy DOM has no raster backend; record the capture's canvas writes.
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: () => ({
        clearRect() {
          writes++;
        },
        drawImage() {
          writes++;
        },
      }),
    });
    HTMLImageElement.prototype.decode = () => new Promise<void>((resolve) => decodes.push(resolve));
    const root = document.createElement("div");
    const child = document.createElement("div");
    root.append(child);
    const state = {
      revision: 1,
      changed: true,
      current: undefined,
      paint: {
        root,
        originals: [root, child],
        copies: [root, child],
        moving: mode === "moving" ? child : undefined,
        movingIndex: mode === "moving" ? 1 : undefined,
        opaque: true,
        width: 500,
        height: 500,
      },
    };
    const atlas = createBackdropAtlas({ width: 40, height: 30, margin: 3, dpr: 1, count: 1 });
    try {
      const pending = atlas.update(state, [{ x: 100, y: 100, scaleX: mode === "tiled" ? 2 : 1 }]);
      expect(decodes.length).toBe(1);
      atlas.dispose();
      decodes.shift()!();
      // Drain any wrongly started second capture without hanging the regression.
      for (let i = 0; i < 4; i++) {
        await Promise.resolve();
        for (const resolve of decodes.splice(0)) resolve();
      }
      const result = await pending;
      expect(writes).toBe(0);
      expect(result === undefined).toBe(true);
      expect(atlas.captures).toBe(0);
      atlas.dispose();
      expect(await atlas.update(state, [{ x: 100, y: 100 }])).toBeUndefined();
      expect(decodes.length).toBe(0);

      const replacement = createBackdropAtlas({
        width: 40,
        height: 30,
        margin: 3,
        dpr: 1,
        count: 1,
      });
      try {
        const next = replacement.update(state, [
          { x: 100, y: 100, scaleX: mode === "tiled" ? 2 : 1 },
        ]);
        for (let i = 0; i < 6; i++) {
          for (const resolve of decodes.splice(0)) resolve();
          await Promise.resolve();
        }
        const output = await next;
        expect(output?.indices).toEqual([0]);
        expect(output?.pixels.width).toBe(48);
        expect(output?.pixels.height).toBe(38);
        expect(writes).toBeGreaterThan(0);
        expect(replacement.captures).toBe(1);
      } finally {
        replacement.dispose();
      }
    } finally {
      atlas.dispose();
      HTMLCanvasElement.prototype.getContext = context;
      HTMLImageElement.prototype.decode = decode;
    }
  });
}
