import assert from "node:assert/strict";
import path from "node:path";

const artifacts =
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? path.resolve(import.meta.dirname, "../.cache/example");

const shown = (page, value) =>
  page.waitForFunction((expected) => {
    const text = document.querySelector('[data-testid="numeric-value"]').textContent;
    return expected === "empty"
      ? text === "Amount: empty"
      : Math.abs(Number(text.slice("Amount: ".length)) - Number(expected)) <= 1e-12;
  }, String(value));
const inputValue = (page, value) =>
  page.waitForFunction(
    (text) => document.getElementById("numeric-amount-input").value === text,
    value,
  );
const direct = (page, name) => page.getByTestId(`numeric-${name}`).evaluate((n) => n.click());

export async function checkNumberInitial(page, url) {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    assert.equal(await page.getByTestId("numeric-amount").getAttribute("data-lenso-ready"), null);
    assert.equal(await page.getByTestId("numeric-amount-input").inputValue(), "1.2");
    assert.equal(
      await page
        .getByTestId("numeric-amount-input")
        .evaluate((n) => getComputedStyle(n).fontWeight),
      "600",
    );
    const geometry = await page.getByTestId("numeric-count").evaluate((n) => ({
      rootWidth: n.getBoundingClientRect().width,
      button: n.querySelector("button").getBoundingClientRect().height,
      width: n.querySelector('[data-slot="stepper-group"]').getBoundingClientRect().width,
    }));
    assert.deepEqual(geometry, { rootWidth: 92, button: 32, width: 92 });
    await page.getByTestId("numeric-count-increment").click();
    assert.equal(await page.getByTestId("numeric-count-value").textContent(), "Count: 2");
    assert.equal(await page.getByTestId("numeric-last").textContent(), "Last: 2");
    await page.getByTestId("numeric-amount-input").fill("2.5");
    await shown(page, "2.5");
    await direct(page, "clear");
    await shown(page, "empty");
    await page.getByTestId("numeric-amount-increment").click();
    await shown(page, "0");
    release();
    await page.waitForFunction(
      () => document.getElementById("numeric-amount-input").type === "text",
    );
    return { initialGeometry: geometry, nativeInput: true, nativeButtons: true, emptySeed: true };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}

