import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch(
    name === "chromium"
      ? { channel: process.env.UI_SDK_CHROMIUM_CHANNEL ?? "chrome" }
      : process.env.UI_SDK_WEBKIT_EXECUTABLE
        ? { executablePath: process.env.UI_SDK_WEBKIT_EXECUTABLE }
        : {},
  );
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        colorScheme: theme,
        reducedMotion: "no-preference",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`);
      const trigger = page.getByRole("button", { name: "浏览文档", exact: true });
      await trigger.waitFor();
      await trigger.evaluate(
        (el) =>
          new Promise((resolve) => {
            const ready = () =>
              Object.keys(el).some((k) => k.startsWith("__reactProps"))
                ? resolve()
                : requestAnimationFrame(ready);
            ready();
          }),
      );
      for (const close of ["button", "escape-during-entry", "outside"]) {
        await trigger.click();
        const panel = page.locator('[data-lenso-slot="modal-popup"]');
        await panel.waitFor();
        await page.waitForTimeout(close === "escape-during-entry" ? 40 : 350);
        await page.evaluate(() => {
          window.__drawerFrames = [];
          const start = performance.now();
          const sample = () => {
            const e = document.querySelector('[data-lenso-slot="modal-popup"]');
            const s = e && getComputedStyle(e);
            const backdrop = document.querySelector('[data-lenso-slot="modal-backdrop"]');
            const b = backdrop && getComputedStyle(backdrop);
            window.__drawerFrames.push({
              t: performance.now() - start,
              painted: !!e && !e.hidden && s.display !== "none" && s.visibility !== "hidden",
              opacity: Number(s?.opacity ?? 0),
              backdropPainted:
                !!backdrop && !backdrop.hidden && b.display !== "none" && b.visibility !== "hidden",
              backdropOpacity: Number(b?.opacity ?? 0),
              scroll: scrollY,
            });
            if (performance.now() - start < 850) requestAnimationFrame(sample);
          };
          sample();
        });
        if (close === "button")
          await page.getByRole("button", { name: "关闭文档导航", exact: true }).click();
        else if (close === "outside") await page.mouse.click(2, 120);
        else await page.keyboard.press("Escape");
        await panel.waitFor({ state: "hidden" });
        await page.waitForTimeout(900);
        const frames = await page.evaluate(() => window.__drawerFrames);
        let vanished = false;
        for (const f of frames) {
          if (!f.painted || f.opacity < 0.005) vanished = true;
          else if (vanished)
            assert.ok(
              f.opacity < 0.05,
              `${name} ${theme} ${close}: drawer flashed after disappearing at ${f.t}ms`,
            );
        }
        assert.equal(await trigger.getAttribute("data-closed"), "");
        assert.equal(frames.at(-1).painted, false);
      }
      assert.deepEqual(errors, []);
      console.log(
        `PASS ${name} ${theme}: mobile docs drawer close, interrupted entry, outside dismissal; no painted rebound`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
