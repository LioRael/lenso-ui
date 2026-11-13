import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 495, height: 793 },
      colorScheme: "dark",
    });
    await page.goto(`${base}/en/docs/react/components/glass-container`);
    const group = page.getByRole("group", { name: "Grouped actions", exact: true });
    await group.evaluate((element) => element.scrollIntoView({ block: "center" }));
    const resting = () =>
      page.waitForFunction(() => {
        const surface = document.querySelector(
          "[data-toolbar-detachable] [data-lenso-glass-fusion]",
        );
        const copy = surface?.previousElementSibling;
        return (
          surface?.hasAttribute("data-lenso-fusion-field") &&
          !surface.hasAttribute("data-lenso-fusion-moving") &&
          copy &&
          getComputedStyle(copy).display !== "none" &&
          Number(getComputedStyle(copy).opacity) === 1
        );
      });
    await resting();
    for (const action of ["Split group", "Join group"]) {
      const result = await page.evaluate(async (label) => {
        const group = document.querySelector("[data-toolbar-detachable]");
        const surface = group.querySelector("[data-lenso-glass-fusion]");
        const buttons = [...group.querySelectorAll("[data-toolbar-item]")];
        const gaps = [];
        let animated = 0,
          hidden = 0;
        [...document.querySelectorAll("button")]
          .find((button) => button.textContent === label)
          .click();
        await new Promise((resolve) => {
          let started, previous;
          const frame = (now) => {
            started ??= now;
            if (previous !== undefined) gaps.push(now - previous);
            previous = now;
            const moving = group
              .getAnimations({ subtree: true })
              .some(
                (animation) =>
                  buttons.includes(animation.effect?.target) && animation.playState === "running",
              );
            if (moving && now - started > 40) {
              animated++;
              if (getComputedStyle(surface.previousElementSibling).display === "none") hidden++;
            }
            if (now - started < 650) requestAnimationFrame(frame);
            else resolve();
          };
          requestAnimationFrame(frame);
        });
        const ordered = [...gaps].sort((a, b) => a - b);
        return {
          animated,
          hidden,
          p95: ordered[Math.floor(ordered.length * 0.95)],
          slow: gaps.filter((gap) => gap > 32).length,
          retained: buttons.every((button) => button.isConnected),
        };
      }, action);
      assert.ok(result.animated > 0, `${name}: the real group transition must run`);
      assert.ok(result.retained, `${name}: motion must retain the controls`);
      if (name === "webkit")
        assert.equal(
          result.hidden,
          result.animated,
          "Copied SVG refraction must not repaint throughout the morph",
        );
      await resting();
      console.log(
        `${name}: ${action}, p95 ${result.p95.toFixed(1)}ms, ${result.slow} frames over 32ms; exact optics restored`,
      );
    }
    await page.getByRole("button", { name: "Split group", exact: true }).click();
    await page.waitForTimeout(80);
    await page.getByRole("button", { name: "Join group", exact: true }).click();
    await resting();
    await group.evaluate((element) => element.scrollIntoView({ block: "center" }));
    const increase = group.getByRole("button", { name: "Increase", exact: true });
    const box = await increase.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 12, box.y + box.height / 2 + 6);
    await page.waitForTimeout(40);
    if (name === "webkit")
      assert.equal(
        await group.locator("[data-lenso-glass-fusion]").getAttribute("data-lenso-fusion-moving"),
        "",
      );
    await page.mouse.up();
    await resting();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Split group", exact: true }).click();
    await resting();
    assert.equal(await group.getAttribute("data-toolbar-detached"), "true");
    assert.ok(
      await group
        .locator("button")
        .evaluateAll((buttons) =>
          buttons.every((button) => getComputedStyle(button).transitionDuration === "0s"),
        ),
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  } finally {
    await browser.close();
  }
}
