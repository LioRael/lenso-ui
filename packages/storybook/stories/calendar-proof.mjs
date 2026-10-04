// Production iframe proof. No dev server and no writes to the dependency checkout.
// node calendar-proof.mjs <production-directory> <absolute-playwright-module> [artifacts]
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const [directory, playwrightModule, artifactArgument] = process.argv.slice(2);
assert(directory && playwrightModule);
const artifacts = artifactArgument && resolve(artifactArgument);
if (artifacts) await mkdir(artifacts, { recursive: true });
const expected = {
  calendar: [
    "Default",
    "WithYearPicker",
    "DefaultValue",
    "Controlled",
    "MinMaxDates",
    "UnavailableDates",
    "WeeksInMonth",
    "MultipleSelection",
    "CustomUnavailableDates",
    "Disabled",
    "ReadOnly",
    "Invalid",
    "FocusedValue",
    "WithIndicators",
    "TodayIndicator",
    "MultipleMonths",
    "DayView",
    "WeekView",
    "InternationalCalendar",
    "ThreeMonths",
    "BookingCalendar",
    "YearPicker",
    "YearPickerStyledCells",
    "YearPickerCustomCells",
    "CustomNavIcons",
    "EventCalendar",
  ],
  "range-calendar": [
    "Default",
    "WithYearPicker",
    "DefaultValue",
    "Controlled",
    "MinMaxDates",
    "UnavailableDates",
    "WeeksInMonth",
    "AnchorUnavailableDates",
    "AllowsNonContiguousRanges",
    "Disabled",
    "ReadOnly",
    "Invalid",
    "FocusedValue",
    "WithIndicators",
    "MultipleMonths",
    "ThreeMonths",
    "DayView",
    "WeekView",
    "InternationalCalendar",
    "BookingCalendar",
  ],
};
const sourceHashes = {
  calendar: "7a051680459e56b82842583c5f7582f3a0a679770bab0cb32c26588fbb1d88c8",
  "range-calendar": "d0b4ab899f1b37341c0eeab8174ac8f3ae0803e05116c9b5ca98ae951fb02dce",
};
for (const [family, names] of Object.entries(expected)) {
  const source = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
  assert.deepEqual(
    [...source.matchAll(/export const (\w+)/g)].map((m) => m[1]),
    names,
  );
  if (process.env.CALENDAR_VERIFY_PIN === "1") {
    const raw = execFileSync("curl", [
      "-fsSL",
      "--max-time",
      "30",
      `https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/${family}/${family}.stories.tsx`,
    ]);
    assert.equal(createHash("sha256").update(raw).digest("hex"), sourceHashes[family]);
    assert.deepEqual(
      [...raw.toString().matchAll(/export const (\w+)/g)].map((m) => m[1]),
      names,
    );
    if (artifacts) await writeFile(resolve(artifacts, `${family}.upstream.tsx`), raw);
  }
}
const root = resolve(directory);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep)) return res.writeHead(403).end();
  try {
    res.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await import(
  playwrightModule.startsWith("/") ? pathToFileURL(playwrightModule).href : playwrightModule
);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, timezoneId: "UTC" });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const index = JSON.parse(await readFile(resolve(root, "index.json"), "utf8"));
const entries = Object.values(index.entries).filter(
  (e) =>
    e.type === "story" &&
    Object.keys(expected).some((f) => e.importPath === `./stories/${f}.stories.tsx`),
);
assert.equal(entries.length, 46);
const report = {
  sourceHashes,
  productionAssetHashes: Object.fromEntries(
    await Promise.all(
      (await readdir(resolve(root, "assets")))
        .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
        .map(async (name) => [
          name,
          createHash("sha256")
            .update(await readFile(resolve(root, "assets", name)))
            .digest("hex"),
        ]),
    ),
  ),
  mounts: [],
  assertions: [],
  ambient: {
    timezone: "UTC",
    runDate: new Date().toISOString(),
    note: "Pinned today(getLocalTimeZone()) behavior retained; no fake system date.",
  },
  nativeLimits: [],
  errors,
};
const passed = (name) => {
  report.assertions.push(name);
  console.log(`PASS ${name}`);
};
async function mount(family, name, theme = "light") {
  const entry = entries.find(
    (e) => e.importPath === `./stories/${family}.stories.tsx` && e.exportName === name,
  );
  assert(entry, `${family}/${name}`);
  await page.goto(`${base}/iframe.html?id=${entry.id}&viewMode=story&globals=theme:${theme}`);
  await page.locator(`[data-slot="${family}"]`).waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  assert.equal(await page.locator("#storybook-root").getAttribute("hidden"), null);
  await page.getByRole("grid").first().waitFor();
}
const cell = (day) =>
  page
    .locator('[role="button"][data-slot$="calendar-cell"]')
    .filter({ hasText: new RegExp(`^${day}$`) })
    .filter({ visible: true })
    .first();
