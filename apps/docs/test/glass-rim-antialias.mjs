import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.RIM_OUTPUT;
if (out) await mkdir(out, { recursive: true });
for (const [name, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const dpr of [1, 2]) {
      const page = await browser.newPage({
        viewport: { width: 800, height: 500 },
        deviceScaleFactor: dpr,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/glass-tinted-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host, "light", 1, 32);
      });
      await page.waitForFunction(
        () =>
          document.querySelectorAll(
            "[data-tinted-case] [data-lenso-glass-foreground-rim],[data-tinted-case][data-lenso-glass-foreground-rim]",
          ).length === 3,
      );
      const samples = await page.locator("[data-tinted-case]").evaluateAll(async (es) =>
        Promise.all(
          es.map(async (e, i) => {
            const lens = e.matches("[data-lenso-glass-foreground-rim]")
              ? e
              : e.querySelector("[data-lenso-glass-foreground-rim]");
            const css = getComputedStyle(lens, i === 0 ? "::before" : "::after");
            const src = lens.style.getPropertyValue("--lg-foreground-rim").slice(5, -2);
            const image = new Image();
            image.src = src;
            await image.decode();
            const c = document.createElement("canvas");
            c.width = image.width;
            c.height = image.height;
            const ctx = c.getContext("2d");
            ctx.drawImage(image, 0, 0);
            return {
              width: image.width,
              height: image.height,
              pixel: [...ctx.getImageData(11, 11, 1, 1).data],
              opacity: css.opacity,
              display: css.display,
            };
          }),
        ),
      );
      for (const s of samples) {
        assert.equal(s.width, 68);
        assert.equal(s.height, 68);
        assert.ok(Math.abs(s.pixel[3] - 63.005) < 3, JSON.stringify(s));
        assert.ok(Math.abs((s.pixel[0] * s.pixel[3]) / 255 - 31.338) < 3);
        assert.equal(s.opacity, "1");
        assert.notEqual(s.display, "none");
      }
      assert.deepEqual(errors, []);
      if (out) {
        await writeFile(`${out}/${name}-${dpr}.json`, JSON.stringify(samples, null, 2));
        await page.screenshot({ path: `${out}/${name}-${dpr}.png` });
      }
      console.log(
        "PASS",
        name,
        "DPR",
        dpr,
        "delivered area coverage and visible foreground",
        samples.map((s) => s.pixel),
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
