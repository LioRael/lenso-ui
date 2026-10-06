import assert from "node:assert/strict";

const themeKey = "lenso:docs:design-theme";
const vibrantKey = "lenso:docs:vibrant-palette";

// A direct header link did not prove global preset application, persistence,
// native picker focus or the deliberately partial upstream editor handoff.
export async function checkDocsThemePicker(page, base) {
  for (const locale of ["en", "cn"]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/${locale}/docs/react/components/button`);
    await page.evaluate(
      ({ themeKey, vibrantKey }) => {
        localStorage.removeItem(themeKey);
        localStorage.removeItem(vibrantKey);
      },
      { themeKey, vibrantKey },
    );
    await page.reload();
    const trigger = page
      .locator("#nd-subnav")
      .getByRole("button", { name: locale === "cn" ? "主题" : "Theme", exact: true });
    const dialog = page.getByRole("dialog", {
      name: locale === "cn" ? "选择主题" : "Choose theme",
      exact: true,
    });
    const mode = page.getByRole("group", { name: "Color theme", exact: true });
    await mode.getByRole("button", { name: "Light theme", exact: true }).click();
    const sample = page.locator('[data-example-name="button-basic"]').getByRole("button", {
      name: locale === "cn" ? "点我" : "Click me",
      exact: true,
    });
    await sample.waitFor();
    const color = () => sample.evaluate((node) => getComputedStyle(node).backgroundColor);
    const original = await color();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await dialog.waitFor();
    assert.equal((await dialog.boundingBox()).width, 248);
    assert.equal(await dialog.getByRole("option").count(), 11);
    await dialog.getByRole("option", { name: "Apply Sky theme", exact: true }).click();
    assert.equal(await dialog.isVisible(), true);
    await page.waitForFunction(() => document.documentElement.dataset.lensoDesignTheme === "sky");
    assert.notEqual(await color(), original);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), themeKey), "sky");
    const vibrant = dialog.getByRole("switch", {
      name: locale === "cn" ? "鲜艳色板" : "Vibrant palette",
      exact: true,
    });
    await vibrant.click();
    await page.waitForFunction(
      () => document.documentElement.dataset.lensoVibrantPalette === "true",
    );
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), vibrantKey), "true");
    const editor = dialog.getByRole("link", {
      name: locale === "cn" ? "编辑主题" : "Edit Theme",
      exact: true,
    });
    const href = new URL(await editor.getAttribute("href"), base);
    assert.equal(href.pathname, `/${locale}/theme-builder`);
    assert.deepEqual([...href.searchParams.keys()].sort(), ["chroma", "hue", "lightness"]);
    assert.equal(href.searchParams.get("hue"), "225");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (node) => node === document.activeElement,
      await trigger.elementHandle(),
    );
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.lensoDesignTheme === "sky");
    assert.ok((await trigger.textContent()).includes("Sky"));
    await mode.getByRole("button", { name: "Dark theme", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    assert.equal(await page.locator("html").getAttribute("data-lenso-design-theme"), "sky");
    await page.setViewportSize({ width: 390, height: 900 });
    await trigger.waitFor();
    assert.equal((await trigger.locator("img").boundingBox()).width, 20);
    await trigger.click();
    await dialog.waitFor();
    await dialog.getByRole("option", { name: "Apply Default theme", exact: true }).click();
    await vibrant.click();
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () =>
        !document.documentElement.hasAttribute("data-lenso-design-theme") &&
        !document.documentElement.hasAttribute("data-lenso-vibrant-palette"),
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await mode.getByRole("button", { name: "Light theme", exact: true }).click();
    assert.equal(await color(), original);
  }
  const restricted = await page.context().browser().newContext();
  try {
    await restricted.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new DOMException("Blocked", "SecurityError");
      };
      Storage.prototype.setItem = () => {
        throw new DOMException("Blocked", "SecurityError");
      };
    });
    const blocked = await restricted.newPage();
    const errors = [];
    blocked.on("pageerror", (error) => errors.push(error.message));
    await blocked.goto(`${base}/en/docs/react/components/button`);
    await blocked.locator("#nd-subnav").getByRole("button", { name: "Theme", exact: true }).click();
    await blocked.getByRole("option", { name: "Apply Lavender theme", exact: true }).click();
    await blocked.waitForFunction(
      () => document.documentElement.dataset.lensoDesignTheme === "lavender",
    );
    assert.deepEqual(errors, []);
  } finally {
    await restricted.close();
  }
}
