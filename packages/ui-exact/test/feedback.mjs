import assert from "node:assert/strict";
import path from "node:path";

const near = (actual, expected, message, tolerance = 0.5) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${message}: ${actual} != ${expected}`);

export async function checkFeedback(page, engine) {
  const bar = page.getByTestId("upload");
  const meter = page.getByTestId("storage");
  const circle = page.getByTestId("sync");
  const fill = page.getByTestId("upload-fill");
  const meterFill = page.getByTestId("storage-fill");
  const circleFill = page.getByTestId("sync-fill");
  const ratio = (id) =>
    page
      .getByTestId(id)
      .evaluate(
        (node) =>
          node.getBoundingClientRect().width / node.parentElement.getBoundingClientRect().width,
      );
  const settle = () =>
    page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime))
          .map((a) => a.finished.catch(() => {})),
      ),
    );
  for (const [node, role, label] of [
    [bar, "progressbar", "Upload"],
    [meter, "meter", "Storage"],
    [circle, "progressbar", "Sync"],
  ]) {
    assert.equal(await node.getAttribute("role"), role);
    assert.equal(await node.getAttribute("aria-label"), label);
    assert.equal(await node.getAttribute("aria-valuemin"), "10");
    assert.equal(await node.getAttribute("aria-valuemax"), "110");
    assert.equal(await node.getAttribute("aria-valuenow"), "35");
    assert.equal(await node.getAttribute("aria-valuetext"), "25%");
  }
  assert.equal(await bar.locator('[data-slot="progress-bar-output"]').textContent(), "25%");
  await settle();
  near(await ratio("upload-fill"), 0.25, "initial progress ratio", 0.005);
  near(await ratio("storage-fill"), 0.25, "initial meter ratio", 0.005);
  near(
    await circleFill.evaluate((node) => parseFloat(getComputedStyle(node).strokeDashoffset)),
    2 * Math.PI * 16 * 0.75,
    "initial ring offset",
  );
  assert.equal(await circleFill.evaluate((node) => node.tagName.toLowerCase()), "circle");
  assert.match(
    await circleFill.evaluate((node) => getComputedStyle(node).transform),
    /^matrix\(0, -1, 1, 0,/,
  );
  assert.notEqual(await circleFill.evaluate((node) => getComputedStyle(node).stroke), "none");
  assert.equal(await circle.locator("svg").getAttribute("aria-hidden"), "true");

  for (const [value, percent] of [
    [110, 100],
    [10, 0],
    [35, 25],
  ]) {
    await page.getByTestId("feedback-value").click();
    await settle();
    for (const node of [bar, meter, circle]) {
      assert.equal(await node.getAttribute("aria-valuenow"), String(value));
      assert.equal(await node.getAttribute("aria-valuetext"), `${percent}%`);
    }
    near(await ratio("upload-fill"), percent / 100, "clamped bar ratio", 0.005);
    near(await ratio("storage-fill"), percent / 100, "clamped meter ratio", 0.005);
    near(
      await circleFill.evaluate((node) => parseFloat(getComputedStyle(node).strokeDashoffset)),
      2 * Math.PI * 16 * (1 - percent / 100),
      "clamped ring offset",
    );
  }
  await page.getByTestId("feedback-text").click();
  assert.equal(await bar.getAttribute("aria-valuetext"), "35 of 110 files");
  assert.equal(await meter.locator('[data-slot="meter-output"]').textContent(), "35 of 110 files");
  await page.getByTestId("feedback-text").click();
  await page.getByTestId("feedback-range").click();
  await settle();
  for (const node of [bar, meter, circle]) {
    assert.equal(await node.getAttribute("aria-valuemin"), "110");
    assert.equal(await node.getAttribute("aria-valuemax"), "110");
    assert.equal(await node.getAttribute("aria-valuenow"), "110");
    assert.equal(await node.getAttribute("aria-valuetext"), "0%");
  }
  near(await ratio("upload-fill"), 0, "reversed range is empty", 0.005);
  await page.getByTestId("feedback-range").click();
  for (const [height, meterHeight, circleSize] of [
    [8, 12, 36],
    [2, 4, 20],
    [4, 8, 28],
  ]) {
    await page.getByTestId("feedback-size").click();
    near(
      await page.getByTestId("upload-track").evaluate((n) => n.getBoundingClientRect().height),
      height,
      "bar track height",
    );
    near(
      await page.getByTestId("storage-track").evaluate((n) => n.getBoundingClientRect().height),
      meterHeight,
      "meter track height",
    );
    near(
      await page.getByTestId("sync-track").evaluate((n) => n.getBoundingClientRect().width),
      circleSize,
      "ring size",
    );
  }
  const colors = new Set();
  for (let index = 0; index < 5; index++) {
    colors.add(await fill.evaluate((n) => getComputedStyle(n).backgroundColor));
    await page.getByTestId("feedback-color").click();
  }
  assert.equal(colors.size, 5);
  await page.getByTestId("feedback-disabled").click();
  for (const node of [bar, meter, circle]) {
    assert.equal(await node.getAttribute("aria-disabled"), "true");
    assert.equal(await node.evaluate((n) => getComputedStyle(n).opacity), "0.5");
  }
  await page.getByTestId("feedback-disabled").click();
  await page.getByTestId("feedback-direction").click();
  await settle();
  for (const id of ["upload-fill", "storage-fill"])
    near(
      await page
        .getByTestId(id)
        .evaluate(
          (node) =>
            node.getBoundingClientRect().right - node.parentElement.getBoundingClientRect().right,
        ),
      0,
      "RTL fill starts at the trailing edge",
    );
  await page.locator("#feedback-examples").screenshot({
    path: path.resolve(import.meta.dirname, `../.cache/example/${engine}-feedback-rtl.png`),
  });
  await page.getByTestId("feedback-direction").click();
  await page.getByTestId("feedback-indeterminate").click();
  for (const node of [bar, circle]) {
    assert.equal(
      await node.getAttribute("aria-valuenow"),
      null,
      "unknown progress has no numeric value",
    );
    assert.equal(await node.getAttribute("aria-valuetext"), "Processing");
  }
  assert.equal(await meter.getAttribute("aria-valuenow"), "35");
  await settle();
  near(await ratio("upload-fill"), 0.4, "unknown bar segment", 0.005);
  for (const id of ["upload-fill", "sync-track", "feedback-spinner"])
    assert.notEqual(
      await page.getByTestId(id).evaluate((n) => getComputedStyle(n).animationName),
      "none",
    );

  const spinner = page.getByRole("status", { name: "Loading files", exact: true });
  assert.equal(await spinner.locator("svg rect").count(), 8);
  assert.equal(await spinner.locator("svg").getAttribute("aria-hidden"), "true");
  for (const size of [32, 40, 22, 30]) {
    await page.getByTestId("feedback-spinner-size").click();
    near(
      await spinner.evaluate((n) => parseFloat(getComputedStyle(n).width)),
      size,
      "spinner size",
    );
    const small = size === 22;
    assert.equal(
      await spinner.locator("svg").getAttribute("viewBox"),
      small ? "0 0 22 22" : "0 0 30 30",
    );
    near(
      await spinner
        .locator("rect")
        .first()
        .evaluate((node) => parseFloat(getComputedStyle(node).width)),
      small ? 3 : 4,
      "spinner spoke thickness",
    );
  }
  const skeleton = page.getByTestId("feedback-skeleton");
  assert.equal(await skeleton.getAttribute("aria-hidden"), "true");
  assert.equal(await skeleton.evaluate((n) => n.inert), true);
  assert.equal(
    await skeleton.evaluate((n) => getComputedStyle(n, "::after").content),
    "none",
    "nested shimmer is painted by the parent",
  );
  assert.notEqual(await skeleton.evaluate((n) => getComputedStyle(n, "::before").content), "none");
  assert.equal(
    await page
      .getByTestId("feedback-skeleton-line")
      .evaluate((n) => getComputedStyle(n, "::after").content),
    "none",
  );
  await page.getByTestId("feedback-animation").click();
  assert.notEqual(await skeleton.evaluate((n) => getComputedStyle(n).animationName), "none");
  await page.getByTestId("feedback-animation").click();
  assert.equal(await skeleton.evaluate((n) => getComputedStyle(n).animationName), "none");
  await page.getByTestId("feedback-animation").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector('[data-testid="feedback-spinner"]')).animationName ===
      "none",
  );
  for (const id of ["upload-fill", "sync-track"])
    assert.equal(
      await page.getByTestId(id).evaluate((n) => getComputedStyle(n).animationName),
      "none",
    );
  assert.equal(
    await skeleton.evaluate((n) => getComputedStyle(n, "::before").animationName),
    "none",
  );
  assert.equal(await circleFill.evaluate((n) => getComputedStyle(n).transitionProperty), "none");
  await page.getByTestId("feedback-animation").click();
  assert.equal(
    await skeleton.evaluate((n) => getComputedStyle(n).animationName),
    "none",
    "reduced motion also stops pulse",
  );
  await page.getByTestId("feedback-animation").click();
  await page.getByTestId("feedback-animation").click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const retired = await spinner.elementHandle();
  await page.getByTestId("feedback-visible").click();
  assert.equal(await spinner.count(), 0);
  assert.equal(
    await retired.evaluate((n) => n.getAnimations().length),
    0,
    "detached loading animation is released",
  );
  await retired.dispose();
  await page.getByTestId("feedback-visible").click();
  assert.equal(await bar.getAttribute("aria-valuenow"), null);
  await page.getByTestId("feedback-indeterminate").click();
  assert.equal(await bar.getAttribute("aria-valuenow"), "35");
  assert.equal(await meterFill.count(), 1);
}
