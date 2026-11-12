import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort, fileHash } from "./cohort-server.ts";
import { checkRefresh } from "./refresh-control.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/refresh-control"),
);
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 820, height: 900 } }),
        errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      const network = await loadCohort(page, server);
      await page.waitForFunction(
        () => document.getElementById("refresh-sample")?.dataset.state === "idle",
      );
      try {
        const behavior = await checkRefresh(page),
          captures = [];
        for (const width of [390, 820])
          for (const theme of ["light", "dark"]) {
            await page.setViewportSize({ width, height: 900 });
            const active = await page.locator('[data-theme="dark"]').count();
            if ((theme === "dark") !== Boolean(active)) await page.getByTestId("theme").click();
            for (const phase of ["complete", "refreshing", "error"]) {
              if (phase === "complete") await page.getByTestId("refresh-complete").click();
              if (phase === "refreshing") await page.getByTestId("refresh-sample-trigger").click();
              if (phase === "error") await page.getByTestId("refresh-error").click();
              await page.waitForFunction(
                (phase) => document.getElementById("refresh-sample")?.dataset.state === phase,
                phase,
              );
              const root = page.getByTestId("refresh-sample");
              await root.scrollIntoViewIfNeeded();
              await page.mouse.move(0, 0);
              await root.evaluate(async (n) => {
                await document.fonts.ready;
                await Promise.all(
                  n
                    .getAnimations({ subtree: true })
                    .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
                    .map((a) => a.finished.catch(() => {})),
                );
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
              });
              const geometry = await root.evaluate((n) => {
                const v = n.querySelector('[data-slot="refresh-control-viewport"]'),
                  c = n.querySelector('[data-slot="refresh-control-content"]'),
                  r = n.getBoundingClientRect();
                return {
                  width: r.width,
                  height: r.height,
                  viewport: v.clientHeight,
                  scrollHeight: v.scrollHeight,
                  transform: c.style.transform,
                  busy: n.getAttribute("aria-busy"),
                  errorHidden: n.querySelector('[data-slot="refresh-control-error"]').hidden,
                };
              });
              assert.equal(geometry.height, 320);
              assert.ok(geometry.viewport < geometry.scrollHeight);
              assert.equal(geometry.transform, `translateY(${phase === "refreshing" ? 56 : 0}px)`);
              const file = path.join(artifacts, `${engine}-${width}-${theme}-${phase}.png`);
              await root.screenshot({ path: file });
              captures.push({ width, theme, phase, geometry, file, sha256: await fileHash(file) });
            }
            // Reset to a busy state so the next case can complete it deterministically.
            await page.getByTestId("refresh-sample-trigger").click();
          }
        const mobile = await browser.newContext({
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          isMobile: true,
        });
        let touch;
        try {
          const p = await mobile.newPage();
          p.on("pageerror", (e) => errors.push(String(e)));
          await loadCohort(p, server);
          await p.waitForFunction(
            () => document.getElementById("refresh-sample")?.dataset.state === "idle",
          );
          await p.getByTestId("refresh-manual").tap();
          await p.getByTestId("refresh-sample-trigger").tap();
          await p.waitForFunction(
            () => document.querySelector('[data-testid="refresh-count"]')?.textContent === "1",
          );
          await p.getByTestId("refresh-complete").tap();
          touch = { nativeTriggerTap: true };
          if (engine === "chromium") {
            const viewport = p.getByTestId("refresh-sample-viewport");
            await viewport.scrollIntoViewIfNeeded();
            await viewport.evaluate((n) => (n.scrollTop = 0));
            await p.getByTestId("refresh-sample-content").evaluate(async (n) => {
              await Promise.all(n.getAnimations().map((a) => a.finished.catch(() => {})));
            });
            const b = await viewport.boundingBox(),
              x = b.x + b.width - 25,
              y = b.y + 90;
            const cdp = await mobile.newCDPSession(p);
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchStart",
              touchPoints: [{ x, y }],
            });
            for (let i = 1; i <= 18; i++)
              await cdp.send("Input.dispatchTouchEvent", {
                type: "touchMove",
                touchPoints: [{ x, y: y + i * 9 }],
              });
            await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            await p.waitForFunction(
              () => document.querySelector('[data-testid="refresh-count"]')?.textContent === "2",
            );
            touch.continuousPull = true;
            await cdp.detach();
          }
        } finally {
          await mobile.close();
        }
        assert.deepEqual(errors, []);
        results.push({
          engine,
          version: browser.version(),
          network,
          behavior,
          captures,
          touch,
          errors,
        });
        console.log(engine, "refresh behavior, layout and native touch passed");
      } catch (e) {
        await page.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
        throw e;
      }
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify({ completedAt: new Date().toISOString(), results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
