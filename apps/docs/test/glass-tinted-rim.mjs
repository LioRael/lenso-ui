import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
// A matching center can conceal missing foreground depth under the tinted wash.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const mode of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async (mode) => {
        const { mount } = await import("/test/glass-tinted-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host, mode, 1);
      }, mode);
      await page.waitForFunction(
        () =>
          document.querySelectorAll(
            "[data-tinted-case] [data-lenso-glass-foreground-rim], [data-tinted-case][data-lenso-glass-foreground-rim]",
          ).length === 3,
      );
      await page.waitForTimeout(300);
      const boxes = await page
        .locator("[data-tinted-case]")
        .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().toJSON()));
      const png = await page.screenshot();
      const depths = await page.evaluate(
        async ({ encoded, boxes }) => {
          const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
          const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(bitmap, 0, 0);
          const mean = (x, y) => {
            const d = ctx.getImageData(Math.round(x) - 2, Math.round(y) - 2, 4, 4).data;
            let n = 0;
            for (let i = 0; i < d.length; i += 4) n += d[i];
            return n / 16;
          };
          return boxes.map((b) => mean(b.x + 60, b.y + 60) - mean(b.x + 9, b.y + 60));
        },
        { encoded: png.toString("base64"), boxes },
      );
      for (const depth of depths)
        assert.ok(
          depth >= (mode === "light" ? 3 : 0.4),
          `${name} ${mode}: tinted rim lost depth (${depth})`,
        );
      await page.emulateMedia({ forcedColors: "active" });
      await page.waitForFunction(
        () => document.querySelectorAll("[data-lenso-glass-foreground-rim]").length === 0,
      );
      await page.emulateMedia({ forcedColors: "none" });
      await page.waitForFunction(
        () => document.querySelectorAll("[data-lenso-glass-foreground-rim]").length === 3,
      );
      assert.deepEqual(errors, []);
      console.log(
        "PASS",
        name,
        mode,
        "Glass/button/panel tinted depth and forced-colors restore",
        depths,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
