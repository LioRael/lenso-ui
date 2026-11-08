import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
const colorScheme = process.env.COLOR_SCHEME ?? "light";

// Resting-page material checks miss scroll-lock/sticky interactions and the
// brief fallback contour painted while result-driven popup heights change.
for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
  const browser = await launcher.launch();
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme });
      try {
        await page.goto(`${base}/en/docs/react/components/button`);
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => window.scrollTo(0, 1200));
        const initialY = await page.evaluate(() => window.scrollY);
        assert.ok(initialY > 1000, "The background must already be scrolled");
        await page.evaluate(() => {
          window.searchStability = { frames: [], stop: false };
          const sample = () => {
            const panel = document.querySelector("[data-docs-search]");
            const header = document.querySelector("#nd-subnav");
            const sidebar = document.querySelector('[aria-label="Documentation sidebar"]');
            const contour = panel && getComputedStyle(panel, "::after");
            window.searchStability.frames.push({
              y: window.scrollY,
              header: header.getBoundingClientRect().top,
              sidebar: sidebar.getBoundingClientRect().top,
              height: panel?.offsetHeight,
              fallbackContour: Boolean(
                panel?.hasAttribute("data-material-resizing") &&
                !panel.hasAttribute("data-material-live-rim") &&
                contour.display !== "none" &&
                contour.boxShadow !== "none",
              ),
            });
            if (!window.searchStability.stop) requestAnimationFrame(sample);
          };
          sample();
        });
        await page.locator("[data-docs-search-trigger]:visible").first().click();
        const panel = page.locator("[data-docs-search]");
        await panel.waitFor();
        const input = panel.getByRole("combobox");
        await input.waitFor();
        for (const query of ["b", "button", "zz-no-match", "s", "select", "", "card", "button"]) {
          await input.fill(query);
          await page.waitForTimeout(220);
        }
        await panel.getByRole("option").first().waitFor();
        const count = await panel.getByRole("option").count();
        for (let i = 0; i < count - 1; i++) await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(80);
        const resultScrollFailed = await page
          .locator("[data-docs-search-scroll]")
          .evaluate(
            (element) => element.scrollHeight > element.clientHeight && element.scrollTop <= 0,
          );
        await page.mouse.move(4, 850);
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(80);
        const closingHeight = await panel.evaluate((element) => element.offsetHeight);
        await page.keyboard.press("Escape");
        const closing = await page.evaluate(() => {
          const element = document.querySelector("[data-docs-search]");
          return (
            element && { height: element.offsetHeight, query: element.querySelector("input").value }
          );
        });
        if (closing) {
          assert.equal(closing.query, "button", "Keep the query while the panel exits");
          assert.equal(closing.height, closingHeight, "Do not reset panel height during exit");
        }
        await panel.waitFor({ state: "hidden" });
        await page.waitForFunction(() =>
          document.activeElement?.matches("[data-docs-search-trigger]"),
        );
        await page.waitForTimeout(80);
        const frames = await page.evaluate(() => {
          window.searchStability.stop = true;
          return window.searchStability.frames;
        });
        const failures = {
          displacedHeader: frames.filter((frame) => Math.abs(frame.header) > 1).length,
          displacedSidebar:
            width >= 768 ? frames.filter((frame) => Math.abs(frame.sidebar) > 1).length : 0,
          backgroundScroll: frames.filter((frame) => Math.abs(frame.y - initialY) > 1).length,
          fallbackContour: frames.filter((frame) => frame.fallbackContour).length,
          resultScrollFailed: Number(resultScrollFailed),
        };
        const heights = new Set(frames.map((frame) => frame.height).filter(Boolean));
        assert.ok(heights.size > 1, "Queries must exercise popup resizing");
        assert.ok(
          Object.values(failures).every((count) => count === 0),
          `${engine}/${width}: ${JSON.stringify(failures)}`,
        );
        console.log(
          engine,
          width,
          colorScheme,
          "sticky layout, focus, result scrolling and contour passed",
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
