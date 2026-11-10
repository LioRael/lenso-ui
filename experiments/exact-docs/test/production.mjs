import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { main } from "../src/cli.ts";
import { buildSite } from "../src/index.ts";
import { staticResponse } from "../src/server.ts";

// Existing agent-clock coverage cannot exercise Exact's production bundle.
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const parent = await mkdtemp(path.join(tmpdir(), "exact-docs-production-"));
const root = path.join(parent, "docs");
let server;
try {
  await main(["new", root]);
  // Grouped text runs need duplicate-key and inline-markup coverage after activation.
  const authoring = Bun.file(path.join(root, "authoring.md"));
  await Bun.write(
    authoring,
    (await authoring.text()) +
      '\n\nFirst compact paragraph.\n\nRepeated compact paragraph.\n\nThird compact paragraph.\n\nRepeated compact paragraph.\n\nLast compact paragraph.\n\n**Rich boundary.**\n\nLiteral "quoted" ${value}.\n\nFinal plain paragraph.\n',
  );
  const { out } = await buildSite(root);
  assert.equal(await Bun.file(path.join(out, "agent.js")).exists(), false);
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request) => staticResponse(request, out),
  });
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [],
        requests = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (request) => requests.push(new URL(request.url()).pathname));
      // A nested direct route also exercises base-URL resolution of every hint.
      await page.goto(new URL("/authoring", server.url).href);
      await page.waitForFunction(() => document.querySelector('script[src="/_docs/metadata.js"]'));
      assert.equal(requests.includes("/app.js"), false);
      const repeated = page
        .locator('[data-docs-part="paragraph"]')
        .filter({ hasText: /^Repeated compact paragraph\.$/ });
      assert.equal(await repeated.count(), 2);
      const search = page.getByRole("searchbox", { name: "Search documentation" });
      const warmed = Promise.all([
        page.waitForResponse((response) => new URL(response.url()).pathname === "/app.js"),
        page.waitForResponse((response) => new URL(response.url()).pathname === "/style.css"),
        page.waitForResponse((response) => /\/input-glue-[\w-]+\.js$/.test(response.url())),
      ]);
      await search.hover();
      await warmed;
      assert.equal(await page.evaluate(() => Boolean(globalThis.exact?.state)), false);
      assert.equal(
        requests.some((request) => /\/scope-/.test(request)),
        false,
      );
      await search.focus();
      await search.fill("root data");
      await page
        .locator('[data-docs-part="search"]')
        .getByRole("link", { name: "Root data" })
        .waitFor();
      assert.equal(requests.filter((request) => request === "/app.js").length, 1);
      assert.equal(requests.filter((request) => request === "/style.css").length, 1);
      assert.equal(new Set(requests.filter((request) => /\/scope-/.test(request))).size, 1);
      assert.equal(await repeated.count(), 2);
      await page.getByText('Literal "quoted" ${value}.', { exact: true }).waitFor();
      const navigation = page.getByRole("navigation", { name: "Documentation", exact: true });
      await navigation.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-save").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      await navigation.getByRole("link", { name: "Introduction", exact: true }).click();
      await navigation.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      // A fresh page must also activate from a button without a preceding search.
      const control = await browser.newPage();
      control.on("pageerror", (error) => errors.push(String(error)));
      const controlRequests = [];
      control.on("request", (request) => controlRequests.push(request.url()));
      await control.goto(new URL("/playground", server.url).href);
      const counter = control.getByRole("button", { name: "Count: 0", exact: true });
      await counter.focus();
      assert.equal(await control.evaluate(() => Boolean(globalThis.exact?.state)), false);
      await counter.press("Enter");
      await control.getByRole("button", { name: "Count: 1", exact: true }).waitFor();
      assert.equal(
        controlRequests.some((url) => /\/scope-/.test(url)),
        false,
      );
      await control.close();
      assert.deepEqual(errors, []);
      console.log(
        `${name}: production hints fetch once without activation, nested search and root state pass`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  if (server) await server.stop(true);
  await rm(parent, { recursive: true, force: true });
}
