import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { staticResponse } from "../src/server.ts";
const root = path.resolve(import.meta.dirname, "..");
const out = path.resolve(process.argv[2] ?? path.join(root, ".cache/theme-demo/dist"));
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const captures = path.join(root, ".cache/theme-acceptance");
await mkdir(captures, { recursive: true });
const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: (r) => staticResponse(r, out) });
const receipts = [];
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(
      name === "webkit" && process.env.WEBKIT_EXECUTABLE
        ? { executablePath: process.env.WEBKIT_EXECUTABLE }
        : {},
    );
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          value: {
            writeText: async (text) => {
              globalThis.themeCopied = text;
            },
          },
        });
      });
      await page.goto(server.url.href);
      await page.getByRole("heading", { name: "Exact Docs", exact: true }).waitFor();
      const staticPage = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        javaScriptEnabled: false,
      });
      await staticPage.goto(server.url.href);
      const initial = await staticPage.evaluate(() => ({
        columns: getComputedStyle(
          document.querySelector('[data-docs-theme-part="columns"]'),
        ).gridTemplateColumns.split(" ").length,
        background: getComputedStyle(document.querySelector('[data-docs-theme-part="root"]'))
          .backgroundColor,
        body: document.documentElement.scrollWidth,
        width: innerWidth,
        styles: document.querySelectorAll(
          "link[data-lenso-exact-styles],link[data-docs-theme-styles]",
        ).length,
        started: !!globalThis.exact?.state,
        border: getComputedStyle(document.querySelector('[data-docs-theme-part="pagination"] a'))
          .borderTopWidth,
      }));
      assert.equal(initial.columns, 2);
      assert.equal(initial.styles, 2);
      assert.equal(initial.started, false, "Reading must not initialize the application");
      assert.ok(initial.body <= initial.width);
      assert.equal(initial.border, "1px");
      await staticPage.screenshot({
        path: path.join(captures, `${name}-desktop-light.png`),
        fullPage: true,
      });
      await staticPage.close();
      const shell = await page.evaluate(() => {
        const part = (name) => document.querySelector(`[data-docs-theme-part="${name}"]`);
        const title = document.querySelector("h1");
        return {
          sidebarWidth: part("sidebar").getBoundingClientRect().width,
          headerHeight: part("header").getBoundingClientRect().height,
          titleLeft: title.getBoundingClientRect().left,
          titleSize: getComputedStyle(title).fontSize,
          font: getComputedStyle(title).fontFamily,
          backdropZ: getComputedStyle(part("header-backdrop")).zIndex,
        };
      });
      assert.equal(shell.sidebarWidth, 280);
      assert.equal(shell.headerHeight, 64);
      assert.equal(shell.titleLeft, 328);
      assert.equal(shell.titleSize, "28px");
      assert.ok(shell.font.includes("Lenso Inter"));
      assert.equal(shell.backdropZ, "-1", "Header backdrop must stay below controls");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(captures, `${name}-desktop-runtime-light.png`) });
      await page.getByTestId("docs-appearance").click();
      await page.waitForFunction(() => document.querySelector('[data-theme="dark"]'));
      await page.evaluate(() => {
        globalThis.themeRoot = exact.state;
      });
      await page.screenshot({
        path: path.join(captures, `${name}-desktop-dark.png`),
        fullPage: true,
      });
      await page
        .getByRole("navigation", { name: "Documentation", exact: true })
        .getByRole("link", { name: "Authoring", exact: true })
        .click();
      await page.waitForURL("**/authoring");
      await page.getByRole("heading", { name: "Authoring", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(
          () => exact.state === themeRoot && !!document.querySelector('[data-theme="dark"]'),
        ),
        true,
        "Navigation must retain the root and appearance",
      );
      await page.getByTestId("copy-markdown").click();
      await page.waitForFunction(() => globalThis.themeCopied?.includes("# Authoring"));
      const desktopNav = page.getByRole("navigation", { name: "Documentation", exact: true });
      await desktopNav.getByRole("link", { name: "Exact playground", exact: true }).click();
      await page.getByTestId("counter").click();
      assert.equal(await page.getByTestId("counter").textContent(), "Count: 1");
      await desktopNav.getByRole("link", { name: "Root data", exact: true }).click();
      await page.getByTestId("data-save").click();
      await page.waitForFunction(
        () => document.querySelector('[data-testid="data-counter"]')?.textContent === "Counter: 8",
      );
      await page.waitForFunction(
        () => document.querySelector('[data-testid="data-ticks"]')?.textContent !== "Ticks: 0",
      );
      await page.getByTestId("data-pause").click();
      await desktopNav.getByRole("link", { name: "Authoring", exact: true }).click();
      await page.waitForURL("**/authoring");
      await page.getByRole("searchbox").fill("authoring");
      await page.locator('[data-docs-theme-part="results"] a').first().waitFor();
      await page.getByRole("searchbox").fill("");
      await page
        .getByRole("navigation", { name: "Language", exact: true })
        .getByRole("link", { name: "简体中文", exact: true })
        .click();
      await page.waitForURL("**/zh/authoring");
      assert.equal(await page.getByRole("searchbox").getAttribute("aria-label"), "搜索文档");
      await page
        .getByRole("navigation", { name: "语言", exact: true })
        .getByRole("link", { name: "English", exact: true })
        .click();
      await page.waitForURL("**/authoring");
      await page
        .getByRole("navigation", { name: "Version", exact: true })
        .getByRole("link", { name: "v1", exact: true })
        .click();
      await page.waitForURL("**/v1/authoring");
      const mobile = await browser.newPage({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      mobile.on("pageerror", (e) => errors.push(String(e)));
      await mobile.goto(server.url.href);
      assert.equal(await mobile.locator('[data-docs-theme-part="sidebar"]').isVisible(), false);
      assert.equal(await mobile.locator('[data-docs-theme-part="toc"]').isVisible(), false);
      assert.equal(
        await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await mobile.getByTestId("docs-menu-open").click();
      await mobile.getByRole("dialog").waitFor();
      await mobile.keyboard.press("Escape");
      await mobile.getByRole("dialog").waitFor({ state: "hidden" });
      assert.equal(
        await mobile.getByTestId("docs-menu-open").evaluate((e) => e === document.activeElement),
        true,
      );
      await mobile.screenshot({
        path: path.join(captures, `${name}-mobile-light.png`),
        fullPage: true,
      });
      await mobile.getByTestId("docs-menu-open").click();
      await mobile
        .getByRole("dialog")
        .getByRole("link", { name: "Authoring", exact: true })
        .click();
      await mobile.waitForURL("**/authoring");
      await mobile.getByRole("heading", { name: "Authoring", exact: true }).waitFor();
      assert.equal(
        await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        "Mobile article code must not overflow the page",
      );
      assert.equal(
        await mobile.getByRole("dialog").count(),
        0,
        "Route change must release the old mobile modal",
      );
      const notfound = await browser.newPage();
      await notfound.goto(server.url.href + "missing");
      await notfound.getByRole("heading", { name: "Page not found", exact: true }).waitFor();
      assert.equal(await notfound.locator('[data-docs-theme-part="root"]').count(), 1);
      assert.deepEqual(errors, []);
      receipts.push({
        browser: name,
        initialStyles: true,
        desktopAndMobile: true,
        lightAndDark: true,
        sharedRootAppearance: true,
        search: true,
        copyMarkdown: true,
        variants: true,
        mobileFocusAndNavigation: true,
        notFound: true,
        customExactPage: true,
        rootResourceMutationTask: true,
      });
      console.log(
        `${name}: themed SSR, light/dark, shared root, search/copy, variants and mobile navigation passed`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop(true);
}
await Bun.write(
  path.join(captures, "verification.json"),
  JSON.stringify({ output: out, results: receipts }, null, 2) + "\n",
);
