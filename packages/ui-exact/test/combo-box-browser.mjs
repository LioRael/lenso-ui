import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort } from "./cohort-server.ts";
import { checkComboBox, checkComboBoxForm, checkComboBoxTouch } from "./combo-box.mjs";
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const dist = process.env.EXACT_TEST_DIST;
if (!dist) throw new Error("Set EXACT_TEST_DIST to the isolated compiled consumer output");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/combo-boxes"),
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
      const behavior = await checkComboBox(page, engine).catch(async (error) => {
        await page.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
        const state = await page.evaluate(() => ({
          fields: [...document.querySelectorAll('[data-slot="combo-box-input"]')].map((n) => ({
            id: n.id,
            value: n.value,
            expanded: n.getAttribute("aria-expanded"),
            active: n.getAttribute("aria-activedescendant"),
          })),
          selected: [
            ...document.querySelectorAll('[data-slot="combo-box-item"][aria-selected="true"]'),
          ].map((n) => ({ id: n.id, value: n.dataset.lensoValue })),
        }));
        await Bun.write(
          path.join(artifacts, `${engine}-failure.json`),
          JSON.stringify({ error: String(error), state, network, errors }, null, 2),
        );
        throw error;
      });
      const form = await checkComboBoxForm(page, server.url);
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
        touch = await checkComboBoxTouch(p, engine).catch(async (error) => {
          await p.screenshot({ path: path.join(artifacts, `${engine}-touch-failure.png`) });
          const state = await p.evaluate(() => ({
            input: document.getElementById("framework-combo-input").value,
            open: document.getElementById("framework-combo-popup").matches(":popover-open"),
          }));
          await Bun.write(
            path.join(artifacts, `${engine}-touch-failure.json`),
            JSON.stringify({ error: String(error), state }, null, 2),
          );
          throw error;
        });
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
      console.log(engine, "combo box behavior passed");
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
