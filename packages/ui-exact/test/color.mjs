import assert from "node:assert/strict";
import path from "node:path";
export async function checkColor(page, engine) {
  const group = page.getByTestId("accent-colors"),
    red = page.getByTestId("accent-red"),
    blue = page.getByTestId("accent-blue"),
    alpha = page.getByTestId("accent-alpha");
  await page.waitForFunction(() =>
    document.getElementById("accent-colors")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(await group.getAttribute("role"), "radiogroup");
  assert.equal(await red.isChecked(), true);
  assert.equal(await red.getAttribute("aria-label"), "Red");
  assert.equal(await page.getByTestId("accent-green").isDisabled(), true);
  assert.equal(await page.getByTestId("alpha-preview").getAttribute("role"), "img");
  assert.equal(
    await page.getByTestId("alpha-preview").getAttribute("aria-label"),
    "Half-transparent red",
  );
  await red.focus();
  await page.keyboard.press("ArrowRight");
  await page.getByTestId("color-value").filter({ hasText: "#0080FFFF" }).waitFor();
  assert.equal(await blue.isChecked(), true);
  await page.keyboard.press("ArrowRight");
  await page.getByTestId("color-value").filter({ hasText: "#FF000080" }).waitFor();
  assert.equal(await alpha.isChecked(), true);
  assert.equal(await red.isChecked(), false);
  await page.getByTestId("color-equivalent").click();
  await page.waitForFunction(() => document.getElementById("accent-blue").checked);
  assert.equal(await red.isChecked(), false);
  const preview = page.getByTestId("accent-preview");
  assert.equal(
    await preview
      .locator('[data-slot="color-swatch-fill"]')
      .evaluate((n) => getComputedStyle(n).backgroundColor),
    "rgb(0, 128, 255)",
  );
  await page.getByTestId("color-disabled").click();
  assert.equal(await red.isDisabled(), true);
  await red.evaluate((n) => n.click());
  assert.equal(await page.getByTestId("color-value").textContent(), "rgb(0, 128, 255)");
  await page.getByTestId("color-disabled").click();
  await page.getByTestId("color-direction").click();
  await blue.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => document.getElementById("accent-red").checked);
  await page.keyboard.press("End");
  await page.waitForFunction(() => document.getElementById("accent-alpha").checked);
  await page.keyboard.press("Home");
  await page.waitForFunction(() => document.getElementById("accent-red").checked);
  const sizes = { md: 32, lg: 36, xl: 40, xs: 16, sm: 24 };
  for (const [size, width] of Object.entries(sizes)) {
    assert.equal((await preview.boundingBox()).width, width, size);
    await page.getByTestId("color-size").click();
  }
  await page.getByTestId("color-shape").click();
  assert.equal(await preview.getAttribute("data-lenso-variant"), "square");
  await page.getByTestId("color-layout").click();
  assert.equal(await group.evaluate((n) => getComputedStyle(n).flexDirection), "column");
  await page.getByTestId("color-layout").click();
  assert.equal(await group.evaluate((n) => getComputedStyle(n).display), "grid");
  assert.ok(
    await page
      .getByTestId("accent-red-item")
      .evaluate((n) => getComputedStyle(n, "::after").boxShadow.includes("inset")),
  );
  await page.getByTestId("color-layout").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await group
      .locator('[data-slot="color-swatch-picker-swatch"]')
      .first()
      .evaluate((n) => getComputedStyle(n).transitionDuration),
    "0s",
  );
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await group.scrollIntoViewIfNeeded();
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS ??
          path.resolve(import.meta.dirname, "../.cache/example"),
        `${engine}-colors-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const fill = await preview.locator('[data-slot="color-swatch-fill"]').elementHandle();
  await page.getByTestId("color-mounted").click();
  assert.equal(await fill.evaluate((n) => n.style.backgroundColor), "rgb(255, 0, 0)");
  await fill.dispose();
  await page.getByTestId("color-mounted").click();
  await page.getByTestId("accent-alpha").click();
  await page.waitForFunction(() => document.getElementById("accent-alpha").checked);
  return {
    nativeRadioKeyboard: true,
    disabled: true,
    alphaIdentity: true,
    externalEquivalentValue: true,
    rtl: true,
    sizes: Object.keys(sizes),
    layouts: ["grid", "stack", "palette"],
    reducedMotion: true,
    disposal: true,
    captures,
  };
}

export async function checkColorInitial(page, url) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const hold = async (route) => {
    await gate;
    await route.continue();
  };
  await page.route("**/modules/index.js", hold);
  const snapshot = () =>
    page.evaluate(() => {
      const root = document.getElementById("accent-preview"),
        alpha = document.getElementById("alpha-preview");
      return {
        checked: document.getElementById("accent-red").checked,
        disabled: document.getElementById("accent-green").disabled,
        role: root.getAttribute("role"),
        name: root.getAttribute("aria-label"),
        width: root.getBoundingClientRect().width,
        color: getComputedStyle(root.firstElementChild).backgroundColor,
        alpha: getComputedStyle(alpha.firstElementChild).backgroundColor,
        checkerboard: getComputedStyle(alpha).backgroundImage,
      };
    });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.getElementById("accent-preview")?.getBoundingClientRect().width === 32,
    );
    assert.equal(await page.getByTestId("accent-preview").getAttribute("data-lenso-ready"), null);
    const before = await snapshot();
    assert.equal(before.checked, true);
    assert.equal(before.disabled, true);
    assert.equal(before.color, "rgb(255, 0, 0)");
    assert.ok(before.checkerboard.includes("conic-gradient"));
    release();
    await page.waitForFunction(() =>
      document.getElementById("accent-preview").hasAttribute("data-lenso-ready"),
    );
    assert.deepEqual(await snapshot(), before);
    return { initialAndInitialized: before };
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
}

export async function checkColorTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("accent-colors")?.hasAttribute("data-lenso-ready"),
  );
  await page.getByTestId("accent-blue").tap();
  await page.getByTestId("color-value").filter({ hasText: "#0080FFFF" }).waitFor();
  await page.getByTestId("accent-alpha").tap();
  await page.getByTestId("color-value").filter({ hasText: "#FF000080" }).waitFor();
  return { nativeTaps: true };
}
