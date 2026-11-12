import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [];
const artifacts = path.resolve(
  process.env.LENSO_EXACT_TEST_ARTIFACTS ??
    path.join(import.meta.dirname, "../.cache/acceptance/refresh-control-initial"),
);
await Bun.write(path.join(artifacts, ".keep"), "");
// The existing navigation helper writes relative captures. Copy it into this cohort to retain earlier evidence.
const navigationFile = path.join(artifacts, "test/navigation.mjs");
await Bun.write(
  navigationFile,
  await Bun.file(new URL("./navigation.mjs", import.meta.url)).text(),
);
const { checkNavigation } = await import(navigationFile);
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
        errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      let release,
        blocked = 0;
      const gate = new Promise((r) => (release = r));
      await page.route("**/modules/index.js", async (route) => {
        blocked++;
        await gate;
        await route.continue();
      });
      const scriptURL = new URL("app.js", server.url).href,
        response = page.waitForResponse((r) => r.url() === scriptURL);
      try {
        await page.goto(server.url, { waitUntil: "domcontentloaded" });
        const script = await response;
        assert.equal(script.status(), 200);
        const scriptSHA256 = createHash("sha256")
          .update(await script.body())
          .digest("hex");
        assert.equal(scriptSHA256, await fileHash(path.join(server.dist, "app.js")));
        const root = page.getByTestId("refresh-sample"),
          states = [];
        await root.waitFor();
        for (const status of ["idle", "refreshing", "error"]) {
          if (status === "refreshing") {
            await page.getByTestId("refresh-manual").click();
            await page.getByTestId("refresh-sample-trigger").click();
          }
          if (status === "error") await page.getByTestId("refresh-error").click();
          await page.waitForFunction(
            (status) => document.getElementById("refresh-sample")?.dataset.lensoMode === status,
            status,
          );
          assert.equal(await root.getAttribute("data-lenso-ready"), null);
          const state = await root.evaluate((n) => {
            const indicator = n.querySelector('[data-slot="refresh-control-indicator"]'),
              content = n.querySelector('[data-slot="refresh-control-content"]'),
              trigger = n.querySelector('[data-slot="refresh-control-trigger"]'),
              error = n.querySelector('[data-slot="refresh-control-error"]'),
              spinner = n.querySelector('[data-slot="refresh-control-spinner"]');
            return {
              status: n.dataset.lensoMode,
              busy: n.getAttribute("aria-busy"),
              triggerHeight: trigger.getBoundingClientRect().height,
              offset: new DOMMatrixReadOnly(getComputedStyle(content).transform).m42,
              opacity: getComputedStyle(indicator).opacity,
              spinner: getComputedStyle(spinner).display,
              arrow: getComputedStyle(n.querySelector('[data-slot="refresh-control-progress"]'))
                .display,
              error: getComputedStyle(error).display,
              message: n.querySelector('[data-slot="refresh-control-message"]').textContent,
              live: n.querySelector('[data-slot="refresh-control-status"]').textContent,
            };
          });
          assert.equal(state.triggerHeight, 44);
          assert.equal(state.offset, status === "refreshing" ? 56 : 0);
          assert.equal(state.opacity, status === "refreshing" ? "1" : "0");
          assert.equal(state.spinner === "none", status !== "refreshing");
          assert.equal(state.arrow === "none", status === "refreshing");
          assert.equal(state.error === "none", status !== "error");
          assert.equal(
            state.live,
            status === "idle"
              ? ""
              : status === "refreshing"
                ? "Refreshing entries"
                : "Could not refresh. Try again.",
          );
          const file = path.join(artifacts, `${engine}-${status}-blocked.png`);
          await root.screenshot({ path: file });
          states.push({ ...state, file, sha256: await fileHash(file) });
        }
        assert.ok(blocked > 0);
        release();
        await page.unrouteAll({ behavior: "wait" });
        await page.waitForFunction(
          () => document.getElementById("refresh-sample")?.dataset.state === "error",
        );
        await page.setViewportSize({ width: 820, height: 900 });
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await checkNavigation(page, engine);
        assert.deepEqual(errors, []);
        results.push({
          engine,
          version: browser.version(),
          scriptURL,
          scriptSHA256,
          blocked,
          states,
          navigation: "existing navigation helper passed",
          errors,
        });
        console.log(engine, "blocked-hatch initial feedback and navigation regression passed");
      } finally {
        release();
        await page.unrouteAll({ behavior: "wait" });
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
        navigationHelperSHA256: await fileHash(navigationFile),
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  server.stop();
}
