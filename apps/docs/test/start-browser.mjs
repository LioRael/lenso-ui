import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";
import { assertTabBarMotion } from "./tab-bar-motion.mjs";
import { assertSidebarMotion } from "./sidebar-motion.mjs";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";

const report = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    const beforeHydration = await browser.newPage({ javaScriptEnabled: false });
    await beforeHydration.goto(`${base}/en/docs/react/components/button`);
    const initialLayers = await beforeHydration
      .getByRole("tablist", { name: "Playground view" })
      .evaluate((list) => {
        const tab = list.querySelector('[role="tab"]');
        const tint = list.querySelector('[data-lenso-slot="tabs-tint"]');
        return {
          label: tab?.textContent,
          tab: Number(getComputedStyle(tab).zIndex),
          tint: Number(getComputedStyle(tint).zIndex),
        };
      });
    assert.equal(initialLayers.label, "Live preview");
    assert.ok(
      initialLayers.tab > initialLayers.tint,
      "The first tab label must remain visible before hydration",
    );
    await beforeHydration.close();
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    const failed = [];
    page.on("requestfailed", (request) =>
      failed.push({ url: request.url(), error: request.failure() }),
    );
    page.on("pageerror", (e) => errors.push({ url: page.url(), message: e.message }));
    for (const locale of ["en", "cn"]) {
      for (const [slug, title] of [
        ["glass-toggle-button", "GlassToggleButton"],
        ["toolbar", "Toolbar"],
      ]) {
        await page.goto(`${base}/${locale}/docs/react/components/${slug}`, {
          waitUntil: "networkidle",
        });
        await page
          .getByRole("heading", { name: title, level: 1, exact: true })
          .waitFor({ timeout: 15000 });
        assert.equal(await page.getByText("Something went wrong!", { exact: true }).count(), 0);
      }
    }
    await page.goto(`${base}/en/docs/react/components/button`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Page source options" }).click();
    const sourceLink = page.getByRole("menuitem", { name: "View page source" });
    assert.equal(
      await sourceLink.evaluate((node) => getComputedStyle(node).textDecorationLine),
      "none",
    );
    assert.ok(await sourceLink.getAttribute("href"));
    await page.keyboard.press("Escape");
    console.log(name, "open");
    const started = performance.now();
    await page.waitForLoadState("networkidle");
    await page.goto(`${base}/en/docs/react/components/button`);
    await page
      .locator("[data-example-mounted]")
      .first()
      .waitFor({ state: "attached", timeout: 60000 });
    console.log(name, "examples mounted");
    const firstReady = performance.now() - started;
    const body = await page.locator("body").evaluate((node) => ({
      position: getComputedStyle(node).position,
      overflowX: getComputedStyle(node).overflowX,
      background: getComputedStyle(node).backgroundColor,
    }));
    assert.equal(
      body.position,
      "relative",
      "Optical paints need the documentation body as their containing block",
    );
    assert.equal(body.overflowX, "clip", "Optical overscan must remain clipped");
    assert.ok(!["transparent", "rgba(0, 0, 0, 0)"].includes(body.background));
    await page.evaluate(() => window.scrollTo(0, 400));
    const header = page.locator("[data-docs-header-backdrop][data-scroll-active]");
    await header.waitFor({ state: "attached" });
    const headerBackground = await header.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    assert.ok(
      !["transparent", "rgba(0, 0, 0, 0)", "color(srgb 0 0 0 / 0)"].includes(headerBackground),
      "The soft edge needs a header surface behind navigation controls",
    );
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.getByRole("switch", { name: "disabled", exact: true }).click();
    assert.equal(
      await page.getByRole("button", { name: "Continue", exact: true }).first().isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    const example = page.locator("[data-example-name]").first();
    await example.getByRole("tab", { name: "Source", exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector("[data-example-name] pre")?.textContent.includes("import"),
    );
    assert.ok((await example.locator("pre").innerText()).includes("@lenso/ui"));
    await example.getByRole("tab", { name: "Preview", exact: true }).click();
    console.log(name, "source loaded");
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.locator("input").fill("Accordion");
    await dialog
      .locator("[data-docs-result]")
      .filter({ hasText: "Accordion" })
      .first()
      .waitFor({ timeout: 15000 });
    console.log(name, "search ready");
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      window.__docsSidebar = document.querySelector("aside");
    });
    const navigationStarted = performance.now();
    await page
      .getByRole("navigation", { name: "Documentation pages", exact: true })
      .getByRole("link", { name: "Accordion", exact: true })
      .click();
    await page.waitForURL("**/en/docs/react/components/accordion");
    await page.getByRole("heading", { name: "Accordion", level: 1, exact: true }).waitFor();
    const navigation = performance.now() - navigationStarted;
    assert.equal(
      await page.evaluate(() => window.__docsSidebar === document.querySelector("aside")),
      true,
    );
    console.log(name, "navigation ready");
    await page.waitForLoadState("networkidle");
    await page.goto(`${base}/cn/docs/react/components/button`);
    await page.waitForFunction(() => document.documentElement.lang === "zh-CN");
    await page.locator("[data-example-mounted]").first().waitFor({ state: "attached" });
    await page.getByRole("button", { name: "切换语言", exact: true }).click();
    await page.getByRole("menuitemradio", { name: "English", exact: true }).click();
    await page.waitForURL("**/en/docs/react/components/button");
    await page.getByRole("button", { name: "Click me", exact: true }).first().waitFor();
    await page.waitForLoadState("networkidle");
    if (process.env.DOCS_STATIC === "1") {
      const redirects = await readFile(new URL("../out/_redirects", import.meta.url), "utf8");
      assert.ok(
        redirects.includes("/docs/react/components/dropdown /en/docs/react/components/menu 302"),
      );
    } else {
      await page.goto(`${base}/docs/react/components/dropdown`);
      await page.waitForURL("**/en/docs/react/components/menu");
      await page.getByRole("heading", { level: 1, name: "Menu", exact: true }).waitFor();
      await page.waitForFunction(() => !window.$_TSR);
    }
    assert.equal((await page.request.get(`${base}/en/docs/react/not-a-page`)).status(), 404);
    assert.equal((await page.request.get(`${base}/search/en.json`)).status(), 200);
    await page.waitForLoadState("networkidle");
    for (const locale of ["en", "cn"])
      assert.equal((await page.request.get(`${base}/${locale}/theme-builder`)).status(), 404);
    await page.goto(`${base}/en/docs/react/components/button`);
    await page.locator("[data-example-mounted]").first().waitFor({ state: "attached" });
    await page.setViewportSize({ width: 746, height: 795 });
    await page.getByRole("button", { name: "Browse documentation", exact: true }).click();
    await page.getByRole("dialog", { name: "Browse documentation", exact: true }).waitFor();
    const pageFilters = await page.evaluate(
      () =>
        [...document.querySelectorAll("body *")].filter((node) => {
          const style = getComputedStyle(node);
          if (style.backdropFilter === "none") return false;
          const box = node.getBoundingClientRect();
          return box.width >= innerWidth - 1 && box.height >= innerHeight - 1;
        }).length,
    );
    assert.equal(pageFilters, 0, "The navigation scrim must not blur the entire article");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Browse documentation", exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      true,
    );

    let hmr;
    if (name === "chromium" && process.env.DOCS_HMR === "1") {
      await page.setViewportSize({ width: 1280, height: 900 });
      const file = new URL("../src/demos/en/button/basic.tsx", import.meta.url);
      const original = await readFile(file, "utf8");
      try {
        const t = performance.now();
        await writeFile(
          file,
          original
            .replace(
              'import { Button } from "@lenso/ui";',
              'import { Button } from "@lenso/ui";\nimport * as stylex from "@stylexjs/stylex";\nconst probe=stylex.create({button:{backgroundColor:"#123456"}});',
            )
            .replace("Click me", "HMR verified")
            .replace("<Button onClick", "<Button xstyle={probe.button} onClick"),
        );
        await page.getByRole("button", { name: "HMR verified", exact: true }).waitFor();
        await page.waitForFunction(() => {
          const button = [...document.querySelectorAll("button")].find(
            (node) => node.textContent === "HMR verified",
          );
          return button && getComputedStyle(button).backgroundColor === "rgb(18, 52, 86)";
        });
        hmr = performance.now() - t;
      } finally {
        await writeFile(file, original);
      }

      // Recreating the provider implementation must not replace its shared Context.
      const providerFile = new URL(
        "../../../packages/docs/src/docs-design-theme.tsx",
        import.meta.url,
      );
      const providerSource = await readFile(providerFile, "utf8");
      try {
        await writeFile(
          providerFile,
          providerSource.replace(
            '<style data-lenso-docs-design-theme=""',
            '<style data-lenso-docs-design-theme="" data-provider-hmr-probe=""',
          ),
        );
        await page.locator("[data-provider-hmr-probe]").waitFor({ state: "attached" });
        await page.getByRole("button", { name: "Theme", exact: true }).click();
        const tint = page.getByRole("slider", { name: "Global glass appearance", exact: true });
        await tint.press("End");
        await page.waitForFunction(() =>
          [...document.querySelectorAll("[style]")].some(
            (node) => node.style.getPropertyValue("--lenso-glass-tint-amount") === "1",
          ),
        );
        await page.getByRole("button", { name: "Reset glass appearance", exact: true }).click();
        await page.keyboard.press("Escape");
      } finally {
        await writeFile(providerFile, providerSource);
        await page.locator("[data-provider-hmr-probe]").waitFor({ state: "detached" });
      }
    }
    await assertTabBarMotion(page, base);
    await assertSidebarMotion(page, base);
    assert.deepEqual(errors, [], `${name}: browser errors ${JSON.stringify(failed)}`);
    report.push({
      browser: name,
      firstReadyMs: Math.round(firstReady),
      navigationMs: Math.round(navigation),
      hmrMs: hmr && Math.round(hmr),
    });
  } finally {
    await browser.close();
  }
}

console.log(JSON.stringify(report, null, 2));
