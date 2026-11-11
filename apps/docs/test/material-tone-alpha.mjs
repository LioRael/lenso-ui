import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
const moduleURL = (file) =>
  `/@fs${fileURLToPath(new URL(`../../../packages/glass/src/${file}.ts`, import.meta.url))}`;

// Blurred edges have partial coverage; nested backdrop roots can have none.
// RGB-only tests miss both black arithmetic fringes and an opaque dark face
// fabricated from transparent input. Check the colour and original coverage.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const dpr of [1, 2, 3]) {
      const page = await browser.newPage({
        viewport: { width: 600, height: 200 },
        deviceScaleFactor: dpr,
      });
      await page.goto(`${base}/cn`);
      await page.locator('[data-home-showcase] [role="tablist"][data-ready]').waitFor();
      for (const size of [0, 1]) {
        for (const clarity of [0, 0.5, 1]) {
          const expected = await page.evaluate(
            async ({ svgURL, cpuURL, size, clarity }) => {
              const { appendMaterialTone } = await import(svgURL);
              const { materialTone } = await import(cpuURL);
              const ns = "http://www.w3.org/2000/svg";
              const svg = document.createElementNS(ns, "svg");
              svg.id = "tone-fixture";
              svg.setAttribute("width", "480");
              svg.setAttribute("height", "80");
              svg.style.cssText = "position:fixed;inset:0;z-index:99999";
              svg.style.backgroundColor = "white";
              const filter = document.createElementNS(ns, "filter");
              filter.id = "tone-test";
              filter.setAttribute("color-interpolation-filters", "sRGB");
              appendMaterialTone(filter, "SourceGraphic", { mode: "dark", size, clarity });
              svg.append(filter);
              const group = document.createElementNS(ns, "g");
              group.setAttribute("filter", "url(#tone-test)");
              for (const [i, alpha] of [0, 0.25, 0.5, 0.75, 1].entries()) {
                const rect = document.createElementNS(ns, "rect");
                for (const [key, value] of Object.entries({
                  x: i * 96,
                  width: 96,
                  height: 80,
                  fill: "rgb(51 128 179)",
                  "fill-opacity": alpha,
                }))
                  rect.setAttribute(key, String(value));
                group.append(rect);
              }
              svg.append(group);
              document.getElementById("tone-fixture")?.remove();
              document.body.append(svg);
              return materialTone([51 / 255, 128 / 255, 179 / 255], {
                mode: "dark",
                size,
                clarity,
              }).map((n) => n * 255);
            },
            {
              svgURL: moduleURL("material-tone-svg"),
              cpuURL: moduleURL("material-tone"),
              size,
              clarity,
            },
          );
          const png = (await page.locator("#tone-fixture").screenshot()).toString("base64");
          const samples = await page.evaluate(async (png) => {
            const image = new Image();
            image.src = `data:image/png;base64,${png}`;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            return [0, 1, 2, 3, 4].map((i) =>
              [
                ...ctx.getImageData(((i + 0.5) / 5) * image.width, image.height / 2, 1, 1).data,
              ].slice(0, 3),
            );
          }, png);
          for (const [index, sample] of samples.entries()) {
            const alpha = index / 4;
            const composited = expected.map((n) => n * alpha + 255 * (1 - alpha));
            assert.ok(
              sample.every((n, i) => Math.abs(n - composited[i]) <= 8),
              `${name} DPR=${dpr} size=${size} clarity=${clarity} alpha=${alpha}: ${sample} expected ${composited}`,
            );
          }
        }
      }
      console.log(`${name} DPR=${dpr}: material preserves colour and transparent/partial coverage`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
