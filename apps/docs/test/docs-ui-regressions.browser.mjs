import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// The 900px matrix missed clipped search options and a hidden TOC becoming visible.
// Measure the scrolling viewport, not its unconstrained content.
const evidence = resolve(
  process.env.LENSO_DOCS_UI_EVIDENCE ?? "../../test-results/docs-ui-regressions",
);
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];

async function check(name, viewport, run) {
  const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const data = await run(page);
    await page.screenshot({ path: `${evidence}/${name}.png` });
    results.push({ name, data });
  } finally {
    await page.close();
  }
}

async function navigate(page, family) {
  const response = await page.goto(`${base}/en/docs/react/components/${family}`, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(response.status(), 200);
  await page.getByRole("button", { name: "Search documentation", exact: true }).waitFor();
}

function optionGeometry(node) {
  const viewport = node.parentElement;
  const rect = (element) => {
    const bounds = element.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right };
  };
  return {
    option: rect(node),
    viewport: rect(viewport),
    popup: rect(node.closest("[role=dialog]")),
    overflow: getComputedStyle(viewport).overflowY,
    scrollTop: viewport.scrollTop,
    focus: document.activeElement.tagName,
  };
}

try {
  for (const width of [390, 1440]) {
    await check(`short-search-${width}`, { width, height: 400 }, async (page) => {
      await navigate(page, "button");
      await page.getByRole("button", { name: "Search documentation", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
      const input = dialog.getByRole("textbox", { name: "Find a page", exact: true });
      await input.fill("a");
      const options = dialog.locator("button[data-docs-result]");
      await options.nth(12).waitFor();
      assert.ok((await options.count()) > 12, "The results must overflow this short viewport");
      await page.keyboard.press("ArrowUp");
      assert.equal(await options.last().getAttribute("aria-current"), "true");
      const last = await options.last().evaluate(optionGeometry);
      assert.equal(last.overflow, "auto");
      assert.equal(last.viewport.bottom - last.viewport.top, 315);
      assert.ok(last.scrollTop > 0);
      assert.ok(last.viewport.bottom <= 400 && last.popup.bottom <= 400);
      assert.ok(last.popup.left >= 0 && last.popup.right <= width);
      assert.equal((last.popup.left + last.popup.right) / 2, width / 2);
      assert.ok(last.option.top >= last.viewport.top && last.option.bottom <= last.viewport.bottom);
      assert.equal(last.focus, "INPUT");
      await page.keyboard.press("ArrowDown");
      assert.equal(await options.first().getAttribute("aria-current"), "true");
      const first = await options.first().evaluate(optionGeometry);
      assert.ok(
        first.option.top >= first.viewport.top && first.option.bottom <= first.viewport.bottom,
      );
      assert.equal(first.focus, "INPUT");
      return { last, first };
    });
  }
  await check("desktop-search-spacing", { width: 1440, height: 900 }, async (page) => {
    await navigate(page, "button");
    const data = await page
      .getByRole("button", { name: "Search documentation", exact: true })
      .evaluate((node) => ({
        width: node.getBoundingClientRect().width,
        margin: getComputedStyle(node).marginInlineEnd,
        wrapperMargin: getComputedStyle(node.parentElement).marginInlineEnd,
      }));
    assert.equal(data.width, 400);
    assert.equal(data.margin, "0px");
    assert.equal(data.wrapperMargin, "48px");
    return data;
  });
  await check("toc-breakpoint-scroll", { width: 390, height: 700 }, async (page) => {
    await navigate(page, "date-picker");
    const last = page.locator("#nd-toc nav a").last();
    const hash = await last.getAttribute("href");
    await page.evaluate(
      (href) => document.getElementById(decodeURIComponent(href.slice(1))).scrollIntoView(),
      hash,
    );
    await page.waitForFunction(
      (href) =>
        document
          .querySelector(`#nd-toc a[href="${CSS.escape(href)}"]`)
          ?.getAttribute("aria-current") === "location",
      hash,
    );
    const before = await page.evaluate(() => scrollY);
    await page.setViewportSize({ width: 1440, height: 500 });
    await page.waitForFunction(() => {
      const node = document.querySelector('#nd-toc a[aria-current="location"]');
      const viewport = node.closest("nav").parentElement.parentElement;
      const link = node.getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      return viewport.clientHeight > 0 && link.top >= bounds.top && link.bottom <= bounds.bottom;
    });
    const data = await last.evaluate((node) => {
      const viewport = node.closest("nav").parentElement.parentElement;
      return {
        current: node.getAttribute("aria-current"),
        scrollTop: viewport.scrollTop,
        overflow: getComputedStyle(viewport).overflowY,
        documentY: scrollY,
      };
    });
    assert.equal(data.current, "location");
    assert.equal(data.documentY, before, "TOC alignment must not scroll the document");
    assert.ok(data.scrollTop > 0);
    assert.equal(data.overflow, "auto");
    return data;
  });
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(`${evidence}/results.json`, JSON.stringify({ results, errors }, null, 2));
}
