import assert from "node:assert/strict";
import path from "node:path";
const artifacts =
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? path.resolve(import.meta.dirname, "../.cache/example");
const direct = (page, name) => page.getByTestId(`select-${name}`).evaluate((n) => n.click());
const trigger = (page) => page.getByTestId("appearance-select-trigger");
const popup = (page) => page.getByTestId("appearance-select-popup");
const item = (page, index) => page.getByTestId(`appearance-select-option-${index}`);
const shown = (page, value) =>
  page.waitForFunction(
    (value) =>
      document.querySelector('[data-testid="select-value"]').textContent === `Selected: ${value}`,
    value,
  );
const open = (page, value) =>
  page.waitForFunction(
    (value) =>
      document.getElementById("appearance-select-popup").matches(":popover-open") === value,
    value,
  );
const focus = (page, index) =>
  page.waitForFunction(
    (index) => document.activeElement?.id === `appearance-select-option-${index}`,
    index,
  );
const ready = (page) =>
  page.waitForFunction(
    () => !!document.querySelector('#appearance-select [data-slot="select-item"][data-selected]'),
  );

export async function checkSelectInitial(page, url) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    const geometry = await trigger(page).evaluate((n) => ({
      height: n.getBoundingClientRect().height,
      font: getComputedStyle(n).fontSize,
      background: getComputedStyle(n).backgroundColor,
      role: n.getAttribute("role"),
    }));
    assert.equal(geometry.height, 44);
    assert.equal(geometry.font, "18px");
    assert.equal(geometry.role, "combobox");
    await trigger(page).click();
    await open(page, true);
    await item(page, 1).click();
    await shown(page, "light");
    release();
    await ready(page);
    await page.keyboard.press("Escape");
    await open(page, false);
    return { geometry, nativeOpen: true, nativeSelection: true };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}

