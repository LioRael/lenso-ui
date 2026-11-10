import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { buildSite } from "../src/index.ts";
import { staticResponse } from "../src/server.ts";

const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, ".cache/scale");
const sizes = (process.env.SCALE_PAGES ?? "100,200,300").split(",").map(Number);
const runs = Number(process.env.PERF_RUNS ?? 3);
if (
  !sizes.every((size) => [100, 200, 300].includes(size)) ||
  !Number.isInteger(runs) ||
  runs < 1 ||
  runs > 10
)
  throw Error("SCALE_PAGES accepts 100,200,300; PERF_RUNS accepts 1..10");
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const results = [];
const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

async function fixture(size) {
  const directory = path.join(cache, String(size));
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  const pages = [],
    count = size / 4;
  for (const locale of ["en", "zh-CN"])
    for (const version of ["v2", "v1"])
      for (let topic = 0; topic < count; topic++) {
        const id = String(topic).padStart(3, "0"),
          prefix = `${locale === "en" ? "" : "/zh"}${version === "v2" ? "" : "/v1"}`;
        const url = `${prefix}${topic === 0 ? "" : `/guide-${id}`}` || "/";
        const title = `${locale === "en" ? "Guide" : "指南"} ${id}`;
        const sections = Array.from(
          { length: 4 },
          (_, section) =>
            `## Section ${section + 1}\n\n` +
            Array.from({ length: 6 }, (_, paragraph) => {
              const hash = createHash("sha256")
                .update(`${locale}/${version}/${topic}/${section}/${paragraph}`)
                .digest("hex")
                .slice(0, 16);
              return locale === "en"
                ? `The deployment service uses configuration ${hash} for guide ${id}. Validate the request, preserve the application session, and inspect the response before updating stored resources. Section ${section + 1}, paragraph ${paragraph + 1}.`
                : `部署服务使用配置 ${hash}。指南 ${id} 介绍请求验证、应用会话、响应检查和资源更新。第 ${section + 1} 节，第 ${paragraph + 1} 段。`;
            }).join("\n\n"),
        ).join("\n\n");
        const source = `${locale}/${version}/guide-${id}.md`;
        const next = String((topic + 1) % count).padStart(3, "0");
        const markdown = `---\ndescription: ${title} deployment and request lifecycle\ngroup: ${topic < Math.ceil(count / 2) ? "Guides" : "Reference"}\n---\n# ${title}\n\nacceptance-target-${id}\n\n${sections}\n\n## Details\n\nUse **validated input**, \`typed replies\`, and [the next guide](guide-${next}.md#details).\n\n\`\`\`ts\nconst route = "${url}";\nconst locale = "${locale}";\n\`\`\`\n`;
        await Bun.write(path.join(directory, source), markdown);
        pages.push({ id: `guide-${id}`, path: url, source, locale, version });
      }
  await Bun.write(
    path.join(directory, "docs.json"),
    JSON.stringify({
      name: "Exact Docs scale acceptance",
      origin: "https://docs.example.test",
      locales: [
        { id: "en", label: "English" },
        { id: "zh-CN", label: "中文" },
      ],
      versions: [
        { id: "v2", label: "v2" },
        { id: "v1", label: "v1", status: "archived" },
      ],
      pages,
    }),
  );
  return directory;
}
function serve(directory) {
  const cached = new Map();
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const key = new URL(request.url).pathname;
      if (!cached.has(key)) {
        const response = await staticResponse(request, directory),
          headers = new Headers(response.headers),
          raw = Buffer.from(await response.arrayBuffer());
        const compress = /^(text\/|application\/(javascript|json))/.test(
          headers.get("content-type") ?? "",
        );
        if (compress) headers.set("content-encoding", "gzip");
        headers.delete("content-length");
        headers.set("cache-control", "no-store");
        cached.set(key, { body: compress ? gzipSync(raw) : raw, headers, status: response.status });
      }
      const response = cached.get(key);
      return new Response(response.body, response);
    },
  });
}
const browser = await chromium.launch();
try {
  const scenarios = sizes.flatMap((size) => [
    ...(size === 300 && process.env.SCALE_BASELINE_DIR ? [{ size, baseline: true }] : []),
    { size, baseline: false },
  ]);
  for (const { size, baseline } of scenarios) {
    let out,
      buildMs = null;
    if (baseline) out = path.resolve(process.env.SCALE_BASELINE_DIR);
    else {
      const directory = await fixture(size),
        started = performance.now();
      out = (await buildSite(directory)).out;
      buildMs = Math.round(performance.now() - started);
    }
    const app = Buffer.from(await Bun.file(path.join(out, "app.js")).arrayBuffer());
    if (!baseline)
      assert.equal(app.includes(Buffer.from("The deployment service uses configuration")), false);
    const sitemap = await Bun.file(path.join(out, "sitemap.xml")).text();
    assert.equal((sitemap.match(/<url>/g) ?? []).length, size);
    const server = serve(out),
      samples = [];
    try {
      for (let run = 0; run < runs; run++) {
        const context = await browser.newContext();
        try {
          const page = await context.newPage(),
            cdp = await context.newCDPSession(page),
            errors = [],
            scopes = [],
            bodies = [];
          page.on("pageerror", (error) => errors.push(String(error)));
          page.on("request", (request) => {
            if (/\/scope-\d+-/.test(request.url())) scopes.push(request.url());
            if (/\/body-\d+-/.test(request.url())) bodies.push(request.url());
          });
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
          let bytes = 0;
          cdp.on("Network.loadingFinished", (event) => (bytes += event.encodedDataLength));
          await page.goto(server.url.href, { waitUntil: "load" });
          assert.equal(scopes.length, 0);
          assert.equal(
            await page
              .getByRole("navigation", { name: "Documentation", exact: true })
              .getByRole("link")
              .count(),
            size / 4,
          );
          await page.getByRole("heading", { name: "Guide 000", exact: true }).waitFor();
          await page.waitForFunction(
            () => performance.getEntriesByName("first-contentful-paint").length > 0,
          );
          const fcp = await page.evaluate(
            () => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null,
          );
          const before = bytes;
          const metricsBefore = Object.fromEntries(
            (await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
              name,
              value,
            ]),
          );
          await page.evaluate(() => {
            window.acceptanceStart = performance.now();
            window.acceptancePaint = new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                observer.disconnect();
                reject(Error("Search did not render within 60 seconds"));
              }, 60000);
              const observer = new MutationObserver(() => {
                if (!document.querySelector('[data-docs-part="search"] a')) return;
                observer.disconnect();
                clearTimeout(timeout);
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve(performance.now())),
                );
              });
              observer.observe(document.body, { childList: true, subtree: true });
            });
          });
          await page
            .getByRole("searchbox", { name: "Search documentation" })
            .fill("acceptance-target-000");
          const searchMs = await page.evaluate(async () =>
            Math.round((await window.acceptancePaint) - window.acceptanceStart),
          );
          const metricsAfter = Object.fromEntries(
            (await cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
              name,
              value,
            ]),
          );
          assert.equal(
            await page.locator('[data-docs-part="search"]').getByRole("link").count(),
            1,
          );
          await page.waitForLoadState("networkidle");
          if (!baseline) assert.equal(bodies.length, 0);
          const sample = {
            firstSearchBodyModules: bodies.length,
            fcpMs: fcp,
            searchMs,
            scriptMs:
              Math.round((metricsAfter.ScriptDuration - metricsBefore.ScriptDuration) * 10000) / 10,
            taskMs:
              Math.round((metricsAfter.TaskDuration - metricsBefore.TaskDuration) * 10000) / 10,
            initialBytes: before,
            interactionBytes: bytes - before,
          };
          samples.push(sample);
          const nav = page.getByRole("navigation", { name: "Documentation", exact: true });
          await nav.getByRole("link", { name: "Guide 001", exact: true }).click();
          await page.getByRole("heading", { name: "Guide 001", exact: true }).waitFor();
          await page
            .locator('[data-docs-part="locales"]')
            .getByRole("link", { name: "中文", exact: true })
            .click();
          await page.getByRole("heading", { name: "指南 001", exact: true }).waitFor();
          await page
            .locator('[data-docs-part="search"]')
            .getByRole("link", { name: "指南 000", exact: true })
            .waitFor();
          await page
            .locator('[data-docs-part="versions"]')
            .getByRole("link", { name: "v1", exact: true })
            .click();
          await page.waitForFunction(() => location.pathname === "/zh/v1/guide-001");
          await page
            .locator('[data-docs-part="search"]')
            .getByRole("link", { name: "指南 000", exact: true })
            .waitFor();
          await page.getByRole("heading", { name: "指南 001", exact: true }).waitFor();
          assert.equal(await page.evaluate(() => document.documentElement.lang), "zh-CN");
          assert.equal(
            await page.locator('link[rel="canonical"]').getAttribute("href"),
            "https://docs.example.test/zh/v1/guide-001",
          );
          await page.goBack();
          await page.waitForFunction(() => location.pathname === "/zh/guide-001");
          await page.getByRole("heading", { name: "指南 001", exact: true }).waitFor();
          assert.equal(new Set(scopes).size, 3);
          if (!baseline) assert.equal(new Set(bodies).size, 3);
          assert.deepEqual(errors, []);
          console.log(
            `scale ${baseline ? "baseline " : ""}${size} sample ${run + 1}: ${JSON.stringify(sample)}`,
          );
        } finally {
          await context.close();
        }
      }
    } finally {
      await server.stop(true);
    }
    const record = {
      baseline,
      pages: size,
      topicsPerScope: size / 4,
      buildMs,
      appBytes: app.length,
      appGzipBytes: gzipSync(app).length,
      samples,
      median: Object.fromEntries(
        Object.keys(samples[0]).map((key) => [key, median(samples.map((sample) => sample[key]))]),
      ),
    };
    results.push(record);
    await Bun.write(
      path.join(cache, "results.json"),
      JSON.stringify(
        {
          date: new Date().toISOString(),
          conditions: {
            runs,
            latencyMs: 80,
            downloadBytesPerSecond: 200000,
            cpuSlowdown: 4,
            locales: 2,
            versions: 2,
            paragraphsPerPage: 24,
          },
          versions: { bun: Bun.version, chromium: browser.version() },
          results,
        },
        null,
        2,
      ),
    );
    console.log(
      `scale ${baseline ? "baseline " : ""}${size}: ${JSON.stringify({ ...record, samples: undefined })}`,
    );
  }
  const largest = results
    .filter((result) => !result.baseline)
    .toSorted((a, b) => b.pages - a.pages)[0];
  const webkitBrowser = await webkit.launch();
  const webkitServer = serve(path.join(cache, String(largest.pages), "dist"));
  try {
    const page = await webkitBrowser.newPage(),
      errors = [],
      scopes = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("request", (request) => {
      if (/\/scope-\d+-/.test(request.url())) scopes.push(request.url());
    });
    const last = String(largest.topicsPerScope - 1).padStart(3, "0");
    await page.goto(new URL(`/zh/v1/guide-${last}`, webkitServer.url).href);
    await page.getByRole("heading", { name: `指南 ${last}`, exact: true }).waitFor();
    assert.equal(scopes.length, 0);
    await page
      .getByRole("searchbox", { name: "Search documentation" })
      .fill("acceptance-target-000");
    await page
      .locator('[data-docs-part="search"]')
      .getByRole("link", { name: "指南 000", exact: true })
      .waitFor();
    await page
      .locator('[data-docs-part="locales"]')
      .getByRole("link", { name: "English", exact: true })
      .click();
    await page.getByRole("heading", { name: `Guide ${last}`, exact: true }).waitFor();
    await page
      .locator('[data-docs-part="search"]')
      .getByRole("link", { name: "Guide 000", exact: true })
      .waitFor();
    await page
      .locator('[data-docs-part="versions"]')
      .getByRole("link", { name: "v2", exact: true })
      .click();
    await page.waitForFunction((expected) => location.pathname === expected, `/guide-${last}`);
    await page
      .locator('[data-docs-part="search"]')
      .getByRole("link", { name: "Guide 000", exact: true })
      .waitFor();
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute("href"),
      `https://docs.example.test/guide-${last}`,
    );
    await page.getByRole("heading", { name: `Guide ${last}`, exact: true }).waitFor();
    await page.goBack();
    await page.waitForFunction((expected) => location.pathname === expected, `/v1/guide-${last}`);
    assert.equal(new Set(scopes).size, 3);
    assert.deepEqual(errors, []);
    console.log(
      `webkit: ${largest.pages}-page deep links, search, locale/version switching and history passed`,
    );
  } finally {
    await webkitBrowser.close();
    await webkitServer.stop(true);
  }
  const record = await Bun.file(path.join(cache, "results.json")).json();
  record.webkitLargestPages = largest.pages;
  await Bun.write(path.join(cache, "results.json"), JSON.stringify(record, null, 2));
  const rows = results
    .map(
      (result) =>
        `| ${result.baseline ? "Previous inline" : "Page data"} | ${result.pages} | ${result.topicsPerScope} | ${result.buildMs === null ? "saved" : (result.buildMs / 1000).toFixed(2)} | ${result.appBytes} | ${result.appGzipBytes} | ${result.median.fcpMs} | ${result.median.searchMs} | ${result.median.scriptMs} | ${result.median.initialBytes} | ${result.median.interactionBytes} |`,
    )
    .join("\n");
  await Bun.write(
    path.join(root, "SCALE.md"),
    `# Scale acceptance measurements

Measured ${record.date}. Bun ${record.versions.bun}, Chromium ${record.versions.chromium}.

Page counts are total registered URLs: two languages (English/Chinese) × two independently authored versions. The fixtures contain 25/50/75 logical topics per scope, respectively. Each page has 24 paragraphs, four sections, inline markup, source links, a code block and deterministic per-paragraph configuration identifiers. Build times include validation, tokenization, compilation and all-route static rendering, measured once per size. Browser values are medians of ${runs} fresh-context samples with cache disabled, gzip delivery, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown.

| Delivery | Total pages | Topics/scope | Build (s) | app.js bytes | app.js gzip bytes | FCP (ms) | First search paint (ms) | Script during search (ms) | Initial transfer bytes | First-interaction transfer bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

Every Chromium sample also verifies current-scope navigation count, unique search results, language and version counterpart links, canonical/language updates, browser Back and exactly three requested scope indexes across the tested transitions. Current builds also assert that no page module is requested for the initial pre-rendered page, even during first interaction: Exact reuses its per-page checkpoint. Only the three subsequently visited Markdown pages request body modules; Back uses synchronously cached page replies, seeded from the native kept hook for the initial page and populated when later imports resolve. Sentinel prose is absent from app.js. Sitemap entries match the route count. WebKit functionally verifies the largest ${largest.pages}-page fixture, including a deep link in the last scope, search, language/version changes and Back; its timings are not mixed into the Chromium table.

## Findings and limits

The initial 100-page build failed Exact's 64-level expression nesting limit. Route lookup now uses a flat name index and balanced selection, with page identity derived from that selected record. Shared navigation, groups and labels are stored once per locale/version rather than repeated in every page constructor. A diagnostic 300-page build before sharing had a 690,850-byte gzip entry; after sharing it was about 410 KB. The diagnostic timing samples ran once and are not a statistical before/after performance claim.

The site remains one application. Markdown text, raw source and syntax-token values are now emitted as page data modules. Small native block templates are shared across pages, while layout, route metadata, root resources and custom Exact/widget code stay in the application. Initial HTML contains the complete current page and its checkpoint; navigation imports only the destination page data. Cached replies return synchronously so async placeholders cannot collapse the page before native history restoration. The optional saved 300-page inline build is measured in the same browser run without rebuilding it. Build times include page-module generation and the typed resource/static-rendering pipeline; the saved baseline has no new build timing. Different structures can add templates, and custom Exact code is not split, so these results do not establish a general performance budget. Initial HTML is pre-rendered; first paint and activation have different costs. No default theme, visual parity, real-device or native-platform acceptance is claimed. Reading/custom-layout checks are recorded separately in [ACCEPTANCE.md](ACCEPTANCE.md).

Reproduce from this package with the documented EXACT_ROOT and PLAYWRIGHT_MODULE: \`bun run test:scale\`. Optional \`SCALE_BASELINE_DIR\` points to an unchanged saved 300-page output of this fixture for a same-run comparison. \`SCALE_PAGES=100,200,300\` selects sizes; \`PERF_RUNS\` sets 1–10 samples (default 3). Raw measurements and generated fixtures live in [.cache/scale/results.json](.cache/scale/results.json). Background machine work can affect local timing.
`,
  );
} finally {
  await browser.close();
}
