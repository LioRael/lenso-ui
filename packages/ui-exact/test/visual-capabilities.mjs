import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";

/** A CSS-support query cannot prove that a screenshot contains compositor effects. */
export async function checkVisualCapabilities(browser, engine) {
  const page = await browser.newPage({ viewport: { width: 240, height: 160 } });
  try {
    await page.setContent(`<style>
      html,body { margin:0; height:100%; }
      #pattern { position:fixed; inset:0; background:repeating-linear-gradient(90deg,#000 0 8px,#fff 8px 16px); }
      #lens { position:fixed; left:20px; top:20px; width:200px; height:120px; backdrop-filter:blur(15px); }
    </style><div id="pattern"></div><div id="lens"></div>`);
    const settle = () =>
      page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
    await settle();
    const blurred = await page.screenshot();
    await page.locator("#lens").evaluate((n) => (n.style.backdropFilter = "none"));
    await settle();
    const unfiltered = await page.screenshot();
    const range = (buffer) =>
      page.evaluate(async (encoded) => {
        const image = new Image();
        image.src = `data:image/png;base64,${encoded}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(
          Math.floor(image.width / 3),
          Math.floor(image.height / 2),
          Math.floor(image.width / 3),
          1,
        ).data;
        const luminance = [];
        for (let i = 0; i < pixels.length; i += 4)
          luminance.push((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
        return Math.max(...luminance) - Math.min(...luminance);
      }, buffer.toString("base64"));
    const unfilteredRange = await range(unfiltered);
    const blurredRange = await range(blurred);
    assert.ok(
      unfilteredRange > 200,
      "the screenshot probe must resolve the unfiltered black/white stripes",
    );
    const backdropBlurCaptured = blurredRange < unfilteredRange * 0.2;
    const directory = path.resolve(import.meta.dirname, "../.cache/acceptance");
    await Bun.write(path.join(directory, `${engine}-capture-blurred.png`), blurred);
    await Bun.write(path.join(directory, `${engine}-capture-unfiltered.png`), unfiltered);
    const result = {
      engine,
      version: browser.version(),
      capture: "playwright-page-screenshot",
      cssSupportsBackdropFilter: await page.evaluate(() =>
        CSS.supports("backdrop-filter", "blur(15px)"),
      ),
      unfilteredRange,
      blurredRange,
      backdropBlurCaptured,
      glassScreenshotGate: backdropBlurCaptured ? "eligible-for-rendered-review" : "not-qualified",
    };
    await Bun.write(
      path.join(directory, `${engine}-capture.json`),
      JSON.stringify(result, null, 2) + "\n",
    );
    return result;
  } finally {
    await page.close();
  }
}

if (import.meta.main) {
  const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
  const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
  const results = [];
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== name) continue;
    const browser = await engine.launch({
      channel: name === "chromium" ? process.env.CHROMIUM_CHANNEL : undefined,
    });
    try {
      const result = await checkVisualCapabilities(browser, name);
      results.push(result);
      console.log(JSON.stringify(result));
    } finally {
      await browser.close();
    }
  }
  assert.ok(results.length, "TEST_BROWSER must select chromium or webkit");
  assert.ok(
    results.every((result) => result.backdropBlurCaptured),
    "Glass screenshot acceptance is not qualified: the capture backend omits backdrop blur. Use independently verified native captures; do not treat CSS support or behavior checks as optical acceptance.",
  );
}
