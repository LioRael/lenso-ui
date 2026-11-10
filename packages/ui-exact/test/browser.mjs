import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { buildExample } from "../scripts/example.ts";

const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const dist = await buildExample();
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const file = path.resolve(dist, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
    if (!file.startsWith(`${dist}/`)) return new Response("Forbidden", { status: 403 });
    return (await Bun.file(file).exists())
      ? new Response(Bun.file(file))
      : new Response("Not found", { status: 404 });
  },
});

try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== name) continue;
    const browser = await engine.launch({
      channel: name === "chromium" ? process.env.CHROMIUM_CHANNEL : undefined,
    });
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto(server.url.href);
      const button = page.getByTestId("glass-action");
      await page.waitForFunction(() => {
        const node = document.querySelector('[data-testid="glass-action"]');
        return node && getComputedStyle(node).borderRadius === "1000px";
      });
      assert.equal(await button.evaluate((node) => node.tagName), "BUTTON");
      await button.focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.getByTestId("count").textContent(), "Count: 1");
      await page.keyboard.press("Space");
      assert.equal(await page.getByTestId("count").textContent(), "Count: 2");
      await button.click();
      assert.equal(await button.textContent(), "Add 3");
      await page.getByTestId("disable").click();
      assert.equal(await button.isDisabled(), true);
      await button.evaluate((node) => node.click());
      assert.equal(await page.getByTestId("count").textContent(), "Count: 3");
      await page.getByTestId("disable").click();
      await page.getByTestId("size").click();
      await page.waitForFunction(
        () =>
          getComputedStyle(document.querySelector('[data-testid="glass-action"]')).height ===
          "50px",
      );
      const labelColor = await button.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--lenso-label-primary"),
      );
      await page.getByTestId("theme").click();
      assert.equal(await page.locator('[data-theme="dark"]').count(), 1);
      assert.notEqual(
        await button.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--lenso-label-primary"),
        ),
        labelColor,
      );
      await page.getByTestId("visibility").click();
      assert.equal(await page.getByTestId("glass-panel").count(), 0);
      await page.waitForFunction(
        () => document.querySelectorAll("[data-lenso-glass-optics] filter").length === 0,
      );
      await page.getByTestId("visibility").click();
      await page.waitForFunction(
        () => document.querySelectorAll("[data-lenso-glass-optics] filter").length > 0,
      );
      await page.getByTestId("glass-action").click();
      assert.equal(await page.getByTestId("count").textContent(), "Count: 4");
      assert.deepEqual(errors, []);
      const capture = path.resolve(import.meta.dirname, `../.cache/example/${name}.png`);
      await page.screenshot({ path: capture });
      console.log(
        `${name} ${browser.version()}: native activation, disabled updates, size, theme and disposal passed`,
      );
      await page.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop(true);
}
