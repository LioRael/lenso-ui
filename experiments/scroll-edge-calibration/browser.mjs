import { chromium, webkit } from "../../apps/docs/node_modules/playwright/index.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve(process.argv[2] ?? "output/scroll-edge-calibration");
await mkdir(output, { recursive: true });
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 430, height: 782 },
      deviceScaleFactor: 3,
    });
    for (const dark of [0, 1]) {
      for (const y of [0, 128, 384]) {
        for (const mode of ["baseline", "variance", "calibrated", "refined"]) {
          const url = pathToFileURL(resolve("experiments/scroll-edge-calibration/web.html"));
          url.search = new URLSearchParams({
            mode,
            trial: mode === "refined" ? "current" : "previous",
            dark: String(dark),
            y: String(y),
          }).toString();
          await page.goto(url.href);
          await page.locator("img").evaluate((image) => image.decode());
          await page.evaluate(() => new Promise(requestAnimationFrame));
          await page.screenshot({ path: `${output}/${name}-${mode}-${dark}-${y}.png` });
        }
      }
    }
    console.log(`${name}: captured 24 matching recipe states`);
  } finally {
    await browser.close();
  }
}
