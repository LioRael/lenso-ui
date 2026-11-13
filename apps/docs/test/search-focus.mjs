import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { startStaticServer } from "./static-server.mjs";

const server = await startStaticServer();
try {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      for (const width of [390, 1280]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        try {
          await page.goto(`${server.base}/cn/docs/react/components/tabs`);
          await page.waitForLoadState("networkidle");
          const trigger = page.locator("[data-docs-search-trigger]:visible").first();
          const panel = page.locator("[data-docs-search]");
          await trigger.click();
          await panel.getByRole("combobox").fill("button");
          await panel.locator("[data-docs-result]").first().waitFor();
          for (const close of ["Escape", "button", "shortcut"]) {
            if (close === "button")
              await panel.getByRole("button", { name: "关闭搜索", exact: true }).click();
            else await page.keyboard.press("Escape");
            await panel.waitFor({ state: "hidden" });
            await page.waitForFunction(
              (element) => document.activeElement === element,
              await trigger.elementHandle(),
              { timeout: 3000 },
            );
            assert.ok(
              await trigger.evaluate((element) => document.activeElement === element),
              `${name}/${width}/${close}: focus must return to the opening button`,
            );
            if (close === "shortcut") break;
            await page.keyboard.press(close === "Escape" ? "Enter" : "Control+k");
            await panel.waitFor();
          }
          for (const nextWidth of [width === 390 ? 1280 : 390, width]) {
            await trigger.click();
            await panel.getByRole("combobox").fill("button");
            await panel.locator("[data-docs-result]").first().waitFor();
            const original = await trigger.elementHandle();
            await page.setViewportSize({ width: nextWidth, height: 900 });
            await page.waitForFunction((element) => !element.getClientRects().length, original);
            const visibleTrigger = await trigger.elementHandle();
            await page.keyboard.press("Escape");
            await panel.waitFor({ state: "hidden" });
            await page.waitForFunction(
              (element) => document.activeElement === element,
              visibleTrigger,
              { timeout: 3000 },
            );
            await page.keyboard.press("Enter");
            await panel.waitFor();
            await panel.getByRole("button", { name: "关闭搜索", exact: true }).click();
            await panel.waitFor({ state: "hidden" });
            await page.waitForFunction(
              (element) => document.activeElement === element,
              visibleTrigger,
              { timeout: 3000 },
            );
          }
          console.log(`${name}/${width}: search returns focus after Escape, close and shortcut`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
