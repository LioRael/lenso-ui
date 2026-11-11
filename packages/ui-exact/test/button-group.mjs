import assert from "node:assert/strict";
import path from "node:path";

// Joined geometry and native activation must survive live group option changes.
export async function checkButtonGroup(page, engine) {
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const group = page.getByTestId("actions-group");
  const save = page.getByTestId("actions-save"),
    duplicate = page.getByTestId("actions-duplicate"),
    more = page.getByTestId("actions-more");
  const toggle = (name) => page.getByTestId(`actions-${name}`).click();
  const count = () => page.getByTestId("actions-count").textContent();
  const style = (node, property) =>
    node.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), property);
  const focused = async (node) =>
    assert.equal(await node.evaluate((n) => n === document.activeElement), true);
  await group.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.getElementById("actions-save").hasAttribute("data-lenso-ready"),
  );
  assert.equal(await page.getByRole("group", { name: "Document actions", exact: true }).count(), 1);
  assert.equal(await group.getByRole("button").count(), 3);
  assert.equal(await save.getAttribute("type"), "button");
  assert.equal(await save.getAttribute("aria-pressed"), null);
  const original = await save.elementHandle();
  assert.equal(await style(save, "border-start-start-radius"), "1000px");
  assert.equal(await style(save, "border-start-end-radius"), "0px");
  assert.equal(await style(duplicate, "border-start-start-radius"), "0px");
  assert.equal(await style(more, "border-start-end-radius"), "1000px");
  assert.equal(await style(duplicate, "border-inline-start-width"), "1px");
  assert.equal(await group.locator('[data-slot="button-group-separator"]').isVisible(), false);
  await save.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  assert.equal(await count(), "Actions: 2");
  await page.keyboard.press("ArrowRight");
  await focused(save);
  await page.keyboard.press("Tab");
  await focused(duplicate);
  await page.keyboard.press("Tab");
  await focused(more);
  await toggle("middle");
  await save.focus();
  await page.keyboard.press("Tab");
  await focused(more);
  await duplicate.evaluate((n) => n.click());
  assert.equal(await count(), "Actions: 2");
  await toggle("middle");
  await duplicate.focus();
  // An owner update keeps the focused pending action in the Tab order.
  await page.getByTestId("actions-loading").evaluate((n) => n.click());
  await focused(duplicate);
  assert.equal(await duplicate.isDisabled(), false);
  assert.equal(await duplicate.getAttribute("aria-busy"), "true");
  assert.equal(await duplicate.getAttribute("data-pending"), "");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await duplicate.evaluate((n) => n.click());
  const box = await duplicate.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  assert.equal(await count(), "Actions: 2");
  await focused(duplicate);
  await toggle("loading");
  await duplicate.click();
  assert.equal(await count(), "Actions: 3");
  await toggle("disabled");
  for (const item of [save, duplicate, more]) {
    assert.equal(await item.isDisabled(), true);
    await item.evaluate((n) => n.click());
  }
  assert.equal(await count(), "Actions: 3");
  await toggle("disabled");
  await toggle("size");
  assert.equal((await save.boundingBox()).height, 50);
  assert.equal((await more.boundingBox()).width, 50);
  await toggle("size");
  await toggle("small");
  assert.equal((await save.boundingBox()).height, 28);
  assert.equal((await more.boundingBox()).width, 28);
  await toggle("small");
  assert.equal((await save.boundingBox()).height, 34);
  const neutral = await style(save, "background-color");
  await toggle("destructive");
  assert.notEqual(await style(save, "background-color"), neutral);
  assert.notEqual(await style(save, "--lenso-control-tint-text"), "");
  await toggle("tint");
  assert.equal((await style(save, "--lenso-control-tint")).trim(), "rgb(45 132 56)");
  // A caller's public tint map must override the private native tint value.
  await save.evaluate(async (node) => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { buttonGroupTintRule } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    createWebHatch([buttonGroupTintRule]).element({
      hatch: "lenso-ui",
      element: node,
      data: node.dataset,
    });
  });
  assert.equal(
    await save.evaluate((n) => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(n).getPropertyValue("--lenso-control-tint");
      return probe.style.color;
    }),
    "rgb(130, 50, 180)",
  );
  await toggle("destructive");
  await toggle("tint");
  await toggle("prominent");
  assert.notEqual(await style(save, "background-color"), neutral);
  await toggle("prominent");
  await toggle("borderless");
  assert.equal(await style(save, "background-color"), "rgba(0, 0, 0, 0)");
  await toggle("borderless");
  await toggle("full");
  const widths = await Promise.all(
    [save, duplicate, more].map(async (n) => (await n.boundingBox()).width),
  );
  // Shared stretch distributes content space; icon-only members have no text padding.
  const contentWidths = await Promise.all(
    [save, duplicate, more].map((n) =>
      n.evaluate((n) => {
        const s = getComputedStyle(n);
        return (
          n.getBoundingClientRect().width -
          parseFloat(s.paddingLeft) -
          parseFloat(s.paddingRight) -
          parseFloat(s.borderLeftWidth) -
          parseFloat(s.borderRightWidth)
        );
      }),
    ),
  );
  assert.ok(Math.max(...contentWidths) - Math.min(...contentWidths) < 1);
  assert.ok(Math.abs((await group.boundingBox()).width - widths.reduce((a, b) => a + b, 0)) < 1);
  await toggle("full");
  await toggle("rtl");
  assert.ok((await save.boundingBox()).x > (await more.boundingBox()).x);
  await toggle("rtl");
  await toggle("vertical");
  assert.ok((await save.boundingBox()).y < (await more.boundingBox()).y);
  assert.equal(await style(save, "border-start-end-radius"), "1000px");
  assert.equal(await style(save, "border-end-start-radius"), "0px");
  assert.equal(await style(more, "border-end-start-radius"), "1000px");
  assert.equal(await style(duplicate, "border-block-start-width"), "1px");
  await toggle("vertical");
  assert.equal(await save.evaluate((n, old) => n === old, original), true);
  await toggle("first");
  assert.equal(await style(duplicate, "border-start-start-radius"), "1000px");
  await toggle("first");
  await toggle("detached");
  assert.equal(await style(group, "gap"), "4px");
  assert.equal(await style(duplicate, "border-start-start-radius"), "1000px");
  await toggle("detached");
  await toggle("glass");
  await page.waitForFunction(() =>
    document.getElementById("actions-save").hasAttribute("data-material-filter"),
  );
  assert.equal(await save.getAttribute("data-lenso-kind"), "glass-button-group-item");
  assert.equal(await style(save, "scale"), "1");
  await save.hover();
  await page.mouse.down();
  assert.equal(await save.getAttribute("data-lenso-pressed"), null);
  await page.mouse.up();
  await toggle("detached");
  await save.hover();
  await page.mouse.down();
  await page.waitForFunction(() =>
    document.getElementById("actions-save").hasAttribute("data-lenso-pressed"),
  );
  await page.mouse.up();
  await page.waitForFunction(
    () => !document.getElementById("actions-save").hasAttribute("data-lenso-pressed"),
  );
  await toggle("loading");
  await duplicate.hover();
  await page.mouse.down();
  assert.equal(await duplicate.getAttribute("data-lenso-pressed"), null);
  await page.mouse.up();
  await toggle("loading");
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  assert.equal(await style(save, "backdrop-filter"), "none");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "no-preference" });
  await toggle("detached");
  for (const glass of [true, false]) {
    if (!glass) await toggle("glass");
    for (const vertical of [false, true]) {
      if (vertical) await toggle("vertical");
      for (const direction of ["ltr", "rtl"]) {
        if ((await style(group, "direction")) !== direction) await toggle("rtl");
        for (const appearance of ["light", "dark"]) {
          await page
            .locator("[data-theme]")
            .first()
            .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
          for (const width of [390, 820]) {
            await page.setViewportSize({ width, height: 844 });
            await group.scrollIntoViewIfNeeded();
            assert.ok(
              (await group.boundingBox()).width <=
                (await page.locator("#button-group-examples").boundingBox()).width + 1,
            );
            await page.locator("#button-group-examples").screenshot({
              path: path.resolve(
                import.meta.dirname,
                `../.cache/example/${engine}-button-group-${glass ? "glass" : "ordinary"}-${vertical ? "vertical" : "horizontal"}-${appearance}-${direction}-${width}.png`,
              ),
            });
          }
        }
      }
      if (vertical) await toggle("vertical");
    }
  }
  const old = await save.elementHandle();
  await toggle("visible");
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")), "");
  await toggle("visible");
  assert.equal(await save.count(), 1);
  await old.dispose();
  await original.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
}
