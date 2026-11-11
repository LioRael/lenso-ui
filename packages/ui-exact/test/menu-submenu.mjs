import assert from "node:assert/strict";
import path from "node:path";
export async function checkMenuSubmenus(page, engine) {
  const parent = page.getByTestId("submenu-document"),
    child = page.getByTestId("submenu-format"),
    grand = page.getByTestId("submenu-layout");
  const trigger = page.getByTestId("submenu-open"),
    format = page.getByTestId("submenu-format-trigger"),
    layout = page.getByTestId("submenu-layout-trigger"),
    next = page.getByTestId("submenu-next");
  const direct = (name) => page.getByTestId(`submenu-${name}`).evaluate((n) => n.click());
  const opened = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction((n) => {
        const p = n.querySelector(':scope > [data-slot="menu-popup"]');
        return (
          n.matches(":popover-open") &&
          n.hasAttribute("data-lenso-positioned") &&
          !n.hasAttribute("data-lenso-position-pending") &&
          !p.hasAttribute("data-starting-style") &&
          Math.abs(p.getBoundingClientRect().width - p.offsetWidth) < 0.5
        );
      }, handle);
    } finally {
      await handle.dispose();
    }
  };
  const closed = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction(
        (n) => !n.matches(":popover-open") && getComputedStyle(n).display === "none",
        handle,
      );
    } finally {
      await handle.dispose();
    }
  };
  const focused = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction((n) => document.activeElement === n, handle);
    } finally {
      await handle.dispose();
    }
  };
  const isOpen = (locator) => locator.evaluate((n) => n.matches(":popover-open"));
  const parentContent = parent.locator(
    ':scope > [data-slot="menu-popup"] > [data-slot="menu-content"]',
  );
  const setMode = async (mode) => {
    for (let i = 0; i < 3 && (await child.getAttribute("data-lenso-presentation")) !== mode; i++)
      await direct("presentation");
  };
  const openRoot = async () => {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await opened(parent);
    await focused(format);
  };
  const closeRoot = async () => {
    await parent.evaluate((n) => n.hidePopover());
    await closed(parent);
  };
  await page.waitForFunction(() =>
    document.getElementById("submenu-format")?.hasAttribute("data-lenso-ready"),
  );
  const viewport = page.viewportSize(),
    cases = [];
  const initialChild = await child.elementHandle();
  for (const width of [390, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ["auto", "cascade", "stacked"]) {
      await setMode(mode);
      for (const direction of ["ltr", "rtl"]) {
        if ((await parent.getAttribute("data-lenso-direction")) !== direction)
          await direct("direction");
        const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight",
          back = direction === "rtl" ? "ArrowRight" : "ArrowLeft",
          stacked = mode === "stacked" || (mode === "auto" && width < 768);
        await openRoot();
        await page.keyboard.press(forward);
        await opened(child);
        assert.equal(
          await child.getAttribute("data-lenso-resolved-presentation"),
          stacked ? "stacked" : "cascade",
        );
        assert.equal(await format.getAttribute("aria-expanded"), "true");
        assert.equal(
          await parent
            .locator(':scope > [data-slot="menu-popup"]')
            .getAttribute("data-menu-child-count"),
          "1",
        );
        assert.equal(await parentContent.evaluate((n) => n.inert), stacked);
        assert.equal(
          await child.evaluate((n) => n.closest("[inert]") === null),
          true,
          "the top layer child remains interactive",
        );
        await focused(page.getByTestId(stacked ? "submenu-format-back" : "submenu-pdf"));
        const p = await parent.boundingBox(),
          c = await child.boundingBox();
        assert.ok(c.x >= 7 && c.x + c.width <= width - 7 && c.y >= 7 && c.y + c.height <= 893);
        if (stacked) {
          assert.equal(
            await parent.locator(':scope > [data-slot="menu-popup"]').getAttribute("aria-hidden"),
            "true",
          );
          assert.equal(await parentContent.evaluate((n) => n.style.scale), "0.96");
        }
        await page.keyboard.press(back);
        await closed(child);
        assert.equal(await isOpen(parent), true);
        await focused(format);
        assert.equal(await parentContent.evaluate((n) => n.inert), false);
        await page.keyboard.press(forward);
        await opened(child);
        await layout.focus();
        await page.keyboard.press(forward);
        await opened(grand);
        assert.equal(
          await child
            .locator(':scope > [data-slot="menu-popup"]')
            .getAttribute("data-menu-child-count"),
          "1",
        );
        await focused(page.getByTestId(stacked ? "submenu-layout-back" : "submenu-landscape"));
        await page.keyboard.press("Escape");
        await closed(grand);
        assert.equal(
          await child
            .locator(':scope > [data-slot="menu-popup"]')
            .getAttribute("data-menu-child-count"),
          null,
        );
        assert.equal(await isOpen(child), true);
        await focused(layout);
        await page.keyboard.press("Escape");
        await closed(child);
        assert.equal(await isOpen(parent), true);
        await focused(format);
        await page.keyboard.press("Escape");
        await closed(parent);
        await focused(trigger);
        cases.push({
          width,
          mode,
          direction,
          resolved: stacked ? "stacked" : "cascade",
          parent: p,
          child: c,
        });
      }
    }
    console.log(engine, width, "submenu keyboard modes passed");
  }
  await page.setViewportSize({ width: 1024, height: 900 });
  await setMode("cascade");
  if ((await parent.getAttribute("data-lenso-direction")) !== "ltr") await direct("direction");
  await openRoot();
  await page.keyboard.press("ArrowRight");
  await opened(child);
  await layout.focus();
  await page.keyboard.press("ArrowRight");
  await opened(grand);
  await page.getByTestId("submenu-landscape").click();
  await closed(parent);
  assert.equal(await isOpen(child), false);
  assert.equal(await isOpen(grand), false);
  assert.equal(await page.getByTestId("submenu-count").textContent(), "Exports: 1");
  assert.equal(await page.getByTestId("submenu-result").textContent(), "Landscape selected");
  await focused(trigger);
  await openRoot();
  await page.keyboard.press("ArrowRight");
  await opened(child);
  await page.keyboard.press("Tab");
  await closed(parent);
  await focused(next);
  await setMode("stacked");
  await openRoot();
  await page.keyboard.press("ArrowRight");
  await opened(child);
  await page.getByTestId("submenu-format-back").click();
  await closed(child);
  assert.equal(await isOpen(parent), true);
  await focused(format);
  await closeRoot();
  await setMode("auto");
  await openRoot();
  await page.keyboard.press("ArrowRight");
  await opened(child);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.waitForFunction(
    () => document.getElementById("submenu-format").dataset.lensoResolvedPresentation === "stacked",
  );
  await opened(child);
  assert.equal(await parentContent.evaluate((n) => n.inert), true);
  await page.getByTestId("submenu-format-back").focus();
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForFunction(
    () => document.getElementById("submenu-format").dataset.lensoResolvedPresentation === "cascade",
  );
  await opened(child);
  assert.equal(await parentContent.evaluate((n) => n.inert), false);
  await focused(page.getByTestId("submenu-pdf"));
  assert.equal(
    await initialChild.evaluate((n) => n === document.getElementById("submenu-format")),
    true,
  );
  await closeRoot();
  await setMode("cascade");
  await openRoot();
  await page.mouse.move(1022, 4);
  await page.evaluate(() => {
    window.__submenuTimes = [];
    const trigger = document.getElementById("submenu-format-trigger"),
      root = document.getElementById("submenu-format");
    trigger.addEventListener("pointerenter", () =>
      window.__submenuTimes.push({ kind: "enter", t: performance.now() }),
    );
    root.addEventListener("beforetoggle", (e) => {
      if (e.target === root && e.newState === "open")
        window.__submenuTimes.push({ kind: "open", t: performance.now() });
    });
  });
  await format.hover();
  await opened(child);
  await focused(format);
  const times = await page.evaluate(() => window.__submenuTimes);
  assert.ok(times.find((t) => t.kind === "open").t - times.find((t) => t.kind === "enter").t >= 90);
  await format.click();
  assert.equal(await isOpen(child), true, "mouse press preserves a hover-open submenu");
  const a = await format.boundingBox(),
    b = await child.boundingBox(),
    side = await child.locator(':scope > [data-slot="menu-popup"]').getAttribute("data-side");
  const gap = {
    x: side === "right" ? (a.x + a.width + b.x) / 2 : (b.x + b.width + a.x) / 2,
    y: a.y + a.height / 2,
  };
  await page.mouse.move(gap.x, gap.y, { steps: 4 });
  await page.waitForTimeout(90);
  assert.equal(await isOpen(child), true);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  assert.equal(await isOpen(child), true);
  await page.getByTestId("submenu-sharing-trigger").hover();
  await opened(page.getByTestId("submenu-sharing"));
  await closed(child);
  assert.equal(await isOpen(parent), true);
  await page.keyboard.press("Escape");
  await closed(page.getByTestId("submenu-sharing"));
  await closeRoot();
  await direct("disabled");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened(parent);
  await focused(page.getByTestId("submenu-sharing-trigger"));
  await format.evaluate((n) => n.click());
  await page.waitForTimeout(150);
  assert.equal(await isOpen(child), false);
  await direct("disabled");
  await closeRoot();
  await direct("delay");
  await openRoot();
  await page.mouse.move(1022, 4);
  await format.hover();
  await page.waitForTimeout(50);
  await direct("mounted");
  await page.waitForTimeout(550);
  assert.equal(await child.count(), 0);
  await direct("mounted");
  await page.mouse.move(1022, 4);
  await closed(child);
  await direct("delay");
  await closeRoot();
  for (const width of [390, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await setMode("auto");
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      await openRoot();
      await page.keyboard.press("ArrowRight");
      await opened(child);
      await page.screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-submenu-${appearance}-${width}.png`,
        ),
      });
      await closeRoot();
    }
  }
  await page.setViewportSize(viewport);
  await initialChild.dispose();
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-submenu-geometry.json`),
    JSON.stringify({ cases, times, gap }, null, 2) + "\n",
  );
  return { cases: cases.length };
}

