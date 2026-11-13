import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { assertSelectionInk } from "./selection-ink.mjs";

// Exercise the real docs composition: the Photos example does not include the
// docs caller's flex overrides, fixed positioning or browser-chrome resize.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const initial = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await initial.goto(`${base}/en/docs/react/components/tabs`);
    assert.ok(
      await initial
        .getByRole("navigation", { name: "Documentation navigation", exact: true })
        .isVisible(),
      `${name}: mobile glass navigation must exist before JavaScript loads`,
    );
    await initial.close();
    for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, colorScheme });
      await page.goto(`${base}/en/docs/react/components/tabs`);
      const nav = page.getByRole("navigation", { name: "Documentation navigation", exact: true });
      const group = nav.locator("[data-tab-bar-group]").first();
      await group.locator("[data-tab-bar-list]").waitFor();
      await page.waitForFunction(() =>
        document.querySelector('[aria-label="Documentation navigation"] [data-minimize-ready]'),
      );
      const tabs = page.locator('[data-component-story="Tabs"] [role="tablist"]').first();
      await tabs.locator('[aria-selected="true"]').waitFor();
      await page.waitForFunction(() =>
        document.querySelector('[data-component-story="Tabs"] [data-ready]'),
      );
      await assertSelectionInk(page, tabs, `${name}/${colorScheme}: Tabs playground`);
      await group
        .locator(":scope > [data-material] [data-lenso-live-rim]")
        .waitFor({ state: "attached" });
      await page.evaluate(() => {
        const rim = document.querySelector(
          '[aria-label="Documentation navigation"] [data-tab-bar-group] > [data-material] [data-lenso-live-rim]',
        );
        window.tabBarContinuity = { samples: 0, failures: [], frame: 0, ticks: 0, active: true };
        const sample = () => {
          const state = window.tabBarContinuity;
          const group = document.querySelector(
            '[aria-label="Documentation navigation"] [data-tab-bar-group]',
          );
          const lens = group?.querySelector(":scope > [data-material] [data-material-lens]");
          if (lens && state.failures.length < 8) {
            const current = lens.querySelector("[data-lenso-live-rim]");
            if (current !== rim || !lens.hasAttribute("data-material-live-rim"))
              state.failures.push(
                "The foreground rim must remain mounted through motion and settling",
              );
            else if (
              Math.abs(parseFloat(current.style.width) - lens.offsetWidth - 2) > 1 ||
              Math.abs(parseFloat(current.style.height) - lens.offsetHeight - 2) > 1
            )
              state.failures.push("The foreground rim must track the animated surface size");
          }
          if (group?.hasAttribute("data-tab-bar-resizing")) {
            state.samples++;
            const paintId = lens?.getAttribute("data-material-paints");
            const blur = paintId
              ? document.querySelector(`[data-material-local-paints="${paintId}"] > *`)
              : lens;
            if (!blur || !getComputedStyle(blur).backdropFilter.includes("blur("))
              state.failures.push("Moving glass must retain native blur");
            const content = group.querySelector(
              "[data-tab-bar-list] [data-current] [data-tab-bar-content]",
            );
            if (content) {
              const rect = group.getBoundingClientRect();
              const scale = rect.width / parseFloat(getComputedStyle(group).width);
              const icon = content.getBoundingClientRect();
              const progress = Number(group.style.getPropertyValue("--tab-bar-collapse"));
              const shift = parseFloat(group.style.getPropertyValue("--tab-bar-selected-shift"));
              const expected = 22 - shift * (1 - progress);
              const actual = (icon.left + icon.width / 2 - rect.left) / scale;
              if (Math.abs(actual - expected) > 1.5 && state.failures.length < 8)
                state.failures.push({ kind: "icon-drift", progress, actual, expected });
            }
          }
          if (state.active && state.ticks++ < 1200) state.frame = requestAnimationFrame(sample);
        };
        window.tabBarContinuity.frame = requestAnimationFrame(sample);
      });
      for (const height of [844, 724, 844]) {
        await page.setViewportSize({ width: 390, height });
        for (const top of [900, 450, 950, 0, 800]) {
          await page.evaluate(async (top) => {
            window.scrollTo(0, top);
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
          }, top);
        }
        await page.waitForFunction(() => {
          const group = document.querySelector(
            '[aria-label="Documentation navigation"] [data-tab-bar-group]',
          );
          return group?.style.getPropertyValue("--tab-bar-collapse") === "1";
        });
        const bounds = await group.boundingBox();
        assert.ok(
          Math.abs(bounds.width - 44) < 1 && Math.abs(bounds.height - 44) < 1,
          `${name}/${colorScheme}: minimized group stretched to ${JSON.stringify(bounds)}`,
        );
        const current = await group.locator("[data-tab-bar-list] [data-current]").boundingBox();
        assert.ok(Math.abs(current.x + current.width / 2 - bounds.x - bounds.width / 2) < 1);
        if (name === "webkit")
          await page.waitForFunction(() => {
            const nav = document.querySelector('[aria-label="Documentation navigation"]');
            return [...nav.querySelectorAll("[data-material-local-paints] > *")].some(
              (paint) =>
                paint.offsetParent === nav && getComputedStyle(paint).position === "absolute",
            );
          });
        await nav.getByRole("button", { name: "Expand navigation", exact: true }).click();
        await page.waitForFunction(() => {
          const group = document.querySelector(
            '[aria-label="Documentation navigation"] [data-tab-bar-group]',
          );
          return group?.style.getPropertyValue("--tab-bar-collapse") === "0";
        });
        assert.ok((await group.boundingBox()).width > 200);
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      const continuity = await page.evaluate(() => {
        const state = window.tabBarContinuity;
        state.active = false;
        cancelAnimationFrame(state.frame);
        return { samples: state.samples, failures: state.failures };
      });
      assert.ok(continuity.samples > 8);
      assert.deepEqual(continuity.failures, []);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(
        () =>
          document
            .querySelector('[aria-label="Documentation navigation"] [data-tab-bar-group]')
            .style.getPropertyValue("--tab-bar-collapse") === "0",
      );
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForFunction(() => {
        const value = Number(
          document
            .querySelector('[aria-label="Documentation navigation"] [data-tab-bar-group]')
            .style.getPropertyValue("--tab-bar-collapse"),
        );
        return value > 0 && value < 1;
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() => {
        const group = document.querySelector(
          '[aria-label="Documentation navigation"] [data-tab-bar-group]',
        );
        return (
          group.style.getPropertyValue("--tab-bar-collapse") === "1" &&
          !group.hasAttribute("data-tab-bar-resizing")
        );
      });
      await nav.getByRole("button", { name: "Expand navigation", exact: true }).click();
      await page.waitForFunction(() => {
        const group = document.querySelector(
          '[aria-label="Documentation navigation"] [data-tab-bar-group]',
        );
        return (
          group.style.getPropertyValue("--tab-bar-collapse") === "0" &&
          document.activeElement === group.querySelector("[data-tab-bar-list] [data-current]")
        );
      });
      console.log(
        `${name}/${colorScheme}: selected ink, collapse, expansion and anchored paints passed`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
