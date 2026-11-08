import assert from "node:assert/strict";
import { createFirstPaintServer } from "./first-paint-server.mjs";
import { chromium, webkit } from "playwright";

const server = await createFirstPaintServer();

function tabsGeometry() {
  return [...document.querySelectorAll('[data-case] [data-slot="tabs-list"]')].map((list) => {
    const tab = list.querySelector('[data-slot="tabs-tab"][data-active]');
    const tint = list.querySelector('[data-slot="tabs-tint"]');
    const t = tab?.getBoundingClientRect(),
      i = tint.getBoundingClientRect();
    const inset =
      parseFloat(getComputedStyle(list).getPropertyValue("--lg-tabs-indicator-inset")) || 0;
    return {
      name: list.closest("[data-case]").dataset.case,
      styled: getComputedStyle(list).position === "relative",
      ready: list.hasAttribute("data-ready"),
      selected: !!tab,
      opacity: Number(getComputedStyle(tint).opacity),
      errors: t
        ? [
            i.x - t.x - inset,
            i.y - t.y - inset,
            i.width - t.width + 2 * inset,
            i.height - t.height + 2 * inset,
          ]
        : [],
    };
  });
}
function tabBarGeometry() {
  const group = document.querySelector('[data-case="tab-bar"] [data-tab-bar-group]');
  const current = group.querySelector("[data-current]");
  const ink = group.hasAttribute("data-indicator-ready")
    ? group.querySelector('[data-slot="tab-bar-indicator"]')
    : current.querySelector("[data-tab-bar-fallback]");
  const t = current.getBoundingClientRect(),
    i = ink.getBoundingClientRect();
  return [i.x - t.x, i.y - t.y, i.width - t.width, i.height - t.height];
}
function boxes() {
  return [...document.querySelectorAll("[data-check-box]")].map((node) => {
    const origin = node.closest("[data-case]").getBoundingClientRect(),
      r = node.getBoundingClientRect();
    return {
      name: `${node.closest("[data-case]").dataset.case}/${node.dataset.checkBox}`,
      visible:
        getComputedStyle(node).visibility !== "hidden" && getComputedStyle(node).display !== "none",
      values: [r.x - origin.x, r.y - origin.y, r.width, r.height],
    };
  });
}
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  for (const [engineName, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      for (const theme of ["light", "dark"]) {
        const staticPage = await browser.newPage({ javaScriptEnabled: false });
        await staticPage.goto(`${base}__first-paint?theme=${theme}`);
        const initialTabs = await staticPage.evaluate(tabsGeometry);
        assert.equal(initialTabs.length, 6);
        for (const tab of initialTabs) {
          assert.equal(tab.ready, false);
          assert.ok(
            tab.selected ? tab.errors.every((error) => Math.abs(error) < 1) : tab.opacity === 0,
            `${engineName}/${theme}: bad SSR indicator ${JSON.stringify(tab)}`,
          );
        }
        const initialBoxes = await staticPage.evaluate(boxes);
        assert.ok(
          (await staticPage.evaluate(tabBarGeometry)).every((value) => Math.abs(value) < 1),
        );
        assert.equal(
          await staticPage
            .locator('[data-case="custom-height-padding"] [data-slot="tabs-indicator"]')
            .evaluate((node) => getComputedStyle(node).backgroundColor),
          "rgb(90, 40, 180)",
        );
        await staticPage.close();
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await page.addInitScript({
          content: `
          window.firstPaintTabFrames = []; window.sampleTabs = true;
          const readTabs = ${tabsGeometry.toString()};
          function sampleTabs() {
            window.firstPaintTabFrames.push(...readTabs().filter(tab => tab.styled));
            if (window.sampleTabs) requestAnimationFrame(sampleTabs);
          }
          requestAnimationFrame(sampleTabs);
        `,
        });
        let releaseClient;
        const clientGate = new Promise((resolve) => {
          releaseClient = resolve;
        });
        await page.route("**/test/first-paint-fixture.client.tsx*", async (route) => {
          await clientGate;
          await route.continue();
        });
        await page.addInitScript(() => {
          window.sliderFrames = [];
          window.sampleSlider = true;
          function sample() {
            const control = document.querySelector(
              '[data-case="slider"] [data-slot="slider-control"]',
            );
            const thumb = control?.querySelector('[data-slot="slider-thumb"]');
            if (
              thumb &&
              getComputedStyle(thumb).visibility !== "hidden" &&
              getComputedStyle(control).position === "relative"
            ) {
              const c = control.getBoundingClientRect(),
                t = thumb.getBoundingClientRect();
              const input = thumb.querySelector('input[type="range"]');
              const fraction =
                (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
              window.sliderFrames.push(
                t.x + t.width / 2 - c.x - t.width / 2 - (c.width - t.width) * fraction,
              );
            }
            if (window.sampleSlider) requestAnimationFrame(sample);
          }
          requestAnimationFrame(sample);
        });
        await page.goto(`${base}__first-paint?theme=${theme}`, { waitUntil: "commit" });
        await page.waitForFunction(() => {
          const thumb = document.querySelector('[data-case="slider"] [data-slot="slider-thumb"]');
          return thumb && getComputedStyle(thumb).visibility !== "hidden";
        });
        const preHydrationBoxes = await page.evaluate(boxes);
        assert.ok((await page.evaluate(tabsGeometry)).every((tab) => !tab.ready));
        releaseClient();
        await page.waitForFunction(() =>
          document
            .querySelector('[data-case="custom-height-padding"] [data-slot="tabs-list"]')
            .hasAttribute("data-ready"),
        );
        await page.waitForTimeout(500);
        const hydratedTabs = await page.evaluate(tabsGeometry);
        for (const tab of hydratedTabs)
          assert.ok(
            tab.selected ? tab.errors.every((error) => Math.abs(error) < 1) : tab.opacity === 0,
            `${engineName}/${theme}: bad hydrated indicator ${JSON.stringify(tab)}`,
          );
        const hydratedBoxes = await page.evaluate(boxes);
        assert.ok((await page.evaluate(tabBarGeometry)).every((value) => Math.abs(value) < 1));
        assert.deepEqual(
          hydratedBoxes.map((box) => box.name),
          initialBoxes.map((box) => box.name),
        );
        for (const [index, box] of hydratedBoxes.entries()) {
          const initial = initialBoxes[index].visible
            ? initialBoxes[index]
            : preHydrationBoxes[index];
          assert.equal(
            initial.visible,
            true,
            `${engineName}/${theme}: ${box.name} never appeared before hydration`,
          );
          assert.ok(
            box.values.every((value, at) => Math.abs(value - initial.values[at]) < 1),
            `${engineName}/${theme}: ${box.name} changed from ${initial.values} to ${box.values}`,
          );
        }
        const sliderFrames = await page.evaluate(() => {
          window.sampleSlider = false;
          return window.sliderFrames;
        });
        assert.ok(sliderFrames.length > 0);
        assert.deepEqual(
          sliderFrames.filter((offset) => Math.abs(offset) >= 1),
          [],
          `${engineName}/${theme}: Slider painted at a wrong value`,
        );
        const tabFrames = await page.evaluate(() => {
          window.sampleTabs = false;
          return window.firstPaintTabFrames;
        });
        assert.ok(tabFrames.length > 0);
        assert.deepEqual(
          tabFrames.filter((tab) =>
            tab.selected
              ? tab.opacity > 0 && tab.errors.some((error) => Math.abs(error) >= 1)
              : tab.opacity > 0,
          ),
          [],
          `${engineName}/${theme}: wrong Tabs ink during hydration`,
        );
        const keyboardCase = page.locator('[data-case="plain-second"]');
        await keyboardCase.getByRole("tab", { name: "two", exact: true }).focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () =>
            document.querySelector('[data-case="plain-second"] [aria-selected="true"]')
              ?.textContent === "three",
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${engineName}/${theme}: six Tabs cases and ${initialBoxes.length} glass/control boxes retained initial geometry.`,
        );
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
