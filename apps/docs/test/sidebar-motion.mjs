import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { chromium, webkit } from "playwright";

/** Catch missing disclosure transitions, scaled text and lost reversal state. */
export async function assertSidebarMotion(p, base) {
  await p.setViewportSize({ width: 1194, height: 834 });
  await p.emulateMedia({ reducedMotion: "no-preference" });
  await p.goto(`${base}/en/docs/react/components/sidebar`, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(
    () => {
      const e = document.querySelector("#nd-sidebar [data-lenso-slot=sidebar-disclosure-trigger]");
      return e && Object.keys(e).some((k) => k.startsWith("__reactProps"));
    },
    null,
    { timeout: 60000 },
  );
  const t = p.locator("#nd-sidebar [data-lenso-slot=sidebar-disclosure-trigger]").first();
  await t.scrollIntoViewIfNeeded();
  async function capture() {
    await p.evaluate(() => {
      window.sidebarFrames = [];
      window.sidebarMotionPanel = null;
      let n = 0;
      function tick() {
        const e = document.querySelector(
            "#nd-sidebar [data-lenso-slot=sidebar-disclosure-trigger]",
          ),
          panel =
            document.getElementById(e.getAttribute("aria-controls")) ?? window.sidebarMotionPanel,
          row = panel?.querySelector("a");
        if (panel) window.sidebarMotionPanel = panel;
        window.sidebarFrames.push({
          height: panel?.getBoundingClientRect().height ?? 0,
          rowHeight: row?.getBoundingClientRect().height ?? null,
          arrow: getComputedStyle(e.querySelector("svg")).transform,
        });
        if (++n < 25) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  await capture();
  await t.click();
  await p.waitForFunction(() => window.sidebarFrames.length >= 25);
  let frames = await p.evaluate(() => window.sidebarFrames);
  assert(new Set(frames.map((f) => f.height)).size >= 4);
  assert(new Set(frames.map((f) => f.arrow)).size >= 4);
  assert(new Set(frames.filter((f) => f.rowHeight).map((f) => f.rowHeight)).size === 1);
  console.log("open: intermediate heights/arrow, unscaled row passed");
  await capture();
  await t.click();
  await p.waitForFunction(() => window.sidebarFrames.length >= 25);
  frames = await p.evaluate(() => window.sidebarFrames);
  assert(new Set(frames.map((f) => f.height)).size >= 4);
  console.log("close: intermediate heights passed");
  await t.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(65);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(45);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(350);
  assert.equal(await t.getAttribute("aria-expanded"), "true");
  await p.emulateMedia({ reducedMotion: "reduce" });
  await t.click();
  await t.click();
  await p.waitForTimeout(40);
  const panel = p.locator("#" + (await t.getAttribute("aria-controls")));
  assert.equal(await panel.evaluate((e) => getComputedStyle(e).transitionDuration), "0s");
  await p.evaluate(() => (document.documentElement.dir = "rtl"));
  await t.click();
  await p.waitForTimeout(40);
  const collapsed = await t.locator("svg").evaluate((e) => getComputedStyle(e).transform);
  assert.equal(collapsed, "matrix(0, 1, -1, 0, 0, 0)");
  await t.click();
  await p.waitForTimeout(40);
  assert.equal(
    await t.locator("svg").evaluate((e) => getComputedStyle(e).transform),
    "matrix(1, 0, 0, 1, 0, 0)",
  );
  console.log("rapid reversal, Enter, reduced motion, RTL passed");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1194, height: 834 } });
      await assertSidebarMotion(page, process.env.DOCS_URL ?? "http://127.0.0.1:4310");
      console.log(`${name}: sidebar motion passed`);
    } finally {
      await browser.close();
    }
  }
}
