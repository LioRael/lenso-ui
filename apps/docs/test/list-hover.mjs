import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// DOM tests cannot catch a zero-padding hover target or a target shorter than
// its list row. Cover both the ordinary and the composed swipe row in browsers.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4312";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: 900, height: 900 },
        reducedMotion: "reduce",
      });
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      for (const [route, selector] of [
        ["/en/list-lab", '[data-list-key="a-access"] [data-lenso-slot="list-action"]'],
        [
          "/en/docs/react/components/navigation-bar",
          '[data-lenso-slot="list-item"] > [data-lenso-slot="list-action"]',
        ],
      ]) {
        await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 120000 });
        const action = page.locator(selector).first();
        await action.waitFor();
        await action.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        const resting = await action.evaluate((node) => getComputedStyle(node).backgroundColor);
        await action.hover();
        const geometry = await action.evaluate((node) => {
          const style = getComputedStyle(node);
          const row = node.closest('[data-lenso-slot="list-item"]');
          const text = node.querySelector('[data-lenso-slot="list-title"]');
          return {
            start: style.paddingInlineStart,
            end: style.paddingInlineEnd,
            textInset: text.getBoundingClientRect().left - node.getBoundingClientRect().left,
            height: node.getBoundingClientRect().height,
            rowHeight: row.getBoundingClientRect().height,
            rowOverflow: getComputedStyle(row).overflowX,
            color: style.backgroundColor,
          };
        });
        assert.equal(geometry.start, "16px");
        assert.equal(geometry.end, "16px");
        assert.equal(geometry.textInset, 16);
        assert.ok(Math.abs(geometry.height - geometry.rowHeight) < 1);
        assert.equal(geometry.rowOverflow, "clip");
        assert.notEqual(geometry.color, resting);
        await action.focus();
        assert.ok(await action.evaluate((node) => node === document.activeElement));
      }
      await page.close();
      console.log(
        `${name} ${theme}: ordinary/swipe row hover padding, height, clipping and focus passed`,
      );
    }
  } finally {
    await browser.close();
  }
}
