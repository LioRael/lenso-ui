import assert from "node:assert/strict";

export async function checkCallerStyles(page) {
  const registration = await page.evaluate(async () => {
    const { presentationCases } = await import(
      new URL("./modules/lenso-ui/presentation.js", document.baseURI).href
    );
    const { styleRules, inlineRule } = await import(
      new URL("./modules/style-config/index.js", document.baseURI).href
    );
    const target = 'quote"\\line\nend';
    const cases = presentationCases([{ ...styleRules[0], testId: target }]);
    const entry = cases.find(
      (item) =>
        item.attributes?.["data-testid"] === target &&
        item.data.lensoSize === "md" &&
        item.data.lensoVariant === "prominent",
    );
    const node = document.createElement("button");
    for (const [name, value] of Object.entries(entry.data)) node.dataset[name] = value;
    node.setAttribute("data-testid", target);
    const matched = node.matches(entry.selector);
    node.setAttribute("data-testid", "different");
    const different = node.matches(entry.selector);
    let inlineError = "";
    try {
      presentationCases([inlineRule]);
    } catch (error) {
      inlineError = error.message;
    }
    const { element } = await import(
      new URL("./modules/lenso-ui/browser.js", document.baseURI).href
    );
    const button = document.querySelector('[data-testid="action"]');
    const original = button.className;
    let runtimeError = "";
    try {
      element(
        { hatch: "lenso-ui", element: button, data: button.dataset },
        { xstyle: inlineRule.xstyle },
      );
    } catch (error) {
      runtimeError = error.message;
    }
    return {
      matched,
      different,
      inlineError,
      runtimeError,
      unchanged: button.className === original,
    };
  });
  assert.equal(registration.matched, true, "target ids are serialized as CSS strings");
  assert.equal(registration.different, false);
  assert.match(registration.inlineError, /declarative adapter for inline values/);
  assert.match(registration.runtimeError, /declarative adapter for inline values/);
  assert.equal(registration.unchanged, true, "unsupported values fail before class cleanup");
  const count = page.getByTestId("action");
  const favorite = page.getByTestId("favorite");
  const pin = page.getByTestId("favorite-icon");
  const skeleton = page.getByTestId("feedback-skeleton");
  const clear = page.getByTestId("feedback-skeleton-line-two");
  assert.equal(await count.evaluate((n) => getComputedStyle(n).borderRadius), "8px");
  assert.equal(await count.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  assert.equal(await pin.evaluate((n) => getComputedStyle(n).fontWeight), "600");
  assert.equal(await favorite.evaluate((n) => getComputedStyle(n).fontWeight), "700");
  assert.equal(
    await favorite.evaluate((n) => getComputedStyle(n).borderRadius),
    "0px",
    "null removes the global and base radius maps",
  );
  assert.equal(await pin.evaluate((n) => getComputedStyle(n).borderRadius), "10px");
  assert.equal(await skeleton.evaluate((n) => getComputedStyle(n).borderRadius), "16px");
  assert.equal(
    await clear.evaluate((n) => getComputedStyle(n).backgroundColor),
    "rgba(0, 0, 0, 0)",
    "null removes the base skeleton background",
  );
  assert.equal(await clear.evaluate((n) => getComputedStyle(n).borderRadius), "0px");
  await count.hover();
  assert.equal(await count.evaluate((n) => getComputedStyle(n).textDecorationLine), "underline");
  await page.setViewportSize({ width: 820, height: 844 });
  assert.equal(await count.evaluate((n) => getComputedStyle(n).borderRadius), "12px");
  await page.setViewportSize({ width: 390, height: 844 });
  await favorite.click();
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="favorite"]').hasAttribute("data-pressed"),
  );
  await favorite.evaluate((node) =>
    Promise.all(
      node
        .getAnimations()
        .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  assert.equal(await favorite.evaluate((n) => getComputedStyle(n).opacity), "1");
  const paint = await favorite.evaluate((n) => {
    const sample = document.createElement("span");
    sample.style.backgroundColor = "var(--lenso-status-success-indicator)";
    n.append(sample);
    const expected = getComputedStyle(sample).backgroundColor;
    sample.remove();
    return { actual: getComputedStyle(n).backgroundColor, expected };
  });
  assert.notEqual(paint.expected, "rgba(0, 0, 0, 0)");
  assert.equal(paint.actual, paint.expected, "caller tint survives native pointer release");
  await favorite.click();
  const stroke = await page.getByTestId("sync-track-circle").evaluate((n) => {
    const sample = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    sample.style.stroke = "var(--lenso-label-tertiary)";
    n.parentElement.append(sample);
    const expected = getComputedStyle(sample).stroke;
    sample.remove();
    return { actual: getComputedStyle(n).stroke, expected };
  });
  assert.equal(stroke.actual, stroke.expected, "SVG leaf receives the composed caller rule");
  assert.equal(await page.getByTestId("sync-track-circle").getAttribute("data-lenso-ready"), null);
}
