import assert from "node:assert/strict";
import { chromium, webkit, devices } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const server = await startStaticServer();
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ ...devices["iPhone 13"] });
      try {
        const requests = [];
        page.on("request", (request) => requests.push(new URL(request.url()).pathname));
        // Text-only search must not need the optional Markdown result renderer.
        await page.route("**/parse-*.js", (route) => route.abort());
        await page.goto(`${server.base}/en/docs/react/components/tabs/`);
        await page.waitForLoadState("networkidle");
        assert.ok(!requests.some((url) => /\/search-dialog-|\/search\/en\.json/.test(url)));
        await page.locator("[data-docs-search-trigger]:visible").first().tap();
        const panel = page.locator("[data-docs-search]");
        const input = panel.getByRole("combobox");
        await input.fill("button");
        await panel.locator("[data-docs-result]", { hasText: "ButtonGroup" }).first().waitFor({
          timeout: 3000,
        });
        await input.fill("qxjvzpkwnrfy");
        await page.getByText("No matching pages.", { exact: true }).waitFor();
        await input.fill("button");
        await input.fill("tabs");
        await panel.getByRole("option", { name: /Tabs/ }).first().waitFor();
        assert.equal(await input.inputValue(), "tabs");
        assert.equal(requests.filter((url) => url === "/search/en.json").length, 1);
        await page.keyboard.press("Escape");
        await panel.waitFor({ state: "hidden" });
        console.log(
          `${name}: cold touch search works without Markdown parsing or duplicate indexes`,
        );
      } finally {
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
