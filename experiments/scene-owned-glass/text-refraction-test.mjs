import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, webkit } from "../../apps/docs/node_modules/playwright/index.mjs";

const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/tab-bar-text/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];

async function actualTabBarSource(page) {
  await page.goto(
    `${process.env.DOCS_URL ?? "http://127.0.0.1:4311"}/en/docs/react/components/tab-bar`,
  );
  await page.locator("[data-indicator-ready][data-minimize-ready]").first().waitFor();
  return page.evaluate(async () => {
    const { fontFaceForImage } = await import("/src/lib/menu-backdrop/paint-fonts.js");
    const fonts = [];
    const collect = async (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSFontFaceRule) fonts.push(await fontFaceForImage(document, rule));
        else if (rule.cssRules) await collect(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) await collect(sheet.cssRules);
    const item = document.querySelector("[data-tab-bar-list] [data-tab-bar-destination]");
    const clone = item.cloneNode(true);
    const originals = [item, ...item.querySelectorAll("*")];
    const copies = [clone, ...clone.querySelectorAll("*")];
    for (let i = 0; i < originals.length; i++) {
      const style = getComputedStyle(originals[i]);
      for (const key of style) copies[i].style.setProperty(key, style.getPropertyValue(key));
    }
    Object.assign(clone.style, {
      position: "relative",
      top: "0",
      left: "0",
      margin: "0",
      transform: "none",
      filter: "none",
      opacity: "1",
    });
    clone.removeAttribute("href");
    return { html: clone.outerHTML, fonts: fonts.join("\n") };
  });
}

