import assert from "node:assert/strict";
import path from "node:path";
export async function checkColorSlider(page, engine) {
  const hue = page.getByTestId("hue-slider-input"),
    alpha = page.getByTestId("alpha-slider-input");
  const root = page.getByTestId("hue-slider"),
    track = page.getByTestId("hue-slider-track"),
    thumb = page.getByTestId("hue-slider-thumb");
  const value = async (input = hue) => Number(await input.getAttribute("aria-valuenow"));
  const commits = async () =>
    Number((await page.getByTestId("color-slider-commits").textContent()).replace("Commits: ", ""));
  await page.waitForFunction(
    () =>
      !document.getElementById("hue-slider-input").disabled &&
      document.getElementById("hue-slider-input").max === "360",
  );
  assert.equal(await value(), 210);
  assert.equal(await value(alpha), 0.5);
  assert.equal(await hue.getAttribute("aria-label"), "Color hue");
  assert.equal(await track.evaluate((n) => getComputedStyle(n).height), "34px");
  assert.ok(
    await track.evaluate((n) => getComputedStyle(n).backgroundImage.includes("linear-gradient")),
  );
  assert.ok(
    await track.evaluate((n) =>
      getComputedStyle(n, "::before").backgroundImage.includes("conic-gradient"),
    ),
  );
  await page.getByTestId("hue-slider-label").click();
  assert.equal(await hue.evaluate((n) => document.activeElement === n), true);
  await page.keyboard.press("ArrowRight");
  assert.equal(await hue.evaluate((n) => document.activeElement === n), true);
  await page.waitForFunction(
    () => document.getElementById("hue-slider-input").getAttribute("aria-valuenow") === "211",
  );
  assert.equal(await commits(), 1);
  await hue.press("End");
  assert.equal(await value(), 360);
  const rect = await track.boundingBox(),
    position = await thumb.boundingBox();
  assert.ok(Math.abs(position.x + position.width / 2 - rect.x - rect.width) < 1);
  const atEnd = await commits();
  await hue.press("ArrowRight");
  assert.equal(await value(), 360);
  assert.equal(await commits(), atEnd);
  await hue.press("Home");
  assert.equal(await value(), 0);
  await page.getByTestId("color-slider-direction").click();
  await hue.focus();
  await hue.press("ArrowLeft");
  assert.equal(await value(), 1);
  const box = await track.boundingBox();
  const beforeDrag = await commits();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  assert.ok(Math.abs((await value()) - 72) <= 1);
  assert.equal(await commits(), beforeDrag + 1);
  await page.getByTestId("color-slider-orientation").click();
  await track.scrollIntoViewIfNeeded();
  const vertical = await track.boundingBox();
  assert.equal(Math.round(vertical.width), 34);
  assert.ok(vertical.height > 34);
  await page.mouse.click(vertical.x + vertical.width / 2, vertical.y + vertical.height * 0.25);
  assert.ok(Math.abs((await value()) - 270) <= 1);
  const verticalThumb = await thumb.boundingBox();
  assert.ok(
    Math.abs(verticalThumb.y + verticalThumb.height / 2 - vertical.y - vertical.height * 0.25) < 2,
  );
  await page.getByTestId("color-slider-readonly").click();
  const blockedValue = await value(),
    blockedCommits = await commits();
  await hue.focus();
  await hue.press("ArrowUp");
  assert.equal(await value(), blockedValue);
  assert.equal(await commits(), blockedCommits);
  await page.getByTestId("color-slider-readonly").click();
  await page.getByTestId("color-slider-disabled").click();
  assert.equal(await hue.isDisabled(), true);
  await page.getByTestId("color-slider-disabled").click();
  await page.getByTestId("color-slider-reject").click();
  const rejected = await value();
  const rejectedCommits = await commits();
  await hue.focus();
  await hue.press("ArrowDown");
  await page.waitForFunction(
    (expected) =>
      Number(document.getElementById("hue-slider-input").getAttribute("aria-valuenow")) ===
      expected,
    rejected,
  );
  assert.equal(await commits(), rejectedCommits);
  await page.getByTestId("color-slider-reject").click();
  await page.getByTestId("color-slider-locale").click();
  assert.ok((await page.getByTestId("alpha-slider-output").textContent()).includes("%"));
  await page.getByTestId("color-slider-reset").click();
  assert.equal(await value(), 210);
  assert.equal(await value(alpha), 0.5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      assert.equal(await value(), 210);
      assert.equal(await hue.isDisabled(), false);
      assert.ok((await page.getByTestId("hue-slider-output").textContent()).includes("210"));
      await root.scrollIntoViewIfNeeded();
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS ??
          path.resolve(import.meta.dirname, "../.cache/example"),
        `${engine}-color-slider-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const detached = await hue.elementHandle(),
    detachedTrack = await track.elementHandle();
  await track.scrollIntoViewIfNeeded();
  const active = await track.boundingBox();
  await page.mouse.move(active.x + active.width / 2, active.y + active.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(active.x + active.width / 2, active.y + active.height * 0.6, { steps: 4 });
  const canceledCommits = await commits();
  const canceledValue = await value();
  await page.getByTestId("color-slider-mounted").evaluate((n) => n.click());
  await page.mouse.up();
  assert.equal(await commits(), canceledCommits);
  assert.equal(await detachedTrack.evaluate((n) => n.hasPointerCapture(1)), false);
  assert.equal(await detached.evaluate((n) => n.disabled), true);
  assert.equal(await detached.evaluate((n) => n.max), "1");
  assert.equal(await detachedTrack.evaluate((n) => n.style.backgroundImage), "");
  await detached.dispose();
  await detachedTrack.dispose();
  await page.getByTestId("color-slider-mounted").click();
  await page.waitForFunction(() => !document.getElementById("hue-slider-input").disabled);
  await hue.focus();
  await hue.press("ArrowUp");
  assert.equal(await value(), canceledValue + 1);
  return {
    primitiveRange: true,
    genericSliderInteraction: true,
    hueEndpoint: true,
    keyboard: true,
    pointer: true,
    rtl: true,
    vertical: true,
    controlledRejection: true,
    disabledReadOnly: true,
    redraw: true,
    disposal: true,
    activeGestureRemoval: true,
    captures,
  };
}

export async function checkColorSliderForm(page, url) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/modules/index.js", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByTestId("color-slider-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "color-slider-form-fixture";
      form.addEventListener("submit", (e) => e.preventDefault());
      n.before(form);
      form.append(n);
    });
    release();
    await page.waitForFunction(
      () =>
        !document.getElementById("hue-slider-input").disabled &&
        document.getElementById("hue-slider-input").max === "360",
    );
    const form = page.locator("#color-slider-form-fixture");
    const data = () => form.evaluate((n) => Object.fromEntries(new FormData(n)));
    assert.deepEqual(await data(), { hue: "210", opacity: "0.5", red: "64" });
    await page.getByTestId("alpha-slider-input").focus();
    await page.keyboard.press("End");
    assert.equal((await data()).opacity, "1");
    await form.evaluate((n) => n.reset());
    await page.waitForFunction(() => document.getElementById("alpha-slider-input").value === "0.5");
    assert.deepEqual(await data(), { hue: "210", opacity: "0.5", red: "64" });
    await page.getByTestId("color-slider-disabled").click();
    assert.deepEqual(await data(), {});
    return {
      nativeModelValues: true,
      reset: true,
      disabledExclusion: true,
      fixture: "native DOM form authored before hatch",
    };
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
}
export async function checkColorSliderTouch(page, engine) {
  const input = page.getByTestId("hue-slider-input"),
    track = page.getByTestId("hue-slider-track");
  await page.waitForFunction(
    () =>
      document.getElementById("hue-slider-input").max === "360" &&
      !document.getElementById("hue-slider-input").disabled,
  );
  await track.scrollIntoViewIfNeeded();
  const box = await track.boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.25, box.y + box.height / 2);
  assert.ok(Math.abs(Number(await input.getAttribute("aria-valuenow")) - 90) <= 1);
  let nativeVerticalDrag = false;
  if (engine === "chromium") {
    await page.getByTestId("color-slider-orientation").tap();
    await track.scrollIntoViewIfNeeded();
    const rect = await track.boundingBox();
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + rect.height * 0.8 }],
      });
      for (let i = 1; i <= 12; i++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            { x: rect.x + rect.width / 2, y: rect.y + rect.height * (0.8 - (0.6 * i) / 12) },
          ],
        });
        await page.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      assert.ok(Math.abs(Number(await input.getAttribute("aria-valuenow")) - 288) <= 1);
      nativeVerticalDrag = true;
    } finally {
      await session.detach();
    }
  }
  return {
    nativeTap: true,
    nativeVerticalDrag,
    scope:
      engine === "chromium"
        ? "native browser CDP touch"
        : "native tap; trusted drag injection unavailable",
  };
}
