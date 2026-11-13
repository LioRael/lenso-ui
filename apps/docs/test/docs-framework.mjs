import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4329";
const reference = process.env.REFERENCE_DOCS_URL;
for (const [name, engine, options] of [
  [
    "chromium",
    chromium,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : process.env.PLAYWRIGHT_CHROMIUM_CHANNEL
        ? { channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL }
        : {},
  ],
  [
    "webkit",
    webkit,
    process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH }
      : {},
  ],
]) {
  const browser = await engine.launch(options);
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.getByRole("heading", { name: "Welcome", exact: true }).waitFor();
    await page
      .locator('[aria-label="Color theme"] [role="tab"][aria-selected="true"]:visible')
      .first()
      .waitFor();
    // Article geometry alone does not establish header controls or MDX tab parity.
    assert.equal(await page.locator('[aria-label="Documentation sections"]').count(), 0);
    assert.equal(await page.locator("#nd-subnav").getByText("Web", { exact: true }).count(), 0);
    assert.equal(
      await page.locator("[data-docs-search-trigger]:visible").first().getAttribute("data-glass"),
      "true",
    );
    assert.equal(
      await page.getByRole("link", { name: /on GitHub/ }).getAttribute("data-glass"),
      "true",
    );
    await page.getByRole("button", { name: "Theme", exact: true }).click();
    await page.getByRole("slider", { name: "Glass appearance", exact: true }).waitFor();
    await page.getByRole("button", { name: "Reset glass appearance", exact: true }).click();
    await page.getByRole("option", { name: "Apply Sky theme", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.dataset.lensoDesignTheme === "sky");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Theme", exact: true }).click();
    await page.getByRole("option", { name: "Apply Default theme", exact: true }).click();
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute("data-lenso-design-theme"),
    );
    await page.keyboard.press("Escape");
    await page.getByRole("tab", { name: "Dark theme", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    const token = page.locator('pre span[style*="--shiki-light"]').first();
    const dark = await token.evaluate((element) => getComputedStyle(element).color);
    await page.getByRole("tab", { name: "Light theme", exact: true }).click();
    await page.waitForFunction(() => !document.documentElement.classList.contains("dark"));
    assert.notEqual(await token.evaluate((element) => getComputedStyle(element).color), dark);
    await page.getByRole("tab", { name: "MDX", exact: true }).click();
    assert.equal(
      await page.getByRole("tab", { name: "MDX", exact: true }).getAttribute("data-lenso-slot"),
      "tabs-tab",
    );
    assert.equal(
      await page
        .getByRole("tablist", { name: "Code examples" })
        .locator('[data-lenso-slot="tabs-indicator"]')
        .count(),
      1,
    );
    assert.equal(
      await page.getByRole("tabpanel", { name: "MDX", exact: true }).innerText(),
      "Use MDX when a page needs a component.",
    );
    if (process.env.DOCS_HMR_FILE) {
      const file = process.env.DOCS_HMR_FILE;
      const original = await readFile(file, "utf8");
      try {
        await writeFile(file, original + "\nLive browser HMR marker.\n");
        await page
          .getByText("Live browser HMR marker.", { exact: true })
          .waitFor({ timeout: 20000 });
      } finally {
        await writeFile(file, original);
      }
      await page
        .getByText("Live browser HMR marker.", { exact: true })
        .waitFor({ state: "hidden", timeout: 20000 });
    }

    await page.locator("[data-docs-search-trigger]:visible").first().focus();
    await page.locator("[data-docs-search-trigger]:visible").first().click();
    const dialog = page.getByRole("dialog", { name: "Search documentation" });
    await dialog.getByRole("combobox").fill("Counter");
    const result = dialog.getByRole("option").filter({ hasText: "Counter" }).first();
    await result.waitFor();
    await result.click();
    await page.getByRole("heading", { name: "Counter", exact: true }).waitFor();
    await page.getByRole("button", { name: "Count: 0", exact: true }).click();
    await page.getByRole("button", { name: "Count: 1", exact: true }).waitFor();
    await page.locator("[data-docs-search-trigger]:visible").first().focus();
    await page.locator("[data-docs-search-trigger]:visible").first().click();
    await dialog.getByRole("combobox").waitFor();
    await page.keyboard.press("Escape");
    await dialog.getByRole("combobox").waitFor({ state: "hidden" });
    await page.waitForFunction(() => document.activeElement?.matches("[data-docs-search-trigger]"));
    const metrics = async (target) =>
      target.locator("#nd-page h1").evaluate((element) => {
        const style = getComputedStyle(element);
        const article = document.querySelector("#nd-page").getBoundingClientRect();
        return {
          font: style.fontFamily,
          size: style.fontSize,
          weight: style.fontWeight,
          lineHeight: style.lineHeight,
          top: Math.round(article.top),
          headerHeight: Math.round(
            document.querySelector("#nd-subnav").getBoundingClientRect().height,
          ),
          left: Math.round(article.left),
          width: Math.round(article.width),
        };
      });
    if (reference) {
      const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await product.goto(`${reference}/en/docs/react/components/button`);
      await product.locator("#nd-page h1").waitFor();
      assert.deepEqual(
        await metrics(page),
        await metrics(product),
        `${name}: article geometry and typography must match the product docs`,
      );
      await product.close();
    }
    for (const theme of ["light", "dark"]) {
      await page
        .getByRole("tab", { name: `${theme === "light" ? "Light" : "Dark"} theme`, exact: true })
        .click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole("button", { name: "Browse documentation", exact: true }).click();
      const drawer = page.getByRole("dialog");
      const panel = await drawer.evaluate((node) => ({
        background: getComputedStyle(node).backgroundColor,
        opacity: getComputedStyle(node).opacity,
        rect: node.getBoundingClientRect().toJSON(),
      }));
      assert.notEqual(
        panel.background,
        "rgba(0, 0, 0, 0)",
        `${name}: mobile navigation needs its own surface`,
      );
      assert.equal(await page.locator('[data-lenso-slot="modal-backdrop"]').count(), 1);
      const title = await drawer.getByText("Browse documentation", { exact: true }).boundingBox();
      assert.ok(
        title && title.width <= 1 && title.height <= 1,
        `${name}: dialog title must stay visually hidden`,
      );
      assert.ok(panel.rect.width <= 390 && panel.rect.width >= 350);
      assert.ok(panel.rect.height > 700 && panel.rect.height <= 844);
      await page.getByRole("dialog").getByRole("link", { name: "Welcome", exact: true }).click();
      await page.getByRole("heading", { name: "Welcome", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        `${name}: no mobile overflow in ${theme}`,
      );
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    const staticPage = await browser.newPage({ javaScriptEnabled: false });
    await staticPage.goto(base);
    assert.equal(
      await staticPage.getByRole("heading", { name: "Welcome", exact: true }).isVisible(),
      true,
    );
    await staticPage.close();
    assert.deepEqual(errors, []);
    console.log(
      `${name}: themes, code colors, tabs, search, focus, counter, mobile navigation and no-JS article passed${reference ? "; product article geometry and typography match" : ""}`,
    );
    await page.close();
  } finally {
    await browser.close();
  }
}
