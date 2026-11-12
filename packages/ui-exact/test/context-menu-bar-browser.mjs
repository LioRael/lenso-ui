import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
import { checkContextBar } from "./context-menu-bar.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      path.join(import.meta.dirname, "../.cache/acceptance/context-menu-bar"),
  );
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
      await page.emulateMedia({ reducedMotion: "no-preference" });
      const network = await loadContextCohort(page, server);
      await page.waitForFunction(
        () =>
          document.getElementById("context-bar")?.getAttribute("aria-orientation") === "horizontal",
      );
      try {
        const behavior = await checkContextBar(page),
          captures = [];
        for (const width of [390, 820])
          for (const theme of ["light", "dark"]) {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: "reduce" });
            if ((theme === "dark") !== Boolean(await page.locator('[data-theme="dark"]').count()))
              await page.getByTestId("theme").click();
            await page
              .getByTestId("context-bar-target")
              .click({ button: "right", position: { x: 20, y: 20 } });
            await page.waitForFunction(
              () =>
                document.getElementById("context-bar-copy") &&
                document.getElementById("context-bar").matches(":popover-open") &&
                !document.getElementById("context-bar-popup").hasAttribute("data-starting-style"),
            );
            for (const mode of ["compact", "full"]) {
              if (mode === "full") {
                await page.getByTestId("context-bar-expand").click();
                await page.getByTestId("context-bar-full-copy").waitFor();
              }
              const popup = page.getByTestId("context-bar-popup"),
                geometry = await popup.evaluate((n) => {
                  const r = n.getBoundingClientRect(),
                    s = getComputedStyle(n);
                  return {
                    width: r.width,
                    height: r.height,
                    radius: s.borderRadius,
                    padding: n.querySelector('[data-slot="menu-content"]').getBoundingClientRect()
                      .height,
                  };
                });
              assert.equal(geometry.width, 250);
              assert.equal(geometry.radius, mode === "compact" ? "22px" : "34px");
              if (mode === "compact") assert.equal(geometry.height, 44);
              const file = path.join(artifacts, `${engine}-${width}-${theme}-${mode}.png`);
              await popup.screenshot({ path: file });
              captures.push({ width, theme, mode, geometry, file, sha256: await fileHash(file) });
            }
            await page.keyboard.press("Escape");
          }
        assert.deepEqual(errors, []);
        results.push({ engine, version: browser.version(), network, behavior, captures, errors });
        console.log(engine, "context compact expansion and rendering passed");
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
    JSON.stringify({ completedAt: new Date().toISOString(), results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
