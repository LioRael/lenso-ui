import assert from "node:assert/strict";
import path from "node:path";

const resting = async (page, id, open) =>
  page.waitForFunction(
    ({ id, open }) => {
      const node = document.getElementById(id);
      const measure = node?.querySelector(":scope > [data-lenso-panel-measure]");
      if (!node || !measure) return false;
      const height = parseFloat(getComputedStyle(node).height);
      const natural = parseFloat(getComputedStyle(measure).height);
      return (
        !node.getAnimations().some((animation) => animation.playState === "running") &&
        Math.abs(height - (open ? natural : 0)) < 0.5
      );
    },
    { id, open },
  );

async function reducedMotion(page, reduce) {
  await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
  await page.waitForFunction((reduce) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches !== reduce) return false;
    const panel = document.getElementById("details-content");
    return !panel || (parseFloat(getComputedStyle(panel).transitionDuration) === 0) === reduce;
  }, reduce);
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

export async function checkDisclosure(page, engine) {
  const trigger = page.getByTestId("details-trigger");
  const panel = page.getByTestId("details-content");
  const draft = page.getByTestId("details-draft");
  const account = page.getByTestId("account-section-trigger");
  const privacy = page.getByTestId("privacy-section-trigger");
  const locked = page.getByTestId("locked-section-trigger");
  await page.waitForFunction(
    () => document.getElementById("details-content")?.style.opacity === "0",
  );
  assert.equal(await trigger.getAttribute("aria-expanded"), "false");
  assert.equal(await trigger.getAttribute("aria-controls"), "details-content");
  assert.equal(await panel.getAttribute("aria-labelledby"), "details-trigger");
  assert.equal(await panel.evaluate((node) => node.inert), true);
  assert.equal(await page.getByRole("textbox", { name: "Details draft" }).count(), 0);

  const motion = await page.evaluate(async () => {
    const panel = document.getElementById("details-content");
    const button = document.getElementById("details-trigger");
    const frame = () => new Promise(requestAnimationFrame);
    const height = () => parseFloat(getComputedStyle(panel).height);
    const run = async () => {
      const samples = [];
      const deadline = performance.now() + 1500;
      do {
        await frame();
        samples.push(height());
      } while (
        performance.now() < deadline &&
        panel.getAnimations().some((animation) => animation.playState === "running")
      );
      return samples;
    };
    button.click();
    const opening = await run();
    button.click();
    const closing = await run();
    button.click();
    for (let i = 0; i < 4; i++) await frame();
    const beforeClose = height();
    button.click();
    await Promise.resolve();
    const afterClose = height();
    for (let i = 0; i < 3; i++) await frame();
    const beforeReopen = height();
    button.click();
    await Promise.resolve();
    const afterReopen = height();
    const reopening = await run();
    return { opening, closing, beforeClose, afterClose, beforeReopen, afterReopen, reopening };
  });
  assert.ok(motion.opening.length > 3, "expansion must include intermediate frames");
  assert.ok(motion.closing.length > 3, "collapse must include intermediate frames");
  const fullHeight = motion.opening.at(-1);
  assert.ok(fullHeight > 40);
  assert.ok(motion.opening.some((height) => height > 1 && height < fullHeight - 1));
  for (let i = 1; i < motion.opening.length; i++)
    assert.ok(motion.opening[i] >= motion.opening[i - 1] - 0.5, "opening reversed direction");
  for (let i = 1; i < motion.closing.length; i++)
    assert.ok(motion.closing[i] <= motion.closing[i - 1] + 0.5, "closing reversed direction");
  assert.ok(motion.beforeClose > 1 && motion.beforeClose < fullHeight - 1);
  assert.ok(Math.abs(motion.beforeClose - motion.afterClose) < 1, "reversal jumped to an endpoint");
  assert.ok(
    Math.abs(motion.beforeReopen - motion.afterReopen) < 1,
    "reopening jumped to an endpoint",
  );
  assert.ok(Math.abs(motion.reopening.at(-1) - fullHeight) < 0.5);
  await resting(page, "details-content", true);

  await draft.fill("A retained draft");
  await draft.press("Enter");
  assert.equal(
    await page.getByTestId("details-submitted").textContent(),
    "Submitted: A retained draft",
  );
  await trigger.focus();
  await page.keyboard.press("Space");
  await resting(page, "details-content", false);
  assert.equal(await panel.evaluate((node) => node.inert), true);
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "account-section-trigger");
  await trigger.press("Enter");
  await resting(page, "details-content", true);
  assert.equal(await draft.inputValue(), "A retained draft");
  await draft.focus();
  await page.getByTestId("expanders-collapse").evaluate((node) => node.click());
  await resting(page, "details-content", false);
  assert.equal(await page.evaluate(() => document.activeElement?.id), "details-trigger");

  await page.getByTestId("expanders-disabled").click();
  for (const button of [trigger, account, privacy, locked])
    assert.equal(await button.isDisabled(), true);
  await trigger.evaluate((node) => node.click());
  assert.equal(await page.getByTestId("details-state").textContent(), "Details closed");
  await page.getByTestId("expanders-disabled").click();
  assert.equal(await locked.isDisabled(), true);
  await account.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "privacy-section-trigger");
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "account-section-trigger");
  await page.keyboard.press("End");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "privacy-section-trigger");
  await page.keyboard.press("Home");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "account-section-trigger");
  const nested = page.getByTestId("nested-one-trigger");
  await nested.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "nested-two-trigger");
  await page.keyboard.press("Enter");
  await resting(page, "nested-two-content", true);
  await resting(page, "account-section-content", true);
  assert.equal(await page.getByTestId("nested-state").textContent(), "Nested: two");
  assert.equal(await page.getByTestId("accordion-state").textContent(), "Selected: account");

  await privacy.click();
  await resting(page, "privacy-section-content", true);
  await resting(page, "account-section-content", false);
  assert.equal(await page.getByTestId("accordion-state").textContent(), "Selected: privacy");
  await page.getByTestId("accordion-multiple").click();
  await account.click();
  assert.equal(await account.getAttribute("aria-expanded"), "true");
  assert.equal(await privacy.getAttribute("aria-expanded"), "true");
  await privacy.click();
  assert.equal(await page.getByTestId("accordion-state").textContent(), "Selected: account");
  await page.getByTestId("accordion-multiple").click();
  await locked.evaluate((node) => node.click());
  assert.equal(await page.getByTestId("accordion-state").textContent(), "Selected: account");

  await page.getByTestId("accordion-orientation").click();
  await account.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "account-section-trigger");
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "privacy-section-trigger");
  await page.getByTestId("settings").evaluate((node) => (node.dir = "rtl"));
  await account.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "privacy-section-trigger");
  await page.getByTestId("accordion-loop").click();
  await privacy.focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "privacy-section-trigger");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => document.activeElement?.id), "account-section-trigger");
  await page.getByTestId("settings").evaluate((node) => (node.dir = "ltr"));
  await page.getByTestId("accordion-orientation").click();

  await page.getByTestId("accordion-variant").click();
  assert.equal(
    await page.getByTestId("settings").evaluate((node) => getComputedStyle(node).backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  await page.getByTestId("accordion-separators").click();
  assert.equal(
    await page
      .getByTestId("account-section")
      .evaluate((node) => getComputedStyle(node, "::after").display),
    "none",
  );
  await page.getByTestId("accordion-variant").click();
  await page.getByTestId("accordion-separators").click();
  assert.notEqual(
    await page
      .getByTestId("account-section")
      .evaluate((node) => getComputedStyle(node, "::after").display),
    "none",
  );

  await trigger.click();
  await resting(page, "details-content", true);
  const beforeGrowth = await panel.evaluate((node) => node.getBoundingClientRect().height);
  await page.getByTestId("expanders-tall").click();
  await resting(page, "details-content", true);
  assert.ok((await panel.evaluate((node) => node.getBoundingClientRect().height)) > beforeGrowth);
  await page.setViewportSize({ width: 820, height: 844 });
  await resting(page, "details-content", true);
  await page.setViewportSize({ width: 390, height: 844 });
  await resting(page, "details-content", true);

  await trigger.click();
  await resting(page, "details-content", false);
  await reducedMotion(page, true);
  await trigger.click();
  await resting(page, "details-content", true);
  assert.equal(await panel.evaluate((node) => node.getAnimations().length), 0);
  await trigger.click();
  await resting(page, "details-content", false);
  await reducedMotion(page, false);
  await trigger.evaluate((node) => node.click());
  await page.waitForFunction(
    () => document.getElementById("details-content").getAnimations().length > 0,
  );
  await reducedMotion(page, true);
  await resting(page, "details-content", true);
  assert.equal(await panel.evaluate((node) => node.getAnimations().length), 0);
  await reducedMotion(page, false);

  await trigger.click();
  await resting(page, "details-content", false);
  await trigger.evaluate((node) => node.click());
  await page.waitForFunction(
    () => document.getElementById("details-content").getAnimations().length > 0,
  );
  const previous = await panel.elementHandle();
  await page.getByTestId("expanders-mounted").evaluate((node) => node.click());
  assert.equal(await trigger.count(), 0);
  assert.equal(await previous.evaluate((node) => node.isConnected), false);
  assert.equal(await previous.evaluate((node) => node.getAnimations().length), 0);
  const releasedStyle = await previous.evaluate((node) => node.getAttribute("style"));
  await reducedMotion(page, true);
  assert.equal(await previous.evaluate((node) => node.getAttribute("style")), releasedStyle);
  await reducedMotion(page, false);
  await page.getByTestId("expanders-mounted").click();
  await resting(page, "details-content", true);
  assert.equal(await draft.inputValue(), "A retained draft");
  assert.equal(await account.getAttribute("aria-expanded"), "true");
  await previous.dispose();
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-disclosure-motion.json`),
    JSON.stringify(motion, null, 2),
  );
}
