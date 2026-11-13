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
      const page = await browser.newPage({ viewport: { width, height: 600 } });
      page.setDefaultTimeout(20000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      // Keep the user's system clipboard untouched while checking the pending-Blob write.
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "clipboard", {
          value: {
            write: async (items) => {
              window.__docsClipboard = await (await items[0].getType("text/plain")).text();
            },
          },
        }),
      );
      await page.goto(base);
      const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
      await copy.waitFor();
      const corners = await page
        .getByRole("group", { name: "Page actions", exact: true })
        .getByRole("button")
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const style = getComputedStyle(button);
            return [style.borderTopLeftRadius, style.borderTopRightRadius].map(parseFloat);
          }),
        );
      assert.ok(corners[0][0] > 0 && corners[0][1] === 0);
      assert.ok(corners[1][0] === 0 && corners[1][1] > 0);
      await page
        .locator('[data-docs-header-backdrop][data-lenso-slot="scroll-edge"]')
        .waitFor({ state: "attached" });
      assert.equal(
        await page
          .getByRole("group", { name: "Page actions", exact: true })
          .evaluate((element) => element.tagName),
        "FIELDSET",
      );
      await copy.click();
      const markdown = await (await fetch(`${base}/_lenso/markdown/index.md`)).text();
      await page.waitForFunction((expected) => window.__docsClipboard === expected, markdown);
      const trigger = page.getByRole("button", { name: "Page source options", exact: true });
      await trigger.click();
      const menu = page.getByRole("menu", { name: "Page source options", exact: true });
      await menu.waitFor();
      const link = menu.getByRole("menuitem", { name: "View page source", exact: true });
      assert.equal(await link.evaluate((element) => element.tagName), "A");
      assert.equal(await link.getAttribute("href"), "/_lenso/markdown/index.md");
      await menu.getByRole("menuitem", { name: "Copy Markdown", exact: true }).click();
      await menu.waitFor({ state: "hidden" });
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-label") === "Page source options",
      );
      const edge = page.locator('#nd-subnav [data-lenso-slot="scroll-edge"]');
      assert.equal(await edge.getAttribute("data-variant"), "hard");
      assert.equal(await edge.getAttribute("data-edge"), "top");
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForFunction(
        () =>
          document
            .querySelector("[data-docs-header-backdrop]")
            ?.style.getPropertyValue("--material-edge-visibility") === "0.000",
      );
      await page.evaluate(() => scrollTo(0, 120));
      await page.waitForFunction(() =>
        document.querySelector("[data-docs-header-backdrop]")?.hasAttribute("data-scroll-active"),
      );
      assert.equal(
        await edge.evaluate((element) =>
          element.style.getPropertyValue("--material-edge-visibility"),
        ),
        "1.000",
      );
      assert.equal(
        await edge.evaluate((element) => Math.round(element.getBoundingClientRect().height)),
        await page
          .locator("#nd-subnav")
          .evaluate((element) => Math.round(element.getBoundingClientRect().height)),
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForFunction(
        () =>
          !document
            .querySelector("[data-docs-header-backdrop]")
            ?.hasAttribute("data-scroll-active"),
      );
      assert.deepEqual(errors, []);
      console.log(
        `${name} ${width}px: shared split copy/menu, exact Markdown, focus return and scroll-bound hard header edge passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
