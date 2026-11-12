import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { main } from "../src/cli.ts";
import { buildSite } from "../src/index.ts";
import { staticResponse } from "../src/server.ts";

const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const parent = await mkdtemp(path.join(tmpdir(), "exact-docs-content-"));
const root = path.join(parent, "docs");
let server;
const gates = new Map(),
  failures = new Set();
function hold(file) {
  let release;
  const promise = new Promise((resolve) => {
    release = resolve;
  });
  gates.set(file, promise);
  return () => {
    gates.delete(file);
    release();
  };
}
try {
  await main(["new", root]);
  // The framework's checkpoint cache must still forward the user's native kept hook.
  const dataFile = Bun.file(path.join(root, "data/source.ts"));
  await Bun.write(
    dataFile,
    (await dataFile.text()).replace(
      'case "incrementCounter":',
      'case "incrementCounter":\n      if (!remembered) throw new Error("Custom kept hook was not forwarded");',
    ) +
      `
let remembered = false;
export function kept(source: string, args: unknown[], value: unknown) {
  if (source === "readCounter" && args[0] === false && value && typeof value === "object" && "value" in value && value.value === 7) remembered = true;
}
`,
  );
  const config = await Bun.file(path.join(root, "docs.json")).json();
  config.theme = "headless";
  config.origin = "https://docs.example.test";
  config.locales.push({ id: "ar", label: "العربية", dir: "rtl" });
  config.pages.push({ path: "/arabic", locale: "ar", title: "Arabic page", source: "arabic.md" });
  await Bun.write(path.join(root, "arabic.md"), "# Arabic page\n\nArabic body.");
  config.layout = { source: "layouts/reader.contract", component: "ReaderLayout" };
  for (const name of ["Delayed", "Fast", "Fragment", "Failure"]) {
    const id = name.toLowerCase();
    config.pages.push({ id, path: `/${id}`, title: `${name} page`, source: `${id}.md` });
    await Bun.write(
      path.join(root, `${id}.md`),
      `# ${name} page\n\n${name} unique body content.\n\n## Deferred heading\n\nEnd of ${name}.\n\n[Deferred fragment](/fragment#deferred-heading)`,
    );
  }
  await Bun.write(path.join(root, "docs.json"), JSON.stringify(config));
  const { out } = await buildSite(root),
    contentFiles = new Map();
  for (const file of (await readdir(out)).filter((file) => /^body-\d+-[\w-]+\.js$/.test(file))) {
    const content = (await import(pathToFileURL(path.join(out, file)).href)).default;
    contentFiles.set(content.path, `/${file}`);
  }
  const entry = await Bun.file(path.join(out, "app.js")).text();
  assert.equal(entry.includes("Delayed unique body content."), false);
  assert.equal(entry.includes("# Authoring"), false);
  assert.equal(entry.includes("deferred-heading"), false);
  assert.equal(entry.includes("https://docs.example.test/delayed"), false);
  assert.equal(entry.includes("简体中文"), false);
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const file = new URL(request.url).pathname;
      if (gates.has(file)) await gates.get(file);
      if (failures.has(file))
        return new Response("controlled content failure", {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        });
      return staticResponse(request, out);
    },
  });
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== name) continue;
    const browser = await engine.launch();
    let release;
    try {
      const page = await browser.newPage(),
        errors = [],
        bodies = [],
        documents = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (request) => {
        const file = new URL(request.url()).pathname;
        if (/^\/body-\d+-/.test(file)) bodies.push(file);
        if (request.resourceType() === "document") documents.push(file);
      });
      await page.goto(new URL("/authoring", server.url).href);
      await page.getByRole("heading", { name: "Embedded counter", exact: true }).waitFor();
      assert.equal(bodies.length, 0);
      await page.getByTestId("embedded-counter").press("Enter");
      await page.getByTestId("embedded-counter").filter({ hasText: "Count: 3" }).waitFor();
      assert.equal(
        await page.locator('[data-docs-part="content"]').getAttribute("aria-busy"),
        "false",
      );
      await page.waitForLoadState("networkidle");
      assert.deepEqual(bodies, []);
      assert.match(await page.getByTestId("embedded-counter").textContent(), /Count: 3/);
      const nav = page.getByRole("navigation", { name: "Documentation", exact: true });
      await nav.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-save").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://docs.example.test/data",
      );
      const delayed = contentFiles.get("/delayed");
      release = hold(delayed);
      const delayedRequest = page.waitForRequest(
        (request) => new URL(request.url()).pathname === delayed,
      );
      await nav.getByRole("link", { name: "Delayed page", exact: true }).click();
      await delayedRequest;
      await page
        .locator('[data-docs-part="content"]')
        .getByRole("status")
        .filter({ hasText: "Loading page" })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Copy Markdown", exact: true }).isDisabled(),
        true,
      );
      assert.equal(await page.locator('[data-docs-part="article"]').count(), 0);
      assert.equal(await page.locator('[data-docs-part="toc"] a').count(), 0);
      assert.equal(await page.locator('[data-docs-part="pagination"] a').count(), 0);
      assert.equal(
        await page.getByRole("link", { name: "Open Markdown", exact: true }).getAttribute("href"),
        "/_docs/markdown/delayed/index.md",
      );
      assert.equal(await page.locator('[data-docs-part="locales"] a').count(), 0);
      assert.equal(await page.locator('[data-docs-part="versions"] a').count(), 0);
      assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
      assert.equal(await page.locator("[data-docs-alternate]").count(), 0);
      await nav.getByRole("link", { name: "Fast page", exact: true }).click();
      await page.getByText("Fast unique body content.", { exact: true }).waitFor();
      release();
      release = undefined;
      await page.waitForLoadState("networkidle");
      assert.deepEqual(
        await page
          .locator('[data-docs-part="pagination"] a')
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        ["/delayed", "/fragment"],
      );
      assert.equal(new URL(page.url()).pathname, "/fast");
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://docs.example.test/fast",
      );
      assert.equal(
        await page
          .locator('[data-docs-part="toc"]')
          .getByRole("link", { name: "Deferred heading", exact: true })
          .getAttribute("href"),
        "/fast#deferred-heading",
      );
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "简体中文", exact: true })
        .waitFor();
      assert.equal(
        await page.getByText("Delayed unique body content.", { exact: true }).count(),
        0,
      );
      await nav.getByRole("link", { name: "Delayed page", exact: true }).click();
      await page.getByText("Delayed unique body content.", { exact: true }).waitFor();
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://docs.example.test/delayed",
      );
      assert.equal(bodies.filter((file) => file === delayed).length, 1);
      release = hold(contentFiles.get("/fragment"));
      const fragmentRequest = page.waitForRequest(
        (request) => new URL(request.url()).pathname === contentFiles.get("/fragment"),
      );
      await page.getByRole("link", { name: "Deferred fragment", exact: true }).focus();
      await page.keyboard.press("Enter");
      await fragmentRequest;
      await page
        .locator('[data-docs-part="content"]')
        .getByRole("status")
        .filter({ hasText: "Loading page" })
        .waitFor();
      release();
      release = undefined;
      await page.getByRole("heading", { name: "Deferred heading", exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.id === "deferred-heading");
      await nav.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      assert.equal(documents.length, 1);
      release = hold(contentFiles.get("/arabic"));
      const arabicRequest = page.waitForRequest(
        (request) => new URL(request.url()).pathname === contentFiles.get("/arabic"),
      );
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "العربية", exact: true })
        .click();
      await arabicRequest;
      await page.waitForFunction(
        () => document.documentElement.lang === "ar" && document.documentElement.dir === "rtl",
      );
      assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
      release();
      release = undefined;
      await page.getByRole("heading", { name: "Arabic page", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "English", exact: true })
        .click();
      await page.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
      const failed = contentFiles.get("/failure");
      failures.add(failed);
      await nav.getByRole("link", { name: "Failure page", exact: true }).click();
      await page
        .locator('[data-docs-part="content"]')
        .getByRole("alert")
        .filter({ hasText: "Page could not be loaded" })
        .waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Copy Markdown", exact: true }).isDisabled(),
        true,
      );
      assert.equal(await page.locator('[data-docs-part="article"]').count(), 0);
      failures.delete(failed);
      await page.reload();
      await page.getByText("Failure unique body content.", { exact: true }).waitFor();
      await page.getByRole("searchbox", { name: "Search documentation" }).fill("Exact");
      await page.locator('[data-docs-part="search"]').getByRole("link").first().waitFor();
      await nav.getByRole("link", { name: "Fast page", exact: true }).click();
      await page.getByText("Fast unique body content.", { exact: true }).waitFor();
      await nav.getByRole("link", { name: "Failure page", exact: true }).click();
      await page.getByText("Failure unique body content.", { exact: true }).waitFor();
      assert.equal(
        await page.getByRole("button", { name: "Copy Markdown", exact: true }).isDisabled(),
        false,
      );
      await page.waitForLoadState("networkidle");
      assert.deepEqual(errors, []);
      console.log(
        `${name}: SSR widget interaction, page-only imports, root state, stale replies, cache, deferred fragments and failure/reload recovery passed`,
      );
    } finally {
      release?.();
      failures.clear();
      await browser.close();
    }
  }
} finally {
  if (server) await server.stop(true);
  await rm(parent, { recursive: true, force: true });
}
