import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { createExamplePlan } from "./example-proof-plan.mjs";

const require = createRequire(import.meta.url);
const { values } = parseArgs({
  options: {
    base: {
      type: "string",
      default: process.env["LENSO_DOCS_TEST_URL"] ?? "http://127.0.0.1:3000",
    },
    locale: { type: "string" },
    families: { type: "string", default: "" },
    partial: { type: "boolean", default: false },
    screenshots: { type: "boolean", default: false },
    output: { type: "string", default: "test-results/docs-examples" },
  },
});
const source = JSON.parse(
  await readFile(new URL("../content/source-index.json", import.meta.url), "utf8"),
);
const en = JSON.parse(
  await readFile(new URL("../src/demos/live-manifest.json", import.meta.url), "utf8"),
);
// generated.ts registers EN only; localization output is not runtime registration.
const manifests = { en };
const locales = values.locale ? [values.locale] : ["en", "cn"];
assert.ok(
  locales.every((locale) => locale === "en" || locale === "cn"),
  "Unknown locale",
);
const families = values.families.split(",").filter(Boolean);
const plans = locales.map((locale) => createExamplePlan(source, manifests, { locale, families }));
const report = {
  completeRequestedScope: !values.partial && !families.length && !values.locale,
  missing: plans.flatMap((plan) => plan.missing),
  cases: [],
  failures: [],
};
if (report.missing.length && !values.partial)
  throw new Error(
    `${report.missing.length} source references are not runnable in the requested locale/scope. Use --partial only for explicitly partial development checks.`,
  );

const modes = [
  { theme: "light", width: 1440, height: 900, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "dark", width: 1440, height: 900, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "light", width: 390, height: 844, direction: "ltr", reducedMotion: "no-preference" },
  { theme: "dark", width: 390, height: 844, direction: "rtl", reducedMotion: "reduce" },
];
await mkdir(values.output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const plan of plans) {
    for (const mode of modes) {
      const context = await browser.newContext({
        viewport: { width: mode.width, height: mode.height },
        colorScheme: mode.theme,
        reducedMotion: mode.reducedMotion,
      });
      await context.addInitScript(({ theme, direction }) => {
        localStorage.setItem("theme", theme);
        const observer = new MutationObserver(() => {
          if (document.documentElement) document.documentElement.dir = direction;
        });
        observer.observe(document, { childList: true });
      }, mode);
      const page = await context.newPage();
      let errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      try {
        for (const placement of plan.pages) {
          errors = [];
          try {
            await page.goto(`${values.base}/${plan.locale}/docs/${placement.slug}`, {
              waitUntil: "networkidle",
            });
            for (const example of placement.cases) {
              const region = page
                .locator(`[data-example-name=${JSON.stringify(example.name)}]`)
                .first();
              const mounted = region.locator(
                `[data-example-mounted=${JSON.stringify(example.file)}]`,
              );
              await mounted.waitFor({ state: "attached" });
              const scene = region.locator("[data-example-scene]");
              const geometry = await scene.boundingBox();
              assert.ok(
                geometry && geometry.width > 0 && geometry.height > 0,
                `${example.name} has no measurable scene`,
              );
              assert.ok(
                await scene.evaluate(
                  (element) =>
                    element.textContent.trim().length > 0 ||
                    [...element.children].some((child) => {
                      const bounds = child.getBoundingClientRect();
                      return (
                        getComputedStyle(child).display !== "none" &&
                        bounds.width > 0 &&
                        bounds.height > 0
                      );
                    }),
                ),
                `${example.name} rendered an empty scene`,
              );
              const record = {
                locale: plan.locale,
                name: example.name,
                file: example.file,
                ...mode,
                geometry,
              };
              if (values.screenshots) {
                const filename = `${plan.locale}-${mode.theme}-${mode.width}-${example.name}.png`;
                await scene.screenshot({
                  path: path.join(values.output, filename),
                  animations: "disabled",
                });
                record.screenshot = filename;
              }
              report.cases.push(record);
            }
            assert.deepEqual(errors, [], "Example page emitted client errors");
            assert.ok(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              "Example page overflows the viewport",
            );
            await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
            const violations = await page.evaluate(async () => {
              const result = await window.axe.run(document, {
                runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
                rules: { "color-contrast": { enabled: false } },
              });
              return result.violations.map((violation) => ({
                id: violation.id,
                nodes: violation.nodes.map((node) => ({
                  target: node.target,
                  summary: node.failureSummary,
                })),
              }));
            });
            assert.deepEqual(violations, [], "Example page accessibility semantics");
          } catch (error) {
            report.failures.push({
              locale: plan.locale,
              slug: placement.slug,
              ...mode,
              error: String(error),
              clientErrors: errors,
            });
          }
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
console.log(
  `${report.cases.length} example mounts checked; ${report.missing.length} unimplemented references; ${report.failures.length} failures. Report: ${path.join(values.output, "report.json")}`,
);
assert.equal(
  report.failures.length,
  0,
  "Example rendering or semantic failures; inspect the persisted report",
);
