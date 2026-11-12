import assert from "node:assert/strict";
import path from "node:path";
export async function checkColorField(page, engine) {
  const hex = page.getByTestId("color-hex-input"),
    channel = page.getByTestId("color-channel-input"),
    alpha = page.getByTestId("color-alpha-input");
  const root = page.getByTestId("color-hex");
  const canonical = () => page.getByTestId("field-color-value").textContent();
  const commits = async () =>
    Number((await page.getByTestId("field-color-commits").textContent()).replace("Commits: ", ""));
  await page.waitForFunction(
    () =>
      document.getElementById("color-hex").hasAttribute("data-lenso-ready") &&
      document.getElementById("color-hex-input").readOnly === false,
  );
  assert.equal(await hex.inputValue(), "#0080FF");
  assert.equal(await alpha.inputValue(), "100%");
  assert.equal(await channel.getAttribute("role"), "spinbutton");
  assert.equal(await hex.getAttribute("aria-describedby"), "color-hex-hint");
  assert.equal((await page.getByTestId("color-hex-group").boundingBox()).height, 34);
  await page.getByTestId("color-hex-label").click();
  assert.equal(await hex.evaluate((n) => n === document.activeElement), true);
  await hex.fill("abc");
  await page.getByTestId("field-color-value").filter({ hasText: "#AABBCCFF" }).waitFor();
  assert.equal(await hex.inputValue(), "abc");
  await hex.press("Enter");
  assert.equal(await hex.inputValue(), "#AABBCC");
  assert.equal(await commits(), 1);
  await hex.press("Tab");
  assert.equal(await commits(), 1);
  assert.equal(await channel.inputValue(), "170");
  const accepted = await canonical();
  await hex.fill("not a color");
  assert.equal(await hex.evaluate((n) => n.validity.customError), true);
  await hex.press("Escape");
  assert.equal(await canonical(), accepted);
  assert.equal(await hex.inputValue(), "#AABBCC");
  await hex.fill("#12");
  await hex.press("Enter");
  assert.equal(await hex.inputValue(), "#AABBCC");
  assert.equal(await commits(), 1);
  await channel.fill("999");
  await channel.press("Enter");
  assert.equal(await channel.inputValue(), "255");
  await channel.press("Home");
  assert.equal(await channel.getAttribute("aria-valuenow"), "0");
  await channel.press("End");
  assert.equal(await channel.getAttribute("aria-valuenow"), "255");
  await page.getByTestId("color-field-locale").click();
  await alpha.fill("25 %");
  await alpha.press("Enter");
  assert.equal(await alpha.getAttribute("aria-valuenow"), "0.25");
  assert.equal(
    await page.getByTestId("color-alpha").locator('[data-slot="color-field-form"]').inputValue(),
    "0.25",
  );
  const form = await root.locator('[data-slot="color-field-form"]').getAttribute("name");
  assert.equal(form, "hex");
  assert.equal(await hex.getAttribute("name"), "");
  await page.getByTestId("color-field-readonly").click();
  assert.equal(await hex.evaluate((n) => n.readOnly), true);
  const unchanged = await canonical();
  await channel.focus();
  await channel.press("ArrowDown");
  assert.equal(await canonical(), unchanged);
  const lockedCommits = await commits();
  await channel.press("Enter");
  assert.equal(await commits(), lockedCommits);
  await page.getByTestId("color-field-readonly").click();
  await page.getByTestId("color-field-disabled").click();
  assert.equal(await hex.isDisabled(), true);
  await page.getByTestId("color-field-disabled").click();
  await page.getByTestId("color-field-reset").click();
  await page.getByTestId("color-field-reject").click();
  await hex.fill("#ff0000");
  await page.waitForFunction(() => document.getElementById("color-hex-input").value === "#0080FF");
  assert.equal(await canonical(), "#0080FFFF");
  await page.getByTestId("color-field-reject").click();
  await channel.fill("-");
  await page.getByTestId("color-field-space").evaluate((n) => n.click());
  await page.waitForFunction(() => document.getElementById("color-channel-input").value !== "-");
  assert.equal(await channel.evaluate((n) => n.validity.customError), false);
  const before = Number(await channel.getAttribute("aria-valuenow"));
  await channel.press("ArrowUp");
  const after = Number(await channel.getAttribute("aria-valuenow"));
  assert.ok(Math.abs(after - before - 1) < 0.001);
  assert.ok((await canonical()).startsWith("hsla("));
  await hex.fill("");
  assert.equal(await hex.evaluate((n) => n.validity.valueMissing), true);
  await page.getByTestId("color-field-reset").click();
  await page.getByTestId("color-field-variant").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await page.waitForFunction(
        () =>
          document.getElementById("color-hex-input").value === "#0080FF" &&
          !document.getElementById("color-hex-input").readOnly,
      );
      assert.equal(await channel.inputValue(), await channel.getAttribute("aria-valuetext"));
      assert.equal((await alpha.inputValue()).replace(/\s/g, ""), "100%");
      await root.scrollIntoViewIfNeeded();
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS ??
          path.resolve(import.meta.dirname, "../.cache/example"),
        `${engine}-color-fields-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const detached = await hex.elementHandle();
  await page.getByTestId("color-field-mounted").click();
  assert.equal(await detached.evaluate((n) => n.readOnly), true);
  assert.equal(await detached.evaluate((n) => n.getAttribute("role")), null);
  await detached.dispose();
  await page.getByTestId("color-field-mounted").click();
  await page.waitForFunction(() => document.getElementById("color-hex-input").readOnly === false);
  await hex.fill("#");
  await hex.pressSequentially("112233");
  await hex.press("Enter");
  assert.equal(await canonical(), "#112233FF");
  const beforeComposition = await canonical();
  await hex.evaluate((n) => {
    n.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    n.value = "#445566";
    n.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    );
  });
  assert.equal(await canonical(), beforeComposition);
  await hex.evaluate((n) =>
    n.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "#445566" })),
  );
  await page.getByTestId("field-color-value").filter({ hasText: "#445566FF" }).waitFor();
  await hex.press("Enter");
  assert.equal(await hex.inputValue(), "#445566");
  for (const dirty of [false, true]) {
    if (dirty) await hex.fill("abcdef");
    const before = await hex.inputValue();
    await hex.evaluate(async (n) => {
      n.setSelectionRange(1, 4);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.getByTestId("theme").evaluate((n) => n.click());
    await page.waitForFunction(
      (expected) => document.getElementById("color-hex-input").value === expected,
      before,
    );
    assert.deepEqual(await hex.evaluate((n) => [n.selectionStart, n.selectionEnd]), [1, 4]);
  }
  return {
    hexDraftAndCommit: true,
    realTypingCaret: true,
    compositionSequence: "synthetic native DOM events",
    invalidRevert: true,
    clamping: true,
    channels: true,
    hslIdentity: true,
    localizedPercent: true,
    nativeFormProjection: true,
    disabledReadOnly: true,
    controlledRejection: true,
    focusedConfigurationChange: true,
    redrawFormatting: true,
    selectionAcrossRedraw: true,
    lifecycle: true,
    captures,
  };
}

export async function checkColorFieldForm(page, url) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByTestId("color-field-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "color-field-form-fixture";
      form.addEventListener("submit", (event) => event.preventDefault());
      n.before(form);
      form.append(n);
    });
    release();
    await page.waitForFunction(
      () =>
        document.getElementById("color-alpha-input").value === "100%" &&
        !document.getElementById("color-hex-input").readOnly,
    );
    const form = page.locator("#color-field-form-fixture");
    const data = () => form.evaluate((n) => [...new FormData(n)]);
    assert.deepEqual(await data(), [
      ["hex", "#0080FF"],
      ["channel", "0"],
      ["opacity", "1"],
    ]);
    await page.getByTestId("color-alpha-input").fill("25%");
    await page.getByTestId("color-alpha-input").press("Enter");
    assert.deepEqual(await data(), [
      ["hex", "#0080FF"],
      ["channel", "0"],
      ["opacity", "0.25"],
    ]);
    await form.evaluate((n) => n.reset());
    await page.waitForFunction(() => document.getElementById("color-alpha-input").value === "100%");
    assert.deepEqual(await data(), [
      ["hex", "#0080FF"],
      ["channel", "0"],
      ["opacity", "1"],
    ]);
    await page.getByTestId("color-field-disabled").click();
    assert.deepEqual(await data(), []);
    return {
      canonicalFormData: true,
      reset: true,
      disabledExclusion: true,
      fixture: "native DOM form authored before hatch",
    };
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
}
export async function checkColorFieldTouch(page) {
  const input = page.getByTestId("color-hex-input");
  await page.waitForFunction(() => !document.getElementById("color-hex-input").readOnly);
  await input.tap();
  assert.equal(await input.evaluate((n) => document.activeElement === n), true);
  await input.fill("#abcdef");
  await input.press("Enter");
  await page.getByTestId("field-color-value").filter({ hasText: "#ABCDEFFF" }).waitFor();
  return { nativeTapFocus: true, editingAfterTap: true };
}
