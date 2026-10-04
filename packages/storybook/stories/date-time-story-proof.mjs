// node date-time-story-proof.mjs <production-storybook> <absolute-playwright-module> [scratch-artifacts]
// DATE_TIME_VERIFY_PIN=1 also refetches all four immutable source files and original icon paths.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, readdir } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";

assert.equal(process.version, "v24.18.0");
const [directory, playwrightModule, artifactsArgument] = process.argv.slice(2);
assert(
  directory && playwrightModule,
  "Provide production Storybook and installed Playwright module",
);
const artifacts = artifactsArgument && resolve(artifactsArgument);
if (artifacts) await mkdir(artifacts, { recursive: true });
const { chromium } = await import(pathToFileURL(resolve(playwrightModule)).href);
const expected = {
  "date-field": [
    "Default",
    "Variants",
    "FullWidth",
    "WithDescription",
    "Required",
    "Invalid",
    "Disabled",
    "Controlled",
    "WithValidation",
    "WithPrefixIcon",
    "WithSuffixIcon",
    "WithPrefixAndSuffix",
    "FormExample",
    "Granularity",
    "AllVariations",
  ],
  "time-field": [
    "Default",
    "FullWidth",
    "WithDescription",
    "Required",
    "Invalid",
    "Disabled",
    "Controlled",
    "WithValidation",
    "WithPrefixIcon",
    "WithSuffixIcon",
    "WithPrefixAndSuffix",
    "FormExample",
    "AllVariations",
  ],
  "date-picker": [
    "Default",
    "Controlled",
    "Disabled",
    "WithValidation",
    "WithCustomIndicator",
    "FormExample",
  ],
  "date-range-picker": [
    "Default",
    "Controlled",
    "Disabled",
    "WithValidation",
    "WithCustomIndicator",
    "FormExample",
  ],
};
const sourceHashes = {
  "date-field": "82fee4db20182ee67ca510218cfdbdcbef14b619eaa7cf54220e02cd5ad27d5a",
  "time-field": "21da2f7c38edb6d895e4773bb51727e39e80159836322372f52fd46c47ec7d45",
  "date-picker": "2c3760568f8fe63e1437ce3e1ced64d0ec7150dc8a6039f67630eb943b82a6e6",
  "date-range-picker": "9558f14b291766ca8d937452cff57647cf8fbd40e2f926d76758a829fdd2a81c",
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const curl = promisify(execFile);
const localHashes = {};
for (const [family, names] of Object.entries(expected)) {
  const source = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
  localHashes[family] = hash(source);
  assert.deepEqual(
    [...source.matchAll(/export const (\w+)/g)].map((match) => match[1]),
    names,
  );
  assert(!source.includes("className="), "No utility classes or Tailwind aliases");
  if (process.env.DATE_TIME_VERIFY_PIN === "1") {
    const { stdout } = await curl(
      "curl",
      [
        "-fsSL",
        "--max-time",
        "30",
        `https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/${family}/${family}.stories.tsx`,
      ],
      { encoding: "buffer" },
    );
    assert.equal(hash(stdout), sourceHashes[family], `${family} immutable raw source bytes`);
    assert.deepEqual(
      [...stdout.toString().matchAll(/export const (\w+)/g)].map((match) => match[1]),
      names,
    );
  }
}
assert.equal(Object.values(expected).flat().length, 40);
for (const name of [
  "date-time-story.fixtures.tsx",
  "date-time-story.stylex.ts",
  "date-time-story-build.fixtures.mjs",
  "date-time-story-proof.mjs",
])
  localHashes[name] = hash(await readFile(new URL(`./${name}`, import.meta.url)));
const licenseHashes = {
  herouiApache: hash(
    await readFile(new URL("../../../third-party/heroui/LICENSE.txt", import.meta.url)),
  ),
  gravityMIT: hash(await readFile(new URL("../GRAVITY-ICONS-LICENSE.txt", import.meta.url))),
};
if (process.env.DATE_TIME_VERIFY_PIN === "1") {
  const source = await readFile(new URL("./date-time-story.fixtures.tsx", import.meta.url), "utf8");
  const paths = [...source.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
  const { stdout } = await curl("curl", [
    "-fsSL",
    "--max-time",
    "30",
    "https://api.iconify.design/gravity-ui.json?icons=calendar,clock,chevron-down,circle-question",
  ]);
  const icons = JSON.parse(stdout);
  assert.deepEqual(
    paths,
    ["chevron-down", "clock", "calendar", "circle-question"].map(
      (name) => icons.icons[name].body.match(/ d="([^"]+)"/)[1],
    ),
  );
}
const root = resolve(directory);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(root + sep)) return response.writeHead(403).end();
  try {
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1100, height: 900 },
  locale: "en-US",
  timezoneId: "America/Los_Angeles",
});
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const indexBytes = await readFile(resolve(root, "index.json"));
const index = JSON.parse(indexBytes);
const entries = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    Object.keys(expected).some((family) => entry.importPath === `./stories/${family}.stories.tsx`),
);
assert.equal(entries.length, 40);
const outputHashes = {};
for (const name of await readdir(resolve(root, "assets"))) {
  if (/\.(?:js|css)$/.test(name))
    outputHashes[name] = hash(await readFile(resolve(root, "assets", name)));
}
const report = {
  node: process.version,
  browser: browser.version(),
  timezone: "America/Los_Angeles",
  sourceHashes,
  localHashes,
  licenseHashes,
  indexHash: hash(indexBytes),
  outputHashes,
  mounts: [],
  workflows: [],
  limits: [],
};
const passed = (name) => {
  report.workflows.push(name);
  console.log("PASS", name);
};
async function mount(family, name, theme = "light", locale) {
  const entry = entries.find(
    (candidate) =>
      candidate.importPath === `./stories/${family}.stories.tsx` && candidate.exportName === name,
  );
  assert(entry, `${family}/${name} exists in production index`);
  const search = new URLSearchParams({
    id: entry.id,
    viewMode: "story",
    globals: `theme:${theme}`,
  });
  if (locale) search.set("dateTimeLocale", locale);
  await page.goto(`${base}/iframe.html?${search}`);
  await page.locator(`[data-slot="${family}"]`).first().waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  assert.equal((await page.locator("#storybook-root [role=spinbutton]").count()) > 0, true);
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-slot="date-input-group"]')].every(
      (node) => node.getBoundingClientRect().height > 0,
    ),
  );
  return entry;
}
async function snapshot(name) {
  if (artifacts) {
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState !== "running"),
    );
    await page.screenshot({ path: resolve(artifacts, `${name}.png`), fullPage: true });
  }
}
async function openPicker(family) {
  const trigger = page.locator(`[data-slot="${family}-trigger"]`);
  assert.equal(await trigger.evaluate((node) => getComputedStyle(node).pointerEvents), "auto");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  const calendar = page.locator(
    `[data-slot="${family === "date-range-picker" ? "range-calendar" : "calendar"}"]`,
  );
  await calendar.waitFor();
  assert.equal(await dialog.getByRole("grid").count(), 1);
  assert.equal((await dialog.getByRole("button").count()) > 20, true);
  assert.equal(
    await calendar.evaluate((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.left >= 0 && box.right <= innerWidth;
    }),
    true,
  );
  return dialog;
}
async function segmentValue(name, value, input = page) {
  const segment = input
    .getByRole("spinbutton", { name: new RegExp(`^${name}(?:,|$)`, "i") })
    .first();
  await segment.click();
  await segment.pressSequentially(String(value));
  assert.equal(
    Number(await segment.getAttribute("aria-valuenow")),
    value,
    `${name} keyboard input`,
  );
}
async function fillDate(value, input = page) {
  const [year, month, day] = value.split("-").map(Number);
  await segmentValue("month", month, input);
  await segmentValue("day", day, input);
  await segmentValue("year", year, input);
}
async function fillTime(hour, minute) {
  await segmentValue("hour", hour);
  await segmentValue("minute", minute);
  const period = page.getByRole("spinbutton", { name: /^AM\/PM/i });
  if (await period.count()) {
    await period.click();
    await period.press("a");
  }
}
async function formData() {
  return page.locator("form").evaluate((form) => Object.fromEntries(new FormData(form)));
}
async function submitAndReset(expectedData) {
  assert.deepEqual(await formData(), expectedData);
  const submit = page.getByRole("button", { name: "Submit", exact: true });
  assert.equal(await submit.isEnabled(), true);
  await submit.click();
  const pending = page.getByRole("button", { name: "Submitting...", exact: true });
  await pending.waitFor();
  assert.equal(await pending.getAttribute("aria-busy"), "true");
  assert.equal(await pending.isEnabled(), true, "pending remains focusable");
  await pending.focus();
  assert.equal(await pending.evaluate((node) => node === document.activeElement), true);
  assert.deepEqual(
    JSON.parse(await page.locator("form").getAttribute("data-submitted")),
    expectedData,
  );
  await pending.press("Enter");
  await pending.press("Space");
  assert.equal(await page.locator("form").getAttribute("data-submission-count"), "1");
  await submit.waitFor();
  await page.waitForFunction(() => {
    const inputs = [...document.querySelectorAll("form input[hidden][name]")];
    return inputs.length > 0 && inputs.every((input) => input.value === "");
  });
  assert.equal(await submit.isDisabled(), true, "controlled request completion clears values");
}
try {
  for (const theme of ["light", "dark"]) {
    for (const [family, names] of Object.entries(expected)) {
      for (const name of names) {
        const entry = await mount(family, name, theme);
        const roots = page.locator(`[data-slot="${family}"]`);
        const geometry = await roots.evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            return { width: box.width, height: box.height };
          }),
        );
        const supportingVisual = await roots
          .first()
          .locator('[data-slot="label"]')
          .evaluate((label) => {
            const style = getComputedStyle(label);
            return {
              color: style.color,
              fontWeight: style.fontWeight,
              opacity: style.opacity,
              requiredMarker: getComputedStyle(label, "::after").content,
            };
          });
        assert(geometry.every((box) => box.width > 0 && box.height > 0));
        const segments = page.getByRole("spinbutton");
        if (name === "Disabled") {
          assert.equal(
            await segments.evaluateAll((nodes) =>
              nodes.every((node) => node.getAttribute("aria-disabled") === "true"),
            ),
            true,
          );
          if (family.includes("picker"))
            assert.equal(await page.locator(`[data-slot="${family}-trigger"]`).isDisabled(), true);
        } else {
          const segment = segments.first();
          await segment.click();
          await segment.press("ArrowUp");
          assert(await segment.getAttribute("aria-valuenow"), "native segment keyboard editing");
        }
        if (name === "Required" || name === "Invalid") {
          if (name === "Required") {
            assert.equal(await roots.first().getAttribute("data-required"), "true");
            assert.equal(await segments.first().getAttribute("aria-required"), "true");
          }
          if (name === "Invalid") {
            assert.equal(await roots.first().getAttribute("data-invalid"), "true");
            assert.equal(await segments.first().getAttribute("aria-invalid"), "true");
          }
        }
        await snapshot(`${entry.id}-${theme}`);
        let opened = false;
        if (family.includes("picker") && name !== "Disabled") {
          await openPicker(family);
          await snapshot(`${entry.id}-${theme}-open`);
          opened = true;
          await page.keyboard.press("Escape");
          await page.getByRole("dialog").waitFor({ state: "hidden" });
          assert.equal(
            await page
              .locator(`[data-slot="${family}-trigger"]`)
              .evaluate((node) => node === document.activeElement),
            true,
          );
        }
        report.mounts.push({ family, export: name, theme, geometry, supportingVisual, opened });
      }
    }
  }
  assert.equal(report.mounts.length, 80);
  assert.equal(report.mounts.filter((mount) => mount.opened).length, 20);
  passed(
    "exact 40 pin exports; 80 real production light/dark iframe mounts; all 20 enabled picker mounts actually opened; disabled and required/invalid semantics; Escape focus restoration",
  );

  for (const theme of ["light", "dark"]) {
    await mount("date-field", "Controlled", theme);
    await page.getByRole("button", { name: "Set today", exact: true }).click();
    const first = await page
      .getByRole("spinbutton", { name: /^day,/i })
      .getAttribute("aria-valuenow");
    await page.getByRole("spinbutton", { name: /^day,/i }).click();
    await page.keyboard.press("ArrowUp");
    assert.notEqual(
      await page.getByRole("spinbutton", { name: /^day,/i }).getAttribute("aria-valuenow"),
      first,
    );
    assert(!(await page.getByText("Current value: (empty)", { exact: true }).count()));
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await page.getByText("Current value: (empty)", { exact: true }).waitFor();
    await mount("time-field", "Controlled", theme);
    await page.getByRole("button", { name: "Set now", exact: true }).click();
    assert(await page.getByRole("spinbutton", { name: /^minute,/i }).getAttribute("aria-valuenow"));
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await page.getByText("Current value: (empty)", { exact: true }).waitFor();

    await mount("date-field", "Granularity", theme);
    for (const [name, segmentNames] of [
      ["Hour", ["hour"]],
      ["Minute", ["hour", "minute"]],
      ["Second", ["hour", "minute", "second"]],
      ["Day", []],
    ]) {
      await page.getByRole("combobox", { name: "Granularity" }).click();
      await page.getByRole("option", { name, exact: true }).click();
      for (const segment of segmentNames)
        await page.getByRole("spinbutton", { name: new RegExp(`^${segment},`, "i") }).waitFor();
      assert.equal(
        await page.getByRole("spinbutton", { name: /^second,/i }).count(),
        name === "Second" ? 1 : 0,
      );
      const date = await page.locator('input[hidden][name="granularity-date"]').inputValue();
      assert(date.startsWith("2025-02-03"));
      if (name !== "Day")
        assert(date.includes("[America/Los_Angeles]"), "zoned value retains timezone");
    }
    await page.getByRole("button", { name: "Granularity information" }).hover();
    await page.getByRole("tooltip").waitFor();
    await page.keyboard.press("Escape");

    await mount("date-field", "WithValidation", theme);
    await fillDate("2000-01-03");
    await page.getByText("Date must be today or in the future", { exact: true }).waitFor();
    assert.equal(
      await page.getByRole("spinbutton", { name: /^year,/i }).getAttribute("aria-invalid"),
      "true",
    );
    await fillDate("2090-07-12");
    await page.getByText("Enter a date from today onwards", { exact: true }).waitFor();
    assert.notEqual(
      await page.getByRole("spinbutton", { name: /^year,/i }).getAttribute("aria-invalid"),
      "true",
    );
    await mount("time-field", "WithValidation", theme, "en-GB");
    await fillTime(8, 30);
    await page.getByText("Time must be between 9:00 AM and 5:00 PM", { exact: true }).waitFor();
    await fillTime(10, 30);
    await page.getByText("Enter a time between 9:00 AM and 5:00 PM", { exact: true }).waitFor();

    await mount("date-field", "FormExample", theme);
    assert.equal(
      await page.getByRole("button", { name: "Submit", exact: true }).isDisabled(),
      true,
    );
    await fillDate("2090-07-12");
    await submitAndReset({ date: "2090-07-12" });
    await mount("time-field", "FormExample", theme, "en-GB");
    await fillTime(8, 30);
    assert.equal(
      await page.getByRole("button", { name: "Submit", exact: true }).isDisabled(),
      true,
    );
    await fillTime(10, 30);
    await submitAndReset({ time: "10:30:00" });

    for (const family of ["date-picker", "date-range-picker"]) {
      await mount(family, "Controlled", theme);
      const before = await page.getByText(/^Current value:/).textContent();
      const dialog = await openPicker(family);
      const available = dialog.locator(
        '[data-slot="calendar-cell"]:not([data-outside-month]),[data-slot="range-calendar-cell"]:not([data-outside-month])',
      );
      const selected = await available.evaluateAll((nodes) =>
        nodes.findIndex((node) => node.getAttribute("data-selected") === "true"),
      );
      await available
        .nth(selected + 1 < (await available.count()) ? selected + 1 : selected - 1)
        .click();
      if (family === "date-range-picker") {
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
      }
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.notEqual(await page.getByText(/^Current value:/).textContent(), before);

      await mount(family, "WithValidation", theme);
      const input =
        family === "date-range-picker"
          ? page.locator('[data-slot="date-input-group-input"]').first()
          : page;
      await fillDate("2000-01-03", input);
      if (family === "date-range-picker")
        await fillDate("2000-01-05", page.locator('[data-slot="date-input-group-input"]').nth(1));
      await page.locator('[data-slot="field-error"]').waitFor();
      assert.equal(await page.getByRole("spinbutton").first().getAttribute("aria-invalid"), "true");

      await mount(family, "FormExample", theme);
      const calendarDialog = await openPicker(family);
      const todayCell = calendarDialog.locator('[data-today="true"]');
      await todayCell.click();
      if (family === "date-range-picker") {
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
      }
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      const data = await formData();
      assert.deepEqual(
        Object.keys(data).sort(),
        family === "date-picker" ? ["appointmentDate"] : ["tripEndDate", "tripStartDate"],
      );
      assert(Object.values(data).every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)));
      if (family === "date-range-picker") assert(data.tripEndDate > data.tripStartDate);
      await submitAndReset(data);

      await mount(family, "Default", theme);
      const yearDialog = await openPicker(family);
      const yearTrigger = yearDialog.getByRole("button", { name: /year selector/i });
      await yearTrigger.click();
      const selectedYear = yearDialog.getByRole("button", { name: /^\d{4}$/, pressed: true });
      assert.equal(await selectedYear.count(), 1);
      await page.waitForFunction(
        () => document.activeElement?.getAttribute("aria-pressed") === "true",
      );
      const yearBefore = await yearTrigger.textContent();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");
      assert.notEqual(await yearTrigger.textContent(), yearBefore);
      await page.keyboard.press("Escape");
    }
  }
  passed(
    "both themes: controlled set/clear and date keyboard changes; four granularity formats and zoned serialization; tooltip; invalid-to-valid constraints; genuine native FormData; pending activation guard/focus; source1200/1500ms request reset; controlled calendar selection; range endpoints; year selection",
  );

  await mount("date-field", "Granularity", "light", "en-GB");
  const day = page.getByRole("spinbutton", { name: /^day,/i });
  const month = page.getByRole("spinbutton", { name: /^month,/i });
  assert(
    (await day.boundingBox()).x < (await month.boundingBox()).x,
    `British day/month order: ${await page.locator('[data-slot="date-input-group-input"]').textContent()} at ${page.url()}`,
  );
  await day.click();
  await page.keyboard.press("ArrowUp");
  assert.equal(await day.getAttribute("aria-valuenow"), "4");
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page
      .getByRole("spinbutton", { name: /^month,/i })
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await mount("time-field", "Controlled", "light", "en-GB");
  await page.getByRole("button", { name: "Set now", exact: true }).click();
  assert.equal(await page.getByRole("spinbutton", { name: /^AM\/PM/i }).count(), 0);
  passed(
    "explicit en-GB date segment order, arrow editing/traversal, locale 24-hour time without AM/PM",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const family of ["date-picker", "date-range-picker"]) {
    await mount(family, "Default", "dark");
    const dialog = await openPicker(family);
    const duration = await page
      .locator(`[data-slot="${family}-popover"]`)
      .evaluate((node) => getComputedStyle(node).animationDuration);
    assert(duration.split(",").every((time) => Number.parseFloat(time) === 0));
    report.workflows.push(
      `${family}: 390px dark reduced-motion mount, click opening and calendar bounds; computed keyframe duration ${duration}`,
    );
    await snapshot(`${family}-mobile-reduced-motion`);
    assert.equal(await dialog.isVisible(), true);
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 1100, height: 900 });
  await mount("date-range-picker", "Default", "dark", "ar-EG");
  assert.equal(
    await page
      .locator('[data-slot="date-range-picker"]')
      .evaluate((node) => getComputedStyle(node).direction),
    "rtl",
  );
  await openPicker("date-range-picker");
  report.workflows.push(
    `Arabic RTL popup calendar computed direction: ${await page.locator('[data-slot="range-calendar"]').evaluate((node) => getComputedStyle(node).direction)}`,
  );
  await snapshot("date-range-picker-ar-EG");
  await page.keyboard.press("Escape");
  passed(
    "scoped mobile390px/reduced-motion opening and Arabic RTL range-picker mount/opening, not a complete responsive/RTL parity audit",
  );
  report.limits = [
    "No side-by-side upstream browser visual diff; source geometry is translated but pixel parity is not certified.",
    "Mobile only390px dark default pickers; FullWidth source400px intentionally remains400px and is not claimed mobile-safe.",
    "RTL only ar-EG dark default range-picker opening, not all40 stories or keyboard RTL traversal.",
    "Reduced-motion only dark default picker opening/bounds and recorded transition; no exhaustive motion audit.",
    "Chromium desktop keyboard/pointer only; no native mobile browser, screen-reader, cross-browser, timezone matrix or WCAG AA certification.",
  ];
  assert.deepEqual(errors, [], "No uncaught production iframe errors");
  if (artifacts)
    await writeFile(
      resolve(artifacts, "date-time-story-proof.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
  console.log(
    "PASS exact40, 80 active themed production mounts, scoped date/time workflows, zero uncaught browser errors",
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
