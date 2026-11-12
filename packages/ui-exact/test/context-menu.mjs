import assert from "node:assert/strict";
const settle = (p) =>
  p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
export async function checkContextMenu(page) {
  const target = page.getByTestId("context-entry"),
    second = page.getByTestId("context-second"),
    menu = page.getByTestId("context-actions");
  const opened = () =>
    page.waitForFunction(() => {
      const r = document.getElementById("context-actions");
      return (
        r?.matches(":popover-open") &&
        r.hasAttribute("data-lenso-positioned") &&
        !r.querySelector('[data-slot="menu-popup"]')?.hasAttribute("data-starting-style")
      );
    });
  const closed = () =>
    page.waitForFunction(
      () => !document.getElementById("context-actions")?.matches(":popover-open"),
    );
  const focus = async (id) => page.waitForFunction((id) => document.activeElement?.id === id, id);
  const right = async (node) => {
    await node.click({ button: "right", position: { x: 20, y: 20 } });
    await opened();
  };
  assert.equal(await target.getAttribute("aria-haspopup"), "menu");
  await target.click();
  assert.equal(await menu.evaluate((n) => n.matches(":popover-open")), false);
  await right(target);
  await focus("context-duplicate");
  assert.equal(await target.getAttribute("aria-expanded"), "true");
  assert.equal(await second.getAttribute("aria-expanded"), "false");
  assert.equal(await menu.evaluate((n) => n.style.getPropertyValue("--anchor-width")), "0px");
  await page.keyboard.press("ArrowDown");
  await focus("context-pin");
  await page.keyboard.press("Space");
  assert.equal(await page.getByTestId("context-pin").getAttribute("aria-checked"), "true");
  assert.equal(await menu.evaluate((n) => n.matches(":popover-open")), true);
  await page.getByTestId("context-more-trigger").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() =>
    document.getElementById("context-more")?.matches(":popover-open"),
  );
  assert.equal(await menu.evaluate((n) => n.matches(":popover-open")), true);
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.getElementById("context-more")?.matches(":popover-open"),
  );
  await focus("context-more-trigger");
  await page.keyboard.press("Home");
  await focus("context-duplicate");
  await page.keyboard.press("Enter");
  await closed();
  await focus("context-entry");
  assert.equal(await page.getByTestId("context-result").textContent(), "Entry duplicated");
  await target.focus();
  await page.keyboard.press("Shift+F10");
  await opened();
  await focus("context-duplicate");
  await page.keyboard.press("Escape");
  await closed();
  await focus("context-entry");
  await page.getByTestId("context-modal").click();
  await right(target);
  await right(second);
  assert.equal(await target.getAttribute("aria-expanded"), "false");
  assert.equal(await second.getAttribute("aria-expanded"), "true");
  await focus("context-duplicate");
  await page.getByTestId("context-second-visible").click();
  await closed();
  assert.equal(await second.count(), 0, "removing only the active trigger dismisses its popup");
  await page.getByTestId("context-second-visible").click();
  await page.getByTestId("context-disabled").click();
  assert.equal(await target.getAttribute("tabindex"), "-1");
  assert.equal(
    await target.evaluate((n) =>
      n.dispatchEvent(
        new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          clientX: 20,
          clientY: 20,
        }),
      ),
    ),
    true,
    "disabled custom trigger preserves the native context menu",
  );
  await page.getByTestId("context-disabled").click();
  await target.evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ContextMenu", bubbles: true, cancelable: true }),
    ),
  );
  await opened();
  await page.keyboard.press("Escape");
  await closed();
  // Give the enabled DOM target a missing native popup ID, exercising the public dangling-target boundary.
  const missing = await target.evaluate((n) => {
    const old = n.dataset.lensoFor;
    n.dataset.lensoFor = "missing-context-menu";
    const result = n.dispatchEvent(
      new MouseEvent("contextmenu", { bubbles: true, cancelable: true }),
    );
    n.dataset.lensoFor = old;
    return result;
  });
  assert.equal(missing, true);
  const touch = async (node, type, x, y, { multi = false, prevented = false } = {}) =>
    node.evaluate(
      (n, { type, x, y, multi, prevented }) => {
        const t = { identifier: 11, target: n, clientX: x, clientY: y },
          touches = type === "touchend" || type === "touchcancel" ? [] : [t];
        if (multi) touches.push({ ...t, identifier: 12 });
        const e = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(e, { touches: { value: touches }, changedTouches: { value: [t] } });
        if (prevented) e.preventDefault();
        return n.dispatchEvent(e);
      },
      { type, x, y, multi, prevented },
    );
  await target.scrollIntoViewIfNeeded();
  const b = await target.boundingBox(),
    x = b.x + 30,
    y = b.y + 30;
  await touch(target, "touchstart", x, y);
  await opened();
  assert.equal(await menu.evaluate((n) => n.style.getPropertyValue("--anchor-width")), "10px");
  await touch(target, "touchend", x, y);
  const suppressed = await target.evaluate((n) =>
    n.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })),
  );
  assert.equal(suppressed, false, "long press suppresses the release click on trigger content");
  await page.keyboard.press("Escape");
  await closed();
  for (const mode of ["move", "multi", "end", "cancel", "prevented"]) {
    await touch(target, "touchstart", x, y, { prevented: mode === "prevented" });
    if (mode === "move") await touch(target, "touchmove", x + 11, y);
    if (mode === "multi") await touch(target, "touchmove", x, y, { multi: true });
    if (mode === "end") await touch(target, "touchend", x, y);
    if (mode === "cancel") await touch(target, "touchcancel", x, y);
    await page.waitForTimeout(550);
    assert.equal(await menu.evaluate((n) => n.matches(":popover-open")), false, mode);
    await touch(target, "touchcancel", x, y);
  }
  await touch(second, "touchstart", x, y);
  const retired = await second.elementHandle();
  await page.getByTestId("context-second-visible").click();
  await page.waitForTimeout(550);
  assert.equal(
    await menu.evaluate((n) => n.matches(":popover-open")),
    false,
    "removal clears a pending long press",
  );
  // Reconnect a removed target without a hatch so isConnected cannot mask leaked listeners.
  const released = await retired.evaluate((n) => {
    n.removeAttribute("data-hatch");
    document.body.append(n);
    const result = n.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
      }),
    );
    n.remove();
    return result;
  });
  assert.equal(released, true);
  await retired.dispose();
  await page.getByTestId("context-second-visible").click();
  await right(target);
  await page.getByTestId("context-mounted").click();
  await closed();
  assert.equal(await target.count(), 0);
  await page.getByTestId("context-mounted").click();
  await right(target);
  await page.keyboard.press("Escape");
  await closed();
  await settle(page);
  return {
    nativeRightClick: true,
    nativeKeyboard: true,
    syntheticLongPress: true,
    retarget: true,
    disabledFallback: true,
    cleanup: true,
    preview: false,
    compactBar: false,
  };
}
