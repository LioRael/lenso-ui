import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";

// The DOM suite cannot establish native input composition, focus restoration,
// navigation or the resulting scroll geometry inside the real documentation shell.
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ colorScheme, viewport: { width: 390, height: 844 } });
      try {
        await page.goto(`${base}/en/docs/react/components/command`);
        await page.waitForLoadState("networkidle");
        const input = page.getByRole("combobox", { name: "Find a command", exact: true });
        const presentation = (root) => {
          const properties = {
            command: ["borderRadius", "padding", "gap"],
            "command-header": ["padding", "gap"],
            "command-input": ["fontSize", "lineHeight", "backgroundColor", "padding"],
            "command-item": ["padding", "borderRadius", "minHeight"],
            "command-viewport": ["padding", "scrollPaddingTop"],
            "command-footer": ["padding", "fontSize"],
          };
          return Object.fromEntries(
            Object.entries(properties).map(([slot, keys]) => {
              const node = slot === "command" ? root : root.querySelector(`[data-slot="${slot}"]`);
              const style = getComputedStyle(node);
              return [slot, Object.fromEntries(keys.map((key) => [key, style[key]]))];
            }),
          );
        };
        const inlinePresentation = await input
          .locator('xpath=ancestor::*[@data-slot="command"][1]')
          .evaluate(presentation);
        await input.fill("settings");
        await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 1);
        await input.dispatchEvent("compositionstart");
        await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
        assert.equal(await page.getByText("Selected: Settings", { exact: true }).count(), 0);
        await input.dispatchEvent("compositionend");
        await input.press("Enter");
        await page.getByText("Selected: Settings", { exact: true }).waitFor();
        assert.equal(await input.inputValue(), "settings");
        await input.fill("no command matches");
        await page.getByText("No matching commands.", { exact: true }).waitFor();

        const trigger = page.locator("[data-docs-search-trigger]:visible").first();
        await trigger.click();
        const panel = page.locator("[data-docs-search]");
        const search = panel.getByRole("combobox");
        await search.fill("button");
        await panel.getByRole("option").first().waitFor();
        assert.deepEqual(
          await panel.evaluate(presentation),
          inlinePresentation,
          "Documentation search must use the default Command presentation",
        );
        await search.press("ArrowDown");
        const active = await search.getAttribute("aria-activedescendant");
        assert.ok(active && (await page.locator(`[id="${active}"]`).count()));
        await search.press("Escape");
        await panel.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
        await trigger.click();
        assert.equal(await search.inputValue(), "");
        await panel.getByRole("button", { name: "Close search", exact: true }).click();
        await panel.waitFor({ state: "hidden" });
        await trigger.click();
        await search.fill("button");
        await panel.getByRole("option").first().waitFor();
        await search.press("Enter");
        await page.waitForURL(/\/components\/button(?:#.*)?$/);
        await panel.waitFor({ state: "hidden" });
        console.log(
          `${name}/${colorScheme}: inline filtering, IME, execution, search navigation and focus passed`,
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
