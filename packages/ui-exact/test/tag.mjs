import assert from "node:assert/strict";
import path from "node:path";
export async function checkTags(page, engine) {
  const group = page.getByTestId("project-tags"),
    a = page.getByTestId("tag-empty"),
    b = page.getByTestId("tag-comma"),
    c = page.getByTestId("tag-unicode"),
    locked = page.getByTestId("tag-locked");
  const picked = () =>
    group
      .locator('[role="row"][aria-selected="true"]')
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.lensoValue));
  const requests = async () =>
    Number((await page.getByTestId("tags-requests").textContent()).replace("Requests: ", ""));
  const focusIs = (id) => page.waitForFunction((id) => document.activeElement?.id === id, id);
  const reset = () => page.getByTestId("tags-reset").click();
  await page.waitForFunction(() => document.getElementById("tag-empty")?.tabIndex === 0);
  assert.equal(await group.getAttribute("role"), "grid");
  assert.equal(await group.getAttribute("aria-rowcount"), "4");
  assert.equal(await group.getAttribute("aria-colcount"), "2");
  assert.equal(await b.getAttribute("aria-rowindex"), "2");
  assert.equal(await a.locator('[role="gridcell"]').count(), 2);
  assert.equal(await a.getAttribute("aria-posinset"), null);
  assert.equal(await locked.getAttribute("aria-disabled"), "true");
  assert.equal(await page.getByTestId("tag-locked-remove").isDisabled(), true);
  await a.focus();
  await page.keyboard.press("Space");
  assert.deepEqual(await picked(), [""]);
  await page.keyboard.press("Shift+ArrowRight");
  assert.deepEqual(await picked(), ["", "a,b"]);
  await page.keyboard.press("Shift+ArrowRight");
  assert.deepEqual(await picked(), ["", "a,b", "雪"]);
  await page.keyboard.press("Shift+ArrowLeft");
  assert.deepEqual(await picked(), ["", "a,b"]);
  await page.keyboard.press("Control+a");
  assert.deepEqual(await picked(), ["", "a,b", "雪"]);
  await page.keyboard.press("Escape");
  assert.deepEqual(await picked(), []);
  await b.click();
  await page.keyboard.press("Delete");
  await focusIs("tag-unicode");
  assert.equal(await b.count(), 0);
  assert.deepEqual(await picked(), []);
  assert.equal(await group.getAttribute("aria-rowcount"), "3");
  assert.equal(await page.getByTestId("tags-last-removal").textContent(), "Remove: a,b");
  await reset();
  await c.focus();
  await page.keyboard.press("Backspace");
  await focusIs("tag-comma");
  assert.equal(await c.count(), 0);
  await reset();
  await a.click();
  const count = await requests();
  await page.getByTestId("tag-empty-remove").click();
  await focusIs("tag-comma");
  assert.equal(await a.count(), 0);
  assert.equal(await requests(), count + 1);
  assert.deepEqual(await picked(), []);
  await reset();
  await page.getByTestId("tags-reject").click();
  await b.focus();
  await page.keyboard.press("Delete");
  assert.equal(await b.count(), 1);
  await focusIs("tag-comma");
  await page.getByTestId("tags-reject").click();
  await page.getByTestId("tags-defer").click();
  await b.click();
  await page.keyboard.press("Delete");
  assert.equal(await b.count(), 1);
  assert.deepEqual(await picked(), ["a,b"]);
  await focusIs("tag-comma");
  assert.equal(await page.getByTestId("tags-pending").textContent(), "Pending");
  const beforeConfirm = await requests();
  await page.getByTestId("tags-confirm").evaluate((n) => n.click());
  await focusIs("tag-unicode");
  assert.deepEqual(await picked(), []);
  assert.equal(await requests(), beforeConfirm);
  await page.getByTestId("tags-defer").click();
  await reset();
  await page.getByTestId("tags-reject-selection").click();
  await a.click();
  assert.deepEqual(await picked(), []);
  await page.getByTestId("tags-reject-selection").click();
  await page.getByTestId("tags-readonly").click();
  const beforeLocked = await requests();
  await b.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Delete");
  assert.deepEqual(await picked(), []);
  assert.equal(await requests(), beforeLocked);
  assert.equal(await page.getByTestId("tag-comma-remove").isDisabled(), true);
  await page.keyboard.press("ArrowRight");
  await focusIs("tag-unicode");
  await page.getByTestId("tags-readonly").click();
  await page.getByTestId("tags-disabled").click();
  assert.equal(await a.getAttribute("tabindex"), "-1");
  assert.equal(await a.getAttribute("aria-disabled"), "true");
  await a.dispatchEvent("click");
  assert.deepEqual(await picked(), []);
  await page.getByTestId("tags-disabled").click();
  await page.getByTestId("tags-mode").click();
  await a.click();
  await b.click();
  assert.deepEqual(await picked(), ["a,b"]);
  await page.getByTestId("tags-mode").click();
  await a.click();
  assert.deepEqual(await picked(), []);
  assert.equal(await a.getAttribute("aria-selected"), null);
  await page.keyboard.press("Delete");
  await focusIs("tag-comma");
  assert.equal(await a.count(), 0);
  await reset();
  await page.getByTestId("tags-removable").click();
  assert.equal(await group.getAttribute("aria-colcount"), "1");
  assert.equal(await group.locator('[data-slot="tag-remove-button"]').count(), 0);
  const notRemovable = await requests();
  await a.focus();
  await page.keyboard.press("Delete");
  assert.equal(await requests(), notRemovable);
  await page.getByTestId("tags-removable").click();
  await page.getByTestId("tags-direction").click();
  await a.focus();
  await page.keyboard.press("ArrowLeft");
  await focusIs("tag-comma");
  await page.getByTestId("tags-empty").evaluate((n) => n.click());
  await focusIs("project-tags");
  assert.equal(await group.getAttribute("aria-rowcount"), "0");
  assert.equal(await group.getAttribute("tabindex"), "0");
  await page.keyboard.press("ArrowDown");
  await reset();
  await page.getByTestId("tags-mode").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const variants = [];
  for (const variant of ["default", "surface"]) {
    if ((await a.getAttribute("data-lenso-variant")) !== variant)
      await page.getByTestId("tags-variant").click();
    for (const size of ["sm", "md", "lg"]) {
      while ((await a.getAttribute("data-lenso-size")) !== size)
        await page.getByTestId("tags-size").click();
      await a.click();
      assert.deepEqual(await picked(), [""]);
      const style = await a.evaluate((n) => ({
        padding: getComputedStyle(n).paddingTop,
        font: getComputedStyle(n).fontSize,
        transition: getComputedStyle(n).transitionDuration,
      }));
      assert.equal(style.padding, size === "sm" ? "2px" : size === "md" ? "4px" : "6px");
      assert.equal(style.font, size === "lg" ? "14px" : "12px");
      assert.equal(style.transition, "0s");
      variants.push({ variant, size, style });
      await page.keyboard.press("Escape");
    }
  }
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document.getElementById("tag-empty").hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await a.locator('[data-lenso-kind="tag-lens"]').evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await page.emulateMedia({ forcedColors: "none" });
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await a.click();
      assert.deepEqual(await picked(), [""]);
      const contrast = await a.evaluate((n) => {
        const style = getComputedStyle(n),
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = canvas.height = 1;
        const luminance = (color) => {
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const a = luminance(style.color),
          b = luminance(style.backgroundColor);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      assert.ok(contrast >= 4.5, `Selected Tag hover text contrast ${contrast}`);
      await group.scrollIntoViewIfNeeded();
      const box = await group.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS,
        `${engine}-tags-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file, selectedHoverContrast: contrast });
      await page.keyboard.press("Escape");
    }
  }
  const detached = await a.elementHandle(),
    detachedGroup = await group.elementHandle();
  await page.getByTestId("tags-mounted").click();
  assert.equal(await detached.evaluate((n) => n.tabIndex), -1);
  assert.equal(await detached.evaluate((n) => n.hasAttribute("aria-rowindex")), false);
  assert.equal(await detachedGroup.evaluate((n) => n.hasAttribute("aria-rowcount")), false);
  await detached.dispose();
  await detachedGroup.dispose();
  await page.getByTestId("tags-mounted").click();
  await page.waitForFunction(() => document.getElementById("tag-empty")?.tabIndex === 0);
  await b.click();
  assert.deepEqual(await picked(), ["a,b"]);
  return {
    selection: true,
    range: true,
    deleteAndBackspace: true,
    nextPreviousEmptyFocus: true,
    removalRejection: true,
    deferredRemoval: true,
    deselectionAfterCommit: true,
    oneRequestPerButtonClick: true,
    selectionRejection: true,
    readOnlyDisabled: true,
    selectionModes: true,
    removability: true,
    rtl: true,
    variants,
    forcedColors: true,
    disposalRemount: true,
    captures,
  };
}
export async function checkTagsTouch(page) {
  await page.waitForFunction(() => document.getElementById("tag-empty")?.tabIndex === 0);
  await page.getByTestId("tag-empty").tap();
  assert.equal(await page.getByTestId("tag-empty").getAttribute("aria-selected"), "true");
  await page.getByTestId("tag-empty-remove").tap();
  assert.equal(await page.getByTestId("tag-empty").count(), 0);
  await page.waitForFunction(() => document.activeElement?.id === "tag-comma");
  return { nativeSelectRemoveTap: true };
}
