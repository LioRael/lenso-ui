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
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      "packages/ui-exact/.cache/acceptance/navigation-bar-initial",
  );
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      let release,
        blocked = 0;
      const gate = new Promise((r) => (release = r));
      await page.route("**/modules/index.js", async (route) => {
        blocked++;
        await gate;
        await route.continue();
      });
      try {
        const response = page.waitForResponse(
          (r) => r.url() === new URL("app.js", server.url).href,
        );
        await page.goto(server.url, { waitUntil: "domcontentloaded" });
        const bytes = await (await response).body(),
          appSHA256 = createHash("sha256").update(bytes).digest("hex");
        assert.equal(appSHA256, await fileHash(path.join(server.dist, "app.js")));
        const root = page.getByTestId("navigation-demo"),
          scroll = page.getByTestId("navigation-demo-scroll");
        await root.waitFor({ state: "attached" });
        await scroll.scrollIntoViewIfNeeded();
        await page.waitForFunction(
          () => document.getElementById("navigation-demo")?.getBoundingClientRect().height === 60,
        );
        assert.ok(blocked > 0);
        assert.equal(await root.getAttribute("data-lenso-ready"), null);
        const geometry = await root.evaluate((n) => ({
          height: n.getBoundingClientRect().height,
          position: getComputedStyle(n).position,
          smallOpacity: getComputedStyle(document.getElementById("navigation-demo-title")).opacity,
          largeFont: getComputedStyle(document.getElementById("navigation-demo-large-title"))
            .fontSize,
          edgeVisibility: getComputedStyle(n.querySelector('[data-slot="scroll-edge"]')).visibility,
        }));
        assert.equal(geometry.position, "sticky");
        assert.equal(geometry.smallOpacity, "0");
        assert.equal(geometry.largeFont, "34px");
        assert.equal(geometry.edgeVisibility, "hidden");
        assert.equal(
          await page.getByRole("heading", { name: "Reading list", exact: true }).count(),
          1,
        );
        const file = path.join(artifacts, `${engine}-initial.png`);
        await scroll.screenshot({ path: file });
        release();
        await page.unrouteAll({ behavior: "wait" });
        await page.waitForFunction(() =>
          document.getElementById("navigation-demo")?.hasAttribute("data-navigation-ready"),
        );
        await page.getByTestId("navigation-demo-back").click();
        assert.equal(await page.getByTestId("navigation-bar-count").textContent(), "1");
        results.push({
          engine,
          version: browser.version(),
          appSHA256,
          geometry,
          blocked,
          file,
          sha256: await fileHash(file),
        });
        console.log(
          engine,
          "initial navigation geometry, title semantics and resumed activation passed",
        );
      } finally {
        release();
        await page.unrouteAll({ behavior: "wait" });
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
await Bun.write(
  path.join(artifacts, "acceptance.json"),
  JSON.stringify({ dist: server.dist, results }, null, 2) + "\n",
);
