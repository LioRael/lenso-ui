import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const [width, direction] of [
      [1280, "ltr"],
      [390, "ltr"],
      [1280, "rtl"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${base}/en/docs/react/components/menu`);
      const trigger = page.getByRole("button", { name: "Menu", exact: true });
      await trigger.evaluate((element, dir) => (element.closest("[dir]").dir = dir), direction);
      await trigger.click();
      const checkbox = page.getByRole("menuitemcheckbox", { name: "Pin to favorites" });
      await checkbox.waitFor();
      await page.waitForTimeout(750);

      async function geometry() {
        return page.evaluate(() => {
          const textBounds = (element) => {
            const text = [...element.childNodes].find(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
            );
            const range = document.createRange();
            range.selectNodeContents(text);
            const { left, right } = range.getBoundingClientRect();
            return { left, right };
          };
          const checkbox = document.querySelector('[role="menuitemcheckbox"]');
          const group = checkbox.closest('[role="group"]');
          const menu = checkbox.closest('[data-lenso-slot="menu-content"]');
          const label = group.querySelector('[data-lenso-slot="menu-section-label"]');
          const normal = [...group.querySelectorAll('[role="menuitem"]')].find((element) =>
            element.textContent.includes("Sort by"),
          );
          const details = [...menu.querySelectorAll('[data-lenso-slot="label"]')].find(
            (element) => element.textContent === "File details",
          );
          const quickAction = menu.querySelector('[data-lenso-slot="menu-action"]');
          const indicator = checkbox.querySelector('[data-lenso-slot="menu-item-indicator"]');
          const { left, right } = indicator.getBoundingClientRect();
          const menuBounds = menu.getBoundingClientRect();
          const quickActionBounds = quickAction.getBoundingClientRect();
          return {
            label: textBounds(label),
            checkbox: textBounds(checkbox),
            normal: textBounds(normal),
            details: textBounds(details),
            menu: { left: menuBounds.left, right: menuBounds.right },
            quickAction: { left: quickActionBounds.left, right: quickActionBounds.right },
            indicator: { left, right },
            indicatorOpacity: getComputedStyle(indicator).opacity,
          };
        });
      }

      const before = await geometry();
      const edge = direction === "ltr" ? "left" : "right";
      const inset = (state, item) =>
        direction === "ltr"
          ? state[item].left - state.menu.left
          : state.menu.right - state[item].right;
      assert.ok(Math.abs(before.label[edge] - before.normal[edge]) < 1, "group label alignment");
      assert.ok(Math.abs(before.checkbox[edge] - before.normal[edge]) < 1, "checkbox alignment");
      await checkbox.click();
      assert.equal(await checkbox.getAttribute("aria-checked"), "true");
      const after = await geometry();
      assert.equal(after.indicatorOpacity, "1", "checked indicator is visible");
      for (const item of ["label", "checkbox", "normal", "details"]) {
        assert.ok(
          Math.abs(inset(after, item) - inset(before, item) - 16) < 1,
          `${item} should move inward by 16px when checked`,
        );
      }
      assert.ok(
        direction === "ltr"
          ? after.checkbox.left - after.indicator.right >= 4
          : after.indicator.left - after.checkbox.right >= 4,
        "indicator must leave room before the label",
      );
      assert.ok(
        Math.abs(inset(after, "quickAction") - inset(before, "quickAction")) < 1,
        "quick actions should remain in place",
      );
      await checkbox.click();
      assert.equal(await checkbox.getAttribute("aria-checked"), "false");
      const restored = await geometry();
      for (const item of ["label", "checkbox", "normal", "details"]) {
        assert.ok(
          Math.abs(inset(restored, item) - inset(before, item)) < 1,
          `${item} should reset`,
        );
      }
      if (width === 1280 && direction === "ltr") {
        await checkbox.focus();
        await page.keyboard.press("Space");
        assert.equal(await checkbox.getAttribute("aria-checked"), "true");
        await page.keyboard.press("Escape");
        await checkbox.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
        await trigger.click();
        await checkbox.waitFor();
        await page.waitForTimeout(750);
        assert.equal(await checkbox.getAttribute("aria-checked"), "true");
        const reopened = await geometry();
        assert.ok(Math.abs(inset(reopened, "label") - inset(before, "label") - 16) < 1);
        await checkbox.click();
        assert.equal(await checkbox.getAttribute("aria-checked"), "false");
      }
      if (width === 1280) {
        await page.getByRole("menuitem", { name: "Sort by" }).hover();
        const selectedRadio = page.getByRole("menuitemradio", { name: "Name" });
        await selectedRadio.waitFor();
        await page.waitForTimeout(750);
        assert.equal(await selectedRadio.getAttribute("aria-checked"), "true");
        const parent = await geometry();
        assert.ok(
          Math.abs(inset(parent, "label") - inset(before, "label")) < 1,
          "a checked submenu item should not indent its parent",
        );
        const submenuInset = await selectedRadio.evaluate((element, dir) => {
          const content = element.closest('[data-lenso-slot="menu-content"]');
          const text = [...element.childNodes].find(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
          );
          const range = document.createRange();
          range.selectNodeContents(text);
          const bounds = range.getBoundingClientRect();
          const menuBounds = content.getBoundingClientRect();
          return dir === "ltr" ? bounds.left - menuBounds.left : menuBounds.right - bounds.right;
        }, direction);
        assert.ok(
          Math.abs(submenuInset - inset(before, "label") - 16) < 1,
          "a submenu with a selected radio should indent its own items",
        );
      }
      console.log(`PASS ${name} ${width}px ${direction}: aligned selection column`);
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${base}/en/docs/react/components/select`);
    const select = page.getByRole("combobox", { name: "State", exact: true }).first();
    await select.click();
    await page.getByRole("option", { name: "Washington", exact: true }).click();
    await select.click();
    const selected = page.getByRole("option", { name: "Washington", exact: true });
    await selected.waitFor();
    await page.waitForTimeout(750);
    const selectGap = await selected.evaluate((item) => {
      const indicator = item.querySelector('[data-lenso-slot="select-item-indicator"]');
      const text = item.querySelector('[data-lenso-slot="select-item-text"]');
      return text.getBoundingClientRect().left - indicator.getBoundingClientRect().right;
    });
    assert.ok(Math.abs(selectGap - 6) < 1, "Select should retain its existing indicator spacing");
    await page.close();
  } finally {
    await browser.close();
  }
}
