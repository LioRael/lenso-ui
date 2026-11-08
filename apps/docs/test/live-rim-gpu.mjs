import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MOTION_OUTPUT ?? "/tmp/lenso-menu-contour/gpu";
await mkdir(out, { recursive: true });
for (const [name, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/test/live-rim.html`, { waitUntil: "domcontentloaded" });
    const result = await page.evaluate(async () => {
      const { foregroundRimPixels, paintLiveRim, releaseLiveRim, sampleMenu, createLiveRim } =
        await import("/test/live-rim-fixture.ts");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const checks = [];
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
      // Pixel-only tests miss premature release while another popup still draws.
      const firstOwner = {},
        secondOwner = {};
      const layout = { width: 250, height: 600 };
      paintLiveRim(44, 44, 22, shape, layout, firstOwner);
      const held = paintLiveRim(250, 600, 34, shape, layout, secondOwner);
      if (!held) return { unavailable: true };
      releaseLiveRim(firstOwner);
      releaseLiveRim(firstOwner);
      const retained = [held.canvas.width, held.canvas.height];
      releaseLiveRim(secondOwner);
      const released = [held.canvas.width, held.canvas.height];
      for (const mode of ["light", "dark"])
        for (const profile of ["small", "medium", "clear"])
          for (const size of [
            [44, 44, 22],
            [113.283, 109.077, 54.5385],
            [250, 600, 34],
            [306.25, 700.125, 34],
          ]) {
            const recipe = { ...shape, appleMode: mode, materialProfile: profile };
            const [w, h, r] = size;
            const gpu = paintLiveRim(w, h, r, recipe, layout);
            if (!gpu) return { unavailable: true };
            canvas.width = gpu.width;
            canvas.height = gpu.height;
            ctx.drawImage(
              gpu.canvas,
              0,
              gpu.canvas.height - gpu.height,
              gpu.width,
              gpu.height,
              0,
              0,
              gpu.width,
              gpu.height,
            );
            const actual = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const expected = foregroundRimPixels(w, h, r, recipe).data;
            if (actual.length !== expected.length) throw new Error("GPU frame dimensions changed");
            let maxAlpha = 0,
              maxPremult = 0,
              sum = 0;
            for (let at = 0; at < actual.length; at += 4) {
              const alpha = Math.abs(actual[at + 3] - expected[at + 3]);
              const premult = Math.abs(
                (actual[at] * actual[at + 3]) / 255 - (expected[at] * expected[at + 3]) / 255,
              );
              maxAlpha = Math.max(maxAlpha, alpha);
              maxPremult = Math.max(maxPremult, premult);
              sum += alpha + premult;
            }
            checks.push({
              mode,
              profile,
              size,
              maxAlpha,
              maxPremult,
              mean: sum / ((actual.length / 4) * 2),
            });
          }
      const element = document.createElement("span");
      document.body.append(element);
      const rim = createLiveRim(element);
      const costs = [];
      // Reserve/grow/shrink pixels above, then guard against per-frame buffer allocation.
      let allocations = 0;
      for (const key of ["width", "height"]) {
        const property = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, key);
        Object.defineProperty(held.canvas, key, {
          get() {
            return property.get.call(this);
          },
          set(value) {
            allocations++;
            property.set.call(this, value);
          },
        });
      }
      // Warm the renderer; include the consumer copy and CSS updates in timings.
      for (let round = 0; round < 3; round++) {
        let sum = 0,
          max = 0;
        for (let t = 0; t < 442; t += 16) {
          const pose = sampleMenu(
            t,
            true,
            { width: 140, height: 44, x: 0, y: -44 },
            { width: 250, height: 600 },
            34,
          );
          const start = performance.now();
          rim.paint(pose.width, pose.height, pose.corner, shape, { width: 250, height: 600 });
          const ms = performance.now() - start;
          sum += ms;
          max = Math.max(max, ms);
        }
        costs.push({ sum, max });
      }
      const animatedAllocations = allocations;
      rim.destroy();
      element.remove();
      const idle = [held.canvas.width, held.canvas.height];
      return { checks, costs, retained, released, idle, animatedAllocations };
    });
    await writeFile(`${out}/${name}.json`, JSON.stringify(result, null, 2));
    assert.ok(!result.unavailable, `${name}: WebGL rim path unavailable`);
    assert.ok(result.retained[0] >= 504 && result.retained[1] >= 1204);
    assert.deepEqual(result.released, [1, 1]);
    assert.deepEqual(result.idle, [1, 1]);
    assert.ok(result.animatedAllocations <= 8, "animated rims must reuse their drawing buffer");
    for (const c of result.checks) {
      assert.ok(c.maxAlpha <= 3 && c.maxPremult <= 3 && c.mean < 0.2, JSON.stringify(c));
    }
    console.log(
      `PASS ${name}: ${result.checks.length} GPU/reference pixel comparisons; warm submission totals ${result.costs
        .slice(1)
        .map((x) => x.sum.toFixed(1))
        .join(", ")}ms`,
    );
  } finally {
    await browser.close();
  }
}
