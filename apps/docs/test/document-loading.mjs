import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    const modules = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.resourceType() === "script" && request.url().includes("/content/lenso/"))
        modules.push(request.url());
    });
    await page.addInitScript(() => {
      window.documentLoadingFrames = [];
      new MutationObserver(() => {
        if (
          [...document.querySelectorAll("output")].some((node) =>
            /Loading document/.test(node.textContent),
          )
        )
          window.documentLoadingFrames.push(performance.now());
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    await page.goto(`${base}/en`);
    await page.waitForFunction(() => document.querySelector("[data-home-showcase] [data-ready]"));
    assert.deepEqual(modules, [], `${name}: the homepage loaded unrelated document modules`);
    await page.route("**/content/lenso/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    await page.goto(`${base}/en/docs/react/components/tabs`);
    await page.locator('[data-component-story="Tabs"] [data-ready]').first().waitFor();
    assert.equal(modules.length, 1, `${name}: a document must load only its own MDX module`);
    for (const title of ["Accordion", "Tabs"]) {
      await page.getByRole("link", { name: title, exact: true }).first().click();
      await page.getByRole("heading", { name: title, exact: true }).waitFor();
      await page.locator(`[data-component-story="${title}"]`).waitFor();
    }
    await page.goBack();
    await page.getByRole("heading", { name: "Accordion", exact: true }).waitFor();
    assert.deepEqual(
      await page.evaluate(() => window.documentLoadingFrames),
      [],
      `${name}: a rendered article flashed back to Loading document`,
    );
    assert.deepEqual(errors, []);
    console.log(
      `${name}: lazy document loading, slow-module hydration, navigation and history passed`,
    );
  } finally {
    await browser.close();
  }
}
