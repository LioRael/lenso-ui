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
        /materials-preview|semantic-color-examples|docs-theme-panel|page-markdown|tabs\.sources|\?raw|\/stories\/previews\/(?:input|search-field|slider|menu|glass|glass-magnifier)\.tsx/.test(
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
    await page.getByRole("button", { name: "Theme", exact: true }).first().click();
    await page.getByRole("listbox", { name: "Theme presets" }).waitFor();
    await page.keyboard.press("Escape");
    assert.deepEqual(await page.evaluate(() => window.playgroundContinuity), {
      seen: true,
      lost: false,
    });
    assert.deepEqual(errors, []);
    console.log(`${name}: compact content, lazy playground scenarios and first-use source passed`);
  } finally {
    await browser.close();
  }
}
