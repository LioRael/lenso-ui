import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { keepDevFixture } from "./keep-dev-fixture.mjs";

const base = process.env.DOCS_URL ?? "http://localhost:3000";
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1280, 390, 320]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      await keepDevFixture(page, base);
      await page.goto(`${base}/en/docs/react/components/modal`);
      await page.evaluate(async () => {
        const { mount } = await import("/test/overlay-audit-fixture.tsx");
        for (const child of document.body.children)
          if (child instanceof HTMLElement) child.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host);
      });
      const dismiss = async (panel) => {
        await page.keyboard.press("Escape");
        await panel.waitFor({ state: "hidden" });
      };
      for (const dark of [false, true]) {
        await page.getByRole("checkbox", { name: "Dark audit" }).setChecked(dark);
        await page.getByRole("button", { name: "Nested audit", exact: true }).click();
        const parent = page.getByRole("dialog", { name: "Nested audit", exact: true });
        await parent.waitFor();
        const before = await parent.boundingBox();
        for (const [role, trigger, selector] of [
          ["button", "Nested popover", "popover-popup"],
          ["button", "Nested menu", "menu-popup"],
          ["combobox", "Nested select", "select-popover"],
          ["button", "Show Nested combo", "combo-box-popover"],
          ["button", "Show Nested suggestions", "autocomplete-popover"],
        ]) {
          await parent.getByRole(role, { name: trigger, exact: true }).click();
          const child = page.locator(`[data-lenso-slot="${selector}"][data-open]`);
          await child.waitFor();
          const after = await parent.boundingBox();
          for (const key of ["x", "y", "width", "height"])
            assert.ok(
              Math.abs(before[key] - after[key]) <= 1,
              `${name}: ${trigger} moved parent ${key}`,
            );
          await dismiss(child);
          assert.equal(await parent.isVisible(), true);
        }
        await dismiss(parent);
        await page.getByRole("button", { name: "Audit command palette", exact: true }).click();
        const dialog = page.getByRole("dialog", { name: "Audit command palette", exact: true });
        await dialog.waitFor();
        const outer = await dialog.boundingBox();
        const inner = await dialog.locator('[data-lenso-slot="command"]').boundingBox();
        assert.ok(outer.width > 0 && outer.height > 0);
        for (const key of ["x", "y", "width", "height"])
          assert.ok(Math.abs(outer[key] - inner[key]) <= 1, `${name}: command boundary ${key}`);
        assert.ok(outer.x >= 0 && outer.x + outer.width <= width + 1);
        await dismiss(dialog);
        assert.equal(
          await page
            .getByRole("button", { name: "Audit command palette", exact: true })
            .evaluate((e) => e === document.activeElement),
          true,
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
