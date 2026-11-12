import assert from "node:assert/strict";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../..");
const out = path.resolve(process.argv[2] ?? path.join(root, ".cache/local-activation/complete"));
const output = path.resolve(
  process.argv[3] ?? path.join(root, ".cache/local-activation/navigation-profile.json"),
);
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const responses = new Map();
const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  async fetch(request) {
    const key = new URL(request.url).pathname;
    if (!responses.has(key)) {
      const response = await staticResponse(request, out);
      const raw = new Uint8Array(await response.arrayBuffer());
      const headers = new Headers(response.headers);
      const compress = /^(text\/|application\/(javascript|json))/.test(
        headers.get("content-type") ?? "",
      );
      if (compress) headers.set("content-encoding", "gzip");
      headers.set("cache-control", "no-store");
      headers.delete("content-length");
      responses.set(key, {
        body: compress ? gzipSync(raw) : raw,
        headers,
        status: response.status,
      });
    }
    return new Response(responses.get(key).body, responses.get(key));
  },
});
const browser = await chromium.launch();
const samples = [];
try {
  for (let run = 0; run < Number(process.env.PERF_RUNS ?? 3); run++) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
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
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() => {
        const events = [];
        const mark = (name, detail) => events.push({ name, time: performance.now(), detail });
        globalThis.navigationProfile = events;
        const exact = (globalThis.exact = {});
        for (const name of ["state", "activationPhase", "rootInitializations", "resourceProbe"]) {
          let value;
          Object.defineProperty(exact, name, {
            configurable: true,
            enumerable: true,
            get: () => value,
            set(next) {
              value = next;
              mark(name, typeof next === "string" || typeof next === "number" ? next : undefined);
              if (name !== "resourceProbe") return;
              const data = next.data;
              let answer = data.answer;
              Object.defineProperty(data, "answer", {
                configurable: true,
                get: () => answer,
                set(fn) {
                  answer = function (name, args, ...rest) {
                    mark("data-start", { name, args });
                    const reply = fn.call(this, name, args, ...rest);
                    if (reply?.promise)
                      reply.promise.then(
                        () => mark("data-ready", { name, args }),
                        () => mark("data-failed", { name, args }),
                      );
                    else mark("data-ready", { name, args });
                    return reply;
                  };
                },
              });
            },
          });
        }
        document.addEventListener(
          "click",
          (e) => {
            if (e.target.closest?.('a[href="/guide-001"]')) mark("intent");
          },
          true,
        );
        new MutationObserver(() => {
          if (
            location.pathname !== "/guide-001" ||
            document.querySelector("main h1")?.textContent !== "Guide 001"
          )
            return;
          if (
            !document
              .querySelector('main [data-docs-part="code"]')
              ?.textContent.includes('const route = "/guide-001";')
          )
            return;
          if (globalThis.navigationPaintScheduled) return;
          globalThis.navigationPaintScheduled = true;
          mark("dom-ready");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              mark("paint-observed");
              globalThis.navigationPainted = true;
            }),
          );
        }).observe(document, { subtree: true, childList: true, characterData: true });
      });
      await page.goto(server.url.href, { waitUntil: "load" });
      await page.getByRole("heading", { name: "Guide 000", exact: true }).waitFor();
      await page.waitForFunction(
        () => performance.getEntriesByName("first-contentful-paint").length > 0,
      );
      await page.evaluate(() =>
        navigationProfile.push({ name: "driver-start", time: performance.now() }),
      );
      await page.locator('[data-docs-part="navigation"] a[href="/guide-001"]').first().click();
      await page.waitForFunction(() => globalThis.navigationPainted === true);
      await page.waitForLoadState("networkidle");
      assert.deepEqual(errors, []);
      const sample = await page.evaluate(() => ({
        events: navigationProfile,
        preparation: globalThis.exact?.navigationPreparation,
        resources: performance.getEntriesByType("resource").map((e) => ({
          name: new URL(e.name).pathname,
          start: e.startTime,
          request: e.requestStart,
          response: e.responseStart,
          end: e.responseEnd,
          bytes: e.encodedBodySize,
          initiator: e.initiatorType,
        })),
        documents: performance.getEntriesByType("navigation").length,
      }));
      samples.push(sample);
      const intent = sample.events.find((e) => e.name === "intent").time;
      console.log(
        JSON.stringify({
          run: run + 1,
          events: sample.events
            .filter((e) => e.time >= intent)
            .map((e) => ({ ...e, time: +(e.time - intent).toFixed(1) })),
          resources: sample.resources
            .filter((e) => e.end >= intent)
            .map((e) => ({
              ...e,
              start: +(e.start - intent).toFixed(1),
              request: +(e.request - intent).toFixed(1),
              response: +(e.response - intent).toFixed(1),
              end: +(e.end - intent).toFixed(1),
            })),
        }),
      );
    } finally {
      await context.close();
    }
  }
  await Bun.write(
    output,
    JSON.stringify(
      { out, conditions: { latency: 80, download: 200000, cpu: 4 }, samples },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
  server.stop(true);
}
if (process.env.NAV_EXPECT_OVERLAP === "1")
  for (const sample of samples) {
    const rootStart = sample.events.find((e) => e.name === "rootInitializations").time;
    const ready = sample.events.find(
      (e) =>
        e.name === "data-ready" &&
        e.detail?.name === "docsReadPage" &&
        e.detail.args[0] === "/guide-001",
    );
    assert.ok(ready, "Target reply must use the native data resource");
    const body = sample.resources.find((e) => /\/body-1-/.test(e.name));
    assert.equal(
      sample.resources.filter((e) => /\/body-1-/.test(e.name)).length,
      1,
      "Projection and native resource must share one target request",
    );
    assert.ok(
      !sample.resources.some((e) => /\/scope-\d+-|local-view-/.test(e.name)),
      "First navigation must not load the search index or full renderer",
    );
    assert.ok(
      sample.preparation === "owner-ready" || (body && body.start < rootStart),
      "Target body must begin loading before the resource owner starts, rather than behind root boot",
    );
  }
