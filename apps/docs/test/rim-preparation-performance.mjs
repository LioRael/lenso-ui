import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4311";
const modules = `/@fs${new URL("../../../packages/glass/src/", import.meta.url).pathname}`;
const output = process.env.BROWSER_ARTIFACTS;
const baseline = process.env.BASELINE_REFRACTION;
const baselineCode = baseline ? await readFile(baseline, "utf8") : undefined;
const samples = [];
if (output) await mkdir(output, { recursive: true });
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (let run = 0; run < Number(process.env.PERF_RUNS ?? 3); run++) {
      for (const kind of ["light", "dark", "classic", "selection", "non-apple"]) {
        const page = await browser.newPage({ deviceScaleFactor: 2 });
        const errors = [];
        let baselineLoads = 0;
        page.on("pageerror", (error) => errors.push(error.message));
        if (baselineCode)
          await page.route(/\/refraction\.ts(?:\?|$)/, (route) => {
            baselineLoads++;
            return route.fulfill({ contentType: "text/javascript", body: baselineCode });
          });
        await page.route(`${base}/__rim-preparation`, (route) =>
          route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><title>Rim preparation</title><style>
              body{background:repeating-linear-gradient(45deg,#cf315d,#286bc1 70px);height:900px}
              #lens{position:absolute;left:40px;top:40px;width:320px;height:180px;border-radius:24px;
                backdrop-filter:blur(3px);--lg-material:apple;--lenso-material-action-mode:light}
              #lens::after{content:"";position:absolute;inset:-1px;background-image:var(--lg-foreground-rim,var(--lg-rim));background-size:100% 100%}
              #lens[data-kind="dark"]{--lenso-material-action-mode:dark}
              #lens[data-kind="classic"]{--lenso-glass-rim:classic}
              #lens[data-kind="non-apple"]{--lg-material:ordinary}
            </style><div id="lens" data-kind="${kind}"></div>`,
          }),
        );
        await page.goto(`${base}/__rim-preparation`);
        const sample = await page.evaluate(
          async ({ modules, kind }) => {
            const { attachGlassRim, readLens } = await import(`${modules}refraction.ts`);
            const { foregroundRimPixels } = await import(`${modules}foreground-rim.ts`);
            const lens = document.querySelector("#lens");
            const NativeImageData = window.ImageData;
            const encode = HTMLCanvasElement.prototype.toDataURL;
            let allocations = 0,
              bytes = 0,
              encodes = 0,
              encodeMs = 0;
            window.ImageData = new Proxy(NativeImageData, {
              construct(target, args) {
                const image = Reflect.construct(target, args);
                allocations++;
                bytes += image.data.byteLength;
                return image;
              },
            });
            HTMLCanvasElement.prototype.toDataURL = function (...args) {
              encodes++;
              const start = performance.now();
              const result = encode.apply(this, args);
              encodeMs += performance.now() - start;
              return result;
            };
            const started = performance.now();
            const stop = attachGlassRim(lens, kind === "selection");
            window.stopRim = stop;
            const foreground = !["selection", "non-apple"].includes(kind);
            try {
              const property = foreground ? "--lg-foreground-rim" : "--lg-rim";
              while (!lens.style.getPropertyValue(property)) {
                if (performance.now() - started > 15000)
                  throw new Error("Rim did not become ready");
                await new Promise(requestAnimationFrame);
              }
              const readyMs = performance.now() - started;
              window.ImageData = NativeImageData;
              HTMLCanvasElement.prototype.toDataURL = encode;
              const image = new Image();
              image.src = lens.style.getPropertyValue(property).slice(5, -2);
              await image.decode();
              const canvas = document.createElement("canvas");
              canvas.width = image.width;
              canvas.height = image.height;
              const context = canvas.getContext("2d");
              context.drawImage(image, 0, 0);
              const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
              const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", pixels))]
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join("");
              let error = 0;
              if (foreground) {
                const { width, height, radius, shape } = readLens(lens);
                const expected = foregroundRimPixels(width, height, radius, shape);
                // PNG decode can round unpremultiplied RGB at translucent edges.
                // Alpha must retain its exact independently generated coverage.
                for (let i = 3; i < pixels.length; i += 4)
                  error = Math.max(error, Math.abs(pixels[i] - expected.data[i]));
              }
              return {
                encodes,
                allocations,
                bytes,
                encodeMs,
                readyMs,
                digest,
                error,
                width: canvas.width,
                height: canvas.height,
              };
            } finally {
              window.ImageData = NativeImageData;
              HTMLCanvasElement.prototype.toDataURL = encode;
            }
          },
          { modules, kind },
        );
        assert.deepEqual(errors, []);
        if (baselineCode) assert.ok(baselineLoads > 0, "Baseline module was not used");
        assert.equal(sample.error, 0);
        samples.push({ engine: engine.name(), browser: browser.version(), run, kind, ...sample });
        if (output && run === 0 && kind === "light")
          await page.screenshot({ path: resolve(output, `rim-${engine.name()}.png`) });
        await page.evaluate(() => window.stopRim());
        assert.equal(
          await page.locator("#lens").getAttribute("data-lenso-glass-foreground-rim"),
          null,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
const result = {
  platform: process.platform,
  architecture: process.arch,
  dpr: 2,
  baselineHash: baselineCode ? createHash("sha256").update(baselineCode).digest("hex") : null,
  samples,
};
console.log(JSON.stringify(result, null, 2));
if (output) await writeFile(resolve(output, "rim-results.json"), JSON.stringify(result, null, 2));
if (!baseline)
  for (const sample of samples.filter((sample) =>
    ["light", "dark", "classic"].includes(sample.kind),
  ))
    assert.equal(sample.encodes, 0, "A foreground-only rim must not synchronize canvas encoding");
