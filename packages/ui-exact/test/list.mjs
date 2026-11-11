import assert from "node:assert/strict";
import path from "node:path";
export async function checkList(page, engine) {
  const list = page.getByTestId("library-list");
  await list.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("list", { name: "Library", exact: true }).count(), 1);
  assert.equal(await list.getByRole("listitem").count(), 4);
  assert.equal(await page.getByRole("list", { name: "Shared", exact: true }).count(), 1);
  const action = page.getByTestId("library-open");
  await action.focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("list-count").filter({ hasText: "Opened: 1" }).waitFor();
  await page.keyboard.press("Space");
  await page.getByTestId("list-count").filter({ hasText: "Opened: 2" }).waitFor();
  assert.equal(await page.getByTestId("library-team-open").isDisabled(), true);
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  assert.equal(await action.isDisabled(), true);
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  await page.getByTestId("list-edit").click();
  const recent = page.getByTestId("library-recent-select");
  const archive = page.getByTestId("library-archive-select");
  const team = page.getByTestId("library-team-select");
  assert.equal(await action.isDisabled(), true);
  assert.equal(await team.isDisabled(), true);
  await recent.focus();
  await page.keyboard.press("Space");
  await page.getByTestId("list-selection-value").filter({ hasText: "Selection: recent" }).waitFor();
  assert.equal(await recent.isChecked(), true);
  await page.keyboard.press("ControlOrMeta+a");
  await page
    .getByTestId("list-selection-value")
    .filter({ hasText: "Selection: recent,archive" })
    .waitFor();
  assert.equal(await archive.isChecked(), true);
  assert.equal(await team.isChecked(), false);
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  assert.equal(await recent.isDisabled(), true);
  await recent.evaluate((n) =>
    n.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true })),
  );
  assert.equal(
    await page.getByTestId("list-selection-value").textContent(),
    "Selection: recent,archive",
  );
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  await page.getByTestId("list-external").evaluate((n) => n.click());
  await page.waitForFunction(
    () =>
      !document.getElementById("library-recent-select").checked &&
      document.getElementById("library-archive-select").checked,
  );
  await page.getByTestId("list-edit").click();
  assert.equal(await recent.count(), 0);
  assert.equal(await action.isDisabled(), false);
  await page.getByTestId("list-edit").click();
  assert.equal(await archive.isChecked(), true);
  const control = recent.locator("..").locator('[data-lenso-kind="checkbox-control"]');
  assert.equal(await control.evaluate((n) => getComputedStyle(n).borderRadius), "1000px");
  const selectionWidth = await recent
    .locator('xpath=ancestor::*[@data-slot="list-selection"]')
    .evaluate((n) => n.getBoundingClientRect().width);
  assert.ok(
    selectionWidth <= 44,
    `Selection should not render its accessible label: ${selectionWidth}`,
  );
  assert.equal(await recent.getAttribute("aria-label"), "Select recent");
  assert.equal(
    await page
      .getByTestId("library-recent")
      .evaluate((n) => getComputedStyle(n).paddingInlineStart),
    "16px",
  );
  await page.getByTestId("library-list").screenshot({
    path: path.join(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ??
        path.resolve(import.meta.dirname, "../.cache/example"),
      `${engine}-list-edit.png`,
    ),
  });
  await page.getByTestId("list-edit").click();
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const appearance of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      for (const variant of ["grouped", "plain"]) {
        if ((await list.getAttribute("data-lenso-variant")) !== variant)
          await page.getByTestId("list-variant").evaluate((n) => n.click());
        await list.scrollIntoViewIfNeeded();
        const geometry = await list.evaluate((n) => ({
          width: n.getBoundingClientRect().width,
          radius: getComputedStyle(n).borderRadius,
          overflow: n.scrollWidth > n.clientWidth,
        }));
        assert.equal(geometry.overflow, false);
        assert.equal(geometry.radius, variant === "grouped" ? "26px" : "0px");
        assert.ok((await page.getByTestId("library-archive").boundingBox()).height >= 68);
        assert.ok((await action.boundingBox()).height >= 52);
        await page.screenshot({
          path: path.join(
            process.env.LENSO_EXACT_TEST_ARTIFACTS ??
              path.resolve(import.meta.dirname, "../.cache/example"),
            `${engine}-list-${appearance}-${variant}-${width}.png`,
          ),
        });
        captures.push({ width, appearance, variant, geometry });
      }
    }
  }
  await page.getByTestId("list-direction").evaluate((n) => n.click());
  assert.equal(await list.evaluate((n) => getComputedStyle(n).direction), "rtl");
  assert.equal(await list.locator("[data-material-lens]").count(), 0);
  return { nativeActions: true, disabled: true, listSemantics: true, rtl: true, captures };
}
