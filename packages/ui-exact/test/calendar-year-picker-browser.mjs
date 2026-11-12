import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST) throw new Error("Set EXACT_TEST_DIST to the compiled consumer");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/calendar-years",
);
await Bun.write(path.join(artifacts, ".keep"), "");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const trigger = (p) => p.locator("#year-picker-trigger"),
  grid = (p) => p.locator("#year-picker-grid"),
  year = (p, label) => grid(p).getByRole("button", { name: label, exact: true }),
  button = (p, key) => p.getByTestId(`year-${key}`);
const waitOpen = async (p, open) => {
  if (process.env.EXACT_TEST_TRACE) console.log("waiting open", open);
  await p.waitForFunction(
    (open) =>
      document.querySelector("#year-picker-trigger")?.getAttribute("aria-expanded") ===
      String(open),
    open,
  );
  if (open)
    await p.waitForFunction(
      () => getComputedStyle(document.querySelector("#year-picker-grid")).opacity === "1",
    );
  else await grid(p).waitFor({ state: "hidden" });
};
const heading = (p, text) =>
  p.waitForFunction(
    (text) => document.querySelector("#year-calendar-heading")?.textContent?.includes(text),
    text,
  );
const focused = (p, label) =>
  p.waitForFunction((label) => document.activeElement?.getAttribute("aria-label") === label, label);