const selected = () =>
  page.locator('[data-slot$="calendar-cell"][aria-selected="true"], td[aria-selected="true"]');
const nextNav = () => page.locator('[data-slot="calendar-nav-button"][slot="next"]');
const previousNav = () => page.locator('[data-slot="calendar-nav-button"][slot="previous"]');
async function selectDay(day) {
  await cell(day).click();
}
try {
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        const geometry = await page.locator(`[data-slot="${family}"]`).evaluate((n) => {
          const b = n.getBoundingClientRect();
          const c = getComputedStyle(n);
          return {
            width: b.width,
            height: b.height,
            background: c.backgroundColor,
            color: c.color,
          };
        });
        assert(geometry.width >= 200 && geometry.height >= 100, `${family}/${name} geometry`);
        report.mounts.push({ family, name, theme, geometry });
        if (artifacts)
          await page.screenshot({ path: resolve(artifacts, `${family}-${name}-${theme}.png`) });
      }
  assert.equal(report.mounts.length, 92);
  passed("92 active production light/dark mounts, exact 26+20 pinned exports");
  for (const family of Object.keys(expected)) {
    await mount(family, "DefaultValue");
    assert(
      (await page.getByRole("grid").first().getAttribute("aria-label")).includes("February 2025"),
    );
    await cell(14).focus();
    await page.keyboard.press("ArrowRight");
    assert((await page.evaluate(() => document.activeElement.textContent)).includes("15"));
    await page.keyboard.press("Enter");
    if (family === "range-calendar") {
      await cell(18).focus();
      await page.keyboard.press("Enter");
    }
    assert((await selected().count()) > 0);
    const selectedText = await selected().allTextContents();
    assert(selectedText.includes("15"));
    assert(!selectedText.includes("3"));
    if (family === "range-calendar") assert(selectedText.includes("18"));
    await nextNav().click();
    assert((await page.getByRole("grid").first().getAttribute("aria-label")).includes("March"));
    await previousNav().click();
    passed(`${family}: native ArrowRight/Enter selection and previous/next navigation`);
    await mount(family, "Controlled");
    await page
      .getByRole("button", {
        name: family === "calendar" ? "Set Christmas" : "Set Holidays",
        exact: true,
      })
      .click();
    assert(
      (await page.locator("#storybook-root").innerText()).includes(
        family === "calendar" ? "2025-12-25" : "2025-12-20 -> 2025-12-31",
      ),
    );
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    assert((await page.locator("#storybook-root").innerText()).includes("(none)"));
    await page.getByRole("button", { name: "Next month", exact: true }).click();
    assert(!(await page.locator("#storybook-root").innerText()).includes("(none)"));
    passed(`${family}: controlled preset, clear, ambient next-month action`);
    await mount(family, "FocusedValue");
    await page.getByRole("button", { name: "Go to Jan", exact: true }).click();
    assert((await page.locator("#storybook-root").innerText()).includes("2025-01-01"));
    await mount(family, "MinMaxDates");
    assert.equal(await previousNav().isDisabled(), true);
    assert((await page.locator('[data-disabled="true"], [aria-disabled="true"]').count()) > 0);
    for (let i = 0; i < 3; i++) await nextNav().click();
    assert.equal(await nextNav().isDisabled(), true);
    await mount(family, "UnavailableDates");
    assert((await page.locator('[data-unavailable="true"]').count()) > 0);
    await mount(family, "Invalid");
    assert((await page.locator('[data-invalid="true"]').count()) > 0);
    if (family === "calendar") {
      const current = new Date();
      const months = (current.getUTCFullYear() - 2025) * 12 + current.getUTCMonth();
      for (let i = 0; i < months; i++) await nextNav().click();
      await selectDay(current.getUTCDate());
    } else {
      await selectDay(10);
      await selectDay(11);
    }
    assert.equal(await page.locator('[data-invalid="true"]').count(), 0);
    await mount(family, "WeeksInMonth");
    assert.equal(await page.locator('[data-slot="calendar-grid-body"] tr').count(), 6);
    passed(
      `${family}: focused controls, min/max disabled navigation/cells, unavailable and invalid state`,
    );
    await mount(family, "WithYearPicker");
    await page.locator('[data-slot="calendar-year-picker-trigger"]').click();
    await page.locator('[data-slot="calendar-year-picker-year-cell"]').first().waitFor();
    await page
      .locator('[data-slot="calendar-year-picker-year-cell"]')
      .filter({ hasText: "2025" })
      .click();
    await page.getByRole("grid").first().waitFor();
    passed(`${family}: contextual native year picker opens and selects year`);
    for (const [story, label, option, count] of [
      ["DayView", "Visible days", "10 days", 10],
      ["WeekView", "Visible weeks", "2 weeks", 14],
    ]) {
      await mount(family, story);
      await page.getByRole("combobox", { name: label }).click();
      await page.getByRole("option", { name: option, exact: true }).click();
      assert((await page.locator('[data-slot$="calendar-cell"]').count()) >= count);
    }
    await mount(family, "InternationalCalendar");
    const internationalLabel = await page.getByRole("grid").first().getAttribute("aria-label");
    const indianYear = new Intl.DateTimeFormat("hi-IN-u-ca-indian", {
      year: "numeric",
      timeZone: "UTC",
    })
      .format(new Date())
      .match(/\d+/)[0];
    assert(/[\u0900-\u097f]/.test(internationalLabel));
    assert(internationalLabel.includes(indianYear));
    await page.locator('[data-slot="calendar-year-picker-trigger"]').click();
    await page
      .locator('[data-slot="calendar-year-picker-year-cell"]')
      .filter({ hasText: indianYear })
      .waitFor();
    passed(`${family}: Base UI day/week selects and hi-IN Indian calendar`);
    for (const name of ["WithIndicators", "MultipleMonths", "ThreeMonths"]) {
      await mount(family, name);
      if (name === "WithIndicators")
        assert((await page.locator('[data-slot="calendar-cell-indicator"]').count()) > 0);
      else {
        assert.equal(await page.getByRole("grid").count(), name === "MultipleMonths" ? 2 : 3);
        const box = await page.locator(`[data-slot="${family}"]`).boundingBox();
        assert.equal(Math.round(box.width), name === "MultipleMonths" ? 544 : 824);
      }
    }
    for (const state of ["Disabled", "ReadOnly"]) {
      await mount(family, state);
      const before = await selected().count();
      await cell(15).click({ force: true });
      assert.equal(await selected().count(), before);
    }
    await mount(family, "BookingCalendar");
    assert.equal(await page.locator('[data-slot="calendar-cell-indicator"]').count(), 0);
    await page
      .locator(
        '[data-slot$="calendar-cell"][role="button"]:not([data-disabled]):not([data-unavailable])',
      )
      .first()
      .click();
    if (family === "range-calendar")
      await page
        .locator(
          '[data-slot$="calendar-cell"][role="button"]:not([data-disabled]):not([data-unavailable])',
        )
        .first()
        .click();
    await page.getByRole("button", { name: /^Book / }).waitFor();
    passed(
      `${family}: disabled/read-only selection guarded; booking availability and selected-date action content`,
    );
  }
  await mount("calendar", "MultipleSelection");
  await selectDay(10);
  await selectDay(11);
  assert((await page.locator("#storybook-root").innerText()).includes("2 date(s) selected"));
  await mount("calendar", "CustomUnavailableDates");
  const now = new Date();
  const monthsToFebruary = (now.getUTCFullYear() - 2025) * 12 + now.getUTCMonth() - 1;
  for (let i = 0; i < Math.abs(monthsToFebruary); i++)
    await (monthsToFebruary > 0 ? previousNav() : nextNav()).click();
  assert.equal(await cell(14).getAttribute("data-unavailable"), "true");
  await cell(14).click({ force: true });
  assert.equal(await selected().count(), 0);
  passed(
    "multiple-selection controlled model; fixed February 2025 holiday unavailable and not selectable",
  );
  await mount("range-calendar", "AnchorUnavailableDates");
  await page
    .locator(
      '[data-slot="range-calendar-cell"][role="button"]:not([data-disabled]):not([data-unavailable])',
    )
    .first()
    .click();
  assert(
    (await page.locator('[data-slot="range-calendar-cell"][data-unavailable="true"]').count()) > 0,
  );
  await mount("range-calendar", "AllowsNonContiguousRanges");
  assert((await selected().count()) > 1);
  assert((await page.locator('[data-unavailable="true"]').count()) > 0);
  passed(
    "range anchor-relative 7-day availability and initial non-contiguous selection across blocked dates",
  );
  await mount("calendar", "YearPickerCustomCells");
  await page.locator('[data-slot="calendar-year-picker-trigger"]').click();
  assert((await page.getByText("Now", { exact: true }).count()) > 0);
  await mount("calendar", "YearPickerStyledCells");
  await page.locator('[data-slot="calendar-year-picker-trigger"]').click();
  await page
    .locator('[data-slot="calendar-year-picker-year-cell"]')
    .filter({ hasText: "2025" })
    .click();
  await page.locator('[data-slot="calendar-year-picker-trigger"]').click();
  const currentYear = page
    .locator('[data-slot="calendar-year-picker-year-cell"]')
    .filter({ hasText: String(new Date().getUTCFullYear()) });
  assert(
    (await currentYear.evaluate((node) => getComputedStyle(node).boxShadow)).includes("inset"),
  );
  await mount("calendar", "EventCalendar");
  assert((await page.locator('[data-slot="calendar-cell-indicator"]').count()) > 0);
  await mount("calendar", "TodayIndicator");
  assert.equal(await page.locator('[data-slot="calendar-cell-indicator"]').count(), 1);
  await mount("calendar", "CustomNavIcons");
  assert.equal(
    await previousNav().locator("svg path").getAttribute("d"),
    "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6l6 6z",
  );
  assert.equal(
    await nextNav().locator("svg path").getAttribute("d"),
    "M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z",
  );
  passed("custom year cell content and scheduled-event cell render functions");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const family of Object.keys(expected)) {
    await mount(family, "Default", "dark");
    assert(
      await page.locator(`[data-slot="${family}"]`).evaluate((n) => {
        const b = n.getBoundingClientRect();
        return b.left >= 0 && b.right <= innerWidth;
      }),
    );
    await page.evaluate(() => (document.documentElement.dir = "rtl"));
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    await nextNav().click();
    for (const story of ["MultipleMonths", "ThreeMonths"]) {
      await mount(family, story, "dark");
      assert(
        await page.locator(`[data-slot="${family}"]`).evaluate((n) => {
          const b = n.getBoundingClientRect();
          return b.left >= 0 && b.right <= innerWidth && n.scrollWidth > n.clientWidth;
        }),
      );
    }
  }
  passed(
    "390px dark calendar bounds and contained multi-month scrolling; RTL document navigation smoke",
  );
  assert.deepEqual(errors, []);
  if (artifacts)
    await writeFile(
      resolve(artifacts, "calendar-proof.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
  console.log("PASS calendar proof", report.assertions.length);
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
