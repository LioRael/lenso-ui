import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const scripts = [];
    const errors = [];
    let releaseSources;
    const heldSources = new Promise((resolve) => {
      releaseSources = resolve;
    });
    await page.route("**/src/generated/documents/**.sources.ts*", async (route) => {
      await heldSources;
      await route.continue();
    });
    await page.addInitScript(() => {
      window.playgroundContinuity = { seen: false, lost: false };
      const frame = () => {
        const api = !!document.querySelector('[data-component-story="Tabs"]');
        if (window.playgroundContinuity.seen && !api) window.playgroundContinuity.lost = true;
        window.playgroundContinuity.seen ||= api;
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      Object.defineProperty(navigator, "clipboard", {
        value: {
          write: async (items) => {
            window.copiedMarkdown = await (await items[0].getType("text/plain")).text();
          },
        },
      });
    });
    page.on("request", (request) => {
      if (request.resourceType() === "script") scripts.push(request.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/en/docs/react/components/tabs");
    await page.locator('[data-component-story="Tabs"] [data-ready]').first().waitFor();
    await page.waitForLoadState("networkidle");
    assert.deepEqual(
      scripts.filter((url) =>
        /materials-preview|semantic-color-examples|docs-(?:settings|theme)-panel|page-markdown|tabs\.sources|\?raw|\/stories\/previews\/(?:input|search-field|slider|menu|glass|glass-magnifier)\.tsx/.test(
          url,
        ),
      ),
      [],
      "An ordinary first screen must not load specialized previews, closed appearance controls or source",
    );
    assert.equal(await page.locator("[data-example-mounted]").count(), 0);
    const playground = page.locator('[data-component-story="Tabs"]');
    await playground
      .locator("[data-story-preview]")
      .getByRole("tab", { name: "Activity", exact: true })
      .click();
    await playground
      .getByRole("log")
      .getByText(/value: activity/)
      .waitFor();
    await playground.getByRole("button", { name: "Clear", exact: true }).click();
    await playground
      .getByRole("log")
      .getByText("Waiting for an interaction…", { exact: true })
      .waitFor();

    assert.equal(await page.locator('[id="native-api-tabs"]').count(), 0);
    await page.getByRole("combobox", { name: "Preset", exact: true }).click();
    await page.getByRole("option", { name: "Vertical layout", exact: true }).click();
    await page.locator("[data-example-mounted]").waitFor({ state: "attached" });
    assert.equal(await page.locator("[data-example-mounted]").count(), 1);
    const story = page.locator('[data-component-story="Tabs"]');
    await story.getByRole("tab", { name: "Code", exact: true }).click();
    await story.getByRole("status").waitFor();
    assert.equal(await story.getByRole("button", { name: "Copy local example source" }).count(), 0);
    releaseSources();
    await story.locator("[data-highlighted]").waitFor();
    assert.ok(scripts.some((url) => /tabs\.sources/.test(url)));
    await story.getByRole("tab", { name: "Live preview", exact: true }).click();
    await story.locator("[data-story-preview]").waitFor();
    await page.getByRole("button", { name: "Copy Markdown", exact: true }).click();
    await page.waitForFunction(() => window.copiedMarkdown?.includes("<ComponentPlayground"));
    assert.ok(scripts.some((url) => url.includes("page-markdown")));
    assert.ok(!(await page.evaluate(() => window.copiedMarkdown)).includes("## API Reference"));
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const desktopSettings = page.getByRole("dialog", { name: "Settings", exact: true });
    const categories = desktopSettings.getByRole("navigation", { name: "Settings categories" });
    const appearance = categories.getByRole("button", { name: "Appearance" });
    await appearance.waitFor();
    assert.equal(await appearance.getAttribute("aria-current"), "true");
    await page.emulateMedia({ colorScheme: "light" });
    const automatic = desktopSettings.getByRole("switch", { name: "Automatic" });
    const light = desktopSettings.getByRole("radio", { name: "Light", exact: true });
    const dark = desktopSettings.getByRole("radio", { name: "Dark", exact: true });
    await desktopSettings.getByRole("switch", { name: "Automatic", checked: true }).waitFor();
    await dark.click();
    await desktopSettings.getByRole("switch", { name: "Automatic", checked: false }).waitFor();
    assert.equal(await dark.getAttribute("aria-checked"), "true");
    await automatic.click();
    await desktopSettings.getByRole("radio", { name: "Light", checked: true }).waitFor();
    await automatic.click();
    assert.equal(await light.getAttribute("aria-checked"), "true");
    await automatic.click();

    const glassRow = desktopSettings.getByRole("button", { name: /^Glass appearance/ });
    const glassSlider = desktopSettings.getByRole("slider", { name: "Glass appearance" });
    const glassPreview = desktopSettings.getByRole("figure", { name: "Live glass preview" });
    assert.equal(await glassSlider.count(), 0);
    assert.equal(await glassPreview.count(), 0);
    await glassRow.press("Enter");
    await glassSlider.waitFor();
    await glassPreview.waitFor({ timeout: 3000 });
    const back = desktopSettings.getByRole("button", { name: "Back to Appearance" });
    assert.equal(await back.evaluate((button) => button === document.activeElement), true);
    await glassSlider.press("End");
    await back.press("Enter");
    await desktopSettings.getByRole("button", { name: "Glass appearance More tinted" }).waitFor();
    assert.equal(await glassRow.evaluate((button) => button === document.activeElement), true);
    assert.equal(await glassPreview.count(), 0);

    const theme = categories.getByRole("button", { name: "Theme" });
    await theme.press("Space");
    await desktopSettings.getByRole("listbox", { name: "Theme presets" }).waitFor();
    assert.equal(await theme.getAttribute("aria-current"), "true");
    assert.equal(await appearance.getAttribute("aria-current"), null);
    await desktopSettings
      .getByRole("radiogroup", { name: "Color theme" })
      .waitFor({ state: "hidden" });
    await page.keyboard.press("Escape");
    assert.deepEqual(await page.evaluate(() => window.playgroundContinuity), {
      seen: true,
      lost: false,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/en/docs/react/getting-started`, { waitUntil: "networkidle" });
    const settings = page.getByRole("button", { name: "Settings", exact: true });
    const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
    await settings.press("Enter");
    await dialog.getByRole("radio", { name: "Auto", checked: true }).waitFor();
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(await settings.evaluate((button) => button === document.activeElement), true);

    await settings.click();
    const chinese = dialog.getByRole("link", { name: "中文", exact: true });
    assert.equal(await chinese.getAttribute("href"), "/cn/docs/react/getting-started");
    await chinese.click();
    await page.waitForURL("**/cn/docs/react/getting-started");
    await page.getByRole("dialog", { name: "设置", exact: true }).waitFor({ state: "hidden" });
    assert.deepEqual(errors, []);
    console.log(`${name}: compact content, lazy playground scenarios and first-use source passed`);
  } finally {
    await browser.close();
  }
}
