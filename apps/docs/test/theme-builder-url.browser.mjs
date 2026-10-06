import assert from "node:assert/strict";

// One-time JSON hydration did not prove live URL ownership, native history,
// or header-only entry points across locales and responsive layouts.
export async function checkThemeBuilderURL(page, base) {
  for (const locale of ["en", "cn"]) {
    const name = locale === "cn" ? "主题" : "Theme";
    const editName = locale === "cn" ? "编辑主题" : "Edit Theme";
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/${locale}/docs/react/components/button`);
      const header = page.locator("#nd-notebook-layout header");
      const entry = header.getByRole("button", { name, exact: true });
      await entry.waitFor();
      assert.equal(await entry.count(), 1);
      assert.equal(
        await page
          .getByRole("navigation", { name: "Documentation sections", exact: true })
          .locator(`a[href="/${locale}/theme-builder"]`)
          .count(),
        0,
      );
      await entry.click();
      const dialog = page.getByRole("dialog", {
        name: locale === "cn" ? "选择主题" : "Choose theme",
        exact: true,
      });
      await dialog.waitFor();
      const edit = dialog.getByRole("link", { name: editName, exact: true });
      const url = new URL(await edit.getAttribute("href"), base);
      assert.equal(url.pathname, `/${locale}/theme-builder`);
      assert.deepEqual([...url.searchParams.keys()].sort(), ["chroma", "hue", "lightness"]);
      await edit.click();
      await page.waitForURL(url.href);
      await page.getByTestId("theme-builder").waitFor();
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/en/theme-builder?hue=100&private=not-for-sharing`);
  const scope = page.getByTestId("theme-builder");
  const accent = () =>
    scope.evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim());
  await page.waitForFunction(() =>
    document.querySelector("[data-testid=theme-builder]")?.hasAttribute("data-theme"),
  );
  const initial = await accent();
  const hue = page.getByRole("slider", { name: "Accent hue", exact: true });
  await hue.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByRole("button", { name: "Share theme", exact: true }).click();
  const shared = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(shared.searchParams.has("private"), false);
  assert.notEqual(shared.searchParams.get("hue"), "100");
  await page.waitForURL((url) => url.searchParams.get("hue") !== "100");
  const editedURL = page.url();
  const edited = await accent();
  assert.notEqual(edited, initial);
  assert.equal(shared.searchParams.get("hue"), new URL(editedURL).searchParams.get("hue"));
  await page.reload();
  await scope.waitFor();
  await page.waitForFunction(
    (expected) =>
      getComputedStyle(document.querySelector("[data-testid=theme-builder]"))
        .getPropertyValue("--accent")
        .trim() === expected,
    edited,
  );
  await page.goBack();
  await page.waitForURL((url) => url.searchParams.get("hue") === "100");
  assert.equal(await accent(), initial);
  await page.goForward();
  await page.waitForURL(editedURL);
  assert.equal(await accent(), edited);
  await page.getByRole("button", { name: "Reset theme", exact: true }).click();
  await page.waitForURL((url) => !url.searchParams.has("hue"));
  await page.goto(
    `${base}/en/theme-builder?hue=NaN&radius=extra-large&fontFamily=https://evil.test/font.css`,
  );
  await scope.waitFor();
  await page.getByRole("button", { name: "Choose Radius", exact: true }).waitFor();
  await page.getByRole("button", { name: "Share theme", exact: true }).click();
  const safe = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  assert.equal(safe.searchParams.has("fontFamily"), false);
  assert.equal(safe.searchParams.has("radius"), false);
  assert.equal(safe.searchParams.has("hue"), false);
}
