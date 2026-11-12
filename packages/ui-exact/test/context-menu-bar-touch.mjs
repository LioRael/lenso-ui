import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      path.join(import.meta.dirname, "../.cache/acceptance/context-menu-bar-touch"),
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
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(
        () =>
          document.getElementById("context-bar").getAttribute("aria-orientation") === "horizontal",
      );
      const target = page.getByTestId("context-bar-target");
      await target.tap();
      assert.equal(
        await page.getByTestId("context-bar").evaluate((n) => n.matches(":popover-open")),
        false,
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
          document.getElementById("context-bar").matches(":popover-open"),
        );
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await page.waitForFunction(() =>
          document.getElementById("context-bar").matches(":popover-open"),
        );
        await cdp.detach();
        nativeLongPress = true;
      } else {
        await target.focus();
        await page.keyboard.press("Shift+F10");
      }
      await page.getByTestId("context-bar-expand").tap();
      await page.getByTestId("context-bar-full-copy").waitFor();
      assert.equal(
        await page.getByTestId("context-bar").getAttribute("aria-orientation"),
        "vertical",
      );
      await page.getByTestId("context-bar-full-copy").tap();
      await page.waitForFunction(
        () => !document.getElementById("context-bar").matches(":popover-open"),
      );
      assert.equal(await page.getByTestId("context-bar-count").textContent(), "1");
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        nativeLongPress,
        nativeExpandTap: true,
        nativeItemTap: true,
        errors,
      });
      console.log(engine, "compact native touch expansion passed");
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
