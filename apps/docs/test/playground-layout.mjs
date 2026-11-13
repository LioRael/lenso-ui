import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const locale of ["en", "cn"]) {
      const cn = locale === "cn";
      await page.goto(`${base}/${locale}/docs/react/components/button`);
      await page.waitForLoadState("networkidle");
      assert.equal(await page.locator("[data-docs-page-rail], #nd-toc").count(), 0);
      const preset = page.getByRole("combobox", { name: cn ? "场景" : "Preset", exact: true });
      await preset.click();
      assert.equal(await page.getByRole("option").count(), 9);
      await page.keyboard.press("Escape");
      for (const width of [1440, 1920, 2560]) {
        await page.setViewportSize({ width, height: 1080 });
        assert.equal(await preset.isVisible(), true);
        const main = await page.locator("#main-content").boundingBox();
        const shell = await page.locator("#main-content").evaluate((node) => {
          let parent = node.parentElement;
          while (parent && getComputedStyle(parent).display !== "grid")
            parent = parent.parentElement;
          return parent.getBoundingClientRect().toJSON();
        });
        assert.ok(
          Math.abs(main.x + main.width - shell.right) < 2,
          "Component content must consume the former TOC column",
        );
        const preview = await page.locator("[data-story-preview]").boundingBox();
        const controls = await page
          .getByRole("region", { name: cn ? "组件参数" : "Component arguments" })
          .boundingBox();
        assert.ok(controls.width >= 320, `Argument panel too narrow: ${controls.width}`);
        assert.ok(
          preview.height >= 350 && preview.height < 440,
          `Preview height: ${preview.height}`,
        );
        assert.ok(
          preview.height < controls.height,
          "Preview must not stretch to the argument panel",
        );
        assert.ok(await page.locator("#nd-page").evaluate((node) => node.clientWidth <= 1180));
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
      }
      await preset.focus();
      await page.keyboard.press("Enter");
      await page.getByRole("option", { name: "With icon", exact: true }).click();
      assert.match(await preset.innerText(), /With icon/);
      const action = page
        .locator("[data-story-preview]")
        .getByRole("button", { name: "Add member", exact: true });
      await action.click();
      await page
        .getByRole("log")
        .getByText(/Add member/)
        .waitFor();
      for (const width of [1024, 390]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await preset.isVisible(), true);
        assert.match(await preset.innerText(), /With icon/);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
      }
      await preset.click();
      await page.getByRole("option", { name: "Prominent", exact: true }).click();
      await page.setViewportSize({ width: 1920, height: 1080 });
      assert.match(await preset.innerText(), /Prominent/);
      await page.goto(`${base}/${locale}/docs/react/components/menu`);
      await page.locator("[data-example-mounted]").waitFor({ state: "attached" });
      const menuPreset = page.getByRole("combobox", { name: cn ? "场景" : "Preset", exact: true });
      assert.match(await menuPreset.innerText(), cn ? /完整示例/ : /Complete example/);
      await menuPreset.click();
      assert.equal(await page.getByRole("option").count(), 17);
      await page.keyboard.press("Escape");
    }
    await page.emulateMedia({ colorScheme: "dark" });
    for (const component of ["button", "tabs"]) {
      await page.goto(`${base}/en/docs/react/components/${component}`);
      await page.waitForLoadState("networkidle");
      const consolePanel = page.getByRole("region", { name: "Console", exact: true });
      await consolePanel.waitFor();
      const surface = await consolePanel.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          background: style.backgroundColor,
          page: getComputedStyle(document.body).backgroundColor,
          border: style.borderTopWidth,
        };
      });
      assert.notEqual(
        surface.background,
        surface.page,
        `${component}: Console must stand apart from the page in dark mode`,
      );
      assert.equal(surface.border, "1px");
    }
    await page.goto(`${base}/en/docs/react/getting-started/installation`);
    await page
      .locator("#nd-toc")
      .getByRole("link", { name: "Requirements", exact: true })
      .waitFor();
    assert.equal(await page.locator("[data-docs-page-rail]").count(), 0);
    assert.ok(await page.locator("#nd-page").evaluate((node) => node.clientWidth <= 800));
    assert.deepEqual(errors, []);
    console.log(
      `${name}: no empty TOC column, compact preview, inline scene selection, Menu demo and guide TOC passed`,
    );
  } finally {
    await browser.close();
  }
}
