import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
const moduleURL = (file) =>
  `/@fs${fileURLToPath(new URL(`../../../packages/glass/src/${file}.ts`, import.meta.url))}`;

// Flat colour/alpha samples miss alternating bright and dark contours in a
// blurred backdrop. A neutral ramp must follow the increasing fitted curve.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const dpr of [1, 2]) {
      const page = await browser.newPage({
        viewport: { width: 600, height: 200 },
        deviceScaleFactor: dpr,
      });
      await page.goto(`${base}/en/docs/react/components/command`);
      for (const size of [0, 1]) {
        const expected = await page.evaluate(
          async ({ svgURL, cpuURL, size }) => {
            const { appendMaterialTone } = await import(svgURL);
            const { materialTone } = await import(cpuURL);
            const ns = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(ns, "svg");
            svg.id = "tone-ramp";
            svg.setAttribute("width", "512");
            svg.setAttribute("height", "80");
            svg.style.cssText = "position:fixed;inset:0;z-index:99999;background:white";
            const filter = document.createElementNS(ns, "filter");
            filter.id = "ramp-tone";
            filter.setAttribute("color-interpolation-filters", "sRGB");
            appendMaterialTone(filter, "SourceGraphic", { mode: "dark", size, clarity: 0 });
            svg.append(filter);
            const group = document.createElementNS(ns, "g");
            group.setAttribute("filter", "url(#ramp-tone)");
            for (let value = 0; value < 256; value++) {
              const rect = document.createElementNS(ns, "rect");
              for (const [key, entry] of Object.entries({
                x: value * 2,
                width: 2,
                height: 80,
                fill: `rgb(${value} ${value} ${value})`,
              }))
                rect.setAttribute(key, String(entry));
              group.append(rect);
            }
            svg.append(group);
            document.getElementById("tone-ramp")?.remove();
            document.body.append(svg);
            return Array.from(
              { length: 161 },
              (_, value) =>
                materialTone([value / 255, value / 255, value / 255], {
                  mode: "dark",
                  size,
                  clarity: 0,
                })[0] * 255,
            );
          },
          { svgURL: moduleURL("material-tone-svg"), cpuURL: moduleURL("material-tone"), size },
        );
        const png = (await page.locator("#tone-ramp").screenshot()).toString("base64");
        const samples = await page.evaluate(async (png) => {
          const image = new Image();
          image.src = `data:image/png;base64,${png}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const scale = image.width / 512;
          return Array.from(
            { length: 161 },
            (_, value) =>
              context.getImageData((value * 2 + 1) * scale, image.height / 2, 1, 1).data[0],
          );
        }, png);
        const error = Math.max(...samples.map((value, i) => Math.abs(value - expected[i])));
        const reversals = samples.reduce(
          (sum, value, i) => sum + (i ? Math.max(0, samples[i - 1] - value) : 0),
          0,
        );
        assert.ok(
          error <= (name === "chromium" ? 1.1 : 8) && reversals === 0,
          `${name} DPR=${dpr} size=${size}: error=${error}, reversals=${reversals}`,
        );
        console.log(
          `${name} DPR=${dpr} size=${size}: error=${error.toFixed(3)}, reversals=${reversals}`,
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
