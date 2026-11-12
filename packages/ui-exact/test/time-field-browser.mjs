import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST) throw new Error("Set EXACT_TEST_DIST to the compiled consumer");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/time-field",
);
await Bun.write(path.join(artifacts, ".keep"), "");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const root = "#time-demo-input";
const part = (page, key) => page.locator(`#time-demo-${key}`);
const button = (page, key) => page.getByTestId(`time-${key}`);
const value = (page, expected) =>
  page.waitForFunction(
    (expected) => document.querySelector('[data-testid="time-value"]')?.textContent === expected,
    expected,
  );
const ready = (page) => page.waitForSelector(`${root}[data-date-ready]`);
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
      assert.deepEqual(
        await page
          .locator(`${root} input[data-date-segment]`)
          .evaluateAll((ns) => ns.map((n) => [n.dataset.dateSegment, n.value])),
        [
          ["hour", "1"],
          ["minute", "45"],
          ["dayPeriod", "PM"],
        ],
      );
      await part(page, "dayPeriod").fill("a");
      await value(page, "01:45:30");
      await part(page, "minute").press("Delete");
      await value(page, "");
      assert.equal(await part(page, "hour").inputValue(), "1");
      assert.equal(await part(page, "dayPeriod").inputValue(), "AM");
      await part(page, "minute").fill("15");
      await value(page, "01:15:30");
      await button(page, "hours").click();
      await page.waitForFunction(() => !document.querySelector("#time-demo-dayPeriod"));
      await part(page, "hour").fill("23");
      await value(page, "23:15:30");
      await part(page, "hour").press("ArrowUp");
      await value(page, "00:15:30");
      await part(page, "minute").press("PageUp");
      await value(page, "00:30:30");
      await button(page, "seconds").click();
      await page.waitForSelector("#time-demo-second");
      assert.equal(await part(page, "second").inputValue(), "30");
      await part(page, "second").press("End");
      await value(page, "00:30:59");
      await button(page, "rejected").click();
      await part(page, "second").press("ArrowDown");
      await page.waitForFunction(() => document.querySelector("#time-demo-second")?.value === "59");
      await value(page, "00:30:59");
      await button(page, "rejected").click();
      await button(page, "readonly").click();
      assert.equal(await part(page, "hour").getAttribute("readonly"), "");
      await part(page, "hour").press("ArrowUp");
      await value(page, "00:30:59");
      await button(page, "readonly").click();
      await button(page, "disabled").click();
      assert.equal(await part(page, "hour").isDisabled(), true);
      await button(page, "disabled").click();
      await button(page, "locale").click();
      await page.waitForFunction(() => document.querySelector("#time-demo-minute")?.value === "٣٠");
      await part(page, "minute").fill("٢٥");
      await value(page, "00:25:59");
      await part(page, "hour").focus();
      await part(page, "hour").press("ArrowLeft");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "time-demo-minute");
      await button(page, "locale").click();
      await page.waitForFunction(() => document.querySelector("#time-demo-minute")?.value === "25");
      await page.locator("#time-demo-label").click();
      assert.equal(await page.evaluate(() => document.activeElement?.id), "time-demo-hour");
      await page.evaluate(() => {
        const form = document.createElement("form");
        form.id = "time-demo-form";
        document.body.append(form);
      });
      assert.deepEqual(
        await page.evaluate(() => [...new FormData(document.querySelector("#time-demo-form"))]),
        [["departureTime", "00:25:59"]],
      );
      await part(page, "minute").press("Delete");
      await value(page, "");
      assert.equal(
        await page.evaluate(() => document.querySelector("#time-demo-form").reportValidity()),
        false,
      );
      assert.ok((await page.locator("#time-demo-error").textContent()).length > 0);
      assert.equal(await page.evaluate(() => document.activeElement?.id), "time-demo-hour");
      await part(page, "minute").fill("26");
      await value(page, "00:26:59");
      await page.locator(root).evaluate((n) => {
        n.dataset.lensoMin = "08:00";
      });
      await page.waitForFunction(() =>
        document.querySelector("#time-demo-input").hasAttribute("data-date-invalid"),
      );
      assert.equal(
        await page.evaluate(() => document.querySelector("#time-demo-form").checkValidity()),
        false,
      );
      await page.locator(root).evaluate((n) => {
        n.dataset.lensoMin = "";
      });
      await page.waitForFunction(
        () => !document.querySelector("#time-demo-input").hasAttribute("data-date-invalid"),
      );
      await button(page, "replace").click();
      await value(page, "23:59:58");
      const captures = [];
      for (const width of [390, 1100])
        for (const theme of ["light", "dark"])
          for (const hours of ["h23", "h12"]) {
            await page.setViewportSize({ width, height: 950 });
            if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
              await page.getByTestId("theme").click();
            const file = path.join(artifacts, `${engine}-${width}-${theme}-${hours}.png`);
            await page.locator("#time-field-examples").screenshot({ path: file });
            captures.push(file);
            assert.equal(
              await page.locator(root).evaluate((n) => n.scrollWidth > n.clientWidth + 1),
              false,
            );
            await button(page, "hours").click();
          }
      await page.evaluate(() => {
        window.timeOld = document.querySelector("#time-demo-hour");
      });
      await button(page, "mounted").click();
      await page.waitForFunction(
        () =>
          !document.querySelector("#time-demo-input") &&
          window.timeOld.readOnly &&
          !window.timeOld.style.width &&
          !window.timeOld.hasAttribute("aria-valuenow"),
      );
      await button(page, "mounted").click();
      await ready(page);
      assert.equal(await part(page, "hour").inputValue(), "23");
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await ready(p);
        await part(p, "minute").tap();
        assert.equal(await p.evaluate(() => document.activeElement?.id), "time-demo-minute");
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
          "hour cycles, day periods, localized digits, seconds, clear/retype, controlled rejection, flags, RTL, labels, scalar external form, required/range validity, removal/remount and native mobile tap",
      });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify({ results }, null, 2) + "\n",
      );
      console.log(engine, "time field passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