export async function checkSubmenuTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("submenu-format")?.hasAttribute("data-lenso-ready"),
  );
  const parent = page.getByTestId("submenu-document"),
    child = page.getByTestId("submenu-format");
  await page.getByTestId("submenu-open").tap();
  await page.waitForFunction(() =>
    document.getElementById("submenu-document").matches(":popover-open"),
  );
  await page.getByTestId("submenu-format-trigger").tap();
  await page.waitForFunction(
    () =>
      document.getElementById("submenu-format").matches(":popover-open") &&
      document.getElementById("submenu-format").dataset.lensoResolvedPresentation === "stacked",
  );
  assert.equal(await child.evaluate((n) => n.closest("[inert]") === null), true);
  await page.getByTestId("submenu-format-back").tap();
  await page.waitForFunction(
    () => !document.getElementById("submenu-format").matches(":popover-open"),
  );
  assert.equal(await parent.evaluate((n) => n.matches(":popover-open")), true);
  await page.getByTestId("submenu-presentation").evaluate((n) => n.click());
  await page.getByTestId("submenu-format-trigger").tap();
  await page.waitForFunction(() =>
    document.getElementById("submenu-format").matches(":popover-open"),
  );
  await page.getByTestId("submenu-format-trigger").tap();
  await page.waitForFunction(
    () => !document.getElementById("submenu-format").matches(":popover-open"),
  );
  await page.waitForTimeout(150);
  assert.equal(
    await child.evaluate((n) => n.matches(":popover-open")),
    false,
    "deferred native commands do not reopen a toggled child",
  );
  assert.equal(
    await page.getByTestId("submenu-format-trigger").getAttribute("aria-expanded"),
    "false",
  );
  await page.getByTestId("submenu-presentation").evaluate((n) => n.click());
  await page.getByTestId("submenu-format-trigger").tap();
  await page.waitForFunction(() =>
    document.getElementById("submenu-format").matches(":popover-open"),
  );
  await page.getByTestId("submenu-layout-trigger").tap();
  await page.waitForFunction(() =>
    document.getElementById("submenu-layout").matches(":popover-open"),
  );
  await page.getByTestId("submenu-landscape").tap();
  await page.waitForFunction(
    () => !document.getElementById("submenu-document").matches(":popover-open"),
  );
  assert.equal(await page.getByTestId("submenu-count").textContent(), "Exports: 1");
  assert.equal(await page.getByTestId("submenu-result").textContent(), "Landscape selected");
  return { presentation: "stacked", levels: 3, nativeAction: "passed" };
}
