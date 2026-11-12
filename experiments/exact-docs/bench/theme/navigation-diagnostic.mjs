import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import { staticResponse } from "../../src/server.ts";
const root = path.resolve(import.meta.dirname, "../.."),
  build = await Bun.file(path.join(root, ".cache/theme-performance/build.json")).json();
const require = createRequire(path.join(root, "../../apps/docs/package.json"));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch(),
  samples = [];
try {
  for (let run = 0; run < 3; run++)
    for (const name of run % 2
      ? ["matchedUi", "exactTheme", "exactHeadless"]
      : ["exactHeadless", "exactTheme", "matchedUi"]) {
      const responses = new Map();
      const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        async fetch(r) {
          const key = new URL(r.url).pathname;
          if (!responses.has(key)) {
            const response = await staticResponse(r, build.outputs[name]),
              raw = new Uint8Array(await response.arrayBuffer()),
              headers = new Headers(response.headers);
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
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage(),
          cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Performance.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 0,
          downloadThroughput: 10000000,
          uploadThroughput: 1000000,
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.addInitScript(() => {
          let first = false;
          new MutationObserver(() => {
            if (
              !first &&
              document.querySelector("main h1")?.textContent === "Guide 000" &&
              document
                .querySelector('main [data-docs-part="code"],main pre code')
                ?.textContent.includes('const route = "/";')
            ) {
              first = true;
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  globalThis.profileInitialBody = true;
                }),
              );
            }
          }).observe(document, { subtree: true, childList: true, characterData: true });
        });
        await page.goto(server.url.href);
        await page.waitForFunction(() => globalThis.profileInitialBody);
        for (const phase of ["first", "warm"]) {
          if (phase === "warm") await page.waitForLoadState("networkidle");
          const target = phase === "first" ? "/guide-001" : "/guide-002",
            title = phase === "first" ? "Guide 001" : "Guide 002";
          const before = Object.fromEntries(
            (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
          );
          const initial = await page.evaluate(
            ({ target, title }) => {
              globalThis.navigationProfileDone = 0;
              const added = new Set(),
                removed = new Set();
              const collect = (nodes, set) => {
                for (const node of nodes)
                  if (node.nodeType === 1) {
                    set.add(node);
                    for (const child of node.querySelectorAll("*")) set.add(child);
                  }
              };
              const header =
                document.querySelector('[data-docs-part="header"]') ??
                document.querySelector("header");
              const start = performance.now();
              const owner = globalThis.exact?.state;
              globalThis.navigationProfileState = { added, removed, header, start, owner };
              let done = false;
              const observer = new MutationObserver((records) => {
                for (const r of records) {
                  collect(r.addedNodes, added);
                  collect(r.removedNodes, removed);
                }
                if (
                  !done &&
                  location.pathname.replace(/\/$/, "") === target &&
                  document.querySelector("main h1")?.textContent === title &&
                  document
                    .querySelector('main [data-docs-part="code"],main pre code')
                    ?.textContent.includes(`const route = "${target}";`)
                ) {
                  done = true;
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                      observer.disconnect();
                      globalThis.navigationProfileDone = performance.now() - start;
                    }),
                  );
                }
              });
              observer.observe(document, { subtree: true, childList: true, characterData: true });
              return {
                rootAlreadyStarted: !!owner,
                adapterTransferred: performance
                  .getEntriesByType("resource")
                  .some((e) => e.name.includes("/lenso-ui/web.js") && e.responseEnd > 0),
                readyControls: document.querySelectorAll("[data-lenso-ready]").length,
              };
            },
            { target, title },
          );
          const nav =
            name === "matchedUi"
              ? page.locator("#nd-sidebar")
              : page.getByRole("navigation", { name: "Documentation", exact: true });
          await nav.getByRole("link", { name: title, exact: true }).click();
          await page.waitForFunction(() => globalThis.navigationProfileDone > 0);
          const after = Object.fromEntries(
            (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
          );
          const snapshot = await page.evaluate(() => {
            const p = navigationProfileState;
            return {
              elapsedMs: navigationProfileDone,
              addedElements: p.added.size,
              removedElements: p.removed.size,
              sameHeader:
                p.header ===
                (document.querySelector('[data-docs-part="header"]') ??
                  document.querySelector("header")),
              sameRoot: p.owner ? globalThis.exact?.state === p.owner : null,
              readyControls: document.querySelectorAll("[data-lenso-ready]").length,
            };
          });
          const sample = {
            name,
            phase,
            run: run + 1,
            initial,
            ...snapshot,
            scriptMs: (after.ScriptDuration - before.ScriptDuration) * 1000,
            styleMs: (after.RecalcStyleDuration - before.RecalcStyleDuration) * 1000,
            layoutMs: (after.LayoutDuration - before.LayoutDuration) * 1000,
            taskMs: (after.TaskDuration - before.TaskDuration) * 1000,
          };
          samples.push(sample);
          console.log(JSON.stringify(sample));
          if (initial.rootAlreadyStarted) assert.equal(snapshot.sameRoot, true);
        }
      } finally {
        await context.close();
        server.stop(true);
      }
    }
} finally {
  await browser.close();
}
await Bun.write(
  path.join(root, ".cache/theme-performance/navigation-diagnostic.json"),
  JSON.stringify(
    {
      conditions: {
        latencyMs: 0,
        downloadBytesPerSecond: 10000000,
        cpuSlowdown: 4,
        runs: 3,
        diagnostic: true,
      },
      samples,
    },
    null,
    2,
  ) + "\n",
);