export async function checkNumberField(page, engine) {
  const input = page.getByTestId("numeric-amount-input"),
    increment = page.getByTestId("numeric-amount-increment"),
    decrement = page.getByTestId("numeric-amount-decrement");
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  await input.scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("spinbutton", { name: "Amount", exact: true }).count(), 1);
  assert.equal(await input.getAttribute("aria-valuenow"), "1.2");
  assert.equal(await input.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  assert.equal(await input.getAttribute("aria-valuemin"), "-10");
  assert.equal(await input.getAttribute("aria-valuemax"), "10");
  await input.fill("1.20");
  await shown(page, "1.2");
  await page.waitForTimeout(60);
  assert.equal(await input.inputValue(), "1.20", "typing keeps the unformatted draft");
  const commits = await page.getByTestId("numeric-commits").textContent();
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "1.2");
  assert.notEqual(await page.getByTestId("numeric-commits").textContent(), commits);
  await input.fill("-");
  assert.equal(await input.inputValue(), "-");
  await shown(page, "1.2");
  const beforePartialBlur = await page.getByTestId("numeric-commits").textContent();
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "-");
  assert.equal(await page.getByTestId("numeric-commits").textContent(), beforePartialBlur);
  await input.fill("-");
  await page.keyboard.press("ArrowUp");
  await shown(page, "1.3");
  await input.fill("");
  await shown(page, "empty");
  assert.equal(await input.getAttribute("aria-valuenow"), null);
  await page.keyboard.press("ArrowUp");
  await shown(page, "0");
  await page.keyboard.press("ArrowUp");
  await shown(page, "0.1");
  await page.keyboard.press("Shift+ArrowUp");
  await shown(page, "1");
  await page.keyboard.press("Alt+ArrowUp");
  await shown(page, "1.01");
  await page.keyboard.press("Home");
  await shown(page, "-10");
  assert.equal(await decrement.getAttribute("aria-disabled"), "true");
  await decrement.evaluate((n) => n.click());
  await shown(page, "-10");
  await page.keyboard.press("End");
  await shown(page, "10");
  assert.equal(await increment.getAttribute("aria-disabled"), "true");
  await increment.evaluate((n) => n.click());
  await shown(page, "10");
  await decrement.click();
  await shown(page, "9.9");
  await input.fill("-");
  await direct(page, "external");
  await shown(page, "3.25");
  await inputValue(page, "3.25");
  await input.fill("12");
  await shown(page, "10");
  assert.equal(await input.inputValue(), "12");
  await decrement.click();
  await shown(page, "9.9");
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "9.9");
  await direct(page, "locale");
  await input.fill("4,25");
  await shown(page, "4.25");
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "4,25");
  await direct(page, "format");
  await inputValue(
    page,
    await page.evaluate(() =>
      new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(4.25),
    ),
  );
  await direct(page, "locale");
  await input.fill("٢٫٥");
  await shown(page, "2.5");
  await page.getByTestId("numeric-next").focus();
  await inputValue(
    page,
    await page.evaluate(() =>
      new Intl.NumberFormat("ar-EG", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }).format(2.5),
    ),
  );
  assert.equal(await input.getAttribute("aria-valuenow"), "2.5");
  await direct(page, "locale");
  await direct(page, "format");
  await inputValue(page, "2.5");
  await input.focus();
  await input.evaluate((n) => {
    n.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    n.value = "３";
    n.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, data: "３" }));
  });
  await shown(page, "2.5");
  await input.evaluate((n) =>
    n.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "３" })),
  );
  await shown(page, "3");
  await inputValue(page, "３");
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "3");
  await input.fill("1.250");
  await shown(page, "1.25");
  await input.evaluate((n) => {
    n.setSelectionRange(2, 3);
    const data = new DataTransfer();
    data.setData("text/plain", "4");
    n.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }),
    );
  });
  await shown(page, "1.45");
  await page.waitForTimeout(60);
  assert.equal(await input.inputValue(), "1.450");
  assert.equal(await input.evaluate((n) => n.selectionStart), 3);
  await page.getByTestId("numeric-next").focus();
  await inputValue(page, "1.45");
  await direct(page, "out-of-range");
  await input.fill("12");
  await shown(page, "12");
  assert.equal(await input.evaluate((n) => n.checkValidity()), false);
  await decrement.click();
  await shown(page, "10");
  await direct(page, "out-of-range");
  await direct(page, "bounds");
  assert.equal(await input.getAttribute("aria-valuemin"), null);
  await input.fill("3");
  await shown(page, "3");
  await page.keyboard.press("Home");
  await shown(page, "3");
  await page.keyboard.press("End");
  await shown(page, "3");
  await direct(page, "bounds");
  await input.focus();
  await input.hover();
  await page.mouse.wheel(0, -100);
  await shown(page, "3.1");
  await direct(page, "readonly");
  assert.equal(await input.evaluate((n) => n.readOnly), true);
  await increment.evaluate((n) => n.click());
  await shown(page, "3.1");
  await page.keyboard.press("ArrowUp");
  await shown(page, "3.1");
  await direct(page, "readonly");
  await direct(page, "own-disabled");
  assert.equal(await increment.getAttribute("aria-disabled"), "true");
  assert.equal(await decrement.getAttribute("aria-disabled"), "false");
  await increment.evaluate((n) => n.click());
  await shown(page, "3.1");
  await direct(page, "own-disabled");
  await direct(page, "disabled");
  assert.equal(await input.isDisabled(), true);
  await increment.evaluate((n) => n.click());
  await shown(page, "3.1");
  await direct(page, "disabled");
  await direct(page, "invalid");
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  await direct(page, "invalid");
  const counter = page.getByTestId("numeric-count-input"),
    countInc = page.getByTestId("numeric-count-increment");
  await countInc.hover();
  await page.mouse.down();
  await page.waitForTimeout(680);
  await page.mouse.up();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 5",
  );
  assert.equal(await countInc.getAttribute("aria-disabled"), "true");
  await counter.focus();
  await page.keyboard.press("Home");
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 0",
  );
  await page.keyboard.press("Shift+ArrowUp");
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 2",
  );
  assert.deepEqual(
    await page.getByTestId("numeric-count").evaluate((n) => ({
      rootWidth: n.offsetWidth,
      rootHeight: n.offsetHeight,
      width: n.querySelector('[data-slot="stepper-group"]').offsetWidth,
      height: n.querySelector('[data-slot="stepper-group"]').offsetHeight,
      inputWidth: n.querySelector('[data-slot="number-input"]').offsetWidth,
      inputHeight: n.querySelector('[data-slot="number-input"]').offsetHeight,
    })),
    { rootWidth: 92, rootHeight: 32, width: 92, height: 32, inputWidth: 1, inputHeight: 1 },
  );
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const appearance of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      for (const variant of ["primary", "secondary"]) {
        if (
          (await page.getByTestId("numeric-amount").getAttribute("data-lenso-variant")) !== variant
        )
          await direct(page, "variant");
        await page.locator("#number-field-examples").screenshot({
          path: path.join(artifacts, `${engine}-number-${appearance}-${variant}-${width}.png`),
        });
        captures.push({ width, appearance, variant });
      }
    }
  }
  await direct(page, "width");
  await direct(page, "direction");
  assert.equal(
    await page.getByTestId("numeric-amount").evaluate((n) => getComputedStyle(n).direction),
    "rtl",
  );
  const group = page.getByTestId("numeric-amount-group");
  assert.ok((await group.boundingBox()).width > 300);
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  assert.equal(await input.evaluate((n) => n.getAttribute("role")), "spinbutton");
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  await direct(page, "nested");
  await increment.click();
  await shown(page, "3.2");
  assert.equal(await page.getByTestId("numeric-count-value").textContent(), "Count: 2");
  await countInc.click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 3",
  );
  await shown(page, "3.2");
  await direct(page, "mounted");
  await page.waitForFunction(() => !document.getElementById("numeric-amount"));
  await direct(page, "mounted");
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  await page.getByTestId("numeric-count-decrement").click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 2",
  );
  await shown(page, "3.2");
  await direct(page, "nested");
  const oldInput = await input.elementHandle();
  await direct(page, "editor");
  await page.waitForFunction((n) => !n.isConnected, oldInput);
  assert.equal(await oldInput.evaluate((n) => n.type), "number");
  assert.equal(await oldInput.evaluate((n) => n.getAttribute("role")), null);
  await oldInput.dispose();
  await direct(page, "editor");
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  const old = await group.elementHandle();
  await countInc.hover();
  await page.mouse.down();
  await direct(page, "mounted");
  await page.waitForFunction(() => !document.getElementById("numeric-amount"));
  await page.mouse.up();
  await page.waitForTimeout(650);
  assert.equal(await page.getByTestId("numeric-count-value").textContent(), "Count: 2");
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-filter")), "");
  await old.dispose();
  await direct(page, "mounted");
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  return {
    drafts: true,
    nullable: true,
    localeAndFormat: true,
    imeFixture: true,
    keyboard: true,
    hold: true,
    cleanup: true,
    captures,
  };
}

