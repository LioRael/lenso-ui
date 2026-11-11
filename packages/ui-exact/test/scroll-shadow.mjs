import assert from "node:assert/strict";
import path from "node:path";

// Let WebKit process a native scrolling frame between keydown and keyup.
const pressScrollArrow = (page, key = "ArrowDown") => page.keyboard.press(key, { delay: 50 });

export async function checkScrollShadowHorizontalKeyboard(page) {
  const root = page.getByTestId("shadow-sample");
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.getElementById("shadow-sample").getAttribute("data-right-scroll") === "true",
  );
  const rtl = await root.evaluate((n) => getComputedStyle(n).direction === "rtl");
  await page.bringToFront();
  await root.focus();
  await pressScrollArrow(page, rtl ? "ArrowLeft" : "ArrowRight");
  await page.waitForFunction(
    () => Math.abs(document.getElementById("shadow-sample").scrollLeft) > 0,
  );
  await root.evaluate(
    (n) =>
      new Promise((resolve) => {
        let previous = n.scrollLeft,
          stable = 0;
        const deadline = performance.now() + 1500;
        const sample = () => {
          const next = n.scrollLeft;
          stable = next === previous ? stable + 1 : 0;
          previous = next;
          if (stable >= 8 || performance.now() >= deadline) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
  const offset = await root.evaluate((n) => n.scrollLeft);
  assert.ok(rtl ? offset < 0 : offset > 0);
  await root.evaluate((n) => (n.scrollLeft = 0));
  await page.waitForFunction(
    () => document.getElementById("shadow-sample").getAttribute("data-right-scroll") === "true",
  );
  return { direction: rtl ? "rtl" : "ltr", offset, qualified: true };
}

// Programmatic scrolling in the main fixture must not warm up this first-entry gate.
export async function checkScrollShadowColdKeyboard(page) {
  const root = page.getByTestId("shadow-sample");
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.getElementById("shadow-sample").getAttribute("data-bottom-scroll") === "true",
  );
  assert.equal(await root.evaluate((n) => n.scrollTop), 0);
  await page.bringToFront();
  await root.focus();
  await pressScrollArrow(page);
  await page.waitForFunction(() => document.getElementById("shadow-sample").scrollTop > 0);
  await root.evaluate(
    (n) =>
      new Promise((resolve) => {
        let previous = n.scrollTop,
          stable = 0;
        const deadline = performance.now() + 1500;
        const sample = () => {
          const next = n.scrollTop;
          stable = next === previous ? stable + 1 : 0;
          previous = next;
          if (stable >= 8 || performance.now() >= deadline) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
  const offset = await root.evaluate((n) => n.scrollTop);
  await root.evaluate((n) => (n.scrollTop = 0));
  await page.waitForFunction(
    () => document.getElementById("shadow-sample").getAttribute("data-bottom-scroll") === "true",
  );
  return { offset, qualified: offset > 0 };
}

// Scrolling, content changes and caller styles share one Exact-owned viewport.
// Diagnostic callers can collect a native HTML comparison; canonical checks require keyboard scrolling.
export async function checkScrollShadow(page, engine, { keyboard = true } = {}) {
  const viewport = page.viewportSize(),
    theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const root = page.getByTestId("shadow-sample"),
    toggle = (name) => page.getByTestId(`shadow-${name}`).click();
  const style = (property) =>
    root.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), property);
  const reports = () => page.getByTestId("shadow-reports").textContent();
  const edges = async (label) => {
    await page.waitForFunction(
      (label) =>
        document.querySelector('[data-testid="shadow-edges"]').textContent === `Edges: ${label}`,
      label,
    );
  };
  const frames = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  const scroll = async (position) => {
    await root.evaluate((n, position) => {
      if (n.dataset.orientation === "vertical") n.scrollTop = position;
      else n.scrollLeft = getComputedStyle(n).direction === "rtl" ? -position : position;
    }, position);
  };
  await root.scrollIntoViewIfNeeded();
  await edges("bottom");
  assert.equal(await page.getByRole("region", { name: "Saved entries", exact: true }).count(), 1);
  assert.equal(await style("border-radius"), "8px");
  assert.equal((await root.boundingBox()).height, 160);
  assert.equal(
    await root.locator('[data-slot="scroll-shadow-report"]').evaluate((n) => n.form),
    null,
  );
  const draft = page.getByTestId("shadow-draft");
  await draft.fill("Edited scroll draft");
  await draft.evaluate((n) => n.setSelectionRange(2, 7));
  const original = await draft.elementHandle();
  await scroll(100);
  await edges("both");
  assert.equal(await root.getAttribute("data-top-bottom-scroll"), "true");
  assert.equal(await draft.inputValue(), "Edited scroll draft");
  assert.deepEqual(await draft.evaluate((n) => [n.selectionStart, n.selectionEnd]), [2, 7]);
  assert.equal(await draft.evaluate((n, old) => n === old, original), true);
  const middleReports = await reports();
  await scroll(120);
  await frames();
  assert.equal(await reports(), middleReports);
  await root.evaluate((n) => (n.scrollTop = n.scrollHeight));
  await edges("top");
  assert.equal(await root.getAttribute("data-top-scroll"), "true");
  await scroll(0);
  await edges("bottom");
  let keyboardEvidence = { qualified: true };
  if (keyboard) {
    await page.bringToFront();
    await root.scrollIntoViewIfNeeded();
    await root.focus();
    await pressScrollArrow(page);
    await page.waitForFunction(() => document.getElementById("shadow-sample").scrollTop > 0);
    await edges("both");
    await root.evaluate(
      (n) =>
        new Promise((resolve) => {
          let previous = n.scrollTop,
            stable = 0;
          const deadline = performance.now() + 1500;
          const sample = () => {
            const next = n.scrollTop;
            stable = next === previous ? stable + 1 : 0;
            previous = next;
            if (stable >= 8 || performance.now() >= deadline) resolve();
            else requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }),
    );
    await scroll(0);
    await edges("bottom");
  } else {
    keyboardEvidence = await probeScrollShadowKeyboard(page);
    await scroll(0);
    await edges("bottom");
  }
  await toggle("few");
  await edges("none");
  assert.equal(await style("mask-image"), "none");
  await toggle("tall");
  await page.waitForFunction(() => {
    const n = document.getElementById("shadow-sample");
    return n.scrollHeight > n.clientHeight && getComputedStyle(n).maskImage !== "none";
  });
  await toggle("tall");
  await edges("none");
  await toggle("empty");
  await edges("none");
  const text = await page.locator("#shadow-text-content").elementHandle();
  await toggle("text");
  await edges("bottom");
  assert.equal(
    await page.locator("#shadow-text-content").evaluate((n, old) => n === old, text),
    true,
  );
  await toggle("text");
  await edges("none");
  await text.dispose();
  await toggle("many");
  await edges("bottom");
  await toggle("offset");
  await scroll(10);
  await edges("bottom");
  await scroll(25);
  await edges("both");
  assert.equal((await style("--scroll-shadow-offset")).trim(), "20px");
  const retainedScroll = await root.evaluate((n) => n.scrollTop);
  await toggle("offset");
  assert.equal(await root.evaluate((n) => n.scrollTop), retainedScroll);
  await toggle("size");
  assert.equal(await root.evaluate((n) => n.scrollTop), retainedScroll);
  assert.equal((await style("--scroll-shadow-size")).trim(), "24px");
  await toggle("size");
  await scroll(0);
  await edges("bottom");
  const autoReports = await reports();
  await toggle("both");
  assert.equal(await root.getAttribute("data-scroll-shadow-mode"), "manual");
  assert.equal((await style("--scroll-shadow-before")).trim(), "40px");
  assert.equal((await style("--scroll-shadow-after")).trim(), "40px");
  await toggle("enabled");
  assert.equal((await style("--scroll-shadow-before")).trim(), "40px");
  await toggle("before");
  assert.equal((await style("--scroll-shadow-after")).trim(), "0px");
  await toggle("after");
  assert.equal((await style("--scroll-shadow-before")).trim(), "0px");
  await toggle("wrong");
  assert.equal(await style("mask-image"), "none");
  await toggle("none");
  assert.equal(await style("mask-image"), "none");
  await scroll(100);
  await frames();
  assert.equal(await reports(), autoReports);
  await toggle("auto");
  assert.equal(await style("mask-image"), "none");
  await toggle("enabled");
  await edges("both");
  await toggle("orientation");
  await scroll(0);
  await edges("right");
  if (keyboard) keyboardEvidence.horizontalLtr = await checkScrollShadowHorizontalKeyboard(page);
  assert.match(await style("mask-image"), /90deg/);
  await page.evaluate(() => (document.documentElement.dir = "rtl"));
  assert.match(await style("mask-image"), /90deg/);
  await page.evaluate(() => document.documentElement.removeAttribute("dir"));
  await scroll(100);
  await edges("both");
  await root.evaluate((n) => (n.scrollLeft = n.scrollWidth));
  await edges("left");
  await toggle("direction");
  await scroll(0);
  await edges("right");
  if (keyboard) keyboardEvidence.horizontalRtl = await checkScrollShadowHorizontalKeyboard(page);
  assert.match(await style("mask-image"), /270deg/);
  await scroll(100);
  await edges("both");
  await root.evaluate((n) => (n.scrollLeft = -n.scrollWidth));
  await edges("left");
  await toggle("bar");
  assert.equal(await style("scrollbar-width"), "none");
  assert.equal((await style("--scroll-shadow-scrollbar-size")).trim(), "0px");
  await toggle("bar");
  await root.evaluate(async (node) => {
    node.classList.add("caller-owned-scroll-marker");
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { scrollFallbackRule } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    createWebHatch([scrollFallbackRule]).element({
      hatch: "lenso-ui",
      element: node,
      data: node.dataset,
    });
  });
  await scroll(0);
  await edges("right");
  assert.equal(await style("border-radius"), "13px");
  assert.equal(await style("animation-name"), "none");
  assert.equal((await style("--scroll-shadow-before")).trim(), "0px");
  assert.equal((await style("--scroll-shadow-after")).trim(), "40px");
  await scroll(10);
  await edges("both");
  assert.equal((await style("--scroll-shadow-before")).trim(), "40px");
  assert.equal(await style("border-radius"), "13px");
  assert.equal(
    await root.evaluate((n) => n.classList.contains("caller-owned-scroll-marker")),
    true,
  );
  await root.evaluate(async (node) => {
    const { createWebHatch } = await import(new URL("./modules/lenso-ui/web.js", document.baseURI));
    const { styleRules } = await import(
      new URL("./modules/style-config/index.js", document.baseURI)
    );
    createWebHatch(styleRules).element({ hatch: "lenso-ui", element: node, data: node.dataset });
  });
  assert.equal(await style("border-radius"), "8px");
  for (const orientation of ["horizontal", "vertical"]) {
    if (orientation === "vertical") await toggle("orientation");
    for (const direction of ["ltr", "rtl"]) {
      if ((await style("direction")) !== direction) await toggle("direction");
      for (const appearance of ["light", "dark"]) {
        await page
          .locator("[data-theme]")
          .first()
          .evaluate((n, v) => n.setAttribute("data-theme", v), appearance);
        for (const width of [390, 820]) {
          await page.setViewportSize({ width, height: 844 });
          await root.scrollIntoViewIfNeeded();
          await scroll(100);
          await edges("both");
          assert.ok(
            (await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 1,
            "horizontal content must scroll inside the viewport, not widen the page",
          );
          const bounds = await root.boundingBox();
          assert.ok(
            bounds.x >= -1 && bounds.x + bounds.width <= width + 1,
            "the native scroll viewport must stay inside the page",
          );
          await root.screenshot({
            path: path.resolve(
              import.meta.dirname,
              `../.cache/example/${engine}-scroll-shadow-${orientation}-${direction}-${appearance}-${width}.png`,
            ),
          });
        }
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await scroll(0);
  await edges("bottom");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const old = await root.elementHandle();
  await toggle("visible");
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  assert.equal(
    await old.evaluate((n) => n.style.getPropertyValue("--lenso-exact-scroll-size")),
    "",
  );
  const finalReports = await reports();
  await old.evaluate((n) => n.dispatchEvent(new Event("scroll")));
  await frames();
  assert.equal(await reports(), finalReports);
  await toggle("visible");
  await edges("bottom");
  assert.equal(await page.getByTestId("shadow-draft").inputValue(), "Edited scroll draft");
  await old.dispose();
  await original.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
  return {
    nativeTimeline: await page.evaluate(() => CSS.supports("animation-timeline", "scroll(self)")),
    observerFallback: true,
    keyboard: keyboardEvidence,
  };
}

export async function probeScrollShadowKeyboard(page) {
  const root = page.getByTestId("shadow-sample");
  const settled = () => page.waitForTimeout(400);
  await page.bringToFront();
  await root.scrollIntoViewIfNeeded();
  await root.evaluate((n) => {
    n.scrollTop = 0;
    n.focus();
  });
  await pressScrollArrow(page);
  await settled();
  const exact = await root.evaluate((n) => n.scrollTop);
  await root.evaluate((n) => {
    const clone = n.cloneNode(true);
    for (const node of [clone, ...clone.querySelectorAll("*")])
      for (const name of node.getAttributeNames())
        if (name === "id" || name.startsWith("data-")) node.removeAttribute(name);
    clone.id = "scroll-keyboard-reference";
    n.after(clone);
    clone.scrollTop = 0;
    clone.scrollIntoView({ block: "center" });
    clone.focus();
  });
  let reference;
  try {
    await pressScrollArrow(page);
    await settled();
    reference = await page.locator("#scroll-keyboard-reference").evaluate((n) => n.scrollTop);
  } finally {
    await page.locator("#scroll-keyboard-reference").evaluate((n) => n.remove());
  }
  return {
    exact,
    reference,
    referenceQualified: reference > 0,
    qualified: exact > 0 && reference > 0,
  };
}
