import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      "packages/ui-exact/.cache/acceptance/glass-toggle-initial",
  );
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      let release,
        blocked = 0;
      const gate = new Promise((r) => (release = r));
      await page.route("**/modules/index.js", async (route) => {
        blocked++;
        await gate;
        await route.continue();
      });
      try {
        const response = page.waitForResponse(
          (r) => r.url() === new URL("app.js", server.url).href,
        );
        await page.goto(server.url, { waitUntil: "domcontentloaded" });
        const bytes = await (await response).body(),
          appSHA256 = createHash("sha256").update(bytes).digest("hex");
        assert.equal(appSHA256, await fileHash(path.join(server.dist, "app.js")));
        const save = page.getByTestId("glass-toggle-save"),
          bold = page.getByTestId("glass-toggle-bold"),
          icon = page.getByTestId("glass-toggle-icon");
        await bold.waitFor({ state: "attached" });
        await page.waitForFunction(
          () => document.getElementById("glass-toggle-icon")?.getBoundingClientRect().height === 34,
        );
        assert.ok(blocked > 0);
        assert.equal(await save.getAttribute("data-lenso-ready"), null);
        assert.equal(await save.getAttribute("aria-pressed"), "false");
        assert.equal(await bold.getAttribute("aria-pressed"), "true");
        assert.equal((await icon.boundingBox()).width, 34);
        const selected = await bold.evaluate((n) => ({
          background: getComputedStyle(n).backgroundColor,
          color: getComputedStyle(n).color,
          height: n.getBoundingClientRect().height,
        }));
        assert.equal(selected.height, 34);
        assert.notEqual(selected.background, "rgba(0, 0, 0, 0)");
        assert.notEqual(
          selected.background,
          await save.evaluate((n) => getComputedStyle(n).backgroundColor),
        );
        const file = path.join(artifacts, `${engine}-initial.png`);
        await page.locator("#glass-toggle-examples").screenshot({ path: file });
        release();
        await page.unrouteAll({ behavior: "wait" });
        await page.waitForFunction(() =>
          document.getElementById("glass-toggle-save")?.hasAttribute("data-lenso-ready"),
        );
        await save.click();
        assert.equal(await save.getAttribute("aria-pressed"), "true");
        results.push({
          engine,
          version: browser.version(),
          appSHA256,
          blocked,
          selected,
          file,
          sha256: await fileHash(file),
        });
        console.log(engine, "blocked-module initial styles and initialized activation passed");
      } finally {
        release();
        await page.unrouteAll({ behavior: "wait" });
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
await Bun.write(
  path.join(artifacts, "acceptance.json"),
  JSON.stringify({ dist: server.dist, results }, null, 2) + "\n",
);
