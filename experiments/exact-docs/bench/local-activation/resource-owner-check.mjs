import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../..");
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const { default: validBody } = await import(
  new URL(
    "../../.cache/local-activation/partition-dist/.gen/typescript/docs-content/body-1.ts",
    import.meta.url,
  )
);
const out = path.resolve(
  process.argv[2] ?? path.join(root, ".cache/local-activation/partition-dist"),
);
const server = Bun.serve({ port: 0, fetch: (r) => staticResponse(r, out) });
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(server.url.href);
      await page.getByRole("searchbox").fill("owner-initial");
      await page.waitForFunction(() => Boolean(exact.resourceProbe));
      assert.equal(
        await page.evaluate(() => {
          const { commit, W } = exact.resourceProbe;
          const query = exact.state[0][1],
            count = exact.state[0][2],
            before = query(),
            n = count();
          const ok = commit(() => {
            W(count, 41);
            W(query, 123);
          });
          return ok === false && query() === before && count() === n;
        }),
        true,
        "Native transaction must roll back earlier writes",
      );
      await page.evaluate(() => {
        const { data } = exact.resourceProbe;
        globalThis.ownerPending = {};
        const original = data.answer;
        globalThis.restoreOwner = () => {
          data.answer = original;
        };
        data.answer = (name, args, ...rest) =>
          name === "docsSearchPages" && args[0].startsWith("owner-")
            ? {
                promise: new Promise((resolve) => {
                  ownerPending[args[0]] = resolve;
                }),
              }
            : original(name, args, ...rest);
      });
      await page.getByRole("searchbox").fill("owner-older");
      await page.waitForFunction(() => Boolean(ownerPending["owner-older"]));
      await page.getByRole("searchbox").fill("owner-newer");
      await page.waitForFunction(() => Boolean(ownerPending["owner-newer"]));
      await page.evaluate(() => ownerPending["owner-newer"]([[["Latest", "/guide-004"]]]));
      await page.locator('[data-docs-part="search"] a').filter({ hasText: "Latest" }).waitFor();
      await page.evaluate(() => ownerPending["owner-older"]([[["Stale", "/guide-005"]]]));
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      assert.deepEqual(await page.locator('[data-docs-part="search"] a').allTextContents(), [
        "Latest",
      ]);
      await page.getByRole("searchbox").fill("owner-malformed");
      await page.waitForFunction(() => Boolean(ownerPending["owner-malformed"]));
      await page.evaluate(() => ownerPending["owner-malformed"]([123]));
      await page.getByRole("alert").waitFor();
      await page.evaluate(() => restoreOwner());
      await page.getByRole("searchbox").fill("acceptance-target-000");
      await page.locator('[data-docs-part="search"] a').filter({ hasText: "Guide 000" }).waitFor();
      await page.getByTestId("comparison-counter").click();
      await page.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
      await page.route("**/body-1-*.js", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: "export default " + JSON.stringify({ ...validBody, undeclaredOwnerField: true }),
        }),
      );
      await page.evaluate(() => exact.promote());
      await page.locator('a[href="/guide-001"]').first().click();
      await page.waitForFunction(() => Boolean(exact.state[2][1].f()));
      await page.getByTestId("comparison-counter").click();
      await page.getByTestId("comparison-counter").filter({ hasText: "Count: 2" }).waitFor();
      assert.deepEqual(errors, []);
      console.log(
        `${name}: native rollback, obsolete reply suppression, malformed resource reply, recovery and shared counter passed`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop(true);
}
