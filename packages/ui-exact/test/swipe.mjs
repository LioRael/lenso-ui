import assert from "node:assert/strict";
import path from "node:path";
export async function checkSwipe(page, engine) {
  const root = page.getByTestId("message-swipe");
  const trigger = (side) =>
    root.getByRole("button", {
      name: side === "start" ? "Show leading actions" : "Show trailing actions",
    });
  const side = (value) =>
    page
      .getByTestId("swipe-side")
      .filter({ hasText: `Side: ${value}` })
      .waitFor();
  await trigger("start").focus();
  await page.keyboard.press("Enter");
  await side("start");
  assert.equal(
    await page
      .getByTestId("swipe-read")
      .evaluate((n) => n.closest('[data-slot="swipe-actions-actions"]').inert),
    false,
  );
  await page.getByTestId("swipe-read").focus();
  await page.keyboard.press("Enter");
  await page.getByTestId("swipe-read-count").filter({ hasText: "Read: 1" }).waitFor();
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("aria-label") === "Show leading actions",
  );
  await trigger("end").click();
  assert.equal(await page.getByTestId("swipe-archive").isDisabled(), true);
  await page.getByTestId("swipe-delete").focus();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("aria-label") === "Show trailing actions",
  );
  const drag = async (dx, dy = 0) => {
    await root.scrollIntoViewIfNeeded();
    const rect = await root.boundingBox();
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 8 });
    await page.mouse.up();
  };
  await drag(-100);
  await side("end");
  await trigger("end").focus();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.getElementById("message-swipe").dataset.lensoValue === "",
  );
  await drag(0, 40);
  assert.equal(await trigger("end").getAttribute("aria-expanded"), "false");
  await page.getByTestId("swipe-full").click();
  const width = (await root.boundingBox()).width;
  // Start near the trailing edge so a full mouse swipe stays inside the viewport.
  await root.scrollIntoViewIfNeeded();
  const rect = await root.boundingBox();
  await page.mouse.move(rect.x + rect.width - 12, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect.x + 12, rect.y + rect.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.getByTestId("swipe-delete-count").filter({ hasText: "Deleted: 1" }).waitFor();
  assert.ok(width > 0);
  await trigger("start").click();
  await page.getByTestId("swipe-editing").evaluate((n) => n.click());
  assert.equal(await trigger("start").isDisabled(), true);
  assert.equal(
    await page
      .getByTestId("swipe-read")
      .evaluate((n) => n.closest('[data-slot="swipe-actions-actions"]').inert),
    true,
  );
  await page.getByTestId("swipe-editing").evaluate((n) => n.click());
  await trigger("start").focus();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.getElementById("message-swipe").dataset.lensoValue === "",
  );
  await page.getByTestId("swipe-direction").click();
  await drag(100);
  await side("end");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await root
      .locator('[data-slot="swipe-actions-content"]')
      .evaluate((n) => getComputedStyle(n).transitionDuration),
    "0s",
  );
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      await root.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-swipe-${theme}-${width}.png`,
        ),
      });
      captures.push({ width, theme });
    }
  }
  const content = await root.locator('[data-slot="swipe-actions-content"]').elementHandle();
  await page.getByTestId("swipe-mounted").evaluate((n) => n.click());
  assert.equal(await content.evaluate((n) => n.style.transform), "");
  await content.dispose();
  await page.getByTestId("swipe-mounted").evaluate((n) => n.click());
  await trigger("end").click();
  await page.keyboard.press("Escape");
  return {
    keyboard: true,
    mouse: true,
    verticalGesture: true,
    fullSwipeOptIn: true,
    rtl: true,
    disabledEditing: true,
    actionFocusReturn: true,
    reducedMotion: true,
    disposal: true,
    captures,
  };
}

export async function checkSwipeTouch(page, engine) {
  const root = page.getByTestId("message-swipe");
  const leading = root.getByRole("button", { name: "Show leading actions" });
  const trailing = root.getByRole("button", { name: "Show trailing actions" });
  await leading.tap();
  await page.getByTestId("swipe-read").tap();
  await page.getByTestId("swipe-read-count").filter({ hasText: "Read: 1" }).waitFor();
  await trailing.tap();
  await page.getByTestId("swipe-delete").tap();
  await page.getByTestId("swipe-delete-count").filter({ hasText: "Deleted: 1" }).waitFor();
  const gesture = {
    nativeHorizontal: false,
    nativeVerticalScroll: false,
    engineSupport:
      engine === "chromium" ? "CDP touch input" : "native taps only; drag injection unavailable",
  };
  if (engine === "chromium") {
    const session = await page.context().newCDPSession(page);
    try {
      const swipe = async (vertical) => {
        await root.scrollIntoViewIfNeeded();
        await root.locator('[data-slot="swipe-actions-content"]').evaluate(async (n) => {
          await Promise.all(n.getAnimations().map((a) => a.finished.catch(() => {})));
        });
        const rect = await root.boundingBox();
        const body = await root.locator('[data-slot="swipe-actions-body"]').boundingBox();
        const x = body.x + body.width * 0.75,
          y = body.y + body.height / 2;
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y }],
        });
        for (let i = 1; i <= 12; i++) {
          await session.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
              {
                x: x - (vertical ? 0 : (rect.width * 0.4 * i) / 12),
                y: y + (vertical ? (110 * i) / 12 : 0),
              },
            ],
          });
          await page.waitForTimeout(16);
        }
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      };
      await root.evaluate((n) => {
        window.__swipeTouchTrace = [];
        for (const kind of [
          "pointerdown",
          "pointermove",
          "pointerup",
          "pointercancel",
          "touchstart",
          "touchmove",
          "touchend",
        ])
          n.addEventListener(kind, (e) =>
            window.__swipeTouchTrace.push({
              type: e.type,
              pointerType: e.pointerType,
              primary: e.isPrimary,
              target: e.target.closest("[data-slot]")?.getAttribute("data-slot"),
              x: e.clientX,
              y: e.clientY,
              prevented: e.defaultPrevented,
              scroll: scrollY,
            }),
          );
      });
      await swipe(false);
      await Bun.write(
        path.join(
          process.env.LENSO_EXACT_TEST_ARTIFACTS ??
            path.resolve(import.meta.dirname, "../.cache/example"),
          `${engine}-swipe-touch-trace.json`,
        ),
        JSON.stringify(
          await page.evaluate(() => ({
            trace: window.__swipeTouchTrace,
            side: document.getElementById("message-swipe").dataset.lensoValue,
            rect: document.getElementById("message-swipe").getBoundingClientRect().toJSON(),
            viewport: { width: innerWidth, height: innerHeight, scale: visualViewport.scale },
          })),
          null,
          2,
        ) + "\n",
      );
      await page.waitForFunction(
        () => document.getElementById("message-swipe").dataset.lensoValue === "end",
      );
      assert.equal(await page.getByTestId("swipe-delete-count").textContent(), "Deleted: 1");
      gesture.nativeHorizontal = true;
      await trailing.tap();
      await root.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => scrollY);
      await swipe(true);
      await page.waitForFunction((previous) => scrollY < previous - 20, before);
      assert.equal(await trailing.getAttribute("aria-expanded"), "false");
      gesture.nativeVerticalScroll = true;
    } finally {
      await session.detach();
    }
  }
  return { nativeTapActions: true, ...gesture };
}
