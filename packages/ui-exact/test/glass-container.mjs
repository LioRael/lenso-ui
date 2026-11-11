import assert from "node:assert/strict";
import path from "node:path";

export async function checkGlassContainer(page, engine, { fallback = false, capture = true } = {}) {
  const root = page.getByTestId("fusion-demo");
  const first = page.getByTestId("fusion-first"),
    second = page.getByTestId("fusion-second");
  const surface = page.getByTestId("fusion-demo-fusion");
  const toggle = (name) => page.getByTestId(`fusion-${name}`).click();
  const warm = async (id = "fusion-demo") => {
    await page.getByTestId(id).scrollIntoViewIfNeeded();
    await page.waitForFunction((id) => {
      const root = document.getElementById(id),
        surface = document.getElementById(id + "-fusion");
      return (
        root &&
        surface &&
        !surface.hidden &&
        getComputedStyle(surface).visibility === "visible" &&
        surface.dataset.lensoFusionCompute
      );
    }, id);
  };
  const hidden = () =>
    page.waitForFunction(() => document.getElementById("fusion-demo-fusion").hidden);
  await warm();
  const compute = await surface.getAttribute("data-lenso-fusion-compute");
  const field = await surface.getAttribute("data-lenso-fusion-field");
  const workerCapable = await page.evaluate(
    () => typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined",
  );
  assert.equal(compute, !fallback && workerCapable ? "worker" : "main");
  assert.ok(["cpu", "gpu"].includes(field));
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), "");
  assert.equal(await second.getAttribute("data-lenso-glass-fused"), "");
  assert.equal(await surface.getAttribute("aria-hidden"), "true");
  const draft = page.getByTestId("fusion-draft");
  assert.deepEqual(
    await draft.evaluate((node) => {
      const r = node.getBoundingClientRect();
      return [r.width, r.height];
    }),
    [56, 28],
  );
  await draft.fill("Kept draft");
  await draft.evaluate((n) => n.setSelectionRange(2, 5));
  const original = await first.elementHandle(),
    editor = await draft.elementHandle();
  await page.getByTestId("fusion-disabled").evaluate((n) => n.click());
  await hidden();
  assert.equal(
    await root.getAttribute("data-disabled"),
    null,
    "fusion opt-out does not disable caller controls",
  );
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), null);
  assert.equal(await draft.inputValue(), "Kept draft");
  assert.deepEqual(await draft.evaluate((n) => [n.selectionStart, n.selectionEnd]), [2, 5]);
  assert.equal(
    await editor.evaluate((n) => n === document.querySelector('[data-testid="fusion-draft"]')),
    true,
  );
  let count = await page.getByTestId("fusion-actions").textContent();
  await page.getByTestId("fusion-action").evaluate((n) => n.click());
  assert.notEqual(await page.getByTestId("fusion-actions").textContent(), count);
  await toggle("disabled");
  await warm();
  if (fallback) {
    assert.equal(field, "cpu");
    await original.dispose();
    await editor.dispose();
    return { compute, field, workerCapable };
  }

  await toggle("spacing");
  await hidden();
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), null);
  await toggle("spacing");
  await warm();
  await toggle("negative");
  await hidden();
  await toggle("spacing");
  await warm();
  await root.evaluate((n) => n.style.setProperty("--lenso-glass-transparency", "0"));
  await hidden();
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), null);
  await root.evaluate((n) => n.style.removeProperty("--lenso-glass-transparency"));
  await warm();
  await root.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await hidden();
  await root.evaluate((n) => n.removeAttribute("data-contrast"));
  await warm();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await hidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await warm();
  await page.emulateMedia({ contrast: "more" });
  const contrast = await page.evaluate(() => matchMedia("(prefers-contrast: more)").matches);
  if (contrast) await hidden();
  await page.emulateMedia({ contrast: "no-preference" });
  await warm();
  await toggle("tint");
  await warm();
  assert.equal(
    await root.evaluate((n) => n.style.getPropertyValue("--lenso-exact-fusion-tint")),
    "rgb(100 80 180 / .25)",
  );
  await toggle("gap");
  await hidden();
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), null);
  await toggle("gap");
  await warm();
  await toggle("tint");
  await warm();
  await first.evaluate((n) => {
    n.classList.add("fusion-foreign");
    n.style.setProperty("--fusion-caller", "retained");
  });
  await page.evaluate(async () => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    const node = document.getElementById("fusion-first");
    createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
  });
  await warm();
  assert.equal(await original.evaluate((n) => n === document.getElementById("fusion-first")), true);
  assert.equal(await first.evaluate((n) => n.classList.contains("fusion-foreign")), true);
  assert.equal(
    await first.evaluate((n) => n.style.getPropertyValue("--fusion-caller")),
    "retained",
  );
  assert.deepEqual(
    await first.evaluate((n) => {
      const s = getComputedStyle(n);
      return [s.width, s.height, s.borderRadius];
    }),
    ["88px", "80px", "24px"],
  );
  const removed = await second.elementHandle();
  await toggle("member");
  await hidden();
  assert.equal(await removed.evaluate((n) => n.isConnected), false);
  assert.equal(await removed.evaluate((n) => n.hasAttribute("data-lenso-glass-fused")), false);
  await toggle("member");
  await warm();
  await removed.dispose();
  await toggle("nested");
  await warm("fusion-inner");
  await warm();
  assert.equal(await page.getByTestId("fusion-inner-a").getAttribute("data-lenso-glass-fused"), "");
  await toggle("disabled");
  await hidden();
  await warm("fusion-inner");
  assert.equal(await first.getAttribute("data-lenso-glass-fused"), null);
  assert.equal(await page.getByTestId("fusion-inner-a").getAttribute("data-lenso-glass-fused"), "");
  await toggle("disabled");
  await warm();
  await toggle("nested");
  await warm();
  await toggle("elastic");
  await warm();
  await page.getByTestId("fusion-action").hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(
      () =>
        parseFloat(
          document.getElementById("fusion-first").style.getPropertyValue("--lg-press-scale"),
        ) > 1,
    );
  } finally {
    await page.mouse.up();
  }
  await toggle("elastic");
  await warm();
  await page.getByTestId("fusion-action").hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(() =>
      document.getElementById("fusion-first").hasAttribute("data-lenso-light-pressed"),
    );
    assert.notEqual(await first.evaluate((n) => n.style.getPropertyValue("--lg-light-x")), "");
  } finally {
    await page.mouse.up();
  }
  const viewport = page.viewportSize(),
    theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
      for (const vertical of [false, true]) {
        if (vertical) await toggle("axis");
        for (const rtl of [false, true]) {
          if (rtl) await toggle("direction");
          await warm();
          const bounds = await root.evaluate((n) => {
            const r = n.getBoundingClientRect();
            return { left: r.left, right: r.right, doc: document.documentElement.scrollWidth };
          });
          assert.ok(bounds.left >= 0 && bounds.right <= width + 1 && bounds.doc <= width);
          if (
            capture === true ||
            (capture === "representative" &&
              !vertical &&
              ((width === 820 && appearance === "light" && !rtl) ||
                (width === 390 && appearance === "dark" && rtl)))
          )
            await root.screenshot({
              path: path.resolve(
                import.meta.dirname,
                `../.cache/example/${engine}-fusion-${appearance}-${width}-${vertical ? "vertical" : "horizontal"}-${rtl ? "rtl" : "ltr"}.png`,
              ),
            });
          if (rtl) await toggle("direction");
        }
        if (vertical) await toggle("axis");
      }
    }
  }
  await root.scrollIntoViewIfNeeded();
  const oldRoot = await root.elementHandle(),
    oldSurface = await surface.elementHandle();
  await page.getByTestId("fusion-visible").evaluate((n) => n.click());
  assert.equal(await oldRoot.evaluate((n) => n.isConnected), false);
  assert.equal(await original.evaluate((n) => n.hasAttribute("data-lenso-glass-fused")), false);
  assert.equal(await original.evaluate((n) => n.hasAttribute("data-lenso-light-pressed")), false);
  assert.equal(
    await oldSurface.evaluate((n) => n.hasAttribute("data-lenso-fusion-compute")),
    false,
  );
  assert.equal(
    await oldRoot.evaluate(
      (n) =>
        n.querySelectorAll(
          "[data-lenso-glass-outline],[data-lenso-glass-union-light],[data-lenso-glass-material-base]",
        ).length,
    ),
    0,
  );
  await oldRoot.evaluate((n) => n.style.setProperty("--lenso-glass-transparency", "0"));
  await toggle("visible");
  await warm();
  assert.equal(await draft.inputValue(), "Kept draft");
  await original.dispose();
  await editor.dispose();
  await oldRoot.dispose();
  await oldSurface.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
  return { compute, field, workerCapable, contrast };
}
