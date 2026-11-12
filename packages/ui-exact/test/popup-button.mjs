import assert from "node:assert/strict";
import path from "node:path";
const isTransparent = (color) =>
  color === "transparent" || /^rgba\(.+,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);
const wait = (page) =>
  page.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await Promise.all(
      document
        .getElementById("popup-button-examples")
        .getAnimations({ subtree: true })
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
const focusIs = async (n) =>
  assert.equal(await n.evaluate((n) => document.activeElement === n), true);
const openState = (page, id, open) =>
  page.waitForFunction(
    ({ id, open }) => document.getElementById(id)?.matches(":popover-open") === open,
    { id, open },
  );
export async function checkPopupButtonInitial(page, url) {
  let release;
  const gate = new Promise((r) => (release = r));
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const results = [];
    for (const id of ["popup-order", "popup-menu-open", "popup-appearance-trigger"]) {
      const node = page.getByTestId(id),
        style = await node.evaluate((n) => {
          const s = getComputedStyle(n),
            r = n.getBoundingClientRect();
          return {
            tag: n.tagName,
            height: r.height,
            font: s.fontSize,
            weight: s.fontWeight,
            background: s.backgroundColor,
            shadow: s.boxShadow,
            ready: n.hasAttribute("data-lenso-ready"),
          };
        });
      assert.equal(style.tag, "BUTTON");
      assert.equal(style.height, 44);
      assert.equal(style.font, "18px");
      assert.equal(style.weight, "600");
      assert.ok(isTransparent(style.background));
      assert.equal(style.shadow, "none");
      assert.equal(style.ready, false);
      assert.equal(await node.locator('[data-slot="popup-button-indicator"]').count(), 1);
      results.push({ id, style });
    }
    return { styles: results };
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
    await page.waitForFunction(() =>
      document.getElementById("popup-menu-open")?.hasAttribute("data-lenso-ready"),
    );
  }
}
export async function checkPopupButton(page, engine) {
  const action = page.getByTestId("popup-order"),
    menu = page.getByTestId("popup-menu-open"),
    popup = page.getByTestId("popup-sort-menu"),
    select = page.getByTestId("popup-appearance-trigger"),
    selectPopup = page.getByTestId("popup-appearance-popup");
  await action.focus();
  await page.keyboard.press("Space");
  assert.equal(await page.getByTestId("popup-order-count").textContent(), "1");
  await page.keyboard.press("Enter");
  assert.equal(await page.getByTestId("popup-order-count").textContent(), "2");
  await action.click();
  assert.equal(await page.getByTestId("popup-order-count").textContent(), "3");
  assert.equal(await menu.getAttribute("aria-haspopup"), "menu");
  assert.equal(await select.getAttribute("role"), "combobox");
  assert.equal(await menu.getAttribute("data-material-filter"), null);
  await menu.focus();
  await page.keyboard.press("ArrowDown");
  await openState(page, "popup-sort-menu", true);
  await page.waitForFunction(() => document.activeElement?.id === "popup-sort-date");
  await page.keyboard.press("ArrowDown");
  await focusIs(page.getByTestId("popup-sort-name"));
  await page.keyboard.press("Enter");
  await openState(page, "popup-sort-menu", false);
  assert.equal(await page.getByTestId("popup-sort-value").textContent(), "name");
  assert.match(await menu.textContent(), /Name/);
  await focusIs(menu);
  await menu.focus();
  await page.keyboard.press("ArrowUp");
  await openState(page, "popup-sort-menu", true);
  await focusIs(page.getByTestId("popup-sort-name"));
  await page.keyboard.press("Escape");
  await openState(page, "popup-sort-menu", false);
  await focusIs(menu);
  await page.getByTestId("popup-reject").click();
  await menu.click();
  await openState(page, "popup-sort-menu", true);
  await page.getByTestId("popup-sort-date").click();
  await openState(page, "popup-sort-menu", false);
  assert.equal(await page.getByTestId("popup-sort-value").textContent(), "name");
  assert.equal(await page.getByTestId("popup-sort-name").getAttribute("aria-checked"), "true");
  await page.getByTestId("popup-reject").click();
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await openState(page, "popup-appearance-popup", true);
  await page.waitForFunction(() => document.activeElement?.id === "popup-appearance-option-0");
  await page.keyboard.press("ArrowDown");
  await focusIs(page.getByTestId("popup-appearance-option-2"));
  await page.keyboard.press("Enter");
  await openState(page, "popup-appearance-popup", false);
  assert.equal(await page.getByTestId("popup-appearance-value").textContent(), "light");
  assert.match(await select.textContent(), /Light/);
  await focusIs(select);
  await page.getByTestId("popup-reject").click();
  await select.click();
  await page.getByTestId("popup-appearance-option-3").click();
  await openState(page, "popup-appearance-popup", false);
  assert.equal(await page.getByTestId("popup-appearance-value").textContent(), "light");
  await page.getByTestId("popup-reject").click();
  await page.getByTestId("popup-readonly").click();
  await select.click();
  assert.equal(await selectPopup.evaluate((n) => n.matches(":popover-open")), false);
  await page.getByTestId("popup-readonly").click();
  await page.getByTestId("popup-disabled").click();
  for (const n of [action, menu, select]) {
    assert.equal(await n.isDisabled(), true);
    await n.evaluate((n) => n.click());
  }
  assert.equal(await page.getByTestId("popup-order-count").textContent(), "3");
  assert.equal(await popup.evaluate((n) => n.matches(":popover-open")), false);
  await page.getByTestId("popup-disabled").click();
  await menu.click();
  await page.getByTestId("popup-after").click();
  await openState(page, "popup-sort-menu", false);
  await page.getByTestId("popup-direction").click();
  assert.equal(await menu.evaluate((n) => getComputedStyle(n).direction), "rtl");
  await menu.click();
  await openState(page, "popup-sort-menu", true);
  await page.keyboard.press("Escape");
  await focusIs(menu);
  await page.getByTestId("popup-direction").click();
  await menu.click();
  const retired = await popup.elementHandle();
  await page.getByTestId("popup-mounted").click();
  assert.equal(await retired.evaluate((n) => n.matches(":popover-open")), false);
  await retired.dispose();
  await page.getByTestId("popup-mounted").click();
  await menu.click();
  await openState(page, "popup-sort-menu", true);
  await page.keyboard.press("Escape");
  const captures = [];
  for (const width of [390, 820])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").click();
      await action.scrollIntoViewIfNeeded();
      await page.getByTestId("popup-after").focus();
      await wait(page);
      const geometry = await page.locator("#popup-button-examples").evaluate((root) =>
        [...root.querySelectorAll('[data-slot="popup-button"], [data-slot="select-trigger"]')].map(
          (n) => {
            const r = n.getBoundingClientRect(),
              s = getComputedStyle(n),
              icon = n.querySelector('[data-slot="popup-button-indicator"]'),
              i = icon.getBoundingClientRect();
            return {
              id: n.id,
              height: r.height,
              font: s.fontSize,
              background: s.backgroundColor,
              shadow: s.boxShadow,
              x: r.x,
              right: r.right,
              viewport: innerWidth,
              iconWidth: i.width,
              iconHeight: i.height,
              hidden: icon.getAttribute("aria-hidden"),
            };
          },
        ),
      );
      assert.equal(geometry.length, 3);
      for (const g of geometry) {
        assert.equal(g.height, 44);
        assert.equal(g.font, "18px");
        assert.ok(isTransparent(g.background), JSON.stringify(g));
        assert.equal(g.shadow, "none");
        assert.equal(g.iconWidth, 14);
        assert.equal(g.iconHeight, 18);
        assert.equal(g.hidden, "true");
        assert.ok(g.x >= 0 && g.right <= g.viewport + 1);
      }
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS,
        `${engine}-${theme}-${width}.png`,
      );
      await page.locator("#popup-button-examples").screenshot({ path: file });
      await menu.click();
      await openState(page, "popup-sort-menu", true);
      await page.waitForFunction(() =>
        document.getElementById("popup-sort-menu").hasAttribute("data-lenso-positioned"),
      );
      await wait(page);
      const menuFile = file.replace(".png", "-menu.png");
      await page.getByTestId("popup-sort-menu-popup").screenshot({ path: menuFile });
      await page.keyboard.press("Escape");
      await select.click();
      await openState(page, "popup-appearance-popup", true);
      await wait(page);
      const selectFile = file.replace(".png", "-select.png");
      await selectPopup.screenshot({ path: selectFile });
      await page.keyboard.press("Escape");
      captures.push({ width, theme, file, menuFile, selectFile, geometry });
    }
  return {
    captures,
    nativeActivation: true,
    menuComposition: true,
    selectComposition: true,
    lifecycle: true,
  };
}
export async function checkPopupButtonTouch(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
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
      document.getElementById("popup-menu-open")?.hasAttribute("data-lenso-ready"),
    );
    await page.getByTestId("popup-menu-open").tap();
    await openState(page, "popup-sort-menu", true);
    await page.getByTestId("popup-sort-name").tap();
    await openState(page, "popup-sort-menu", false);
    assert.equal(await page.getByTestId("popup-sort-value").textContent(), "name");
    await page.getByTestId("popup-appearance-trigger").tap();
    await page.getByTestId("popup-appearance-option-3").tap();
    await openState(page, "popup-appearance-popup", false);
    assert.equal(await page.getByTestId("popup-appearance-value").textContent(), "dark");
    assert.deepEqual(errors, []);
    return { nativeTaps: true, errors };
  } finally {
    await context.close();
  }
}
