import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../..");
const out = path.resolve(
  process.argv[2] ?? path.join(root, ".cache/local-activation/navigation-final"),
);
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const server = Bun.serve({ port: 0, fetch: (request) => staticResponse(request, out) });
const results = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [],
        requests = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (request) =>
        requests.push({ url: request.url(), type: request.resourceType() }),
      );
      let release;
      const ownerGate = new Promise((resolve) => {
        release = resolve;
      });
      await page.route("**/local-main-search-*.js", async (route) => {
        await ownerGate;
        await route.continue();
      });
      await page.goto(server.url.href);
      assert.equal(
        requests.some((request) => /\/body-1-/.test(request.url)),
        false,
        "Reading must not preload the destination body",
      );
      const body = page.waitForRequest((request) => /\/body-1-/.test(request.url()), {
        timeout: 5000,
      });
      await page.locator('a[href="/guide-001"]').first().click();
      try {
        await body;
        await page.waitForFunction(() => exact.state);
        assert.equal(
          await page.evaluate(() => exact.rootInitializations ?? 0),
          0,
          "Target loading must not depend on owner initialization",
        );
        await page.evaluate(() => {
          globalThis.navigationOriginalRoot = exact.state;
          globalThis.navigationOriginalCounter = exact.counterCell;
        });
        await page.getByTestId("comparison-counter").click();
        assert.equal(await page.getByTestId("comparison-counter").textContent(), "Count: 1");
      } finally {
        release();
      }
      await page.waitForURL("**/guide-001");
      await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(
          () =>
            exact.state === navigationOriginalRoot &&
            exact.counterCell === navigationOriginalCounter &&
            exact.state[2][1]()[0] === "/guide-001" &&
            exact.rootInitializations === 1,
        ),
        true,
      );
      assert.equal(await page.getByTestId("comparison-counter").textContent(), "Count: 1");
      assert.equal(
        requests.filter((request) => /\/body-1-/.test(request.url)).length,
        1,
        "Speculation, resource and projection must share a module request",
      );
      assert.equal(requests.filter((request) => request.type === "document").length, 1);
      assert.equal(
        requests.some((request) => /\/scope-\d+-|local-view-/.test(request.url)),
        false,
      );
      assert.deepEqual(errors, []);
      await page.close();
      const failure = await browser.newPage();
      const failures = [];
      failure.on("pageerror", (error) => failures.push(String(error)));
      await failure.route("**/body-1-*.js", (route) =>
        route.fulfill({ status: 503, body: "Unavailable" }),
      );
      let releaseFailure;
      const failureGate = new Promise((resolve) => {
        releaseFailure = resolve;
      });
      await failure.route("**/local-main-search-*.js", async (route) => {
        await failureGate;
        await route.continue();
      });
      await failure.goto(server.url.href);
      const refusedBody = failure.waitForResponse((response) => /\/body-1-/.test(response.url()));
      try {
        await failure.locator('a[href="/guide-001"]').first().click();
        await refusedBody;
      } finally {
        releaseFailure();
      }
      await failure.locator('[data-docs-part="navigation-error"]').waitFor();
      assert.equal(new URL(failure.url()).pathname, "/");
      assert.equal(
        await failure.getByRole("heading", { name: "Guide 000", exact: true }).count(),
        1,
      );
      await failure.getByTestId("comparison-counter").click();
      await failure.locator('a[href="/guide-002"]').first().click();
      await failure.waitForURL("**/guide-002");
      await failure.getByRole("heading", { name: "Guide 002", exact: true }).waitFor();
      assert.equal(await failure.getByTestId("comparison-counter").textContent(), "Count: 1");
      assert.deepEqual(failures, []);
      const hot = await browser.newPage();
      hot.on("pageerror", (error) => failures.push(String(error)));
      await hot.goto(server.url.href);
      await hot.waitForLoadState("networkidle");
      await hot.locator('a[href="/guide-002"]').first().click();
      await hot.waitForURL("**/guide-002");
      assert.equal(
        await hot.evaluate(() => exact.navigationPreparation),
        "owner-ready",
        "Completed owner downloads must use the direct native path",
      );
      assert.equal(await hot.evaluate(() => exact.rootInitializations), 1);
      assert.deepEqual(failures, []);
      results.push({
        browser: name,
        loadBeforeOwner: true,
        oneBodyRequest: true,
        oneDocument: true,
        sharedRootCounterResource: true,
        noSearchOrFullView: true,
        speculativeFailureRecovery: true,
        readyOwnerDirectPath: true,
      });
      console.log(
        `${name}: target loading before held owner, native state/resource identity and speculative failure recovery passed`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop(true);
}
await Bun.write(
  path.join(root, ".cache/local-activation/navigation-start-verification.json"),
  JSON.stringify(results, null, 2) + "\n",
);