async function settle(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function difference(page, a, b, skip) {
  return page.evaluate(
    async ({ images, skip }) => {
      const pixels = [];
      for (const data of images) {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        pixels.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
      const [a, b] = pixels;
      if (a.width !== b.width || a.height !== b.height) throw Error("Unequal text bounds");
      const detail = ({ data, width, height }) => {
        let sum = 0;
        for (let y = 1; y < height - 1; y++)
          for (let x = 1; x < width - 1; x++)
            for (let c = 0; c < 3; c++) {
              const p = (y * width + x) * 4 + c;
              sum += Math.abs(data[p - 4] - 2 * data[p] + data[p + 4]);
              sum += Math.abs(data[p - width * 4] - 2 * data[p] + data[p + width * 4]);
            }
        return sum;
      };
      let maximum = 0,
        total = 0,
        changed = 0,
        ink = 0,
        inkError = 0,
        compared = 0;
      for (let i = 0; i < a.data.length; i += 4) {
        const x = (i / 4) % a.width;
        if (skip && x >= skip[0] && x < skip[1]) continue;
        compared++;
        const covered = [0, 1, 2].some(
          (c) => a.data[i + c] !== a.data[c] || b.data[i + c] !== b.data[c],
        );
        if (covered) ink++;
        for (let c = 0; c < 3; c++) {
          const delta = Math.abs(a.data[i + c] - b.data[i + c]);
          maximum = Math.max(maximum, delta);
          total += delta;
          if (delta) changed++;
          if (covered) inkError += delta;
        }
      }
      return {
        maximum,
        mean: total / (compared * 3),
        changed,
        ink,
        inkMean: inkError / Math.max(1, ink * 3),
        detailRatio: detail(b) / Math.max(1, detail(a)),
      };
    },
    { images: [a, b].map((b) => b.toString("base64")), skip },
  );
}

for (const [engine, type] of Object.entries({ webkit, chromium })) {
  if (process.env.ENGINE && process.env.ENGINE !== engine) continue;
  const browser = await type.launch({
    headless: process.env.HEADED !== "1",
    ...(engine === "chromium" ? { args: ["--use-angle=metal"] } : {}),
  });
  try {
    const sourcePage = await browser.newPage();
    const actual = await actualTabBarSource(sourcePage);
    await writeFile(new URL(`source-${engine}.json`, output), JSON.stringify(actual));
    await sourcePage.close();
    for (const dpr of [1, 2])
      for (const theme of ["light", "dark"]) {
        const page = await browser.newPage({
          viewport: { width: 1000, height: 900 },
          deviceScaleFactor: dpr,
        });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        const module = await page.request.get(
          `${base}/@fs${new URL("../../packages/glass/src/text-refraction.ts", import.meta.url).pathname}`,
        );
        assert.equal(module.status(), 200, "the local GPU text renderer must be available");
        await page.goto(`${base}/text-refraction.html?theme=${theme}`);
        await page.waitForLoadState("networkidle");
        await page.waitForFunction(() => window.textProbe?.ready);
        const samples = [];
        for (const input of ["default", "thin-cjk", "actual-tab-bar"]) {
          if (input === "thin-cjk")
            await page.evaluate(() =>
              window.textProbe.set({ text: "Il1 O0 · Minimum · 图库收藏" }),
            );
          if (input === "actual-tab-bar")
            await page.evaluate((actual) => window.textProbe.loadSource(actual), actual);
          let nativeInput;
          for (const amount of [0, 0.35, 1]) {
            await page.evaluate((amount) => window.textProbe.set({ amount }), amount);
            await settle(page);
            const svg = await page.locator("#svg-output").screenshot();
            const gpu = await page.locator("#gpu-output").screenshot();
            const delta = await difference(page, svg, gpu);
            samples.push({ input, amount, ...delta });
            if (amount === 0) {
              nativeInput = gpu;
              // One RGBA8 premultiplication plus browser composition can differ by two levels.
              // System glyphs compare directly with DOM; embedded-font rasterization is recorded separately.
              if (input !== "actual-tab-bar")
                assert.ok(
                  delta.maximum <= 2,
                  `native glyph roundtrip (${input}): ${JSON.stringify(delta)}`,
                );
              assert.ok(
                delta.detailRatio >= 0.85 && delta.detailRatio <= 1.15,
                `unwarped glyph detail is retained, without requiring identical font rasterization: ${JSON.stringify(delta)}`,
              );
              await page.locator("#gpu-output canvas").evaluate((canvas) => {
                canvas.style.filter = "blur(.5px)";
              });
              const blurred = await page.locator("#gpu-output").screenshot();
              const blurControl = await difference(page, svg, blurred);
              assert.ok(
                blurControl.detailRatio < 0.85,
                `quality gate detects blurred ${engine}/${dpr}/${theme}/${input}: ${JSON.stringify(blurControl)}`,
              );
              await page.locator("#gpu-output canvas").evaluate((canvas) => {
                canvas.style.filter = "";
              });
            } else {
              const outside = await difference(page, nativeInput, gpu, [124 * dpr, 224 * dpr]);
              assert.ok(
                outside.maximum <= 2,
                "optics must not soften or move glyphs outside the lens",
              );
            }
          }
          await page.screenshot({
            path: new URL(`${engine}-${theme}-dpr${dpr}-${input}.png`, output).pathname,
          });
        }
        await page.evaluate(() =>
          window.textProbe.set({ text: "Home · Library · Collections", amount: 1 }),
        );
        const motion = await page.evaluate(() => {
          const probe = window.textProbe;
          const canvas = document.querySelector("#gpu-output canvas");
          const gl = canvas.getContext("webgl2");
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);
          const outputs = new Set();
          let invalidPremultiplication = 0;
          for (let i = 0; i < 24; i++) {
            probe.state.position = 123.9 + i * 0.05;
            probe.draw("gpu");
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            let hash = 2166136261;
            for (let p = 0; p < pixels.length; p += 4) {
              for (let c = 0; c < 3; c++)
                if (pixels[p + c] > pixels[p + 3] + 1) invalidPremultiplication++;
              for (let c = 0; c < 4; c++) hash = Math.imul(hash ^ pixels[p + c], 16777619);
            }
            outputs.add(hash);
          }
          return { outputs: outputs.size, invalidPremultiplication };
        });
        assert.ok(motion.outputs > 12, "fractional lens movement updates actual optical pixels");
        assert.equal(
          motion.invalidPremultiplication,
          0,
          "spectral rays retain valid premultiplied ink coverage",
        );
        await page.evaluate(() => window.textProbe.set({ position: 124, amount: 1 }));
        await settle(page);
        const correctInk = await page.locator("#gpu-output").screenshot();
        const invalidControl = await page.evaluate(() => {
          window.textProbe.draw("gpu", false);
          const canvas = document.querySelector("#gpu-output canvas");
          const gl = canvas.getContext("webgl2");
          const pixels = new Uint8Array(canvas.width * canvas.height * 4);
          gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          let invalid = 0;
          for (let p = 0; p < pixels.length; p += 4)
            for (let c = 0; c < 3; c++) if (pixels[p + c] > pixels[p + 3] + 1) invalid++;
          return invalid;
        });
        await settle(page);
        const averagedInk = await page.locator("#gpu-output").screenshot();
        const inkControl = await difference(page, correctInk, averagedInk);
        assert.ok(invalidControl > 0, "naive alpha averaging violates premultiplied coverage");
        await page.evaluate(() => window.textProbe.draw());
        const row = { engine, dpr, theme, samples, motion, inkControl, invalidControl };
        results.push(row);
        console.log(JSON.stringify(row));
        assert.deepEqual(errors, [], "no browser errors");
        await page.close();
      }
    const narrow = await browser.newPage({
      viewport: { width: 390, height: 1000 },
      deviceScaleFactor: 2,
    });
    await narrow.goto(`${base}/text-refraction.html?theme=dark`);
    await narrow.waitForLoadState("networkidle");
    await narrow.waitForFunction(() => window.textProbe?.ready);
    assert.ok(
      await narrow.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "comparison fits a narrow screen",
    );
    await narrow.screenshot({ path: new URL(`${engine}-dark-narrow.png`, output).pathname });
    await narrow.evaluate(() => {
      window.lostTextContext = document
        .querySelector("#gpu-output canvas")
        .getContext("webgl2")
        .getExtension("WEBGL_lose_context");
      window.lostTextContext.loseContext();
    });
    await narrow.waitForFunction(
      () => !window.textProbe.ready && !document.querySelector("#gpu-output canvas"),
    );
    assert.ok(
      (
        await difference(
          narrow,
          await narrow.locator("#svg-output").screenshot(),
          await narrow.locator("#gpu-output").screenshot(),
        )
      ).maximum <= 1,
      "context loss shows the SVG reference, not stale GPU pixels",
    );
    await narrow.evaluate(() => window.lostTextContext.restoreContext());
    await narrow.waitForFunction(() => window.textProbe.ready);
    await narrow.close();
    const fallback = await browser.newPage();
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        return kind === "webgl2" ? null : original.call(this, kind, ...args);
      };
    });
    await fallback.goto(`${base}/text-refraction.html`);
    await fallback.waitForLoadState("networkidle");
    await fallback.waitForFunction(() =>
      document.querySelector("output")?.textContent.includes("WebGL2 unavailable"),
    );
    assert.equal(await fallback.locator("#gpu-output canvas").count(), 0);
    assert.ok(
      (
        await difference(
          fallback,
          await fallback.locator("#svg-output").screenshot(),
          await fallback.locator("#gpu-output").screenshot(),
        )
      ).maximum <= 1,
      "unsupported GPU keeps actual SVG refraction",
    );
    await fallback.close();
  } finally {
    await browser.close();
  }
}
await writeFile(new URL("quality.json", output), JSON.stringify(results, null, 2));
