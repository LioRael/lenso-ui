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
      window.apiContinuity = { seen: false, lost: false };
      const frame = () => {
        const api = !!document.getElementById("native-api-tabs");
        if (window.apiContinuity.seen && !api) window.apiContinuity.lost = true;
        window.apiContinuity.seen ||= api;
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
    await page
      .getByRole("heading", { name: "API Reference", exact: true })
      .scrollIntoViewIfNeeded();
    const summary = page.locator("summary").filter({ hasText: "Composition and actions (5)" });
    await summary.click();
    const example = page.locator('[data-example-name="tabs-vertical"]');
    await example.scrollIntoViewIfNeeded();
    await example.locator("[data-example-mounted]").waitFor({ state: "attached" });
    assert.equal(
      await page.locator('[data-example-name="tabs-disabled"] [data-example-mounted]').count(),
      0,
    );
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
    await page.waitForFunction(() => window.copiedMarkdown?.includes("## API Reference"));
    assert.ok(scripts.some((url) => url.includes("page-markdown")));
    await page.getByRole("button", { name: "Theme", exact: true }).first().click();
    await page.getByRole("listbox", { name: "Theme presets" }).waitFor();
    await page.keyboard.press("Escape");
    assert.deepEqual(await page.evaluate(() => window.apiContinuity), { seen: true, lost: false });
    assert.deepEqual(errors, []);
    console.log(
      `${name}: preserved API, closed examples, visible demos and first-use source passed`,
    );
  } finally {
    await browser.close();
  }
}
