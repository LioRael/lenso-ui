import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      colorScheme: "dark",
    });
    for (const component of ["button", "tabs"]) {
      await page.goto(`${base}/en/docs/react/components/${component}`);
      await page.waitForLoadState("networkidle");
      const preview = page.locator("[data-story-preview]");
      const log = page.getByRole("log");
      const trigger =
        component === "button"
          ? preview.getByRole("button", { name: "Continue", exact: true })
          : preview.getByRole("tab", { name: "Activity", exact: true });
      const other = component === "button" ? trigger : preview.getByRole("tab").first();
      for (let i = 0; i < 16; i++) await (i % 2 ? other : trigger).click();
      assert.ok((await log.getByRole("listitem").count()) >= 15, "Retain history beyond four rows");
      assert.ok(!/^\d+\. /m.test(await log.innerText()), "Rows must not display numeric prefixes");
      await log.evaluate((node) => {
        if (node.scrollHeight <= node.clientHeight)
          throw new Error("Log must overflow within its viewport");
      });
      await page.waitForFunction(() => {
        const node = document.querySelector('[role="log"]');
        return node.scrollHeight - node.clientHeight - node.scrollTop < 4;
      });
      await log.hover();
      await page.mouse.wheel(0, -1000);
      await page.waitForFunction(() => document.querySelector('[role="log"]').scrollTop < 4);
      await trigger.click();
      assert.ok(
        await log.evaluate((node) => node.scrollTop < 4),
        "New messages must not pull the reader down",
      );
      await log.focus();
      await page.keyboard.press("End");
      await page.waitForFunction(() => {
        const node = document.querySelector('[role="log"]');
        return node.scrollHeight - node.clientHeight - node.scrollTop < 4;
      });
      await page
        .getByRole("region", { name: "Console", exact: true })
        .getByRole("button", { name: "Clear", exact: true })
        .click();
      await log.getByText("Waiting for an interaction…", { exact: true }).waitFor();
      assert.equal(await log.getByRole("listitem").count(), 0);
    }
    console.log(
      `${name}: compact rows, scrollable history, follow behavior, keyboard scroll and clear passed`,
    );
  } finally {
    await browser.close();
  }
}
