import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { staticResponse } from "../../src/server.ts";
import { loadSite } from "../../src/index.ts";
const root = path.resolve(import.meta.dirname, "../..");
const req = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = req(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const site = await loadSite(path.join(root, ".cache/scale/300"));
const token = (route) =>
  site.documents.find((doc) => doc.path === route).markdown.match(/\b[a-f0-9]{16}\b/)[0];
const out = path.resolve(process.argv[2] ?? path.join(root, ".cache/local-activation/plain"));
const server = Bun.serve({ port: 0, fetch: (r) => staticResponse(r, out) });
const results = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      let documents = 0;
      const errors = [];
      page.on("request", (r) => {
        if (r.resourceType() === "document") documents++;
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(server.url.href);
      assert.equal(await page.getByTestId("comparison-counter").count(), 0);
      await page.locator('a[href="/guide-001"]').first().click();
      await page.waitForURL("**/guide-001");
      await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
      assert.equal(documents, 1);
      assert.equal(await page.evaluate(() => exact.state[0].length), 2);
      await page.evaluate(() => {
        globalThis.plainRoot = exact.state;
      });
      await page.getByRole("searchbox").fill(token("/guide-002"));
      await page.locator('[data-docs-part="search"] a').filter({ hasText: "Guide 002" }).waitFor();
      await page.locator('[data-docs-part="search"] a').first().click();
      await page.waitForURL("**/guide-002");
      await page.goBack();
      await page.waitForURL("**/guide-001");
      await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => plainRoot === exact.state && exact.rootInitializations === 1),
        true,
      );
      assert.equal(
        await page.evaluate(() => exact.journal.some((line) => line.includes("boot:"))),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({
        browser: name,
        plainFrameworkBuild: true,
        twoRootSlots: true,
        firstNavigationOneDocument: true,
        search: true,
        history: true,
        rootIdentity: true,
        noViewBoot: true,
      });
      console.log(
        `${name}: unmodified framework output without benchmark counter, search and navigation passed`,
      );
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(root, ".cache/local-activation/plain-verification.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  server.stop(true);
}
