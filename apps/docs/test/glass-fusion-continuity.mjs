import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const appearance of ["light", "dark", "clear", "uniform"]) {
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
      if (appearance === "dark")
        await page.getByRole("button", { name: "深色外观", exact: true }).click();
      if (appearance === "clear") {
        const tint = page.getByRole("slider", { name: "玻璃浓度", exact: true });
        await tint.focus();
        await tint.press("Home");
      }
      if (appearance === "uniform") {
        await page.locator("img[data-lenso-backdrop]").evaluate(async (image) => {
          image.src =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="gray"/></svg>';
          await image.decode();
        });
      }
      await page.waitForTimeout(1000);
      const fixed = page.getByRole("button", { name: "拖动调整按钮", exact: true });
      const box = await fixed.boundingBox();
      const clip = { x: box.x + 18, y: box.y + 18, width: box.width - 36, height: box.height - 36 };
      const before = await page.screenshot({ clip });
      // Hold optical inputs after the current lens is warm: the changing outline must
      // not relocate the preceding image under another, stationary control.
      await page.evaluate(() => {
        const decode = Image.prototype.decode;
        window.releaseOptics = [];
        window.holdOptics = true;
        Image.prototype.decode = function () {
          return decode
            .call(this)
            .then(() =>
              window.holdOptics && this.src.startsWith("data:image/png")
                ? new Promise((resolve) => window.releaseOptics.push(resolve))
                : undefined,
            );
        };
      });
      const moving = page.getByRole("button", { name: "拖动添加按钮", exact: true });
      const initial = await moving.boundingBox();
      await moving.focus();
      for (let i = 0; i < (appearance === "uniform" ? 2 : 6); i++)
        await moving.press(appearance === "uniform" ? "ArrowDown" : "ArrowUp");
      await page.waitForTimeout(80);
      const during = await page.screenshot({ clip });
      const moved = await moving.boundingBox();
      assert.ok(
        appearance === "uniform" ? moved.y >= initial.y + 22 : moved.y <= initial.y - 70,
        `${name}: the live control did not move`,
      );
      const exposed = { x: moved.x + 24, y: moved.y + moved.height - 20, width: 24, height: 36 };
      const exposedDuring =
        appearance === "uniform" ? await page.screenshot({ clip: exposed }) : undefined;
      assert.ok(await page.locator("[data-lenso-glass-fusion]").isVisible());
      await page.evaluate(() => {
        window.holdOptics = false;
        for (const release of window.releaseOptics) release();
      });
      await page.waitForTimeout(800);
      const after = await page.screenshot({ clip });
      const exposedAfter =
        appearance === "uniform" ? await page.screenshot({ clip: exposed }) : undefined;
      const compare = async (snapshot, baseline = before) =>
        page.evaluate(
          async ({ first, second }) => {
            const pixels = async (encoded) => {
              const raw = Uint8Array.from(atob(encoded), (value) => value.charCodeAt(0));
              const bitmap = await createImageBitmap(new Blob([raw], { type: "image/png" }));
              const canvas = document.createElement("canvas");
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const context = canvas.getContext("2d");
              context.drawImage(bitmap, 0, 0);
              return context.getImageData(0, 0, canvas.width, canvas.height).data;
            };
            const a = await pixels(first),
              b = await pixels(second);
            let difference = 0,
              channels = 0;
            for (let i = 0; i < a.length; i++)
              if (i % 4 !== 3) {
                difference += Math.abs(a[i] - b[i]);
                channels++;
              }
            return difference / channels;
          },
          { first: baseline.toString("base64"), second: snapshot.toString("base64") },
        );
      const pending = await compare(during),
        settled = await compare(after);
      console.log(
        `${name} ${appearance}: stationary face difference pending=${pending.toFixed(3)}, settled=${settled.toFixed(3)}`,
      );
      assert.ok(
        pending < 1,
        `${name}: unrelated face changed while the next optical inputs were pending (${pending})`,
      );
      assert.ok(
        settled < 1,
        `${name}: unrelated face changed after the new optical inputs committed (${settled})`,
      );
      if (exposedDuring) {
        // Uniform source pixels isolate a stale shade from legitimate refraction.
        const difference = await compare(exposedAfter, exposedDuring);
        console.log(`${name}: newly exposed face difference=${difference.toFixed(3)}`);
        assert.ok(
          difference < 8,
          `${name}: stale optics flashed outside their preceding silhouette (${difference})`,
        );
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
