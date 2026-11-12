import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      path.join(import.meta.dirname, "../.cache/acceptance/context-menu-bar-initial"),
  );
await Bun.write(path.join(artifacts, ".keep"), "");
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
      let release,
        blocked = 0;
      const gate = new Promise((r) => (release = r));
      await page.route("**/modules/index.js", async (route) => {
        blocked++;
        await gate;
        await route.continue();
      });
      try {
        await page.goto(server.url, { waitUntil: "domcontentloaded" });
        const root = page.getByTestId("context-bar"),
          popup = page.getByTestId("context-bar-popup");
        await root.waitFor({ state: "attached" });
        // Place the native popover explicitly: this fixture verifies styles, not pre-hatch point interaction.
        await root.evaluate((n) => {
          n.style.left = "24px";
          n.style.top = "40px";
          n.showPopover();
        });
        await page.waitForFunction(
          () =>
            getComputedStyle(document.getElementById("context-bar-popup")).borderRadius === "22px",
        );
        const geometry = await popup.evaluate((n) => {
          const r = n.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            radius: getComputedStyle(n).borderRadius,
            buttons: [...n.querySelectorAll('[role="menuitem"]')].map((n) => ({
              id: n.id,
              height: n.getBoundingClientRect().height,
              disabled: n.disabled,
            })),
          };
        });
        assert.equal(geometry.width, 250);
        assert.equal(geometry.height, 44);
        for (const item of geometry.buttons) assert.equal(item.height, 36);
        assert.equal(await root.getAttribute("data-lenso-ready"), null);
        assert.ok(blocked > 0);
        const file = path.join(artifacts, `${engine}-compact-blocked.png`);
        await popup.screenshot({ path: file });
        await root.evaluate((n) => {
          n.hidePopover();
          n.style.removeProperty("left");
          n.style.removeProperty("top");
        });
        release();
        await page.unrouteAll({ behavior: "wait" });
        await page.waitForFunction(
          () =>
            document.getElementById("context-bar").getAttribute("aria-orientation") ===
            "horizontal",
        );
        assert.deepEqual(errors, []);
        results.push({
          engine,
          version: browser.version(),
          geometry,
          blocked,
          file,
          sha256: await fileHash(file),
          errors,
        });
        console.log(engine, "compact initial shared recipes passed");
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
    JSON.stringify({ completedAt: new Date().toISOString(), results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