export async function checkNumberForm(page, url) {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    await page.locator("#number-field-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "numeric-form-fixture";
      form.addEventListener("submit", (e) => e.preventDefault());
      n.before(form);
      form.append(n);
    });
    release();
    await page.waitForFunction(
      () => document.getElementById("numeric-amount-input").type === "text",
    );
    const input = page.getByTestId("numeric-amount-input");
    await input.fill("");
    await shown(page, "empty");
    assert.equal(await input.evaluate((n) => n.validity.valueMissing), true);
    await input.fill("4.25");
    await shown(page, "4.25");
    await page.getByTestId("numeric-next").focus();
    const formData = () =>
      page.locator("#numeric-form-fixture").evaluate((n) => [...new FormData(n)]);
    assert.deepEqual(await formData(), [
      ["amount", "4.25"],
      ["count", "1"],
    ]);
    await page.locator("#numeric-form-fixture").evaluate((n) => n.reset());
    await shown(page, "1.2");
    await inputValue(page, "1.2");
    await direct(page, "disabled");
    assert.deepEqual(await formData(), []);
    return {
      canonicalFormData: true,
      reset: true,
      required: true,
      fixture: "native DOM form authored before hatch",
    };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}

export async function checkNumberTouch(page) {
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  await page.getByTestId("numeric-count-increment").tap();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="numeric-count-value"]').textContent === "Count: 2",
  );
  assert.notEqual(
    await page.evaluate(() => document.activeElement?.id),
    "numeric-count-input",
    "touch stepping does not open the hidden editor keyboard",
  );
  return { tap: true };
}
