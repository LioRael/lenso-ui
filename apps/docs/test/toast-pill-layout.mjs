import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
for (const [name, engine, reducedMotion] of [
  ["chromium", chromium, "no-preference"],
  ["webkit", webkit, "no-preference"],
  ["webkit-reduced", webkit, "reduce"],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 800 },
      reducedMotion,
    });
    await page.clock.install();
    await page.route("**/pill-layout-fixture.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><html><body><div id="fixture"></div><script type="module">
        import RefreshRuntime from '/@react-refresh';
        RefreshRuntime.injectIntoGlobalHook(window);
        window.$RefreshReg$=()=>{}; window.$RefreshSig$=()=>type=>type;
        window.__vite_plugin_react_preamble_installed__=true;
        await import('/src/styles/global.css');
        const {mount}=await import('/test/toast-pill-fixture.tsx');
        mount(document.getElementById('fixture'));
        const css=document.createElement('link');css.rel='stylesheet';css.href='/virtual:stylex.css';
        css.onload=()=>{window.pillLayoutReady=true;};document.head.append(css);
      </script></body></html>`,
      }),
    );
    await page.goto(`${base}/pill-layout-fixture.html`);
    await page.waitForFunction(() => window.pillLayoutReady);
    await page.evaluate(() => document.fonts.ready);
    const check = page.getByRole("button", { name: "Check for updates", exact: true });
    await check.waitFor();
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    await page.evaluate(() => {
      Object.defineProperty(document.timeline, "currentTime", {
        configurable: true,
        get: () => performance.now(),
      });
      const starts = new WeakMap();
      window.samplePillAnimations = () => {
        for (const animation of document.getAnimations()) {
          if (animation.timeline !== document.timeline) continue;
          if (animation.currentTime !== null && typeof animation.currentTime !== "number") continue;
          if (!starts.has(animation)) {
            starts.set(animation, performance.now() - Number(animation.currentTime ?? 0));
            animation.pause();
          }
          animation.currentTime = performance.now() - starts.get(animation);
        }
      };
    });
    const advance = async (frames) => {
      for (let index = 0; index < frames; index++) {
        await page.clock.runFor(1000 / 60);
        await page.evaluate(() => window.samplePillAnimations());
      }
    };
    const geometry = () =>
      page.evaluate(() => {
        const root = document.querySelector('[data-lenso-slot="toast"]');
        const measure = root.querySelector('[data-lenso-slot="toast-pill-measure"]');
        const title = measure.querySelector('[data-lenso-slot="toast-title"]');
        const current = title.firstElementChild.lastElementChild;
        const icon = measure.querySelector(
          '[data-lenso-slot="toast-indicator"] svg, [data-lenso-slot="progress-circle-track"]',
        );
        const center = (node) => {
          const box = node.getBoundingClientRect();
          return box.y + box.height / 2;
        };
        return {
          width: root.getBoundingClientRect().width,
          titleOffset: center(current) - center(icon),
        };
      });
    await check.evaluate((node) => node.click());
    await advance(150);
    const available = await geometry();
    await page
      .getByRole("button", { name: "Download", exact: true })
      .evaluate((node) => node.click());
    await advance(120);
    const downloading = await geometry();
    await advance(300);
    const collapsed = await geometry();
    const disclosure = page.getByRole("button", {
      name: "Update installed. Your terminal tabs won't be lost",
      exact: true,
    });
    await disclosure.press("Enter");
    await advance(90);
    const expanded = await geometry();
    assert.ok(
      Math.abs(collapsed.width - expanded.width) <= 1,
      `${name}: installed width changes on disclosure: ${collapsed.width} -> ${expanded.width}`,
    );
    for (const [state, value] of Object.entries({ available, downloading, collapsed, expanded })) {
      assert.ok(
        Math.abs(value.titleOffset) <= 0.25,
        `${name}: ${state} title/icon center offset ${value.titleOffset}px`,
      );
    }
    assert.equal(await disclosure.getAttribute("aria-expanded"), "true");
    await disclosure.press("Enter");
    await advance(90);
    assert.equal(await disclosure.getAttribute("aria-expanded"), "false");
    assert.ok(Math.abs((await geometry()).width - collapsed.width) <= 1);
    await page.setViewportSize({ width: 390, height: 800 });
    await advance(90);
    assert.ok((await geometry()).width <= 358, `${name}: narrow toast exceeds viewport`);
    console.log(name, { available, downloading, collapsed, expanded });
  } finally {
    await browser.close();
  }
}
