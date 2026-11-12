import assert from "node:assert/strict";
import path from "node:path";
const pause = (page) =>
  page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))),
      ),
  );
const focusIs = async (node) =>
  assert.equal(await node.evaluate((n) => n === document.activeElement), true);
export async function checkAutocomplete(page, engine) {
  const trigger = page.getByTestId("framework-auto-trigger"),
    input = page.getByTestId("framework-auto-input"),
    popup = page.getByTestId("framework-auto-popup"),
    manyTrigger = page.getByTestId("frameworks-auto-trigger"),
    manyInput = page.getByTestId("frameworks-auto-input"),
    manyPopup = page.getByTestId("frameworks-auto-popup");
  const opened = async (node) => node.evaluate((n) => n.matches(":popover-open"));
  const rows = () => popup.locator('[data-slot="autocomplete-item"]:not([hidden])');
  const selected = async () =>
    popup.locator('[aria-selected="true"]').getAttribute("data-lenso-value");
  assert.equal(await trigger.getAttribute("tabindex"), "0");
  assert.equal(await input.isVisible(), false);
  assert.match(await trigger.textContent(), /React/);
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await focusIs(input);
  assert.equal(await opened(popup), true);
  assert.equal(await rows().count(), 5);
  assert.equal(await input.inputValue(), "");
  await input.fill("re");
  await pause(page);
  assert.equal(await rows().count(), 3);
  assert.equal(await page.locator("#auto-more").isVisible(), false);
  assert.equal(await popup.locator('[data-slot="autocomplete-separator"]').isVisible(), false);
  assert.equal(await input.getAttribute("aria-activedescendant"), "framework-auto-option-0");
  await page.keyboard.press("ArrowDown");
  assert.equal(await input.getAttribute("aria-activedescendant"), "framework-auto-option-2");
  await page.keyboard.press("Enter");
  await pause(page);
  assert.equal(await selected(), "");
  assert.equal(await opened(popup), false);
  await focusIs(trigger);
  assert.match(await trigger.textContent(), /Résumé/);
  await trigger.click();
  await focusIs(input);
  assert.equal(await input.inputValue(), "");
  await input.fill("not-found");
  await pause(page);
  assert.equal(await rows().count(), 0);
  assert.equal(await page.getByTestId("framework-auto-empty").isVisible(), true);
  assert.equal(
    await page.getByTestId("framework-auto-status").textContent(),
    "0 frameworks available",
  );
  await page.keyboard.press("Enter");
  assert.equal(await selected(), "");
  await page.getByTestId("framework-auto-search-clear").click();
  await pause(page);
  assert.equal(await opened(popup), true);
  assert.equal(await input.inputValue(), "");
  assert.equal(await rows().count(), 5);
  assert.equal(await selected(), "");
  await input.fill("Solid");
  await page.keyboard.press("Escape");
  await pause(page);
  await focusIs(trigger);
  assert.equal(await input.inputValue(), "");
  assert.equal(await selected(), "");
  await page.getByTestId("auto-reject-query").click();
  await trigger.click();
  await input.fill("Solid");
  await pause(page);
  assert.equal(await input.inputValue(), "");
  assert.equal(await rows().count(), 5);
  await page.keyboard.press("Escape");
  await page.getByTestId("auto-reject-query").click();
  await page.getByTestId("auto-reject").click();
  await trigger.click();
  await input.fill("Solid");
  await page.keyboard.press("Enter");
  await pause(page);
  assert.equal(await selected(), "");
  await focusIs(trigger);
  await page.getByTestId("auto-reject").click();
  await page.getByTestId("framework-auto-clear").click();
  await pause(page);
  assert.equal(await popup.locator('[aria-selected="true"]').count(), 0);
  assert.equal(await opened(popup), false);
  assert.match(await trigger.textContent(), /Choose a framework/);
  await focusIs(trigger);
  await trigger.click();
  await input.fill("");
  await pause(page);
  assert.equal(await opened(popup), true, "empty search keeps popup selection open");
  await page.keyboard.press("Tab");
  await pause(page);
  assert.equal(await opened(popup), false);
  await focusIs(manyTrigger);
  await manyTrigger.click();
  await manyInput.fill("React");
  await page.keyboard.press("Enter");
  await pause(page);
  assert.equal(await opened(manyPopup), true);
  await focusIs(manyInput);
  await manyInput.fill("Solid");
  await manyPopup.locator('[data-lenso-value="a,b"]').click();
  await pause(page);
  assert.equal(await opened(manyPopup), true);
  assert.equal(await manyInput.inputValue(), "");
  const chips = page.locator('#frameworks-auto-field [data-slot="autocomplete-chip"]');
  assert.equal(await chips.count(), 2);
  await page.keyboard.press("Escape");
  await focusIs(manyTrigger);
  await page.keyboard.press("ArrowLeft");
  await focusIs(chips.nth(1));
  await page.keyboard.press("Delete");
  await pause(page);
  assert.equal(await chips.count(), 1);
  await focusIs(chips.first());
  await page.keyboard.press("ArrowRight");
  await focusIs(manyTrigger);
  await page.getByTestId("auto-direction").click();
  await manyTrigger.focus();
  await page.keyboard.press("ArrowRight");
  await focusIs(chips.first());
  await page.keyboard.press("Delete");
  await pause(page);
  assert.equal(await chips.count(), 0);
  await focusIs(manyTrigger);
  await page.getByTestId("auto-direction").click();
  await page.getByTestId("auto-readonly").click();
  assert.equal(await trigger.isDisabled(), true);
  await trigger.evaluate((n) => n.click());
  assert.equal(await opened(popup), false);
  await page.getByTestId("auto-readonly").click();
  await trigger.click();
  await page.getByTestId("auto-disabled").click();
  assert.equal(await trigger.isDisabled(), true);
  assert.equal(await opened(popup), false);
  await page.getByTestId("auto-disabled").click();
  await page.getByTestId("auto-external").click();
  assert.match(await trigger.textContent(), /Svelte/);
  await trigger.click();
  await input.fill("resume");
  await page.getByTestId("auto-filter").click();
  await trigger.click();
  await input.fill("umé");
  await pause(page);
  assert.equal(await rows().count(), 0, "prefix filter differs from contains");
  await page.getByTestId("auto-filter").click();
  await trigger.click();
  await input.fill("not-found");
  await pause(page);
  assert.equal(await rows().count(), 5, "caller-filtered mode does not hide rows");
  await page.keyboard.press("Escape");
  await page.getByTestId("auto-filter").click();
  await trigger.click();
  const oldPopup = await popup.elementHandle(),
    oldInput = await input.elementHandle();
  await page.getByTestId("auto-mounted").click();
  assert.equal(await oldPopup.evaluate((n) => n.matches(":popover-open")), false);
  assert.equal(await oldInput.getAttribute("aria-activedescendant"), null);
  await oldPopup.dispose();
  await oldInput.dispose();
  await page.getByTestId("auto-mounted").click();
  await trigger.click();
  await input.fill("resume");
  await pause(page);
  assert.equal(await rows().count(), 1);
  await page.keyboard.press("Enter");
  await pause(page);
  assert.equal(await selected(), "");
  // Draft retention across a presentation redraw; this is synthetic composition, not physical IME.
  await trigger.click();
  const count = Number(await page.getByTestId("auto-query-count").textContent());
  await input.evaluate((n) => {
    n.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    n.value = "Ré";
    n.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        isComposing: true,
        inputType: "insertCompositionText",
        data: "Ré",
      }),
    );
  });
  await page.getByTestId("theme").evaluate((n) => n.click());
  assert.equal(await input.inputValue(), "Ré");
  await input.evaluate((n) =>
    n.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "Ré" })),
  );
  await pause(page);
  assert.equal(Number(await page.getByTestId("auto-query-count").textContent()), count + 1);
  await page.keyboard.press("Escape");
  const captures = [];
  for (const variant of ["primary", "secondary"])
    for (const theme of ["light", "dark"])
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        if ((await trigger.getAttribute("data-lenso-variant")) !== variant)
          await page.getByTestId("auto-variant").click();
        if (!(await page.locator(`[data-theme="${theme}"]`).count()))
          await page.getByTestId("theme").click();
        await trigger.click();
        await page.waitForFunction(() =>
          document.getElementById("framework-auto-popup").hasAttribute("data-lenso-positioned"),
        );
        await pause(page);
        assert.equal(
          await input.evaluate((n) => getComputedStyle(n).borderTopWidth),
          "0px",
          "native search border must not override the source recipe",
        );
        const geometry = await popup.evaluate((n) => {
          const r = n.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            viewport: innerWidth,
            rows: [...n.querySelectorAll('[data-slot="autocomplete-item"]:not([hidden])')].map(
              (row) => {
                const b = row.getBoundingClientRect(),
                  s = getComputedStyle(row);
                return { x: b.x, right: b.right, boxSizing: s.boxSizing, textAlign: s.textAlign };
              },
            ),
          };
        });
        assert.ok(geometry.x >= 0 && geometry.x + geometry.width <= geometry.viewport + 1);
        for (const row of geometry.rows) {
          assert.equal(row.boxSizing, "border-box");
          assert.equal(row.textAlign, "start");
          assert.ok(row.x >= geometry.x - 1 && row.right <= geometry.x + geometry.width + 1);
        }
        const file = path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS,
          `${engine}-${variant}-${theme}-${width}.png`,
        );
        await popup.screenshot({ path: file });
        const shellFile = file.replace(".png", "-field.png");
        await page.getByTestId("framework-auto-field").screenshot({ path: shellFile });
        captures.push({ variant, theme, width, file, shellFile, geometry });
        await page.keyboard.press("Escape");
      }
  return { captures, syntheticComposition: true };
}

