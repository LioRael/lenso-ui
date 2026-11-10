import assert from "node:assert/strict";

export async function checkForms(page) {
  const name = page.getByRole("textbox", { name: "Name", exact: true });
  const notes = page.getByRole("textbox", { name: "Notes", exact: true });
  const checkbox = page.getByRole("checkbox", { name: "Product updates" });
  const personal = page.getByRole("radio", { name: "Personal", exact: true });
  const business = page.getByRole("radio", { name: "Business", exact: true });
  assert.equal(await page.getByRole("group", { name: "Profile", exact: true }).count(), 1);
  assert.equal(await page.getByRole("radiogroup", { name: "Account type" }).count(), 1);

  await page.waitForFunction(() => {
    const input = document.getElementById("name");
    return input?.required && getComputedStyle(input).height === "52px";
  });
  await page.getByTestId("name-label").click();
  assert.equal(await name.evaluate((node) => node === document.activeElement), true);
  assert.equal(await name.getAttribute("name"), "name");
  assert.equal(await name.getAttribute("aria-labelledby"), "name-label");
  assert.equal(await name.evaluate((node) => node.validity.valueMissing), true);

  await name.fill("a");
  assert.equal(await page.getByTestId("name-state").textContent(), "Draft: a");
  assert.equal(await name.getAttribute("aria-invalid"), "true");
  assert.equal(await name.getAttribute("aria-describedby"), "name-error");
  assert.equal(await page.getByRole("alert").textContent(), "Enter at least two characters.");
  assert.equal(await page.getByTestId("name-hint").isVisible(), false);
  assert.equal(await page.getByTestId("name-field").getAttribute("data-invalid"), "");

  await name.fill("  Ada  ");
  assert.equal(await name.inputValue(), "  Ada  ");
  assert.equal(await page.getByTestId("name-state").textContent(), "Draft:   Ada  ");
  await page.keyboard.press("Enter");
  assert.equal(await name.inputValue(), "Ada");
  assert.equal(await page.getByTestId("submitted-state").textContent(), "Submitted: Ada");
  assert.equal(await page.getByRole("alert").count(), 0);
  assert.equal(await page.getByTestId("name-hint").isVisible(), true);
  assert.equal(await page.getByTestId("name-field").getAttribute("data-invalid"), null);

  await page.getByTestId("notes-prefix").click();
  assert.equal(await notes.evaluate((node) => node === document.activeElement), true);
  assert.equal(
    await notes.evaluate((node) => getComputedStyle(node).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  await notes.fill("First line\nSecond line");
  assert.equal(
    await page.getByTestId("notes-state").textContent(),
    "Notes: First line\nSecond line",
  );
  await notes.evaluate((node) => node.setSelectionRange(0, 5));
  await page.keyboard.insertText("Edited");
  assert.equal(await notes.inputValue(), "Edited line\nSecond line");
  assert.equal(await notes.evaluate((node) => node.selectionStart), 6);

  assert.equal(await checkbox.evaluate((node) => node.indeterminate), true);
  await checkbox.focus();
  await page.keyboard.press("Space");
  assert.equal(await checkbox.isChecked(), true);
  assert.equal(await checkbox.evaluate((node) => node.indeterminate), false);
  assert.equal(await page.getByTestId("subscribe-state").textContent(), "Subscribed");
  assert.equal(
    await checkbox.evaluate((node) =>
      node.closest('[data-slot="checkbox"]').hasAttribute("data-indeterminate"),
    ),
    false,
  );

  await personal.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await business.isChecked(), true);
  assert.equal(await personal.isChecked(), false);
  assert.equal(await page.getByTestId("account-state").textContent(), "Account: business");
  await page.keyboard.press("ArrowUp");
  assert.equal(await personal.isChecked(), true);
  assert.equal(await page.getByTestId("account-state").textContent(), "Account: personal");

  await page.getByTestId("form-readonly").click();
  assert.equal(await name.evaluate((node) => node.readOnly), true);
  assert.equal(await notes.evaluate((node) => node.readOnly), true);
  await name.focus();
  await page.keyboard.type("x");
  assert.equal(await name.inputValue(), "Ada");
  await page.getByTestId("form-readonly").click();
  assert.equal(await name.evaluate((node) => node.readOnly), false);

  await page.getByTestId("form-disabled").click();
  for (const control of [name, notes, checkbox, personal, business])
    assert.equal(await control.isDisabled(), true);
  await checkbox.evaluate((node) => node.click());
  assert.equal(await checkbox.isChecked(), true);
  await page.getByTestId("form-disabled").click();
  assert.equal(await checkbox.isDisabled(), false);
  await checkbox.click();
  assert.equal(await page.getByTestId("subscribe-state").textContent(), "Not subscribed");
  await page.getByTestId("form-visible").click();
  assert.equal(await name.count(), 0);
  await page.getByTestId("form-visible").click();
  await page.getByTestId("name-label").click();
  assert.equal(await name.inputValue(), "Ada");
  assert.equal(await name.evaluate((node) => node === document.activeElement), true);
  assert.equal(await name.evaluate((node) => node.required), true);
  assert.equal(await checkbox.isChecked(), false);
  assert.equal(await checkbox.evaluate((node) => node.indeterminate), false);
}
