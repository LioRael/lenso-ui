import assert from "node:assert/strict";
import path from "node:path";
export async function checkColorPicker(page, engine) {
  const trigger = page.getByTestId("combined-picker-trigger"),
    popup = page.getByTestId("combined-picker-popup");
  const hue = page.getByTestId("picker-hue-input"),
    alpha = page.getByTestId("picker-alpha-input"),
    hex = page.getByTestId("picker-hex-input");
  const canonical = () => page.getByTestId("picker-value").textContent();
  const open = async () => {
    await trigger.click();
    await page.waitForFunction(
      () =>
        document.getElementById("combined-picker")?.matches(":popover-open") &&
        document.getElementById("combined-picker").hasAttribute("data-lenso-positioned"),
    );
  };
  const closed = async () =>
    page.waitForFunction(
      () => !document.getElementById("combined-picker")?.matches(":popover-open"),
    );
  await page.waitForFunction(() =>
    document.getElementById("combined-picker-trigger")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(await trigger.getAttribute("aria-haspopup"), "dialog");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () =>
      document.getElementById("combined-picker")?.matches(":popover-open") &&
      document.getElementById("combined-picker").hasAttribute("data-lenso-positioned"),
  );
  assert.equal(await popup.getAttribute("role"), "dialog");
  await page.getByRole("dialog", { name: "Color picker", exact: true }).waitFor();
  assert.equal(await trigger.getAttribute("aria-expanded"), "true");
  assert.equal(await trigger.getAttribute("aria-controls"), "combined-picker-popup");
  await page.getByTestId("picker-plane-x").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.getByTestId("picker-plane-x").getAttribute("aria-valuenow"), "51");
  const linkedHex = await hex.inputValue();
  await hue.focus();
  await page.keyboard.press("End");
  assert.equal(await hue.getAttribute("aria-valuenow"), "360");
  assert.notEqual(await hex.inputValue(), linkedHex);
  await alpha.focus();
  await page.keyboard.press("Home");
  assert.equal(await alpha.getAttribute("aria-valuenow"), "0");
  assert.ok((await hex.inputValue()).endsWith("00"));
  await hex.fill("#FF000080");
  await page.keyboard.press("Tab");
  assert.equal(await hue.getAttribute("aria-valuenow"), "0");
  assert.equal(await page.getByTestId("picker-plane-x").getAttribute("aria-valuenow"), "100");
  assert.ok(Math.abs(Number(await alpha.getAttribute("aria-valuenow")) - 128 / 255) < 0.0001);
  await page.getByTestId("picker-blue").check();
  assert.equal(await hex.inputValue(), "#0080FFFF");
  await page.getByTestId("picker-external").evaluate((n) => n.click());
  assert.equal(await hue.getAttribute("aria-valuenow"), "30");
  assert.equal(await alpha.getAttribute("aria-valuenow"), "0.75");
  await page.getByTestId("picker-reject").evaluate((n) => n.click());
  const rejected = await canonical();
  await hue.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.getElementById("picker-hue-input").value === "30");
  assert.equal(await canonical(), rejected);
  await page.getByTestId("picker-reject").evaluate((n) => n.click());
  await page.getByTestId("picker-readonly").evaluate((n) => n.click());
  assert.equal(await hex.evaluate((n) => n.readOnly), true);
  await hue.focus();
  await page.keyboard.press("End");
  assert.equal(await canonical(), rejected);
  assert.equal(await page.getByTestId("picker-blue").isDisabled(), true);
  await page.getByTestId("picker-readonly").evaluate((n) => n.click());
  await page.getByTestId("picker-disabled").evaluate((n) => n.click());
  assert.equal(await trigger.isDisabled(), true);
  assert.equal(await hue.isDisabled(), true);
  await page.getByTestId("picker-disabled").evaluate((n) => n.click());
  await page.getByTestId("picker-direction").evaluate((n) => n.click());
  await hue.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await hue.getAttribute("aria-valuenow"), "31");
  await page.keyboard.press("Escape");
  await closed();
  await page.waitForFunction(() => document.activeElement?.id === "combined-picker-trigger");
  await open();
  await page.getByTestId("picker-done").click();
  await closed();
  await page.waitForFunction(() => document.activeElement?.id === "combined-picker-trigger");
  await open();
  await page.getByTestId("picker-external").click();
  await closed();
  await open();
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document.getElementById("combined-picker-popup").hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await popup
      .locator('[data-lenso-kind="color-picker-lens"]')
      .evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await page.waitForFunction(
    () => !document.getElementById("combined-picker-popup").hasAttribute("data-material-opaque"),
  );
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await page.waitForFunction(() => document.getElementById("picker-hue-input").value === "30");
      await popup.locator('[data-slot="color-picker-content"]').evaluate((n) => (n.scrollTop = 0));
      const box = await popup.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      assert.equal(await popup.evaluate((n) => getComputedStyle(n).borderBottomLeftRadius), "58px");
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS,
        `${engine}-color-picker-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const detached = await hue.elementHandle();
  await page.getByTestId("picker-mounted").evaluate((n) => n.click());
  assert.equal(await detached.evaluate((n) => n.isConnected), false);
  assert.equal(await detached.evaluate((n) => n.disabled), true);
  await detached.dispose();
  await page.getByTestId("picker-mounted").click();
  await open();
  assert.equal(await hue.getAttribute("aria-valuenow"), "30");
  await page.getByTestId("picker-done").click();
  await closed();
  return {
    sharedColor: true,
    fieldSliderAreaPalette: true,
    controlledRejection: true,
    readOnlyDisabled: true,
    rtl: true,
    escapeAndDoneFocusReturn: true,
    outsideDismiss: true,
    openRemovalRemount: true,
    reducedMotion: true,
    forcedColors: true,
    captures,
  };
}
export async function checkColorPickerTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("combined-picker-trigger")?.hasAttribute("data-lenso-ready"),
  );
  await page.getByTestId("combined-picker-trigger").tap();
  await page.waitForFunction(() =>
    document.getElementById("combined-picker")?.hasAttribute("data-lenso-positioned"),
  );
  const area = page.getByTestId("picker-plane");
  await area.scrollIntoViewIfNeeded();
  const box = await area.boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.75, box.y + box.height * 0.75);
  assert.equal(await page.getByTestId("picker-plane-x").getAttribute("aria-valuenow"), "75");
  assert.equal(await page.getByTestId("picker-plane-y").getAttribute("aria-valuenow"), "25");
  await page.getByTestId("picker-done").tap();
  await page.waitForFunction(
    () => !document.getElementById("combined-picker").matches(":popover-open"),
  );
  return { nativeOpenEditCloseTap: true };
}
