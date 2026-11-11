import path from "node:path";
import assert from "node:assert/strict";
export async function checkListPointer(page, engine = "browser") {
  await page.getByTestId("list-edit").click();
  const handle = page.getByTestId("recent-move");
  const source = page.getByTestId("library-recent");
  const target = page.getByTestId("library-archive");
  await source.evaluate((n) => {
    n.style.transform = "translateX(0px)";
    n.style.zIndex = "2";
  });
  const begin = async () => {
    await handle.scrollIntoViewIfNeeded();
    const rect = await handle.boundingBox();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
  };
  await begin();
  let rect = await target.boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height - 2, { steps: 8 });
  assert.equal(await handle.getAttribute("aria-pressed"), "true");
  assert.equal(await source.evaluate((n) => n.style.zIndex), "4");
  assert.notEqual(
    await source.evaluate((n) => getComputedStyle(n).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  await page.getByTestId("library-list").screenshot({
    path: path.join(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ??
        path.resolve(import.meta.dirname, "../.cache/example"),
      `${engine}-list-drag.png`,
    ),
  });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  assert.equal(await source.evaluate((n) => n.style.transform), "translateX(0px)");
  assert.equal(await source.evaluate((n) => n.style.zIndex), "2");
  await begin();
  rect = await target.boundingBox();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height - 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForFunction(
    () =>
      document.querySelector('#library-list > [data-slot="list-item"]').id === "library-archive",
  );
  assert.equal(await page.getByTestId("list-move-request").textContent(), "recent:after:archive");
  assert.equal(await source.evaluate((n) => n.style.transform), "translateX(0px)");
  assert.equal(await target.evaluate((n) => n.style.boxShadow), "");
  await begin();
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  await page.mouse.up();
  assert.equal(await handle.getAttribute("aria-pressed"), "false");
  await page.getByTestId("list-disabled").evaluate((n) => n.click());
  await begin();
  await page.getByTestId("list-edit").evaluate((n) => n.click());
  await page.mouse.up();
  assert.equal(await source.evaluate((n) => n.style.transform), "translateX(0px)");
  await page.getByTestId("list-edit").click();
  await begin();
  await handle.evaluate((n) => {
    const event = new PointerEvent("pointercancel", { pointerId: 1, bubbles: true });
    n.dispatchEvent(event);
  });
  await page.mouse.up();
  assert.equal(await handle.getAttribute("aria-pressed"), "false");
  await page.getByTestId("library-list").evaluate((n) => {
    n.style.height = "180px";
    n.style.overflowY = "auto";
    n.scrollTop = 0;
    for (const row of n.querySelectorAll(':scope > [data-slot="list-item"]'))
      row.style.minHeight = "200px";
  });
  const scrollHandle = page.getByTestId("archive-move");
  await scrollHandle.scrollIntoViewIfNeeded();
  const scrollBox = await scrollHandle.boundingBox();
  const viewport = await page.getByTestId("library-list").boundingBox();
  const initialScroll = await page.getByTestId("library-list").evaluate((n) => n.scrollTop);
  const maxScroll = await page
    .getByTestId("library-list")
    .evaluate((n) => n.scrollHeight - n.clientHeight);
  await page.mouse.move(scrollBox.x + scrollBox.width / 2, scrollBox.y + scrollBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(scrollBox.x + scrollBox.width / 2, viewport.y + viewport.height - 2, {
    steps: 8,
  });
  await page.waitForFunction(
    (initial) => document.getElementById("library-list").scrollTop > initial,
    initialScroll,
  );
  await page.waitForFunction(
    (max) => document.getElementById("library-list").scrollTop >= max - 1,
    maxScroll,
  );
  const boundedScroll = await page
    .getByTestId("library-list")
    .evaluate(
      (n) =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(n.scrollTop))),
        ),
    );
  assert.ok(
    boundedScroll <= maxScroll + 1,
    `Edge scroll must retain its initial bound: ${boundedScroll} > ${maxScroll}`,
  );
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await page.getByTestId("library-list").evaluate((n) => {
    n.style.removeProperty("height");
    n.style.removeProperty("overflow-y");
    for (const row of n.querySelectorAll(':scope > [data-slot="list-item"]'))
      row.style.removeProperty("min-height");
  });
  await page.getByTestId("list-edit").click();
  await source.evaluate((n) => {
    n.style.removeProperty("transform");
    n.style.removeProperty("z-index");
  });
  return {
    nativeMouse: true,
    edgeScrollFixture: true,
    commit: true,
    escapeRestore: true,
    disableCancellation: true,
    removalCleanup: true,
  };
}
