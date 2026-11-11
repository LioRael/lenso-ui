import assert from "node:assert/strict";
import path from "node:path";
export async function checkSwipe(page, engine) {
  const root = page.getByTestId("message-swipe");
  const trigger = (side) =>
    root.getByRole("button", {
      name: side === "start" ? "Show leading actions" : "Show trailing actions",
    });
  const side = (value) =>
    page
      .getByTestId("swipe-side")
      .filter({ hasText: `Side: ${value}` })
      .waitFor();
  await trigger("start").focus();
  await page.keyboard.press("Enter");
  await side("start");
  assert.equal(
    await page
      .getByTestId("swipe-read")
      .evaluate((n) => n.closest('[data-slot="swipe-actions-actions"]').inert),
    false,
  );
  await page.getByTestId("swipe-read").click();
  await page.getByTestId("swipe-read-count").filter({ hasText: "Read: 1" }).waitFor();
  await trigger("end").click();
  assert.equal(await page.getByTestId("swipe-archive").isDisabled(), true);
  await page.getByTestId("swipe-delete").focus();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("aria-label") === "Show trailing actions",
  );
  const drag = async (dx, dy = 0) => {
    await root.scrollIntoViewIfNeeded();
    const rect = await root.boundingBox();
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 8 });
    await page.mouse.up();
  };
  await drag(-100);
  await side("end");
  await page.keyboard.press("Escape");
  await drag(0, 40);
  assert.equal(await trigger("end").getAttribute("aria-expanded"), "false");
  await page.getByTestId("swipe-full").click();
  const width = (await root.boundingBox()).width;
  // Start near the trailing edge so a full mouse swipe stays inside the viewport.
  await root.scrollIntoViewIfNeeded();
  const rect = await root.boundingBox();
  await page.mouse.move(rect.x + rect.width - 12, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + 12, rect.y + rect.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.getByTestId("swipe-delete-count").filter({ hasText: "Deleted: 1" }).waitFor();
  assert.ok(width > 0);
  await trigger("start").click();
  await page.getByTestId("swipe-editing").evaluate((n) => n.click());
  assert.equal(await trigger("start").isDisabled(), true);
  assert.equal(
    await page
      .getByTestId("swipe-read")
      .evaluate((n) => n.closest('[data-slot="swipe-actions-actions"]').inert),
    true,
  );
  await page.getByTestId("swipe-editing").evaluate((n) => n.click());
  await page.keyboard.press("Escape");
  await page.getByTestId("swipe-direction").click();
  await drag(100);
  await side("end");
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await root.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-swipe-${theme}-${width}.png`,
        ),
      });
      captures.push({ width, theme });
    }
  }
  const content = await root.locator('[data-slot="swipe-actions-content"]').elementHandle();
  await page.getByTestId("swipe-mounted").evaluate((n) => n.click());
  assert.equal(await content.evaluate((n) => n.style.transform), "");
  await content.dispose();
  await page.getByTestId("swipe-mounted").evaluate((n) => n.click());
  await trigger("end").click();
  await page.keyboard.press("Escape");
  return {
    keyboard: true,
    mouse: true,
    verticalGesture: true,
    fullSwipeOptIn: true,
    rtl: true,
    disabledEditing: true,
    disposal: true,
    captures,
  };
}
