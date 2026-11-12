import assert from "node:assert/strict";
import path from "node:path";

export async function checkToggle(page, engine) {
  const favorite = page.getByTestId("favorite");
  const pin = page.getByTestId("favorite-icon");
  const group = page.getByRole("group", { name: "Formatting", exact: true });
  const bold = page.getByTestId("format-bold");
  const italic = page.getByTestId("format-italic");
  const last = page.getByTestId("format-underline");
  const locked = page.getByTestId("format-locked");
  const selected = page.getByTestId("format-value");
  const focusIs = async (node) =>
    assert.equal(await node.evaluate((n) => document.activeElement === n), true);
  const tabStops = () => group.locator(':scope > button[tabindex="0"]').count();
  assert.equal(await favorite.getAttribute("aria-pressed"), "false");
  await favorite.focus();
  await page.keyboard.press("Space");
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  assert.equal(await pin.getAttribute("aria-pressed"), "true");
  await page.keyboard.press("Enter");
  assert.equal(await favorite.getAttribute("aria-pressed"), "false");
  assert.equal(await pin.getAttribute("aria-label"), "Pin");
  assert.equal(await pin.locator('[data-slot="button-icon"][aria-hidden="true"]').count(), 1);
  assert.equal(await tabStops(), 1);
  assert.equal(await italic.getAttribute("tabindex"), "0");
  assert.equal(await locked.isDisabled(), true);
  await bold.focus();
  await page.keyboard.press("ArrowRight");
  await focusIs(italic);
  assert.equal(
    await selected.textContent(),
    "italic",
    "arrows move focus without changing selection",
  );
  await page.keyboard.press("ArrowRight");
  await focusIs(last);
  await page.keyboard.press("ArrowRight");
  await focusIs(bold);
  await page.keyboard.press("End");
  await focusIs(last);
  await page.keyboard.press("Home");
  await focusIs(bold);
  assert.notEqual(await bold.evaluate((n) => getComputedStyle(n).boxShadow), "none");
  await page.keyboard.press("Enter");
  assert.equal(await selected.textContent(), "bold");
  assert.equal(await italic.getAttribute("aria-pressed"), "false");
  await page.keyboard.press("Space");
  assert.equal(await selected.textContent(), "", "single selection can clear");
  await page.keyboard.press("Space");
  await page.getByTestId("toggle-multiple").click();
  await italic.click();
  assert.equal(await selected.textContent(), "bold, italic");
  await bold.click();
  assert.equal(await selected.textContent(), "italic");
  await page.getByTestId("toggle-multiple").click();
  await page.getByTestId("toggle-loop").click();
  await last.focus();
  await page.keyboard.press("ArrowRight");
  await focusIs(last);
  await page.getByTestId("toggle-loop").click();
  await page.getByTestId("toggle-direction").click();
  await bold.focus();
  await page.keyboard.press("ArrowLeft");
  await focusIs(italic);
  await page.locator("#toggle-examples").screenshot({
    path: path.resolve(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ?? path.join(import.meta.dirname, "../.cache/example"),
      `${engine}-toggle-rtl.png`,
    ),
  });
  await page.getByTestId("toggle-direction").click();
  await page.getByTestId("toggle-orientation").click();
  await bold.focus();
  await page.keyboard.press("ArrowDown");
  await focusIs(italic);
  await page.keyboard.press("ArrowLeft");
  await focusIs(italic);
  await page.getByTestId("toggle-orientation").click();
  await page.getByTestId("toggle-item-disabled").click();
  assert.equal(await bold.isDisabled(), true);
  await italic.focus();
  await page.keyboard.press("Home");
  await focusIs(italic);
  assert.equal(await bold.getAttribute("tabindex"), "-1");
  await page.getByTestId("toggle-item-disabled").click();
  await page.getByTestId("toggle-disabled").click();
  assert.equal(await tabStops(), 0);
  for (const item of [favorite, pin, bold, italic, last]) {
    assert.equal(await item.isDisabled(), true);
    await item.evaluate((n) => n.click());
  }
  assert.equal(await favorite.getAttribute("aria-pressed"), "false");
  assert.equal(await selected.textContent(), "italic");
  await page.getByTestId("toggle-disabled").click();
  assert.equal(await tabStops(), 1);
  await last.focus();
  await page.getByTestId("toggle-extra").click();
  assert.equal(await last.count(), 0);
  assert.equal(await tabStops(), 1);
  await page.getByTestId("toggle-extra").click();
  assert.equal(await last.count(), 1);
  assert.equal(await tabStops(), 1);
  await page.getByTestId("toggle-nested").click();
  const one = page.getByTestId("inner-one");
  const two = page.getByTestId("inner-two");
  await one.focus();
  await page.keyboard.press("ArrowRight");
  await focusIs(two);
  await page.keyboard.press("ArrowRight");
  await focusIs(one);
  await page.keyboard.press("Space");
  assert.equal(await selected.textContent(), "italic", "nested values remain independent");
  await bold.focus();
  await page.keyboard.press("End");
  await focusIs(last);
  await page.getByTestId("toggle-nested").click();

  for (const height of [50, 28, 34]) {
    await page.getByTestId("toggle-size").click();
    assert.equal(await favorite.evaluate((n) => n.getBoundingClientRect().height), height);
    const bounds = await pin.evaluate((n) => {
      const { width, height } = n.getBoundingClientRect();
      return { width, height };
    });
    assert.equal(bounds.width, bounds.height);
  }
  for (const variant of ["prominent", "borderless", "default", "ghost", "bordered"]) {
    await page.getByTestId("toggle-variant").click();
    assert.equal(await favorite.getAttribute("data-lenso-variant"), variant);
    await favorite.click();
    assert.equal(await favorite.getAttribute("aria-pressed"), "true");
    assert.equal(await favorite.getAttribute("data-lenso-pressed"), null);
    await favorite.click();
    assert.equal(await favorite.getAttribute("aria-pressed"), "false");
  }
  await page.getByTestId("toggle-detached").click();
  assert.equal(await group.evaluate((n) => getComputedStyle(n).gap), "4px");
  await page.getByTestId("toggle-width").click();
  const widths = await group.evaluate((n) =>
    [...n.querySelectorAll(":scope > button")].map((b) => b.getBoundingClientRect().width),
  );
  assert.ok(Math.max(...widths) - Math.min(...widths) < 1);
  await page.getByTestId("toggle-width").click();
  await page.getByTestId("toggle-detached").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-testid="favorite"]')).transitionDuration ===
      "0s",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const retired = await bold.elementHandle();
  await page.getByTestId("toggle-visible").click();
  assert.equal(await group.count(), 0);
  assert.equal(
    await retired.evaluate((n) =>
      n.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
      ),
    ),
    true,
    "removed group releases its key handler",
  );
  await retired.dispose();
  await page.getByTestId("toggle-visible").click();
  assert.equal(await selected.textContent(), "italic");
  assert.equal(await italic.getAttribute("aria-pressed"), "true");
  assert.equal(await tabStops(), 1);
  assert.equal(await italic.getAttribute("tabindex"), "0");
}
