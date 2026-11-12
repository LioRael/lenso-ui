import assert from "node:assert/strict";
import path from "node:path";
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))),
      ),
  );
const focusIs = async (node) =>
  assert.equal(await node.evaluate((n) => document.activeElement === n), true);
const paste = async (node, text) =>
  node.evaluate((n, text) => {
    const data = new DataTransfer();
    data.setData("text/plain", text);
    n.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }),
    );
  }, text);
const fields = (page) =>
  Array.from({ length: 6 }, (_, i) => page.getByTestId(`otp-code-slot-${i}`));
const digits = (page) =>
  page
    .locator('#otp-code [data-slot="input-otp-slot"]')
    .evaluateAll((ns) => ns.map((n) => n.value).join(""));
export async function checkInputOTP(page, engine) {
  const slots = fields(page),
    code = page.getByTestId("otp-code"),
    value = page.getByTestId("otp-value");
  assert.equal(await code.getAttribute("role"), "group");
  assert.equal(await slots[0].getAttribute("aria-describedby"), "otp-hint");
  assert.equal(await slots[0].getAttribute("aria-label"), "Code character 1 of 6");
  assert.equal(await slots[0].getAttribute("autocomplete"), "one-time-code");
  assert.equal(await slots[1].getAttribute("autocomplete"), "off");
  assert.equal(await slots[0].getAttribute("inputmode"), "numeric");
  assert.equal(await code.locator('input[data-slot="input-otp-slot"]').count(), 6);
  assert.equal(await code.locator('[data-slot="input-otp-slot"][tabindex="0"]').count(), 1);
  await slots[0].click();
  await page.keyboard.type("012345");
  await settle(page);
  assert.equal(await digits(page), "012345");
  assert.equal(await value.textContent(), "012345");
  await focusIs(slots[5]);
  assert.equal(await page.getByTestId("otp-completions").textContent(), "1");
  assert.equal(await page.getByTestId("otp-completed").textContent(), "012345");
  await page.keyboard.press("Home");
  await focusIs(slots[0]);
  await page.keyboard.press("ArrowRight");
  await focusIs(slots[1]);
  await page.keyboard.press("Delete");
  await settle(page);
  assert.equal(await digits(page), "02345");
  await focusIs(slots[1]);
  await page.keyboard.press("End");
  await focusIs(slots[5]);
  await page.keyboard.press("Backspace");
  await settle(page);
  assert.equal(await digits(page), "0234");
  await focusIs(slots[4]);
  await page.keyboard.press("Control+Backspace");
  await settle(page);
  assert.equal(await digits(page), "");
  await focusIs(slots[0]);
  await paste(slots[0], " 00x12\n34 ");
  await settle(page);
  assert.equal(await digits(page), "001234");
  await focusIs(slots[5]);
  assert.equal(await page.getByTestId("otp-completions").textContent(), "2");
  await slots[2].click();
  await paste(slots[2], "89");
  await settle(page);
  assert.equal(await digits(page), "008934");
  await focusIs(slots[4]);
  assert.equal(await page.getByTestId("otp-completions").textContent(), "3");
  await paste(slots[4], "!!");
  await settle(page);
  assert.equal(await digits(page), "008934");
  await page.getByTestId("otp-clear").click();
  await slots[0].fill("x");
  await settle(page);
  assert.equal(await digits(page), "");
  await focusIs(slots[0]);
  await page.getByTestId("otp-reject").click();
  await slots[0].fill("123456");
  await settle(page);
  assert.equal(await digits(page), "");
  await focusIs(slots[0]);
  assert.equal(await page.getByTestId("otp-completions").textContent(), "3");
  await page.getByTestId("otp-reject").click();
  await page.getByTestId("otp-external").click();
  assert.equal(await digits(page), "987654");
  assert.equal(await page.getByTestId("otp-completions").textContent(), "3");
  await page.getByTestId("otp-mask").click();
  assert.equal(await slots[0].getAttribute("type"), "password");
  await page.getByTestId("otp-mask").click();
  await page.getByTestId("otp-direction").click();
  await slots[2].focus();
  await page.keyboard.press("ArrowRight");
  await focusIs(slots[1]);
  await page.keyboard.press("ArrowLeft");
  await focusIs(slots[2]);
  await page.getByTestId("otp-direction").click();
  await page.getByTestId("otp-readonly").click();
  await slots[2].focus();
  await page.keyboard.press("Delete");
  await settle(page);
  assert.equal(await digits(page), "987654");
  await page.keyboard.press("ArrowLeft");
  await focusIs(slots[1]);
  await slots[1].evaluate((n) => {
    n.value = "1";
    n.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  assert.equal(await digits(page), "987654");
  await page.getByTestId("otp-readonly").click();
  await page.getByTestId("otp-disabled").click();
  assert.equal(await slots[0].isDisabled(), true);
  await slots[0].evaluate((n) => {
    n.value = "1";
    n.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  assert.equal(await digits(page), "987654");
  await page.getByTestId("otp-disabled").click();
  await page.getByTestId("otp-validation").click();
  assert.equal(await slots[0].getAttribute("inputmode"), "text");
  await slots[0].click();
  await paste(slots[0], "a1B2c3D4e5F");
  await settle(page);
  assert.equal(await digits(page), "aBcDeF");
  await page.getByTestId("otp-validation").click();
  await paste(slots[0], "a1B2c3");
  await settle(page);
  assert.equal(await digits(page), "a1B2c3");
  await page.getByTestId("otp-validation").click();
  await paste(slots[0], "雪🦊é中🌕文");
  await settle(page);
  assert.equal(await digits(page), "雪🦊é中🌕文");
  assert.equal(await slots[1].inputValue(), "🦊");
  await slots[1].click();
  await page.keyboard.press("Delete");
  await settle(page);
  assert.equal(await digits(page), "雪é中🌕文");
  await page.getByTestId("otp-clear").click();
  await slots[0].focus();
  const completeBefore = Number(await page.getByTestId("otp-completions").textContent());
  await slots[0].evaluate((n) => {
    n.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    n.value = "雪";
    n.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        isComposing: true,
        inputType: "insertCompositionText",
        data: "雪",
      }),
    );
  });
  await page.getByTestId("theme").evaluate((n) => n.click());
  assert.equal(await slots[0].inputValue(), "雪");
  assert.equal(await value.textContent(), "");
  await slots[0].evaluate((n) =>
    n.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "雪" })),
  );
  await settle(page);
  assert.equal(await digits(page), "雪");
  await focusIs(slots[1]);
  assert.equal(Number(await page.getByTestId("otp-completions").textContent()), completeBefore);
  await page.getByTestId("otp-validation").click();
  // A full autofill-style native input event is accepted without a synthetic clipboard.
  await slots[0].focus();
  await slots[0].evaluate((n) => {
    n.value = "000123";
    n.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertReplacementText",
        data: "000123",
      }),
    );
  });
  await settle(page);
  assert.equal(await digits(page), "000123");
  await focusIs(slots[5]);
  await page.keyboard.press("Tab");
  await focusIs(page.getByTestId("otp-backup-slot-0"));
  await page.getByTestId("otp-backup-slot-0").fill("ab12");
  await settle(page);
  assert.equal(await page.getByTestId("otp-backup-slot-3").inputValue(), "2");
  const retired = await slots[0].elementHandle();
  await page.getByTestId("otp-mounted").click();
  assert.equal(await retired.getAttribute("inputmode"), null);
  assert.equal(
    await retired.evaluate((n) =>
      n.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }),
      ),
    ),
    true,
  );
  await retired.dispose();
  await page.getByTestId("otp-mounted").click();
  assert.equal(await digits(page), "000123");
  const captures = [];
  for (const glass of [false, true])
    for (const variant of ["primary", "secondary"])
      for (const theme of ["light", "dark"])
        for (const width of [390, 820]) {
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ reducedMotion: "reduce" });
          if (((await slots[0].getAttribute("data-lenso-glass")) === "true") !== glass)
            await page.getByTestId("otp-glass").click();
          if ((await slots[0].getAttribute("data-lenso-variant")) !== variant)
            await page.getByTestId("otp-variant").click();
          if (!(await page.locator(`[data-theme="${theme}"]`).count()))
            await page.getByTestId("theme").click();
          await code.scrollIntoViewIfNeeded();
          await page.getByTestId("otp-after").focus();
          await settle(page);
          const geometry = await code.evaluate((n) => {
            const r = n.getBoundingClientRect();
            return {
              x: r.x,
              right: r.right,
              width: r.width,
              viewport: innerWidth,
              slots: [...n.querySelectorAll('[data-slot="input-otp-slot"]')].map((s) => {
                const r = s.getBoundingClientRect(),
                  c = getComputedStyle(s);
                return {
                  x: r.x,
                  right: r.right,
                  width: r.width,
                  height: r.height,
                  border: c.borderTopWidth,
                  radius: c.borderTopLeftRadius,
                  corner: c.getPropertyValue("corner-shape"),
                  color: c.color,
                  background: c.backgroundColor,
                };
              }),
            };
          });
          assert.ok(geometry.x >= 0 && geometry.right <= geometry.viewport + 1);
          for (const s of geometry.slots) {
            assert.equal(s.border, "0px");
            assert.equal(s.radius, "999px");
            // Chromium serializes the round keyword as its equivalent superellipse exponent.
            if (s.corner) assert.ok(["round", "superellipse(1)"].includes(s.corner));
            assert.ok(s.width > 20 && Math.abs(s.width - s.height) < 1);
            assert.ok(s.x >= geometry.x - 1 && s.right <= geometry.right + 1);
          }
          const file = path.join(
            process.env.LENSO_EXACT_TEST_ARTIFACTS,
            `${engine}-${glass ? "glass" : "ordinary"}-${variant}-${theme}-${width}.png`,
          );
          await code.screenshot({ path: file });
          captures.push({ glass, variant, theme, width, file, geometry });
        }
  return { captures, realInputs: 6, syntheticComposition: true, autofillEvent: true };
}
export async function checkInputOTPForm(page, url) {
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByTestId("input-otp-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "otp-form-fixture";
      form.dataset.submits = "0";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.dataset.submits = String(Number(form.dataset.submits) + 1);
      });
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Submit code";
      form.append(submit);
      n.before(form);
      form.append(n);
      const external = document.createElement("form");
      external.id = "otp-external-form-fixture";
      external.dataset.submits = "0";
      external.addEventListener("submit", (e) => {
        e.preventDefault();
        external.dataset.submits = String(Number(external.dataset.submits) + 1);
      });
      form.after(external);
    });
    release();
    await page.waitForFunction(
      () => document.querySelector('[data-slot="input-otp-validity"]')?.required,
    );
    const form = page.locator("#otp-form-fixture"),
      external = page.locator("#otp-external-form-fixture"),
      slots = fields(page);
    const data = (n) => n.evaluate((n) => [...new FormData(n)]);
    assert.deepEqual(await data(form), [
      ["code", ""],
      ["backup", ""],
    ]);
    assert.equal(await form.evaluate((n) => n.reportValidity()), false);
    await focusIs(slots[0]);
    await slots[0].fill("12");
    await settle(page);
    assert.equal(await form.evaluate((n) => n.reportValidity()), false);
    await focusIs(slots[2]);
    await paste(slots[0], "001234");
    await settle(page);
    assert.equal(await form.evaluate((n) => n.checkValidity()), true);
    assert.deepEqual(await data(form), [
      ["code", "001234"],
      ["backup", ""],
    ]);
    assert.equal(await form.getAttribute("data-submits"), "0");
    await page.getByTestId("otp-backup-slot-0").fill("A");
    await settle(page);
    assert.equal(
      await form.evaluate((n) => n.checkValidity()),
      false,
      "optional partial code is invalid",
    );
    await page.getByTestId("otp-backup-slot-0").focus();
    await page.keyboard.press("Backspace");
    await settle(page);
    await page.getByTestId("otp-submit").click();
    await paste(slots[0], "009999");
    await settle(page);
    assert.equal(await form.getAttribute("data-submits"), "1");
    await form.evaluate((n) =>
      n.addEventListener("reset", (e) => e.preventDefault(), { once: true }),
    );
    await form.evaluate((n) => n.reset());
    await settle(page);
    assert.equal(await digits(page), "009999");
    await form.evaluate((n) => n.reset());
    await settle(page);
    assert.equal(await digits(page), "");
    assert.equal(await form.getAttribute("data-submits"), "1");
    await page.getByTestId("otp-form").click();
    assert.deepEqual(await data(form), []);
    assert.equal(await slots[0].getAttribute("form"), "otp-external-form-fixture");
    await paste(slots[0], "000001");
    await settle(page);
    assert.equal(await external.getAttribute("data-submits"), "1");
    assert.deepEqual(await data(external), [
      ["code", "000001"],
      ["backup", ""],
    ]);
    await external.evaluate((n) => n.reset());
    await settle(page);
    assert.equal(await digits(page), "");
    await page.getByTestId("otp-readonly").click();
    assert.equal(await external.evaluate((n) => n.checkValidity()), true);
    await page.getByTestId("otp-disabled").click();
    assert.deepEqual(await data(external), []);
    return {
      required: true,
      optionalPartial: true,
      leadingZero: true,
      autoSubmit: true,
      reset: true,
      cancelledReset: true,
      externalForm: true,
      readonly: true,
      disabled: true,
    };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}
export async function checkInputOTPTouch(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(url);
    await page.waitForFunction(() =>
      document.getElementById("otp-code-slot-0")?.hasAttribute("inputmode"),
    );
    const slots = fields(page);
    await slots[0].tap();
    await slots[0].fill("123456");
    await settle(page);
    assert.equal(await digits(page), "123456");
    await focusIs(slots[5]);
    await slots[2].tap();
    await focusIs(slots[2]);
    await slots[2].fill("9");
    await settle(page);
    assert.equal(await digits(page), "129456");
    await focusIs(slots[3]);
    assert.deepEqual(errors, []);
    return { nativeTap: true, errors };
  } finally {
    await context.close();
  }
}
