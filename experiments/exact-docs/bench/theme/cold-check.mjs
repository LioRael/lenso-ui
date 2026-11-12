import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../.."),
  manifest = await Bun.file(path.join(root, ".cache/theme-performance/build.json")).json();
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const receipts = [];
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    for (const variant of ["exactHeadless", "exactTheme"]) {
      const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        fetch: (r) => staticResponse(r, manifest.outputs[variant]),
      });
      try {
        const page = await browser.newPage({
          viewport: { width: 1280, height: 900 },
          reducedMotion: "reduce",
        });
        const errors = [],
          documents = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        page.on("request", (r) => {
          if (r.resourceType() === "document") documents.push(r.url());
        });
        let release;
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        await page.route("**/app.js", async (route) => {
          await gate;
          await route.continue();
        });
        await page.goto(server.url.href, { waitUntil: "domcontentloaded" });
        const nav = page.getByRole("navigation", { name: "Documentation", exact: true });
        try {
          await nav.getByRole("link", { name: "Guide 001", exact: true }).click();
          await nav.getByRole("link", { name: "Guide 002", exact: true }).click();
          await page.getByTestId("comparison-counter").click();
          assert.equal(new URL(page.url()).pathname, "/");
        } finally {
          release();
        }
        await page.waitForURL("**/guide-002");
        await page.getByRole("heading", { name: "Guide 002", exact: true }).waitFor();
        assert.equal(await page.getByTestId("comparison-counter").textContent(), "Count: 1");
        await page.evaluate(() => {
          globalThis.coldRoot = exact.state;
          globalThis.coldSlots = exact.state[0].slice();
        });
        await page
          .getByRole("navigation", { name: "Documentation", exact: true })
          .getByRole("link", { name: "Guide 003", exact: true })
          .click();
        await page.waitForURL("**/guide-003");
        await page.getByRole("heading", { name: "Guide 003", exact: true }).waitFor();
        assert.equal(
          await page.evaluate(
            () =>
              exact.state === coldRoot && exact.state[0].every((slot, i) => slot === coldSlots[i]),
          ),
          true,
        );
        assert.equal(await page.getByTestId("comparison-counter").textContent(), "Count: 1");
        assert.equal(documents.length, 1);
        assert.deepEqual(errors, []);
        receipts.push({
          browser: name,
          variant,
          heldEntry: true,
          latestColdIntent: true,
          queuedCounterPreserved: true,
          oneDocument: true,
          sameRootSlots: true,
        });
        console.log(
          `${name} ${variant}: held-entry first navigation, latest intent, queued counter and same-root navigation passed`,
        );
        await page.close();
      } finally {
        server.stop(true);
      }
    }
  } finally {
    await browser.close();
  }
}
await Bun.write(
  path.join(root, ".cache/theme-performance/cold-verification.json"),
  JSON.stringify(receipts, null, 2) + "\n",
);
