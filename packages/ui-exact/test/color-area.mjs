import assert from "node:assert/strict";
import path from "node:path";
export async function checkColorArea(page, engine) {
  const root = page.getByTestId("color-plane"),
    x = page.getByTestId("color-plane-x"),
    y = page.getByTestId("color-plane-y"),
    thumb = page.getByTestId("color-plane-thumb");
  const value = async (input) => Number(await input.getAttribute("aria-valuenow"));
  const canonical = () => page.getByTestId("area-color-value").textContent();
  const commits = async () =>
    Number((await page.getByTestId("color-area-commits").textContent()).replace("Commits: ", ""));
  await page.waitForFunction(
    () =>
      document.getElementById("color-plane-x")?.max === "100" &&
      !document.getElementById("color-plane-x").disabled,
  );
  assert.equal(await value(x), 50);
  assert.equal(await value(y), 50);
  assert.equal(await x.getAttribute("aria-label"), "Color plane Saturation");
  assert.equal(await y.getAttribute("aria-label"), "Color plane Brightness");
  assert.equal(await y.getAttribute("aria-orientation"), "vertical");
  await x.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await x.evaluate((n) => document.activeElement === n), true);
  assert.equal(await value(x), 51);
  assert.equal(await commits(), 1);
  await page.keyboard.press("ArrowUp");
  assert.equal(await value(y), 51);
  assert.equal(await commits(), 2);
  await page.keyboard.press("Tab");
  assert.equal(await y.evaluate((n) => n === document.activeElement), true);
  await page.keyboard.press("Home");
  assert.equal(await value(y), 0);
  await page.keyboard.press("End");
  assert.equal(await value(y), 100);
  await page.getByTestId("color-area-reset").click();
  await root.scrollIntoViewIfNeeded();
  const box = await root.boundingBox();
  assert.equal(Math.round(box.width), 224);
  assert.equal(Math.round(box.height), 224);
  const beforeDrag = await commits();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.75, { steps: 8 });
  await page.mouse.up();
  assert.equal(await value(x), 75);
  assert.equal(await value(y), 25);
  assert.equal(await commits(), beforeDrag + 1);
  const marker = await thumb.boundingBox();
  assert.ok(Math.abs(marker.x + marker.width / 2 - box.x - box.width * 0.75) < 1);
  assert.ok(Math.abs(marker.y + marker.height / 2 - box.y - box.height * 0.75) < 1);
  const beforeCancel = await canonical(),
    beforeCancelCommits = await commits();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await root.dispatchEvent("pointercancel", {
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
  });
  await page.mouse.up();
  await page.getByTestId("area-color-value").filter({ hasText: beforeCancel }).waitFor();
  assert.equal(await commits(), beforeCancelCommits);
  await page.getByTestId("color-area-direction").click();
  await x.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await value(x), 76);
  await page.getByTestId("color-area-readonly").click();
  const locked = await canonical(),
    lockedCommits = await commits();
  await x.focus();
  await page.keyboard.press("ArrowUp");
  assert.equal(await canonical(), locked);
  assert.equal(await commits(), lockedCommits);
  await page.getByTestId("color-area-readonly").click();
  await page.getByTestId("color-area-disabled").click();
  assert.equal(await x.isDisabled(), true);
  assert.equal(await y.isDisabled(), true);
  await page.getByTestId("color-area-disabled").click();
  await page.getByTestId("color-area-reject").click();
  const rejected = await canonical(),
    rejectedCommits = await commits();
  await x.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (v) => document.getElementById("color-plane-x").value === String(v),
    76,
  );
  assert.equal(await canonical(), rejected);
  assert.equal(await commits(), rejectedCommits);
  await page.getByTestId("color-area-reject").click();
  await page.getByTestId("color-area-space").click();
  assert.equal(await y.getAttribute("aria-label"), "Color plane Lightness");
  await page.getByTestId("color-area-space").click();
  assert.equal(await x.getAttribute("aria-label"), "Color plane Red");
  assert.equal(await x.getAttribute("max"), "255");
  assert.equal(
    await root.evaluate((n) => getComputedStyle(n).backgroundBlendMode.split(",")[0].trim()),
    "screen",
  );
  await page.getByTestId("color-area-space").click();
  await page.getByTestId("color-area-reset").click();
  await page.getByTestId("color-area-dots").click();
  assert.ok(
    await root.evaluate((n) =>
      getComputedStyle(n, "::after").backgroundImage.includes("radial-gradient"),
    ),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  const captures = [];
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${theme}"]`).count()))
        await page.getByTestId("theme").evaluate((n) => n.click());
      assert.equal(await value(x), 50);
      assert.equal(await value(y), 50);
      assert.equal(await x.isDisabled(), false);
      await root.scrollIntoViewIfNeeded();
      const file = path.join(
        process.env.LENSO_EXACT_TEST_ARTIFACTS ??
          path.resolve(import.meta.dirname, "../.cache/example"),
        `${engine}-color-area-${theme}-${width}.png`,
      );
      await page.screenshot({ path: file });
      captures.push({ width, theme, file });
    }
  }
  const detached = await x.elementHandle(),
    detachedRoot = await root.elementHandle();
  await root.scrollIntoViewIfNeeded();
  const last = await root.boundingBox();
  await page.mouse.move(last.x + 30, last.y + 30);
  await page.mouse.down();
  await page.mouse.move(last.x + 100, last.y + 100, { steps: 4 });
  const removalCommits = await commits();
  await page.getByTestId("color-area-mounted").evaluate((n) => n.click());
  await page.mouse.up();
  assert.equal(await commits(), removalCommits);
  assert.equal(await detached.evaluate((n) => n.disabled), true);
  assert.equal(await detached.evaluate((n) => n.max), "1");
  assert.equal(await detachedRoot.evaluate((n) => n.style.background), "");
  await detached.dispose();
  await detachedRoot.dispose();
  await page.getByTestId("color-area-mounted").click();
  await page.waitForFunction(() => !document.getElementById("color-plane-x").disabled);
  await x.focus();
  const old = await value(y);
  await page.keyboard.press("ArrowUp");
  assert.equal(await value(y), old + 1);
  return {
    dualAxisKeyboard: true,
    keyboardFocus: true,
    atomicPointer: true,
    cancelRollback: "synthetic pointercancel during native mouse capture",
    rtl: true,
    spaces: ["hsb", "hsl", "rgb"],
    disabledReadOnly: true,
    controlledRejection: true,
    redraw: true,
    activeRemoval: true,
    remount: true,
    captures,
  };
}

