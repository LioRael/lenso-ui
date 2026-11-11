import assert from "node:assert/strict";
import path from "node:path";

export async function checkSearchField(page, engine) {
  const input = page.getByTestId("search-demo-input");
  const group = page.getByTestId("search-demo-group");
  const clear = page.getByTestId("search-demo-clear");
  const toggle = (name) => page.getByTestId(`search-${name}`).click();
  const value = async (expected) => {
    await page.waitForFunction(
      (expected) => document.getElementById("search-demo-input").value === expected,
      expected,
    );
    assert.equal(await page.getByTestId("search-value").textContent(), `Query: ${expected}`);
  };
  await page.waitForFunction(() =>
    document.getElementById("search-demo-input")?.hasAttribute("data-lenso-ready"),
  );
  assert.equal(
    await page.getByRole("searchbox", { name: "Search documents", exact: true }).count(),
    1,
  );
  const quick = page.getByRole("searchbox", { name: "Quick search", exact: true });
  await quick.fill("Quick draft");
  await value("Quick draft");
  await page.getByRole("button", { name: "Clear quick search", exact: true }).click();
  await value("");
  assert.equal(await input.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  assert.equal(await input.getAttribute("type"), "search");
  assert.equal(await input.getAttribute("name"), "query");
  assert.equal(await input.evaluate((n) => n.required && n.validity.valueMissing), true);
  assert.equal(await clear.isDisabled(), true);
  assert.equal(await clear.isVisible(), false);
  assert.equal(await group.evaluate((n) => getComputedStyle(n).height), "44px");
  assert.equal(
    await input.evaluate((n) => getComputedStyle(n).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  assert.deepEqual(
    await input.evaluate((n) => {
      const s = getComputedStyle(n);
      return [s.borderTopWidth, s.paddingTop, s.paddingInlineStart, s.appearance, s.lineHeight];
    }),
    ["0px", "0px", "0px", "none", "20px"],
  );
  await page.getByTestId("search-label").click();
  assert.equal(await input.evaluate((n) => n === document.activeElement), true);
  assert.equal(await group.evaluate((n) => getComputedStyle(n).outlineStyle), "none");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  assert.equal(await input.evaluate((n) => n === document.activeElement), true);
  assert.ok(await group.evaluate((n) => parseFloat(getComputedStyle(n).outlineWidth) > 0));
  assert.equal(await group.evaluate((n) => getComputedStyle(n).outlineStyle), "solid");
  await input.fill("Quarterly report");
  await value("Quarterly report");
  assert.equal(await clear.isEnabled(), true);
  await input.evaluate((n) => n.setSelectionRange(0, 9));
  await page.keyboard.insertText("Annual");
  await value("Annual report");
  assert.equal(await input.evaluate((n) => n.selectionStart), 6);
  await page.keyboard.press("Enter");
  assert.equal(
    await page.getByTestId("search-submitted").textContent(),
    "Submitted: Annual report",
  );
  await page.keyboard.press("Escape");
  await value("");
  assert.equal(await input.evaluate((n) => n === document.activeElement), true);
  assert.equal(await clear.isVisible(), false);
  const edits = await page.getByTestId("search-edits").textContent();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByTestId("search-edits").textContent(), edits);

  await toggle("seed");
  await value("Quarterly report");
  await input.focus();
  await clear.click();
  await value("");
  assert.equal(await input.evaluate((n) => n === document.activeElement), true);
  await toggle("seed");
  await clear.focus();
  await page.keyboard.press("Space");
  await value("");
  await toggle("seed");
  await clear.focus();
  await page.keyboard.press("Enter");
  await value("");
  await toggle("seed");
  await input.focus();
  await page.keyboard.press("Tab");
  assert.equal(await clear.evaluate((n) => n === document.activeElement), true);

  await input.evaluate((n) => {
    const cancel = (e) => e.preventDefault();
    n.addEventListener("keydown", cancel, { capture: true, once: true });
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    n.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await value("Quarterly report");
  await clear.evaluate((n) => {
    n.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true });
    n.click();
  });
  await value("Quarterly report");
  await toggle("readonly");
  assert.equal(await input.evaluate((n) => n.readOnly), true);
  await input.focus();
  await page.keyboard.press("Escape");
  await page.keyboard.type("ignored");
  await clear.click();
  await value("Quarterly report");
  await toggle("readonly");
  await toggle("disable");
  assert.equal(await input.isDisabled(), true);
  assert.equal(await clear.isDisabled(), true);
  assert.equal(await group.getAttribute("data-disabled"), "");
  assert.equal(await group.evaluate((n) => getComputedStyle(n).opacity), "0.38");
  await clear.evaluate((n) => n.click());
  await value("Quarterly report");
  await toggle("disable");
  await toggle("invalid");
  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.equal(await input.getAttribute("aria-describedby"), "search-error");
  assert.equal(await page.getByTestId("search-error").textContent(), "Try a more specific search.");
  await toggle("invalid");
  await group.locator("svg").first().click();
  assert.equal(await input.evaluate((n) => n === document.activeElement), true);

  const retained = await input.elementHandle();
  await input.evaluate((n) => n.setSelectionRange(2, 7));
  await toggle("variant");
  assert.equal(await group.getAttribute("data-lenso-variant"), "secondary");
  assert.equal(
    await retained.evaluate((n) => n === document.getElementById("search-demo-input")),
    true,
  );
  assert.equal(await input.evaluate((n) => n.selectionStart), 2);
  await toggle("variant");
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      for (const full of [false, true]) {
        if (full) await toggle("full");
        for (const rtl of [false, true]) {
          if (rtl) await toggle("direction");
          const bounds = await group.evaluate((n) => {
            const r = n.getBoundingClientRect();
            const input = n.querySelector("input").getBoundingClientRect();
            return {
              width: r.width,
              left: r.left,
              right: r.right,
              inputWidth: input.width,
              doc: document.documentElement.scrollWidth,
            };
          });
          assert.ok(bounds.width <= (full ? width - 48 : 360) + 1);
          assert.ok(bounds.inputWidth > 100);
          assert.ok(bounds.left >= 0 && bounds.right <= width + 1);
          assert.ok(bounds.doc <= width, `no horizontal page overflow: ${bounds.doc}/${width}`);
          await group.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${engine}-search-${appearance}-${width}-${full ? "full" : "regular"}-${rtl ? "rtl" : "ltr"}.png`,
            ),
          });
          if (rtl) await toggle("direction");
        }
        if (full) await toggle("full");
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await input.focus();
  await page.keyboard.press("Escape");
  await value("");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await toggle("seed");
  const oldGroup = await group.elementHandle();
  const oldClear = await clear.elementHandle();
  const marker = engine === "webkit" ? "data-material-paints" : "data-material-filter";
  assert.equal(await group.evaluate((n, m) => n.hasAttribute(m), marker), true);
  await toggle("visible");
  assert.equal(await oldGroup.evaluate((n) => n.isConnected), false);
  assert.equal(await oldGroup.evaluate((n, m) => n.hasAttribute(m), marker), false);
  assert.equal(await oldGroup.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  await retained.evaluate((n) => {
    n.value = "Detached draft";
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
  });
  assert.equal(await retained.evaluate((n) => n.value), "Detached draft");
  await oldClear.evaluate((n) => n.click());
  assert.equal(await retained.evaluate((n) => n.value), "Detached draft");
  const restored = await page.evaluate(async () => {
    const { elementEnded, element } = await import(
      new URL("./modules/lenso-ui/web.js", document.baseURI)
    );
    const node = document.getElementById("search-quick-group");
    const handle = { hatch: "lenso-ui", element: node, data: node.dataset };
    const numeric = Array.from(
      document.querySelectorAll('[data-slot="number-field"],[data-slot="stepper"]'),
      (element) => ({
        hatch: "lenso-ui",
        element,
        data: element.dataset,
      }),
    );
    const method = () => document.documentElement.getAttribute("data-lenso-focus-method");
    const before = method();
    elementEnded(handle);
    const shared = method();
    for (const field of numeric) elementEnded(field);
    const last = method();
    for (const field of numeric) element(field);
    element(handle);
    return { before, shared, last };
  });
  assert.ok(restored.before, "input establishes the focus method");
  assert.equal(restored.shared, restored.before, "numeric controls retain the shared focus method");
  assert.equal(
    restored.last,
    null,
    "the last focus observer restores the original modality attribute",
  );
  await toggle("visible");
  await value("Quarterly report");
  await clear.click();
  await value("");
  await retained.dispose();
  await oldGroup.dispose();
  await oldClear.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
}
