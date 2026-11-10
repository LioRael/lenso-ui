import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { buildSite } from "../src/index.ts";
import { renderHtml } from "../src/renderers/html.ts";
import { staticResponse } from "../src/server.ts";

const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, ".cache/performance");
const fixture = path.join(cache, "docs");
const astro = path.join(root, "bench/astro");
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const runs = Number(process.env.PERF_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 10)
  throw new Error("PERF_RUNS must be from 1 to 10");
if (!(await Bun.file(path.join(astro, "node_modules/astro/bin/astro.mjs")).exists()))
  throw new Error("Install bench/astro dependencies from its lockfile first (see README)");
await rm(fixture, { recursive: true, force: true });
await mkdir(fixture, { recursive: true });
const pages = [];
for (let i = 0; i < 9; i++) {
  const paragraphs = Array.from(
    { length: 48 },
    (_, j) =>
      `Document ${i + 1}, paragraph ${j + 1}. The benchmarktarget setting controls how this documentation example is loaded and searched. Content and query semantics are shared by both implementations.`,
  );
  const markdown = `# Page ${i + 1}\n\n${paragraphs.join("\n\n")}\n\n## Configuration\n\n\`\`\`ts\nconst benchmarktarget = true;\n\`\`\`\n`;
  await Bun.write(path.join(fixture, `page-${i + 1}.md`), markdown);
  pages.push({
    path: i === 0 ? "/" : `/page-${i + 1}`,
    title: `Page ${i + 1}`,
    source: `page-${i + 1}.md`,
  });
}
await Bun.write(
  path.join(fixture, "docs.json"),
  JSON.stringify({ name: "Documentation benchmark", pages }),
);
const exactBuild = await buildSite(fixture);
const developmentBuild = await buildSite(fixture, {
  development: true,
  out: path.join(fixture, "dist-development"),
});
await Bun.write(
  path.join(astro, ".cache/pages.json"),
  JSON.stringify(
    exactBuild.site.documents.map((doc) => ({
      path: doc.path,
      title: doc.title,
      html: renderHtml(doc.body),
    })),
  ),
);
await Bun.write(
  path.join(astro, "src/search-data.ts"),
  `export const index=${JSON.stringify(exactBuild.site.documents.map((doc) => ({ title: doc.title, href: doc.path, text: doc.text.toLowerCase() })))};\n`,
);
const child = Bun.spawn(["node", path.join(astro, "node_modules/astro/bin/astro.mjs"), "build"], {
  cwd: astro,
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", CI: "true" },
  stdout: "inherit",
  stderr: "inherit",
});
if ((await child.exited) !== 0) throw new Error("Astro benchmark build failed");

function serve(directory, hints = true) {
  const cached = new Map();
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const key = new URL(request.url).pathname;
      if (!cached.has(key)) {
        const response = await staticResponse(request, directory);
        const headers = new Headers(response.headers);
        let body = Buffer.from(await response.arrayBuffer());
        if (!hints && headers.get("content-type")?.startsWith("text/html"))
          body = Buffer.from(body.toString().replace(/ data-docs-preload="[^"]*"/g, ""));
        const compress = /^(text\/|application\/(javascript|json))/.test(
          headers.get("content-type") ?? "",
        );
        if (compress) {
          headers.set("content-encoding", "gzip");
          headers.set("vary", "Accept-Encoding");
        }
        headers.delete("content-length");
        headers.set("cache-control", "no-store");
        cached.set(key, {
          body: compress ? gzipSync(body) : body,
          status: response.status,
          headers,
        });
      }
      const entry = cached.get(key);
      return new Response(entry.body, { status: entry.status, headers: entry.headers });
    },
  });
}
const servers = {
  ...(process.env.BUNDLE_BASELINE_DIR
    ? { previous: serve(path.resolve(process.env.BUNDLE_BASELINE_DIR)) }
    : {}),
  development: serve(developmentBuild.out, false),
  release: serve(exactBuild.out, false),
  exact: serve(exactBuild.out),
  astro: serve(path.join(astro, "dist")),
};

