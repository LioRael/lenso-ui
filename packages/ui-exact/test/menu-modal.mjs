import assert from "node:assert/strict";
import path from "node:path";
export async function checkMenuModal(page, engine) {
  const root = page.getByTestId("modal-actions"),
    trigger = page.getByTestId("menu-modal-open"),
    outside = page.getByTestId("menu-modal-background");
  const opened = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("modal-actions");
      return (
        n?.matches(":popover-open") &&
        n.hasAttribute("data-lenso-positioned") &&
        !n.hasAttribute("data-lenso-position-pending")
      );
    });
  const closed = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("modal-actions");
      return (
        n &&
        !n.matches(":popover-open") &&
        getComputedStyle(n).display === "none" &&
        document.documentElement.style.overflow === "auto"
      );
    });
  const direct = (name) => page.getByTestId(`menu-modal-${name}`).evaluate((n) => n.click());
  const overflow = () =>
    page.evaluate(() => document.documentElement.style.getPropertyValue("overflow"));
  await page.waitForFunction(() =>
    document.getElementById("modal-actions")?.hasAttribute("data-lenso-ready"),
  );
  const outsideStyle = await outside.getAttribute("style");
  await outside.evaluate((n) => {
    n.style.position = "fixed";
    n.style.top = "4px";
    n.style.right = "4px";
  });
  const original = await page.evaluate(() => {
    const s = document.documentElement.style;
    const before = {
      value: s.getPropertyValue("overflow"),
      priority: s.getPropertyPriority("overflow"),
    };
    s.setProperty("overflow", "auto", "important");
    return before;
  });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await opened();
  assert.equal(await overflow(), "hidden");
  assert.equal(await root.getAttribute("aria-modal"), null);
  const backdrop = root.locator(':scope > [data-slot="menu-backdrop"]');
  assert.equal(await backdrop.evaluate((n) => getComputedStyle(n).display), "block");
  assert.ok(await backdrop.evaluate((n) => getComputedStyle(n).clipPath.startsWith("polygon(")));
  const y = await page.evaluate(() => scrollY);
  await page.mouse.move(2, 4);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => scrollY), y, "mouse opening locks page scrolling");
  const point = await outside.boundingBox();
  await page.mouse.click(point.x + point.width / 2, point.y + point.height / 2);
  await closed();
  assert.equal(
    await page.getByTestId("menu-modal-background-count").textContent(),
    "Background actions: 0",
  );
  assert.equal(
    await page.getByTestId("menu-modal-selected-count").textContent(),
    "Selected actions: 0",
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.style.getPropertyPriority("overflow")),
    "important",
  );
  await trigger.click();
  await opened();
  const clipBefore = await root.evaluate((n) =>
    n.style.getPropertyValue("--lenso-exact-menu-backdrop-clip"),
  );
  await trigger.evaluate((n) => (n.style.transform = "translateX(20px)"));
  await page.waitForFunction(
    (before) =>
      document
        .getElementById("modal-actions")
        .style.getPropertyValue("--lenso-exact-menu-backdrop-clip") !== before,
    clipBefore,
  );
  await trigger.click();
  await closed();
  await trigger.evaluate((n) => n.style.removeProperty("transform"));
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  assert.equal(await overflow(), "hidden");
  await page.keyboard.press("Tab");
  await closed();
  const outsideHandle = await outside.elementHandle();
  await page.waitForFunction((n) => document.activeElement === n, outsideHandle);
  await outsideHandle.dispose();
  await trigger.click();
  await opened();
  await direct("mode");
  await page.waitForFunction(
    () => !document.getElementById("modal-actions").hasAttribute("data-lenso-menu-modal-active"),
  );
  assert.equal(await overflow(), "auto");
  assert.equal(await backdrop.evaluate((n) => getComputedStyle(n).display), "none");
  await outside.click();
  await closed();
  assert.equal(
    await page.getByTestId("menu-modal-background-count").textContent(),
    "Background actions: 1",
  );
  await direct("mode");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await opened();
  await page.getByTestId("menu-modal-export").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() =>
    document.getElementById("modal-actions-child").matches(":popover-open"),
  );
  assert.equal(await overflow(), "hidden");
  await page.getByTestId("menu-modal-pdf").click();
  await closed();
  assert.equal(
    await page.getByTestId("menu-modal-selected-count").textContent(),
    "Selected actions: 1",
  );
  await trigger.click();
  await opened();
  await page.getByTestId("settings-modal").evaluate((n) => n.showModal());
  await page.waitForFunction(
    () =>
      document.getElementById("settings-modal").open &&
      !document.getElementById("modal-actions").matches(":popover-open"),
  );
  await page.waitForTimeout(220);
  assert.equal(await root.getAttribute("data-lenso-menu-modal-active"), null);
  assert.equal(await overflow(), "hidden", "closing a menu does not release a dialog's lock");
  await page.getByTestId("settings-modal").evaluate((n) => n.close());
  await page.waitForFunction(() => document.documentElement.style.overflow === "auto");
  await trigger.click();
  await opened();
  const old = await root.elementHandle();
  await direct("mounted");
  await page.waitForFunction(
    () =>
      !document.getElementById("modal-actions") &&
      document.documentElement.style.overflow === "auto",
  );
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-menu-modal-active")), false);
  assert.equal(
    await old.evaluate((n) => n.style.getPropertyValue("--lenso-exact-menu-backdrop-clip")),
    "",
  );
  await old.dispose();
  await direct("mounted");
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await opened();
    await page.waitForFunction(() => {
      const root = document.getElementById("modal-actions");
      const popup = root.querySelector('[data-slot="menu-popup"]');
      const content = root.querySelector('[data-slot="menu-content"]');
      return (
        !popup.hasAttribute("data-starting-style") &&
        Math.abs(popup.getBoundingClientRect().width - popup.offsetWidth) < 0.5 &&
        getComputedStyle(content).opacity === "1"
      );
    });
    await page.screenshot({
      path: path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS ??
          path.resolve(import.meta.dirname, "../.cache/example"),
        `${engine}-menu-modal-${width}.png`,
      ),
    });
    await page.keyboard.press("Escape");
    await closed();
  }
  await page.evaluate((before) => {
    const s = document.documentElement.style;
    if (before.value) s.setProperty("overflow", before.value, before.priority);
    else s.removeProperty("overflow");
  }, original);
  await outside.evaluate(
    (n, original) =>
      original === null ? n.removeAttribute("style") : n.setAttribute("style", original),
    outsideStyle,
  );
  return { pointerIsolation: true, triggerCutout: true, dialogLockOwnership: true, tabExit: true };
}
export async function checkMenuModalTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("modal-actions")?.hasAttribute("data-lenso-ready"),
  );
  const trigger = page.getByTestId("menu-modal-open");
  await trigger.tap();
  await page.waitForFunction(
    () =>
      document.getElementById("modal-actions").matches(":popover-open") &&
      document.getElementById("modal-actions").hasAttribute("data-lenso-positioned"),
  );
  await page.waitForTimeout(100);
  assert.notEqual(
    await page.evaluate(() => document.documentElement.style.overflow),
    "hidden",
    "touch with side gutters keeps page scroll available",
  );
  await page.getByTestId("menu-modal-save").tap();
  await page.waitForFunction(
    () => !document.getElementById("modal-actions").matches(":popover-open"),
  );
  await page.getByTestId("modal-actions").evaluate((n) => {
    n.style.width = "calc(100vw - 16px)";
    n.querySelector('[data-slot="menu-popup"]').style.minWidth = "calc(100vw - 16px)";
  });
  await trigger.tap();
  await page.waitForFunction(
    () =>
      document.getElementById("modal-actions").matches(":popover-open") &&
      document.documentElement.style.overflow === "hidden",
  );
  await page.getByTestId("menu-modal-save").tap();
  await page.waitForFunction(
    () =>
      !document.getElementById("modal-actions").matches(":popover-open") &&
      document.documentElement.style.overflow !== "hidden",
  );
  assert.equal(
    await page.getByTestId("menu-modal-selected-count").textContent(),
    "Selected actions: 2",
  );
  return {
    narrowTouch: "unlocked",
    fullWidthTouch: "locked",
    fixture: "native DOM width override",
  };
}
