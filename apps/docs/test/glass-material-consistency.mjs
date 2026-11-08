import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// A flat backdrop distinguishes an untinted neck from legitimate source/refraction
// differences. DOM geometry tests cannot verify ownership of the visible wash.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/cn/glass-lab`);
      await page.waitForFunction(
        () => document.querySelector("[data-lenso-glass-fusion]")?.hidden === false,
      );
      // Exercise the delivered worker entry, rather than silently accepting a
      // broken worker URL through the otherwise correct synchronous fallback.
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-lenso-glass-fusion]")
            ?.getAttribute("data-lenso-fusion-compute") === "worker",
      );
      if (theme === "dark")
        await page.getByRole("button", { name: "深色外观", exact: true }).click();
      await page.locator("img[data-lenso-backdrop]").evaluate(async (image) => {
        image.src =
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="gray"/></svg>';
        await image.decode();
      });
      await page.waitForTimeout(800);
      const first = await page
        .getByRole("button", { name: "拖动添加按钮", exact: true })
        .boundingBox();
      const second = await page
        .getByRole("button", { name: "拖动收藏按钮", exact: true })
        .boundingBox();
      const slider = page.getByRole("slider", { name: "玻璃浓度", exact: true });
      for (const opacity of [1, 0.5]) {
        await page
          .getByRole("button", { name: "拖动添加按钮", exact: true })
          .evaluate(
            (e, opacity) =>
              e
                .closest("[data-theme]")
                .style.setProperty("--lenso-glass-transparency", String(opacity)),
            opacity,
          );
        for (const tint of [1, 0.75, 0, 1]) {
          await slider.focus();
          if (tint === 0) await slider.press("Home");
          else {
            await slider.press("End");
            if (tint === 0.75) for (let i = 0; i < 25; i++) await slider.press("ArrowLeft");
          }
          assert.ok(Math.abs(Number(await slider.getAttribute("aria-valuenow")) - tint) < 0.001);
          await page.waitForTimeout(500);
          const png = await page.screenshot();
          const pixels = await page.evaluate(
            async ({ encoded, first, second }) => {
              const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
              const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
              const canvas = document.createElement("canvas");
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(bitmap, 0, 0);
              const at = (x, y) =>
                [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3);
              return {
                body: at(first.x + first.width - 12, first.y + first.height / 2 + 8),
                neck: at((first.x + first.width + second.x) / 2, first.y + first.height / 2 + 8),
              };
            },
            { encoded: png.toString("base64"), first, second },
          );
          const difference = Math.max(...pixels.body.map((n, i) => Math.abs(n - pixels.neck[i])));
          console.log(
            `${name} ${theme} opacity=${opacity} tint=${tint}: body=${pixels.body}, neck=${pixels.neck}, difference=${difference}`,
          );
          assert.ok(
            difference <= 3,
            `${name}: the fused neck uses a different material from the members`,
          );
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
