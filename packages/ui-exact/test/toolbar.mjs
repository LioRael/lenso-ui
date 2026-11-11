import assert from "node:assert/strict";
import path from "node:path";

export async function checkToolbar(page, engine) {
  const root = page.getByRole("toolbar", { name: "Document editing", exact: true });
  const copy = page.getByTestId("toolbar-copy"),
    paste = page.getByTestId("toolbar-paste"),
    save = page.getByTestId("toolbar-save"),
    help = page.getByTestId("toolbar-help");
  const group = page.getByTestId("toolbar-clipboard");
  const toggle = (name) => page.getByTestId(`toolbar-${name}`).click();
  const focused = async (item) =>
    assert.equal(await item.evaluate((n) => n === document.activeElement), true);
  const count = async () =>
    Number((await page.getByTestId("toolbar-count").textContent()).split(": ")[1]);
  await page.waitForFunction(() =>
    document.getElementById("toolbar-save")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(await root.getAttribute("aria-orientation"), "horizontal");
  assert.equal(
    await group.locator(':scope > [data-slot="glass-press-highlight"][aria-hidden="true"]').count(),
    1,
  );
  assert.equal(await root.getByRole("group", { name: "Clipboard", exact: true }).count(), 1);
  assert.equal(await root.locator('[tabindex="0"]').count(), 1);
  assert.equal(await copy.getAttribute("tabindex"), "0");
  assert.equal(await paste.isDisabled(), true);
  assert.equal(await paste.getAttribute("tabindex"), "-1");
  assert.equal(await copy.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  await copy.focus();
  await page.keyboard.press("ArrowRight");
  await focused(save);
  await page.keyboard.press("ArrowRight");
  await focused(help);
  await page.keyboard.press("ArrowRight");
  await focused(copy);
  await page.keyboard.press("End");
  await focused(help);
  await page.keyboard.press("Home");
  await focused(copy);
  await page.keyboard.press("ArrowDown");
  await focused(copy);
  await page.keyboard.press("Shift+ArrowRight");
  await focused(copy);
  await toggle("loop");
  await help.focus();
  await page.keyboard.press("ArrowRight");
  await focused(help);
  await toggle("loop");
  await toggle("direction");
  await copy.focus();
  await page.keyboard.press("ArrowLeft");
  await focused(save);
  await page.keyboard.press("Home");
  await focused(copy);
  await toggle("axis");
  await copy.focus();
  await page.keyboard.press("ArrowDown");
  await focused(save);
  await page.keyboard.press("ArrowLeft");
  await focused(save);
  await toggle("axis");
  await toggle("direction");
  await toggle("focusable");
  assert.equal(await paste.evaluate((n) => n.disabled), false);
  assert.equal(await paste.getAttribute("aria-disabled"), "true");
  await copy.focus();
  await page.keyboard.press("ArrowRight");
  await focused(paste);
  let before = await count();
  await page.keyboard.press("Space");
  await paste.evaluate((n) => n.click());
  assert.equal(await count(), before);
  await toggle("focusable");
  await toggle("group-disabled");
  assert.equal(await copy.isDisabled(), true);
  await save.focus();
  await page.keyboard.press("Home");
  await focused(save);
  await copy.evaluate((n) => n.click());
  assert.equal(await count(), before);
  await toggle("group-disabled");
  await toggle("disabled");
  assert.equal(await copy.isDisabled(), true);
  assert.equal(await save.isDisabled(), true);
  assert.notEqual(await help.getAttribute("href"), null);
  await help.focus();
  await page.keyboard.press("Home");
  await focused(help);
  await toggle("disabled");
  await save.focus();
  await page.keyboard.press("Space");
  assert.equal(await count(), before + 1);
  before = await count();
  await toggle("loading");
  assert.equal(await save.isDisabled(), false);
  assert.equal(await save.getAttribute("aria-busy"), "true");
  await save.focus();
  await page.keyboard.press("Enter");
  await save.evaluate((n) => n.click());
  assert.equal(await count(), before);
  await page.keyboard.press("ArrowRight");
  await focused(help);
  await toggle("loading");
  await help.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL(/#toolbar-help-target$/);
  await page.evaluate(() => history.replaceState(null, "", location.pathname));
  before = await count();
  await save.hover();
  const box = await save.boundingBox();
  await page.mouse.down();
  assert.equal(await count(), before);
  await page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.up();
  assert.equal(await count(), before);
  await save.focus();
  await page.keyboard.press("Enter");
  assert.equal(await count(), before + 1);
  await copy.hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(
      () =>
        parseFloat(
          document
            .getElementById("toolbar-clipboard")
            .style.getPropertyValue("--toolbar-press-scale"),
        ) > 1,
    );
    assert.equal(await group.getAttribute("data-lenso-pressed"), "");
  } finally {
    await page.mouse.up();
  }
  await toggle("elastic");
  await copy.hover();
  await page.mouse.down();
  try {
    assert.equal(await group.getAttribute("data-lenso-pressed"), null);
  } finally {
    await page.mouse.up();
  }
  await toggle("elastic");
  const retained = await copy.elementHandle();
  for (const variant of ["filled", "glass", "plain", "auto"]) {
    await toggle("variant");
    assert.equal(
      await save.getAttribute("data-lenso-variant"),
      variant === "auto" ? "glass" : variant,
    );
    assert.equal(
      await copy.getAttribute("data-lenso-variant"),
      variant === "auto" ? "plain" : variant,
    );
    await save.click();
  }
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const marker = engine === "webkit" ? "data-material-paints" : "data-material-filter";
  assert.equal(await group.evaluate((n, m) => n.hasAttribute(m), marker), true);
  assert.equal(await save.evaluate((n, m) => n.hasAttribute(m), marker), true);
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      for (const attached of [false, true]) {
        if (attached) await toggle("attached");
        assert.equal(await root.getAttribute("data-attached"), attached ? "" : null);
        assert.equal(
          await root
            .locator(':scope > [data-slot="glass-press-highlight"][aria-hidden="true"]')
            .count(),
          attached ? 1 : 0,
        );
        assert.equal(
          await group
            .locator(':scope > [data-slot="glass-press-highlight"][aria-hidden="true"]')
            .count(),
          attached ? 0 : 1,
        );
        assert.equal(await root.evaluate((n, m) => n.hasAttribute(m), marker), attached);
        assert.equal(await group.evaluate((n, m) => n.hasAttribute(m), marker), !attached);
        for (const vertical of [false, true]) {
          if (vertical) await toggle("axis");
          await toggle("direction");
          const geometry = await root.evaluate((n) => {
            const r = n.getBoundingClientRect();
            return {
              left: r.left,
              right: r.right,
              orientation: n.getAttribute("aria-orientation"),
              doc: document.documentElement.scrollWidth,
            };
          });
          assert.equal(geometry.orientation, vertical ? "vertical" : "horizontal");
          assert.ok(geometry.left >= 0 && geometry.right <= width + 1 && geometry.doc <= width);
          assert.equal(
            await retained.evaluate((n) => n === document.getElementById("toolbar-copy")),
            true,
          );
          await root.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${engine}-toolbar-${appearance}-${width}-${attached ? "attached" : "floating"}-${vertical ? "vertical" : "horizontal"}-rtl.png`,
            ),
          });
          await toggle("direction");
          if (vertical) await toggle("axis");
        }
        if (attached) await toggle("attached");
      }
    }
  }
  for (const [size, height] of [
    ["lg", 48],
    ["sm", 36],
    ["md", 44],
  ]) {
    await toggle("size");
    assert.equal(await save.getAttribute("data-lenso-size"), size);
    assert.equal(await save.evaluate((n) => getComputedStyle(n).height), `${height}px`);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  before = await count();
  await save.click();
  assert.equal(await count(), before + 1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await copy.focus();
  await page.getByTestId("toolbar-copy-visible").evaluate((n) => n.click());
  assert.equal(await copy.count(), 0);
  await focused(save);
  await toggle("copy-visible");
  assert.equal(await root.locator('[tabindex="0"]').count(), 1);
  await toggle("glass");
  assert.equal(await group.evaluate((n, m) => n.hasAttribute(m), marker), false);
  assert.equal(await save.evaluate((n, m) => n.hasAttribute(m), marker), false);
  await toggle("glass");
  await save.hover();
  await page.mouse.down();
  const old = await save.elementHandle();
  const oldGroup = await group.elementHandle();
  try {
    await page.getByTestId("toolbar-visible").evaluate((n) => n.click());
    assert.equal(await old.evaluate((n) => n.isConnected), false);
    assert.equal(await old.evaluate((n, m) => n.hasAttribute(m), marker), false);
    assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
    assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")), "");
    assert.equal(
      await oldGroup.evaluate((n) => n.style.getPropertyValue("--toolbar-press-scale")),
      "",
    );
    assert.equal(await oldGroup.evaluate((n, m) => n.hasAttribute(m), marker), false);
  } finally {
    await page.mouse.up();
  }
  await toggle("visible");
  assert.equal(await root.locator('[tabindex="0"]').count(), 1);
  await copy.focus();
  await page.keyboard.press("ArrowRight");
  await focused(save);
  await retained.dispose();
  await old.dispose();
  await oldGroup.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
  await checkToolbarIsolation(page);
}

/** Isolate controller ownership without adding unrelated UI to the compiled gallery. */
export async function checkToolbarIsolation(page) {
  await page.evaluate(async () => {
    const hatch = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const fixture = document.createElement("section");
    fixture.id = "toolbar-isolation-fixture";
    fixture.style.cssText =
      "position:fixed;left:0;top:0;z-index:99999;background:Canvas;padding:12px";
    const handles = [];
    const root = (id) => {
      const node = document.createElement("div");
      node.id = id;
      node.setAttribute("role", "toolbar");
      Object.assign(node.dataset, {
        slot: "toolbar",
        lensoKind: "toolbar",
        orientation: "horizontal",
        lensoDirection: "ltr",
        lensoDisabled: "false",
        lensoLoopFocus: "true",
        lensoAttached: "false",
        lensoElastic: "false",
      });
      handles.push({ hatch: "lenso-ui", element: node, data: node.dataset });
      return node;
    };
    const button = (id) => {
      const node = document.createElement("button");
      node.id = id;
      node.textContent = id;
      Object.assign(node.dataset, {
        slot: "toolbar-button",
        lensoKind: "toolbar-button",
        orientation: "horizontal",
        lensoSurface: "false",
        lensoSize: "sm",
        lensoVariant: "plain",
        lensoGlass: "false",
        lensoIconOnly: "false",
        lensoDestructive: "false",
        lensoTinted: "false",
        lensoOwnDisabled: "false",
        lensoFocusableDisabled: "false",
        lensoLoading: "false",
        lensoElastic: "false",
      });
      handles.push({ hatch: "lenso-ui", element: node, data: node.dataset });
      return node;
    };
    const outer = root("toolbar-isolation-outer"),
      inner = root("toolbar-isolation-inner");
    outer.append(button("toolbar-outer-action"));
    inner.append(button("toolbar-inner-one"), button("toolbar-inner-two"));
    const editor = document.createElement("input");
    editor.id = "toolbar-isolation-editor";
    editor.value = "Draft";
    outer.append(inner, editor);
    fixture.append(outer);
    document.getElementById("exact-root").append(fixture);
    for (const handle of handles) hatch.element(handle);
    fixture._end = () => {
      for (const handle of handles.toReversed()) hatch.elementEnded(handle);
      fixture.remove();
    };
  });
  try {
    const outer = page.locator("#toolbar-outer-action"),
      first = page.locator("#toolbar-inner-one"),
      second = page.locator("#toolbar-inner-two");
    await outer.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await outer.evaluate((n) => n === document.activeElement), true);
    await first.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await second.evaluate((n) => n === document.activeElement), true);
    await page.keyboard.press("Home");
    assert.equal(await first.evaluate((n) => n === document.activeElement), true);
    const input = page.locator("#toolbar-isolation-editor");
    await input.focus();
    await input.evaluate((n) => n.setSelectionRange(0, 0));
    await page.keyboard.press("ArrowRight");
    assert.equal(await input.evaluate((n) => n === document.activeElement), true);
    assert.equal(await input.evaluate((n) => n.selectionStart), 1);
  } finally {
    await page.evaluate(() => document.getElementById("toolbar-isolation-fixture")._end());
  }
}
