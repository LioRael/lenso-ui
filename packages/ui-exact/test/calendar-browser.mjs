import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST) throw new Error("Set EXACT_TEST_DIST to the compiled consumer");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/calendar",
);
await Bun.write(path.join(artifacts, ".keep"), "");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const root = "#calendar-demo";
const cell = (p, date) => p.locator(`${root} button[data-calendar-date="${date}"]`);
const button = (p, key) => p.getByTestId(`calendar-${key}`);
const value = (p, expected) =>
  p.waitForFunction(
    (expected) =>
      document.querySelector('[data-testid="calendar-value"]')?.textContent === expected,
    expected,
  );
const heading = (p, text) =>
  p.waitForFunction(
    (text) => document.querySelector("#calendar-demo-heading")?.textContent?.includes(text),
    text,
  );
const focus = (p, date) =>
  p.waitForFunction(
    (date) => document.activeElement?.getAttribute("data-calendar-date") === date,
    date,
  );
const ready = (p) => p.waitForSelector(`${root}[data-calendar-ready]`);
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== engine) continue;
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 950 } }),
        errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(page, server);
      await ready(page);
      await heading(page, "February 2024");
      assert.equal(await page.locator(`${root} [role="gridcell"]`).count(), 35);
      assert.equal(await page.locator(`${root} [role="columnheader"]`).count(), 7);
      assert.equal(await cell(page, "2024-02-29").getAttribute("aria-pressed"), "true");
      assert.equal(await cell(page, "2024-02-15").getAttribute("aria-current"), "date");
      assert.equal(await cell(page, "2024-02-20").isDisabled(), true);
      assert.equal(
        await page.locator(`${root} button[data-calendar-date][tabindex="0"]`).count(),
        1,
      );
      await cell(page, "2024-02-22").click();
      await value(page, "2024-02-22");
      assert.equal(await cell(page, "2024-02-22").getAttribute("aria-pressed"), "true");
      await button(page, "rejected").click();
      await cell(page, "2024-02-23").click();
      await value(page, "2024-02-22");
      assert.equal(await cell(page, "2024-02-23").getAttribute("aria-pressed"), "false");
      await button(page, "rejected").click();
      await button(page, "mode").click();
      assert.equal(
        await page.locator(`${root} [role="grid"]`).getAttribute("aria-multiselectable"),
        "true",
      );
      await cell(page, "2024-02-21").click();
      await value(page, "2024-02-22|2024-02-21");
      await cell(page, "2024-02-22").click();
      await value(page, "2024-02-21");
      await button(page, "mode").click();
      await cell(page, "2024-02-24").click();
      await value(page, "2024-02-21");
      await button(page, "mode").click();
      await cell(page, "2024-02-24").click();
      await value(page, "2024-02-24");
      await button(page, "readonly").click();
      assert.equal(
        await page.locator(`${root} [role="grid"]`).getAttribute("aria-readonly"),
        "true",
      );
      await cell(page, "2024-02-25").click();
      await value(page, "2024-02-24");
      await button(page, "readonly").click();
      await button(page, "disabled").click();
      assert.equal(await cell(page, "2024-02-25").isDisabled(), true);
      await button(page, "disabled").click();
      await button(page, "bounds").click();
      assert.equal(await page.locator("#calendar-demo-previous").isDisabled(), true);
      assert.equal(await cell(page, "2024-02-09").isDisabled(), true);
      await cell(page, "2024-02-28").focus();
      await cell(page, "2024-02-28").press("ArrowRight");
      await focus(page, "2024-02-29");
      await cell(page, "2024-02-29").press("ArrowRight");
      await focus(page, "2024-03-01");
      await heading(page, "March 2024");
      assert.equal(await page.locator("#calendar-demo-next").isDisabled(), true);
      assert.equal(await cell(page, "2024-03-16").isDisabled(), true);
      await cell(page, "2024-03-01").press("PageDown");
      await focus(page, "2024-03-15");
      await cell(page, "2024-03-15").press("Enter");
      await value(page, "2024-03-15");
      await button(page, "bounds").click();
      await button(page, "locale").click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('#calendar-demo [role="columnheader"]')
            ?.getAttribute("aria-label") === "Monday",
      );
      await button(page, "locale").click();
      await page.waitForFunction(
        () =>
          document.querySelector('#calendar-demo-day-2024-02-29 [data-slot="calendar-day-label"]')
            ?.textContent === "۱۰",
      );
      await value(page, "2024-03-15");
      await cell(page, "2024-02-29").focus();
      await cell(page, "2024-02-29").press("ArrowLeft");
      await focus(page, "2024-03-01");
      await button(page, "replace").click();
      await value(page, "2025-01-15");
      await cell(page, "2025-01-15").waitFor();
      const captures = [];
      for (const width of [390, 1100])
        for (const theme of ["light", "dark"])
          for (const locale of ["fa-IR", "en-US"]) {
            await page.setViewportSize({ width, height: 950 });
            if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
              await page.getByTestId("theme").click();
            const file = path.join(artifacts, `${engine}-${width}-${theme}-${locale}.png`);
            await page.locator("#calendar-examples").screenshot({ path: file });
            captures.push(file);
            const geometry = await page.locator(root).evaluate((n) => ({
              width: n.getBoundingClientRect().width,
              overflow: n.scrollWidth > n.clientWidth + 1,
              selected: getComputedStyle(n.querySelector('button[aria-pressed="true"]'))
                .backgroundColor,
            }));
            assert.ok(geometry.width <= width);
            assert.equal(geometry.overflow, false);
            // Pure date tests cannot detect localized weekday labels overflowing their rendered columns.
            assert.equal(
              await page
                .locator(`${root} [role="columnheader"]`)
                .evaluateAll((nodes) => nodes.some((n) => n.scrollWidth > n.clientWidth + 1)),
              false,
            );
            assert.notEqual(geometry.selected, "rgba(0, 0, 0, 0)");
            // fa -> US; US -> GB -> fa.
            await button(page, "locale").click();
            if (locale === "en-US") await button(page, "locale").click();
          }
      await button(page, "locale").click();
      await heading(page, "January 2025");
      await page.locator("#calendar-demo-next").focus();
      await page.locator("#calendar-demo-next").press("Enter");
      await heading(page, "February 2025");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "calendar-demo-next");
      const first = page.locator(`${root} button[data-calendar-date][tabindex="0"]`);
      await first.focus();
      await first.press("PageUp");
      await focus(page, "2025-01-15");
      await cell(page, "2025-01-15").press("Shift+PageUp");
      await focus(page, "2024-01-15");
      await cell(page, "2024-01-15").press("Home");
      await focus(page, "2024-01-14");
      await cell(page, "2024-01-14").press("End");
      await focus(page, "2024-01-20");
      await page.evaluate(() => {
        window.calendarOld = document.querySelector("#calendar-demo-day-2024-01-20");
      });
      await button(page, "mounted").click();
      await page.waitForFunction(
        () =>
          !document.querySelector("#calendar-demo") &&
          window.calendarOld.disabled &&
          window.calendarOld.getAttribute("aria-label") === "2024-01-20" &&
          !window.calendarOld.hasAttribute("data-calendar-focused"),
      );
      await button(page, "mounted").click();
      await ready(page);
      await heading(page, "January 2025");
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await ready(p);
        await cell(p, "2024-02-22").tap();
        await value(p, "2024-02-22");
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        captures,
        errors,
        behavior:
          "single/multiple/none selection, rejected updates, flags, bounds/unavailable, native keyboard/month/year/week navigation, locale/calendar/RTL, external changes, cleanup/remount and native mobile tap",
      });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify({ results }, null, 2) + "\n",
      );
      console.log(engine, "calendar passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