export async function checkAutocompleteForm(page, url) {
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator("#autocomplete-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "auto-form-fixture";
      const button = document.createElement("button");
      button.type = "submit";
      button.textContent = "Submit fixture";
      form.append(button);
      form.dataset.submits = "0";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.dataset.submits = String(Number(form.dataset.submits) + 1);
      });
      n.before(form);
      form.append(n);
      const external = document.createElement("form");
      external.id = "auto-external-form-fixture";
      form.after(external);
    });
    release();
    await page.waitForFunction(
      () => document.querySelector('[data-slot="autocomplete-validity"]')?.required,
    );
    const form = page.locator("#auto-form-fixture"),
      external = page.locator("#auto-external-form-fixture");
    const data = (n) => n.evaluate((n) => [...new FormData(n)]);
    const trigger = page.getByTestId("framework-auto-trigger"),
      input = page.getByTestId("framework-auto-input");
    assert.deepEqual(await data(form), [["framework", "react"]]);
    await trigger.click();
    await input.fill("resume");
    await page.keyboard.press("Enter");
    await pause(page);
    assert.deepEqual(await data(form), [["framework", ""]]);
    assert.equal(await form.evaluate((n) => n.checkValidity()), true);
    assert.equal(await form.getAttribute("data-submits"), "0");
    await page.getByTestId("framework-auto-clear").click();
    await pause(page);
    assert.equal(await form.evaluate((n) => n.reportValidity()), false);
    await focusIs(trigger);
    await form.evaluate((n) => n.reset());
    await pause(page);
    assert.deepEqual(await data(form), [["framework", "react"]]);
    await page.getByTestId("auto-external").click();
    await form.evaluate((n) => {
      n.addEventListener("reset", (e) => e.preventDefault(), { once: true });
      n.reset();
    });
    await pause(page);
    assert.deepEqual(await data(form), [["framework", "雪"]]);
    await page.getByTestId("auto-form").click();
    assert.deepEqual(await data(form), []);
    assert.deepEqual(await data(external), [["framework", "雪"]]);
    await trigger.click();
    await input.fill("Solid");
    await external.evaluate((n) => n.reset());
    await pause(page);
    assert.equal(await input.inputValue(), "");
    assert.deepEqual(await data(external), [["framework", "react"]]);
    assert.equal(await trigger.getAttribute("aria-expanded"), "false");
    await page.getByTestId("auto-disabled").click();
    assert.deepEqual(await data(external), []);
    return {
      requiredSelection: true,
      emptyKey: true,
      reset: true,
      cancelledReset: true,
      externalAssociation: true,
      disabled: true,
    };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}
export async function checkAutocompleteTouch(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(url);
    const trigger = page.getByTestId("framework-auto-trigger"),
      input = page.getByTestId("framework-auto-input");
    await page.waitForFunction(() =>
      document.getElementById("framework-auto-trigger")?.hasAttribute("data-lenso-ready"),
    );
    await trigger.tap();
    await focusIs(input);
    await input.fill("resume");
    await pause(page);
    await page.getByTestId("framework-auto-option-2").tap();
    await pause(page);
    assert.equal(await trigger.getAttribute("aria-expanded"), "false");
    assert.match(await trigger.textContent(), /Résumé/);
    assert.deepEqual(errors, []);
    return { nativeTap: true, errors };
  } finally {
    await context.close();
  }
}
