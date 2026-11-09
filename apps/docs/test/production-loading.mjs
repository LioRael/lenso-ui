import assert from "node:assert/strict";
import { startStaticServer } from "./static-server.mjs";
import { chromium, webkit } from "playwright";

const server = await startStaticServer();
const { base } = server;

try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      for (const [route, budget, byteBudget, gzipBudget] of [
        ["/en", 85, 1_250_000, 430_000],
        ["/en/docs/react/components/tabs", 125, 2_100_000, 580_000],
      ]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = [];
        const scripts = [];
        let collecting = true;
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (
            /Hydration failed|hydration mismatch|A tree hydrated|Minified React error #(?:418|423|425)/i.test(
              message.text(),
            )
          )
            errors.push(message.text());
        });
        page.on("response", (response) => {
          if (collecting && response.request().resourceType() === "script")
            scripts.push(
              Promise.all([response.body(), response.headerValue("content-length")]).then(
                ([body, length]) => ({
                  url: response.url(),
                  code: body.toString(),
                  bytes: body.length,
                  gzip: Number(length),
                }),
              ),
            );
        });
        const documentResponse = await page.goto(base + route);
        if (route.includes("/docs/")) {
          assert.ok(
            (await documentResponse.body()).length <= 2_300_000,
            "Raw Markdown must not return to initial document data",
          );
          assert.ok(
            Number(await documentResponse.headerValue("content-length")) <= 125_000,
            "The document exceeds its gzip HTML budget",
          );
        }
        await page.waitForFunction(() => document.querySelector("[data-ready]"));
        await page.waitForLoadState("networkidle");
        collecting = false;
        const loaded = await Promise.all(scripts);
        const decoded = loaded.reduce((n, s) => n + s.bytes, 0);
        const gzip = loaded.reduce((n, s) => n + s.gzip, 0);
        console.log(
          `${name} ${route}: ${loaded.length} scripts, ${decoded} decoded JS bytes, ${gzip} gzip JS bytes`,
        );
        assert.ok(loaded.length <= budget, `${route} exceeds its ${budget}-script budget`);
        assert.ok(decoded <= byteBudget, `${route} exceeds its decoded-JavaScript budget`);
        assert.ok(gzip <= gzipBudget, `${route} exceeds its compressed-JavaScript budget`);
        assert.deepEqual(
          loaded.filter((script) =>
            /\/search-dialog-|\/wasm-inlined-|\/typescript-|\/(?:docs-theme-panel|story-source|page-markdown)-/.test(
              script.url,
            ),
          ),
          [],
          "Closed search, appearance controls, source and Markdown must load on use",
        );
        if (route === "/en") {
          assert.ok(
            !loaded.some(
              (script) =>
                script.code.includes("content/lenso/") ||
                script.code.includes("en/react/components/tabs.mdx"),
            ),
            "The homepage must not download the document index or MDX registry",
          );
          const forest = page.getByRole("tab", { name: "Forest", exact: true });
          await forest.click();
          await page.waitForFunction(() =>
            [...document.querySelectorAll('[role="tab"]')].some(
              (tab) => tab.textContent === "Forest" && tab.getAttribute("aria-selected") === "true",
            ),
          );
          await page.getByRole("link", { name: "Browse components", exact: true }).click();
          await page.getByRole("heading", { name: "Components", exact: true }).waitFor();
        } else {
          await page.getByRole("tab", { name: "Code", exact: true }).first().click();
          await page.locator('[data-component-story="Tabs"] [data-highlighted]').waitFor();
        }
        const trigger = page.locator("[data-docs-search-trigger]:visible").first();
        await trigger.click();
        const panel = page.locator("[data-docs-search]");
        await panel.getByRole("combobox").fill("button");
        await panel.locator("[data-docs-result]").first().waitFor();
        await page.keyboard.press("Escape");
        await panel.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((node) => document.activeElement === node));
        assert.deepEqual(errors, []);
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
