import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/en/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
    const result = await page.evaluate(async () => {
      const { paintMask } = await import("/src/lib/menu-backdrop/paint-mask.js");
      const element = document.createElement("div");
      element.style.cssText =
        "position:fixed;width:64px;height:128px;mask-image:linear-gradient(transparent,white 16px,white calc(100% - 16px),transparent)";
      document.body.append(element);
      const style = getComputedStyle(element);
      const meta = {
        size: style.maskSize,
        position: style.maskPosition,
        repeat: style.maskRepeat,
        composite: style.maskComposite,
      };
      const samples = [];
      for (const density of [1, 2]) {
        const href = paintMask(document, style, 64, 128, density);
        if (!href) return { meta, missing: true };
        const img = new Image();
        img.src = href;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        for (const y of [0, 4, 8, 15, 16, 64, 111, 119, 123, 127]) {
          const row = y * density;
          const actual = ctx.getImageData(32 * density, row, 1, 1).data[3];
          const at = (row + 0.5) / density;
          const expected = Math.round(Math.max(0, Math.min(1, at / 16, (128 - at) / 16)) * 255);
          samples.push({ density, y, actual, expected });
        }
      }
      element.remove();
      return { meta, samples };
    });
    assert.ok(!result.missing, JSON.stringify(result));
    for (const s of result.samples)
      assert.ok(Math.abs(s.actual - s.expected) <= 1, JSON.stringify(s));
    console.log(
      `PASS ${name}: default-size repeating scroll masks preserve 20 alpha samples`,
      JSON.stringify(result.meta),
    );
  } finally {
    await browser.close();
  }
}
