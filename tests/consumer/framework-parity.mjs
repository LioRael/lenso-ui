import assert from "node:assert/strict";

/** Run the same public interactions against the installed React and Vue packages.
 * @param {import('playwright').Page} page */
export async function checkFrameworkParity(page) {
  const root = page.getByRole("region", { name: "Adapter parity" });
  const nav = root.getByRole("navigation", { name: "Breadcrumb" });
  const previous = nav.getByRole("link", { name: "Before" });
  assert.equal(await previous.getAttribute("href"), null);
  assert.equal(await previous.getAttribute("tabindex"), "-1");
  assert.equal(
    await nav.getByRole("link", { name: "Current" }).getAttribute("aria-current"),
    "page",
  );
  assert.equal(await nav.locator('[aria-hidden="true"]').innerText(), "/");

  const input = root.getByRole("textbox", { name: "Account alias" });
  await input.fill("Updated name");
  const field = root
    .locator('[data-lenso-slot="text-field"]')
    .filter({ has: page.getByRole("textbox", { name: "Account alias" }) });
  assert.equal(await field.getAttribute("data-field-layout"), "row");
  assert.equal(await root.locator('[data-field-layout="stacked"][data-field-grouped]').count(), 1);
  const clear = field.getByRole("button", { name: "Erase account alias" });
  await clear.click();
  assert.equal(await input.inputValue(), "");
  assert(await input.evaluate((node) => node === document.activeElement));
  for (const control of [
    field.locator('[data-lenso-slot="text-field-control"]'),
    root.getByLabel("Standalone alias"),
  ]) {
    assert.equal(
      await control.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--lg-material").trim(),
      ),
      "apple",
    );
    await control.hover();
    await page.mouse.down();
    assert(await control.evaluate((node) => node.hasAttribute("data-lenso-pressed")));
    await page.mouse.up();
  }
  const items = root.locator('[data-lenso-slot="accordion-item"]');
  /** @param {Element} node */
  const separator = (node) => getComputedStyle(node, "::after").display;
  assert.equal(await items.nth(0).evaluate(separator), "none");
  assert.notEqual(await items.nth(1).evaluate(separator), "none");
  const trigger = root.getByRole("button", { name: "Account details" });
  await trigger.press("Enter");
  assert.equal(await trigger.getAttribute("aria-expanded"), "true");
  await root.getByText("Account panel", { exact: true }).waitFor();
  assert.notEqual(
    await root
      .getByRole("button", { name: "Surface option" })
      .evaluate((node) => getComputedStyle(node).borderTopLeftRadius),
    "0px",
  );

  const clipped = root.getByTestId("clip-avatars"),
    ring = root.getByTestId("ring-avatars");
  assert.equal(await clipped.locator(":scope > *").count(), 3);
  assert.equal(await clipped.locator('[data-lenso-slot="avatar-group-count"]').innerText(), "+2");
  assert.match(
    await clipped
      .locator('[data-lenso-slot="avatar"]')
      .first()
      .evaluate((node) => getComputedStyle(node).maskImage),
    /gradient/,
  );
  assert.equal(await ring.locator('[data-lenso-slot="avatar-group-count"]').innerText(), "Others");
  assert.notEqual(
    await ring
      .locator('[data-lenso-slot="avatar"]')
      .first()
      .evaluate((node) => getComputedStyle(node).boxShadow),
    "none",
  );

  await root.getByRole("button", { name: "Review layout" }).click();
  const modal = page.getByRole("dialog", { name: "Layout review" });
  await modal.waitFor();
  const popup = page.locator('[data-lenso-slot="modal-popup"][data-size="sm"]');
  assert.equal(await popup.evaluate((node) => getComputedStyle(node).maxWidth), "384px");
  assert.equal(await popup.getAttribute("data-scroll"), "outside");
  assert.equal(await popup.getAttribute("data-placement"), "top");
  await modal.getByRole("button", { name: "Close" }).click();
  await modal.waitFor({ state: "hidden" });

  await root.getByRole("button", { name: "Review action" }).click();
  const alert = page.getByRole("alertdialog", { name: "Remove entry?" });
  await alert.waitFor();
  assert.equal(
    await page.locator('[data-lenso-slot="alert-dialog-popup"]').getAttribute("data-placement"),
    "bottom",
  );
  assert.equal(
    await page
      .locator('[data-lenso-slot="alert-dialog-popup"]')
      .evaluate((node) => getComputedStyle(node).width),
    "280px",
  );
  const action = alert
    .locator('[data-lenso-slot="alert-dialog-scroller"] [data-layout="stacked"]')
    .getByRole("button", { name: "Remove entry" });
  assert.equal(await action.getAttribute("data-variant"), "destructive");
  await action.click();
  await alert.waitFor({ state: "hidden" });

  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 390, height: 844 });
  await root.getByRole("button", { name: "Show detents" }).click();
  const sheet = page.getByRole("dialog", { name: "Detent review", exact: true });
  await sheet.waitFor();
  const surface = '[data-sheet-adaptive] > [data-lenso-slot="sheet-surface"]';
  /** @param {string} value */
  const inset = (value) =>
    page.waitForFunction(
      ({ selector, px }) => {
        const node = document.querySelector(selector);
        return node && getComputedStyle(node).getPropertyValue("--sheet-edge-inset").trim() === px;
      },
      { selector: surface, px: value },
    );
  await inset("6px");
  const floatingWidth = await page
    .locator(surface)
    .evaluate((node) => node.getBoundingClientRect().width);
  await sheet.getByRole("button", { name: "Resize sheet" }).press("ArrowUp");
  await inset("0px");
  assert(
    (await page.locator(surface).evaluate((node) => node.getBoundingClientRect().width)) >
      floatingWidth,
  );
  await sheet.getByRole("button", { name: "Open child sheet" }).click();
  const child = page.getByRole("dialog", { name: "Child sheet", exact: true });
  await child.waitFor();
  assert.equal(await page.locator("[data-sheet-nested]").count(), 1);
  await child.getByRole("button", { name: "Close child" }).click();
  await child.waitFor({ state: "hidden" });
  await sheet.getByRole("button", { name: "Finish detents" }).click();
  await sheet.waitFor({ state: "hidden" });
  if (viewport) await page.setViewportSize(viewport);
}
