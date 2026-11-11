import assert from "node:assert/strict";
import path from "node:path";

export async function checkTooltip(page, engine) {
  const trigger = page.getByTestId("tooltip-save-trigger"),
    other = page.getByTestId("tooltip-other-trigger"),
    share = page.getByTestId("tooltip-share-trigger");
  const root = page.getByTestId("tooltip-save"),
    popup = page.getByTestId("tooltip-save-popup");
  const next = page.getByTestId("tooltip-next");
  const direct = (name) => page.getByTestId(`tooltip-${name}`).evaluate((n) => n.click());
  const isOpen = () => root.evaluate((n) => n.matches(":popover-open"));
  const opened = async () => {
    await page.waitForFunction(() => {
      const n = document.getElementById("tooltip-save"),
        p = document.getElementById("tooltip-save-popup");
      return (
        n?.matches(":popover-open") &&
        n.hasAttribute("data-lenso-positioned") &&
        !n.hasAttribute("data-lenso-position-pending") &&
        !p.hasAttribute("data-starting-style") &&
        Math.abs(p.offsetWidth - p.getBoundingClientRect().width) < 0.5
      );
    });
  };
  const closed = () =>
    page.waitForFunction(() => {
      const n = document.getElementById("tooltip-save");
      return n && !n.matches(":popover-open") && getComputedStyle(n).display === "none";
    });
  const focused = async (locator) => {
    const handle = await locator.elementHandle();
    try {
      await page.waitForFunction((n) => document.activeElement === n, handle);
    } finally {
      await handle.dispose();
    }
  };
  const keyboardFocus = async (locator) => {
    await page.keyboard.press("Tab");
    await locator.focus();
  };
  const far = () => page.mouse.move(page.viewportSize().width - 2, 4);
  await page.waitForFunction(() =>
    document.getElementById("tooltip-save")?.hasAttribute("data-lenso-ready"),
  );
  await trigger.scrollIntoViewIfNeeded();
  await next.focus();
  await trigger.evaluate((n) => n.setAttribute("aria-describedby", "authored-help"));
  const start = await page.evaluate(() => performance.now());
  await trigger.hover();
  await page.waitForTimeout(300);
  assert.equal(await isOpen(), false, "the source default waits before opening");
  await opened();
  const elapsed = await page.evaluate((t) => performance.now() - t, start);
  assert.ok(elapsed >= 1450, `default hover delay: ${elapsed}`);
  await focused(next);
  assert.equal(await popup.getAttribute("role"), "tooltip");
  assert.equal(await trigger.getAttribute("aria-expanded"), null);
  assert.equal(await trigger.getAttribute("aria-haspopup"), null);
  assert.equal(await trigger.getAttribute("aria-describedby"), "authored-help tooltip-save-popup");
  const reference = await root.elementHandle();
  const groupStart = Date.now();
  await share.hover();
  await page.waitForFunction(() =>
    document.getElementById("tooltip-share").matches(":popover-open"),
  );
  assert.ok(Date.now() - groupStart < 1000, "adjacent grouped tooltip skips the 1500ms delay");
  assert.equal(await isOpen(), false);
  await page.keyboard.press("Escape");
  await focused(next);
  await far();
  await page.waitForTimeout(500);
  await trigger.evaluate(
    (n) =>
      (n.closest('[data-slot="tooltip-provider"]').style.cssText =
        "--lenso-tooltip-delay:80ms;--lenso-tooltip-close-delay:0ms"),
  );
  await trigger.hover();
  await opened();
  assert.equal(await popup.getAttribute("aria-hidden"), null);
  const a = await trigger.boundingBox(),
    b = await root.boundingBox();
  await page.mouse.move(a.x + a.width / 2, (b.y + b.height + a.y) / 2, { steps: 4 });
  await page.waitForTimeout(90);
  assert.equal(await isOpen(), true, "shared gap stays open with zero close delay");
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await focused(next);
  assert.equal(await isOpen(), true);
  await far();
  await closed();
  assert.equal(await trigger.getAttribute("aria-describedby"), "authored-help");
  await keyboardFocus(trigger);
  await opened();
  await focused(trigger);
  assert.equal(await root.getAttribute("data-lenso-open-reason"), "focus");
  await next.focus();
  await closed();
  await keyboardFocus(trigger);
  await opened();
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await page.waitForTimeout(150);
  assert.equal(await isOpen(), false);
  await next.focus();
  await far();
  await trigger.hover();
  await opened();
  await trigger.click();
  await closed();
  assert.equal(await page.getByTestId("tooltip-count").textContent(), "Saves: 1");
  await page.waitForTimeout(120);
  assert.equal(await isOpen(), false, "press does not immediately reopen through focus");
  await direct("click");
  await next.focus();
  await far();
  await trigger.hover();
  await opened();
  await trigger.click();
  assert.equal(await isOpen(), true);
  assert.equal(await page.getByTestId("tooltip-count").textContent(), "Saves: 2");
  await far();
  await closed();
  await direct("click");
  await direct("disabled");
  await keyboardFocus(trigger);
  await trigger.hover();
  await page.waitForTimeout(200);
  assert.equal(await isOpen(), false);
  assert.equal(await trigger.isDisabled(), false, "disabling a tooltip keeps its action usable");
  await trigger.click();
  assert.equal(await page.getByTestId("tooltip-count").textContent(), "Saves: 3");
  await direct("disabled");
  await next.focus();
  await far();
  await trigger.hover();
  await opened();
  await direct("disabled");
  await closed();
  await direct("disabled");
  await trigger.evaluate((n) => {
    const provider = n.closest('[data-slot="tooltip-provider"]');
    provider.setAttribute("data-lenso-hover-delay", "900");
    provider.setAttribute("data-lenso-close-delay", "300");
  });
  await direct("delay");
  await next.focus();
  await far();
  await page.waitForTimeout(450);
  const ownDelayStart = Date.now();
  await trigger.hover();
  await opened();
  assert.ok(Date.now() - ownDelayStart < 800, "trigger timing overrides the provider");
  await far();
  await closed();
  await direct("delay");
  await trigger.evaluate((n) => {
    const provider = n.closest('[data-slot="tooltip-provider"]');
    provider.setAttribute("data-lenso-hover-delay", "-1");
    provider.setAttribute("data-lenso-close-delay", "-1");
  });
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1200, height: 1000 });
  const oldStyle = await trigger.getAttribute("style");
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:520px;top:400px;z-index:100"),
  );
  const endpoints = [];
  for (const direction of ["ltr", "rtl"]) {
    if (direction === "rtl") await direct("direction");
    for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"]) {
      for (let i = 0; i < 6 && (await root.getAttribute("data-lenso-side")) !== side; i++)
        await direct("side");
      for (const align of ["center", "start", "end"]) {
        for (let i = 0; i < 3 && (await root.getAttribute("data-lenso-align")) !== align; i++)
          await direct("align");
        await next.focus();
        await far();
        await trigger.hover();
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
        const r = await root.boundingBox(),
          a = await trigger.boundingBox();
        assert.ok(r.x >= 7 && r.y >= 7 && r.x + r.width <= 1193 && r.y + r.height <= 993);
        if (resolved === "top") assert.ok(r.y + r.height <= a.y - 6);
        if (resolved === "bottom") assert.ok(r.y >= a.y + a.height + 6);
        if (resolved === "left") assert.ok(r.x + r.width <= a.x - 6);
        if (resolved === "right") assert.ok(r.x >= a.x + a.width + 6);
        const mask = await popup
          .locator(':scope > [data-slot="tooltip-material"]')
          .evaluate((n) => n.style.maskImage);
        assert.ok(mask.includes("svg") && decodeURIComponent(mask).includes(" C"));
        endpoints.push({ side, align, direction, rect: r });
        await far();
        await closed();
      }
    }
  }
  await direct("direction");
  await direct("arrow");
  await next.focus();
  await far();
  await trigger.hover();
  await opened();
  await page.waitForTimeout(50);
  assert.equal(
    decodeURIComponent(
      await popup
        .locator(':scope > [data-slot="tooltip-material"]')
        .evaluate((n) => n.style.maskImage),
    ).includes(" C"),
    false,
  );
  await far();
  await closed();
  await direct("arrow");
  await other.hover();
  await opened();
  assert.equal(await trigger.getAttribute("aria-describedby"), "authored-help");
  assert.equal(await other.getAttribute("aria-describedby"), "tooltip-save-popup");
  assert.equal(
    await reference.evaluate((n) => n === document.getElementById("tooltip-save")),
    true,
  );
  const inactiveTrigger = await trigger.elementHandle();
  await direct("trigger-mounted");
  assert.equal(await isOpen(), true, "retiring an inactive trigger preserves the active tooltip");
  assert.equal(
    await inactiveTrigger.evaluate((n) => n.getAttribute("aria-describedby")),
    "authored-help",
  );
  await inactiveTrigger.dispose();
  await far();
  await closed();
  await direct("trigger-mounted");
  await trigger.evaluate((n) => {
    n.style.cssText = "position:fixed;left:520px;top:400px;z-index:100";
    n.setAttribute("aria-describedby", "authored-help");
  });
  await far();
  await closed();
  await trigger.hover();
  await opened();
  await page.evaluate(() => {
    window.__tooltipMoveLeases = new Set();
    const add = document.addEventListener.bind(document);
    const remove = document.removeEventListener.bind(document);
    document.addEventListener = (type, listener, options) => {
      if (type === "pointermove") window.__tooltipMoveLeases.add(listener);
      return add(type, listener, options);
    };
    document.removeEventListener = (type, listener, options) => {
      if (type === "pointermove") window.__tooltipMoveLeases.delete(listener);
      return remove(type, listener, options);
    };
  });
  const retiringAnchor = await trigger.boundingBox();
  const retiringPopup = await root.boundingBox();
  await page.mouse.move(
    (retiringAnchor.x + retiringAnchor.width + retiringPopup.x) / 2,
    retiringAnchor.y + retiringAnchor.height / 2,
    { steps: 4 },
  );
  assert.ok((await page.evaluate(() => window.__tooltipMoveLeases.size)) > 0);
  await direct("mounted");
  await page.waitForTimeout(120);
  assert.equal(await root.count(), 0);
  assert.equal(await page.evaluate(() => window.__tooltipMoveLeases.size), 0);
  assert.equal(await trigger.getAttribute("aria-describedby"), "authored-help");
  assert.equal(await reference.evaluate((n) => n.hasAttribute("data-lenso-positioned")), false);
  await direct("mounted");
  await far();
  await closed();
  await trigger.hover();
  await opened();
  await direct("trigger-mounted");
  await closed();
  await direct("trigger-mounted");
  await far();
  await closed();
  await trigger.evaluate(
    (n, style) => (style === null ? n.removeAttribute("style") : n.setAttribute("style", style)),
    oldStyle,
  );
  await next.focus();
  await keyboardFocus(trigger);
  await opened();
  await page.evaluate(async () => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    for (const id of ["tooltip-save-trigger", "tooltip-save"]) {
      const node = document.getElementById(id);
      createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
    }
  });
  assert.equal(await isOpen(), true);
  await focused(trigger);
  await page.keyboard.press("Escape");
  await closed();
  await next.focus();
  await trigger.evaluate((n) =>
    n.closest('[data-slot="tooltip-provider"]').setAttribute("data-contrast", "increased"),
  );
  await keyboardFocus(trigger);
  await opened();
  assert.equal(
    await popup
      .locator(':scope > [data-slot="tooltip-material"]')
      .getAttribute("data-material-opaque"),
    "",
  );
  assert.equal(
    await popup
      .locator('[data-lenso-kind="tooltip-paint-blur"]')
      .evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await next.focus();
  await closed();
  await trigger.evaluate((n) =>
    n.closest('[data-slot="tooltip-provider"]').removeAttribute("data-contrast"),
  );
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      await trigger.scrollIntoViewIfNeeded();
      await next.focus();
      await keyboardFocus(trigger);
      await opened();
      await page.screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-tooltip-${appearance}-${width}.png`,
        ),
      });
      await next.focus();
      await closed();
    }
  }
  await next.focus();
  await far();
  await trigger.evaluate((n) =>
    n.closest('[data-slot="tooltip-provider"]').setAttribute("data-lenso-hover-delay", "900"),
  );
  await page.waitForTimeout(450);
  await trigger.hover();
  await page.waitForTimeout(30);
  assert.equal(await isOpen(), false);
  await direct("mounted");
  await page.waitForTimeout(950);
  await direct("mounted");
  await far();
  await closed();
  await trigger.evaluate((n) =>
    n.closest('[data-slot="tooltip-provider"]').setAttribute("data-lenso-hover-delay", "-1"),
  );
  await page.setViewportSize(viewport);
  await reference.dispose();
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-tooltip-geometry.json`),
    JSON.stringify({ endpoints, defaultDelay: elapsed }, null, 2) + "\n",
  );
  return { endpoints: endpoints.length, defaultDelay: elapsed };
}

export async function checkTooltipTouch(page) {
  await page.waitForFunction(() =>
    document.getElementById("tooltip-save-trigger")?.hasAttribute("data-lenso-ready"),
  );
  const trigger = page.getByTestId("tooltip-save-trigger");
  await trigger.tap();
  await page.waitForTimeout(1600);
  assert.equal(
    await page.getByTestId("tooltip-save").evaluate((n) => n.matches(":popover-open")),
    false,
  );
  assert.equal(await page.getByTestId("tooltip-count").textContent(), "Saves: 1");
  return { touchHover: "absent", nativeAction: "retained" };
}
