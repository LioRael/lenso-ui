import assert from "node:assert/strict";
import path from "node:path";
export async function checkMenu(page, engine) {
  const trigger = page.getByTestId("menu-open"),
    root = page.getByTestId("document-menu"),
    popup = page.getByTestId("document-menu-popup"),
    next = page.getByTestId("menu-next");
  const first = page.getByTestId("menu-share"),
    last = page.getByTestId("menu-delete"),
    grid = page.getByTestId("menu-grid");
  const direct = (name) => page.getByTestId(`menu-${name}`).evaluate((n) => n.click());
  const opened = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("document-menu"),
        p = document.getElementById("document-menu-popup");
      return (
        n?.matches(":popover-open") &&
        n.hasAttribute("data-lenso-positioned") &&
        !n.hasAttribute("data-lenso-position-pending") &&
        !p.hasAttribute("data-starting-style") &&
        Math.abs(p.getBoundingClientRect().width - p.offsetWidth) < 0.5
      );
    });
  const closed = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("document-menu");
      return n && !n.matches(":popover-open") && getComputedStyle(n).display === "none";
    });
  const isOpen = () => root.evaluate((n) => n.matches(":popover-open"));
  const focused = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction((n) => n === document.activeElement, handle);
    } finally {
      await handle.dispose();
    }
  };
  await page.waitForFunction(() =>
    document.getElementById("document-menu")?.hasAttribute("data-lenso-ready"),
  );
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  await focused(first);
  assert.equal(await root.getAttribute("role"), "menu");
  assert.equal(await trigger.getAttribute("aria-expanded"), "true");
  assert.equal(await trigger.getAttribute("aria-controls"), "document-menu");
  await grid.hover();
  await focused(grid);
  assert.equal(await grid.getAttribute("data-highlighted"), "");
  await page.mouse.move(page.viewportSize().width - 2, 4);
  await focused(trigger);
  assert.equal(await grid.getAttribute("data-highlighted"), null);
  assert.equal(
    await isOpen(),
    true,
    "native pointer focus can return to the trigger without closing",
  );
  await first.focus();
  const handle = await root.elementHandle(),
    firstHandle = await first.elementHandle();
  await page.keyboard.press("ArrowUp");
  await focused(last);
  await page.keyboard.press("Home");
  await focused(first);
  await page.keyboard.press("End");
  await focused(last);
  await grid.focus();
  await page.keyboard.press("ArrowDown");
  await focused(page.getByTestId("menu-sort-name"));
  await page.keyboard.press("d");
  await focused(page.getByTestId("menu-sort-date"));
  await page.waitForTimeout(550);
  await page.keyboard.press("m");
  await focused(last);
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await page.keyboard.press("ArrowUp");
  await opened();
  await focused(last);
  await page.keyboard.press("Escape");
  await closed();
  await trigger.click();
  await opened();
  await focused(first);
  await page.keyboard.press("Enter");
  await closed();
  assert.equal(await page.getByTestId("menu-result").textContent(), "Share document");
  assert.equal(await page.getByTestId("menu-count").textContent(), "Actions: 1");
  await focused(trigger);
  await trigger.click();
  await opened();
  await grid.click();
  assert.equal(await isOpen(), true);
  await page.waitForFunction(
    () => document.getElementById("menu-grid").getAttribute("aria-checked") === "false",
  );
  assert.equal(
    await grid
      .locator('[data-slot="menu-item-indicator"]')
      .evaluate((n) => getComputedStyle(n).opacity),
    "0",
  );
  assert.equal(await grid.evaluate((n) => getComputedStyle(n).paddingInlineStart), "36px");
  await grid.focus();
  await page.keyboard.press("Space");
  await page.waitForFunction(
    () => document.getElementById("menu-grid").getAttribute("aria-checked") === "true",
  );
  assert.equal(await isOpen(), true);
  await page.getByTestId("menu-sort-date").click();
  await page.waitForFunction(
    () => document.getElementById("menu-sort-date").getAttribute("aria-checked") === "true",
  );
  assert.equal(await page.getByTestId("menu-sort-name").getAttribute("aria-checked"), "false");
  assert.equal(await page.getByTestId("menu-sort-result").textContent(), "Sort: date");
  await direct("unavailable");
  await page.waitForFunction(() => !document.getElementById("menu-unavailable-item").disabled);
  await grid.focus();
  await page.keyboard.press("ArrowDown");
  await focused(page.getByTestId("menu-unavailable-item"));
  assert.equal(await page.getByTestId("menu-unavailable-item").getAttribute("data-disabled"), null);
  await direct("unavailable");
  await grid.focus();
  await page.keyboard.press("ArrowDown");
  await focused(page.getByTestId("menu-sort-name"));
  await page.getByTestId("menu-help").click();
  await closed();
  assert.equal(new URL(page.url()).hash, "#menu-examples");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  await page.keyboard.press("Tab");
  await closed();
  await focused(next);
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  const prevented = await first.evaluate((n) => {
    const e = new KeyboardEvent("keydown", {
      key: "Tab",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    n.dispatchEvent(e);
    return e.defaultPrevented;
  });
  assert.equal(prevented, false);
  assert.equal(await isOpen(), true);
  await page.keyboard.press("Escape");
  await closed();
  await direct("disabled");
  assert.equal(await trigger.isDisabled(), true);
  await trigger.evaluate((n) => n.click());
  assert.equal(await isOpen(), false);
  await direct("disabled");
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1200, height: 1400 });
  const oldStyle = await trigger.getAttribute("style");
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:520px;top:560px;z-index:100"),
  );
  const endpoints = [];
  for (const direction of ["ltr", "rtl"]) {
    if (direction === "rtl") await direct("direction");
    for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"]) {
      for (let i = 0; i < 6 && (await root.getAttribute("data-lenso-side")) !== side; i++)
        await direct("side");
      for (const align of ["start", "center", "end"]) {
        for (let i = 0; i < 3 && (await root.getAttribute("data-lenso-align")) !== align; i++)
          await direct("align");
        await trigger.click();
        await opened();
        const resolved =
          side === "inline-start"
            ? direction === "rtl"
              ? "right"
              : "left"
            : side === "inline-end"
              ? direction === "rtl"
                ? "left"
                : "right"
              : side;
        assert.equal(await popup.getAttribute("data-side"), resolved);
        assert.equal(await popup.getAttribute("data-align"), align);
        const a = await trigger.boundingBox(),
          b = await root.boundingBox();
        assert.ok(b.x >= 7 && b.y >= 7 && b.x + b.width <= 1193 && b.y + b.height <= 1393);
        if (resolved === "left") assert.ok(b.x + b.width <= a.x - 7);
        if (resolved === "right") assert.ok(b.x >= a.x + a.width + 7);
        if (resolved === "top") assert.ok(b.y + b.height <= a.y - 7);
        if (resolved === "bottom") assert.ok(b.y >= a.y + a.height + 7);
        endpoints.push({ side, align, direction, anchor: a, rect: b });
        await page.keyboard.press("Escape");
        await closed();
      }
    }
  }
  for (let i = 0; i < 6 && (await root.getAttribute("data-lenso-side")) !== "top"; i++)
    await direct("side");
  await trigger.evaluate((n) => {
    n.style.left = "4px";
    n.style.top = "4px";
  });
  await trigger.click();
  await opened();
  assert.equal(await popup.getAttribute("data-side"), "bottom", "the top edge flips the menu");
  const collision = await root.boundingBox();
  assert.ok(collision.x >= 7 && collision.y >= 7);
  await page.keyboard.press("Escape");
  await closed();
  await trigger.evaluate((n) => {
    n.style.left = "520px";
    n.style.top = "560px";
  });
  await trigger.click();
  await opened();
  const beforeMove = await root.boundingBox();
  await trigger.evaluate((n) => (n.style.left = "700px"));
  await page.waitForFunction(
    (before) => document.getElementById("document-menu").getBoundingClientRect().x > before + 150,
    beforeMove.x,
  );
  await direct("tracking");
  await opened();
  const frozen = await root.boundingBox();
  await trigger.evaluate((n) => (n.style.left = "520px"));
  await page.waitForTimeout(120);
  assert.ok(
    Math.abs((await root.boundingBox()).x - frozen.x) < 1,
    "tracking opt-out freezes position",
  );
  await direct("tracking");
  await page.waitForFunction(
    (before) => document.getElementById("document-menu").getBoundingClientRect().x < before - 150,
    frozen.x,
  );
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(
    await firstHandle.evaluate((n) => n === document.getElementById("menu-share")),
    true,
  );
  assert.equal(await handle.evaluate((n) => n === document.getElementById("document-menu")), true);
  await trigger.click();
  await opened();
  const lens = popup.locator('[data-slot="menu-lens"]');
  assert.equal(
    await lens.evaluate((n) =>
      getComputedStyle(n).getPropertyValue("--apple-material-profile").trim(),
    ),
    "medium",
  );
  assert.ok((await lens.evaluate((n) => n.childElementCount)) > 0);
  await trigger.evaluate((n) =>
    n.closest("[data-theme]").setAttribute("data-contrast", "increased"),
  );
  await page.waitForFunction(() =>
    document.getElementById("document-menu-popup").hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  assert.equal(await lens.evaluate((n) => n.childElementCount), 0);
  await trigger.evaluate((n) => n.closest("[data-theme]").removeAttribute("data-contrast"));
  await page.waitForFunction(
    () => document.querySelector('[data-slot="menu-lens"]').childElementCount > 0,
  );
  await direct("mounted");
  await page.waitForTimeout(200);
  assert.equal(await root.count(), 0);
  assert.equal(await handle.evaluate((n) => n.hasAttribute("data-lenso-positioned")), false);
  assert.equal(
    await handle.evaluate((n) => n.querySelector('[data-slot="menu-lens"]').childElementCount),
    0,
  );
  await direct("mounted");
  await closed();
  await trigger.evaluate(
    (n, style) => (style === null ? n.removeAttribute("style") : n.setAttribute("style", style)),
    oldStyle,
  );
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  await page.evaluate(async () => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    for (const id of ["menu-open", "document-menu"]) {
      const node = document.getElementById(id);
      createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
    }
  });
  assert.equal(await isOpen(), true);
  await focused(first);
  await page.keyboard.press("Escape");
  await closed();
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await opened();
      for (const box of [await root.boundingBox(), await popup.boundingBox()]) {
        assert.ok(
          box.x >= 7 && box.x + box.width <= width - 7,
          `${engine}: menu positioner and popup stay inside the ${width}px viewport`,
        );
      }
      await page.screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-menu-${appearance}-${width}.png`,
        ),
      });
      await page.keyboard.press("Escape");
      await closed();
    }
  }
  await page.setViewportSize(viewport);
  await handle.dispose();
  await firstHandle.dispose();
  await Bun.write(
    path.join(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ??
        path.resolve(import.meta.dirname, "../.cache/example"),
      `${engine}-menu-geometry.json`,
    ),
    JSON.stringify({ endpoints, collision, tracking: "passed" }, null, 2) + "\n",
  );
  return { endpoints: endpoints.length };
}
export async function checkMenuTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("document-menu")?.hasAttribute("data-lenso-ready"),
  );
  await page.getByTestId("menu-open").tap();
  await page.waitForFunction(() =>
    document.getElementById("document-menu").matches(":popover-open"),
  );
  await page.getByTestId("menu-duplicate").tap();
  await page.waitForFunction(
    () => !document.getElementById("document-menu").matches(":popover-open"),
  );
  assert.equal(await page.getByTestId("menu-count").textContent(), "Actions: 1");
  return { nativeTap: "passed" };
}

/** Exercise side placement where narrow available space previously left RTL content outside its positioner. */
export async function checkMenuNarrow(page, engine) {
  const trigger = page.getByTestId("menu-open");
  const root = page.getByTestId("document-menu");
  const popup = page.getByTestId("document-menu-popup");
  await page.waitForFunction(() =>
    document.getElementById("document-menu")?.hasAttribute("data-lenso-ready"),
  );
  const viewport = page.viewportSize();
  const cases = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const direction of ["ltr", "rtl"]) {
      if ((await root.getAttribute("data-lenso-direction")) !== direction)
        await page.getByTestId("menu-direction").evaluate((n) => n.click());
      for (let i = 0; i < 6 && (await root.getAttribute("data-lenso-side")) !== "inline-end"; i++)
        await page.getByTestId("menu-side").evaluate((n) => n.click());
      await trigger.scrollIntoViewIfNeeded();
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await page.waitForFunction(() => {
        const n = document.getElementById("document-menu"),
          p = document.getElementById("document-menu-popup");
        return (
          n.matches(":popover-open") &&
          !n.hasAttribute("data-lenso-position-pending") &&
          n.hasAttribute("data-lenso-positioned") &&
          !p.hasAttribute("data-starting-style") &&
          Math.abs(p.getBoundingClientRect().width - p.offsetWidth) < 0.5
        );
      });
      const positioner = await root.boundingBox(),
        panel = await popup.boundingBox();
      for (const rect of [positioner, panel])
        assert.ok(
          rect.x >= 7 && rect.x + rect.width <= width - 7,
          `${direction} ${width}px: menu stays within the viewport`,
        );
      assert.ok(
        Math.abs(positioner.x - panel.x) < 1 && Math.abs(positioner.width - panel.width) < 1,
        "the panel and positioner use the same bounds",
      );
      cases.push({ width, direction, positioner, panel });
      await page.screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-menu-narrow-${direction}-${width}.png`,
        ),
      });
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () =>
          !document.getElementById("document-menu").matches(":popover-open") &&
          getComputedStyle(document.getElementById("document-menu")).display === "none",
      );
    }
  }
  await page.setViewportSize(viewport);
  await Bun.write(
    path.join(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ??
        path.resolve(import.meta.dirname, "../.cache/example"),
      `${engine}-menu-narrow-geometry.json`,
    ),
    JSON.stringify({ cases }, null, 2) + "\n",
  );
  return { cases: cases.length };
}
