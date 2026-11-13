import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
// Popup decoration must not enlarge or reshape its trigger's fusion plane.
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const colorScheme of ["light", "dark"]) {
      for (const width of [1280, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
        await page.goto(`${base}/cn/docs/react/components/button-group`);
        await page.waitForLoadState("networkidle");
        await page.getByRole("combobox", { name: "场景", exact: true }).click();
        await page.getByRole("option", { name: "Glass", exact: true }).click();
        const trigger = page.locator('[data-lenso-slot="menu-trigger"][aria-label="More options"]');
        const group = trigger.locator("..");
        const left = group.getByRole("button", { name: "Merge pull request", exact: true });
        await left
          .locator('[data-lenso-slot="glass-press-highlight"]')
          .waitFor({ state: "attached" });
        await page.waitForFunction(() =>
          document
            .querySelector('[data-story-preview] [data-lenso-slot="glass-button"]')
            ?.hasAttribute("data-lenso-glass-fused"),
        );
        const bounds = await group.boundingBox();
        for (let cycle = 0; cycle < 2; cycle++) {
          await trigger.click();
          const menu = page.getByRole("menu", { name: "More options", exact: true });
          await menu.waitFor();
          await page.waitForFunction(() => {
            const menu = document.querySelector('[data-lenso-slot="menu-popup"]');
            return menu && !menu.hasAttribute("data-menu-morphing");
          });
          const state = await group.evaluate((node) => {
            const button = node.querySelector('button[data-lenso-slot="glass-button"]');
            const plane = node.querySelector("[data-lenso-glass-fusion]");
            const style = getComputedStyle(button);
            return {
              fused: button.hasAttribute("data-lenso-glass-fused"),
              right: style.borderTopRightRadius,
              hidden: plane.hidden,
              box: plane.getBoundingClientRect().toJSON(),
              triggerTransform: getComputedStyle(
                node.querySelector('[data-lenso-slot="menu-trigger"]'),
              ).transform,
              popupFused:
                node.querySelector('[data-lenso-slot="menu-popup"] [data-lenso-glass-fused]') !==
                null,
            };
          });
          assert.equal(state.fused, true);
          assert.equal(state.right, "0px");
          assert.equal(state.hidden, false);
          assert.equal(state.triggerTransform, "none");
          assert.equal(state.popupFused, false);
          assert.ok(state.box.width <= bounds.width + 1 && state.box.height <= bounds.height + 1);
          await page.keyboard.press("Escape");
          await menu.waitFor({ state: "hidden" });
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
