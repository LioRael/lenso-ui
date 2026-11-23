import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

async function brightnessAt(page, pixels, probes) {
  return page.evaluate(
    async ({ png, probes }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      return Object.fromEntries(
        Object.entries(probes).map(([name, point]) => {
          const [r, g, b] = context.getImageData(
            Math.floor(point.x * devicePixelRatio),
            Math.floor(point.y * devicePixelRatio),
            1,
            1,
          ).data;
          return [name, (r + g + b) / 3];
        }),
      );
    },
    { png: pixels.toString("base64"), probes },
  );
}

// Exercise the live screen and 3D controls, including resize feedback regressions.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 960 },
      deviceScaleFactor: 2,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/en/device-lab`, { waitUntil: "domcontentloaded" });
    const slider = page.getByRole("slider", { name: "Hinge angle" });
    await slider.waitFor();
    await page.waitForFunction(
      () => document.querySelector("canvas") && !document.querySelector("output"),
    );
    const inner = page.locator('iframe[title="Inner display"]');
    const unfolded = page.frameLocator('iframe[title="Inner display"]');
    await unfolded.getByRole("button", { name: "Select", exact: true }).waitFor();
    const assertVerticalControls = async (app, cover = false) => {
      const bounds = (locator) =>
        locator.evaluate((node) => node.getBoundingClientRect().toJSON(), undefined, {
          timeout: 5000,
        });
      const status = await bounds(app.getByLabel("Device status", { exact: true }));
      const filter = await bounds(app.getByRole("button", { name: "Sort and filter" }));
      const nav = app.getByRole("navigation", { name: "Photos navigation" });
      const collections = await bounds(nav.getByRole("link", { name: "Collections" }));
      const current = nav.getByRole("link").and(nav.locator('[aria-current="page"]'));
      const hit = await bounds(current);
      await nav.locator("[data-indicator-ready]:not([data-highlight-active])").waitFor();
      const paint = await bounds(nav.locator('[data-lenso-slot="tab-bar-indicator"]'));
      assert.equal(await nav.getAttribute("data-layout"), "vertical");
      assert.ok(
        [
          paint.left - hit.left,
          hit.right - paint.right,
          paint.top - hit.top,
          hit.bottom - paint.bottom,
        ].every((gap) => Math.abs(gap - 4) < 0.5),
        "The current destination has room on all four sides",
      );
      assert.ok(await nav.getByRole("button", { name: "Search", exact: true }).isVisible());
      assert.equal(await app.getByRole("button", { name: "Search", exact: true }).count(), 1);
      const center = (box) => box.x + box.width / 2;
      assert.ok(Math.abs(center(status) - center(filter)) < 6, "Status and toolbar share an axis");
      assert.ok(Math.abs(center(filter) - center(collections)) < 6, "Navigation shares the axis");
      assert.ok(
        status.bottom <= filter.top && filter.bottom <= collections.top,
        "The toolbar clears the status group without sharing its hit area",
      );
      const lastTileInFirstRow = app.locator("[data-selection-id]").nth(cover ? 2 : 3);
      const tile = await bounds(lastTileInFirstRow);
      const screenWidth = await lastTileInFirstRow.evaluate(
        (node) => node.ownerDocument.documentElement.clientWidth,
      );
      assert.ok(
        Math.abs(tile.right - screenWidth) < 1 &&
          tile.left < status.left &&
          tile.right > status.right,
        `${cover ? "Cover" : "Inner"} library photos reach the display edge behind the status group`,
      );
      await app.getByRole("tab", { name: "Months", exact: true }).waitFor();
    };
    await assertVerticalControls(unfolded);
    const viewport = await inner.evaluate((frame) => ({
      width: frame.contentWindow.innerWidth,
      height: frame.contentWindow.innerHeight,
      panelHeight: frame.parentElement.clientHeight,
    }));
    assert.ok(
      Math.abs(viewport.width / viewport.height - 1.423) < 0.01,
      `Inner viewport matches Duo proportions without raster stretching: ${JSON.stringify(viewport)}`,
    );
    assert.equal(viewport.panelHeight, viewport.height);
    // Uniform content separates shell shading/seam defects from photo brightness.
    await page.locator("iframe").evaluateAll((frames) => {
      for (const frame of frames) {
        const fill = frame.contentDocument.createElement("div");
        fill.dataset.foldProbe = "";
        fill.style.cssText = "position:fixed;inset:0;background:black;z-index:2147483647";
        frame.contentDocument.body.append(fill);
      }
    });
    const cornerProbes = await inner.evaluate((frame) => {
      const panel = frame.parentElement;
      const origin = panel.parentElement.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(panel).transform);
      // Just inside the bezel opening, where a circular clip can expose the page behind it.
      return Object.fromEntries(
        [8, frame.clientWidth - 8].map((x) => {
          const p = matrix.transformPoint(new DOMPoint(x, 9));
          return [x, { x: p.x + origin.x, y: p.y + origin.y }];
        }),
      );
    });
    const corners = await brightnessAt(page, await page.screenshot(), cornerProbes);
    assert.ok(
      Object.values(corners).every((value) => value < 100),
      `Inner screen corners must not expose the page backdrop: ${JSON.stringify(corners)}`,
    );
    await page.locator("iframe").evaluateAll((frames) => {
      for (const frame of frames) {
        frame.contentDocument.querySelector("[data-fold-probe]").style.background = "white";
      }
    });
    await slider.evaluate((input) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "135");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const probes = await page.evaluate(() => {
      const point = (title, x, y = 278) => {
        const panel = document.querySelector(`iframe[title="${title}"]`).parentElement;
        const origin = panel.parentElement.getBoundingClientRect();
        const p = new DOMMatrix(getComputedStyle(panel).transform).transformPoint(
          new DOMPoint(x, y),
        );
        return { x: p.x + origin.x, y: p.y + origin.y };
      };
      const left = point("Inner display", 395);
      const right = point("Inner display, right half", 0);
      return {
        fixed: point("Inner display", 65),
        moving: point("Inner display, right half", 350),
        seam: { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 },
        ...Object.fromEntries(
          [-2, -1, 0, 1, 2].flatMap((offset) => [
            [`rim-left-${offset}`, point("Inner display", 377 + offset, -5)],
            [`rim-right-${offset}`, point("Inner display, right half", 18 + offset, -5)],
            [`rim-bottom-left-${offset}`, point("Inner display", 377 + offset, 561)],
            [`rim-bottom-right-${offset}`, point("Inner display, right half", 18 + offset, 561)],
          ]),
        ),
      };
    });
    const pixels = await page.screenshot();
    const brightness = await brightnessAt(page, pixels, probes);
    assert.ok(
      brightness.fixed > 245,
      `Stationary screen stays clear: ${JSON.stringify(brightness)}`,
    );
    assert.ok(
      brightness.moving < 200,
      `Moving free edge retains frosting: ${JSON.stringify(brightness)}`,
    );
    assert.ok(
      brightness.seam > 225,
      `Hinge content must not expose a black gap: ${JSON.stringify(brightness)}`,
    );
    const rim = Object.entries(brightness).filter(([name]) => name.startsWith("rim-"));
    assert.ok(
      rim.every(([, value]) => value < 100),
      `Black bezel joins must cover bright metal cut edges: ${JSON.stringify(rim)}`,
    );
    await slider.evaluate((element) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, "45");
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const occlusionProbes = await page.evaluate(() => {
      const panel = document.querySelector('iframe[title="Cover display"]').parentElement;
      const origin = panel.parentElement.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(panel).transform);
      // Outside the cover screen, its foreground rim must cover the stationary screen.
      return Object.fromEntries(
        [260, 280, 300, 320, 340].flatMap((x) =>
          [-8, -5, 561, 564].map((y) => {
            const p = matrix.transformPoint(new DOMPoint(x, y));
            return [`${x},${y}`, { x: p.x + origin.x, y: p.y + origin.y }];
          }),
        ),
      );
    });
    const composite = await brightnessAt(page, await page.screenshot(), occlusionProbes);
    await inner.evaluate((frame) => {
      frame.parentElement.parentElement.style.display = "none";
    });
    const hardware = await brightnessAt(page, await page.screenshot(), occlusionProbes);
    await inner.evaluate((frame) => {
      frame.parentElement.parentElement.style.removeProperty("display");
    });
    const occlusionErrors = Object.entries(composite).map(([name, value]) => [
      name,
      Math.abs(value - hardware[name]),
    ]);
    assert.ok(
      occlusionErrors.every(([, value]) => value < 10),
      `Foreground rim must match hardware without screen overpaint: ${JSON.stringify(occlusionErrors)}`,
    );
    await page.locator("iframe").evaluateAll((frames) => {
      for (const frame of frames) {
        frame.contentDocument.querySelector("[data-fold-probe]").style.background =
          "linear-gradient(90deg, white 394px, red 394px, red 396px, white 396px)";
      }
    });
    await slider.evaluate((element) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, "90");
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.waitForTimeout(300);
    const hingeTransform = await page.evaluate(() => {
      const panel = (title) => document.querySelector(`iframe[title="${title}"]`).parentElement;
      const fixed = panel("Inner display");
      const moving = panel("Inner display, right half");
      const rect = fixed.parentElement.getBoundingClientRect();
      const a = new DOMMatrix(getComputedStyle(fixed).transform);
      const b = new DOMMatrix(getComputedStyle(moving).transform);
      const left = a.transformPoint(new DOMPoint(377, 278));
      const right = b.transformPoint(new DOMPoint(18, 278));
      // Cubic midpoint from the two visible endpoints and their tangent vectors.
      const expected = a
        .inverse()
        .transformPoint(
          new DOMPoint(
            (left.x + right.x) / 2 + ((a.a - b.a) * 36) / 8,
            (left.y + right.y) / 2 + ((a.b - b.b) * 36) / 8,
          ),
        );
      return {
        matrix: a.toString(),
        x: rect.x,
        y: rect.y,
        expected: { x: expected.x, y: expected.y },
      };
    });
    const hingePixels = await page.screenshot();
    const stripeCenter = await page.evaluate(
      async ({ png, transform }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const matrix = new DOMMatrix(transform.matrix);
        let sum = 0;
        let weight = 0;
        for (let x = 386; x <= 403; x += 0.125) {
          const point = matrix.transformPoint(new DOMPoint(x, transform.expected.y));
          const [r, g] = context.getImageData(
            Math.floor((point.x + transform.x) * devicePixelRatio),
            Math.floor((point.y + transform.y) * devicePixelRatio),
            1,
            1,
          ).data;
          const red = Math.max(0, r - g);
          sum += x * red;
          weight += red;
        }
        return weight > 0 ? sum / weight : null;
      },
      { png: hingePixels.toString("base64"), transform: hingeTransform },
    );
    assert.ok(
      stripeCenter !== null && Math.abs(stripeCenter - hingeTransform.expected.x) < 0.65,
      `Crease content follows the curved midpoint: actual ${stripeCenter}, expected ${hingeTransform.expected.x}`,
    );
    await page.locator("iframe").evaluateAll((frames) => {
      for (const frame of frames) frame.contentDocument.querySelector("[data-fold-probe]").remove();
    });
    await slider.press("End");
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 720 },
      { width: 1280, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      // Let ResizeObserver deliver, including any subsequent feedback cycle.
      await page.waitForTimeout(600);
      assert.ok(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <= innerWidth &&
            document.documentElement.scrollHeight <= innerHeight,
        ),
        `Device frame must fit ${viewport.width} × ${viewport.height}: ${await page.evaluate(() => JSON.stringify({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }))}`,
      );
    }
    const initial = await inner.boundingBox();
    const initialProjection = await inner.evaluate((frame) => frame.parentElement.style.transform);
    await page.mouse.move(50, 250);
    await page.mouse.down();
    await page.mouse.move(190, 290, { steps: 8 });
    await page.mouse.up();
    assert.notEqual(
      await inner.evaluate((frame) => frame.parentElement.style.transform),
      initialProjection,
    );
    await page.getByRole("button", { name: "Reset view" }).click();
    const reset = await inner.boundingBox();
    assert.ok(Math.abs(reset.x - initial.x) < 0.1 && Math.abs(reset.width - initial.width) < 0.1);
    // A full orbit must expose the rear cameras, not clamp at the old front-only limit.
    const stage = await page.locator("canvas").boundingBox();
    await page.mouse.move(25, 350);
    await page.mouse.down();
    await page.mouse.move(25 + stage.height, 350, { steps: 20 });
    await page.mouse.up();
    assert.equal(await inner.evaluate((frame) => frame.parentElement.style.display), "none");
    const rearProbes = await page.evaluate(() => {
      const cover = document.querySelector('iframe[title="Cover display"]').parentElement;
      const bounds = cover.parentElement.getBoundingClientRect();
      const matrix = new DOMMatrix(cover.style.transform);
      // Extrapolate the cover's live projection onto the adjacent rear plate.
      return Object.fromEntries(
        [
          ["camera-one", 645, 60],
          ["camera-two", 734, 60],
          ["rear-plate", 645, 220],
        ].map(([name, x, y]) => {
          const point = matrix.transformPoint(new DOMPoint(x, y));
          return [name, { x: point.x + bounds.x, y: point.y + bounds.y }];
        }),
      );
    });
    const rearBrightness = await brightnessAt(page, await page.screenshot(), rearProbes);
    assert.ok(
      rearBrightness["rear-plate"] > rearBrightness["camera-one"] + 80 &&
        rearBrightness["rear-plate"] > rearBrightness["camera-two"] + 80,
      `Both camera apertures must render on the light rear plate: ${JSON.stringify(rearBrightness)}`,
    );
    await page.getByRole("button", { name: "Reset view" }).click();
    const innerApp = page.frameLocator('iframe[title="Inner display"]');
    const coverApp = page.frameLocator('iframe[title="Cover display"]');
    await innerApp.locator("main").evaluate((main) => {
      main.scrollTop = 360;
      main.dispatchEvent(new Event("scroll"));
    });
    const firstVisible = (main) =>
      [...main.querySelectorAll("[data-selection-id]")].find(
        (tile) => tile.getBoundingClientRect().bottom > main.getBoundingClientRect().top,
      )?.dataset.selectionId;
    const anchor = await innerApp.locator("main").evaluate(firstVisible);
    const relativePosition = (tile) =>
      (tile.getBoundingClientRect().top - tile.closest("main").getBoundingClientRect().top) /
      tile.getBoundingClientRect().height;
    const sourcePosition = await innerApp
      .locator(`[data-selection-id="${anchor}"]`)
      .evaluate(relativePosition);
    await page.locator('iframe[title="Cover display"]').evaluate((frame) => {
      const model = frame.photosModel;
      const ready = model.ready;
      model.ready = (snapshot) => {
        if (!snapshot.interactive) ready(snapshot);
      };
      frame.releasePaint = () => {
        model.ready = ready;
        ready(model.getSnapshot());
        delete frame.releasePaint;
      };
    });
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await page.waitForFunction(
      () =>
        document.querySelector('iframe[title="Cover display"]').photosModel.getSnapshot()
          .interactive,
    );
    assert.equal(
      await page
        .locator('iframe[title="Cover display"]')
        .evaluate((frame) => Boolean(frame.closest("[inert]"))),
      true,
      "A previously painted screen must stay inert until its active presentation acknowledges paint",
    );
    await page.locator('iframe[title="Cover display"]').evaluate((frame) => frame.releasePaint());
    await page.waitForFunction(
      () => !document.querySelector('iframe[title="Cover display"]').closest("[inert]"),
    );
    await assertVerticalControls(coverApp, true);
    await page.waitForFunction(
      ({ id, offset }) => {
        const doc = document.querySelector('iframe[title="Cover display"]').contentDocument;
        const tile = doc.querySelector(`[data-selection-id="${id}"]`);
        const rect = tile.getBoundingClientRect();
        return (
          Math.abs(
            (rect.top - tile.closest("main").getBoundingClientRect().top) / rect.height - offset,
          ) < 0.02
        );
      },
      { id: anchor, offset: sourcePosition },
    );
    const coverPosition = await coverApp
      .locator(`[data-selection-id="${anchor}"]`)
      .evaluate(relativePosition);
    assert.ok(
      coverPosition > -1 && Math.abs(coverPosition - sourcePosition) < 0.02,
      `Narrow layout must retain photo ${anchor} and its relative offset: ${coverPosition} vs ${sourcePosition}`,
    );
    const coverFilter = coverApp.getByRole("button", { name: "Sort and filter" });
    await coverFilter.press("Enter");
    const coverMenu = coverApp.getByRole("menu", { name: "Sort and filter" });
    assert.equal(await coverMenu.getAttribute("data-side"), "left");
    await page.keyboard.press("Escape");
    await coverMenu.waitFor({ state: "hidden" });
    assert.ok(
      await coverFilter.evaluate((button) => button.ownerDocument.activeElement === button),
    );
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    assert.equal(await innerApp.locator("main").evaluate(firstVisible), anchor);
    await innerApp.getByRole("button", { name: "Search", exact: true }).click();
    const search = innerApp.getByRole("searchbox", { name: "Search photos" });
    await search.waitFor();
    assert.equal(await innerApp.locator("main").evaluate(firstVisible), anchor);
    assert.equal(await innerApp.getByRole("region", { name: "Search suggestions" }).count(), 0);
    assert.equal(await innerApp.getByRole("button", { name: "Sort and filter" }).count(), 0);
    await search.fill("中文照片");
    await search.evaluate((input) => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
      );
    });
    assert.deepEqual(
      await inner.evaluate((frame) => frame.photosModel.getSnapshot().state.recentSearches),
      [],
      "Choosing an IME candidate must not submit search",
    );
    await search.evaluate((input) =>
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true }),
      ),
    );
    assert.equal(await search.count(), 1, "IME Escape must not close search");
    assert.equal(
      await search.inputValue(),
      "中文照片",
      "IME Escape must not clear text through the SDK",
    );
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    const focusedHost = await page.evaluateHandle(() => document.activeElement);
    assert.equal(
      await slider.inputValue(),
      "180",
      "Keep the source editable until composition ends",
    );
    await search.evaluate((input) => {
      input.setSelectionRange(1, 3, "backward");
      input.dispatchEvent(
        new CompositionEvent("compositionend", { data: "中文照片", bubbles: true }),
      );
      input.dispatchEvent(
        new InputEvent("input", { data: "中文照片", inputType: "insertText", bubbles: true }),
      );
    });
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    assert.equal(
      await coverApp.getByRole("searchbox", { name: "Search photos" }).inputValue(),
      "中文照片",
    );
    assert.equal(
      await page.evaluate((element) => element === document.activeElement, focusedHost),
      true,
      "Handoff must not steal focus from host controls",
    );
    const coverSearch = coverApp.getByRole("searchbox", { name: "Search photos" });
    await page.waitForFunction(
      () => !document.querySelector('iframe[title="Cover display"]').closest("[inert]"),
    );
    await coverSearch.focus();
    await coverSearch.evaluate(() => new Promise(requestAnimationFrame));
    assert.deepEqual(
      await coverSearch.evaluate((input) => [
        input.selectionStart,
        input.selectionEnd,
        input.selectionDirection,
      ]),
      [1, 3, "backward"],
      "Returning to the screen restores the semantic field and backward selection",
    );
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await search.focus();
    await search.evaluate(() => new Promise(requestAnimationFrame));
    assert.deepEqual(
      await search.evaluate((input) => [
        input.selectionStart,
        input.selectionEnd,
        input.selectionDirection,
      ]),
      [1, 3, "backward"],
    );
    if (engine === chromium) {
      await search.fill("");
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.imeSetComposition", {
        text: "zhong",
        selectionStart: 5,
        selectionEnd: 5,
      });
      assert.equal(await search.inputValue(), "zhong");
      // A programmatic hinge request leaves native composition focused in its source document.
      await page.getByRole("button", { name: "Fold", exact: true }).dispatchEvent("click");
      assert.equal(await slider.inputValue(), "180");
      await cdp.send("Input.insertText", { text: "中文" });
      await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
      await page.waitForFunction(() => {
        const doc = document.querySelector('iframe[title="Cover display"]').contentDocument;
        return doc.activeElement === doc.querySelector('input[name="photos-search"]');
      });
      assert.equal(
        await coverSearch.inputValue(),
        "中文",
        "Native Chromium composition commits before the focused field changes documents",
      );
      await page.getByRole("button", { name: "Unfold", exact: true }).click();
      await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
      await search.focus();
      await search.evaluate(() => new Promise(requestAnimationFrame));
      await cdp.detach();
    }
    await innerApp.getByRole("searchbox", { name: "Search photos" }).fill("Forest");
    await innerApp.locator("[data-selection-id]").nth(2).waitFor();
    assert.equal(await innerApp.locator("[data-selection-id]").count(), 3);
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    assert.equal(
      await coverApp.getByRole("searchbox", { name: "Search photos" }).inputValue(),
      "Forest",
      "Cover must retain the inner screen's search, not mount an independent app",
    );
    await coverApp.getByRole("button", { name: "Close search" }).click();
    await coverApp.getByRole("button", { name: "Select", exact: true }).click();
    await coverApp.locator('[data-selection-id="19"]').click();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    assert.equal(
      await innerApp.locator('[data-selection-id="19"]').getAttribute("aria-pressed"),
      "true",
    );
    await innerApp.getByRole("button", { name: "Cancel selection" }).click();
    await innerApp.locator('[data-selection-id="0"]').click();
    const countBeforeDuplicate = await inner.evaluate(
      (frame) => frame.photosModel.getSnapshot().state.sources.length,
    );
    await innerApp.getByRole("button", { name: "Photo options", exact: true }).click();
    await innerApp.getByRole("menu", { name: "Photo options", exact: true }).press("Escape");
    await innerApp
      .getByRole("menu", { name: "Photo options", exact: true })
      .waitFor({ state: "hidden" });
    await innerApp.getByRole("button", { name: "Photo options", exact: true }).click();
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp.getByRole("menu", { name: "Photo options", exact: true }).waitFor();
    await coverApp.getByRole("menuitem", { name: "Duplicate", exact: true }).click();
    assert.equal(
      await inner.evaluate((frame) => frame.photosModel.getSnapshot().state.sources.length),
      countBeforeDuplicate + 1,
      "A continued menu action must execute once, not once per projection",
    );
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp
      .getByRole("menu", { name: "Photo options", exact: true })
      .waitFor({ state: "hidden" });
    await innerApp.getByRole("button", { name: "Photo options", exact: true }).click();
    await innerApp.getByRole("menuitem", { name: "Add to", exact: true }).press("ArrowRight");
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp.getByRole("menu", { name: "Add to", exact: true }).waitFor();
    await coverApp.getByRole("menuitem", { name: "Forest", exact: true }).click();
    assert.equal(
      await inner.evaluate((frame) =>
        frame.photosModel.getSnapshot().state.albums.get("Forest")?.has(0),
      ),
      true,
    );
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("button", { name: "Photo options", exact: true }).click();
    await innerApp.getByRole("menuitem", { name: "Hide", exact: true }).click();
    await innerApp.getByRole("alertdialog", { name: "Hide this photo?" }).waitFor();
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp
      .getByRole("alertdialog", { name: "Hide this photo?" })
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("alertdialog").waitFor({ state: "hidden" });
    assert.equal(
      await inner.evaluate((frame) => frame.photosModel.getSnapshot().state.hiddenPhotos.has(0)),
      false,
    );
    await innerApp.getByRole("button", { name: "Photo options", exact: true }).click();
    await innerApp
      .getByRole("menuitem", { name: "Adjust Information", exact: true })
      .press("ArrowRight");
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp.getByRole("menu", { name: "Adjust Information", exact: true }).waitFor();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("menuitem", { name: "Edit Caption", exact: true }).click();
    const caption = innerApp.getByRole("textbox", { name: "Caption", exact: true });
    await caption.fill("海边的中文说明");
    await caption.evaluate((input) => {
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true }),
      );
    });
    assert.equal(await caption.count(), 1, "IME Escape must not dismiss photo information");
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    assert.equal(await slider.inputValue(), "180");
    await caption.evaluate((input) => {
      input.setSelectionRange(1, 5, "backward");
      input.dispatchEvent(new CompositionEvent("compositionend", { data: "中文", bubbles: true }));
    });
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await page.waitForFunction(
      () => !document.querySelector('iframe[title="Cover display"]').closest("[inert]"),
    );
    const coverCaption = coverApp.getByRole("textbox", { name: "Caption", exact: true });
    assert.equal(await coverCaption.inputValue(), "海边的中文说明");
    await coverCaption.focus();
    await coverCaption.evaluate(() => new Promise(requestAnimationFrame));
    assert.deepEqual(
      await coverCaption.evaluate((input) => [
        input.selectionStart,
        input.selectionEnd,
        input.selectionDirection,
      ]),
      [1, 5, "backward"],
    );
    await page.keyboard.insertText("记忆");
    assert.equal(await coverCaption.inputValue(), "海记忆说明");
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    assert.equal(await caption.inputValue(), "海记忆说明");
    await page.waitForFunction(
      () => !document.querySelector('iframe[title="Inner display"]').closest("[inert]"),
    );
    await caption.press("Escape");
    await innerApp.locator("[data-photo-information]").waitFor({ state: "hidden" });
    await innerApp.getByRole("button", { name: "Edit photo", exact: true }).click();
    await innerApp.getByRole("slider", { name: "Exposure", exact: true }).focus();
    await innerApp.getByRole("slider", { name: "Exposure", exact: true }).press("ArrowRight");
    const exposure = await innerApp
      .getByRole("slider", { name: "Exposure", exact: true })
      .inputValue();
    assert.notEqual(exposure, "0");
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp
      .getByRole("slider", { name: "Exposure", exact: true })
      .waitFor({ timeout: 10000 });
    assert.equal(
      await coverApp.getByRole("slider", { name: "Exposure", exact: true }).inputValue(),
      exposure,
    );
    await coverApp.getByRole("button", { name: "Undo edit", exact: true }).click();
    assert.equal(
      await coverApp.getByRole("slider", { name: "Exposure", exact: true }).inputValue(),
      "0",
    );
    await coverApp.getByRole("button", { name: "Redo edit", exact: true }).click();
    assert.equal(
      await coverApp.getByRole("slider", { name: "Exposure", exact: true }).inputValue(),
      exposure,
    );
    await coverApp.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("button", { name: "Discard changes", exact: true }).click();
    await innerApp.getByRole("button", { name: "Edit photo", exact: true }).click();
    assert.equal(
      await innerApp.getByRole("slider", { name: "Exposure", exact: true }).inputValue(),
      "0",
    );
    await innerApp.getByRole("slider", { name: "Exposure", exact: true }).focus();
    await innerApp.getByRole("slider", { name: "Exposure", exact: true }).press("ArrowRight");
    await innerApp.getByRole("tab", { name: "Crop", exact: true }).click();
    await innerApp.getByRole("button", { name: "Rotate left", exact: true }).click();
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    assert.equal(
      await coverApp.getByRole("tab", { name: "Crop", exact: true }).getAttribute("aria-selected"),
      "true",
    );
    await coverApp.getByRole("button", { name: "Done", exact: true }).click();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("button", { name: "Edit photo", exact: true }).click();
    assert.equal(
      await inner.evaluate(
        (frame) => frame.photosModel.getSnapshot().state.edits.get(0).adjustments.rotation,
      ),
      270,
    );
    assert.equal(
      await innerApp.getByRole("slider", { name: "Exposure", exact: true }).inputValue(),
      exposure,
    );
    await innerApp.getByRole("button", { name: "Cancel", exact: true }).click();
    await innerApp.getByRole("button", { name: "Add to favorites", exact: true }).click();
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
    await coverApp.getByRole("dialog", { name: "Portrait in red" }).waitFor();
    assert.equal(
      await coverApp
        .getByRole("button", { name: "Remove from favorites", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await coverApp.getByRole("button", { name: "Close photo" }).click();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.waitForFunction((input) => input.value === "180", await slider.elementHandle());
    await innerApp.getByRole("dialog").waitFor({ state: "hidden" });
    await slider.focus();
    await slider.press("Home");
    for (let i = 0; i < 110; i++) await slider.press("ArrowRight");
    const mirror = page.locator('iframe[title="Inner display, right half"]');
    assert.equal(await mirror.evaluate((frame) => frame.parentElement.inert), true);
    assert.equal(await inner.evaluate((frame) => frame.parentElement.inert), true);
    const innerRevision = await innerApp.locator("main").getAttribute("data-photos-revision");
    assert.equal(
      await page
        .frameLocator('iframe[title="Inner display, right half"]')
        .locator("main")
        .getAttribute("data-photos-revision"),
      innerRevision,
    );
    await mirror.evaluate((frame) => frame.photosModel.set("query", "must not write"));
    assert.equal(
      await innerApp.locator("main").getAttribute("data-photos-revision"),
      innerRevision,
    );
    const projected = await mirror.evaluate((frame) => frame.parentElement.style.transform);
    assert.notEqual(
      projected,
      await inner.evaluate((frame) => frame.parentElement.style.transform),
    );
    await page.getByRole("button", { name: "Reset view" }).click();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    assert.equal(await slider.inputValue(), "0");
    // Reduced motion skips hinge animation, not the target document's paint acknowledgement.
    await page.waitForFunction(
      () => !document.querySelector('iframe[title="Cover display"]').parentElement.inert,
    );
    assert.equal(
      await page
        .locator('iframe[title="Cover display"]')
        .evaluate((frame) => frame.parentElement.inert),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(`${engine.name()}: device resize and fold/unfold passed`);
  } finally {
    await browser.close();
  }
}
