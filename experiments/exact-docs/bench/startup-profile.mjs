import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { staticResponse } from "../src/server.ts";

const directory = path.resolve(
  process.argv[2] ?? path.join(import.meta.dirname, "../.cache/comparison/exact/dist"),
);
const action = process.env.PROFILE_ACTION ?? "search";
assert.ok(["search", "counter"].includes(action), "PROFILE_ACTION must be search or counter");
const cache = new Map();
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const key = new URL(request.url).pathname;
    if (!cache.has(key)) {
      const response = await staticResponse(request, directory);
      const headers = new Headers(response.headers);
      const raw = new Uint8Array(await response.arrayBuffer());
      const compress = /^(text\/|application\/(javascript|json))/.test(
        headers.get("content-type") ?? "",
      );
      if (compress) headers.set("content-encoding", "gzip");
      headers.set("cache-control", "no-store");
      headers.delete("content-length");
      cache.set(key, { body: compress ? gzipSync(raw) : raw, headers, status: response.status });
    }
    const entry = cache.get(key);
    return new Response(entry.body, entry);
  },
});
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 80,
    downloadThroughput: 200000,
    uploadThroughput: 1000000,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  const network = new Map();
  cdp.on("Network.requestWillBeSent", (e) =>
    network.set(e.requestId, {
      path: new URL(e.request.url).pathname,
      start: e.timestamp,
      initiator: e.initiator.type,
      priority: e.request.initialPriority,
    }),
  );
  cdp.on("Network.responseReceived", (e) =>
    Object.assign(network.get(e.requestId) ?? {}, { response: e.timestamp }),
  );
  cdp.on("Network.loadingFinished", (e) =>
    Object.assign(network.get(e.requestId) ?? {}, { end: e.timestamp, bytes: e.encodedDataLength }),
  );
  let rendered;
  const paint = new Promise((resolve) => {
    rendered = resolve;
  });
  await page.exposeBinding("__startupProfilePaint", (_source, event) => rendered(event));
  await page.addInitScript(
    ({ action }) => {
      const events = [];
      globalThis.__startupProfile = { events };
      for (const type of ["pointerover", "focusin", "pointerdown", "click", "input"])
        document.addEventListener(
          type,
          () => {
            events.push({ type, ms: performance.now() });
            if (events.length === 1)
              requestAnimationFrame(function check() {
                if (globalThis.exact?.state)
                  globalThis.__startupProfile.readyObservedMs = performance.now();
                else requestAnimationFrame(check);
              });
          },
          true,
        );
      let sent = false;
      new MutationObserver(() => {
        const ready =
          action === "counter"
            ? document.querySelector('[data-testid="comparison-counter"]')?.textContent ===
              "Count: 1"
            : document.querySelector('[data-docs-part="search"] a')?.getAttribute("href") === "/";
        if (!ready || sent) return;
        sent = true;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => window.__startupProfilePaint({ paintMs: performance.now() })),
        );
      }).observe(document, { childList: true, subtree: true, characterData: true });
    },
    { action },
  );
  await page.goto(server.url.href);
  await page.getByRole("heading", { name: "Guide 000", exact: true }).waitFor();
  assert.equal(await page.evaluate(() => Boolean(globalThis.exact?.state)), false);
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.start");
  const start = await page.evaluate(() => performance.now());
  if (action === "counter") await page.getByTestId("comparison-counter").click();
  else
    await page
      .getByRole("searchbox", { name: "Search documentation" })
      .fill("acceptance-target-000");
  const { paintMs } = await paint;
  const durationMs = paintMs - start;
  const { profile } = await cdp.send("Profiler.stop");
  await page.waitForLoadState("networkidle");
  if (action === "counter") {
    assert.equal(await page.getByTestId("comparison-counter").textContent(), "Count: 1");
    assert.equal(
      [...network.values()].some((request) => /\/scope-/.test(request.path)),
      false,
    );
  } else
    assert.deepEqual(
      await page
        .locator('[data-docs-part="search"] a')
        .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ["/"],
    );
  assert.deepEqual(errors, []);
  const first = Math.min(
    ...[...network.values()].filter((e) => e.path === "/app.js").map((e) => e.start),
  );
  const requests = [...network.values()].map((e) => ({
    ...e,
    start: Math.round((e.start - first) * 1000),
    response: Math.round((e.response - first) * 1000),
    end: Math.round((e.end - first) * 1000),
  }));
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const self = new Map();
  for (const [i, id] of profile.samples.entries())
    self.set(id, (self.get(id) ?? 0) + profile.timeDeltas[i]);
  const hot = [...self]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, us]) => ({
      name: nodes.get(id).callFrame.functionName,
      url: nodes.get(id).callFrame.url.replace(server.url.origin, ""),
      line: nodes.get(id).callFrame.lineNumber + 1,
      ms: Math.round(us / 100) / 10,
    }));
  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((e) => ({
      path: new URL(e.name).pathname,
      start: Math.round(e.startTime),
      end: Math.round(e.responseEnd),
      bytes: e.transferSize,
    })),
  );
  const timeline = await page.evaluate(() => globalThis.__startupProfile);
  const report = {
    directory,
    action,
    startMs: start,
    paintMs,
    durationMs: Math.round(durationMs),
    timeline,
    requests,
    resources,
    hot,
  };
  const out = path.resolve(
    process.argv[3] ?? path.join(import.meta.dirname, "../.cache/startup-profile"),
  );
  await Bun.write(path.join(out, "cpu.cpuprofile"), JSON.stringify(profile));
  await Bun.write(path.join(out, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  server.stop(true);
}
