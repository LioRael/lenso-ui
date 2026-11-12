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
let server, renderServer, appGate, inputGate;
try {
  await main(["new", root]);
  // Grouped text runs need duplicate-key and inline-markup coverage after activation.
  const authoring = Bun.file(path.join(root, "authoring.md"));
  await Bun.write(
    authoring,
    (await authoring.text()) +
      '\n\nFirst compact paragraph.\n\nRepeated compact paragraph.\n\nThird compact paragraph.\n\nRepeated compact paragraph.\n\nLast compact paragraph.\n\n**Rich boundary.**\n\nLiteral "quoted" ${value}.\n\nFinal plain paragraph.\n',
  );
  const configFile = Bun.file(path.join(root, "docs.json"));
  const config = { ...(await configFile.json()), theme: "headless" };
  await Bun.write(configFile, JSON.stringify({ ...config, preload: "intent" }));
  const { out } = await buildSite(root);
  await Bun.write(configFile, JSON.stringify(config));
  const { out: renderOut } = await buildSite(root, {
    out: path.join(path.dirname(out), "render-out"),
  });
  renderServer = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request) => staticResponse(request, renderOut),
  });
  assert.equal(await Bun.file(path.join(out, "agent.js")).exists(), false);
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      if (appGate && new URL(request.url).pathname === "/app.js") await appGate;
      if (inputGate && /\/input-glue-/.test(new URL(request.url).pathname)) await inputGate;
      return staticResponse(request, out);
    },
  });
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      // Reading may download dependencies, but must not execute user code or fetch page/search data.
      const rendered = await browser.newPage();
      const renderRequests = [];
      rendered.on("request", (request) => renderRequests.push(new URL(request.url()).pathname));
      await rendered.goto(new URL("/zh/authoring", renderServer.url).href);
      await rendered.waitForLoadState("networkidle");
      assert.equal(await rendered.evaluate(() => Boolean(globalThis.exact?.state)), false);
      assert.equal(renderRequests.filter((url) => url === "/app.js").length, 1);
      assert.equal(renderRequests.filter((url) => url === "/style.css").length, 1);
      assert.equal(
        renderRequests.some((url) => /\/(input-glue-|scope-|body-)/.test(url)),
        false,
      );
      await rendered.getByRole("searchbox").fill("Exact");
      await rendered.locator('[data-docs-part="search"] a').first().waitFor();
      await rendered.waitForLoadState("networkidle");
      assert.equal(renderRequests.filter((url) => url === "/app.js").length, 1);
      assert.equal(renderRequests.filter((url) => url === "/style.css").length, 1);
      await rendered.close();
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
      ]);
      await search.hover();
      await warmed;
      assert.equal(await page.evaluate(() => Boolean(globalThis.exact?.state)), false);
      assert.equal(
        requests.some((request) => /\/input-glue-/.test(request)),
        false,
        "Input-only runtime must not compete with application startup on hover",
      );
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
      // The SDK can replay native button activation before its input-only module arrives.
      let releaseInput;
      inputGate = new Promise((resolve) => {
        releaseInput = resolve;
      });
      try {
        await counter.press("Enter");
        await control.getByRole("button", { name: "Count: 1", exact: true }).waitFor();
      } finally {
        inputGate = undefined;
        releaseInput();
      }
      await control.waitForLoadState("networkidle");
      assert.equal(await control.getByRole("button", { name: "Count: 1", exact: true }).count(), 1);
      assert.equal(controlRequests.filter((url) => /\/input-glue-/.test(url)).length, 1);
      assert.equal(
        controlRequests.some((url) => /\/scope-/.test(url)),
        false,
      );
      await control.close();
      // Existing activation checks do not detect a search-index waterfall behind app.js.
      const cold = await browser.newPage();
      cold.on("pageerror", (error) => errors.push(String(error)));
      const coldScopes = [];
      cold.on("request", (request) => {
        if (/\/scope-/.test(request.url())) coldScopes.push(new URL(request.url()).pathname);
      });
      let releaseApp;
      appGate = new Promise((resolve) => {
        releaseApp = resolve;
      });
      try {
        await cold.goto(new URL("/zh/authoring", server.url).href);
        const input = cold.getByRole("searchbox");
        await input.focus();
        await input.fill("   ");
        assert.deepEqual(coldScopes, []);
        assert.equal(await cold.locator('link[rel="modulepreload"][href*="/scope-"]').count(), 0);
        const requested = cold.waitForRequest((request) => /\/scope-1-/.test(request.url()), {
          timeout: 2000,
        });
        await input.fill("Exact");
        await requested;
        assert.equal(coldScopes.length, 1);
        assert.equal(await cold.evaluate(() => Boolean(globalThis.exact?.state)), false);
      } finally {
        appGate = undefined;
        releaseApp();
      }
      await cold.locator('[data-docs-part="search"] a').first().waitFor();
      assert.equal(await cold.getByRole("searchbox").inputValue(), "Exact");
      assert.equal(coldScopes.length, 1);
      assert.equal(
        await cold
          .locator('[data-docs-part="search"] a')
          .evaluateAll((links) =>
            links.every(
              (link) =>
                link.getAttribute("href") === "/zh" || link.getAttribute("href").startsWith("/zh/"),
            ),
          ),
        true,
      );
      await cold.close();
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
  if (renderServer) await renderServer.stop(true);
  await rm(parent, { recursive: true, force: true });
}
