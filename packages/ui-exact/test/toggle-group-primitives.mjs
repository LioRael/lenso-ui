import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, loadCohort, fileHash } from "./cohort-server.ts";
import { checkToggle } from "./toggle.mjs";
const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_BEFORE_DIST || !process.env.EXACT_AFTER_DIST)
  throw new Error("Set EXACT_BEFORE_DIST and EXACT_AFTER_DIST to isolated compiled consumers");
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/toggle-group-primitives"),
);
process.env.LENSO_EXACT_TEST_ARTIFACTS = artifacts;
await Bun.write(path.join(artifacts, ".keep"), "");
const cohorts = [
  serveCohort(process.env.EXACT_BEFORE_DIST),
  serveCohort(process.env.EXACT_AFTER_DIST),
];
const results = [];
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 820, height: 900 } });
      const errors = [],
        records = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      for (const [index, cohort] of cohorts.entries()) {
        const captures = [];
        for (const width of [390, 820])
          for (const theme of ["light", "dark"])
            for (const detached of [false, true]) {
              await page.setViewportSize({ width, height: 900 });
              await page.emulateMedia({ reducedMotion: "reduce" });
              const network = await loadCohort(page, cohort);
              await page.waitForFunction(
                () => document.getElementById("format-italic")?.getAttribute("tabindex") === "0",
              );
              if (theme === "dark") await page.getByTestId("theme").click();
              if (detached) await page.getByTestId("toggle-detached").click();
              await page.getByTestId("format-bold").click();
              await page.mouse.move(0, 0);
              await page.getByTestId("format-bold").evaluate((n) => n.blur());
              const group = page.getByTestId("formatting");
              await group.scrollIntoViewIfNeeded();
              await page.evaluate(async () => {
                await document.fonts.ready;
                await Promise.all(
                  document
                    .getElementById("formatting")
                    .getAnimations({ subtree: true })
                    .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
                    .map((a) => a.finished.catch(() => {})),
                );
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
              });
              const snapshot = await group.evaluate((root) =>
                [root, ...root.querySelectorAll(":scope > button")].map((n) => {
                  const s = getComputedStyle(n),
                    r = n.getBoundingClientRect();
                  return {
                    tag: n.tagName,
                    id: n.id,
                    role: n.getAttribute("role"),
                    pressed: n.getAttribute("aria-pressed"),
                    disabled: n.disabled ?? null,
                    tabindex: n.tabIndex,
                    children: n.children.length,
                    width: r.width,
                    height: r.height,
                    color: s.color,
                    background: s.backgroundColor,
                    padding: s.padding,
                    border: s.border,
                    gap: s.gap,
                  };
                }),
              );
              const file = path.join(
                artifacts,
                `${engine}-${index}-${width}-${theme}-${detached}.png`,
              );
              await group.screenshot({ path: file });
              captures.push({
                width,
                theme,
                detached,
                network,
                snapshot,
                file,
                sha256: await fileHash(file),
              });
            }
        records.push(captures);
      }
      for (let i = 0; i < records[0].length; i++) {
        assert.deepEqual(
          records[1][i].snapshot,
          records[0][i].snapshot,
          `${engine} native semantics and geometry`,
        );
        assert.equal(records[1][i].sha256, records[0][i].sha256, `${engine} pixels`);
      }
      await page.setViewportSize({ width: 820, height: 900 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await loadCohort(page, cohorts[1]);
      await page.waitForFunction(
        () => document.getElementById("format-italic")?.getAttribute("tabindex") === "0",
      );
      await checkToggle(page, engine);
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        records,
        behavior: "existing Toggle suite passed",
        errors,
      });
      console.log(engine, "paired appearance and Toggle behavior passed");
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify({ completedAt: new Date().toISOString(), results }, null, 2) + "\n",
  );
} finally {
  for (const cohort of cohorts) cohort.stop();
}
