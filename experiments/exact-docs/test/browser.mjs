import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { main } from "../src/cli.ts";
import { buildSite } from "../src/index.ts";
import { startDev, staticResponse } from "../src/server.ts";

const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const parent = await mkdtemp(path.join(tmpdir(), "exact-docs-browser-"));
const root = path.join(parent, "docs");
await main(["new", root]);
const initialConfig = await Bun.file(path.join(root, "docs.json")).json();
initialConfig.theme = "headless";
initialConfig.origin = "https://docs.example.test";
initialConfig.pages.push({
  path: "/reference",
  source: "reference.md",
  nav: false,
  search: false,
  noindex: true,
});
await Bun.write(
  path.join(root, "authoring.md"),
  (await Bun.file(path.join(root, "authoring.md")).text()) + "\nMiXeDSeArChSentinel\n",
);
initialConfig.locales.push({
  id: "ar",
  label: "العربية",
  dir: "rtl",
  labels: { navigation: "التوثيق", unavailable: "غير متاح" },
});
initialConfig.pages.push({ id: "home", path: "/ar", locale: "ar", source: "arabic.md" });
await Bun.write(path.join(root, "arabic.md"), "# دليل التوثيق\n\nمقدمة باللغة العربية.");
await Bun.write(path.join(root, "reference.md"), "# Reference details\n\nreferenceonly");
await Bun.write(path.join(root, "docs.json"), JSON.stringify(initialConfig));
let server;
let dev;
try {
  // Virtual-clock checks below use Exact's development-only agent.
  const { out } = await buildSite(root, { development: true });
  const html = await Bun.file(path.join(out, "playground/index.html")).text();
  assert.match(html, /Exact playground/);
  assert.match(html, /Count: 0/);
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: (request) => staticResponse(request, out),
  });
  assert.equal((await fetch(new URL("/missing", server.url))).status, 404);
  assert.equal((await fetch(new URL("/reference", server.url))).status, 200);
  const index = await (await fetch(new URL("/search-index.json", server.url))).json();
  assert.equal(
    index.some((item) => item.href === "/reference"),
    false,
  );
  const originalMarkdown = await Bun.file(path.join(root, "authoring.md")).text();
  assert.equal(
    (await Bun.file(path.join(out, "app.js")).text()).includes("mixedsearchsentinel"),
    false,
  );
  const sitemap = await (await fetch(new URL("/sitemap.xml", server.url))).text();
  assert.ok(sitemap.includes("https://docs.example.test/zh/authoring"));
  assert.equal(sitemap.includes("/reference"), false);
  const ir = await (await fetch(new URL("/_docs/content/authoring/index.json", server.url))).json();
  assert.equal(ir.schemaVersion, 1);
  assert.ok(ir.nodes.some((node) => node.kind === "component" && node.name === "CounterDemo"));
  assert.equal(
    await (await fetch(new URL("/_docs/markdown/authoring/index.md", server.url))).text(),
    originalMarkdown,
  );
  const localizedIndex = await (
    await fetch(new URL("/_docs/search/zh-CN/v2/index.json", server.url))
  ).json();
  assert.deepEqual(
    localizedIndex.map((item) => item.href),
    ["/zh", "/zh/authoring"],
  );
  assert.ok(localizedIndex.every((item) => item.locale === "zh-CN" && item.version === "v2"));
  const manifest = await (await fetch(new URL("/_docs/variants.json", server.url))).json();
  assert.equal(manifest.pages.find((item) => item.path === "/v1/authoring").id, "authoring");
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== name) continue;
    const browser = await engine.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      const scopeRequests = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (request) => {
        if (/\/scope-\d+-[^/]+\.js/.test(request.url())) scopeRequests.push(request.url());
      });
      await page.goto(server.url.href);
      await page.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
      await page.getByRole("region", { name: "Documentation", exact: true }).waitFor();
      assert.equal(
        await page.getByRole("link", { name: "Reference details", exact: true }).count(),
        0,
      );
      assert.equal(await page.getByRole("link", { name: /^Previous:/ }).count(), 0);
      await page.getByRole("link", { name: "Next: Authoring", exact: true }).click();
      assert.equal(
        await page.locator('meta[name="description"]').getAttribute("content"),
        "Author Markdown, interactive pages and root data extensions.",
      );
      await page.evaluate(() => {
        // Keep clipboard verification inside the fixture rather than the system pasteboard.
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text) => {
              globalThis.__copiedMarkdown = text;
            },
          },
        });
      });
      await page.getByTestId("copy-markdown").click();
      await page.waitForFunction(() => typeof globalThis.__copiedMarkdown === "string");
      assert.equal(await page.evaluate(() => globalThis.__copiedMarkdown), originalMarkdown);
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        "https://docs.example.test/authoring",
      );
      assert.equal((await page.locator('[data-docs-token="keyword"]').count()) > 0, true);
      assert.equal(
        await page.getByRole("heading", { name: "Embedded counter", exact: true }).count(),
        1,
      );
      await page.getByTestId("embedded-counter").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.getByTestId("embedded-counter").textContent(), "Count: 3");
      assert.deepEqual(scopeRequests, []);
      assert.equal(
        await page.getByRole("link", { name: "Open Markdown", exact: true }).getAttribute("href"),
        "/_docs/markdown/authoring/index.md",
      );
      await page.getByRole("link", { name: "Previous: Introduction", exact: true }).click();
      await page.getByRole("searchbox", { name: "Search documentation" }).fill("headings");
      const results = page.locator('[data-docs-part="search"]');
      await results.getByRole("link", { name: "Authoring", exact: true }).waitFor();
      assert.equal(new Set(scopeRequests).size, 1);
      assert.ok(scopeRequests[0].includes("/scope-0-"));
      await page.getByRole("searchbox").fill("referenceonly");
      await page.getByRole("status").filter({ hasText: "No pages found" }).waitFor();
      await page.getByRole("searchbox").fill("");
      await page
        .getByRole("navigation", { name: "Documentation", exact: true })
        .getByRole("link", { name: "Exact playground" })
        .click();
      await page.getByTestId("counter").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.getByTestId("counter").textContent(), "Count: 1");
      await page.reload();
      assert.equal(await page.getByTestId("counter").textContent(), "Count: 0");
      await page
        .getByRole("navigation", { name: "Documentation", exact: true })
        .getByRole("link", { name: "Authoring", exact: true })
        .click();
      assert.equal((await page.locator('[data-docs-part="root"]').boundingBox()).y, 0);
      await page
        .getByRole("navigation", { name: "On this page" })
        .getByRole("link", { name: "Exact pages" })
        .click();
      assert.equal(new URL(page.url()).hash, "#exact-pages");
      assert.equal(await page.locator("#exact-pages").count(), 1);
      await page.goBack();
      await page.goBack();
      await page.getByTestId("counter").waitFor();
      await page.goto(new URL("/authoring", server.url).href);
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "简体中文", exact: true })
        .click();
      await page.getByRole("heading", { name: "编写指南", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/zh/authoring");
      assert.equal(await page.locator('[data-docs-part="context"]').getAttribute("lang"), "zh-CN");
      await page.waitForFunction(() => document.documentElement.lang === "zh-CN");
      assert.equal(
        await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute("href"),
        "https://docs.example.test/authoring",
      );
      const scopedNav = page.locator('[data-docs-part="navigation"]');
      assert.deepEqual(
        await scopedNav
          .getByRole("link")
          .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
        ["/zh", "/zh/authoring"],
      );
      await page.getByRole("searchbox", { name: "搜索文档" }).click();
      await page.getByRole("searchbox", { name: "搜索文档" }).fill("Archived instructions");
      await page.getByRole("status").filter({ hasText: "没有匹配的页面" }).waitFor();
      await page.getByRole("searchbox", { name: "搜索文档" }).fill("元数据");
      await page
        .locator('[data-docs-part="search"]')
        .getByRole("link", { name: "编写指南", exact: true })
        .waitFor();
      assert.equal(
        await page.getByRole("link", { name: "上一篇: 简介", exact: true }).getAttribute("href"),
        "/zh",
      );
      await page.getByRole("searchbox", { name: "搜索文档" }).fill("");
      assert.equal(new Set(scopeRequests).size, 2);
      assert.ok(scopeRequests.some((url) => url.includes("/scope-1-")));
      await page
        .locator('[data-docs-part="versions"]')
        .getByRole("link", { name: "v1", exact: true })
        .click();
      await page.getByRole("heading", { name: "v1 文档示例", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/zh/v1");
      await page.getByRole("status").filter({ hasText: "你正在阅读归档版本。" }).waitFor();
      await page
        .locator('[data-docs-part="locales"]')
        .getByRole("link", { name: "English", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Version 1 documentation example", exact: true })
        .waitFor();
      assert.equal(new URL(page.url()).pathname, "/v1");
      await page.goto(new URL("/v1/authoring", server.url).href);
      await page
        .locator('[data-docs-part="versions"]')
        .getByRole("link", { name: "v2", exact: true })
        .click();
      await page.getByRole("heading", { name: "Authoring", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/authoring");
      await page.goBack();
      await page
        .getByRole("heading", { name: "Version 1 authoring example", exact: true })
        .waitFor();
      await page.reload();
      await page
        .getByRole("heading", { name: "Version 1 authoring example", exact: true })
        .waitFor();
      await page.goto(new URL("/ar", server.url).href);
      await page.getByRole("heading", { name: "دليل التوثيق", exact: true }).waitFor();
      assert.equal(await page.locator('[data-docs-part="context"]').getAttribute("lang"), "ar");
      await page.waitForFunction(
        () => document.documentElement.lang === "ar" && document.documentElement.dir === "rtl",
      );
      assert.equal(
        await page
          .locator('[data-docs-part="context"]')
          .evaluate((node) => getComputedStyle(node).direction),
        "rtl",
      );
      assert.equal(
        await page
          .locator('[data-docs-part="versions"]')
          .getByRole("link", { name: "v1", exact: true })
          .count(),
        0,
      );
      await page
        .locator('[data-docs-part="versions"]')
        .getByText("v1 (غير متاح)", { exact: true })
        .waitFor();
      await page.goto(new URL("/data?agent", server.url).href);
      await page.getByTestId("data-save").waitFor();
      assert.equal(await page.getByRole("link", { name: /^Next:/ }).count(), 0);
      await page.waitForFunction(() => globalThis.exact?.advance);
      assert.equal(await page.getByTestId("data-counter").textContent(), "Counter: 7");
      await page.getByTestId("data-save").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 8" }).waitFor();
      await page.getByTestId("data-reject").click();
      await page.getByRole("alert").filter({ hasText: "Counter update refused" }).waitFor();
      assert.equal(await page.getByTestId("data-counter").textContent(), "Counter: 8");
      await page.getByTestId("data-save").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 9" }).waitFor();
      assert.equal(await page.getByRole("alert").count(), 0);
      await page.getByTestId("data-break-read").click();
      await page.getByRole("alert").filter({ hasText: "Counter read failed" }).waitFor();
      await page.getByTestId("data-recover-read").click();
      await page.getByTestId("data-counter").filter({ hasText: "Counter: 9" }).waitFor();
      assert.equal(await page.getByRole("alert").count(), 0);
      const ticks = () => page.getByTestId("data-ticks").textContent();
      const advance = () =>
        page.evaluate(() => globalThis.exact.advance(globalThis.exact.clock.now + 1000));
      assert.equal(await ticks(), "Ticks: 0");
      await advance();
      assert.equal(await ticks(), "Ticks: 4");
      await page.getByTestId("data-pause").click();
      await advance();
      assert.equal(await ticks(), "Ticks: 4");
      await page.getByTestId("data-pause").click();
      await advance();
      assert.equal(await ticks(), "Ticks: 8");
      const navigation = page.getByRole("navigation", { name: "Documentation", exact: true });
      await navigation.getByRole("link", { name: "Introduction", exact: true }).click();
      await advance();
      await navigation.getByRole("link", { name: "Root data", exact: true }).click();
      assert.equal(await ticks(), "Ticks: 8");
      await advance();
      assert.equal(await ticks(), "Ticks: 12");
      assert.deepEqual(errors, []);
      console.log(
        `${name}: content, search, navigation, root resources, mutation refresh/refusal/recovery and route-gated tasks passed`,
      );
    } finally {
      await browser.close();
    }
  }
  await server.stop(true);
  server = undefined;

  const configFile = Bun.file(path.join(root, "docs.json"));
  const config = await configFile.json();
  config.layout = { source: "layouts/minimal.contract", component: "MinimalLayout" };
  await Bun.write(configFile, JSON.stringify(config));
  dev = await startDev(root, 0);
  await dev.ready();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(dev.url.href);
    await page.getByTestId("custom-layout").waitFor();
    await page.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
    const navigation = page.getByRole("navigation", { name: "Documentation", exact: true });
    await navigation.getByRole("link", { name: "Root data", exact: true }).click();
    const dataSource = Bun.file(path.join(root, "data/source.ts"));
    await Bun.write(
      dataSource,
      (await dataSource.text()).replace("let value = 7", "let value = 11"),
    );
    await page.getByTestId("data-counter").filter({ hasText: "Counter: 11" }).waitFor();
    const rootSource = Bun.file(path.join(root, "data/root.contract"));
    const members = await rootSource.text();
    await Bun.write(rootSource, `${members}\ntask broken\n`);
    await page.getByRole("alert").filter({ hasText: "Exact build failed" }).waitFor();
    assert.equal(await page.getByTestId("data-counter").textContent(), "Counter: 11");
    // The old ticker can also reach 20 while the replacement is still building.
    const recovered = page.waitForEvent("framenavigated", (frame) => frame === page.mainFrame());
    await Bun.write(
      rootSource,
      members
        .replace("state ticks = 0", "state ticks = 20")
        .replace("state timerPaused = false", "state timerPaused = true"),
    );
    await recovered;
    await page.getByTestId("data-ticks").filter({ hasText: "Ticks: 20" }).waitFor();
    assert.deepEqual(await page.getByRole("alert").allTextContents(), []);
    await navigation.getByRole("link", { name: "Introduction", exact: true }).click();
    await Bun.write(
      path.join(root, "index.md"),
      "# Edited documentation\n\nAutomatic rebuild works.",
    );
    await page.getByRole("heading", { name: "Edited documentation" }).waitFor();
    await Bun.write(path.join(root, "index.md"), "# Broken edit\n\n[Missing](/does-not-exist)");
    await page.getByRole("alert").filter({ hasText: "broken link" }).waitFor();
    assert.equal(await page.getByRole("heading", { name: "Edited documentation" }).count(), 1);
    await Bun.write(
      path.join(root, "index.md"),
      "# Recovered documentation\n\nThe next valid edit is published.",
    );
    await page.getByRole("heading", { name: "Recovered documentation" }).waitFor();
    assert.deepEqual(await page.getByRole("alert").allTextContents(), []);
    console.log(
      "chromium: custom layout, data-module/root-member live reload, failed-build preservation and recovery passed",
    );
  } finally {
    await browser.close();
  }
} finally {
  await dev?.stop();
  await server?.stop(true);
  await rm(parent, { recursive: true, force: true });
}
