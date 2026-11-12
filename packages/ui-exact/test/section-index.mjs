import assert from "node:assert/strict";
import path from "node:path";
const settle = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const focused = async (node) =>
  assert.equal(await node.evaluate((n) => document.activeElement === n), true);
const selected = (nav) => nav.locator('[aria-current="location"]').getAttribute("data-lenso-value");
const center = async (node) => {
  const r = await node.boundingBox();
  assert.ok(r);
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
export async function checkSectionIndex(page, engine) {
  const nav = page.getByTestId("section-navigation"),
    local = page.getByTestId("section-local"),
    row = (i) => page.getByTestId(`section-navigation-item-${i}`),
    contact = (i) => page.getByTestId(`section-local-item-${i}`);
  assert.equal(await nav.getAttribute("role"), "navigation");
  assert.equal(await nav.getAttribute("aria-label"), "Page sections");
  assert.equal(await nav.locator("a").count(), 5);
  assert.equal(await row(0).evaluate((n) => n.tagName), "A");
  assert.equal(await row(0).getAttribute("href"), "#index-A");
  assert.equal(await row(2).getAttribute("href"), null);
  assert.equal(await row(2).getAttribute("aria-disabled"), "true");
  assert.equal(await selected(nav), "A");
  assert.equal(await nav.locator('[tabindex="0"]').count(), 1);
  const originalURL = page.url();
  await row(0).focus();
  await page.keyboard.press("ArrowDown");
  await focused(row(1));
  assert.equal(await selected(nav), "A");
  assert.equal(page.url(), originalURL);
  await page.keyboard.press("ArrowDown");
  await focused(row(3));
  await page.keyboard.press("Home");
  await focused(row(0));
  await page.keyboard.press("End");
  await focused(row(4));
  await page.keyboard.press("Enter");
  await page.waitForURL(/#index-snow$/);
  assert.equal(await selected(nav), "雪,🌕");
  await row(3).click();
  await page.waitForURL(/#index-D$/);
  assert.equal(await selected(nav), "");
  const repeated = Number(await page.getByTestId("index-changes").textContent());
  await row(3).click();
  assert.equal(Number(await page.getByTestId("index-changes").textContent()), repeated + 1);
  await page.getByTestId("index-clear").click();
  assert.equal(await nav.locator('[aria-current="location"]').count(), 0);
  await page.getByTestId("index-external").click();
  assert.equal(await selected(nav), "雪,🌕");
  await page.getByTestId("index-reject").click();
  await row(1).click();
  await page.waitForURL(/#index-B$/);
  assert.equal(
    await selected(nav),
    "雪,🌕",
    "controlled current location does not veto fragment navigation",
  );
  await page.getByTestId("index-reject").click();
  const changes = Number(await page.getByTestId("index-changes").textContent());
  await row(0).evaluate((n) =>
    n.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true })),
  );
  assert.equal(
    Number(await page.getByTestId("index-changes").textContent()),
    changes,
    "modified activation retains browser ownership",
  );
  // Local navigation must precede the stock router's document capture handler.
  await local.scrollIntoViewIfNeeded();
  const localURL = page.url(),
    outer = await page.evaluate(() => scrollY);
  await contact(3).click();
  await settle(page);
  assert.equal(page.url(), localURL);
  assert.equal(await page.evaluate(() => scrollY), outer);
  assert.equal(await selected(local), "D");
  const port = page.getByTestId("index-scrollport");
  const offset = await page.getByTestId("contact-D").evaluate((n) => {
    const p = document.getElementById("index-scrollport");
    return n.getBoundingClientRect().top - p.getBoundingClientRect().top - p.clientTop;
  });
  assert.ok(Math.abs(offset - 12) < 1);
  await port.evaluate((n) => (n.scrollTop = 0));
  const count = Number(await page.getByTestId("index-local-changes").textContent());
  const a = await center(contact(0)),
    b = await center(contact(1)),
    d = await center(contact(3));
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 3 });
  await page.mouse.move(d.x, d.y, { steps: 5 });
  await page.mouse.move(d.x, d.y);
  await page.mouse.up();
  await settle(page);
  assert.equal(
    Number(await page.getByTestId("index-local-changes").textContent()),
    count + 3,
    "one activation per crossed enabled item, no trailing duplicate",
  );
  assert.equal(await selected(local), "D");
  assert.equal(page.url(), localURL);
  const blocked = Number(await page.getByTestId("index-local-changes").textContent());
  await contact(2).click();
  assert.equal(Number(await page.getByTestId("index-local-changes").textContent()), blocked);
  await page.getByTestId("index-disabled").click();
  assert.equal(await nav.locator('[tabindex="0"]').count(), 0);
  assert.equal(await row(0).getAttribute("href"), null);
  await row(0).evaluate((n) => n.click());
  assert.equal(Number(await page.getByTestId("index-changes").textContent()), changes);
  await page.getByTestId("index-disabled").click();
  await row(1).focus();
  await page.getByTestId("index-unavailable").evaluate((n) => n.click());
  await page.keyboard.press("Home");
  await row(0).focus();
  await page.keyboard.press("ArrowDown");
  await focused(row(3));
  await page.getByTestId("index-unavailable").click();
  await page.getByTestId("index-remove").click();
  assert.equal(await nav.locator('a[data-lenso-value="B"]').count(), 0);
  await row(0).focus();
  await page.keyboard.press("ArrowDown");
  await focused(nav.locator('a[data-lenso-value=""]'));
  await page.getByTestId("index-remove").click();
  await page.getByTestId("index-direction").click();
  assert.equal(await nav.evaluate((n) => getComputedStyle(n).direction), "rtl");
  await row(0).focus();
  await page.keyboard.press("ArrowDown");
  await focused(row(1));
  await page.getByTestId("index-direction").click();
  // Cancelled drags release capture and ignore following pointer movement.
  await local.scrollIntoViewIfNeeded();
  const start = await center(contact(0));
  await local.evaluate((n) =>
    n.addEventListener(
      "pointerdown",
      (e) => n.setAttribute("data-test-pointer", String(e.pointerId)),
      { once: true },
    ),
  );
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  const pointerId = Number(await local.getAttribute("data-test-pointer"));
  assert.equal(await local.evaluate((n, id) => n.hasPointerCapture(id), pointerId), true);
  await local.evaluate(
    (n, id) =>
      n.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true, pointerId: id, isPrimary: true }),
      ),
    pointerId,
  );
  const cancelled = Number(await page.getByTestId("index-local-changes").textContent());
  await page.mouse.move(start.x, start.y + 60);
  await page.mouse.up();
  assert.equal(Number(await page.getByTestId("index-local-changes").textContent()), cancelled);
  const retired = await local.elementHandle();
  await page.getByTestId("index-mounted").click();
  assert.equal(await retired.evaluate((n) => n.hasPointerCapture(1)), false);
  await page.getByTestId("index-mounted").click();
  const detached = await retired.evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    ),
  );
  assert.equal(detached, true);
  await retired.dispose();
  await contact(1).click();
  assert.equal(await selected(local), "B");
  const captures = [];
  for (const disabled of [false, true])
    for (const direction of ["ltr", "rtl"])
      for (const theme of ["light", "dark"])
        for (const width of [390, 820]) {
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ reducedMotion: "reduce" });
          if (((await nav.getAttribute("data-lenso-disabled")) === "true") !== disabled)
            await page.getByTestId("index-disabled").click();
          if ((await nav.evaluate((n) => getComputedStyle(n).direction)) !== direction)
            await page.getByTestId("index-direction").click();
          if (!(await page.locator(`[data-theme="${theme}"]`).count()))
            await page.getByTestId("theme").click();
          await local.scrollIntoViewIfNeeded();
          await page.mouse.move(0, 0);
          await settle(page);
          const geometry = await local.evaluate((n) => {
            const r = n.getBoundingClientRect();
            return {
              x: r.x,
              right: r.right,
              width: r.width,
              height: r.height,
              opacity: getComputedStyle(n).opacity,
              links: [...n.querySelectorAll("a")].map((a) => {
                const r = a.getBoundingClientRect(),
                  s = getComputedStyle(a);
                return {
                  width: r.width,
                  height: r.height,
                  font: s.fontSize,
                  x: r.x,
                  right: r.right,
                };
              }),
              viewport: innerWidth,
            };
          });
          assert.equal(geometry.width, 44);
          assert.equal(geometry.opacity, disabled ? "0.4" : "1");
          assert.ok(geometry.x >= 0 && geometry.right <= geometry.viewport + 1);
          for (const link of geometry.links) {
            assert.equal(link.width, 16);
            assert.equal(link.font, "11px");
            assert.ok(link.height >= 13.7);
            assert.ok(link.x >= geometry.x && link.right <= geometry.right + 1);
            assert.ok(
              direction === "ltr"
                ? Math.abs(link.right - geometry.right) < 1
                : Math.abs(link.x - geometry.x) < 1,
            );
          }
          const file = path.join(
            process.env.LENSO_EXACT_TEST_ARTIFACTS,
            `${engine}-${disabled ? "disabled" : "enabled"}-${direction}-${theme}-${width}.png`,
          );
          await page
            .locator("#index-scrollport")
            .screenshot({ path: file.replace(".png", "-content.png") });
          await local.screenshot({ path: file });
          captures.push({ disabled, direction, theme, width, file, geometry });
        }
  return {
    captures,
    nativeFragments: true,
    localScrollport: true,
    nativeMouseDrag: true,
    pointerCancel: true,
  };
}
export async function checkSectionIndexTouch(browser, url, engine) {
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
      document.getElementById("section-local")?.hasAttribute("data-lenso-ready"),
    );
    const local = page.getByTestId("section-local"),
      a = page.getByTestId("section-local-item-0"),
      d = page.getByTestId("section-local-item-3");
    await local.scrollIntoViewIfNeeded();
    const original = page.url();
    await d.tap();
    assert.equal(await selected(local), "D");
    assert.equal(page.url(), original);
    let nativeDrag = false;
    if (engine === "chromium") {
      const client = await context.newCDPSession(page),
        from = await center(a),
        to = await center(d),
        count = Number(await page.getByTestId("index-local-changes").textContent());
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: from.x, y: from.y, id: 1 }],
      });
      for (let step = 1; step <= 10; step++)
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: from.x, y: from.y + ((to.y - from.y) * step) / 10, id: 1 }],
        });
      await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await settle(page);
      assert.equal(await selected(local), "D");
      assert.equal(Number(await page.getByTestId("index-local-changes").textContent()), count + 3);
      assert.equal(page.url(), original);
      nativeDrag = true;
    }
    assert.deepEqual(errors, []);
    return { nativeTap: true, nativeTouchDrag: nativeDrag, errors };
  } finally {
    await context.close();
  }
}