const value = (p) => p.getByTestId("year-value").textContent();
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== engine) continue;
    const browser = await launcher.launch();
    try {
      const p = await browser.newPage({ viewport: { width: 1100, height: 1000 } }),
        errors = [];
      p.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(p, server);
      await p.waitForSelector("#year-calendar[data-calendar-ready]");
      if (process.env.EXACT_TEST_TRACE)
        console.log("ready", await p.locator("#year-calendar").innerText());
      await heading(p, "February 2024");
      await waitOpen(p, false);
      assert.equal(await grid(p).evaluate((n) => n.inert), true);
      await trigger(p).press("Enter");
      await waitOpen(p, true);
      if (process.env.EXACT_TEST_TRACE)
        console.log(
          "opened",
          await grid(p).innerText(),
          await p.evaluate(() => document.activeElement?.outerHTML),
        );
      await focused(p, "2024");
      assert.equal(await grid(p).locator("button").count(), 20);
      assert.equal(
        await p.locator('#year-calendar [data-slot="calendar-grid"]').evaluate((n) => n.inert),
        true,
      );
      assert.equal(
        await p.locator("#year-calendar-next").evaluate((n) => getComputedStyle(n).visibility),
        "hidden",
      );
      await year(p, "2024").press("ArrowRight");
      await focused(p, "2025");
      await year(p, "2025").press("ArrowDown");
      await focused(p, "2028");
      await year(p, "2028").press("Home");
      await focused(p, "2014");
      await year(p, "2014").press("End");
      await focused(p, "2033");
      await year(p, "2033").press("Escape");
      await waitOpen(p, false);
      await p.waitForFunction(() => document.activeElement?.id === "year-picker-trigger");
      assert.equal(
        await p.locator('#year-calendar [data-slot="calendar-grid"]').evaluate((n) => n.inert),
        false,
      );
      await button(p, "rejected").click();
      await trigger(p).click();
      await waitOpen(p, false);
      await button(p, "rejected").click();
      await trigger(p).click();
      await waitOpen(p, true);
      await year(p, "2025").click();
      await waitOpen(p, false);
      await heading(p, "February 2025");
      assert.equal(await value(p), "2024-02-29");
      await p.waitForFunction(() => document.activeElement?.id === "year-picker-trigger");
      await trigger(p).click();
      await waitOpen(p, true);
      await button(p, "rejected").click();
      await year(p, "2026").click();
      await heading(p, "February 2026");
      await waitOpen(p, true);
      assert.equal(await value(p), "2024-02-29");
      await button(p, "rejected").click();
      await year(p, "2026").press("Escape");
      await waitOpen(p, false);
      await button(p, "all").click();
      await trigger(p).click();
      await waitOpen(p, true);
      assert.equal(await grid(p).locator("button").count(), 200);
      assert.ok(await grid(p).evaluate((n) => n.scrollTop > 0));
      await year(p, "2026").press("Home");
      await focused(p, "1900");
      await year(p, "1900").press("End");
      await focused(p, "2099");
      await button(p, "bounds").click();
      await p.waitForFunction(
        () => document.querySelectorAll("#year-picker-grid button").length === 3,
      );
      assert.deepEqual(
        await grid(p)
          .locator("button")
          .evaluateAll((ns) => ns.map((n) => n.getAttribute("aria-label"))),
        ["2023", "2024", "2025"],
      );
      await year(p, "2023").click();
      await waitOpen(p, false);
      await heading(p, "May 2023");
      await button(p, "bounds").click();
      await button(p, "locale").click();
      await trigger(p).click();
      await waitOpen(p, true);
      await focused(p, "۱۴۰۲");
      await year(p, "۱۴۰۲").press("ArrowLeft");
      await focused(p, "۱۴۰۳");
      await button(p, "replace").click();
      await p.waitForFunction(
        () =>
          document
            .querySelector('#year-picker-grid button[aria-pressed="true"]')
            ?.getAttribute("aria-label") === "۱۴۰۵",
      );
      await button(p, "disabled").click();
      assert.equal(await trigger(p).isDisabled(), true);
      assert.equal(await grid(p).evaluate((n) => n.inert), true);
      assert.equal(await grid(p).locator("button:enabled").count(), 0);
      await button(p, "disabled").click();
      const captures = [];
      for (const width of [390, 1100])
        for (const theme of ["light", "dark"])
          for (const locale of ["fa-IR", "en-US"]) {
            await p.setViewportSize({ width, height: 1000 });
            if ((theme === "dark") !== Boolean(await p.locator('[data-theme="dark"]').count()))
              await p.getByTestId("theme").click();
            await grid(p).locator('button[aria-pressed="true"]').focus();
            await p.waitForFunction(
              () => getComputedStyle(document.querySelector("#year-picker-grid")).opacity === "1",
            );
            const file = path.join(artifacts, `${engine}-${width}-${theme}-${locale}.png`);
            await p
              .locator("#calendar-year-picker-examples")
              .screenshot({ path: file, animations: "disabled" });
            captures.push(file);
            const geometry = await grid(p).evaluate((n) => {
              const g = n.getBoundingClientRect(),
                d = document
                  .querySelector('#year-calendar [data-slot="calendar-grid"]')
                  .getBoundingClientRect();
              return {
                delta: g.top - d.top,
                height: g.height,
                dayHeight: d.height,
                columns: getComputedStyle(n).gridTemplateColumns.split(" ").length,
                overflow: n.scrollWidth > n.clientWidth + 1,
              };
            });
            assert.ok(Math.abs(geometry.delta) <= 1);
            assert.ok(Math.abs(geometry.height - geometry.dayHeight) <= 10);
            assert.equal(geometry.columns, 3);
            assert.equal(
              await trigger(p)
                .locator("svg")
                .evaluate((n) => getComputedStyle(n).transform),
              "none",
            );
            assert.equal(
              await grid(p)
                .locator("button")
                .first()
                .evaluate((n) => getComputedStyle(n).fontSize),
              "14px",
            );
            assert.equal(geometry.overflow, false);
            const fills = await grid(p)
              .locator("button")
              .evaluateAll((nodes) => {
                const selected = nodes.find((n) => n.getAttribute("aria-pressed") === "true");
                const fill = getComputedStyle(selected).backgroundColor;
                return {
                  selected: fill,
                  stale: nodes.filter(
                    (n) => n !== selected && getComputedStyle(n).backgroundColor === fill,
                  ).length,
                };
              });
            assert.notEqual(fills.selected, "rgba(0, 0, 0, 0)");
            assert.equal(fills.stale, 0);
            await button(p, "locale").click();
          }
      await p.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await grid(p).evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
      await grid(p).locator('button[aria-pressed="true"]').press("Escape");
      await waitOpen(p, false);
      await trigger(p).click();
      await waitOpen(p, true);
      await p.evaluate(() => {
        window.oldYearGrid = document.querySelector("#year-picker-grid");
        window.oldYearDay = document.querySelector('#year-calendar [data-slot="calendar-grid"]');
        window.oldYearCell = document.querySelector(
          '#year-picker-grid button[aria-pressed="true"]',
        );
        window.oldYearTrigger = document.querySelector("#year-picker-trigger");
      });
      await button(p, "mounted").click();
      await p.waitForFunction(
        () =>
          !document.querySelector("#year-calendar") &&
          !window.oldYearGrid.style.top &&
          !window.oldYearGrid.style.height &&
          !window.oldYearDay.inert &&
          !window.oldYearDay.style.visibility &&
          window.oldYearCell.disabled &&
          window.oldYearCell.getAttribute("aria-label") ===
            window.oldYearCell.dataset.lensoYearDate &&
          window.oldYearTrigger.getAttribute("aria-label") === "Choose year",
      );
      await button(p, "mounted").click();
      await p.waitForSelector("#year-calendar[data-calendar-ready]");
      await waitOpen(p, true);
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const m = await mobile.newPage();
        await loadContextCohort(m, server);
        await m.waitForSelector("#year-calendar[data-calendar-ready]");
        await trigger(m).tap();
        await waitOpen(m, true);
        await year(m, "2025").tap();
        await waitOpen(m, false);
        await heading(m, "February 2025");
        assert.equal(await value(m), "2024-02-29");
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
          "controlled open/rejection, year navigation without selecting a date, three-column keyboard/RTL, focus return, bounded/all years, geometry, native mobile tap, reduced motion and teardown",
      });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify({ results }, null, 2) + "\n",
      );
      console.log(engine, "calendar years passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
