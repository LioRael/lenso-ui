import assert from "node:assert/strict";
import path from "node:path";
const settle = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const focused = async (node) =>
  assert.equal(await node.evaluate((n) => document.activeElement === n), true);
const atRest = (page, minimized) =>
  page.waitForFunction(
    (min) =>
      Number(
        document
          .getElementById("app-navigation-main")
          ?.style.getPropertyValue("--tab-bar-collapse"),
      ) === (min ? 1 : 0),
    minimized,
  );
const center = async (node) => {
  const r = await node.boundingBox();
  assert.ok(r);
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
const indicatorAtCurrent = (page) =>
  page.waitForFunction(() => {
    const group = document.getElementById("app-navigation-main"),
      item = group?.querySelector("[data-current]"),
      indicator = group?.querySelector('[data-slot="tab-bar-indicator"]');
    if (!item || !indicator || !group.hasAttribute("data-indicator-ready")) return false;
    const a = item.getBoundingClientRect(),
      b = indicator.getBoundingClientRect(),
      inset = group.dataset.layout === "tablet" ? 4 : 0;
    return (
      Math.abs(a.x - b.x) < 1 &&
      Math.abs(a.y + inset - b.y) < 1 &&
      Math.abs(a.width - b.width) < 1 &&
      Math.abs(a.height - inset * 2 - b.height) < 1
    );
  });
export async function checkTabBar(page, engine) {
  const nav = page.getByTestId("app-navigation"),
    main = page.getByTestId("app-navigation-main"),
    list = page.getByTestId("app-navigation-main-list"),
    home = page.getByTestId("tab-bar-home"),
    library = page.getByTestId("tab-bar-library"),
    saved = page.getByTestId("tab-bar-saved"),
    add = page.getByTestId("tab-bar-add"),
    search = page.getByTestId("tab-bar-search");
  assert.equal(await nav.getAttribute("role"), "navigation");
  assert.equal(await nav.getAttribute("aria-label"), "Application destinations");
  assert.equal(await nav.getByRole("tab").count(), 0);
  assert.equal(await nav.getByRole("link").count(), 3);
  assert.equal(await list.getByRole("listitem").count(), 4);
  assert.equal(await home.getAttribute("href"), "#tab-bar-destination-home");
  assert.equal(await home.getAttribute("aria-current"), "page");
  await nav.scrollIntoViewIfNeeded();
  await indicatorAtCurrent(page);
  await home.focus();
  await page.keyboard.press("Tab");
  await focused(library);
  await page.keyboard.press("Enter");
  await page.waitForURL(/#tab-bar-destination-library$/);
  assert.equal(await page.getByTestId("tab-bar-value").textContent(), "library,雪");
  await indicatorAtCurrent(page);
  await add.click();
  assert.equal(await page.getByTestId("tab-bar-actions").textContent(), "1");
  assert.equal(await page.getByTestId("tab-bar-value").textContent(), "library,雪");
  await search.click();
  assert.equal(await page.getByTestId("tab-bar-actions").textContent(), "2");
  await page.getByTestId("tab-bar-disabled").click();
  assert.equal(await library.getAttribute("href"), null);
  assert.equal(await library.getAttribute("tabindex"), "-1");
  const requests = Number(await page.getByTestId("tab-bar-activations").textContent());
  await library.evaluate((n) => n.click());
  assert.equal(Number(await page.getByTestId("tab-bar-activations").textContent()), requests);
  await home.focus();
  await page.keyboard.press("Tab");
  await focused(saved);
  await page.getByTestId("tab-bar-disabled").click();
  await page.getByTestId("tab-bar-reject").click();
  await saved.click();
  await page.waitForURL(/#tab-bar-destination-saved$/);
  assert.equal(await page.getByTestId("tab-bar-value").textContent(), "library,雪");
  await indicatorAtCurrent(page);
  await page.getByTestId("tab-bar-reject").click();
  // The adapted source must arbitrate before Exact's document router, with one activation on release.
  await home.click();
  await nav.scrollIntoViewIfNeeded();
  await indicatorAtCurrent(page);
  const count = Number(await page.getByTestId("tab-bar-activations").textContent()),
    a = await center(home),
    b = await center(saved);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await page.mouse.up();
  await settle(page);
  assert.equal(await page.getByTestId("tab-bar-value").textContent(), "saved");
  assert.equal(Number(await page.getByTestId("tab-bar-activations").textContent()), count + 1);
  await indicatorAtCurrent(page);
  assert.equal(
    await main
      .locator(
        '[data-slot="tab-bar-highlight"] a,[data-slot="tab-bar-highlight"] button,[data-slot="tab-bar-highlight"] input',
      )
      .count(),
    0,
  );
  assert.equal(
    await page.evaluate(() => {
      const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
      return new Set(ids).size === ids.length;
    }),
    true,
    "decorative copies rewrite IDs",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await saved.focus();
  await page.getByTestId("tab-bar-minimize").evaluate((n) => n.click());
  await atRest(page, true);
  const expand = page.getByTestId("app-navigation-main-expand");
  await focused(expand);
  assert.equal(await list.getAttribute("inert"), "");
  assert.equal(await list.getAttribute("aria-hidden"), "true");
  assert.equal(await nav.getByRole("link").count(), 0);
  assert.equal(await search.isVisible(), true);
  await page.getByTestId("tab-bar-reject").evaluate((n) => n.click());
  await expand.focus();
  await page.keyboard.press("Enter");
  assert.equal(await main.getAttribute("data-minimized"), "");
  await focused(expand);
  await page.getByTestId("tab-bar-reject").evaluate((n) => n.click());
  await page.keyboard.press("Enter");
  await atRest(page, false);
  await focused(saved);
  assert.equal(await list.getAttribute("inert"), null);
  await indicatorAtCurrent(page);
  // Mid-flight reversal keeps the same spring rather than jumping to either endpoint.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const { before, after } = await page.evaluate(async () => {
    const group = document.getElementById("app-navigation-main"),
      button = document.querySelector('[data-testid="tab-bar-minimize"]');
    button.click();
    return await new Promise((resolve, reject) => {
      let frames = 0;
      const sample = () => {
        const before = Number(group.style.getPropertyValue("--tab-bar-collapse"));
        if (before > 0.05 && before < 0.95) {
          button.click();
          queueMicrotask(() =>
            queueMicrotask(() =>
              resolve({
                before,
                after: Number(group.style.getPropertyValue("--tab-bar-collapse")),
              }),
            ),
          );
        } else if (++frames < 120) requestAnimationFrame(sample);
        else reject(new Error("TabBar reversal did not expose an intermediate spring position"));
      };
      requestAnimationFrame(sample);
    });
  });
  assert.ok(
    before > 0 && before < 1 && Math.abs(after - before) < 0.001,
    JSON.stringify({ before, after }),
  );
  await atRest(page, false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const port = page.getByTestId("tab-bar-scrollport");
  await page.getByTestId("tab-bar-scroll").click();
  await port.evaluate((n) => (n.scrollTop = 5));
  await settle(page);
  assert.equal(await main.getAttribute("data-minimized"), null);
  await port.evaluate((n) => (n.scrollTop = 30));
  await atRest(page, true);
  await port.evaluate((n) => (n.scrollTop = 10));
  await atRest(page, false);
  await port.evaluate((n) => (n.scrollTop = 60));
  await atRest(page, true);
  await port.evaluate((n) => (n.scrollTop = 0));
  await atRest(page, false);
  await page.getByTestId("tab-bar-scroll").click();
  await port.evaluate((n) => (n.scrollTop = 60));
  await settle(page);
  assert.equal(await main.getAttribute("data-minimized"), null);
  await port.evaluate((n) => (n.scrollTop = 30));
  await atRest(page, true);
  await port.evaluate((n) => (n.scrollTop = 80));
  await atRest(page, false);
  await page.getByTestId("tab-bar-scroll").click();
  await page.getByTestId("tab-bar-layout").click();
  await indicatorAtCurrent(page);
  assert.equal(await nav.getAttribute("data-layout"), "tablet");
  await page.getByTestId("tab-bar-direction").click();
  assert.equal(await nav.evaluate((n) => getComputedStyle(n).direction), "rtl");
  await library.click();
  await indicatorAtCurrent(page);
  assert.equal(await page.getByTestId("tab-bar-value").textContent(), "library,雪");
  await page.getByTestId("tab-bar-direction").click();
  const retired = await main.elementHandle();
  await page.getByTestId("tab-bar-mounted").click();
  assert.equal(await retired.getAttribute("data-indicator-ready"), null);
  assert.equal(await retired.getAttribute("data-minimize-ready"), null);
  await retired.dispose();
  await page.getByTestId("tab-bar-mounted").click();
  await indicatorAtCurrent(page);
  const captures = [];
  for (const layout of ["phone", "tablet"])
    for (const min of [false, true])
      for (const theme of ["light", "dark"])
        for (const width of [390, 820]) {
          await page.setViewportSize({ width, height: 900 });
          if ((await nav.getAttribute("data-layout")) !== layout)
            await page.getByTestId("tab-bar-layout").click();
          if (main && ((await main.getAttribute("data-minimized")) !== null) !== min)
            await page.getByTestId("tab-bar-minimize").click();
          await atRest(page, min);
          if (!(await page.locator(`[data-theme="${theme}"]`).count()))
            await page.getByTestId("theme").click();
          await nav.scrollIntoViewIfNeeded();
          await page.getByTestId("tab-bar-after").focus();
          await page.mouse.move(0, 0);
          await settle(page);
          if (!min) await indicatorAtCurrent(page);
          const geometry = await nav.evaluate((n) => {
            const r = n.getBoundingClientRect();
            return {
              width: r.width,
              viewport: innerWidth,
              x: r.x,
              right: r.right,
              groups: [...n.querySelectorAll("[data-tab-bar-group]")].map((g) => {
                const r = g.getBoundingClientRect();
                return {
                  id: g.id,
                  width: r.width,
                  height: r.height,
                  layout: g.dataset.layout,
                  minimized: g.hasAttribute("data-minimized"),
                  inert: g.querySelector("[data-tab-bar-list]").inert,
                };
              }),
            };
          });
          assert.ok(geometry.x >= 0 && geometry.right <= geometry.viewport + 1);
          for (const g of geometry.groups) {
            assert.ok(Math.abs(g.height - (min || layout === "tablet" ? 44 : 54)) < 1);
            if (min) assert.ok(Math.abs(g.width - 44) < 1);
            assert.equal(g.inert, min && g.id === "app-navigation-main");
          }
          const file = path.join(
            process.env.LENSO_EXACT_TEST_ARTIFACTS,
            `${engine}-${layout}-${min ? "minimized" : "expanded"}-${theme}-${width}.png`,
          );
          await page.getByTestId("tab-bar-stage").screenshot({ path: file });
          captures.push({ layout, min, theme, width, file, geometry });
        }
  return {
    captures,
    nativeNavigation: true,
    opaqueKeys: true,
    dragSingleActivation: true,
    minimizeFocus: true,
    scrollMinimize: true,
    springReversal: { before, after },
  };
}
export async function checkTabBarTouch(browser, url, engine) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(url);
    await page.waitForFunction(() =>
      document.getElementById("app-navigation-main")?.hasAttribute("data-indicator-ready"),
    );
    await page.getByTestId("tab-bar-library").tap();
    await page.waitForURL(/#tab-bar-destination-library$/);
    assert.equal(await page.getByTestId("tab-bar-value").textContent(), "library,雪");
    await page.getByTestId("tab-bar-search").tap();
    assert.equal(await page.getByTestId("tab-bar-actions").textContent(), "1");
    await page.getByTestId("tab-bar-minimize").tap();
    await atRest(page, true);
    await page.getByTestId("app-navigation-main-expand").tap();
    await atRest(page, false);
    await indicatorAtCurrent(page);
    let drag = false;
    if (engine === "chromium") {
      await page.getByTestId("app-navigation").scrollIntoViewIfNeeded();
      const from = await center(page.getByTestId("tab-bar-home")),
        to = await center(page.getByTestId("tab-bar-saved")),
        count = Number(await page.getByTestId("tab-bar-activations").textContent()),
        client = await context.newCDPSession(page);
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: from.x, y: from.y, id: 1 }],
      });
      for (let step = 1; step <= 12; step++)
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: from.x + ((to.x - from.x) * step) / 12, y: from.y, id: 1 }],
        });
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await settle(page);
      assert.equal(await page.getByTestId("tab-bar-value").textContent(), "saved");
      assert.equal(Number(await page.getByTestId("tab-bar-activations").textContent()), count + 1);
      drag = true;
    }
    assert.deepEqual(errors, []);
    return { nativeTap: true, nativeTouchDrag: drag, errors };
  } finally {
    await context.close();
  }
}
