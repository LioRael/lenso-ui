import { loadContextCohort } from "./context-menu-cohort.mjs";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/context-menu-touch"),
);
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const context = await browser.newContext({
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          isMobile: true,
        }),
        page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("context-entry")?.hasAttribute("data-lenso-ready"),
      );
      const target = page.getByTestId("context-entry"),
        menu = page.getByTestId("context-actions");
      await target.tap();
      assert.equal(
        await menu.evaluate((n) => n.matches(":popover-open")),
        false,
        "a normal tap preserves target interaction",
      );
      let nativeLongPress = false;
      if (engine === "chromium") {
        await target.scrollIntoViewIfNeeded();
        const b = await target.boundingBox(),
          x = b.x + 30,
          y = b.y + 30,
          cdp = await context.newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y, id: 1 }],
        });
        await page.waitForFunction(() =>
          document.getElementById("context-actions")?.matches(":popover-open"),
        );
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        assert.equal(
          await menu.evaluate((n) => n.matches(":popover-open")),
          true,
          "the opening touch release keeps the menu open",
        );
        await page.getByTestId("context-duplicate").tap();
        await page.waitForFunction(
          () => !document.getElementById("context-actions")?.matches(":popover-open"),
        );
        assert.equal(await page.getByTestId("context-count").textContent(), "1");
        nativeLongPress = true;
        await cdp.detach();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        nativeTap: true,
        nativeLongPress,
        errors,
      });
      console.log(engine, "native context touch checks passed");
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
