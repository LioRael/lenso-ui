import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort } from "./cohort-server.ts";
import { checkTabBar, checkTabBarTouch } from "./tab-bar.mjs";
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      path.join(import.meta.dirname, "../.cache/acceptance/tab-bar"),
  );
process.env.LENSO_EXACT_TEST_ARTIFACTS = artifacts;
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
      await page.waitForFunction(() =>
        document.getElementById("app-navigation-main")?.hasAttribute("data-indicator-ready"),
      );
      try {
        const behavior = await checkTabBar(page, engine),
          touch = await checkTabBarTouch(browser, server.url, engine);
        assert.deepEqual(errors, []);
        results.push({ engine, network, behavior, touch, errors });
        console.log(engine, "tab bar navigation, motion endpoints and native gestures passed");
      } catch (error) {
        await page.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
        await Bun.write(
          path.join(artifacts, `${engine}-failure.json`),
          JSON.stringify({ error: String(error), network, errors }, null, 2),
        );
        throw error;
      }
      await page.close();
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify({ results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