// Resolve from observed DOM changes and two animation frames, without locator polling.
async function searchPaint(page, selector, query, count) {
  await page.evaluate(
    ({ selector, count }) => {
      window.benchStarted = performance.now();
      window.benchPaint = new Promise((resolve) => {
        const observer = new MutationObserver(() => {
          if (document.querySelectorAll(`${selector} a`).length !== count) return;
          observer.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now())));
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    },
    { selector, count },
  );
  await page.getByRole("searchbox", { name: "Search documentation" }).fill(query);
  return page.evaluate(async () => {
    const painted = await window.benchPaint;
    const input = performance
      .getEntriesByName("bench-input")
      .find((entry) => entry.startTime >= window.benchStarted)?.startTime;
    return { started: window.benchStarted, input, painted };
  });
}
const browser = await chromium.launch();
const results = {};
try {
  for (const [name, server] of Object.entries(servers)) {
    const samples = [];
    for (let run = 0; run < runs; run++) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Performance.enable");
        await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
        await cdp.send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 80,
          downloadThroughput: 200000,
          uploadThroughput: 1000000,
        });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        let bytes = 0,
          scriptBytes = 0;
        const scripts = new Set();
        cdp.on("Network.responseReceived", (event) => {
          if (event.type === "Script") scripts.add(event.requestId);
        });
        cdp.on("Network.loadingFinished", (event) => {
          bytes += event.encodedDataLength;
          if (scripts.has(event.requestId)) scriptBytes += event.encodedDataLength;
        });
        await page.addInitScript(() => {
          window.benchTasks = [];
          new PerformanceObserver((list) =>
            window.benchTasks.push(
              ...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })),
            ),
          ).observe({ type: "longtask", buffered: true });
          document.addEventListener("input", () => performance.mark("bench-input"), true);
        });
        await page.goto(server.url.href, { waitUntil: "load" });
        await page.getByRole("heading", { name: "Page 1", exact: true }).waitFor();
        const fcp = await page.evaluate(
          () => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
        );
        const before = bytes,
          scriptsBefore = scriptBytes;
        const selector = name === "astro" ? "#results" : '[data-docs-part="search"]';
        const metricsBefore = Object.fromEntries(
          (await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
            name,
            value,
          ]),
        );
        const timing = await searchPaint(page, selector, "benchmarktarget", 9);
        const metricsPaint = Object.fromEntries(
          (await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
            name,
            value,
          ]),
        );
        await page.waitForLoadState("networkidle");
        const firstBytes = bytes - before;
        const trace = await page.evaluate(() => ({
          requests: performance
            .getEntriesByType("resource")
            .map(({ name, startTime, responseStart, responseEnd, encodedBodySize }) => ({
              name: new URL(name).pathname,
              startTime,
              responseStart,
              responseEnd,
              encodedBodySize,
            })),
          longtasks: window.benchTasks,
        }));
        const repeat = await searchPaint(page, selector, "document 2, paragraph", 1);
        assert.equal(
          await page.locator(selector).getByRole("link", { name: "Page 2", exact: true }).count(),
          1,
        );
        const sample = {
          firstScriptMs:
            Math.round((metricsPaint.ScriptDuration - metricsBefore.ScriptDuration) * 10000) / 10,
          firstTaskMs:
            Math.round((metricsPaint.TaskDuration - metricsBefore.TaskDuration) * 10000) / 10,
          fcpMs: fcp,
          bytesBeforeSearch: before,
          scriptBytesBeforeSearch: scriptsBefore,
          firstSearchMs: Math.round((timing.painted - timing.started) * 10) / 10,
          inputToPaintMs: Math.round((timing.painted - timing.input) * 10) / 10,
          repeatSearchMs: Math.round((repeat.painted - repeat.started) * 10) / 10,
          additionalBytesFirstSearch: firstBytes,
          additionalBytesRepeatSearch: bytes - before - firstBytes,
          timing,
          ...trace,
        };
        samples.push(sample);
        console.log(`${name} ${run + 1}/${runs}: ${JSON.stringify(sample)}`);
      } finally {
        await context.close();
      }
    }
    const median = (key) => {
      const values = samples
        .map((sample) => sample[key])
        .filter((value) => value !== null)
        .sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)] ?? null;
    };
    results[name] = {
      samples,
      median: Object.fromEntries(
        Object.keys(samples[0])
          .filter((key) => typeof samples[0][key] === "number")
          .map((key) => [key, median(key)]),
      ),
    };
  }
  const astroPackage = await Bun.file(path.join(astro, "node_modules/astro/package.json")).json();
  const report = {
    date: new Date().toISOString(),
    versions: { bun: Bun.version, astro: astroPackage.version, chromium: browser.version() },
    fixture: {
      pages: 9,
      paragraphsPerPage: 48,
      rendering: "Exact Contract vs semantic HTML rendered from the same document IR",
      gzip: true,
    },
    conditions: { runs, latencyMs: 80, downloadBytesPerSecond: 200000, cpuSlowdown: 4 },
    bundles: Object.fromEntries(
      await Promise.all(
        Object.keys(servers)
          .filter((name) => name !== "astro")
          .map(async (name) => {
            const directory =
              name === "previous"
                ? path.resolve(process.env.BUNDLE_BASELINE_DIR)
                : name === "development"
                  ? developmentBuild.out
                  : exactBuild.out;
            const source = Buffer.from(
              await Bun.file(path.join(directory, "app.js")).arrayBuffer(),
            );
            return [name, { rawBytes: source.length, gzipBytes: gzipSync(source).length }];
          }),
      ),
    ),
    results,
  };
  await Bun.write(path.join(cache, "results.json"), JSON.stringify(report, null, 2));
  const fields = [
    ["firstScriptMs", "Script execution during first search (ms)"],
    ["firstTaskMs", "Main-thread tasks during first search (ms)"],
    ["fcpMs", "First contentful paint (ms)"],
    ["bytesBeforeSearch", "Transfer before search (gzip bytes)"],
    ["scriptBytesBeforeSearch", "External scripts before search (gzip bytes)"],
    ["firstSearchMs", "First search painted (ms)"],
    ["inputToPaintMs", "Input event to search paint (ms)"],
    ["repeatSearchMs", "Repeat search painted (ms)"],
    ["additionalBytesRepeatSearch", "Additional repeat-search transfer (gzip bytes)"],
    ["additionalBytesFirstSearch", "Additional first-search transfer (gzip bytes)"],
  ];
  const names = Object.keys(servers);
  const headings = {
    previous: "Previous release, intent hints",
    development: "Exact development, no hints",
    release: "Exact release, no hints",
    exact: "Exact release, intent hints",
    astro: "Astro static fixture",
  };
  const header = `| Metric | ${names.map((name) => headings[name]).join(" | ")} |\n| --- | ${names.map(() => "---:").join(" | ")} |`;
  const bundleRows = Object.entries(report.bundles)
    .map(([name, size]) => `| ${headings[name]} | ${size.rawBytes} | ${size.gzipBytes} |`)
    .join("\n");
  const rows = fields
    .map(
      ([key, label]) =>
        `| ${label} | ${names.map((name) => results[name].median[key]).join(" | ")} |`,
    )
    .join("\n");
  await Bun.write(
    path.join(root, "PERFORMANCE.md"),
    `# Documentation loading comparison

Measured ${report.date}. Astro ${report.versions.astro}, Bun ${report.versions.bun}, Chromium ${report.versions.chromium}.

A local synthetic reading/search fixture: nine documents, 48 paragraphs each, built from the same content model and build-time syntax tokens. Both expose navigation and case-insensitive substring search with a lazily imported index. Both are served as gzip-compressed static files from Bun. Each sample starts in a fresh browser context, with cache disabled, 80 ms latency, 200,000 download bytes/second and 4x CPU slowdown. Values are medians of ${runs} runs.

${header}
${rows}

## Shared application bundle

| Build | app.js bytes | app.js gzip bytes |
| --- | ---: | ---: |
${bundleRows}

The generated renderer previously expanded the complete documentation layout once per route. It now has one layout call site with derived metadata for only the active page. Root resources, mutations, tasks and navigation still belong to the same application; page entries have not been separated. Ordinary consecutive plain-text paragraphs use a keyed data loop, sharing rendering instructions while preserving paragraph boundaries. Duplicate text ends a run to keep keys unique; rich content and embedded components retain their ordinary Exact rendering.

The previous-release column, when present, serves an unchanged saved pre-optimization output under the same browser conditions. It has the same production mode; its exact hint behavior depends on the saved version, including whether it predates the index-preload recovery fix. Bundle byte counts cover app.js; transfer rows include CSS, helper modules, protocol overhead and the query-triggered index. Script and task durations are CDP metric deltas from just before input to observed result paint, including small automation/measurement costs; tasks include rendering and are not CPU profiles of individual functions.

## What the original 1.32 seconds contained

The original benchmark used Exact's development bundle. A separate resource/long-task recording reproduced roughly 620 ms of application download, followed by 145–150 ms of full-host stylesheet loading, then about 95–100 ms for the tiny scope index. The input helper arrived another 150–165 ms after its late request. These intervals overlap in part and must not be added as independent costs. Main-thread long tasks around activation were about 60–90 ms; the application download and serial discovery dominated. The application transferred about 108 KB including resource-timing overhead, versus about 2 KB for the scope index. The original request and long-task recordings are preserved in [bench/baseline.json](bench/baseline.json).

The original readiness measurement used Playwright locator polling, which can overshoot actual rendering. This harness now observes result mutations and waits for two animation frames, and separately reports input-event-to-paint time. The new development baseline and release variants use the same corrected method; compare those columns for the effects of this change, rather than attributing the entire difference from the historical 1.32 seconds to optimization.

## Changes and tradeoffs

Static exports now use Exact's production mode; local preview and virtual-clock browser checks explicitly retain development mode. The two release columns use identical app code; the no-hints variant removes only the HTML hint configuration. On focus, pointer approach or pointer-down at an Exact control, fetch hints start the application, input helper and full host stylesheet together. Scope indexes use query-triggered native imports. Speculative index module preloads were removed after WebKit failure/reload checks showed they retained failed imports. Modulepreload fetches/parses modules but does not evaluate them: root state, resources and tasks still start at Exact activation. There is no idle prefetch, and reading without control intent downloads no application or search index. The scope index remains query-triggered. Unchanged headless host CSS is only fetched early, not applied early.

All variants are measured with immediate input after initial load; no reading delay is inserted to hide the work. Intent hints can consume bandwidth before an eventual click, so compare total bytes as well as latency. The shared application and its first activation remain real costs. First-search transfer includes pending activation requests until network idle; repeat search starts after that settling period, checks a different result set and reports additional transferred bytes.

## Limits and reproduction

The Astro fixture is a small semantic-HTML implementation, not Starlight or a feature-complete copy of Exact Docs. Exact retains its native host CSS, metadata bridge, root resource model and application navigation. The fixture uses browser elements and a small search listener. Typography is approximately aligned, but DOM and host defaults differ. This compares the stated reading/search workload, not general framework or native performance. Inline scripts count toward HTML transfer; the external-script row excludes them. Resource timing and CDP transfer totals have different overhead accounting. Long-task entries report only tasks over 50 ms, not all execution time. Local timings and background activity affect samples.

Reproduce with \`bun run test:performance\` after installing isolated \`bench/astro\` dependencies and setting \`EXACT_ROOT\` and \`PLAYWRIGHT_MODULE\` as described in README. Raw samples include request and long-task timelines at [.cache/performance/results.json](.cache/performance/results.json). Set \`BUNDLE_BASELINE_DIR\` to a saved pre-change build output to include it in the same run. For a diagnostic trace of the current build alone, run \`bun bench/profile.mjs\`; \`PROFILE_NO_HINTS=1\` removes the hints for comparison.
`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  for (const server of Object.values(servers)) await server.stop(true);
}
