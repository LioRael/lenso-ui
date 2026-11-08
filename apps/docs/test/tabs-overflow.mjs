import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { createFirstPaintServer } from "./first-paint-server.mjs";

const server = await createFirstPaintServer();
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      for (const theme of ["light", "dark"]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        page.setDefaultTimeout(10_000);
        page.setDefaultNavigationTimeout(30_000);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.goto(`${base}__first-paint?theme=${theme}`);
        for (const direction of ["ltr", "rtl"]) {
          const section = page.locator(`[data-overflow-case="${direction}"]`);
          const more = section.getByRole("button", { name: "More tabs", exact: true });
          await more.waitFor();
          const bar = section.getByRole("tablist");
          assert.ok(await bar.getByRole("tab", { selected: true }).isVisible());
          assert.equal(await section.locator('[data-slot="tabs-list-scroller"]').count(), 0);
          assert.ok(
            await section.locator('[data-slot="tabs-list-container"]').evaluate((host) => {
              host.scrollTop = 100;
              host.scrollLeft = 100;
              return (
                host.scrollTop === 0 &&
                host.scrollLeft === 0 &&
                host.scrollWidth <= host.clientWidth + 1
              );
            }),
          );
          await more.click();
          const menu = page.getByRole("menu", { name: "More tabs", exact: true });
          await menu.waitFor();
          assert.equal(
            await menu
              .getByRole("menuitem", { name: "Disabled", exact: true })
              .getAttribute("aria-disabled"),
            "true",
          );
          await menu.getByRole("menuitem", { name: "Billing", exact: true }).click();
          await section.getByRole("tabpanel", { name: "Billing", exact: true }).waitFor();
          const current = bar.getByRole("tab", { name: "Billing", exact: true });
          await current.waitFor();
          await page.waitForFunction(() => document.activeElement?.textContent === "Billing");
          await current.press(direction === "rtl" ? "ArrowRight" : "ArrowLeft");
          await page.waitForFunction(
            (direction) =>
              document.querySelector(
                `[data-overflow-case="${direction}"] [role="tab"][aria-selected="true"]`,
              )?.textContent === "Overview",
            direction,
          );
          await more.focus();
          await page.keyboard.press("ArrowDown");
          await menu.waitFor();
          await page.keyboard.press("Escape");
          await menu.waitFor({ state: "hidden" });
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "More tabs",
          );
          await section.getByRole("button", { name: "Resize tabs" }).click();
          await more.waitFor({ state: "hidden" });
          assert.equal(await bar.getByRole("tab").count(), 6);
          await section.getByRole("button", { name: "Resize tabs" }).click();
          await more.waitFor();
          assert.ok(await bar.getByRole("tab", { selected: true }).isVisible());
        }
        const controlled = page.locator('[data-overflow-case="controlled"]');
        await controlled.getByRole("button", { name: "More tabs", exact: true }).click();
        await page.getByRole("menuitem", { name: "Billing", exact: true }).click();
        assert.equal(await controlled.locator("output").textContent(), "Billing");
        assert.equal(
          await controlled.getByRole("tab", { selected: true }).textContent(),
          "Overview",
        );
        assert.ok(await controlled.getByRole("tab", { selected: true }).isVisible());
        assert.deepEqual(errors, []);
        console.log(
          `${name}/${theme}: overflow menu, selection, disabled items, keyboard, focus, RTL, resize and controlled rejection passed.`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
