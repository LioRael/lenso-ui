import assert from "node:assert/strict";
import path from "node:path";

export async function checkToolbarFusion(page, engine, { capture = true } = {}) {
  const root = page.getByTestId("morph-group"),
    cut = page.getByTestId("morph-cut"),
    copy = page.getByTestId("morph-copy"),
    paste = page.getByTestId("morph-paste");
  const toggle = (name) => page.getByTestId(`morph-${name}`).click();
  const direct = (name) => page.getByTestId(`morph-${name}`).evaluate((n) => n.click());
  const warm = async () => {
    await root.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const surface = document.getElementById("morph-group-fusion");
      return (
        surface &&
        !surface.hidden &&
        getComputedStyle(surface).visibility === "visible" &&
        surface.dataset.lensoFusionCompute
      );
    });
  };
  const geometry = () =>
    root.evaluate((n) => {
      const vertical = n.dataset.orientation === "vertical";
      const r = n.getBoundingClientRect();
      const members = [...n.querySelectorAll(":scope > [data-toolbar-item]")]
        .map((x) => {
          const r = x.getBoundingClientRect(),
            s = getComputedStyle(x);
          return {
            id: x.id,
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            radii: [
              s.borderTopLeftRadius,
              s.borderTopRightRadius,
              s.borderBottomRightRadius,
              s.borderBottomLeftRadius,
            ].map(parseFloat),
            offset: x.style.getPropertyValue("--lenso-exact-toolbar-joined-offset"),
          };
        })
        .sort((a, b) => (vertical ? a.y - b.y : a.x - b.x));
      return {
        width: r.width,
        height: r.height,
        gaps: members
          .slice(1)
          .map((x, i) =>
            vertical ? x.y - members[i].y - members[i].h : x.x - members[i].x - members[i].w,
          ),
        members,
      };
    });
  const settled = async (detached) => {
    await page.waitForFunction((detached) => {
      const root = document.getElementById("morph-group"),
        vertical = root.dataset.orientation === "vertical",
        nodes = [...root.querySelectorAll(":scope > [data-toolbar-item]")]
          .map((n) => n.getBoundingClientRect())
          .sort((a, b) => (vertical ? a.y - b.y : a.x - b.x));
      return nodes
        .slice(1)
        .every(
          (r, i) =>
            Math.abs(
              (vertical ? r.top - nodes[i].bottom : r.left - nodes[i].right) - (detached ? 40 : 0),
            ) < 0.4,
        );
    }, detached);
  };
  const focused = async (n) =>
    assert.equal(await n.evaluate((n) => n === document.activeElement), true);
  const count = async () =>
    Number((await page.getByTestId("morph-actions").textContent()).split(": ")[1]);
  await warm();
  await settled(false);
  assert.equal(await root.getAttribute("data-lenso-kind"), "toolbar-fusion-group");
  assert.equal(await root.getAttribute("data-lenso-glass-group"), "");
  assert.equal(await root.getAttribute("data-toolbar-morph-ready"), "");
  assert.equal(await page.getByTestId("morph-toolbar").locator('[tabindex="0"]').count(), 1);
  const original = await cut.elementHandle();
  const edge = await root.locator("[data-lenso-glass-outline]").elementHandle();
  const joined = await geometry();
  assert.deepEqual(
    joined.members.map((x) => x.offset),
    ["40px", "0px", "-40px"],
  );
  assert.ok(joined.gaps.every((g) => Math.abs(g) < 0.4));
  await cut.focus();
  const trace = async (reverse) =>
    page.evaluate(async (reverse) => {
      const root = document.getElementById("morph-group"),
        first = document.getElementById("morph-cut"),
        edge = root.querySelector("[data-lenso-glass-outline]");
      const samples = [];
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      root.getBoundingClientRect();
      const start = performance.now();
      let reversed = false;
      document.querySelector('[data-testid="morph-split"]').click();
      while (performance.now() - start < 450) {
        await new Promise(requestAnimationFrame);
        const t = performance.now() - start;
        const nodes = [...root.querySelectorAll(":scope > [data-toolbar-item]")]
          .map((n) => n.getBoundingClientRect())
          .sort((a, b) => a.x - b.x);
        const r = root.getBoundingClientRect();
        const gap = nodes[1].left - nodes[0].right;
        if (reverse && !reversed && t >= 80 && gap > 1 && gap < 39) {
          document.querySelector('[data-testid="morph-split"]').click();
          reversed = true;
        }
        samples.push({
          t,
          gap,
          width: r.width,
          edge: edge.isConnected && root.querySelector("[data-lenso-glass-outline]") === edge,
          focus: document.activeElement === first,
        });
      }
      return samples;
    }, reverse);
  const out = await trace(false);
  await settled(true);
  await warm();
  assert.ok(
    out.some((x) => x.gap > 1 && x.gap < 39),
    "separation has intermediate geometry",
  );
  assert.ok(
    out.every((x) => x.edge && x.focus),
    "field and focused control survive separation",
  );
  assert.ok(out.every((x) => Math.abs(x.width - joined.width) < 0.5));
  assert.equal(await edge.evaluate((n) => n.isConnected), true);
  assert.equal(await original.evaluate((n) => n === document.getElementById("morph-cut")), true);
  await focused(cut);
  await direct("split");
  await settled(false);
  const reversal = await trace(true);
  await settled(false);
  assert.ok(reversal.some((x) => x.gap > 1 && x.gap < 39));
  assert.ok(reversal.every((x) => x.edge && x.focus));
  assert.equal(await edge.evaluate((n) => n.isConnected), true);
  await page.keyboard.press("ArrowRight");
  await focused(copy);
  await page.keyboard.press("End");
  await focused(paste);
  await page.keyboard.press("Home");
  await focused(cut);
  let before = await count();
  await cut.hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(
      () =>
        parseFloat(
          document.getElementById("morph-group").style.getPropertyValue("--toolbar-press-scale"),
        ) > 1,
    );
    assert.equal(await cut.getAttribute("data-lenso-pressed"), null);
  } finally {
    await page.mouse.up();
  }
  assert.equal(await count(), before + 1);
  await direct("split");
  await settled(true);
  await warm();
  before = await count();
  await cut.hover();
  await page.mouse.down();
  try {
    await page.waitForFunction(
      () =>
        parseFloat(
          document.getElementById("morph-cut").style.getPropertyValue("--lg-press-scale"),
        ) > 1,
    );
    assert.equal(await root.getAttribute("data-lenso-pressed"), null);
  } finally {
    await page.mouse.up();
  }
  assert.equal(await count(), before + 1);
  await direct("split");
  await settled(false);
  await toggle("elastic");
  await cut.hover();
  await page.mouse.down();
  try {
    assert.equal(await root.getAttribute("data-lenso-pressed"), null);
    await page.waitForFunction(() =>
      document.getElementById("morph-cut").hasAttribute("data-lenso-light-pressed"),
    );
  } finally {
    await page.mouse.up();
  }
  await toggle("elastic");
  await toggle("loading");
  before = await count();
  await cut.focus();
  await page.keyboard.press("Space");
  await cut.evaluate((n) => n.click());
  assert.equal(await count(), before);
  await toggle("loading");
  await toggle("disabled");
  assert.equal(await copy.isDisabled(), true);
  before = await count();
  await copy.evaluate((n) => n.click());
  assert.equal(await count(), before);
  await toggle("disabled");
  await warm();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const viewport = page.viewportSize(),
    theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const frames = [];
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
          await settled(false);
          await warm();
          const base = await geometry();
          for (const detached of [false, true]) {
            if (detached) await toggle("split");
            await settled(detached);
            await warm();
            const view = await geometry();
            assert.ok(view.gaps.every((x) => Math.abs(x - (detached ? 40 : 0)) < 0.4));
            assert.ok(
              Math.abs(view.width - base.width) < 0.4 && Math.abs(view.height - base.height) < 0.4,
            );
            assert.equal(
              await original.evaluate((n) => n === document.getElementById("morph-cut")),
              true,
            );
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
                  `../.cache/example/${engine}-morph-${appearance}-${width}-${vertical ? "vertical" : "horizontal"}-${rtl ? "rtl" : "ltr"}-${detached ? "detached" : "joined"}.png`,
                ),
              });
            frames.push({ width, appearance, vertical, rtl, detached, ...view });
            if (detached) await toggle("split");
          }
          if (rtl) await toggle("direction");
        }
        if (vertical) await toggle("axis");
      }
    }
  }
  await page.evaluate(() => (document.documentElement.dir = "rtl"));
  await settled(false);
  assert.ok((await geometry()).gaps.every((x) => Math.abs(x) < 0.4));
  await toggle("direction");
  await page.evaluate(() => (document.documentElement.dir = "ltr"));
  await settled(false);
  assert.ok((await geometry()).gaps.every((x) => Math.abs(x) < 0.4));
  await toggle("direction");
  await page.evaluate(() => document.documentElement.removeAttribute("dir"));
  for (const size of ["lg", "sm", "md"]) {
    await toggle("size");
    await settled(false);
    await warm();
    assert.equal(await cut.getAttribute("data-lenso-size"), size);
  }
  await toggle("attached");
  await settled(false);
  await warm();
  assert.equal(await cut.getAttribute("data-lenso-surface"), "false");
  assert.equal(await page.getByTestId("morph-toolbar").getAttribute("data-attached"), "");
  await toggle("split");
  await settled(true);
  await toggle("split");
  await settled(false);
  await toggle("attached");
  await root.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() => document.getElementById("morph-group-fusion").hidden);
  assert.equal(await copy.getAttribute("data-lenso-glass-fused"), null);
  await root.evaluate((n) => n.removeAttribute("data-contrast"));
  await warm();
  await paste.focus();
  await direct("third");
  await warm();
  assert.equal(await paste.count(), 0);
  assert.equal(await page.getByTestId("morph-toolbar").locator('[tabindex="0"]').count(), 1);
  assert.deepEqual(
    (await geometry()).members.map((x) => x.offset),
    ["20px", "-20px"],
  );
  await toggle("third");
  await warm();
  await copy.focus();
  await direct("mode");
  assert.equal(await root.getAttribute("data-lenso-kind"), "toolbar-group");
  assert.equal(await root.getAttribute("data-toolbar-morph-ready"), null);
  assert.equal(
    await cut.evaluate((n) => n.style.getPropertyValue("--lenso-exact-toolbar-joined-offset")),
    "",
  );
  await focused(copy);
  await direct("mode");
  await warm();
  await settled(false);
  await focused(copy);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await cut.hover();
  await page.mouse.down();
  const oldRoot = await root.elementHandle();
  const removed = await cut.elementHandle();
  try {
    await direct("visible");
    assert.equal(await oldRoot.evaluate((n) => n.isConnected), false);
    assert.equal(await removed.evaluate((n) => n.hasAttribute("data-lenso-glass-fused")), false);
    assert.equal(
      await removed.evaluate((n) =>
        n.style.getPropertyValue("--lenso-exact-toolbar-joined-offset"),
      ),
      "",
    );
    assert.equal(await oldRoot.evaluate((n) => n.hasAttribute("data-toolbar-morph-ready")), false);
  } finally {
    await page.mouse.up();
  }
  await toggle("visible");
  await warm();
  await settled(false);
  await cut.focus();
  await page.keyboard.press("ArrowRight");
  await focused(copy);
  const backend = await page
    .getByTestId("morph-group-fusion")
    .getAttribute("data-lenso-fusion-compute");
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-toolbar-fusion-frames.json`),
    JSON.stringify({ out, reversal, endpoints: frames, backend }, null, 2) + "\n",
  );
  await original.dispose();
  await edge.dispose();
  await oldRoot.dispose();
  await removed.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, v) => n.setAttribute("data-theme", v), theme);
  await page.setViewportSize(viewport);
  return {
    backend,
    transitionFrames: out.length,
    reversalFrames: reversal.length,
    endpoints: frames.length,
  };
}
