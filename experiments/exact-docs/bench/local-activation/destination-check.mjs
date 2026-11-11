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
const out = path.resolve(
  process.argv[2] ?? path.join(root, ".cache/local-activation/destination-dist"),
);
const server = Bun.serve({ port: 0, fetch: (r) => staticResponse(r, out) });
const results = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText(value) {
              globalThis.copiedMarkdown = value;
              return Promise.resolve();
            },
          },
        });
      });
      await page.goto(server.url.href);
      await page.getByTestId("comparison-counter").click();
      await page.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
      await page.evaluate(() => {
        globalThis.destinationProbe = {
          root: exact.state,
          cell: exact.counterCell,
          node: exact.counterCell.n,
          counter: document.querySelector('[data-testid="comparison-counter"]'),
          search: document.querySelector('[data-docs-part="search"]'),
          header: document.querySelector("header"),
        };
      });
      await page.locator('a[href="/guide-001"]').first().click();
      await page.waitForURL("**/guide-001");
      await page.getByTestId("copy-markdown").click();
      await page.waitForFunction(() => Boolean(globalThis.copiedMarkdown));
      assert.equal(
        await page.evaluate(() => copiedMarkdown),
        site.documents.find((doc) => doc.path === "/guide-001").markdown,
      );
      assert.equal(await page.evaluate(() => exact.activationPhase), "destination");
      await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => exact.activationPhase), "destination");
      await page.evaluate(() => {
        destinationProbe.resources = exact.state[2].map((fn) => [fn, fn.r]);
      });
      assert.equal(
        await page.evaluate(() =>
          exact.journal.some((line) => /boot:|adopted the document/.test(line)),
        ),
        false,
        "A route must not boot/adopt the previous complete view",
      );
      assert.equal(
        await page.evaluate(
          () =>
            destinationProbe.root === exact.state &&
            destinationProbe.cell === exact.state[0][2] &&
            destinationProbe.node === exact.state[0][2].n &&
            destinationProbe.counter ===
              document.querySelector('[data-testid="comparison-counter"]') &&
            destinationProbe.search === document.querySelector('[data-docs-part="search"]') &&
            destinationProbe.header === document.querySelector("header"),
        ),
        true,
      );
      await page.evaluate(() => {
        scrollTo(0, 900);
        document.querySelector('a[href="/guide-002"]').click();
      });
      await page.waitForURL("**/guide-002");
      await page.getByRole("heading", { name: "Guide 002", exact: true }).waitFor();
      await page.goBack();
      await page.waitForURL("**/guide-001");
      await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
      await page.waitForFunction(() => Math.abs(scrollY - 900) < 2);
      await page.goForward();
      await page.waitForURL("**/guide-002");
      await page.getByRole("heading", { name: "Guide 002", exact: true }).waitFor();
      await page.getByRole("searchbox").fill(token("/guide-003"));
      await page.locator('[data-docs-part="search"] a').filter({ hasText: "Guide 003" }).waitFor();
      await page.locator('[data-docs-part="search"] a').first().click();
      await page.waitForURL("**/guide-003");
      assert.equal(await page.getByRole("searchbox").inputValue(), token("/guide-003"));
      assert.equal(await page.evaluate(() => exact.state[0][1]()), token("/guide-003"));
      await page
        .getByRole("navigation", { name: "Language", exact: true })
        .getByRole("link", { name: "中文", exact: true })
        .click();
      await page.waitForURL("**/zh/guide-003");
      assert.equal(
        await page.getByRole("searchbox").getAttribute("aria-label"),
        await page.evaluate(() => exact.state[1][0]()[5][8][3]),
      );
      await page
        .getByRole("navigation", { name: "Version", exact: true })
        .getByRole("link", { name: "v1", exact: true })
        .click();
      await page.waitForURL("**/zh/v1/guide-003");
      await page.getByRole("searchbox").fill(token("/zh/v1/guide-004"));
      await page.locator('[data-docs-part="search"] a').filter({ hasText: "指南 004" }).waitFor();
      await page.getByTestId("comparison-counter").click();
      await page.getByTestId("comparison-counter").filter({ hasText: "Count: 2" }).waitFor();
      assert.equal(await page.evaluate(() => exact.rootInitializations), 1);
      assert.equal(
        await page.evaluate(() =>
          destinationProbe.resources.every(
            ([fn, resource], i) => fn === exact.state[2][i] && resource === exact.state[2][i].r,
          ),
        ),
        true,
      );
      assert.deepEqual(errors, []);
      const coldCopy = await browser.newPage();
      await coldCopy.addInitScript(() =>
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText(value) {
              globalThis.coldCopied = value;
              return Promise.resolve();
            },
          },
        }),
      );
      await coldCopy.goto(server.url.href);
      await coldCopy.getByTestId("copy-markdown").click();
      await coldCopy.waitForFunction(() => Boolean(globalThis.coldCopied));
      assert.equal(
        await coldCopy.evaluate(() => coldCopied),
        site.documents.find((doc) => doc.path === "/").markdown,
      );
      assert.equal(await coldCopy.evaluate(() => exact.activationPhase), "local");
      await coldCopy.close();
      const raced = await browser.newPage();
      raced.on("pageerror", (e) => errors.push(String(e)));
      await raced.goto(server.url.href);
      await raced.getByTestId("comparison-counter").click();
      await raced.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
      let held;
      let releaseSeen;
      const seen = new Promise((resolve) => {
        releaseSeen = resolve;
      });
      await raced.route("**/body-5-*.js", (route) => {
        held = route;
        releaseSeen();
      });
      await raced.evaluate(() => document.querySelector('a[href="/guide-005"]').click());
      let timer;
      await Promise.race([
        seen,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(Error("Missing delayed destination request")), 10000);
        }),
      ]).finally(() => clearTimeout(timer));
      await raced.evaluate(() => document.querySelector('a[href="/guide-006"]').click());
      await raced.waitForURL("**/guide-006");
      await raced.getByRole("heading", { name: "Guide 006", exact: true }).waitFor();
      await held.continue();
      await raced.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      assert.equal(
        await raced.getByRole("heading", { name: "Guide 006", exact: true }).isVisible(),
        true,
      );
      assert.equal(
        await raced.evaluate(() =>
          exact.state[0][0]()[1][0][1].some((entry) => entry[1] === "page5"),
        ),
        false,
        "Cancelled destination must not remain in router history",
      );
      assert.equal(
        await raced.locator('link[rel="stylesheet"]').count(),
        1,
        "Concurrent navigation must share one stylesheet load",
      );
      await raced.route("**/body-8-*.js", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: "export default {invalid:true};export const docsProjection={};",
        }),
      );
      await raced.evaluate(() => document.querySelector('a[href="/guide-008"]').click());
      await raced.getByRole("alert").waitFor();
      assert.equal(new URL(raced.url()).pathname, "/guide-006");
      assert.equal(await raced.evaluate(() => exact.state[1][1]()), "/guide-006");
      await raced.evaluate(() => document.querySelector('a[href="/guide-009"]').click());
      await raced.waitForURL("**/guide-009");
      await raced.getByRole("heading", { name: "Guide 009", exact: true }).waitFor();
      assert.equal(await raced.getByRole("alert").count(), 0);
      await raced.getByTestId("comparison-counter").click();
      await raced.getByTestId("comparison-counter").filter({ hasText: "Count: 2" }).waitFor();
      await raced.close();
      assert.deepEqual(errors, []);
      results.push({
        browser: name,
        rootIdentity: true,
        persistentWidgets: true,
        noOldViewBoot: true,
        resourceSearch: true,
        localeVersion: true,
        backForward: true,
        scrollRestore: true,
        latestNavigation: true,
        cancelledRouteRollback: true,
        failedRouteRecovery: true,
        oneStylesheet: true,
        copyMarkdownWithoutFullView: true,
        coldCopyMarkdown: true,
      });
      console.log(
        `${name}: destination-only rendering, persistent root/widgets, scope, history and scroll restoration passed`,
      );
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(root, ".cache/local-activation/destination-verification.json"),
    JSON.stringify(results, null, 2),
  );
} finally {
  server.stop(true);
}
