import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const output = new URL("../../../.amp/in/artifacts/tab-bar-real-text/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];
for (const [name, engine] of Object.entries({ webkit, chromium })) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch(name === "chromium" ? { args: ["--use-angle=metal"] } : {});
  try {
    for (const density of [1, 2]) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 1000 },
        deviceScaleFactor: density,
      });
      await page.addInitScript(() => {
        window.textWork = new Map();
        const proto = WebGL2RenderingContext.prototype;
        for (const method of ["texImage2D", "drawArrays", "createTexture", "deleteTexture"]) {
          const original = proto[method];
          proto[method] = function (...args) {
            let work = window.textWork.get(this.canvas);
            if (!work)
              window.textWork.set(
                this.canvas,
                (work = { uploads: 0, draws: 0, textures: 0, removed: 0 }),
              );
            if (method === "texImage2D") work.uploads++;
            if (method === "drawArrays") work.draws++;
            if (method === "createTexture") work.textures++;
            if (method === "deleteTexture") work.removed++;
            return original.apply(this, args);
          };
        }
      });
      await page.goto(`${base}/en/docs/react/components/tab-bar`);
      await page.waitForLoadState("networkidle");
      const nav = page.getByRole("navigation", { name: "Main navigation", exact: true }).first();
      const group = nav.locator("[data-tab-bar-group]").first();
      await group.locator("[data-tab-bar-list] [aria-current=page]").waitFor();
      const toggle = nav
        .locator("..")
        .getByRole("button", { name: "GPU text refraction", exact: true });
      for (const mode of ["svg", "gpu", "gpu", "svg", "gpu", "svg", "svg", "gpu"]) {
        const pressed = (await toggle.getAttribute("aria-pressed")) === "true";
        if (pressed !== (mode === "gpu")) await toggle.click();
        const canvas = nav.locator("[data-tab-bar-text-canvas]");
        if (mode === "gpu") await canvas.waitFor({ state: "attached" });
        await group.scrollIntoViewIfNeeded();
        const link = group.locator("[data-tab-bar-list] [aria-current=page]");
        const start = await link.boundingBox();
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
        await page.mouse.down();
        const sample = await group.evaluate(async (node) => {
          const canvas = node.querySelector("[data-tab-bar-text-canvas]");
          const before = canvas && { ...window.textWork.get(canvas) };
          const links = [
            ...node.querySelectorAll("[data-tab-bar-list] [data-tab-bar-destination]"),
          ];
          const first = links[0].getBoundingClientRect(),
            last = links.at(-1).getBoundingClientRect();
          const times = [],
            work = [];
          let previous = 0;
          for (let i = 0; i < 150; i++) {
            const time = await new Promise(requestAnimationFrame);
            const started = performance.now();
            const progress = (Math.sin(i / 13) + 1) / 2;
            window.dispatchEvent(
              new PointerEvent("pointermove", {
                pointerId: 1,
                pointerType: "mouse",
                isPrimary: true,
                buttons: 1,
                clientX: first.x + first.width / 2 + (last.x - first.x) * progress,
                clientY: first.y + first.height / 2,
              }),
            );
            // Includes the adapter's MutationObserver draw submission, not GPU execution.
            await new Promise(queueMicrotask);
            if (i >= 30) {
              times.push(time - previous);
              work.push(performance.now() - started);
            }
            previous = time;
          }
          const percentile = (values, fraction) =>
            values.toSorted((a, b) => a - b)[Math.floor(values.length * fraction)];
          return {
            p50: percentile(times, 0.5),
            p95: percentile(times, 0.95),
            max: Math.max(...times),
            submissionP50: percentile(work, 0.5),
            submissionP95: percentile(work, 0.95),
            draws: canvas ? window.textWork.get(canvas).draws - before.draws : null,
            uploads: canvas ? window.textWork.get(canvas).uploads - before.uploads : null,
            continuous: canvas ? canvas === node.querySelector("[data-tab-bar-text-canvas]") : null,
            bytes: canvas?.dataset.textureBytes,
            preparation: canvas?.dataset.preparationMs,
            visibility: document.visibilityState,
            focus: document.hasFocus(),
          };
        });
        await page.mouse.up();
        if (mode === "gpu") {
          assert(sample.continuous, "the same glyph texture survives the entire drag");
          assert(sample.draws >= 120, "real text optics are submitted throughout the sample");
          assert.equal(sample.uploads, 0, "moving geometry must not reupload glyphs");
        }
        results.push({ engine: name, density, mode, ...sample });
        console.log(JSON.stringify(results.at(-1)));
        await page.waitForFunction(
          () => !document.querySelector("[data-tab-bar-group][data-highlight-active]"),
        );
      }
      if ((await toggle.getAttribute("aria-pressed")) === "true") await toggle.click();
      assert(
        await page.evaluate(() =>
          [...window.textWork.entries()]
            .filter(([canvas]) => canvas.hasAttribute("data-tab-bar-text-canvas"))
            .every(([, work]) => work.textures === work.removed),
        ),
        "all text textures released after toggling off",
      );
      await page.close();
    }
  } finally {
    await browser.close();
    await writeFile(new URL(`performance-${name}.json`, output), JSON.stringify(results, null, 2));
  }
}
