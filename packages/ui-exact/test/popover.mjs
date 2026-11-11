import assert from "node:assert/strict";
import path from "node:path";

export async function checkPopover(page, engine, { capture = true } = {}) {
  const root = page.getByTestId("export-popover"),
    popup = page.getByTestId("export-popover-popup");
  const trigger = page.getByTestId("popover-open"),
    editor = page.getByTestId("export-name");
  const direct = (name) => page.getByTestId(`popover-${name}`).evaluate((node) => node.click());
  const focused = async (node) => {
    const handle = await node.elementHandle();
    try {
      await page.waitForFunction((n) => n === document.activeElement, handle);
    } catch (error) {
      const actual = await page.evaluate(() => ({
        id: document.activeElement?.id,
        tag: document.activeElement?.tagName,
        testId: document.activeElement?.getAttribute("data-testid"),
        open: [...document.querySelectorAll(":popover-open")].map((n) => n.id),
      }));
      throw new Error(
        `Focus did not reach ${await node.getAttribute("data-testid")}: ${JSON.stringify(actual)}`,
        { cause: error },
      );
    } finally {
      await handle.dispose();
    }
    const state = await node.evaluate((n) => ({
      match: n === document.activeElement,
      expected: n.id,
      actual: document.activeElement?.id,
    }));
    assert.ok(state.match, JSON.stringify(state));
  };
  const settled = async () => {
    await page.waitForFunction(() => {
      const root = document.getElementById("export-popover"),
        popup = document.getElementById("export-popover-popup");
      if (
        !root?.matches(":popover-open") ||
        !root.hasAttribute("data-lenso-positioned") ||
        root.hasAttribute("data-lenso-position-pending") ||
        popup.hasAttribute("data-starting-style")
      )
        return false;
      const r = root.getBoundingClientRect(),
        p = popup.getBoundingClientRect();
      const x = parseFloat(root.style.getPropertyValue("--lenso-exact-popover-x")),
        y = parseFloat(root.style.getPropertyValue("--lenso-exact-popover-y"));
      return (
        Math.abs(r.x - x) < 0.5 &&
        Math.abs(r.y - y) < 0.5 &&
        Math.abs(p.width - popup.offsetWidth) < 0.5
      );
    });
  };
  const open = async (button = trigger) => {
    await button.click();
    await settled();
  };
  const closed = async () => {
    await page.waitForFunction(() => {
      const root = document.getElementById("export-popover");
      return root && !root.matches(":popover-open") && getComputedStyle(root).display === "none";
    });
  };
  const geometry = () =>
    root.evaluate((node) => {
      const popup = node.querySelector('[data-slot="popover-popup"]'),
        arrow = popup.querySelector('[data-slot="popover-arrow"]');
      const anchor = document.getElementById("popover-open"),
        r = node.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        side: popup.dataset.side,
        align: popup.dataset.align,
        direction: popup.dataset.direction,
        anchor: anchor.getBoundingClientRect().toJSON(),
        arrow: arrow.getBoundingClientRect().toJSON(),
        width: innerWidth,
        height: innerHeight,
      };
    });
  const bounds = (r) => {
    assert.ok(r.x >= 7.4 && r.x + r.w <= r.width - 7.4, JSON.stringify(r));
    assert.ok(r.y >= 7.4 && r.y + r.h <= r.height - 7.4, JSON.stringify(r));
  };
  const state = async (name, attribute, value, count) => {
    for (let i = 0; i < count && (await root.getAttribute(attribute)) !== value; i++)
      await direct(name);
    assert.equal(await root.getAttribute(attribute), value);
    await settled();
  };
  await page.waitForFunction(() =>
    document.getElementById("export-popover")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(await root.evaluate((n) => n.matches(":popover-open")), false);
  assert.equal(await popup.isVisible(), false);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await settled();
  assert.equal(await page.getByRole("dialog", { name: "Export options", exact: true }).count(), 1);
  assert.equal(await popup.getAttribute("aria-describedby"), "export-popover-description");
  assert.equal(await popup.getAttribute("aria-modal"), null);
  await focused(editor);
  const original = await editor.elementHandle();
  await editor.fill("Board briefing");
  await editor.evaluate((n) => n.setSelectionRange(2, 8));
  await direct("offset");
  await settled();
  assert.equal(await original.evaluate((n) => n === document.getElementById("export-name")), true);
  assert.equal(await editor.inputValue(), "Board briefing");
  assert.deepEqual(await editor.evaluate((n) => [n.selectionStart, n.selectionEnd]), [2, 8]);
  await focused(editor);
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await open();
  assert.equal(await editor.inputValue(), "Board briefing");
  await page.getByTestId("popover-cancel").click();
  await closed();
  await focused(trigger);
  await open();
  await page.keyboard.press("Shift+Tab");
  await closed();
  await focused(trigger);
  await open();
  await page.keyboard.press("Tab");
  await focused(page.getByTestId("popover-cancel"));
  await page.keyboard.press("Tab");
  await focused(page.getByTestId("popover-save"));
  await page.keyboard.press("Tab");
  await focused(page.getByTestId("popover-format"));
  await page.keyboard.press("Tab");
  await closed();
  assert.equal(await editor.evaluate((n) => n.contains(document.activeElement)), false);
  await open();
  await page.getByTestId("popover-format").click();
  await page.waitForFunction(() =>
    document.getElementById("format-popover").matches(":popover-open"),
  );
  await page.waitForFunction(() => document.activeElement.id === "format-close");
  assert.equal(await root.evaluate((n) => n.matches(":popover-open")), true);
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.getElementById("format-popover").matches(":popover-open"),
  );
  assert.equal(await root.evaluate((n) => n.matches(":popover-open")), true);
  await focused(page.getByTestId("popover-format"));
  await page.keyboard.press("Escape");
  await closed();
  await open();
  await page.mouse.click(page.viewportSize().width - 2, page.viewportSize().height / 2);
  await closed();
  await focused(trigger);
  await open();
  await page.getByTestId("popover-next").focus();
  await closed();
  await focused(page.getByTestId("popover-next"));
  await direct("disabled");
  assert.equal(await trigger.isDisabled(), true);
  await trigger.evaluate((n) => n.click());
  assert.equal(await root.evaluate((n) => n.matches(":popover-open")), false);
  await direct("disabled");
  await open(page.getByTestId("popover-secondary"));
  await page.keyboard.press("Escape");
  await closed();
  await focused(page.getByTestId("popover-secondary"));
  await page.getByTestId("popover-open-action").click();
  await settled();
  await focused(editor);
  await page.getByTestId("popover-save").click();
  await closed();
  assert.equal(await page.getByTestId("popover-saved").textContent(), "Board briefing");
  await open();
  await editor.press("Enter");
  await closed();
  assert.equal(await page.getByTestId("popover-saved").textContent(), "Board briefing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const viewport = page.viewportSize(),
    theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  await page.setViewportSize({ width: 1200, height: 1000 });
  const originalStyle = await trigger.getAttribute("style");
  await trigger.evaluate(
    (n) => (n.style.cssText = "position:fixed;left:540px;top:450px;z-index:100"),
  );
  await open();
  await state("offset", "data-lenso-side-offset", "16", 3);
  const endpoints = [];
  for (const direction of ["ltr", "rtl"]) {
    await state("direction", "data-lenso-direction", direction, 2);
    for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"]) {
      await state("side", "data-lenso-side", side, 6);
      for (const align of ["start", "center", "end"]) {
        await state("align", "data-lenso-align", align, 3);
        const r = await geometry();
        bounds(r);
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
        assert.equal(r.side, resolved);
        assert.equal(r.direction, direction);
        const a = r.anchor;
        const gap =
          r.side === "top"
            ? a.top - r.y - r.h
            : r.side === "bottom"
              ? r.y - a.bottom
              : r.side === "left"
                ? a.left - r.x - r.w
                : r.x - a.right;
        assert.ok(Math.abs(gap - 16) < 0.6, JSON.stringify(r));
        assert.equal(
          await original.evaluate((n) => n === document.getElementById("export-name")),
          true,
        );
        assert.equal(await editor.inputValue(), "Board briefing");
        await focused(editor);
        endpoints.push({ requested: side, ...r });
      }
    }
  }
  await state("direction", "data-lenso-direction", "ltr", 2);
  await state("side", "data-lenso-side", "top", 6);
  await trigger.evaluate((n) => {
    n.style.left = "0px";
    n.style.top = "0px";
  });
  await page.waitForFunction(
    () => document.getElementById("export-popover-popup").dataset.side === "bottom",
  );
  await settled();
  bounds(await geometry());
  await direct("collision");
  await settled();
  assert.equal(await popup.getAttribute("data-side"), "top");
  await direct("collision");
  await settled();
  bounds(await geometry());
  await page.keyboard.press("Escape");
  await closed();
  await trigger.evaluate(
    (n, v) => (v === null ? n.removeAttribute("style") : n.setAttribute("style", v)),
    originalStyle,
  );
  await page.setViewportSize({ width: 820, height: 844 });
  await open();
  await editor.evaluate((n) => n.focus());
  await page.evaluate(async () => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    const node = document.getElementById("export-popover");
    createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
  });
  await settled();
  await focused(editor);
  await direct("arrow");
  assert.equal(await popup.locator(':scope > [data-slot="popover-arrow"]').count(), 0);
  await page.waitForFunction(
    () =>
      !decodeURIComponent(
        document.querySelector('#export-popover-popup > [data-slot="popover-material"]').style
          .maskImage,
      ).includes(" C"),
  );
  await focused(editor);
  await direct("arrow");
  await settled();
  assert.equal(await popup.locator(':scope > [data-slot="popover-arrow"]').count(), 1);
  await page.waitForFunction(() =>
    decodeURIComponent(
      document.querySelector('#export-popover-popup > [data-slot="popover-material"]').style
        .maskImage,
    ).includes(" C"),
  );
  const beforeScroll = await geometry();
  await page.evaluate(() => scrollBy(0, 40));
  await page.waitForFunction(
    (y) => Math.abs(document.getElementById("export-popover").getBoundingClientRect().y - y) > 20,
    beforeScroll.y,
  );
  await settled();
  bounds(await geometry());
  await direct("tracking");
  await settled();
  assert.equal(await root.getAttribute("data-lenso-disable-anchor-tracking"), "true");
  const held = await geometry();
  await page.evaluate(async () => {
    scrollBy(0, -20);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  const untracked = await geometry();
  assert.ok(Math.abs(held.x - untracked.x) < 0.5 && Math.abs(held.y - untracked.y) < 0.5);
  await direct("tracking");
  await page.waitForFunction(
    (y) => Math.abs(document.getElementById("export-popover").getBoundingClientRect().y - y) > 10,
    held.y,
  );
  await settled();
  bounds(await geometry());
  await root.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() =>
    document
      .querySelector('#export-popover [data-slot="popover-material"]')
      .hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await popup
      .locator(':scope > [data-slot="popover-material"] > [data-lenso-kind="popover-paint-upper"]')
      .evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await root.evaluate((n) => n.removeAttribute("data-contrast"));
  await page.waitForFunction(
    () =>
      !document
        .querySelector('#export-popover [data-slot="popover-material"]')
        .hasAttribute("data-material-opaque"),
  );
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document
      .querySelector('#export-popover [data-slot="popover-material"]')
      .hasAttribute("data-material-opaque"),
  );
  assert.equal(
    await popup
      .locator(':scope > [data-slot="popover-material"] > [data-lenso-kind="popover-paint-upper"]')
      .evaluate((n) => getComputedStyle(n).display),
    "none",
  );
  await page.emulateMedia({ forcedColors: "none" });
  await page.waitForFunction(
    () =>
      !document
        .querySelector('#export-popover [data-slot="popover-material"]')
        .hasAttribute("data-material-opaque"),
  );
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    await trigger.scrollIntoViewIfNeeded();
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      await settled();
      bounds(await geometry());
      if (capture)
        await page.screenshot({
          path: path.resolve(
            import.meta.dirname,
            `../.cache/example/${engine}-popover-${appearance}-${width}.png`,
          ),
        });
    }
  }
  await page.setViewportSize({ width: 390, height: 500 });
  await trigger.scrollIntoViewIfNeeded();
  await popup.locator('[data-slot="popover-viewport"]').evaluate((n) => {
    const p = document.createElement("div");
    p.id = "popover-tall-content";
    p.textContent = "A detailed export summary. ".repeat(300);
    n.append(p);
  });
  await page.waitForFunction(() => {
    const r = document.getElementById("export-popover").getBoundingClientRect();
    return r.top >= 7.4 && r.bottom <= innerHeight - 7.4;
  });
  await settled();
  bounds(await geometry());
  assert.equal(
    await popup
      .locator('[data-slot="popover-viewport"]')
      .evaluate((n) => n.scrollHeight > n.clientHeight),
    true,
  );
  await page.locator("#popover-tall-content").evaluate((n) => n.remove());
  await settled();
  const old = await root.elementHandle(),
    surface = await popup.locator(':scope > [data-slot="popover-material"]').elementHandle();
  await direct("mounted");
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-positioned")), false);
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lenso-exact-popover-x")), "");
  assert.equal(await surface.evaluate((n) => n.hasAttribute("data-material-shaped")), false);
  await direct("mounted");
  await open();
  assert.equal(await editor.inputValue(), "Board briefing");
  await page.keyboard.press("Escape");
  await closed();
  await focused(trigger);
  await original.dispose();
  await old.dispose();
  await surface.dispose();
  await page.setViewportSize(viewport);
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-popover-geometry.json`),
    JSON.stringify({ endpoints }, null, 2) + "\n",
  );
  return { endpoints: endpoints.length };
}
