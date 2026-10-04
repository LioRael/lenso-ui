import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { groupApiProperties } from "../src/lib/api-property-groups.ts";

const reference = JSON.parse(
  await readFile(new URL("../src/generated/api-reference.json", import.meta.url), "utf8"),
);
const { sections, inheritedGroups } = groupApiProperties(
  reference.families.autocomplete.parts,
  reference.properties,
);
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const evidence = path.resolve(
  process.env.LENSO_API_GROUP_EVIDENCE ?? "../../test-results/api-shared-properties",
);
await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();
const results = [];
const errors = [];
try {
  for (const locale of ["en", "cn"]) {
    for (const javaScriptEnabled of [false, true]) {
      const page = await browser.newPage({
        javaScriptEnabled,
        viewport: { width: locale === "en" ? 1440 : 390, height: 900 },
      });
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${base}/${locale}/docs/react/components/autocomplete`, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response.status(), 200);
      const api = page.locator('section[aria-labelledby="native-api-autocomplete"]');
      await api.waitFor();
      for (const section of sections) {
        const region = api.locator(
          `section[aria-labelledby="api-autocomplete-${section.part.name}"]`,
        );
        assert.equal(await region.count(), 1, "Every public part keeps its original anchor");
        const links = region.locator('a[href^="#api-autocomplete-inherited-"]');
        assert.equal(await links.count(), section.inherited ? 1 : 0);
        if (section.inherited) {
          assert.equal(
            await links.getAttribute("href"),
            `#api-autocomplete-inherited-${section.inherited.id}`,
          );
        }
      }
      const first = api.locator('a[href^="#api-autocomplete-inherited-"]').first();
      const href = await first.getAttribute("href");
      await first.focus();
      await page.keyboard.press("Enter");
      await page.waitForURL((url) => url.hash === href);
      const summary = api.locator(href);
      assert.equal(await summary.evaluate((node) => node.tagName), "SUMMARY");
      const initiallyOpen = await summary.evaluate((node) => node.parentElement.open);
      await summary.focus();
      await page.keyboard.press("Enter");
      assert.equal(await summary.evaluate((node) => node.parentElement.open), !initiallyOpen);
      await summary.focus();
      await page.keyboard.press("Enter");
      assert.equal(await summary.evaluate((node) => node.parentElement.open), initiallyOpen);
      for (const group of inheritedGroups) {
        const toggle = api.locator(`#api-autocomplete-inherited-${group.id}`);
        await toggle.focus();
        if (!(await toggle.evaluate((node) => node.parentElement.open)))
          await page.keyboard.press("Enter");
        const details = toggle.locator("..");
        assert.ok((await details.innerText()).includes(group.parts.join(", ")));
        const rows = await details
          .locator("tbody tr")
          .evaluateAll((nodes) =>
            nodes.map((row) => [row.cells[0].textContent, row.cells[1].textContent]),
          );
        assert.deepEqual(
          rows,
          group.rows.map((row) => [row.name, row.expandedType]),
          "Every shared row keeps its full native type",
        );
        await toggle.focus();
        await page.keyboard.press("Enter");
      }
      const inheritedCount = await api
        .locator('details:has(summary[id^="api-autocomplete-inherited-"]) tbody tr')
        .count();
      assert.equal(
        inheritedCount,
        inheritedGroups.reduce((sum, group) => sum + group.rows.length, 0),
      );
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({
        path: path.join(evidence, `${locale}-${javaScriptEnabled ? "js" : "no-js"}.png`),
      });
      results.push({ locale, javaScriptEnabled, groups: inheritedGroups.length, inheritedCount });
      await page.close();
    }
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(
    path.join(evidence, "results.json"),
    JSON.stringify({ results, errors }, null, 2),
  );
}
