import assert from "node:assert/strict";
export async function checkListReorder(page) {
  await page.getByTestId("list-edit").click();
  const recent = page.getByTestId("recent-move");
  const archive = page.getByTestId("archive-move");
  const order = () =>
    page
      .locator('#library-list > [data-slot="list-item"]')
      .evaluateAll((nodes) => nodes.map((n) => n.id));
  await recent.focus();
  await page.keyboard.press("Space");
  assert.equal(await recent.getAttribute("aria-pressed"), "true");
  await page.keyboard.press("ArrowDown");
  assert.deepEqual(await order(), ["library-recent", "library-archive"]);
  await page.keyboard.press("Escape");
  assert.equal(await recent.getAttribute("aria-pressed"), "false");
  assert.equal(await page.getByTestId("list-move-request").textContent(), "");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () =>
      document.querySelector('#library-list > [data-slot="list-item"]').id === "library-archive",
  );
  assert.equal(await page.getByTestId("list-move-request").textContent(), "recent:after:archive");
  await page.waitForFunction(() => document.activeElement?.id === "recent-move");
  await recent.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => document.querySelector('#library-list > [data-slot="list-item"]').id === "library-recent",
  );
  assert.equal(await page.getByTestId("list-move-request").textContent(), "recent:before:archive");
  await archive.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowUp");
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  assert.equal(await archive.isDisabled(), true);
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  assert.equal(await archive.getAttribute("aria-pressed"), "false");
  await recent.focus();
  await page.keyboard.press("Enter");
  await archive.focus();
  assert.equal(await recent.getAttribute("aria-pressed"), "false");
  await page.getByTestId("list-edit").click();
  assert.equal(await recent.count(), 0);
  await page.getByTestId("list-edit").click();
  assert.equal(await recent.getAttribute("aria-pressed"), "false");
  await page.getByTestId("list-edit").click();
  return {
    cancel: true,
    deferredCommit: true,
    actualReorder: true,
    disabledCancellation: true,
    blurCancellation: true,
    editingRemoval: true,
  };
}
