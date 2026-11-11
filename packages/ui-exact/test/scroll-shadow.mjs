import assert from "node:assert/strict";
import path from "node:path";

// Scrolling, content changes and caller styles share one Exact-owned viewport.
export async function checkScrollShadow(page, engine) {
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
  await root.focus();
  await page.keyboard.press("ArrowDown");
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
  assert.equal((await style("--scroll-shadow-before")).trim(), "0px");
  assert.equal((await style("--scroll-shadow-after")).trim(), "40px");
  await scroll(100);
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
  };
}