export async function checkColorAreaForm(page, url) {
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
    await page.getByTestId("color-area-examples").evaluate((n) => {
      const form = document.createElement("form");
      form.id = "color-area-form-fixture";
      form.addEventListener("submit", (e) => e.preventDefault());
      n.before(form);
      form.append(n);
    });
    release();
    await page.waitForFunction(
      () =>
        !document.getElementById("color-plane-x").disabled &&
        document.getElementById("color-plane-x").max === "100",
    );
    const form = page.locator("#color-area-form-fixture");
    const data = () => form.evaluate((n) => Object.fromEntries(new FormData(n)));
    assert.deepEqual(await data(), { "plane-x": "50", "plane-y": "50" });
    await page.getByTestId("color-plane-y").focus();
    await page.keyboard.press("End");
    assert.equal((await data())["plane-y"], "100");
    await form.evaluate((n) => n.reset());
    await page.waitForFunction(() => document.getElementById("color-plane-y").value === "50");
    assert.deepEqual(await data(), { "plane-x": "50", "plane-y": "50" });
    await page.getByTestId("color-area-disabled").click();
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
export async function checkColorAreaTouch(page, engine) {
  await page.waitForFunction(() => !document.getElementById("color-plane-x")?.disabled);
  const root = page.getByTestId("color-plane"),
    x = page.getByTestId("color-plane-x"),
    y = page.getByTestId("color-plane-y");
  await root.scrollIntoViewIfNeeded();
  const box = await root.boundingBox();
  await page.touchscreen.tap(box.x + box.width * 0.25, box.y + box.height * 0.75);
  assert.equal(await x.getAttribute("aria-valuenow"), "25");
  assert.equal(await y.getAttribute("aria-valuenow"), "25");
  let nativeTwoAxisDrag = false;
  if (engine === "chromium") {
    const session = await page.context().newCDPSession(page);
    try {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: box.x + box.width * 0.2, y: box.y + box.height * 0.8 }],
      });
      for (let i = 1; i <= 12; i++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            { x: box.x + box.width * (0.2 + i * 0.05), y: box.y + box.height * (0.8 - i * 0.05) },
          ],
        });
        await page.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      assert.equal(await x.getAttribute("aria-valuenow"), "80");
      assert.equal(await y.getAttribute("aria-valuenow"), "80");
      nativeTwoAxisDrag = true;
    } finally {
      await session.detach();
    }
  }
  return {
    nativeTap: true,
    nativeTwoAxisDrag,
    scope:
      engine === "chromium"
        ? "native browser CDP touch"
        : "native tap; trusted continuous drag unavailable",
  };
}
