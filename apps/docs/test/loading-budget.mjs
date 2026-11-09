import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const [route, budget, byteBudget] of [
      ["/en", 500, 16_000_000],
      ["/en/docs/react/components/tabs", 650, 22_000_000],
    ]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const scripts = [];
      const bodies = [];
      const errors = [];
      let collecting = true;
      page.on("request", (request) => {
        if (collecting && request.resourceType() === "script") scripts.push(request.url());
      });
      page.on("response", (response) => {
        if (collecting && response.request().resourceType() === "script")
          bodies.push(response.body().then((body) => body.length));
      });
      page.on("pageerror", (error) => errors.push(error.message));
      const start = performance.now();
      await page.goto(`${base}${route}`);
      await page.waitForFunction(() => document.querySelector("[data-ready]"));
      await page.waitForLoadState("networkidle");
      const ready = Math.round(performance.now() - start);
      collecting = false;
      assert.ok(
        scripts.length <= budget,
        `${name} ${route}: ${scripts.length} scripts exceeds ${budget}`,
      );
      assert.deepEqual(
        scripts.filter((url) =>
          /\/packages\/ui\/src\/components\/(calendar|color-|date-|time-)/.test(url),
        ),
        [],
        "An ordinary page must not load unrelated date or color controls",
      );
      assert.deepEqual(
        scripts.filter((url) =>
          /\/zbsearch\/|\/packages\/docs\/(src|dist\/framework)\/search-dialog/.test(url),
        ),
        [],
        "Closed search must not download its dialog or search engine",
      );
      assert.deepEqual(
        scripts.filter((url) => /engine-oniguruma|\/langs\/dist\//.test(url)),
        [],
        "Offscreen source must not load the browser highlighter",
      );
      const bytes = (await Promise.all(bodies)).reduce((a, b) => a + b, 0);
      assert.ok(
        bytes <= byteBudget,
        `${name} ${route}: ${bytes} decoded JS bytes exceeds ${byteBudget}`,
      );
      console.log(
        `${name} ${route}: ${scripts.length} scripts, ${bytes} decoded JS bytes, ${ready}ms including network idle`,
      );
      const trigger = page.locator("[data-docs-search-trigger]:visible").first();
      await trigger.click();
      const panel = page.locator("[data-docs-search]");
      await panel.getByRole("combobox").fill("button");
      await panel.locator("[data-docs-result]").first().waitFor();
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
      assert.ok(await trigger.evaluate((node) => document.activeElement === node));
      if (route.includes("/docs/")) {
        await page.getByRole("tab", { name: "Code", exact: true }).first().click();
        await page.locator('[data-component-story="Tabs"] [data-highlighted]').waitFor();
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
