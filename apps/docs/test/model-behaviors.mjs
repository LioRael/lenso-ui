import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";
const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = root + "test/model-behaviors-fixture.tsx";
let server;
try {
  server = await createServer({
    root,
    server: { port: 0, watch: null, hmr: false },
    plugins: [
      {
        name: "model-behaviors",
        configureServer(s) {
          s.middlewares.use(async (req, res, next) => {
            if (!req.url.startsWith("/__model-behaviors")) return next();
            try {
              const html = await s.transformIndexHtml(
                req.url,
                '<!doctype html><html><head><title>Forms QA</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture"></div><script type="module" src="/test/' +
                  fixture.split("/").at(-1) +
                  '"></script></body></html>',
              );
              res.setHeader("content-type", "text/html");
              res.end(html);
            } catch (e) {
              next(e);
            }
          });
        },
      },
    ],
  });
  await server.listen();
  for (const [name, engine] of Object.entries({ chromium, webkit })) {
    const browser = await engine.launch(
      name === "chromium" && process.env.UI_SDK_CHROMIUM_CHANNEL
        ? { channel: process.env.UI_SDK_CHROMIUM_CHANNEL }
        : name === "webkit" && process.env.UI_SDK_WEBKIT_EXECUTABLE
          ? { executablePath: process.env.UI_SDK_WEBKIT_EXECUTABLE }
          : {},
    );
    try {
      const page = await browser.newPage({
        viewport: { width: 900, height: 1000 },
        reducedMotion: "reduce",
      });
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on("pageerror", (e) => {
        errors.push(e.message);
        console.log("PAGE ERROR", e.message);
      });
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto(server.resolvedUrls.local[0] + "__model-behaviors", {
        timeout: 60000,
        waitUntil: "domcontentloaded",
      });
      const change = async (label, value) =>
        page.evaluate(
          async ({ label, value }) => {
            const matches = await window.modelAgent.query({ text: label });
            if (!Array.isArray(matches)) throw new Error(JSON.stringify(matches));
            const entry = matches.find((entry) => !entry.offPage && entry.label === label);
            if (!entry) throw new Error(`Missing agent control: ${label}`);
            return window.modelAgent.act({
              steps: [{ ref: entry.ref, action: "setValue", args: [value] }],
            });
          },
          { label, value },
        );
      const values = () =>
        page.evaluate(() => Object.fromEntries(new FormData(document.querySelector("#models"))));
      await page.getByRole("button", { name: "Reset models" }).waitFor({ timeout: 60000 });
      await change("Departure", "2026-11-14");
      assert.equal((await values()).departure, "2026-11-14");
      await change("Departure", "2026-11-15");
      assert.equal((await values()).departure, "2026-11-14");
      const day = page.locator('[data-date-segment="day"]').first();
      await day.focus();
      await day.press("ArrowUp");
      assert.equal((await values()).departure, "2026-11-14");
      await day.press("ArrowLeft");
      assert.notEqual(await day.evaluate((el) => el === document.activeElement), true);
      await change("Meeting time", "15:45:00");
      assert.equal((await values()).meeting, "15:45:00");
      await change("Accent", "#00FF00");
      assert.equal((await values()).accent.toUpperCase(), "#00FF00");
      await change("Accent", "#0000FF");
      assert.equal((await values()).accent.toUpperCase(), "#00FF00");
      await page.getByRole("button", { name: "Reset models" }).click();
      assert.equal((await values()).departure, "2026-11-13");
      assert.equal((await values()).accent.toUpperCase(), "#FF0000");
      const returnTrigger = page.getByRole("button", { name: "Choose return date", exact: true });
      await returnTrigger.click();
      const returnDialog = page.getByRole("dialog", { name: "Return date calendar", exact: true });
      await returnDialog
        .locator('[data-calendar-date="2026-11-15"]:not([data-outside-month])')
        .click();
      assert.equal(await returnDialog.isVisible(), true);
      assert.equal(await page.locator('input[name="return"]').inputValue(), "2026-11-13");
      await returnDialog
        .locator('[data-calendar-date="2026-11-16"]:not([data-outside-month])')
        .click();
      await returnDialog.waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.body.dataset.datePopupComplete === "false");
      assert.equal(await page.locator('input[name="return"]').inputValue(), "2026-11-16");
      await page.waitForFunction(
        () => document.activeElement?.textContent === "Choose return date",
      );
      assert.equal(
        await page.locator("body").getAttribute("data-date-popup-change"),
        "false:programmatic",
      );
      assert.equal(await page.locator("body").getAttribute("data-date-value-source"), "mouse");
      await returnTrigger.click();
      await page.getByRole("button", { name: "Cancel date", exact: true }).click();
      await returnDialog.waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.body.dataset.datePopupComplete === "false");
      await returnTrigger.click();
      await returnDialog.waitFor();
      await change("Return calendar", null);
      await returnDialog.waitFor({ state: "hidden" });
      assert.equal(await page.locator('input[name="return"]').inputValue(), "");
      const booking = page.locator('[data-lenso-slot="calendar"][aria-label="Booking"]');
      const last = booking.locator('[data-calendar-date="2026-11-30"]:not([data-outside-month])');
      await last.focus();
      await last.press("ArrowRight");
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("data-calendar-date") === "2026-12-01",
      );
      const trigger = booking.locator('[data-lenso-slot="calendar-year-picker-trigger"]');
      await trigger.click();
      await page.waitForFunction(
        () =>
          document.activeElement?.getAttribute("data-lenso-slot") ===
          "calendar-year-picker-year-cell",
      );
      await page.evaluate(async () => {
        const entry = window.modelAgent
          .snapshot()
          .find((entry) => !entry.offPage && entry.component === "year-picker");
        if (!entry) throw new Error("Missing year-picker agent");
        const matches = await window.modelAgent.query({ within: entry.ref, text: "2027" });
        if (!Array.isArray(matches)) throw new Error(JSON.stringify(matches));
        const choice = matches
          .flatMap((result) => result.items ?? [])
          .find((item) => item.label === "2027");
        if (!choice) throw new Error("Missing year choice");
        await window.modelAgent.act({
          steps: [{ ref: entry.ref, action: "setValue", args: [choice.value] }],
        });
      });
      assert.equal(await trigger.getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("body").getAttribute("data-year-value-source"), "agent");
      const selectedYear = page.locator('[data-lenso-slot="calendar-year-picker-year-cell"]:focus');
      await selectedYear.press("ArrowRight");
      assert.notEqual(
        await page
          .locator('[data-lenso-slot="calendar-year-picker-year-cell"]:focus')
          .evaluate((node) => getComputedStyle(node).boxShadow),
        "none",
      );
      await page.keyboard.press("Enter");
      assert.equal(await trigger.getAttribute("aria-expanded"), "true");
      assert.equal(await page.locator("body").getAttribute("data-year-value-source"), "keyboard");
      await page.keyboard.press("Escape");
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      assert.equal(await trigger.evaluate((node) => document.activeElement === node), true);
      assert.equal(
        await page.locator("body").getAttribute("data-year-change"),
        "false:programmatic",
      );
      await trigger.click();
      await page.evaluate(async () => {
        const entry = window.modelAgent
          .snapshot()
          .find((entry) => !entry.offPage && entry.component === "year-picker");
        const matches = await window.modelAgent.query({ within: entry.ref, text: "2028" });
        if (!Array.isArray(matches)) throw new Error(JSON.stringify(matches));
        const choice = matches
          .flatMap((result) => result.items ?? [])
          .find((item) => item.label === "2028");
        await window.modelAgent.act({
          steps: [{ ref: entry.ref, action: "setValue", args: [choice.value] }],
        });
      });
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-lenso-slot="calendar-year-picker-trigger"]')
            ?.getAttribute("aria-expanded") === "false",
      );
      assert.equal(await page.locator("body").getAttribute("data-year-change"), "false:agent");
      await trigger.click();
      await page
        .locator('[data-lenso-slot="calendar-year-picker-year-cell"][data-year="2029"]')
        .click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-lenso-slot="calendar-year-picker-trigger"]')
            ?.getAttribute("aria-expanded") === "false",
      );
      assert.equal(await page.locator("body").getAttribute("data-year-value-source"), "mouse");
      await trigger.click();
      await page
        .locator('[data-lenso-slot="calendar-year-picker-year-cell"][data-year="2029"]')
        .click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-lenso-slot="calendar-year-picker-trigger"]')
            ?.getAttribute("aria-expanded") === "false",
      );
      await page.getByRole("button", { name: "Disable booking", exact: true }).click();
      assert.equal(
        await trigger.evaluate(
          (node) => node.matches(":disabled") || node.getAttribute("aria-disabled") === "true",
        ),
        true,
      );
      await trigger.click({ force: true });
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      await change("Trip", ["2026-11-14", "2026-11-16"]);
      assert.deepEqual(
        await page.evaluate(
          () => window.modelAgent.snapshot().find((e) => !e.offPage && e.label === "Trip").value,
        ),
        ["2026-11-10", "2026-11-12"],
      );
      const trip = page.locator('[data-lenso-slot="range-calendar"]');
      const rangeValue = () =>
        page.evaluate(
          () => window.modelAgent.snapshot().find((e) => !e.offPage && e.label === "Trip").value,
        );
      const dragRange = async (end, cancel = false) => {
        const startCell = trip.locator(
          '[data-calendar-date="2026-11-14"]:not([data-outside-month])',
        );
        const endCell = trip.locator(
          `[data-calendar-date="2026-11-${end}"]:not([data-outside-month])`,
        );
        await startCell.scrollIntoViewIfNeeded();
        const from = await startCell.boundingBox(),
          to = await endCell.boundingBox();
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
        if (cancel) await page.keyboard.press("Escape");
        await page.mouse.up();
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      };
      await dragRange(16);
      assert.deepEqual(await rangeValue(), ["2026-11-10", "2026-11-12"]);
      await dragRange(17, true);
      assert.deepEqual(await rangeValue(), ["2026-11-10", "2026-11-12"]);
      await dragRange(17);
      assert.deepEqual(await rangeValue(), ["2026-11-14", "2026-11-17"]);
      await page.getByRole("button", { name: "Open palette", exact: true }).click();
      await page.getByRole("dialog", { name: "Palette editor", exact: true }).waitFor();
      await change("Palette", "hsl(120 0% 50%)");
      await change("Palette", "hsl(240 100% 50%)");
      assert.equal(
        await page
          .locator('[data-lenso-slot="color-slider"] [role="slider"]')
          .getAttribute("aria-valuenow"),
        "120",
      );
      await page.getByRole("button", { name: "Close palette", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Palette editor", exact: true })
        .waitFor({ state: "hidden" });
      await page.waitForFunction(() => document.activeElement?.textContent === "Open palette");
      assert.deepEqual(errors, []);
      console.log(name, "PASS", browser.version());
      await page.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  await server?.close();
}
