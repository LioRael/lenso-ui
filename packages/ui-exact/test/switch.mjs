import assert from "node:assert/strict";
import path from "node:path";

// Native input/form state and pointer commits must agree with the Exact value.
export async function checkSwitch(page, engine) {
  const viewport = page.viewportSize();
  const appearance = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const control = page.getByTestId("switch-notifications");
  const input = page.getByTestId("switch-notifications-input");
  const changes = page.getByTestId("switch-changes");
  const checked = async (value) => {
    await page.waitForFunction(
      ({ value }) =>
        document.getElementById("switch-notifications").getAttribute("aria-checked") ===
        String(value),
      { value },
    );
    assert.equal(await input.isChecked(), value);
  };
  await control.scrollIntoViewIfNeeded();
  await control.hover();
  assert.equal(
    await control.evaluate((n) => getComputedStyle(n).backgroundImage),
    "none",
    "Exact's default hover wash must not fill the whole switch row",
  );
  assert.equal(await page.getByRole("switch", { name: "Notifications", exact: true }).count(), 1);
  assert.equal(await control.getAttribute("aria-describedby"), "switch-description");
  assert.equal(await input.getAttribute("name"), "notifications");
  await checked(false);
  await control.focus();
  await page.keyboard.press("Space");
  await checked(true);
  await page.keyboard.press("Enter");
  await checked(false);
  await control.locator('[data-slot="switch-content"]').click({ position: { x: 100, y: 14 } });
  await checked(true);
  assert.equal(await changes.textContent(), "Switch changes: 3");
  await page.getByTestId("switch-readonly").click();
  await control.focus();
  await page.keyboard.press("Space");
  await control.evaluate((n) => n.click());
  await input.evaluate((n) => n.click());
  await checked(true);
  assert.equal(await changes.textContent(), "Switch changes: 3");
  await page.getByTestId("switch-readonly").click();
  await page.getByTestId("switch-disabled").click();
  assert.equal(await control.evaluate((n) => n.disabled), true);
  await control.evaluate((n) => n.click());
  await checked(true);
  await page.getByTestId("switch-disabled").click();
  await page.getByTestId("switch-reset").click();
  await checked(false);
  await page.getByTestId("switch-required").click();
  assert.equal(await input.evaluate((n) => n.checkValidity()), false);
  assert.equal(await control.evaluate((n) => n === document.activeElement), true);
  await page.keyboard.press("Space");
  await checked(true);
  assert.equal(await input.evaluate((n) => n.checkValidity()), true);
  await input.evaluate((n) => {
    const form = document.createElement("form");
    form.id = "switch-native-form";
    document.body.append(form);
    n.setAttribute("form", form.id);
  });
  const formValue = () =>
    page.evaluate(() =>
      new FormData(document.getElementById("switch-native-form")).get("notifications"),
    );
  assert.equal(await formValue(), "enabled");
  await page.locator("#switch-native-form").evaluate((n) => n.reset());
  await checked(false);
  assert.equal(await formValue(), null);
  await control.focus();
  await page.keyboard.press("Space");
  await checked(true);
  await page.getByTestId("switch-reset").click();
  await checked(false);
  const track = control.locator('[data-slot="switch-control"]');
  for (const width of [76.8, 51.2, 64]) {
    await page.getByTestId("switch-size").click();
    assert.ok(Math.abs((await track.boundingBox()).width - width) < 0.1);
  }
  // Drag commits once; the browser's subsequent pointer click must not toggle twice.
  const drag = async (from, to) => {
    const box = await track.boundingBox();
    await page.mouse.move(box.x + from, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + to, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
  };
  const before = Number((await changes.textContent()).split(": ")[1]);
  await drag(10, 48);
  await checked(true);
  assert.equal(Number((await changes.textContent()).split(": ")[1]), before + 1);
  await drag(48, 10);
  await checked(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await control.focus();
  await page.keyboard.press("Space");
  await checked(true);
  await page.waitForFunction(
    () =>
      document.getElementById("switch-notifications").style.getPropertyValue("--lg-switch-x") ===
      "22px",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const theme of ["light", "dark"]) {
    await page
      .locator("[data-theme]")
      .first()
      .evaluate((n, theme) => n.setAttribute("data-theme", theme), theme);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 844 });
      await control.scrollIntoViewIfNeeded();
      await page.locator("#switch-examples").screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-switch-${theme}-${width}.png`,
        ),
      });
    }
  }
  await page.locator("#switch-native-form").evaluate((n) => n.remove());
  const old = await control.elementHandle();
  await page.getByTestId("switch-visible").click();
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-switch-x")), "");
  await page.getByTestId("switch-visible").click();
  await checked(true);
  await old.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, appearance) => n.setAttribute("data-theme", appearance), appearance);
  if (viewport) await page.setViewportSize(viewport);
}
