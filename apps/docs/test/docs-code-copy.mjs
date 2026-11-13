import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4333";
for (const [name, engine, executablePath] of [
  ["chromium", chromium, process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH],
  ["webkit", webkit, process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH],
]) {
  const browser = await engine.launch(executablePath ? { executablePath } : {});
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 844 },
        colorScheme: width === 390 ? "dark" : "light",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          value: {
            writeText: async (text) => {
              if (window.__denyCodeCopy) throw new Error("Clipboard permission denied");
              window.__copiedCode = text;
              window.__codeCopies = (window.__codeCopies ?? 0) + 1;
            },
          },
        });
      });
      await page.goto(base);
      await page.locator('[data-lenso-slot="scroll-edge"]').waitFor({ state: "attached" });
      const button = page.getByRole("button", { name: "Copy code", exact: true }).first();
      await button.scrollIntoViewIfNeeded();
      const pane = button.locator("..");
      const pre = pane.locator("pre");
      const code = await pre.locator("code").textContent();
      const geometry = await button.evaluate((node) => ({
        position: getComputedStyle(node).position,
        button: node.getBoundingClientRect().toJSON(),
        pre: node.parentElement.querySelector("pre").getBoundingClientRect().toJSON(),
      }));
      // A functional click test alone misses a button displaced into document flow.
      assert.equal(geometry.position, "absolute");
      assert.ok(Math.abs(geometry.pre.right - geometry.button.right - 8) <= 1);
      assert.ok(Math.abs(geometry.button.top - geometry.pre.top - 8) <= 1);
      assert.equal(Math.round(geometry.button.width), width === 390 ? 44 : 32);
      assert.equal(Math.round(geometry.button.height), width === 390 ? 44 : 32);
      await button.click();
      await page.waitForFunction((code) => window.__copiedCode === code, code);
      assert.equal(await pane.locator("output").textContent(), "Code copied");
      assert.equal(await pane.locator("output").getAttribute("aria-live"), "polite");
      await button.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => window.__codeCopies === 2);
      await page.evaluate(() => {
        window.__denyCodeCopy = true;
      });
      await button.click();
      await page.waitForFunction(() =>
        [...document.querySelectorAll("output")].some((node) =>
          node.textContent.includes("Clipboard unavailable"),
        ),
      );
      assert.deepEqual(errors, []);
      console.log(
        `${name} ${width}px: code copy geometry, target size, exact content, keyboard and failure feedback passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
