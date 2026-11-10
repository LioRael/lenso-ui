import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import { staticResponse } from "../src/server.ts";
const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, ".cache/performance/docs/dist");
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const cache = new Map();
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const key = new URL(request.url).pathname;
    if (!cache.has(key)) {
      const response = await staticResponse(request, directory),
        headers = new Headers(response.headers);
      headers.delete("content-length");
      headers.set("cache-control", "no-store");
      let raw = Buffer.from(await response.arrayBuffer());
      if (process.env.PROFILE_NO_HINTS && headers.get("content-type")?.startsWith("text/html"))
        raw = Buffer.from(raw.toString().replace(/ data-docs-preload="[^"]*"/g, ""));
      const compress = /^(text\/|application\/(javascript|json))/.test(
        headers.get("content-type") ?? "",
      );
      if (compress) headers.set("content-encoding", "gzip");
      cache.set(key, { body: compress ? gzipSync(raw) : raw, headers, status: response.status });
    }
    const response = cache.get(key);
    return new Response(response.body, response);
  },
});
const browser = await chromium.launch();
try {
  const samples = [];
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext();
    try {
      const page = await context.newPage(),
        cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 80,
        downloadThroughput: 200000,
        uploadThroughput: 1000000,
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.addInitScript(() => {
        window.tasks = [];
        new PerformanceObserver((list) =>
          window.tasks.push(
            ...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })),
          ),
        ).observe({ type: "longtask", buffered: true });
        document.addEventListener("input", () => performance.mark("search-input"), {
          once: true,
          capture: true,
        });
      });
      await page.goto(server.url.href, { waitUntil: "load" });
      const begin = await page.evaluate(() => performance.now());
      await page.getByRole("searchbox", { name: "Search documentation" }).fill("benchmarktarget");
      const results = page.locator('[data-docs-part="search"]').getByRole("link");
      await results.first().waitFor();
      assert.equal(await results.count(), 9);
      const sample = await page.evaluate(
        (begin) => ({
          begin,
          end: performance.now(),
          input: performance.getEntriesByName("search-input")[0]?.startTime,
          requests: performance
            .getEntriesByType("resource")
            .map(
              ({
                name,
                startTime,
                responseStart,
                responseEnd,
                transferSize,
                encodedBodySize,
                decodedBodySize,
              }) => ({
                name: new URL(name).pathname,
                startTime,
                responseStart,
                responseEnd,
                transferSize,
                encodedBodySize,
                decodedBodySize,
              }),
            ),
          longtasks: window.tasks,
        }),
        begin,
      );
      samples.push(sample);
      console.log(JSON.stringify(sample));
    } finally {
      await context.close();
    }
  }
  await Bun.write(
    path.join(
      root,
      `.cache/performance/profile${process.env.PROFILE_NO_HINTS ? "-release" : "-optimized"}.json`,
    ),
    JSON.stringify(samples, null, 2),
  );
} finally {
  await browser.close();
  await server.stop(true);
}