export async function checkSelect(page, engine) {
  await ready(page);
  await trigger(page).scrollIntoViewIfNeeded();
  assert.equal(await page.getByRole("combobox", { name: "Appearance", exact: true }).count(), 1);
  assert.equal(await trigger(page).getAttribute("aria-controls"), "appearance-select-list");
  assert.equal(await trigger(page).getAttribute("aria-describedby"), "appearance-description");
  await trigger(page).press("ArrowDown");
  await open(page, true);
  await focus(page, 0);
  await page.keyboard.press("ArrowDown");
  await focus(page, 1);
  await page.keyboard.press("ArrowDown");
  await focus(page, 3);
  await page.keyboard.press("End");
  await focus(page, 4);
  await page.keyboard.press("Home");
  await focus(page, 0);
  await page.keyboard.press("h");
  await focus(page, 3);
  await page.keyboard.press("Escape");
  await open(page, false);
  assert.equal(await trigger(page).evaluate((n) => n === document.activeElement), true);
  await shown(page, "auto");
  await page.waitForTimeout(520);
  await trigger(page).press("l");
  await shown(page, "light");
  await open(page, false);
  await trigger(page).press("Enter");
  await open(page, true);
  await focus(page, 1);
  await page.keyboard.press(" ");
  await open(page, false);
  await shown(page, "light");
  await direct(page, "multiple");
  await shown(page, "auto");
  await trigger(page).click();
  await open(page, true);
  await focus(page, 0);
  assert.equal(
    await page.locator("#appearance-select-list").getAttribute("aria-multiselectable"),
    "true",
  );
  await item(page, 1).click();
  await shown(page, "auto | light");
  await open(page, true);
  await item(page, 0).click();
  await shown(page, "light");
  await open(page, true);
  await item(page, 4).click();
  await shown(page, "light | 😀, 🌓");
  assert.equal(await item(page, 4).getAttribute("aria-selected"), "true");
  await page.keyboard.press("Escape");
  await open(page, false);
  await direct(page, "readonly");
  await trigger(page).click();
  await open(page, false);
  await trigger(page).press("a");
  await shown(page, "light | 😀, 🌓");
  await direct(page, "readonly");
  await direct(page, "disabled");
  assert.equal(await trigger(page).isDisabled(), true);
  await direct(page, "disabled");
  await direct(page, "external");
  await shown(page, "light");
  await trigger(page).press("ArrowUp");
  await open(page, true);
  await focus(page, 1);
  await direct(page, "readonly");
  await open(page, false);
  await direct(page, "readonly");
  await direct(page, "grouped");
  await trigger(page).click();
  await open(page, true);
  assert.equal(await page.getByRole("group", { name: "Built in" }).count(), 1);
  await direct(page, "item-disabled");
  await page.waitForFunction(() => !document.getElementById("appearance-select-option-2").disabled);
  await item(page, 2).click();
  await shown(page, "light | dark");
  await direct(page, "extra");
  await page.waitForFunction(() => !!document.getElementById("appearance-select-option-5"));
  await item(page, 5).click();
  await shown(page, "light | dark | custom");
  await direct(page, "extra");
  await page.waitForFunction(() => document.activeElement?.id === "appearance-select-option-0");
  await page.keyboard.press("Tab");
  await open(page, false);
  assert.equal(
    await page.getByTestId("select-next").evaluate((n) => n === document.activeElement),
    true,
  );
  await trigger(page).click();
  await open(page, true);
  await page.getByTestId("select-next").click();
  await open(page, false);
  await direct(page, "clear");
  await shown(page, "");
  assert.equal(await page.locator('[data-slot="select-value"]').textContent(), "Choose appearance");
  await direct(page, "external");
  await shown(page, "light");
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const appearance of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      for (const variant of ["primary", "secondary"]) {
        if ((await trigger(page).getAttribute("data-lenso-variant")) !== variant)
          await direct(page, "variant");
        await trigger(page).click();
        await open(page, true);
        const geometry = await popup(page).evaluate((n) => {
          const r = n.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        });
        assert.ok(geometry.left >= 7 && geometry.right <= width - 7);
        assert.ok(geometry.top >= 7 && geometry.bottom <= 907);
        const row = await item(page, 1).boundingBox();
        assert.ok(row.height >= 44);
        await page.screenshot({
          path: path.join(artifacts, `${engine}-select-${appearance}-${variant}-${width}.png`),
        });
        captures.push({ width, appearance, variant, geometry });
        await page.keyboard.press("Escape");
        await open(page, false);
      }
    }
  }
  await direct(page, "width");
  await direct(page, "direction");
  assert.equal(
    await page.locator("#appearance-select").evaluate((n) => getComputedStyle(n).direction),
    "rtl",
  );
  const dimensions = await trigger(page).evaluate((n) => ({
    trigger: n.getBoundingClientRect().width,
    root: n.closest('[data-slot="select-root"]').getBoundingClientRect().width,
  }));
  assert.ok(Math.abs(dimensions.trigger - dimensions.root) < 0.5);
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await trigger(page).press("ArrowDown");
  await open(page, true);
  await page.waitForFunction(() =>
    document.querySelector('[data-slot="select-popover"]').hasAttribute("data-material-opaque"),
  );
  await page.keyboard.press("Escape");
  await open(page, false);
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  await trigger(page).click();
  await open(page, true);
  const old = await popup(page).elementHandle();
  await direct(page, "editor");
  await page.waitForFunction((n) => !n.matches(":popover-open"), old);
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lenso-exact-menu-x")), "");
  await old.dispose();
  await direct(page, "editor");
  await ready(page);
  await trigger(page).click();
  await open(page, true);
  await direct(page, "mounted");
  await page.waitForFunction(() => !document.getElementById("appearance-select"));
  await direct(page, "mounted");
  await ready(page);
  await trigger(page).press("ArrowDown");
  await open(page, true);
  await page.keyboard.press("Escape");
  await open(page, false);
  return {
    keyboard: true,
    typeahead: true,
    multiple: true,
    unicodeValues: true,
    disabledAndReadOnly: true,
    groupsAndDynamicItems: true,
    tabAndOutsideDismissal: true,
    lifecycle: true,
    captures,
  };
}

export async function checkSelectForm(page, url) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    await page.locator("#select-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "select-form-fixture";
      form.addEventListener("submit", (e) => e.preventDefault());
      n.before(form);
      form.append(n);
    });
    release();
    await ready(page);
    const data = () => page.locator("#select-form-fixture").evaluate((n) => [...new FormData(n)]);
    assert.deepEqual(await data(), [["appearance", "auto"]]);
    await direct(page, "multiple");
    await trigger(page).click();
    await open(page, true);
    await item(page, 4).click();
    await shown(page, "auto | 😀, 🌓");
    assert.deepEqual(await data(), [
      ["appearance", "auto"],
      ["appearance", "😀, 🌓"],
    ]);
    await page.keyboard.press("Escape");
    await open(page, false);
    await direct(page, "clear");
    await shown(page, "");
    assert.equal(
      await page.locator('[data-slot="select-validity"]').evaluate((n) => n.validity.valueMissing),
      true,
    );
    assert.equal(
      await page.locator("#select-form-fixture").evaluate((n) => n.reportValidity()),
      false,
    );
    assert.equal(await trigger(page).evaluate((n) => n === document.activeElement), true);
    await page.locator("#select-form-fixture").evaluate((n) => n.reset());
    await shown(page, "auto");
    assert.deepEqual(await data(), [["appearance", "auto"]]);
    await direct(page, "disabled");
    assert.deepEqual(await data(), []);
    return {
      canonicalValues: true,
      required: true,
      invalidFocus: true,
      reset: true,
      disabledExclusion: true,
      fixture: "native DOM form authored before hatch",
    };
  } finally {
    release();
    await page.unroute("**/modules/index.js");
  }
}
