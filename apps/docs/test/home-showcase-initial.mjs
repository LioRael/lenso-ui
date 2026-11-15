import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
async function assertMorphLayout(menu, label) {
  await menu
    .locator('[data-lenso-slot="menu-glyph"] button')
    .first()
    .waitFor({ state: "attached" });
  const layout = await menu.evaluate((menu) => {
    const source = document.querySelector('[data-home-playground] [role="toolbar"]');
    const glyph = menu.querySelector('[data-lenso-slot="menu-glyph"]');
    const relativeBounds = (root, button) => {
      const outer = root.getBoundingClientRect();
      const inner = button.getBoundingClientRect();
      return [
        (inner.x - outer.x) / outer.width,
        (inner.y - outer.y) / outer.height,
        inner.width / outer.width,
        inner.height / outer.height,
      ];
    };
    return {
      source: [...source.querySelectorAll("button")]
        .filter((button) => !menu.contains(button))
        .map((button) => relativeBounds(source, button)),
      glyph: [...glyph.querySelectorAll("button")].map((button) => relativeBounds(glyph, button)),
    };
  });
  assert.equal(layout.glyph.length, layout.source.length, `${label}: copy every toolbar button`);
  for (const [index, bounds] of layout.source.entries()) {
    assert.ok(
      bounds.every((value, axis) => Math.abs(value - layout.glyph[index][axis]) <= 0.01),
      `${label}: morph copy must retain button ${index}'s position and size: ${JSON.stringify(layout)}`,
    );
  }
}

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.waitForLoadState("networkidle");
    const playground = page.getByRole("region", { name: "Typography playground" });
    const text = playground.getByRole("textbox", { name: "Poster text" });
    const style = (property) =>
      text.evaluate((node, property) => getComputedStyle(node)[property], property);
    assert.equal(await text.inputValue(), "Hello,\nLenso.");
    await text.fill("Something different.");
    const typeface = playground.getByRole("button", { name: "Typeface" });
    await typeface.click();
    const menu = page.getByRole("menu");
    await page.getByRole("menuitemradio", { name: "Serif", exact: true }).waitFor();
    const toolbar = playground.getByRole("toolbar", { name: "Type tools" });
    await page.waitForFunction(
      (element) => element.style.opacity.includes("--lg-menu-trigger-opacity"),
      await toolbar.elementHandle(),
      { timeout: 1000 },
    );
    await page.waitForFunction(
      (element) => !element.hasAttribute("data-menu-morphing"),
      await menu.elementHandle(),
    );
    await assertMorphLayout(menu, name);
    assert.equal(await typeface.evaluate((element) => getComputedStyle(element).opacity), "1");
    assert.equal(await toolbar.evaluate((element) => getComputedStyle(element).filter), "none");
    assert.equal(await menu.evaluate((element) => getComputedStyle(element).filter), "none");
    const menuRefraction = await menu.evaluate((element) =>
      getComputedStyle(element.querySelector("[data-material-lens]")).getPropertyValue(
        "--lg-refraction",
      ),
    );
    assert.equal(menuRefraction.trim(), "0", `${name}: menu must not magnify text behind it`);
    const menuFace = await menu.evaluate(
      (element) => getComputedStyle(element.querySelector("[data-material-lens]")).backgroundColor,
    );
    const menuFaceAlpha = menuFace.startsWith("rgba(")
      ? Number(menuFace.match(/,\s*([\d.]+)\)$/)?.[1])
      : menuFace === "transparent"
        ? 0
        : 1;
    assert.ok(
      menuFaceAlpha >= 0.999,
      `${name}: typeface menu should keep poster text behind its surface; got ${menuFace}`,
    );
    assert.equal(
      await playground
        .locator("[data-theme]")
        .evaluate((element) => getComputedStyle(element).filter),
      "none",
    );
    const [menuBounds, toolbarBounds] = await Promise.all([
      menu.boundingBox(),
      toolbar.boundingBox(),
    ]);
    assert.ok(
      Math.abs(menuBounds.x - toolbarBounds.x) <= 2 &&
        Math.abs(menuBounds.width - toolbarBounds.width) <= 2,
      `${name}: typeface menu should fill the toolbar width`,
    );
    assert.ok(
      Math.abs(menuBounds.y + menuBounds.height - toolbarBounds.y - toolbarBounds.height) <= 1,
      `${name}: typeface menu should cover the toolbar's original row`,
    );
    const serif = page.getByRole("menuitemradio", { name: "Serif", exact: true });
    const serifBounds = await serif.boundingBox();
    await page.mouse.move(serifBounds.x + 18, serifBounds.y + serifBounds.height / 2);
    await page.waitForFunction(
      (item) => item.hasAttribute("data-highlighted"),
      await serif.elementHandle(),
    );
    const hoverSurfaceVisible = await serif.evaluate((item) => {
      const itemBounds = item.getBoundingClientRect();
      const menu = item.closest('[role="menu"]');
      return [...menu.querySelectorAll('[data-lenso-slot="menu-plate"]')].some((plate) => {
        const bounds = plate.getBoundingClientRect();
        return (
          getComputedStyle(plate).opacity === "1" &&
          Math.abs(bounds.x - itemBounds.x) <= 1 &&
          Math.abs(bounds.y - itemBounds.y) <= 1 &&
          Math.abs(bounds.width - itemBounds.width) <= 1 &&
          Math.abs(bounds.height - itemBounds.height) <= 1
        );
      });
    });
    assert.ok(hoverSurfaceVisible, `${name}: hovered menu item should show its highlight`);
    const morphSource = await typeface.evaluate((trigger) => ({
      triggerOpacity: trigger.style.opacity,
      toolbarOpacity: trigger.closest('[data-lenso-slot="toolbar"]').style.opacity,
      groupOpacity: trigger.closest('[data-lenso-slot="toolbar-group"]').style.opacity,
      triggerMorphOpacity: trigger.style.getPropertyValue("--lg-menu-trigger-opacity"),
    }));
    assert.equal(morphSource.triggerOpacity, "", `${name}: keep the trigger visible`);
    assert.ok(
      morphSource.toolbarOpacity.includes("--lg-menu-trigger-opacity"),
      `${name}: morph the toolbar as a whole`,
    );
    assert.equal(morphSource.groupOpacity, "", `${name}: do not morph only the inner group`);
    assert.equal(morphSource.triggerMorphOpacity, "", `${name}: do not mask the trigger`);
    await page.getByRole("menuitemradio", { name: "Serif", exact: true }).click();
    await page.waitForFunction(
      (element) =>
        getComputedStyle(element).filter === "none" && getComputedStyle(element).opacity === "1",
      await toolbar.elementHandle(),
    );
    const separatorGaps = await toolbar.evaluate((element) => {
      const separator = [
        ...element.querySelectorAll(':scope > [data-lenso-slot="toolbar-separator"]'),
      ].find((item) => item.previousElementSibling.getAttribute("aria-label") === "Size");
      const previousButtons = [...separator.previousElementSibling.querySelectorAll("button")];
      const nextButtons = [...separator.nextElementSibling.querySelectorAll("button")];
      const line = separator.getBoundingClientRect();
      return {
        before: line.left - previousButtons.at(-1).getBoundingClientRect().right,
        after: nextButtons[0].getBoundingClientRect().left - line.right,
      };
    });
    assert.ok(
      separatorGaps.before >= 3.5 && separatorGaps.after >= 3.5,
      `${name}: separator after size should keep 4px from neighboring controls; got ${JSON.stringify(separatorGaps)}`,
    );
    assert.ok((await style("fontFamily")).includes("Georgia"));
    await playground.getByRole("button", { name: "Size 96", exact: true }).click();
    const size = playground.getByRole("slider", { name: "Size", exact: true });
    await size.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    assert.equal(await style("fontSize"), "33px");
    await page.keyboard.press("Escape");
    await size.waitFor({ state: "hidden", timeout: 1000 });
    await playground.getByRole("button", { name: "Align right", exact: true }).click();
    assert.equal(await style("textAlign"), "right");
    assert.equal(await style("fontWeight"), "760", "bold should be enabled initially");
    await playground.getByRole("button", { name: "Bold", exact: true }).click();
    assert.equal(await style("fontWeight"), "500");
    const orange = playground.getByRole("option", { name: "Orange", exact: true });
    await orange.click();
    await page.waitForTimeout(220);
    assert.equal(await orange.getAttribute("aria-selected"), "true");
    assert.equal(
      await playground
        .locator("[data-theme]")
        .evaluate((node) => getComputedStyle(node).backgroundColor),
      "rgb(255, 106, 61)",
    );
    assert.equal(await style("color"), "rgb(29, 29, 31)");
    assert.equal(await text.inputValue(), "Something different.", "formatting must preserve text");

    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await playground
        .locator("[data-theme]")
        .evaluate((node) => getComputedStyle(node).transitionDuration),
      "0.1s",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });

    await page.reload();
    await page.waitForLoadState("networkidle");
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForFunction(() => {
        const text = document.querySelector('[aria-label="Poster text"]');
        return text && getComputedStyle(text).marginBlockStart === "0px";
      });
      await typeface.click();
      await page.waitForFunction(
        () => document.querySelector('[role="menu"]')?.getAttribute("data-side") === "top",
      );
      await page.getByRole("menuitemradio", { name: "Serif", exact: true }).waitFor();
      await assertMorphLayout(menu, `${name}/${width}`);
      const [menuBounds, toolbarBounds, stageBounds] = await Promise.all([
        menu.boundingBox(),
        toolbar.boundingBox(),
        playground.locator("[data-theme]").boundingBox(),
      ]);
      assert.ok(
        Math.abs(menuBounds.y + menuBounds.height - toolbarBounds.y - toolbarBounds.height) <= 1,
        `${name}/${width}: menu should cover the toolbar's original row`,
      );
      assert.ok(
        Math.abs(menuBounds.x - toolbarBounds.x) <= 2 &&
          Math.abs(menuBounds.width - toolbarBounds.width) <= 2 &&
          menuBounds.x >= stageBounds.x + 12 &&
          menuBounds.x + menuBounds.width <= stageBounds.x + stageBounds.width - 12,
        `${name}/${width}: menu should fill the toolbar and stay inside the canvas: ${JSON.stringify({ menuBounds, toolbarBounds, stageBounds })}`,
      );
      await page.keyboard.press("Escape");
      await menu.waitFor({ state: "hidden", timeout: 1000 });
      await page.waitForFunction(
        (element) => getComputedStyle(element).filter === "none",
        await toolbar.elementHandle(),
      );
    }
    for (const width of [320, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await text.fill("A long unbroken sample: abcdefghijklmnopqrstuvwxyz0123456789");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${name}/${width}: horizontal overflow`,
      );
      await page.waitForFunction(() => {
        const swatches = [...document.querySelectorAll('[data-home-playground] [role="option"]')];
        return (
          swatches.length === 5 &&
          swatches.every((option) => option.getBoundingClientRect().width > 0)
        );
      });
      const layout = await playground.evaluate((root) => {
        const toolbar = root.querySelector('[role="toolbar"]');
        const swatches = root.querySelector('[role="listbox"]');
        const toolbarRect = toolbar.getBoundingClientRect();
        const buttons = [...toolbar.querySelectorAll("button")];
        const buttonRows = new Set(
          buttons.map((button) => Math.round(button.getBoundingClientRect().top)),
        );
        const swatchOptions = [...swatches.querySelectorAll('[role="option"]')];
        const swatchRows = new Set(
          swatchOptions.map((option) => Math.round(option.getBoundingClientRect().top)),
        );
        return {
          toolbarRows: buttonRows.size,
          toolbarButtonsFit: buttons.every((button) => {
            const rect = button.getBoundingClientRect();
            return rect.left >= toolbarRect.left && rect.right <= toolbarRect.right + 1;
          }),
          swatchRows: swatchRows.size,
          swatchTargets: swatchOptions.map((option) => {
            const rect = option.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          }),
        };
      });
      assert.equal(layout.toolbarRows, width <= 320 ? 2 : 1, `${name}/${width}: toolbar row count`);
      assert.equal(
        layout.toolbarButtonsFit,
        true,
        `${name}/${width}: toolbar buttons should remain visible`,
      );
      assert.equal(layout.swatchRows, 1, `${name}/${width}: paper swatches should stay on one row`);
      assert.ok(
        layout.swatchTargets.every(({ width, height }) => width === 44 && height === 44),
        `${name}/${width}: paper swatches should retain 44px targets; got ${JSON.stringify(layout.swatchTargets)}`,
      );
    }
    const motionPage = await browser.newPage({ viewport: { width: 768, height: 353 } });
    await motionPage.goto(base);
    await motionPage.waitForLoadState("networkidle");
    const motionPlayground = motionPage.getByRole("region", { name: "Typography playground" });
    const motionToolbar = motionPlayground.getByRole("toolbar", { name: "Type tools" });
    await motionPlayground.getByRole("button", { name: "Typeface" }).click();
    const motionMenu = motionPage.locator('[role="menu"][data-open][data-menu-morphing]');
    await motionMenu.waitFor({ state: "attached" });
    const motionMenuHandle = await motionMenu.elementHandle();
    await motionPage.getByRole("menuitemradio", { name: "Serif", exact: true }).waitFor();
    await motionPage.waitForFunction(
      (element) => !element.hasAttribute("data-menu-morphing"),
      motionMenuHandle,
    );
    const sourceBounds = await motionToolbar.boundingBox();
    const motionTypeface = motionPlayground.getByRole("button", { name: "Typeface" });
    const motionSerif = motionPage.getByRole("menuitemradio", { name: "Serif", exact: true });
    const motionSerifBounds = await motionSerif.boundingBox();
    await motionPage.mouse.move(
      motionSerifBounds.x + 18,
      motionSerifBounds.y + motionSerifBounds.height / 2,
    );
    await motionPage.waitForFunction(
      (item) => item.matches(":hover") && item.hasAttribute("data-highlighted"),
      await motionSerif.elementHandle(),
    );
    await motionPage.waitForFunction(
      (item) => {
        const row = item.getBoundingClientRect();
        return [
          ...item.closest('[role="menu"]').querySelectorAll('[data-lenso-slot="menu-plate"]'),
        ].some((plate) => {
          const bounds = plate.getBoundingClientRect();
          return (
            Number(getComputedStyle(plate).opacity) >= 0.99 &&
            Math.abs(bounds.x - row.x) <= 1 &&
            Math.abs(bounds.y - row.y) <= 1 &&
            Math.abs(bounds.width - row.width) <= 1 &&
            Math.abs(bounds.height - row.height) <= 1
          );
        });
      },
      await motionSerif.elementHandle(),
    );
    await motionPage.keyboard.press("Escape");
    const returningFrames = await motionPage.evaluate(
      (menu) =>
        new Promise((resolve) => {
          const frames = [];
          const sample = () => {
            const playground = document.querySelector("[data-home-playground]");
            const toolbar = playground.querySelector('[data-lenso-slot="toolbar"]');
            if (!menu.isConnected || !menu.hasAttribute("data-menu-morphing")) {
              resolve(frames);
              return;
            }
            const opacity = Number.parseFloat(getComputedStyle(toolbar).opacity);
            if (opacity > 0) {
              const bounds = (element) => {
                const { x, y, width, height } = element.getBoundingClientRect();
                return { x, y, width, height };
              };
              const plateOpacity = Math.max(
                0,
                ...[...menu.querySelectorAll('[data-lenso-slot="menu-plate"]')].map((plate) =>
                  Number(getComputedStyle(plate).opacity),
                ),
              );
              frames.push({
                opacity,
                toolbar: bounds(toolbar),
                surface: bounds(menu.querySelector('[data-lenso-slot="menu-surface"]')),
                plateOpacity,
                scrubbing: menu.hasAttribute("data-scrubbing"),
              });
            }
            requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }),
      motionMenuHandle,
    );
    const returningFrame = returningFrames.find(({ opacity }) => opacity > 0.99);
    assert.ok(returningFrame, `${name}: toolbar source should reappear during the return morph`);
    assert.equal(
      returningFrame.scrubbing,
      false,
      `${name}: release the hover scrub before handoff`,
    );
    assert.ok(
      returningFrame.plateOpacity <= 0.01,
      `${name}: fade the menu highlight before handing paint back to the toolbar`,
    );
    assert.equal(
      await motionTypeface.evaluate((trigger) => document.activeElement === trigger),
      true,
      `${name}: restore focus to the menu trigger`,
    );
    const returnOffset = Math.max(
      Math.abs(returningFrame.toolbar.x - sourceBounds.x),
      Math.abs(returningFrame.toolbar.y - sourceBounds.y),
      Math.abs(returningFrame.toolbar.width - sourceBounds.width),
      Math.abs(returningFrame.toolbar.height - sourceBounds.height),
      Math.abs(returningFrame.surface.x - returningFrame.toolbar.x),
      Math.abs(returningFrame.surface.y - returningFrame.toolbar.y),
      Math.abs(returningFrame.surface.width - returningFrame.toolbar.width),
      Math.abs(returningFrame.surface.height - returningFrame.toolbar.height),
    );
    assert.ok(
      returnOffset <= 1,
      `${name}: menu surface and toolbar should meet at the source bounds; offset ${returnOffset.toFixed(1)}px`,
    );
    await motionPage.close();
    assert.deepEqual(errors, []);
    console.log(
      `${name}: text editing, font, keyboard size/alignment, bold, paper color, reduced motion and responsive bounds passed`,
    );
  } finally {
    await browser.close();
  }
}
