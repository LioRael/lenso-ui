import assert from "node:assert/strict";
import path from "node:path";

export async function checkPopoverHover(page, engine, { capture = true } = {}) {
  const root = page.getByTestId("hover-contact"),
    popup = page.getByTestId("hover-contact-popup");
  const trigger = page.getByTestId("hover-trigger"),
    second = page.getByTestId("hover-second");
  const outside = page.getByTestId("hover-draft"),
    editor = page.getByTestId("hover-email");
  const direct = (name) => page.getByTestId(`hover-${name}`).evaluate((n) => n.click());
  const isOpen = () => root.evaluate((n) => n.matches(":popover-open"));
  const closed = () =>
    page.waitForFunction(() => {
      const node = document.getElementById("hover-contact");
      return node && !node.matches(":popover-open") && getComputedStyle(node).display === "none";
    });
  const opened = async (settle = true) => {
    await page.waitForFunction(() => {
      const node = document.getElementById("hover-contact");
      return (
        node?.matches(":popover-open") &&
        node.hasAttribute("data-lenso-positioned") &&
        !node.hasAttribute("data-lenso-position-pending")
      );
    });
    if (settle)
      await page.waitForFunction(() => {
        const p = document.getElementById("hover-contact-popup");
        return (
          !p.hasAttribute("data-starting-style") &&
          Math.abs(p.getBoundingClientRect().width - p.offsetWidth) < 0.5
        );
      });
  };
  const focused = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction((node) => node === document.activeElement, handle);
    } finally {
      await handle.dispose();
    }
  };
  const far = () => page.mouse.move(page.viewportSize().width - 2, 4);
  const hover = async (node = trigger, settle = true) => {
    await node.hover();
    await opened(settle);
  };
  const leave = async () => {
    await far();
    await closed();
  };
  await page.waitForFunction(() =>
    document.getElementById("hover-contact")?.hasAttribute("data-lenso-ready"),
  );
  await trigger.scrollIntoViewIfNeeded();
  await outside.focus();
  await outside.evaluate((n) => n.setSelectionRange(2, 9));
  await page.evaluate(() => {
    window.__hoverTrace = [];
    const root = document.getElementById("hover-contact");
    root.addEventListener("beforetoggle", (event) => {
      if (event.target === root)
        window.__hoverTrace.push({
          t: performance.now(),
          state: event.newState,
          reason: root.dataset.lensoOpenReason,
        });
    });
  });
  const start = await page.evaluate(() => performance.now());
  await trigger.hover();
  await page.waitForTimeout(80);
  assert.equal(await isOpen(), false, "hover opening waits for rest");
  await opened();
  const firstOpen = await page.evaluate(() =>
    window.__hoverTrace.find((event) => event.state === "open"),
  );
  assert.ok(firstOpen.t - start >= 280);
  assert.equal(firstOpen.reason, "hover");
  await focused(outside);
  assert.deepEqual(await outside.evaluate((n) => [n.selectionStart, n.selectionEnd]), [2, 9]);
  const initialRoot = await root.elementHandle(),
    originalEditor = await editor.elementHandle();
  const r = await root.boundingBox();
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2, { steps: 8 });
  assert.equal(await isOpen(), true);
  await focused(outside);
  await leave();
  await focused(outside);

  await page.evaluate(() => {
    window.__hoverMoveLeases = new Set();
    const add = document.addEventListener.bind(document),
      remove = document.removeEventListener.bind(document);
    document.addEventListener = (type, listener, options) => {
      if (type === "pointermove") window.__hoverMoveLeases.add(listener);
      return add(type, listener, options);
    };
    document.removeEventListener = (type, listener, options) => {
      if (type === "pointermove") window.__hoverMoveLeases.delete(listener);
      return remove(type, listener, options);
    };
  });
  const leaseBaseline = await page.evaluate(() => window.__hoverMoveLeases.size);
  // Continuous motion postpones rest; small native pointer jitter does not.
  await trigger.hover();
  const box = await trigger.boundingBox();
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(50);
    await page.mouse.move(box.x + box.width / 2 + (i % 2 ? 4 : -4), box.y + box.height / 2);
    assert.equal(await isOpen(), false);
  }
  await opened();
  await leave();
  await trigger.hover();
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(80);
    await page.mouse.move(box.x + box.width / 2 + (i % 2 ? 0 : 1), box.y + box.height / 2);
  }
  assert.equal(await isOpen(), true, "small pointer jitter must not postpone hover forever");
  await leave();

  await trigger.hover();
  await page.waitForTimeout(50);
  await far();
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false, "a short visit must not open later");
  await trigger.hover();
  await page.waitForTimeout(50);
  await direct("disabled");
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false);
  assert.equal(await trigger.isDisabled(), true);
  await direct("disabled");
  await far();
  await trigger.hover();
  await page.waitForTimeout(50);
  await direct("enabled");
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false);
  await trigger.click();
  await opened();
  await focused(editor);
  await far();
  assert.equal(await isOpen(), true, "press opening is independent of hover");
  await page.keyboard.press("Escape");
  await closed();
  await direct("enabled");
  await far();

  await hover(trigger, false);
  await trigger.click();
  await opened();
  await focused(editor);
  assert.equal(await root.getAttribute("data-lenso-open-reason"), "press");
  await page.getByTestId("hover-child-trigger").focus();
  for (const modifier of ["altKey", "ctrlKey", "metaKey"]) {
    const prevented = await page.getByTestId("hover-child-trigger").evaluate((node, modifier) => {
      const event = new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
        [modifier]: true,
      });
      node.dispatchEvent(event);
      return event.defaultPrevented;
    }, modifier);
    assert.equal(prevented, false, `${modifier}+Tab remains a browser shortcut`);
    assert.equal(await isOpen(), true);
  }
  await editor.focus();
  await editor.fill("review@example.com");
  await far();
  await page.waitForTimeout(100);
  assert.equal(await isOpen(), true);
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await outside.focus();
  await far();
  await hover();
  await page.waitForTimeout(520);
  await trigger.click();
  await closed();
  await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2);
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false, "a patient dismissal stays closed until re-entry");
  await far();
  await outside.focus();
  await hover();
  await page.keyboard.press("Escape");
  await closed();
  await focused(outside);
  await page.mouse.move(box.x + box.width / 2 + 4, box.y + box.height / 2);
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false, "Escape must not reopen from movement within the trigger");
  await far();

  await direct("open-delay");
  assert.equal(await trigger.getAttribute("data-lenso-hover-delay"), "80");
  await outside.focus();
  await hover();
  await leave();
  await direct("open-delay");
  assert.equal(await trigger.getAttribute("data-lenso-hover-delay"), "0");
  await trigger.hover();
  assert.equal(await isOpen(), true, "zero delay opens on pointer entry");
  await opened();
  await leave();
  await direct("open-delay");
  const viewport = page.viewportSize(),
    theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  await page.setViewportSize({ width: 1200, height: 1000 });
  const originalStyle = await trigger.getAttribute("style"),
    secondStyle = await second.getAttribute("style");
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:520px;top:400px;z-index:100"),
  );
  await second.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:800px;top:400px;z-index:100"),
  );
  const routes = [];
  for (const direction of ["ltr", "rtl"]) {
    if (direction === "rtl") await direct("direction");
    for (const side of ["bottom", "right", "top", "left"]) {
      for (let i = 0; i < 4 && (await root.getAttribute("data-lenso-side")) !== side; i++)
        await direct("side");
      await outside.focus();
      await far();
      await hover();
      assert.equal(await popup.getAttribute("data-side"), side);
      const a = await trigger.boundingBox(),
        b = await root.boundingBox();
      const center = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
      const gap =
        side === "bottom"
          ? { x: center.x, y: (a.y + a.height + b.y) / 2 }
          : side === "top"
            ? { x: center.x, y: (b.y + b.height + a.y) / 2 }
            : side === "right"
              ? { x: (a.x + a.width + b.x) / 2, y: center.y }
              : { x: (b.x + b.width + a.x) / 2, y: center.y };
      await page.mouse.move(gap.x, gap.y, { steps: 4 });
      await page.waitForTimeout(90);
      assert.equal(await isOpen(), true, `${side} gap holds without a close delay`);
      const target = { x: b.x + b.width * (side === "left" ? 0.7 : 0.35), y: b.y + b.height * 0.5 };
      await page.mouse.move(target.x, target.y, { steps: 8 });
      assert.equal(await isOpen(), true);
      await focused(outside);
      await page.mouse.move(gap.x, gap.y, { steps: 8 });
      await page.waitForTimeout(90);
      assert.equal(await isOpen(), true, "the return gap remains traversable");
      await page.mouse.move(center.x, center.y, { steps: 4 });
      assert.equal(await isOpen(), true);
      const diagonalTarget =
        side === "bottom"
          ? { x: b.x + b.width - 24, y: b.y + 12 }
          : side === "top"
            ? { x: b.x + b.width - 24, y: b.y + b.height - 12 }
            : side === "right"
              ? { x: b.x + 12, y: b.y + b.height - 24 }
              : { x: b.x + b.width - 12, y: b.y + b.height - 24 };
      const vertical = side === "bottom" || side === "top";
      const fraction = vertical
        ? (gap.y - center.y) / (diagonalTarget.y - center.y)
        : (gap.x - center.x) / (diagonalTarget.x - center.x);
      const diagonalGap = {
        x: center.x + fraction * (diagonalTarget.x - center.x),
        y: center.y + fraction * (diagonalTarget.y - center.y),
      };
      assert.equal(
        vertical
          ? diagonalGap.x < a.x || diagonalGap.x > a.x + a.width
          : diagonalGap.y < a.y || diagonalGap.y > a.y + a.height,
        true,
        "the diagonal route crosses outside the shared rectangular corridor",
      );
      await page.mouse.move(diagonalTarget.x, diagonalTarget.y, { steps: 16 });
      assert.equal(await isOpen(), true, `${side} diagonal route reaches the popup`);
      assert.equal(
        await originalEditor.evaluate((n) => n === document.getElementById("hover-email")),
        true,
      );
      assert.equal(await editor.inputValue(), "review@example.com");
      routes.push({ side, direction, anchor: a, popup: b, gap, diagonalGap, diagonalTarget });
      await leave();
    }
  }
  await direct("direction");
  for (let i = 0; i < 4 && (await root.getAttribute("data-lenso-side")) !== "bottom"; i++)
    await direct("side");
  await outside.focus();
  await hover();
  const opensBefore = await page.evaluate(
    () => window.__hoverTrace.filter((event) => event.state === "open").length,
  );
  await second.hover();
  await opened();
  await page.waitForFunction(() => {
    const root = document.getElementById("hover-contact"),
      second = document.getElementById("hover-second");
    const a = second.getBoundingClientRect(),
      r = root.getBoundingClientRect();
    return Math.abs(a.x + a.width / 2 - r.x - r.width / 2) < 1;
  });
  assert.equal(
    await page.evaluate(() => window.__hoverTrace.filter((event) => event.state === "open").length),
    opensBefore,
  );
  assert.equal(
    await initialRoot.evaluate((n) => n === document.getElementById("hover-contact")),
    true,
  );
  await focused(outside);
  assert.equal(await trigger.getAttribute("aria-expanded"), "false");
  assert.equal(await second.getAttribute("aria-expanded"), "true");
  await direct("trigger-mounted");
  await page.waitForTimeout(100);
  assert.equal(
    await isOpen(),
    true,
    "removing an inactive invoker preserves the current hover popup",
  );
  await direct("trigger-mounted");
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:520px;top:400px;z-index:100"),
  );
  await trigger.hover();
  await opened(false);
  await second.hover();
  await opened(false);
  await second.click();
  await focused(editor);
  await far();
  assert.equal(await isOpen(), true);
  await page.keyboard.press("Escape");
  await closed();
  await focused(second);

  await direct("close-delay");
  await outside.focus();
  await far();
  await hover();
  await far();
  await page.waitForTimeout(60);
  assert.equal(await isOpen(), true);
  await trigger.hover();
  await page.waitForTimeout(180);
  assert.equal(await isOpen(), true, "re-entry cancels delayed close");
  await far();
  await closed();
  await direct("close-delay");
  await outside.focus();
  await hover();
  await page.getByTestId("hover-child-trigger").click();
  await page.waitForFunction(() =>
    document.getElementById("hover-details").matches(":popover-open"),
  );
  await focused(page.getByTestId("hover-child-close"));
  await far();
  await page.waitForTimeout(100);
  assert.equal(await isOpen(), true, "an open child protects its hover parent");
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(
    await page.getByTestId("hover-details").evaluate((n) => n.matches(":popover-open")),
    false,
  );

  await outside.focus();
  await far();
  await hover();
  await page.evaluate(async () => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    for (const id of ["hover-trigger", "hover-contact"]) {
      const node = document.getElementById(id);
      createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
    }
  });
  await focused(outside);
  assert.equal(await isOpen(), true, "reapplying hatches retains the native hover session");
  assert.equal(await root.getAttribute("data-lenso-open-reason"), "hover");
  await leave();
  await hover(trigger, false);
  await trigger.click();
  await focused(editor);
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await far();
  await trigger.hover();
  await page.waitForTimeout(50);
  await direct("mounted");
  await page.waitForTimeout(350);
  assert.equal(await root.count(), 0);
  await direct("mounted");
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false);
  await far();
  await trigger.hover();
  await page.waitForTimeout(50);
  await direct("trigger-mounted");
  await page.waitForTimeout(350);
  assert.equal(await isOpen(), false);
  await direct("trigger-mounted");
  await far();
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:520px;top:400px;z-index:100"),
  );
  await outside.focus();
  await hover();
  const old = await root.elementHandle(),
    a = await trigger.boundingBox(),
    b = await root.boundingBox();
  await page.mouse.move(a.x + a.width / 2, (a.y + a.height + b.y) / 2, { steps: 4 });
  assert.ok((await page.evaluate(() => window.__hoverMoveLeases.size)) > leaseBaseline);
  await direct("mounted");
  await page.waitForTimeout(80);
  assert.equal(await page.evaluate(() => window.__hoverMoveLeases.size), leaseBaseline);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-open-reason")), false);
  await direct("mounted");
  await far();
  await trigger.evaluate(
    (n, v) => (v === null ? n.removeAttribute("style") : n.setAttribute("style", v)),
    originalStyle,
  );
  await second.evaluate(
    (n, v) => (v === null ? n.removeAttribute("style") : n.setAttribute("style", v)),
    secondStyle,
  );
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      await outside.focus();
      await far();
      await hover();
      await focused(outside);
      if (capture)
        await page.screenshot({
          path: path.join(
            process.env.LENSO_EXACT_TEST_ARTIFACTS ??
              path.resolve(import.meta.dirname, "../.cache/example"),
            `${engine}-popover-hover-${appearance}-${width}.png`,
          ),
        });
      await leave();
    }
  }
  const trace = await page.evaluate(() => window.__hoverTrace);
  await page.setViewportSize(viewport);
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await originalEditor.dispose();
  await initialRoot.dispose();
  await old.dispose();
  await Bun.write(
    path.join(
      process.env.LENSO_EXACT_TEST_ARTIFACTS ??
        path.resolve(import.meta.dirname, "../.cache/example"),
      `${engine}-popover-hover-trace.json`,
    ),
    JSON.stringify({ routes, trace, leaseBaseline }, null, 2) + "\n",
  );
  return { routes: routes.length, transitions: trace.length };
}

export async function checkPopoverTouch(page, engine) {
  const trigger = page.getByTestId("hover-trigger"),
    root = page.getByTestId("hover-contact");
  await page.waitForFunction(() =>
    document.getElementById("hover-trigger")?.hasAttribute("data-lenso-ready"),
  );
  await trigger.tap();
  await page.waitForFunction(
    () =>
      document.getElementById("hover-contact").matches(":popover-open") &&
      document.activeElement.id === "hover-contact-popup",
  );
  assert.equal(await root.getAttribute("data-lenso-open-reason"), "press");
  const before = await root.boundingBox();
  await page.getByTestId("hover-second").hover();
  const after = await root.boundingBox();
  assert.ok(
    Math.abs(before.x - after.x) < 0.5 && Math.abs(before.y - after.y) < 0.5,
    "a touch-pressed popup does not retarget on hover",
  );
  await page.getByTestId("hover-close").tap();
  await page.waitForFunction(
    () => !document.getElementById("hover-contact").matches(":popover-open"),
  );
  await page.waitForTimeout(350);
  assert.equal(await root.evaluate((n) => n.matches(":popover-open")), false);
  return { engine, touchInitialFocus: "popup", compatibilityHover: "absent" };
}
