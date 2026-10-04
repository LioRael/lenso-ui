import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const { values } = parseArgs({
  options: {
    base: { type: "string", default: process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000" },
    output: { type: "string", default: "test-results/chip-scroll" },
    baseline: { type: "string" },
  },
});
const baseline = values.baseline ? JSON.parse(await readFile(values.baseline, "utf8")) : null;
const modes = [
  { theme: "light", width: 1440, height: 900, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "dark", width: 1440, height: 900, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "light", width: 390, height: 844, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "dark", width: 390, height: 844, direction: "rtl", reducedMotion: "reduce" },
];
const placements = [
  { slug: "react/components/chip", name: "chip-variants" },
  { slug: "react/releases/v3-1-0", name: "release-chip-vibrant-palette" },
];
const report = { cases: [], failures: [] };
await mkdir(values.output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of ["en", "cn"]) {
    for (const mode of modes) {
      const context = await browser.newContext({
        viewport: { width: mode.width, height: mode.height },
        colorScheme: mode.theme,
        reducedMotion: mode.reducedMotion,
      });
      await context.addInitScript(({ theme, direction }) => {
        localStorage.setItem("theme", theme);
        new MutationObserver(() => {
          if (document.documentElement) document.documentElement.dir = direction;
        }).observe(document, { childList: true });
      }, mode);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      try {
        for (const placement of placements) {
          const record = { locale, ...mode, ...placement };
          const check = async (name, run) => {
            try {
              await run();
              record[name] = "passed";
            } catch (error) {
              record[name] = String(error);
              report.failures.push({
                locale,
                ...mode,
                ...placement,
                check: name,
                error: String(error),
              });
            }
          };
          await page.goto(`${values.base}/${locale}/docs/${placement.slug}`, {
            waitUntil: "networkidle",
          });
          const example = page.locator(`[data-example-name="${placement.name}"]`).first();
          await example.locator("[data-example-mounted]").waitFor({ state: "attached" });
          const scene = example.locator("[data-example-scene]");
          // The adapted matrix owns overflow, not either of the two preview wrappers.
          const scroller = scene.locator(":scope > div > div").first();
          record.geometry = await scroller.evaluate((element) => {
            const bounds = (node) => {
              const box = node.getBoundingClientRect();
              return { width: box.width, height: box.height };
            };
            return {
              owner: bounds(element),
              scene: bounds(element.closest("[data-example-scene]")),
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              overflowX: getComputedStyle(element).overflowX,
              chips: [...element.querySelectorAll("[data-slot=chip]")].map(bounds),
            };
          });
          await check("realOverflow", () => {
            assert.equal(record.geometry.overflowX, "auto");
            assert.ok(
              record.geometry.scrollWidth > record.geometry.clientWidth,
              "Matrix must really overflow",
            );
            assert.ok(record.geometry.chips.length > 0, "Compiled Chip content must be mounted");
          });
          if (baseline)
            await check("unchangedGeometry", () => {
              const before = baseline.cases.find(
                (item) =>
                  item.locale === locale &&
                  item.name === placement.name &&
                  item.theme === mode.theme &&
                  item.width === mode.width,
              );
              assert.ok(before, "Missing red geometry baseline");
              assert.deepEqual(
                record.geometry,
                before.geometry,
                "Focusability must not change compiled geometry",
              );
            });
          await check("tabReachability", async () => {
            const sourceButton = example.getByRole("button").first();
            await sourceButton.focus();
            await page.keyboard.press("Shift+Tab");
            assert.equal(
              await scroller.evaluate((node) => node === document.activeElement),
              true,
              "Shift+Tab from the source viewer must reach the actual matrix scroller",
            );
            await page.keyboard.press("Shift+Tab");
            await page.keyboard.press("Tab");
            assert.equal(
              await scroller.evaluate((node) => node === document.activeElement),
              true,
              "Forward Tab must also reach the actual matrix scroller",
            );
          });
          await check("visibleFocus", async () => {
            assert.equal(await scroller.evaluate((node) => node.matches(":focus-visible")), true);
            const focus = await scroller.evaluate((node) => {
              const css = getComputedStyle(node);
              return {
                style: css.outlineStyle,
                width: parseFloat(css.outlineWidth),
                offset: parseFloat(css.outlineOffset),
              };
            });
            assert.equal(focus.style, "solid");
            assert.ok(focus.width >= 2);
            assert.equal(
              focus.offset,
              -2,
              "Inset focus must remain visible inside overflow clipping",
            );
          });
          await check("nativeArrowScroll", async () => {
            const start = await scroller.evaluate((node) => node.scrollLeft);
            await page.keyboard.press(mode.direction === "rtl" ? "ArrowLeft" : "ArrowRight");
            await page.waitForFunction(
              ({ node, start }) => Math.abs(node.scrollLeft - start) > 0,
              { node: await scroller.elementHandle(), start },
              { timeout: 2000 },
            );
          });
          await check("axe", async () => {
            await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
            const violations = await page.evaluate(async () => {
              const result = await window.axe.run(document, {
                runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
                rules: { "color-contrast": { enabled: false } },
              });
              return result.violations.map(({ id, nodes }) => ({
                id,
                nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
              }));
            });
            assert.deepEqual(violations, []);
          });
          await check("clientErrors", () => assert.deepEqual(errors, []));
          report.cases.push(record);
          console.log(
            `${locale} ${mode.theme} ${mode.width} ${placement.name}: ${report.failures.length} cumulative failures`,
          );
        }
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(values.output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}
assert.equal(report.failures.length, 0, "Chip matrix keyboard or accessibility regression");
