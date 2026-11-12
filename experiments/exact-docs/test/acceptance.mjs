import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { main } from "../src/cli.ts";
import { buildSite } from "../src/index.ts";
import { staticResponse } from "../src/server.ts";
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const parent = await mkdtemp(path.join(tmpdir(), "exact-docs-acceptance-"));
const root = path.join(parent, "docs");
let server;
try {
  await main(["new", root]);
  const config = await Bun.file(path.join(root, "docs.json")).json();
  config.theme = "headless";
  config.origin = "https://docs.example.test";
  config.layout = { source: "layouts/reader.contract", component: "ReaderLayout" };
  config.locales.push({ id: "ar", label: "العربية", dir: "rtl" });
  config.pages.push({ id: "home", path: "/ar", source: "arabic.md", locale: "ar" });
  config.pages.push({
    path: "/internal-reference",
    source: "internal.md",
    nav: false,
    search: false,
    noindex: true,
  });
  await Bun.write(
    path.join(root, "internal.md"),
    "# Internal reference\n\n[Return to authoring](/authoring)",
  );
  await Bun.write(path.join(root, "arabic.md"), "# دليل التوثيق\n\nواجهة القراءة والتوثيق.");
  await Bun.write(path.join(root, "docs.json"), JSON.stringify(config));
  const authoring = Bun.file(path.join(root, "authoring.md"));
  await Bun.write(
    authoring,
    (await authoring.text()) +
      "\n\n## Reading anchor\n\n" +
      Array.from(
        { length: 80 },
        (_, i) =>
          `Reading paragraph ${i}. ` +
          "Keep the application session while moving between documentation pages. ".repeat(4),
      ).join("\n\n") +
      "\n\n## Final anchor\n\nLast paragraph.\n\n[Internal reference](/internal-reference)",
  );
  const { out } = await buildSite(root);
  let heldScope, releaseScope, failedScope;
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      if (failedScope && new URL(request.url).pathname.includes(failedScope))
        return new Response("fixture index failure", {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        });
      if (heldScope && new URL(request.url).pathname.includes(heldScope))
        await new Promise((resolve) => {
          releaseScope = resolve;
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
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 800 } }),
        errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      await page.goto(new URL("/authoring", server.url).href);
      await page.getByTestId("reader-layout").waitFor();
      assert.equal(await page.getByTestId("reader-title").textContent(), "Authoring");
      await page
        .getByRole("navigation", { name: "On this page", exact: true })
        .getByRole("link", { name: "Reading anchor", exact: true })
        .waitFor();
      await page
        .getByRole("navigation", { name: "Adjacent pages", exact: true })
        .getByRole("link", { name: "Previous: Introduction", exact: true })
        .waitFor();
      const search = page.getByRole("searchbox", { name: "Search documentation" });
      await search.fill("impossible-acceptance-query");
      await page.getByRole("status").filter({ hasText: "No pages found" }).waitFor();
      await search.fill("");
      await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              window.acceptanceClipboard = text;
            },
          },
        });
      });
      await page.getByRole("button", { name: "Copy Markdown", exact: true }).click();
      assert.equal(await page.evaluate(() => window.acceptanceClipboard), await authoring.text());
      assert.equal(
        await page.getByRole("link", { name: "Open Markdown", exact: true }).getAttribute("href"),
        "/_docs/markdown/authoring/index.md",
      );
      // Keyboard skip and fragment behavior were not asserted by the earlier content suite.
      await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.activeElement?.id === "docs-content");
      const toc = page.getByRole("navigation", { name: "On this page", exact: true });
      await toc.getByRole("link", { name: "Final anchor", exact: true }).focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => location.hash === "#final-anchor");
      await page.waitForFunction(
        () => Math.abs(document.getElementById("final-anchor").getBoundingClientRect().top) < 800,
      );
      const nav = page.getByRole("navigation", { name: "Documentation", exact: true });
      await nav.getByRole("link", { name: "Introduction", exact: true }).focus();
      const beforeNavigation = await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(scrollY))),
          ),
      );
      await page.keyboard.press("Enter");
      await page.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.id === "docs-content");
      // Focusing a navigation link may scroll it into view. Restore where the user actually left.
      await page.goBack();
      await page.getByRole("heading", { name: "Final anchor", exact: true }).waitFor();
      await page.waitForFunction((expected) => Math.abs(scrollY - expected) < 5, beforeNavigation);
      await nav.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-save").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      await nav.getByRole("link", { name: "Authoring", exact: true }).click();
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "简体中文", exact: true })
        .click();
      await page.getByTestId("reader-title").filter({ hasText: "编写指南" }).waitFor();
      await page.getByRole("navigation", { name: "本页目录", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.lang), "zh-CN");
      await page
        .locator('[data-docs-part="versions"]')
        .getByRole("link", { name: "v1", exact: true })
        .click();
      await page.waitForFunction(() => location.pathname === "/zh/v1");
      await page.getByRole("status").filter({ hasText: "归档版本" }).waitFor();
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "English", exact: true })
        .click();
      await page
        .locator('[data-docs-part="versions"]')
        .getByRole("link", { name: "v2", exact: true })
        .click();
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "العربية", exact: true })
        .click();
      await page.getByRole("heading", { name: "دليل التوثيق", exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "English", exact: true })
        .click();
      await nav.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      await nav.getByRole("link", { name: "Authoring", exact: true }).click();
      await page.getByRole("link", { name: "Internal reference", exact: true }).click();
      await page.getByRole("heading", { name: "Internal reference", exact: true }).waitFor();
      assert.equal(
        await page.locator('meta[name="robots"]').getAttribute("content"),
        "noindex,follow",
      );
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://docs.example.test/internal-reference",
      );
      await page.getByRole("link", { name: "Return to authoring", exact: true }).click();
      await page.getByRole("heading", { name: "Authoring", exact: true }).waitFor();
      assert.equal(
        await page.locator('meta[name="robots"]').getAttribute("content"),
        "index,follow",
      );
      await page.goto(new URL("/missing", server.url).href);
      await page.getByRole("heading", { name: "Page not found", exact: true }).waitFor();
      assert.equal(
        await page.locator('meta[name="robots"]').getAttribute("content"),
        "noindex,follow",
      );
      assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
      assert.deepEqual(errors, []);
      console.log(
        `${name}: custom layout, injected metadata, keyboard focus, fragments, history, locales/versions/RTL and root state passed`,
      );
      await page.close();
      // Delayed old-scope replies must not replace the newly selected scope's results.
      const race = await browser.newPage();
      race.on("pageerror", (error) => errors.push(String(error)));
      heldScope = "scope-0-";
      await race.goto(server.url.href);
      await race.getByRole("searchbox", { name: "Search documentation" }).fill("文档");
      await race.waitForFunction(() => Boolean(globalThis.exact?.state));
      await race.getByRole("status").filter({ hasText: "Searching documentation" }).waitFor();
      await race
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "简体中文", exact: true })
        .click();
      await race
        .locator('[data-docs-part="search"]')
        .getByRole("link", { name: "编写指南", exact: true })
        .waitFor();
      heldScope = undefined;
      releaseScope?.();
      await race.waitForLoadState("networkidle");
      const hrefs = await race
        .locator('[data-docs-part="search"] a')
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      assert.ok(hrefs.length && hrefs.every((href) => href.startsWith("/zh")));
      assert.deepEqual(errors, []);
      console.log(`${name}: delayed previous-scope search reply cannot overwrite current results`);
      await race.close();
      const failure = await browser.newPage();
      failure.on("pageerror", (error) => errors.push(String(error)));
      failedScope = "scope-0-";
      await failure.goto(server.url.href);
      await failure.getByRole("searchbox", { name: "Search documentation" }).fill("Exact");
      await failure.getByRole("alert").filter({ hasText: "Search could not be loaded" }).waitFor();
      failedScope = undefined;
      await failure.reload();
      await failure.getByRole("searchbox", { name: "Search documentation" }).fill("Exact");
      await failure.locator('[data-docs-part="search"]').getByRole("link").first().waitFor();
      await failure.close();
      console.log(`${name}: search failure feedback and documented reload recovery passed`);
      const reading = await browser.newPage();
      reading.on("pageerror", (error) => errors.push(String(error)));
      await reading.goto(new URL("/authoring", server.url).href);
      await reading
        .getByRole("searchbox", { name: "Search documentation" })
        .fill("no-reading-results");
      await reading.getByRole("status").filter({ hasText: "No pages found" }).waitFor();
      await reading.evaluate(() => scrollTo(0, 1500));
      await reading.waitForFunction(() => scrollY > 1000);
      const position = await reading.evaluate(() => scrollY);
      await reading
        .getByRole("navigation", { name: "Documentation", exact: true })
        .getByRole("link", { name: "Introduction", exact: true })
        .evaluate((link) => link.click());
      await reading.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
      await reading.goBack();
      await reading.getByRole("heading", { name: "Authoring", exact: true }).waitFor();
      await reading.waitForFunction((expected) => Math.abs(scrollY - expected) < 5, position);
      await reading.close();
      assert.deepEqual(errors, []);
      console.log(`${name}: unfragmented reading position restores after browser Back`);
    } finally {
      heldScope = undefined;
      failedScope = undefined;
      releaseScope?.();
      await browser.close();
    }
  }
} finally {
  if (server) await server.stop(true);
  await rm(parent, { recursive: true, force: true });
}
