import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { loadSite } from "../../src/index.ts";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../..");
const req = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = req(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const out = path.resolve(process.argv[2] ?? path.join(root, ".cache/local-activation/dist"));
const site = await loadSite(path.join(root, ".cache/scale/300"));
const token = (route) =>
  site.documents.find((doc) => doc.path === route).markdown.match(/\b[a-f0-9]{16}\b/)[0];
const server = Bun.serve({ port: 0, fetch: (r) => staticResponse(r, out) });
const results = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [],
        scripts = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("request", (r) => {
        if (r.resourceType() === "script") scripts.push(new URL(r.url()).pathname);
      });
      await page.goto(server.url.href);
      const counter = page.getByTestId("comparison-counter");
      await counter.click();
      await counter.filter({ hasText: "Count: 1" }).waitFor();
      assert.equal(await page.evaluate(() => exact.activationPhase), "counter");
      assert.equal(
        await page.evaluate(() => exact.rootInitializations ?? 0),
        0,
        "Preloading must not execute the resource root",
      );
      await page.evaluate(() => {
        globalThis.probe = {
          state: exact.state,
          cell: exact.counterCell,
          node: exact.counterCell.n,
        };
      });
      await counter.focus();
      await page.keyboard.press("Enter");
      await counter.filter({ hasText: "Count: 2" }).waitFor();
      await page.route("**/local-main-search-*.js", async (route) => {
        await new Promise((r) => setTimeout(r, 150));
        await route.continue();
      });
      const input = page.getByRole("searchbox");
      await input.fill(token("/guide-001"));
      await input.fill(token("/guide-002"));
      const hits = page.locator('[data-docs-part="search"] a');
      await hits.filter({ hasText: "Guide 002" }).waitFor();
      assert.equal(await hits.count(), 1);
      assert.equal(await page.evaluate(() => exact.activationPhase), "local");
      assert.equal(await page.evaluate(() => exact.rootInitializations), 1);
      await counter.click();
      await counter.filter({ hasText: "Count: 3" }).waitFor();
      await page.evaluate(() => {
        probe.counter = document.querySelector('[data-testid="comparison-counter"]');
        probe.header = document.querySelector("header");
        probe.main = document.querySelector("main");
      });
      await page.evaluate(() => exact.promote());
      assert.equal(
        await page.evaluate(
          () =>
            probe.counter === document.querySelector('[data-testid="comparison-counter"]') &&
            probe.header === document.querySelector("header"),
        ),
        true,
        "Promotion must adopt SSR nodes",
      );
      assert.equal(
        await page.evaluate(
          () =>
            exact.journal.some((line) => line.includes("adopted the document")) &&
            !exact.journal.some((line) => line.includes("adoption abandoned")),
        ),
        true,
      );
      assert.equal(await page.evaluate(() => probe.main === document.querySelector("main")), true);
      await hits.first().click();
      await page.waitForURL("**/guide-002");
      await page.getByRole("heading", { name: "Guide 002", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => exact.activationPhase), "full");
      assert.equal(await counter.textContent(), "Count: 3");
      await counter.click();
      await counter.filter({ hasText: "Count: 4" }).waitFor();
      assert.equal(
        await page.evaluate(
          () =>
            probe.state === exact.state &&
            probe.cell === exact.state[0][2] &&
            probe.node === exact.state[0][2].n,
        ),
        true,
      );
      assert.equal(await page.locator('link[rel="stylesheet"]').count(), 1);
      await page
        .getByRole("navigation", { name: "Language", exact: true })
        .getByRole("link", { name: "中文", exact: true })
        .click();
      await page.waitForURL("**/zh/guide-002");
      await page
        .getByRole("navigation", { name: "Version", exact: true })
        .getByRole("link", { name: "v1", exact: true })
        .click();
      await page.waitForURL("**/zh/v1/guide-002");
      await input.fill(token("/zh/v1/guide-003"));
      await hits.filter({ hasText: "指南 003" }).waitFor();
      assert.equal(await hits.count(), 1);
      await hits.first().click();
      await page.waitForURL("**/zh/v1/guide-003");
      await page.goBack();
      await page.waitForURL("**/zh/v1/guide-002");
      assert.equal(await counter.textContent(), "Count: 4");
      assert.equal(
        await page.evaluate(
          () => probe.cell === exact.state[0][2] && exact.rootInitializations === 1,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      const failure = await browser.newPage();
      await failure.route("**/local-main-search-*.js", (r) => r.abort());
      await failure.goto(server.url.href);
      await failure.getByTestId("comparison-counter").click();
      await failure.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
      await failure.getByRole("searchbox").fill(token("/guide-001"));
      await failure.waitForFunction(() => Boolean(globalThis.exact?.activationError));
      await failure.getByTestId("comparison-counter").click();
      await failure.getByTestId("comparison-counter").filter({ hasText: "Count: 2" }).waitFor();
      await failure.close();
      const resourceFailure = await browser.newPage();
      await resourceFailure.route("**/scope-*.js", (r) => r.abort());
      await resourceFailure.goto(server.url.href);
      await resourceFailure.getByRole("searchbox").fill(token("/guide-001"));
      await resourceFailure.getByRole("alert").waitFor();
      await resourceFailure.getByTestId("comparison-counter").click();
      await resourceFailure
        .getByTestId("comparison-counter")
        .filter({ hasText: "Count: 1" })
        .waitFor();
      await resourceFailure.close();

      await page.close();
      results.push({
        browser: name,
        counter: true,
        keyboard: true,
        latestQuery: true,
        searchResource: true,
        rootIdentity: true,
        signalNodeIdentity: true,
        oneRootInitialization: true,
        promotion: true,
        localeVersion: true,
        history: true,
        failedChunkCounterSurvives: true,
      });
      console.log(
        `${name}: local counter, native resource search, same root/signal node, promotion, scope/history and failed chunk passed`,
      );
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(root, ".cache/local-activation/verification.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  server.stop(true);
}
