import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
// A correct settled screenshot can conceal a missing or replaced material during handoff.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, colorScheme });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/cn/docs/react/components/menu`);
      const trigger = page.getByRole("button", { name: "Actions", exact: true });
      await trigger.waitFor();
      await trigger.evaluate(
        (node) =>
          new Promise((resolve) => {
            const ready = () => {
              if (Object.keys(node).some((key) => key.startsWith("__reactProps$"))) resolve();
              else requestAnimationFrame(ready);
            };
            ready();
          }),
      );
      await trigger.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      const now = Date.now();
      await page.clock.install({ time: new Date(now) });
      await page.clock.pauseAt(new Date(now + 1000));
      await trigger.evaluate((node) => node.click());
      let sawMoving = false,
        sawResting = false,
        sawFitted = false;
      for (let frame = 0; frame < 80; frame++) {
        await page.clock.runFor(16);
        const state = await page.evaluate(() => {
          const card = document.querySelector('[data-lenso-slot="menu-popup"][data-open]');
          const lens = card?.querySelector("[data-material-lens]");
          if (!lens) return null;
          const resting = card
            .querySelector('[data-lenso-slot="menu-surface"]')
            .hasAttribute("data-material-resting");
          const owner = card.closest('[data-lenso-slot="menu-positioner"]');
          const nativePaint = owner.querySelector("[data-material-live-paints]");
          if (nativePaint && !window.handoffPaint) window.handoffPaint = nativePaint;
          return {
            resting,
            nativePaint: !!nativePaint,
            samePaint: nativePaint === window.handoffPaint,
            marked: lens.hasAttribute("data-material-paints"),
            fitted: !!lens.style.getPropertyValue("--lg-rim"),
            visible:
              card.querySelector('[data-lenso-slot="menu-surface"]').getBoundingClientRect().width >
              120,
          };
        });
        if (!state?.visible) continue;
        sawMoving ||= !state.resting;
        sawResting ||= state.resting;
        sawFitted ||= state.fitted;
        if (name === "webkit") {
          assert.ok(
            state.nativePaint && state.samePaint,
            "WebKit must retain one native paint through settling",
          );
          assert.ok(state.marked, "native paint must own the lens before it becomes visible");
        } else if (state.resting && !state.fitted) {
          assert.ok(state.marked, "the moving paint must remain until the fitted lens decodes");
        }
      }
      assert.ok(
        sawMoving && sawResting && sawFitted,
        `exercise the full cold handoff: ${JSON.stringify({ name, sawMoving, sawResting, sawFitted })}`,
      );
      await page.keyboard.press("Escape");
      await page.clock.runFor(800);
      assert.equal(await trigger.evaluate((node) => document.activeElement === node), true);
      assert.deepEqual(errors, []);
      console.log(`PASS ${name} ${colorScheme}: material remains owned through settling`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
