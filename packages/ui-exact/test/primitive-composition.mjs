import assert from "node:assert/strict";
import path from "node:path";
export async function checkPrimitiveDescription(page, url, name, artifacts) {
  const snapshots = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.goto(url);
      await page.waitForFunction(
        () =>
          document.getElementById("name")?.required &&
          getComputedStyle(document.getElementById("name")).height === "52px",
      );
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      const snapshot = await page.evaluate(() =>
        ["name-hint", "notes-hint", "updates-hint", "account-hint"].map((id) => {
          const n = document.getElementById(id),
            style = getComputedStyle(n),
            rect = n.getBoundingClientRect();
          return {
            id,
            tag: n.tagName,
            text: n.textContent,
            slot: n.dataset.slot,
            kind: n.dataset.lensoKind,
            hatch: n.getAttribute("data-hatch"),
            parent: n.parentElement.dataset.lensoKind,
            width: rect.width,
            height: rect.height,
            font: style.font,
            fontSize: style.fontSize,
            color: style.color,
            padding: style.padding,
            wrappers: n.querySelectorAll("*").length,
          };
        }),
      );
      assert.ok(
        snapshot.every(
          (n) => n.kind === "description" && n.slot === "description" && n.wrappers === 0,
        ),
      );
      const textarea = await page.getByTestId("notes").evaluate((n) => {
        const style = getComputedStyle(n),
          rect = n.getBoundingClientRect();
        return {
          tag: n.tagName,
          id: n.id,
          name: n.name,
          rows: n.rows,
          readOnly: n.readOnly,
          disabled: n.disabled,
          required: n.required,
          value: n.value,
          label: n.getAttribute("aria-label"),
          labelledBy: n.getAttribute("aria-labelledby"),
          describedBy: n.getAttribute("aria-describedby"),
          width: rect.width,
          height: rect.height,
          padding: style.padding,
          font: style.font,
          color: style.color,
          background: style.backgroundColor,
          parent: n.parentElement.dataset.lensoKind,
        };
      });
      const choices = await page.evaluate(() =>
        ["subscribe", "personal", "business"].map((id) => {
          const n = document.getElementById(id);
          return n
            ? {
                id,
                tag: n.tagName,
                type: n.type,
                value: n.value,
                checked: n.checked,
                indeterminate: n.indeterminate,
                name: n.name,
                required: n.required,
                disabled: n.disabled,
                describedBy: n.getAttribute("aria-describedby"),
                label: n.getAttribute("aria-label"),
                kind: n.dataset.lensoKind,
                parent: n.parentElement.dataset.lensoKind,
              }
            : { id, missing: true };
        }),
      );
      const file = path.join(artifacts, `${name}-${theme}-${width}.png`);
      await page.getByRole("group", { name: "Profile", exact: true }).screenshot({ path: file });
      snapshots.push({ width, theme, description: snapshot, textarea, choices, capture: file });
    }
  }
  return snapshots;
}

export async function checkPrimitiveChoiceValues(page) {
  const empty = page.getByTestId("choice-empty"),
    space = page.getByTestId("choice-space");
  assert.equal(await empty.isChecked(), false);
  assert.equal(await space.isChecked(), false);
  assert.equal(await empty.inputValue(), "");
  assert.equal(await space.inputValue(), " ");
  await empty.check();
  assert.equal(await empty.isChecked(), true);
  assert.equal(await space.isChecked(), false);
  await page.getByTestId("choice-edge-value").filter({ hasText: "empty" }).waitFor();
  await space.check();
  assert.equal(await space.isChecked(), true);
  assert.equal(await empty.isChecked(), false);
  await page.getByTestId("choice-edge-value").filter({ hasText: "space" }).waitFor();
  const submitted = await space.evaluate((n) => {
    const parent = n.parentElement,
      next = n.nextSibling,
      form = document.createElement("form");
    n.closest("#choice-compatibility").append(form);
    try {
      form.append(n);
      return [...new FormData(form)];
    } finally {
      parent.insertBefore(n, next);
      form.remove();
    }
  });
  assert.deepEqual(submitted, [["choice-edge", " "]]);
  assert.equal(await space.evaluate((n) => n.parentElement.dataset.slot), "radio");
  return { emptyAndWhitespace: true, radioFormPayload: true, fixtureRestored: true };
}
