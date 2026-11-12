import { loadContextCohort } from "./context-menu-cohort.mjs";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { checkContextMenu } from "./context-menu.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/context-menu"),
);
await Bun.write(path.join(artifacts, ".keep"), "");
// Isolate the existing Menu helper's relative capture paths within this receipt.
const regression = path.join(artifacts, "test/menu.mjs");
await Bun.write(regression, await Bun.file(new URL("./menu.mjs", import.meta.url)).text());
const { checkMenu } = await import(regression);
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
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(() =>
        document.getElementById("context-entry")?.hasAttribute("data-lenso-ready"),
      );
      try {
        const behavior = await checkContextMenu(page),
          captures = [];
        for (const width of [390, 820])
          for (const theme of ["light", "dark"])
            for (const rtl of [false, true]) {
              await page.setViewportSize({ width, height: 900 });
              await page.emulateMedia({ reducedMotion: "reduce" });
              if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
                await page.getByTestId("theme").click();
              if (
                ((await page
                  .getByTestId("context-actions")
                  .getAttribute("data-lenso-direction")) ===
                  "rtl") !==
                rtl
              )
                await page.getByTestId("context-direction").click();
              await page
                .getByTestId("context-entry")
                .click({ button: "right", position: { x: 20, y: 20 } });
              await page.waitForFunction(
                () =>
                  document
                    .getElementById("context-actions")
                    ?.hasAttribute("data-lenso-positioned") &&
                  !document
                    .getElementById("context-actions-popup")
                    ?.hasAttribute("data-starting-style"),
              );
              const geometry = await page.getByTestId("context-actions-popup").evaluate((n) => {
                const r = n.getBoundingClientRect();
                return {
                  x: r.x,
                  y: r.y,
                  width: r.width,
                  height: r.height,
                  view: innerWidth,
                  direction: getComputedStyle(n).direction,
                };
              });
              assert.equal(geometry.width, 250);
              assert.ok(geometry.x >= 7 && geometry.x + geometry.width <= geometry.view - 7);
              assert.equal(geometry.direction, rtl ? "rtl" : "ltr");
              const file = path.join(artifacts, `${engine}-${width}-${theme}-${rtl}.png`);
              await page.getByTestId("context-actions-popup").screenshot({ path: file });
              captures.push({ width, theme, rtl, geometry, file, sha256: await fileHash(file) });
              await page.keyboard.press("Escape");
            }
        await page.setViewportSize({ width: 820, height: 900 });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await loadContextCohort(page, server);
        await checkMenu(page, engine);
        assert.deepEqual(errors, []);
        results.push({
          engine,
          version: browser.version(),
          network,
          behavior,
          captures,
          ordinaryMenu: "passed",
          errors,
        });
        console.log(engine, "context point gestures, semantics and Menu regression passed");
      } catch (e) {
        await page.screenshot({ path: path.join(artifacts, `${engine}-failure.png`) });
        throw e;
      }
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify(
      {
        completedAt: new Date().toISOString(),
        regressionHelperSHA256: await fileHash(regression),
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  server.stop();
}
