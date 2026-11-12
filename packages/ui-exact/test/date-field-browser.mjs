import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST) throw new Error("Set EXACT_TEST_DIST to the compiled consumer");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ?? "packages/ui-exact/.cache/acceptance/date-field",
);
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
await Bun.write(path.join(artifacts, ".keep"), "");
const root = "#date-demo-input";
const part = (page, key) => page.locator(`#date-demo-${key}`);
const output = (page) => page.locator('[data-testid="date-value"]');
const button = (page, key) => page.locator(`[data-testid="date-${key}"]`);
const value = async (page, expected) => {
  await page.waitForFunction(
    (expected) => document.querySelector('[data-testid="date-value"]')?.textContent === expected,
    expected,
  );
};
const ready = async (page) => page.waitForSelector(`${root}[data-date-ready]`);
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && engine !== process.env.TEST_BROWSER) continue;
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 950 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      const network = await loadContextCohort(page, server);
      await ready(page);
      assert.deepEqual(
        await page
          .locator(`${root} input[data-date-segment]`)
          .evaluateAll((ns) => ns.map((n) => [n.dataset.dateSegment, n.value, n.readOnly])),
        [
          ["month", "2", false],
          ["day", "29", false],
          ["year", "2024", false],
        ],
      );
      await part(page, "year").fill("2025");
      assert.equal(await part(page, "day").inputValue(), "29");
      assert.equal(await output(page).textContent(), "2024-02-29");
      assert.equal(await page.locator(root).getAttribute("data-date-invalid"), "");
      await button(page, "variant").click();
      await value(page, "2025-02-28");
      await part(page, "day").press("Delete");
      await value(page, "");
      assert.equal(await part(page, "month").inputValue(), "2");
      assert.equal(await part(page, "year").inputValue(), "2025");
      await part(page, "day").fill("14");
      await value(page, "2025-02-14");
      await button(page, "rejected").click();
      await part(page, "day").press("ArrowUp");
      await page.waitForFunction(() => document.querySelector("#date-demo-day")?.value === "14");
      await value(page, "2025-02-14");
      await button(page, "rejected").click();
      await button(page, "readonly").click();
      assert.equal(await part(page, "day").getAttribute("readonly"), "");
      await part(page, "day").press("ArrowUp");
      await value(page, "2025-02-14");
      await button(page, "readonly").click();
      await button(page, "disabled").click();
      assert.equal(await part(page, "day").isDisabled(), true);
      await button(page, "disabled").click();
      await button(page, "locale").click();
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("#date-demo-input input[data-date-segment]")]
            .map((n) => n.dataset.dateSegment)
            .join() === "day,month,year",
      );
      assert.equal(await part(page, "month").inputValue(), "02");
      await button(page, "locale").click();
      await page.waitForFunction(() => document.querySelector("#date-demo-year")?.value === "۱۴۰۳");
      await value(page, "2025-02-14");
      await part(page, "year").focus();
      await part(page, "year").press("ArrowLeft");
      assert.equal(await page.evaluate(() => document.activeElement?.id), "date-demo-month");
      await button(page, "locale").click();
      await page.waitForFunction(() => document.querySelector("#date-demo-month")?.value === "2");
      await page.locator("#date-demo-label").click();
      assert.equal(await page.evaluate(() => document.activeElement?.id), "date-demo-month");
      // Associate a separate native form; moving Host-owned inputs would test reparenting instead.
      await page.evaluate(() => {
        const form = document.createElement("form");
        form.id = "date-demo-form";
        document.body.append(form);
      });
      await page.waitForFunction(
        () => document.querySelector("#date-demo-proxy")?.form?.id === "date-demo-form",
      );
      assert.deepEqual(
        await page.evaluate(() => [...new FormData(document.querySelector("#date-demo-form"))]),
        [["departure", "2025-02-14"]],
      );
      await part(page, "day").press("Delete");
      await value(page, "");
      assert.equal(
        await page.evaluate(() => document.querySelector("#date-demo-form").reportValidity()),
        false,
      );
      assert.equal(await page.evaluate(() => document.activeElement?.id), "date-demo-month");
      assert.ok((await page.locator("#date-demo-error").textContent()).length > 0);
      await part(page, "day").fill("15");
      await value(page, "2025-02-15");
      await page.evaluate(() => {
        document.querySelector("#date-demo-input").dataset.lensoMin = "2025-03-01";
      });
      await page.waitForFunction(() =>
        document.querySelector("#date-demo-input").hasAttribute("data-date-invalid"),
      );
      assert.equal(
        await page.evaluate(() => document.querySelector("#date-demo-form").checkValidity()),
        false,
      );
      await page.evaluate(() => {
        document.querySelector("#date-demo-input").dataset.lensoMin = "";
      });
      await page.waitForFunction(
        () => !document.querySelector("#date-demo-input").hasAttribute("data-date-invalid"),
      );
      await button(page, "replace").click();
      await value(page, "2026-11-12");
      assert.equal(await part(page, "day").inputValue(), "12");
      const captures = [];
      for (const width of [390, 1100])
        for (const appearance of ["light", "dark"]) {
          await page.setViewportSize({ width, height: 950 });
          if (
            (appearance === "dark") !==
            Boolean(await page.locator('[data-theme="dark"]').count())
          )
            await page.getByTestId("theme").click();
          for (const variant of ["secondary", "primary"]) {
            const file = path.join(artifacts, `${engine}-${width}-${appearance}-${variant}.png`);
            await page.locator("#date-field-examples").screenshot({ path: file });
            captures.push(file);
            const geometry = await page.locator(root).evaluate((n) => ({
              width: n.getBoundingClientRect().width,
              height: n.getBoundingClientRect().height,
              overflow: n.scrollWidth > n.clientWidth + 1,
            }));
            assert.ok(geometry.height >= 30);
            assert.equal(geometry.overflow, false);
            await button(page, "variant").click();
          }
        }
      await page.evaluate(() => {
        window.dateOld = document.querySelector("#date-demo-day");
      });
      await button(page, "mounted").click();
      await page.waitForFunction(() => !document.querySelector("#date-demo-input"));
      await page.waitForFunction(
        () =>
          window.dateOld?.readOnly &&
          !window.dateOld.style.width &&
          !window.dateOld.hasAttribute("aria-valuenow"),
      );
      await button(page, "mounted").click();
      await ready(page);
      assert.equal(await part(page, "day").inputValue(), "12");
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      try {
        const p = await mobile.newPage();
        await loadContextCohort(p, server);
        await ready(p);
        await part(p, "day").tap();
        assert.equal(await p.evaluate(() => document.activeElement?.id), "date-demo-day");
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
          "draft normalization, partial editing, rejection, flags, locale/calendar, RTL, label, form, validity, external updates, removal and native mobile tap",
      });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify({ results }, null, 2) + "\n",
      );
      console.log(engine, "date field passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
