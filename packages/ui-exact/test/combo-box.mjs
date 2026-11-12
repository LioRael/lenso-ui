import assert from "node:assert/strict";
import path from "node:path";
export async function checkComboBox(page, engine) {
  const root = page.getByTestId("framework-combo"),
    input = page.getByTestId("framework-combo-input"),
    popup = page.getByTestId("framework-combo-popup"),
    multi = page.getByTestId("frameworks-combo"),
    many = page.getByTestId("frameworks-combo-input");
  const selected = () =>
    root
      .locator('[role="option"][aria-selected="true"]')
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.lensoValue));
  const chips = () =>
    multi
      .locator('[data-slot="combo-box-chip"]')
      .evaluateAll((nodes) => nodes.map((n) => n.dataset.lensoValue));
  const visible = () =>
    root
      .locator('[data-slot="combo-box-item"]:not([hidden])')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("aria-label")));
  const open = () =>
    page.waitForFunction(
      () =>
        document.getElementById("framework-combo-popup")?.matches(":popover-open") &&
        document.getElementById("framework-combo-popup").hasAttribute("data-lenso-positioned"),
    );
  const closed = () =>
    page.waitForFunction(
      () => !document.getElementById("framework-combo-popup")?.matches(":popover-open"),
    );
  const focused = () =>
    page.waitForFunction(() => document.activeElement?.id === "framework-combo-input");
  const activeValue = () =>
    input.evaluate(
      (n) =>
        document.getElementById(n.getAttribute("aria-activedescendant"))?.dataset.lensoValue ??
        null,
    );
  await page.waitForFunction(
    () =>
      document.getElementById("framework-combo-input")?.getAttribute("aria-autocomplete") ===
      "list",
  );
  assert.equal(await input.getAttribute("role"), "combobox");
  assert.equal(await input.inputValue(), "React");
  assert.equal(await input.getAttribute("aria-expanded"), "false");
  await input.fill("re");
  await open();
  await focused();
  assert.deepEqual(await visible(), ["React", "Reason (unavailable)", "Résumé"]);
  assert.equal(await page.locator("#combo-more-group").getAttribute("hidden"), "");
  assert.equal(await root.locator('[data-slot="combo-box-separator"]').getAttribute("hidden"), "");
  assert.equal(await activeValue(), "react");
  await page.keyboard.press("ArrowDown");
  assert.equal(await activeValue(), "");
  await focused();
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), [""]);
  assert.equal(await input.inputValue(), "Résumé");
  await focused();
  await page.getByTestId("framework-combo-trigger").click();
  await open();
  assert.equal((await visible()).length, 5);
  assert.equal(await page.locator("#combo-more-group").getAttribute("hidden"), null);
  assert.equal(
    await root.locator('[data-slot="combo-box-separator"]').getAttribute("hidden"),
    null,
  );
  await page.keyboard.press("Home");
  assert.equal(await input.evaluate((n) => n.selectionStart), 0);
  await page.keyboard.press("End");
  assert.equal(await input.evaluate((n) => n.selectionStart), "Résumé".length);
  await page.keyboard.press("ArrowUp");
  assert.equal(await activeValue(), "react");
  await page.keyboard.press("ArrowUp");
  assert.equal(await activeValue(), "雪");
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), ["雪"]);
  await input.fill("does-not-exist");
  await open();
  assert.deepEqual(await visible(), []);
  assert.equal(await activeValue(), null);
  assert.equal(await page.getByTestId("framework-combo-empty").isVisible(), true);
  assert.equal(
    await page.getByTestId("framework-combo-status").textContent(),
    "Matching options: 0",
  );
  await page.keyboard.press("Enter");
  assert.deepEqual(await selected(), ["雪"]);
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(await input.inputValue(), "Svelte");
  await input.fill("resume");
  await open();
  assert.deepEqual(await visible(), ["Résumé"]);
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), [""]);
  await input.fill("");
  await closed();
  await page.waitForFunction(
    () => document.querySelector('#framework-combo [data-slot="combo-box-validity"]').value === "",
  );
  assert.deepEqual(await selected(), []);
  await input.fill("resume");
  await open();
  await page.keyboard.press("Enter");
  await closed();
  await page.getByTestId("combo-reject-query").click();
  await input.fill("bad");
  await open();
  await page.waitForFunction(
    () => document.getElementById("framework-combo-input").value === "Résumé",
  );
  assert.equal(await input.inputValue(), "Résumé");
  assert.equal(await page.getByTestId("combo-query").textContent(), "Résumé");
  await page.keyboard.press("Escape");
  await closed();
  await page.getByTestId("combo-reject-query").click();
  await page.getByTestId("combo-reject").click();
  await input.fill("Solid");
  await open();
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), [""]);
  await page.getByTestId("combo-reject").click();
  await input.fill("Solid");
  await open();
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), ["a,b"]);
  assert.equal(await input.inputValue(), "Solid");
  await many.fill("re");
  await page.waitForFunction(() =>
    document.getElementById("frameworks-combo-popup").matches(":popover-open"),
  );
  await page.keyboard.press("Enter");
  assert.deepEqual(await chips(), ["react"]);
  assert.equal(await many.inputValue(), "");
  assert.equal(await many.evaluate((n) => document.activeElement === n), true);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  assert.deepEqual(await chips(), ["react", ""]);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  assert.deepEqual(await chips(), ["react", "", "a,b"]);
  await page.keyboard.press("Backspace");
  assert.deepEqual(await chips(), ["react", ""]);
  await page.keyboard.press("ArrowLeft");
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  assert.equal(
    await page.getByTestId("frameworks-combo-chip-1").evaluate((n) => n === document.activeElement),
    true,
  );
  await page.keyboard.press("Delete");
  assert.deepEqual(await chips(), ["react"]);
  assert.equal(
    await page.getByTestId("frameworks-combo-chip-0").evaluate((n) => n === document.activeElement),
    true,
  );
  await page.keyboard.press("Enter");
  assert.equal(await many.evaluate((n) => n === document.activeElement), true);
  await page.getByTestId("frameworks-combo-chip-remove-0").click();
  assert.deepEqual(await chips(), []);
  await page.waitForFunction(() => document.activeElement?.id === "frameworks-combo-input");
  const queryCount = async () =>
    Number((await page.getByTestId("combo-queries").textContent()).replace("Queries: ", ""));
  const beforeComposition = await queryCount();
  await input.evaluate((n) => {
    n.focus();
    n.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    n.value = "resume";
    n.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "resume" }));
  });
  assert.equal(await page.getByTestId("combo-query").textContent(), "Solid");
  await page.getByTestId("theme").evaluate((n) => n.click());
  assert.equal(await input.inputValue(), "resume");
  await input.evaluate((n) => {
    n.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "resume" }));
    n.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: false, data: "resume" }));
  });
  await open();
  assert.equal(await queryCount(), beforeComposition + 1);
  assert.equal(await page.getByTestId("combo-query").textContent(), "resume");
  await page.keyboard.press("Escape");
  await closed();
  await page.getByTestId("combo-external").click();
  assert.deepEqual(await selected(), ["雪"]);
  assert.equal(await input.inputValue(), "Svelte");
  await input.fill("re");
  await open();
  assert.equal(await activeValue(), "react");
  await page.getByTestId("combo-remove").evaluate((n) => n.click());
  assert.equal(await activeValue(), "");
  assert.equal(await root.locator('[data-lenso-value="react"][role="option"]').count(), 0);
  await page.getByTestId("combo-remove").evaluate((n) => n.click());
  await input.fill("lid");
  await open();
  assert.deepEqual(await visible(), ["Solid"]);
  await page.getByTestId("combo-filter").evaluate((n) => n.click());
  assert.deepEqual(await visible(), []);
  await page.getByTestId("combo-filter").evaluate((n) => n.click());
  assert.equal((await visible()).length, 5);
  await page.getByTestId("combo-filter").evaluate((n) => n.click());
  assert.deepEqual(await visible(), ["Solid"]);
  await page.keyboard.press("Escape");
  await closed();
  await page.getByTestId("combo-readonly").click();
  assert.equal(await input.evaluate((n) => n.readOnly), true);
  await input.focus();
  await page.keyboard.type("x");
  assert.equal(await input.inputValue(), "Svelte");
  await page.getByTestId("framework-combo-trigger").dispatchEvent("click");
  assert.equal(await input.getAttribute("aria-expanded"), "false");
  await page.getByTestId("combo-readonly").click();
  await page.getByTestId("combo-disabled").click();
  assert.equal(await input.isDisabled(), true);
  assert.equal(await page.getByTestId("framework-combo-clear").isDisabled(), true);
  await page.getByTestId("combo-disabled").click();
  await page.getByTestId("combo-direction").click();
  await many.fill("React");
  await page.keyboard.press("Enter");
  await many.fill("Solid");
  await page.keyboard.press("Enter");
  assert.deepEqual(await chips(), ["react", "a,b"]);
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByTestId("frameworks-combo-chip-1").evaluate((n) => n === document.activeElement),
    true,
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.getByTestId("frameworks-combo-chip-0").evaluate((n) => n === document.activeElement),
    true,
  );
  await page.keyboard.press("Enter");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const captures = [];
  for (const variant of ["primary", "secondary"]) {
    if ((await root.getAttribute("data-lenso-variant")) !== variant)
      await page.getByTestId("combo-variant").click();
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        if (!(await page.locator(`[data-theme="${theme}"]`).count()))
          await page.getByTestId("theme").evaluate((n) => n.click());
        await page.getByTestId("framework-combo-trigger").click();
        await open();
        assert.equal(await input.inputValue(), "Svelte");
        await focused();
        const box = await popup.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
        // Popup bounds alone missed bare-button content-box overflow and clipped selection icons.
        const geometry = await root
          .locator('[data-slot="combo-box-item"]:not([hidden])')
          .evaluateAll((nodes) =>
            nodes.map((n) => {
              const r = n.getBoundingClientRect(),
                l = n.closest('[data-slot="combo-box-list"]').getBoundingClientRect(),
                s = getComputedStyle(n);
              return {
                left: r.left,
                right: r.right,
                listLeft: l.left,
                listRight: l.right,
                boxSizing: s.boxSizing,
                align: s.textAlign,
              };
            }),
          );
        for (const row of geometry) {
          assert.equal(row.boxSizing, "border-box");
          assert.equal(row.align, "start");
          assert.ok(row.left >= row.listLeft - 1 && row.right <= row.listRight + 1);
        }

        assert.equal(await popup.evaluate((n) => getComputedStyle(n).direction), "rtl");
        const file = path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS,
          `${engine}-combo-box-${variant}-${theme}-${width}.png`,
        );
        await page.screenshot({ path: file });
        captures.push({ variant, width, theme, file });
        await page.keyboard.press("Escape");
        await closed();
      }
    }
  }
  await page.getByTestId("framework-combo-trigger").click();
  await open();
  const oldInput = await input.elementHandle(),
    oldPopup = await popup.elementHandle();
  await page.getByTestId("combo-mounted").evaluate((n) => n.click());
  assert.equal(await oldPopup.evaluate((n) => n.matches(":popover-open")), false);
  assert.equal(await oldInput.evaluate((n) => n.hasAttribute("aria-autocomplete")), false);
  assert.equal(await oldInput.evaluate((n) => n.hasAttribute("aria-activedescendant")), false);
  await oldInput.dispose();
  await oldPopup.dispose();
  await page.getByTestId("combo-mounted").click();
  await page.waitForFunction(
    () =>
      document.getElementById("framework-combo-input")?.getAttribute("aria-autocomplete") ===
      "list",
  );
  await input.fill("resume");
  await open();
  await page.keyboard.press("Enter");
  await closed();
  assert.deepEqual(await selected(), [""]);
  return {
    primitiveInputAndPopover: true,
    virtualFocus: true,
    filterModes: true,
    accentMatching: true,
    skipDisabled: true,
    singleMultiple: true,
    emptyCommaUnicodeKeys: true,
    queryRejection: true,
    selectionRejection: true,
    emptyStateStatus: true,
    closedTextRestoration: true,
    chipKeyboardAndPointerRemoval: true,
    syntheticComposition: { oneCommit: true, themeDraftRetention: true },
    externalUpdate: true,
    dynamicItems: true,
    readOnlyDisabled: true,
    rtl: true,
    disposalRemount: true,
    captures,
  };
}
export async function checkComboBoxForm(page, url) {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByTestId("combo-box-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "combo-form-fixture";
      form.dataset.submits = "0";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.dataset.submits = String(Number(form.dataset.submits) + 1);
      });
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Submit fixture";
      form.append(submit);
      n.before(form);
      form.append(n);
      const external = document.createElement("form");
      external.id = "combo-external-form-fixture";
      external.addEventListener("submit", (e) => e.preventDefault());
      form.after(external);
    });
    release();
    await page.waitForFunction(
      () => document.querySelector('[data-slot="combo-box-validity"]')?.required,
    );
    const form = page.locator("#combo-form-fixture"),
      external = page.locator("#combo-external-form-fixture");
    const data = (node) => node.evaluate((n) => [...new FormData(n)]);
    const input = page.getByTestId("framework-combo-input"),
      many = page.getByTestId("frameworks-combo-input");
    assert.deepEqual(await data(form), [["framework", "react"]]);
    await input.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => document.getElementById("combo-form-fixture").dataset.submits === "1",
    );
    await input.fill("resume");
    await page.keyboard.press("Enter");
    assert.deepEqual(await data(form), [["framework", ""]]);
    assert.equal(await form.getAttribute("data-submits"), "1");
    assert.equal(await form.evaluate((n) => n.checkValidity()), true);
    await many.fill("Solid");
    await page.keyboard.press("Enter");
    await many.fill("Svelte");
    await page.keyboard.press("Enter");
    assert.deepEqual(await data(form), [
      ["framework", ""],
      ["frameworks", "a,b"],
      ["frameworks", "雪"],
    ]);
    await page.getByTestId("framework-combo-clear").click();
    assert.equal(await form.evaluate((n) => n.reportValidity()), false);
    assert.equal(await input.evaluate((n) => document.activeElement === n), true);
    await form.evaluate((n) => n.reset());
    await page.waitForFunction(
      () => document.getElementById("framework-combo-input").value === "React",
    );
    assert.deepEqual(await data(form), [["framework", "react"]]);
    await page.getByTestId("combo-external").click();
    await form.evaluate((n) => {
      n.addEventListener("reset", (e) => e.preventDefault(), { once: true });
      n.reset();
    });
    assert.equal(await input.inputValue(), "Svelte");
    await page.getByTestId("combo-form").click();
    assert.deepEqual(await data(form), []);
    assert.deepEqual(await data(external), [["framework", "雪"]]);
    assert.equal(await input.getAttribute("form"), "combo-external-form-fixture");
    await external.evaluate((n) => n.reset());
    await page.waitForFunction(
      () => document.getElementById("framework-combo-input").value === "React",
    );
    assert.deepEqual(await data(external), [["framework", "react"]]);
    await page.getByTestId("combo-disabled").click();
    assert.deepEqual(await data(external), []);
    return {
      nativeModelValues: true,
      emptyKeyRequired: true,
      multipleNames: true,
      invalidFocus: true,
      reset: true,
      canceledReset: true,
      externalForm: true,
      disabledExclusion: true,
      fixture: "native DOM forms authored before hatch",
    };
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
}
export async function checkComboBoxTouch(page) {
  const input = page.getByTestId("framework-combo-input");
  await page.waitForFunction(
    () =>
      document.getElementById("framework-combo-input")?.getAttribute("aria-autocomplete") ===
      "list",
  );
  await input.tap();
  await input.fill("resume");
  await page.waitForFunction(() =>
    document.getElementById("framework-combo-popup").matches(":popover-open"),
  );
  await page.getByTestId("framework-combo-option-2").tap();
  await page.waitForFunction(
    () => !document.getElementById("framework-combo-popup").matches(":popover-open"),
  );
  assert.equal(await input.inputValue(), "Résumé");
  return { nativeFocusAndOptionTap: true };
}
