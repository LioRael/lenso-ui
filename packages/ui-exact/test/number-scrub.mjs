import assert from "node:assert/strict";
import path from "node:path";

const artifacts =
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? path.resolve(import.meta.dirname, "../.cache/example");
const direct = (page, name) => page.getByTestId(`numeric-${name}`).evaluate((n) => n.click());
const value = (page, n) =>
  page.waitForFunction(
    (n) =>
      Math.abs(Number(document.getElementById("numeric-amount").dataset.lensoValue) - n) < 1e-12,
    n,
  );
const commits = async (page) =>
  Number((await page.getByTestId("numeric-commits").textContent()).split(": ")[1]);
const active = (page, on) =>
  page.waitForFunction(
    (on) => document.getElementById("numeric-amount").hasAttribute("data-scrubbing") === on,
    on,
  );
const position = async (page) => {
  await page.getByTestId("numeric-scrub").scrollIntoViewIfNeeded();
  const r = await page.getByTestId("numeric-scrub").boundingBox();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
const start = async (page) => {
  const p = await position(page);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await active(page, true);
  return p;
};
const stop = async (page) => {
  await page.mouse.up();
  await active(page, false);
  await page.waitForTimeout(30);
};

export async function checkNumberScrub(page, engine) {
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  await page.evaluate(() => {
    window.scrubRequests = 0;
    window.scrubRequestDescriptor = Object.getOwnPropertyDescriptor(
      document.body,
      "requestPointerLock",
    );
    Object.defineProperty(document.body, "requestPointerLock", {
      configurable: true,
      value: () => {
        window.scrubRequests++;
        return Promise.reject(new DOMException("Fixture denial", "NotAllowedError"));
      },
    });
  });
  await page.getByTestId("numeric-scrub").evaluate((n) => {
    window.scrubClicks = 0;
    n.addEventListener("click", () => window.scrubClicks++);
  });
  const before = await commits(page);
  let p = await start(page);
  assert.equal(
    await page.getByTestId("numeric-count").getAttribute("data-scrubbing"),
    null,
    "another numeric root keeps its own state",
  );
  assert.equal(await page.getByTestId("numeric-amount-input").getAttribute("data-scrubbing"), "");
  assert.equal(
    await page.getByTestId("numeric-scrub-cursor").evaluate((n) => n.matches(":popover-open")),
    false,
  );
  await page.mouse.move(p.x + 1, p.y);
  await value(page, 1.2);
  await page.mouse.move(p.x + 2, p.y);
  await value(page, 1.3);
  await page.mouse.move(p.x + 6, p.y);
  await value(page, 1.7);
  assert.equal(await commits(page), before);
  await stop(page);
  assert.equal(await commits(page), before + 1);
  const clickBefore = await page.evaluate(() => window.scrubClicks);
  const c0 = await commits(page);
  await start(page);
  await stop(page);
  assert.equal(await commits(page), c0 + 1, "unmoved release commits only its active session");
  assert.equal(
    await page.evaluate(() => window.scrubClicks),
    clickBefore + 1,
    "ordinary native click is not duplicated",
  );
  const unrelated = await commits(page);
  await page.mouse.up();
  assert.equal(await commits(page), unrelated);
  await direct(page, "external");
  await value(page, 3.25);
  await direct(page, "scrub-direction");
  assert.equal(
    await page.getByTestId("numeric-scrub").evaluate((n) => getComputedStyle(n).cursor),
    "ns-resize",
  );
  p = await start(page);
  await page.mouse.move(p.x + 4, p.y);
  await value(page, 3.25);
  await page.mouse.move(p.x + 4, p.y - 4);
  await value(page, 3.6);
  await stop(page);
  await direct(page, "scrub-direction");
  await direct(page, "scrub-sensitivity");
  await direct(page, "external");
  await value(page, 3.25);
  p = await start(page);
  await page.mouse.move(p.x + 4, p.y);
  await value(page, 3.25);
  await page.mouse.move(p.x + 8, p.y);
  await value(page, 3.6);
  await stop(page);
  await direct(page, "scrub-sensitivity");
  await direct(page, "external");
  await value(page, 3.25);
  await page.keyboard.down("Shift");
  p = await start(page);
  await page.mouse.move(p.x + 2, p.y);
  await value(page, 5);
  await stop(page);
  await page.keyboard.up("Shift");
  await direct(page, "external");
  await value(page, 3.25);
  await page.keyboard.down("Alt");
  p = await start(page);
  await page.mouse.move(p.x + 2, p.y);
  await value(page, 3.27);
  await stop(page);
  await page.keyboard.up("Alt");
  const cancelled = await commits(page);
  await start(page);
  await direct(page, "readonly");
  await active(page, false);
  await page.mouse.up();
  assert.equal(await commits(page), cancelled);
  await direct(page, "readonly");
  await start(page);
  await direct(page, "disabled");
  await active(page, false);
  await page.mouse.up();
  assert.equal(await commits(page), cancelled);
  await direct(page, "disabled");
  await start(page);
  await direct(page, "scrub-mounted");
  await active(page, false);
  await page.mouse.up();
  assert.equal(await commits(page), cancelled);
  await direct(page, "scrub-mounted");
  await page.waitForFunction(() =>
    document.getElementById("numeric-scrub")?.hasAttribute("data-lenso-ready"),
  );
  await start(page);
  await direct(page, "editor");
  await active(page, false);
  await page.mouse.up();
  assert.equal(await commits(page), cancelled);
  await direct(page, "editor");
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  const requestCount = await page.evaluate(() => window.scrubRequests);
  if (engine === "webkit") assert.equal(requestCount, 0);
  else assert.ok(requestCount > 0);
  await page.evaluate(() => {
    if (window.scrubRequestDescriptor)
      Object.defineProperty(document.body, "requestPointerLock", window.scrubRequestDescriptor);
    else delete document.body.requestPointerLock;
  });
  return {
    directions: true,
    sensitivity: true,
    modifiers: true,
    clickForwarding: true,
    oneCommit: true,
    cancellation: true,
    editorRemoval: true,
    requestPolicy: engine === "webkit" ? "skipped" : "denial fixture",
    requestCount,
  };
}

export async function checkNumberScrubLock(page, engine) {
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  if (engine === "webkit") {
    await start(page);
    assert.equal(await page.evaluate(() => document.pointerLockElement ?? null), null);
    assert.equal(
      await page.getByTestId("numeric-scrub-cursor").evaluate((n) => n.matches(":popover-open")),
      false,
    );
    await stop(page);
    return { nativeLock: "skipped by source policy" };
  }
  await page.bringToFront();
  await page.getByTestId("numeric-amount").evaluate((n) => {
    n.style.transform = "translate(18px, 11px)";
    n.style.overflow = "hidden";
  });
  let p = await start(page);
  await page.waitForFunction(() => document.pointerLockElement === document.body);
  const cursor = page.getByTestId("numeric-scrub-cursor");
  await page.waitForFunction(() =>
    document.getElementById("numeric-scrub-cursor").matches(":popover-open"),
  );
  const viewport = await cursor.evaluate((n) => {
    const r = n.getBoundingClientRect(),
      m = new DOMMatrixReadOnly(getComputedStyle(n).transform);
    return { dx: r.x - m.m41, dy: r.y - m.m42, width: r.width, height: r.height };
  });
  assert.ok(
    Math.abs(viewport.dx) < 0.5 && Math.abs(viewport.dy) < 0.5,
    "cursor escapes the transformed owner",
  );
  await page.screenshot({
    path: path.join(artifacts, `${engine}-number-scrub-native-cursor.png`),
  });
  await page.evaluate(() => {
    window.scrubScaleDescriptor = Object.getOwnPropertyDescriptor(visualViewport, "scale");
    Object.defineProperty(visualViewport, "scale", { configurable: true, value: 2 });
  });
  await page.mouse.move(p.x + 1, p.y);
  await page.waitForFunction(
    () =>
      Math.abs(
        new DOMMatrixReadOnly(
          getComputedStyle(document.getElementById("numeric-scrub-cursor")).transform,
        ).m11 - 0.5,
      ) < 0.001,
  );
  await page.evaluate(() => {
    if (window.scrubScaleDescriptor)
      Object.defineProperty(visualViewport, "scale", window.scrubScaleDescriptor);
    else delete visualViewport.scale;
  });
  await direct(page, "scrub-teleport");
  await page.evaluate(() =>
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: 1,
        pointerType: "mouse",
        movementX: 2000,
        movementY: 0,
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  const wrapped = await cursor.evaluate((n) => {
    const a = document.getElementById("numeric-scrub").getBoundingClientRect(),
      m = new DOMMatrixReadOnly(getComputedStyle(n).transform);
    return { center: m.m41 + n.offsetWidth / 2, left: a.left - 40, right: a.right + 40 };
  });
  assert.ok(
    Math.abs(wrapped.center - wrapped.left) < 0.6,
    "teleport distance wraps at the expanded area edge",
  );
  await stop(page);
  assert.equal(await page.evaluate(() => document.pointerLockElement ?? null), null);
  assert.equal(await cursor.evaluate((n) => n.style.transform), "");
  await direct(page, "scrub-teleport");
  await page.getByTestId("numeric-scrub").evaluate((n) => {
    window.nativeScrubClicks = 0;
    n.addEventListener("click", () => window.nativeScrubClicks++);
  });
  await start(page);
  await page.waitForFunction(() => document.pointerLockElement === document.body);
  await stop(page);
  assert.equal(
    await page.evaluate(() => window.nativeScrubClicks),
    1,
    "locked body click is forwarded exactly once",
  );
  await start(page);
  await page.waitForFunction(() => document.pointerLockElement === document.body);
  const c = await commits(page);
  await page.keyboard.press("Escape");
  await active(page, false);
  await page.mouse.up();
  assert.equal(await commits(page), c);
  await page.getByTestId("numeric-amount").evaluate((n) => {
    n.style.removeProperty("transform");
    n.style.removeProperty("overflow");
  });
  return {
    nativeLock: "granted",
    viewportEscape: viewport,
    scaleFixture: true,
    wrapping: wrapped,
    clickForwarding: true,
    escapeCancellation: true,
  };
}

export async function checkNumberScrubLateLock(page) {
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  await page.evaluate(() => {
    window.lateScrub = {
      request: Object.getOwnPropertyDescriptor(document.body, "requestPointerLock"),
      lock: Object.getOwnPropertyDescriptor(document, "pointerLockElement"),
      exit: Object.getOwnPropertyDescriptor(document, "exitPointerLock"),
      element: null,
      exits: 0,
    };
    const f = window.lateScrub;
    Object.defineProperty(document.body, "requestPointerLock", {
      configurable: true,
      value: () => new Promise((resolve) => (f.resolve = resolve)),
    });
    Object.defineProperty(document, "pointerLockElement", {
      configurable: true,
      get: () => f.element,
    });
    Object.defineProperty(document, "exitPointerLock", {
      configurable: true,
      value: () => {
        f.element = null;
        f.exits++;
      },
    });
  });
  await start(page);
  await direct(page, "scrub-mounted");
  await active(page, false);
  await page.evaluate(() => {
    lateScrub.element = document.body;
    lateScrub.resolve();
  });
  await page.waitForFunction(() => lateScrub.exits === 1 && lateScrub.element === null);
  await page.mouse.up();
  await page.evaluate(() => {
    for (const [node, key, descriptor] of [
      [document.body, "requestPointerLock", lateScrub.request],
      [document, "pointerLockElement", lateScrub.lock],
      [document, "exitPointerLock", lateScrub.exit],
    ]) {
      if (descriptor) Object.defineProperty(node, key, descriptor);
      else delete node[key];
    }
  });
  return { lateGrantReleased: true, fixture: "deferred request and document lock properties" };
}

export async function checkNumberScrubTouch(page) {
  await page.waitForFunction(
    () => document.getElementById("numeric-amount-input")?.type === "text",
  );
  const area = page.getByTestId("numeric-scrub");
  await area.scrollIntoViewIfNeeded();
  await area.evaluate((n) =>
    n.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerId: 71,
        pointerType: "touch",
        button: 0,
        clientX: 100,
        clientY: 200,
      }),
    ),
  );
  await active(page, true);
  await area.evaluate((n) =>
    n.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 71,
        pointerType: "touch",
        clientX: 104,
        clientY: 200,
      }),
    ),
  );
  await value(page, 1.6);
  assert.equal(await page.evaluate(() => document.pointerLockElement ?? null), null);
  assert.equal(
    await page.getByTestId("numeric-scrub-cursor").evaluate((n) => n.matches(":popover-open")),
    false,
  );
  await area.evaluate((n) =>
    n.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        pointerId: 71,
        pointerType: "touch",
        clientX: 104,
        clientY: 200,
      }),
    ),
  );
  await active(page, false);
  assert.equal(await commits(page), 1);
  return { pointerFixture: true, noLock: true, noCursor: true };
}
