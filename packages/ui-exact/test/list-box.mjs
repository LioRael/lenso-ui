import assert from "node:assert/strict";
import path from "node:path";
export async function checkListBox(page, engine) {
  const root = page.getByTestId("choices-list"),
    a = page.getByTestId("choice-alpha"),
    b = page.getByTestId("choice-beta"),
    c = page.getByTestId("choice-charlie"),
    d = page.getByTestId("choice-delta"),
    e = page.getByTestId("choice-echo");
  const picked = async () =>
    root
      .locator('[role="option"][aria-selected="true"]')
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.lensoValue));
  const focusIs = async (id) => page.waitForFunction((id) => document.activeElement?.id === id, id);
  await page.waitForFunction(() => document.getElementById("choice-alpha")?.tabIndex === 0);
  assert.equal(await root.getAttribute("role"), "listbox");
  assert.equal(await root.getAttribute("aria-multiselectable"), "true");
  assert.equal(await b.getAttribute("aria-disabled"), "true");
  assert.equal(await c.getAttribute("aria-posinset"), "3");
  assert.equal(await c.getAttribute("aria-setsize"), "5");
  assert.equal(await root.getAttribute("tabindex"), "-1");
  await a.focus();
  await page.keyboard.press("Space");
  assert.deepEqual(await picked(), [""]);
  assert.equal(await page.getByTestId("list-box-action").textContent(), "Action: ");
  await page.keyboard.press("Shift+ArrowDown");
  await focusIs("choice-charlie");
  assert.deepEqual(await picked(), ["", "雪"]);
  await page.keyboard.press("Shift+ArrowDown");
  await focusIs("choice-delta");
  assert.deepEqual(await picked(), ["", "雪", "delta"]);
  await page.keyboard.press("Shift+ArrowUp");
  assert.deepEqual(await picked(), ["", "雪"]);
  await e.click({ modifiers: ["Shift"] });
  assert.deepEqual(await picked(), ["", "雪", "delta", "echo"]);
  await page.keyboard.press("Escape");
  assert.deepEqual(await picked(), []);
  await page.keyboard.press("Control+a");
  assert.deepEqual(await picked(), ["", "雪", "delta", "echo"]);
  await page.keyboard.press("Escape");
  await a.focus();
  await page.keyboard.press("c");
  await focusIs("choice-charlie");
  await page.keyboard.press("End");
  await focusIs("choice-echo");
  await page.keyboard.press("ArrowDown");
  await focusIs("choice-alpha");
  await page.getByTestId("list-box-loop").click();
  await e.focus();
  await page.keyboard.press("ArrowDown");
  await focusIs("choice-echo");
  await page.getByTestId("list-box-direction").click();
  await a.focus();
  await page.keyboard.press("ArrowLeft");
  await focusIs("choice-charlie");
  await page.getByTestId("list-box-readonly").click();
  await c.focus();
  await page.keyboard.press("Space");
  assert.deepEqual(await picked(), []);
  await page.keyboard.press("ArrowDown");
  await focusIs("choice-delta");
  await page.getByTestId("list-box-readonly").click();
  await page.getByTestId("list-box-reject").click();
  await a.click();
  assert.deepEqual(await picked(), []);
  await page.getByTestId("list-box-reject").click();
  await page.getByTestId("list-box-availability").evaluate((n) => n.click());
  await b.click();
  assert.deepEqual(await picked(), ["a,b"]);
  await a.click();
  assert.deepEqual(await picked(), ["", "a,b"]);
  await page.getByTestId("list-box-availability").evaluate((n) => n.click());
  assert.equal(await b.getAttribute("aria-selected"), "true");
  await a.focus();
  await page.keyboard.press("Control+a");
  assert.deepEqual(await picked(), ["", "雪", "delta", "echo"]);
  await page.keyboard.press("Escape");
  await page.getByTestId("list-box-external").click();
  assert.deepEqual(await picked(), ["雪"]);
  await c.focus();
  const removed = await c.elementHandle();
  await page.getByTestId("list-box-remove").evaluate((n) => n.click());
  await focusIs("choice-alpha");
  assert.equal(await removed.evaluate((n) => n.tabIndex), -1);
  await removed.dispose();
  assert.equal(await d.getAttribute("aria-posinset"), "3");
  assert.equal(await d.getAttribute("aria-setsize"), "4");
  await d.click();
  await page.getByTestId("list-box-remove").click();
  assert.deepEqual(await picked(), ["雪", "delta"]);
  await page.getByTestId("list-box-mode").click();
  assert.equal(await root.getAttribute("aria-multiselectable"), "false");
  await page.getByTestId("list-box-follow").click();
  await a.focus();
  await page.keyboard.press("ArrowDown");
  assert.deepEqual(await picked(), ["雪"]);
  await d.click();
  assert.deepEqual(await picked(), ["delta"]);
  await page.getByTestId("list-box-mode").click();
  await a.click();
  assert.deepEqual(await picked(), []);
  assert.equal(await page.getByTestId("list-box-action").textContent(), "Action: ");
  await page.getByTestId("list-box-disabled").click();
  assert.equal(await a.getAttribute("tabindex"), "-1");
  await a.dispatchEvent("click");
  assert.deepEqual(await picked(), []);
  await page.getByTestId("list-box-disabled").click();
  await page.getByTestId("list-box-mode").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await a.focus();
      await page.keyboard.press("Space");
      assert.deepEqual(await picked(), [""]);
      await page.keyboard.press("Escape");
      await root.scrollIntoViewIfNeeded();
      const box = await root.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS,
        `${engine}-list-box-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const detached = await a.elementHandle();
  await page.getByTestId("list-box-mounted").click();
  assert.equal(await detached.evaluate((n) => n.tabIndex), -1);
  await detached.dispose();
  await page.getByTestId("list-box-mounted").click();
  await page.waitForFunction(() => document.getElementById("choice-alpha")?.tabIndex === 0);
  await a.click();
  assert.deepEqual(await picked(), [""]);
  return {
    selectionModes: true,
    rangeExtensionContraction: true,
    skipDisabled: true,
    selectAllClear: true,
    typeahead: true,
    rtlLoop: true,
    readOnlyDisabled: true,
    controlledRejection: true,
    externalUpdate: true,
    retainedUnmountedSelection: true,
    arbitraryKeys: true,
    dynamicAvailability: true,
    focusedRemoval: true,
    action: true,
    remount: true,
    captures,
  };
}
export async function checkListBoxTouch(page) {
  await page.waitForFunction(() => document.getElementById("choice-alpha")?.tabIndex === 0);
  await page.getByTestId("choice-charlie").tap();
  assert.equal(await page.getByTestId("choice-charlie").getAttribute("aria-selected"), "true");
  await page.getByTestId("choice-delta").tap();
  assert.equal(await page.getByTestId("choice-charlie").getAttribute("aria-selected"), "true");
  assert.equal(await page.getByTestId("choice-delta").getAttribute("aria-selected"), "true");
  return { nativeMultipleTap: true };
}
