import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { checkThemeBuilderControls } from "./theme-builder-controls.browser.mjs";
import { checkThemeBuilderURL } from "./theme-builder-url.browser.mjs";
import { checkThemeBuilderExamples } from "./theme-builder-examples.browser.mjs";
import { checkDocsThemePicker } from "./docs-theme-picker.browser.mjs";

const require = createRequire(import.meta.url);

// Palette unit tests cannot prove the full-screen builder geometry, native
// control wiring, scoped portals, history/share round trips or mobile sheet.
export async function checkThemeBuilder(page, base) {
  const chooseJSON = async () => {
    await page.getByRole("combobox", { name: "Export format", exact: true }).click();
    await page.getByRole("option", { name: "JSON", exact: true }).click();
  };
  for (const locale of ["en", "cn"]) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/${locale}/theme-builder`, { waitUntil: "domcontentloaded" });
    const scope = page.getByTestId("theme-builder");
    await page.waitForFunction(() =>
      document.querySelector("[data-testid=theme-builder]")?.hasAttribute("data-theme"),
    );
    const getVar = (name) =>
      scope.evaluate((node, key) => getComputedStyle(node).getPropertyValue(key).trim(), name);
    const originalAccent = await getVar("--accent");
    const originalBackground = await getVar("--background");
    assert.equal(await page.locator("#nd-sidebar").count(), 0);
    const geometry = await Promise.all(
      ["banner", "main", "contentinfo"].map((role) =>
        scope.getByRole(role).evaluate((node) => node.getBoundingClientRect().toJSON()),
      ),
    );
    assert.equal(geometry[0].height, 56);
    assert.equal(geometry[1].x, 24);
    assert.equal(geometry[2].width, 1072);
    assert.equal(geometry[2].bottom, 1000);
    assert.ok(
      geometry[1].height > 750,
      "The preview must fill the viewport, not sit in a docs article.",
    );
    assert.equal(
      await page
        .getByRole("tab", { name: "Components", exact: true })
        .getAttribute("aria-selected"),
      "true",
    );
    for (const label of [
      "Choose Font Family",
      "Choose Radius",
      "Choose Radius Form",
      "Choose Theme",
    ]) {
      assert.equal(await page.getByRole("button", { name: label, exact: true }).isVisible(), true);
    }
    const icons = await page
      .locator("header button:visible svg")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
    assert.ok(
      icons.every((width) => width >= 12),
      "Compact native buttons must not shrink their icons through inherited padding.",
    );

    const hue = page.getByRole("slider", { name: "Accent hue", exact: true });
    await hue.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(
      (before) =>
        getComputedStyle(document.querySelector("[data-testid=theme-builder]"))
          .getPropertyValue("--accent")
          .trim() !== before,
      originalAccent,
    );
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    assert.equal(await getVar("--accent"), originalAccent);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    assert.notEqual(await getVar("--accent"), originalAccent);
    await page.getByRole("button", { name: "Reset theme", exact: true }).click();

    const presetTrigger = page.getByRole("button", { name: "Choose Theme", exact: true });
    await presetTrigger.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => {
      const images = [...document.querySelectorAll('img[src^="/theme-presets/"]')];
      return (
        images.length === 11 && images.every((image) => image.complete && image.naturalWidth > 0)
      );
    });
    await page.getByRole("option", { name: "Apply Sky theme", exact: true }).click();
    assert.notEqual(await getVar("--accent"), originalAccent);
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      (node) => node === document.activeElement,
      await presetTrigger.elementHandle(),
    );
    await page.getByRole("button", { name: "Choose Radius", exact: true }).click();
    await page.getByRole("option", { name: "Radius large", exact: true }).click();
    assert.equal(await getVar("--radius"), "0.75rem");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Choose Radius Form", exact: true }).click();
    await page.getByRole("option", { name: "Radius Form small", exact: true }).click();
    assert.equal(await getVar("--field-radius"), "0.25rem");
    await page.keyboard.press("Escape");
    const fontTrigger = page.getByRole("button", { name: "Choose Font Family", exact: true });
    await fontTrigger.click();
    await page.getByRole("option", { name: "Geist", exact: true }).click();
    await page.keyboard.press("Escape");
    assert.ok((await getVar("--font-geist")).includes('"Geist"'));
    assert.ok(
      (await scope.evaluate((node) => getComputedStyle(node).fontFamily)).includes("Geist"),
    );

    await page.getByRole("button", { name: "Pick accent color", exact: true }).click();
    const picker = page.getByRole("dialog", { name: "Accent color", exact: true });
    await picker.waitFor();
    assert.equal(
      await picker.evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim()),
      await getVar("--accent"),
    );
    await page.keyboard.press("Escape");
    await picker.waitFor({ state: "hidden" });

    const select = page.getByRole("combobox", { name: "State", exact: true });
    await select.click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    assert.equal(
      await listbox.evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim()),
      await getVar("--accent"),
    );
    await page.getByRole("option", { name: "Florida", exact: true }).click();
    assert.ok((await select.innerText()).includes("Florida"));
    await page.getByRole("button", { name: "Dark theme", exact: true }).click();
    assert.notEqual(await getVar("--background"), originalBackground);
    await page.getByRole("button", { name: "Light theme", exact: true }).click();

    await page.getByRole("button", { name: "View code", exact: true }).click();
    const code = page.getByRole("textbox", {
      name: "Theme code",
      exact: true,
      includeHidden: true,
    });
    assert.match(await code.inputValue(), /--font-geist:/);
    assert.match(await code.inputValue(), /@import url\("https:\/\/fonts.googleapis.com/);
    await page.getByRole("button", { name: "Copy code", exact: true }).click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await code.inputValue(),
    );
    await page.getByText("Export options", { exact: true }).click();
    await chooseJSON();
    const exported = await code.inputValue();
    const saved = JSON.parse(exported);
    assert.equal(saved.radius, "large");
    assert.equal(saved.formRadius, "small");
    assert.equal(saved.fontFamily, "geist");
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download code", exact: true }).click();
    assert.equal((await downloaded).suggestedFilename(), "theme.json");
    await page.getByRole("button", { name: "Close code panel", exact: true }).click();
    await page.getByRole("button", { name: "Reset theme", exact: true }).click();
    await presetTrigger.click();
    await page.getByRole("switch", { name: "Vibrant palette", exact: true }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "View code", exact: true }).click();
    await page.getByText("Export options", { exact: true }).click();
    await chooseJSON();
    await page.getByLabel("Import builder JSON", { exact: true }).setInputFiles({
      name: "theme.json",
      mimeType: "application/json",
      buffer: Buffer.from(exported),
    });
    await page.getByText("Theme imported.", { exact: true }).waitFor();
    assert.deepEqual(JSON.parse(await code.inputValue()), saved);
    await page.getByLabel("Import builder JSON", { exact: true }).setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"hue":"red"}'),
    });
    await page
      .getByText("Import failed. Choose a valid builder JSON file (up to 64 KB).", { exact: true })
      .waitFor();
    assert.deepEqual(JSON.parse(await code.inputValue()), saved);
    await page.getByRole("button", { name: "Close code panel", exact: true }).click();
    await page.getByRole("button", { name: "Lock Accent", exact: true }).click();
    await page.getByRole("button", { name: "Shuffle theme", exact: true }).click();
    await page.getByRole("button", { name: "View code", exact: true }).click();
    await page.getByText("Export options", { exact: true }).click();
    await chooseJSON();
    assert.equal(JSON.parse(await code.inputValue()).hue, saved.hue);
    const sharedSettings = JSON.parse(await code.inputValue());
    await page.getByRole("button", { name: "Close code panel", exact: true }).click();
    await page.getByRole("button", { name: "Share theme", exact: true }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    const sharedURL = new URL(shared);
    assert.equal(sharedURL.searchParams.has("theme"), false);
    await page.goto(shared, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "View code", exact: true }).click();
    await page.getByText("Export options", { exact: true }).click();
    await chooseJSON();
    assert.deepEqual(JSON.parse(await code.inputValue()), sharedSettings);
    await page.getByRole("button", { name: "Close code panel", exact: true }).click();

    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const accessibility = await page.evaluate(async () =>
      window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        rules: { "color-contrast": { enabled: false } },
      }),
    );
    assert.deepEqual(
      accessibility.violations.map((violation) => violation.id),
      [],
    );
    for (const width of [1440, 1200, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      for (const direction of ["ltr", "rtl"]) {
        await page.evaluate((dir) => {
          document.documentElement.dir = dir;
        }, direction);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
          ),
          `${locale}/${width}/${direction} overflows`,
        );
      }
    }
    await page.evaluate(() => {
      document.documentElement.dir = "ltr";
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobilePreview = page
      .getByRole("tabpanel", { name: "Components", exact: true })
      .locator(":scope > div");
    await mobilePreview.evaluate((node) => {
      node.scrollTop = 0;
    });
    const previewBounds = await mobilePreview.boundingBox();
    const verifyBounds = await page.getByText("Verify account", { exact: true }).boundingBox();
    assert.ok(
      verifyBounds.y >= previewBounds.y && verifyBounds.y < previewBounds.y + previewBounds.height,
      "A tall one-column mosaic must start at its first card, not be centered above the scroll origin.",
    );
    const sheetTrigger = page.getByRole("button", { name: "Theme settings", exact: true });
    await sheetTrigger.click();
    const sheet = page.getByRole("dialog", { name: "Theme settings", exact: true });
    await sheet.waitFor();
    assert.equal(
      await sheet.getByRole("listbox", { name: "Theme presets", exact: true }).count(),
      1,
    );
    const sheetRect = await sheet.boundingBox();
    assert.equal(sheetRect.height, 320);
    assert.equal(sheetRect.y + sheetRect.height, 844);
    assert.equal(sheetRect.width, 390);
    const presetRects = await sheet
      .getByRole("option")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    assert.equal(presetRects[0].width, 52);
    assert.ok(
      presetRects[1].x > presetRects[0].right && presetRects[2].right < 390,
      "The mobile sheet must show a compact strip, not one viewport-wide option.",
    );
    assert.ok(
      await sheet.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
      "Only the inner preset/type rows may scroll horizontally.",
    );
    await page.keyboard.press("Escape");
    await sheet.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (node) => node === document.activeElement,
      await sheetTrigger.elementHandle(),
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("button", { name: "Reset theme", exact: true }).click();
    assert.equal(await getVar("--accent"), originalAccent);
  }
  await checkThemeBuilderControls(page, base);
  await checkThemeBuilderURL(page, base);
  await checkThemeBuilderExamples(page, base);
  await checkDocsThemePicker(page, base);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await checkThemeBuilder(page, process.env["LENSO_DOCS_TEST_URL"] ?? "http://127.0.0.1:3000");
    assert.deepEqual(errors, []);
    console.log(
      "Theme builder: viewport geometry, controls/presets, history, share/import/export, portal keyboard/focus, responsive RTL, mobile sheet and local examples passed in both locales.",
    );
  } finally {
    await browser.close();
  }
}
