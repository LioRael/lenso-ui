import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort } from "./cohort-server.ts";
import { checkColorField, checkColorFieldForm, checkColorFieldTouch } from "./color-field.mjs";
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const dist = process.env.EXACT_TEST_DIST;
if (!dist) throw new Error("Set EXACT_TEST_DIST to the isolated compiled consumer output");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/color-fields"),
);
process.env.LENSO_EXACT_TEST_ARTIFACTS = artifacts;
await Bun.write(path.join(artifacts, ".keep"), "");
const server = serveCohort(dist),
  results = [];
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (process.env.TEST_BROWSER && process.env.TEST_BROWSER !== engine) continue;
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const network = await loadCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("accent-colors")?.hasAttribute("data-lenso-ready"),
      );
      const behavior = await checkColorField(page, engine);
      const form = await checkColorFieldForm(page, server.url);
      const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      });
      let touch;
      try {
        const p = await mobile.newPage();
        p.on("pageerror", (error) => errors.push(String(error)));
        p.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });
        await loadCohort(p, server);
        touch = await checkColorFieldTouch(p);
      } finally {
        await mobile.close();
      }
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        behavior,
        form,
        touch,
        errors,
      });
      await Bun.write(
        path.join(artifacts, "verification.json"),
        JSON.stringify({ results }, null, 2) + "\n",
      );
      console.log(engine, "color field behavior passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
