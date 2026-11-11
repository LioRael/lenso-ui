import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// Available-GPU comparisons cannot catch a cropped frame leaking into CPU fallback.
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const failure of ["unavailable", "lost"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      if (failure === "unavailable")
        await page.addInitScript(() => {
          const get = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (kind, ...options) {
            return kind === "webgl2" ? null : get.call(this, kind, ...options);
          };
        });
      await page.goto(`${base}/test/live-rim.html`, { waitUntil: "domcontentloaded" });
      const checks = await page.evaluate(async (failure) => {
        const { createLiveRim, paintLiveRim, releaseLiveRim, foregroundRimTiles } =
          await import("/test/live-rim-fixture.ts");
        const shape = {
          level: 1,
          zoom: 1,
          saturation: 1,
          dispersion: 0,
          faceSaturation: 1,
          lightIntensity: 0.25,
          lightAngle: 0,
          appleMode: "light",
          materialProfile: "medium",
        };
        const layout = { width: 250, height: 600 };
        let restore;
        if (failure === "lost") {
          const owner = {};
          const frame = paintLiveRim(44, 44, 22, shape, layout, owner);
          if (!frame) throw new Error("context-loss setup requires a working GPU");
          const extension = frame.canvas.getContext("webgl2").getExtension("WEBGL_lose_context");
          if (!extension) throw new Error("context-loss extension unavailable");
          const read = (image) => {
            const pixels = new Uint8Array(image.width * image.height * 4);
            const gl = image.canvas.getContext("webgl2");
            gl.readPixels(0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            return pixels;
          };
          const before = read(frame);
          restore = async () => {
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("GPU restore timed out")), 5000);
              frame.canvas.addEventListener(
                "webglcontextrestored",
                () => {
                  clearTimeout(timeout);
                  resolve();
                },
                { once: true },
              );
              // The lost event must finish dispatching before requesting restoration.
              setTimeout(() => extension.restoreContext(), 0);
            });
            const recovered = paintLiveRim(44, 44, 22, shape, layout, owner);
            if (recovered?.canvas !== frame.canvas)
              throw new Error("shared renderer did not recover");
            const after = read(recovered);
            if (!before.some(Boolean) || after.some((value, i) => value !== before[i]))
              throw new Error("GPU restore changed the rim pixels");
            releaseLiveRim(owner);
            if (frame.canvas.width !== 1 || frame.canvas.height !== 1)
              throw new Error("recovered renderer retained its drawing buffer");
          };
          await new Promise((resolve) => {
            frame.canvas.addEventListener("webglcontextlost", resolve, { once: true });
            extension.loseContext();
          });
          releaseLiveRim(owner);
        }
        if (paintLiveRim(44, 44, 22, shape, layout))
          throw new Error("GPU failure was not exercised");
        const element = document.createElement("span");
        document.body.append(element);
        const rim = createLiveRim(element);
        const checks = [];
        try {
          for (const [width, height, radius] of [
            [44, 44, 22],
            [113.283, 109.077, 54.5385],
            [250, 600, 34],
          ]) {
            rim.paint(width, height, radius, shape, layout);
            const canvas = element.querySelector("canvas");
            const actual = canvas
              .getContext("2d")
              .getImageData(0, 0, canvas.width, canvas.height).data;
            const expected = foregroundRimTiles(radius, shape)(width, height);
            if (actual.length !== expected.data.length)
              throw new Error("fallback dimensions changed");
            let maxAlpha = 0,
              maxPremult = 0;
            for (let i = 0; i < actual.length; i += 4) {
              maxAlpha = Math.max(maxAlpha, Math.abs(actual[i + 3] - expected.data[i + 3]));
              maxPremult = Math.max(
                maxPremult,
                Math.abs(actual[i] * actual[i + 3] - expected.data[i] * expected.data[i + 3]) / 255,
              );
            }
            checks.push({ width, height, maxAlpha, maxPremult });
          }
        } finally {
          rim.destroy();
          element.remove();
        }
        await restore?.();
        return checks;
      }, failure);
      for (const check of checks)
        assert.ok(check.maxAlpha <= 3 && check.maxPremult <= 3, JSON.stringify(check));
      assert.deepEqual(errors, []);
      console.log(
        "PASS",
        engine,
        failure === "lost" ? "CPU fallback and restored GPU pixels" : "CPU fallback pixels",
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
