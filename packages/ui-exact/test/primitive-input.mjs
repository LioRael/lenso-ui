import assert from "node:assert/strict";
export async function checkPrimitiveInputModes(page) {
  const input = page.getByTestId("mode-input");
  const modes = ["text", "search", "email", "url", "tel", "password"];
  const element = await input.elementHandle();
  const snapshots = [];
  for (const [index, mode] of modes.entries()) {
    await input.focus();
    await page.getByTestId(`mode-${mode}`).evaluate((n) => n.click());
    await page.waitForFunction((mode) => document.getElementById("mode-input").type === mode, mode);
    assert.equal(
      await element.evaluate((n) => n.isConnected && n === document.getElementById("mode-input")),
      true,
    );
    assert.equal(await input.evaluate((n) => n === document.activeElement), true);
    const value = String(10 + index);
    await input.fill(value);
    await page
      .getByTestId("mode-live")
      .filter({ hasText: `Live: ${value}` })
      .waitFor();
    await page.getByTestId("mode-blur").click();
    await page
      .getByTestId("mode-committed")
      .filter({ hasText: `Committed: ${value}` })
      .waitFor();
    await input.focus();
    await page.keyboard.press("Enter");
    await page
      .getByTestId("mode-submitted")
      .filter({ hasText: `Submitted: ${index + 1}` })
      .waitFor();
    snapshots.push(
      await input.evaluate((n) => ({
        type: n.type,
        value: n.value,
        name: n.name,
        required: n.required,
        autocomplete: n.autocomplete,
        label: n.getAttribute("aria-label"),
        tag: n.tagName,
      })),
    );
  }
  await page.getByTestId("mode-text").evaluate((n) => n.click());
  await input.fill("editing");
  await input.evaluate((n) => n.setSelectionRange(0, 4));
  await page.keyboard.type("keep");
  assert.equal(await input.inputValue(), "keeping");
  await page.getByTestId("mode-readonly").evaluate((n) => n.click());
  assert.equal(await input.evaluate((n) => n.readOnly), true);
  await page.keyboard.type("x");
  assert.equal(await input.inputValue(), "keeping");
  await page.getByTestId("mode-readonly").evaluate((n) => n.click());
  await page.getByTestId("mode-disabled").evaluate((n) => n.click());
  assert.equal(await input.isDisabled(), true);
  await page.getByTestId("mode-disabled").evaluate((n) => n.click());
  assert.equal(await input.isDisabled(), false);
  const legacy = page.getByTestId("legacy-number");
  assert.equal(await legacy.getAttribute("type"), "number");
  assert.equal(await legacy.inputValue(), "7");
  await element.dispose();
  return {
    snapshots,
    identityAcrossModes: true,
    focusAcrossModes: true,
    liveCommitSubmit: true,
    selection: true,
    readonly: true,
    disabled: true,
  };
}
