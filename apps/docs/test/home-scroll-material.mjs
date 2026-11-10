import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const colorScheme of ["light", "dark"]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({
          viewport: { width, height: 800 },
          colorScheme,
          deviceScaleFactor: 2,
        });
        await page.goto(`${base}/cn`);
        const brand = page.locator("header a[data-slot=glass]");
        await page.locator('[data-home-showcase] [role="tablist"][data-ready]').waitFor();
        const state = () =>
          brand.evaluate((e) => {
            const id = e.getAttribute("data-material-paints");
            const paint = id && document.querySelector(`[data-material-local-paints="${id}"]`);
            const box = e.getBoundingClientRect();
            return {
              copy: e.hasAttribute("data-copy"),
              id,
              visible: !!paint && getComputedStyle(paint).display !== "none",
              layers: paint
                ? [...paint.children].map((layer) => {
                    const rect = layer.getBoundingClientRect();
                    return {
                      background: getComputedStyle(layer).backgroundColor,
                      error: Math.max(
                        Math.abs(rect.x - box.x),
                        Math.abs(rect.y - box.y),
                        Math.abs(rect.width - box.width),
                        Math.abs(rect.height - box.height),
                      ),
                    };
                  })
                : [],
            };
          });
        for (let cycle = 0; cycle < 2; cycle++) {
          await page.evaluate(() => scrollTo(0, 0));
          if (name === "webkit")
            await page.waitForFunction(() =>
              document.querySelector("header a[data-slot=glass]")?.hasAttribute("data-copy"),
            );
          await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
          await page.waitForTimeout(600);
          const below = await state();
          if (name === "webkit") {
            assert.equal(below.copy, false, "offscreen photo must retire its copy");
            assert.equal(below.visible, true, "live-page material must take over");
            assert.ok(
              below.layers.every((layer) => layer.error < 1.5),
              "backing must follow the lens",
            );
            assert.ok(
              below.layers.some(
                (layer) => !["transparent", "rgba(0, 0, 0, 0)"].includes(layer.background),
              ),
              "native filter alone must not replace the material backing",
            );
            if (cycle === 0) {
              const before = (await brand.screenshot()).toString("base64");
              const hidden = await page.addStyleTag({
                content: `[data-material-local-paints="${below.id}"] > * {visibility:hidden!important}`,
              });
              const after = (await brand.screenshot()).toString("base64");
              await hidden.evaluate((node) => node.remove());
              const changed = await page.evaluate(
                async ([before, after]) => {
                  const samples = await Promise.all(
                    [before, after].map(async (png) => {
                      const image = new Image();
                      image.src = `data:image/png;base64,${png}`;
                      await image.decode();
                      const canvas = document.createElement("canvas");
                      canvas.width = image.width;
                      canvas.height = image.height;
                      const ctx = canvas.getContext("2d");
                      ctx.drawImage(image, 0, 0);
                      return ctx.getImageData(0, 0, image.width, image.height).data;
                    }),
                  );
                  let changed = 0;
                  for (let i = 0; i < samples[0].length; i += 4)
                    if ([0, 1, 2].some((c) => Math.abs(samples[0][i + c] - samples[1][i + c]) > 3))
                      changed++;
                  return changed;
                },
                [before, after],
              );
              assert.ok(changed > 100, `backing did not visibly paint: ${changed} pixels changed`);
            }
          }
        }
        await page.evaluate(() => scrollTo(0, 0));
        if (name === "webkit")
          await page.waitForFunction(() => {
            const e = document.querySelector("header a[data-slot=glass]");
            return e?.hasAttribute("data-copy") && !e.hasAttribute("data-material-paints");
          });
        console.log(`${name} ${colorScheme} ${width}px: scroll handoff and return passed`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
