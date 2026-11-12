import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort } from "./cohort-server.ts";
import {
  checkAutocomplete,
  checkAutocompleteForm,
  checkAutocompleteTouch,
} from "./autocomplete.mjs";
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/autocomplete"),
);
process.env.LENSO_EXACT_TEST_ARTIFACTS = artifacts;
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 820, height: 900 } }),
        errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      const network = await loadCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("framework-auto-trigger")?.hasAttribute("data-lenso-ready"),
      );
      try {
        const behavior = await checkAutocomplete(page, engine),
          form = await checkAutocompleteForm(page, server.url),
          touch = await checkAutocompleteTouch(browser, server.url);
        assert.deepEqual(errors, []);
        results.push({ engine, network, behavior, form, touch, errors });
        console.log(engine, "autocomplete behavior, forms and native tap passed");
      } catch (error) {
        await page.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
        await Bun.write(
          path.join(artifacts, `${engine}-failure.json`),
          JSON.stringify({ error: String(error), network, errors }, null, 2),
        );
        throw error;
      }
      await page.close();
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify({ results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
