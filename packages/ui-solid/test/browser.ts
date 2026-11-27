import { verifyAdapterParity } from "../../../tests/consumer/adapter-parity.ts";
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

export async function verifySolidBrowser(url: string) {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      const prerendered = await browser.newPage({ javaScriptEnabled: false });
      await prerendered.goto(url);
      assert.equal(
        await prerendered
          .getByRole("button", { name: "Save preferences" })
          .evaluate((button) => {
            const css = getComputedStyle(button);
            return [css.height, css.minWidth, css.backgroundColor, css.marginInlineStart];
          })
          .then((styles) => styles.join(" ")),
        "34px 112px rgb(0, 80, 160) 8px",
      );
      assert.equal(
        await prerendered
          .getByRole("checkbox", { name: "Product updates" })
          .locator('[data-lenso-slot="checkbox-control"]')
          .evaluate((control) => getComputedStyle(control).width),
        "16px",
      );
      await prerendered.close();

      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" ||
          /Hydration key miss|NO_OWNER_CLEANUP|UNSTABLE_LIST_IDENTITY|STRICT_READ_UNTRACKED/.test(
            message.text(),
          )
        )
          errors.push(message.text());
      });
      await page.goto(url);
      await page.waitForFunction(() => Reflect.has(window, "agent"));
      const checkbox = page.getByRole("checkbox", { name: "Product updates" });
      const save = page.getByRole("button", { name: "Save preferences" });
      const theme = page.getByRole("button", { name: "Change theme" });

      await page.keyboard.press("Tab");
      assert.equal(await checkbox.evaluate((element) => element === document.activeElement), true);
      await page.keyboard.press("Space");
      await page.locator('[role="checkbox"][aria-checked="true"].selected').waitFor();
      await save.click();
      assert.equal(await page.locator("#saved").textContent(), "yes");

      await page.getByRole("button", { name: "Reset preferences" }).click();
      await page.locator('[role="checkbox"][aria-checked="mixed"]').waitFor();

      const result = await page.evaluate(async () => {
        const agent: ReturnType<typeof import("@ui-sdk/solid/agent").createAgent> = Reflect.get(
          window,
          "agent",
        );
        return agent.act({
          steps: [{ ref: "Product updates", action: "setChecked", args: [true] }],
        });
      });
      assert.equal(result.ok, true, JSON.stringify(result));
      assert.equal(await checkbox.getAttribute("aria-checked"), "true");
      assert.equal(await page.locator("#source").textContent(), "agent");

      assert.equal(await theme.getAttribute("data-custom-render"), "true");
      const saving = page.getByRole("button", { name: "Save changes" });
      await saving.focus();
      assert.equal(await saving.getAttribute("aria-busy"), "true");
      await saving.press("Enter");
      assert.equal(await page.getByLabel("Save count").textContent(), "0");
      await page.getByRole("button", { name: "Finish saving" }).click();
      await saving.press("Enter");
      assert.equal(await page.getByLabel("Save count").textContent(), "1");
      const grouped = page.getByRole("button", { name: "Grouped action" });
      assert.equal(await grouped.isDisabled(), true);
      assert.equal(await grouped.getAttribute("data-variant"), "prominent");
      assert.equal(await grouped.evaluate((button) => button.closest("fieldset")?.disabled), true);
      const lightText = await checkbox
        .locator('[data-lenso-slot="checkbox-content"]')
        .evaluate((element) => getComputedStyle(element).color);
      await theme.click();
      await page.locator('[data-theme="dark"]').waitFor();
      assert.equal(await save.evaluate((element) => getComputedStyle(element).height), "50px");
      assert.notEqual(
        await checkbox
          .locator('[data-lenso-slot="checkbox-content"]')
          .evaluate((element) => getComputedStyle(element).color),
        lightText,
      );
      const name = page.getByRole("textbox", { name: "Display name" });
      await name.fill("Ada");
      assert.equal(await name.inputValue(), "Ada");
      await page.getByRole("tab", { name: "General" }).focus();
      await page.keyboard.press("ArrowRight");
      await page.getByRole("tabpanel", { name: "Privacy" }).waitFor();
      const moreTabs = page.getByRole("button", { name: "More tabs" });
      await moreTabs.focus();
      await page.keyboard.press("ArrowDown");
      const overflow = page.getByRole("menu", { name: "More tabs" });
      await overflow.waitFor();
      assert.equal(
        await overflow.getByRole("menuitem", { name: "Archive" }).getAttribute("aria-disabled"),
        "true",
      );
      await page.keyboard.press("Escape");
      await overflow.waitFor({ state: "hidden" });
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-label") === "More tabs",
      );
      await moreTabs.click();
      await overflow.getByRole("menuitem", { name: "Reports" }).click();
      await page.getByRole("tabpanel", { name: "Reports" }).waitFor();
      await page.waitForFunction(() => document.activeElement?.textContent === "Reports");
      await page.locator('[data-lenso-slot="tabs-list-container"]').evaluate((element) => {
        (element as HTMLElement).style.width = "560px";
      });
      await moreTabs.waitFor({ state: "hidden" });

      const nav = page.getByRole("navigation", { name: "Account navigation" });
      const overview = nav.getByRole("link", { name: "Overview" });
      const expand = nav.getByRole("button", { name: "Expand navigation" });
      const scroller = page.locator("#tabbar-scroll");
      await overview.focus();
      await scroller.evaluate((element) => {
        element.scrollTop = 32;
      });
      await expand.waitFor();
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-label") === "Expand navigation",
      );
      assert.equal(await nav.getByRole("link").count(), 0);
      await expand.press("Enter");
      await page.waitForFunction(() => document.activeElement?.textContent === "Overview");
      await scroller.evaluate((element) => {
        element.scrollTop = 64;
      });
      await expand.waitFor();
      await scroller.evaluate((element) => {
        element.scrollTop = 0;
      });
      await expand.waitFor({ state: "hidden" });

      const activity = nav.getByRole("link", { name: "Activity" });
      const group = nav.locator("[data-tab-bar-group]");
      await overview.scrollIntoViewIfNeeded();
      const from = (await overview.boundingBox())!;
      const to = (await activity.boundingBox())!;
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      try {
        await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
        assert.equal(await group.getAttribute("data-highlight-active"), "");
      } finally {
        await page.mouse.up();
      }
      await nav.locator('a[href="#source"][aria-current="page"]').waitFor();

      const modal = page.getByRole("button", { name: "Open settings" });
      await modal.click();
      const dialog = page.getByRole("dialog", { name: "Account settings" });
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.activeElement?.textContent === "Open settings");

      const select = page.getByRole("combobox", { name: "Update frequency" });
      await select.click();
      await page.getByRole("option", { name: "Weekly" }).click();
      assert.match((await select.textContent()) ?? "", /Weekly/);

      const wheel = page.getByRole("listbox", { name: "Reminder time" });
      await wheel.focus();
      await page.keyboard.press("ArrowDown");
      assert.equal(
        await page.getByRole("option", { name: "9 AM" }).getAttribute("aria-selected"),
        "true",
      );

      const item = page.getByRole("checkbox", { name: "Select First item" });
      await item.click();
      assert.equal(await item.getAttribute("aria-checked"), "true");

      await page.getByRole("button", { name: "Page 1 of 12" }).focus();
      await page.keyboard.press("End");
      const end = page.getByRole("button", { name: "Page 12 of 12" });
      await end.waitFor();
      assert.equal(await end.getAttribute("aria-current"), "page");
      await page.getByRole("button", { name: "Glass action" }).waitFor();
      await page.getByRole("button", { name: "Refresh settings" }).click();
      await page.getByText("Refresh complete").waitFor();

      const table = page.getByRole("table", { name: "Accounts" });
      const nameColumn = table.getByRole("columnheader", { name: /Name/ });
      await nameColumn.press("Enter");
      assert.equal(await nameColumn.getAttribute("aria-sort"), "ascending");
      await nameColumn.press("Space");
      assert.equal(await nameColumn.getAttribute("aria-sort"), "descending");
      assert.equal(await table.locator("tbody tr td").first().textContent(), "Locked");
      const alpha = table.getByRole("checkbox", { name: "Select Alpha" });
      const all = table.getByRole("checkbox", { name: "Select all accounts" });
      await alpha.press("Space");
      assert.equal(await alpha.isChecked(), true);
      assert.equal(
        await all.evaluate((element) => (element as HTMLInputElement).indeterminate),
        true,
      );
      await all.click();
      assert.equal(await all.isChecked(), true);
      assert.equal(await table.getByRole("checkbox", { name: "Select Zulu" }).isChecked(), true);
      assert.equal(await table.getByRole("checkbox", { name: "Select Locked" }).isChecked(), false);
      await all.click();
      assert.equal(await alpha.isChecked(), false);
      const expandAlpha = table.getByRole("button", { name: "Toggle details for Alpha" });
      await expandAlpha.press("Enter");
      await table.getByText("Details for Alpha").waitFor();
      await expandAlpha.press("Enter");
      await table.getByText("Details for Alpha").waitFor({ state: "hidden" });
      const resizer = table.getByRole("separator", { name: "Resize name column" });
      await resizer.press("ArrowRight");
      assert.equal(await resizer.getAttribute("aria-valuenow"), "190");
      await resizer.press("Home");
      assert.equal(await resizer.getAttribute("aria-valuenow"), "100");
      assert.equal(await nameColumn.getAttribute("aria-sort"), "descending");
      const rect = await resizer.boundingBox();
      assert(rect);
      await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await page.mouse.down();
      await page.mouse.move(rect.x + rect.width / 2 + 35, rect.y + rect.height / 2);
      await page.mouse.up();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[aria-label="Resize name column"]')
            ?.getAttribute("aria-valuenow") === "135",
      );
      assert.equal(await nameColumn.getAttribute("aria-sort"), "descending");
      await table.getByText("Load more accounts").scrollIntoViewIfNeeded();
      await page.waitForFunction(
        () => document.querySelector('[aria-label="Account loads"]')?.textContent === "1",
      );

      await verifyAdapterParity(page, "Close");
      assert.deepEqual(errors, [], engine.name());
    } finally {
      await browser.close();
    }
  }
}
