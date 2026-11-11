import assert from "node:assert/strict";
import { cp, mkdir, readFile, readdir, rm, symlink } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { buildSite, loadSite, navigationGroups } from "../src/index.ts";
import { highlightDocuments } from "../src/highlight.ts";
import { renderHtml } from "../src/renderers/html.ts";
import { choices, sameScope } from "../src/variants.ts";
import { staticResponse } from "../src/server.ts";

const root = path.resolve(import.meta.dirname, "..");
const cache = path.join(root, ".cache/fumadocs");
const templates = path.join(root, "bench/fumadocs");
const source = path.join(root, ".cache/scale/300");
if (!(await Bun.file(path.join(source, "docs.json")).exists()))
  throw Error("Generate the corpus with SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale first");
const requireFuma = createRequire(path.join(templates, "package.json"));
const { createSearchAPI } = await import(
  pathToFileURL(requireFuma.resolve("fumadocs-core/search/server")).href
);
const { structure } = await import(
  pathToFileURL(requireFuma.resolve("fumadocs-core/mdx-plugins/remark-structure")).href
);
const outputs = Object.fromEntries(
  ["exact", "headless", "matched", "ui"].map((name) => [
    name,
    path.join(cache, name, name === "exact" ? "dist" : "out"),
  ]),
);
const versions = {};
for (const name of ["fumadocs-core", "fumadocs-ui", "next", "react", "react-dom", "tailwindcss"])
  versions[name] = JSON.parse(
    await readFile(path.join(templates, "node_modules", name, "package.json"), "utf8"),
  ).version;
const runs = Number(process.env.PERF_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw Error("PERF_RUNS must be 1..10");
function queryFor(doc) {
  const token = doc.markdown.match(/\b[a-f0-9]{16}\b/);
  assert.ok(token, `Missing unique body marker in ${doc.path}`);
  return token[0];
}
const buildTimes = {};
if (process.env.FUMA_MEASURE_ONLY !== "1") {
  await rm(cache, { recursive: true, force: true });
  await mkdir(cache, { recursive: true });
  const site = await loadSite(source);
  assert.equal(site.documents.length, 300);
  await highlightDocuments(site.documents);
  const documents = site.documents;
  // This stable order is also used by the fixture's route-aware static search client.
  const axes = [
    ["en", "v2"],
    ["en", "v1"],
    ["zh-CN", "v2"],
    ["zh-CN", "v1"],
  ];
  const pages = documents.map((doc) => {
    const scoped = documents.filter((other) => sameScope(other, doc));
    const navigation = navigationGroups(scoped);
    const groupIndex = navigation.findIndex((group) =>
      group.items.some((item) => item.href === doc.path),
    );
    const position = scoped.indexOf(doc);
    const link = (other) => (other ? { title: other.title, href: other.path } : null);
    return {
      id: doc.id,
      path: doc.path,
      title: doc.title,
      locale: doc.locale,
      version: doc.version,
      scope: JSON.stringify([doc.locale, doc.version]),
      scopeIndex: axes.findIndex(
        ([locale, version]) => locale === doc.locale && version === doc.version,
      ),
      description: doc.description ?? "",
      markdown: doc.markdown,
      markdownUrl: `/_docs/markdown${doc.path === "/" ? "" : doc.path}/index.md`,
      html: renderHtml(doc.body),
      toc: doc.headings.map((item) => ({
        title: item.title,
        url: `#${item.id}`,
        depth: item.level,
      })),
      groupIndex,
      group: navigation[groupIndex].title,
      previous: link(scoped[position - 1]),
      next: link(scoped[position + 1]),
      locales: choices(documents, doc, "locale", site.config.locales),
      versions: choices(documents, doc, "version", site.config.versions),
    };
  });
  const indexes = [];
  for (const [locale, version] of axes) {
    const docs = documents.filter((doc) => doc.locale === locale && doc.version === version);
    assert.equal(docs.length, 75);
    const api = createSearchAPI("advanced", {
      indexes: docs.map((doc) => ({
        id: doc.path,
        title: doc.title,
        url: doc.path,
        description: doc.description,
        structuredData: structure(doc.markdown),
      })),
    });
    const index = await (await api.staticGET()).text();
    indexes.push(index);
    // Native search must actually find the authored marker before measuring its client.
    for (const doc of docs.slice(0, 2)) {
      const results = await api.search(queryFor(doc));
      assert.equal(results[0]?.url.split("#")[0], doc.path);
    }
  }
  const exact = path.join(cache, "exact");
  await cp(source, exact, {
    recursive: true,
    filter: (file) =>
      !path
        .relative(source, file)
        .split(path.sep)
        .some((part) => part.startsWith(".") || part === "dist"),
  });
  const config = await Bun.file(path.join(exact, "docs.json")).json();
  config.name = "Documentation comparison";
  config.root = { source: "comparison-root.contract" };
  config.layout = { source: "comparison-layout.contract", component: "ComparisonLayout" };
  await Bun.write(path.join(exact, "docs.json"), JSON.stringify(config));
  // Share the already exercised controls with the Astro comparison, without importing its runner.
  const rootContract =
    "state comparisonCount = 0\naction comparisonIncrement\n  comparisonCount = comparisonCount + 1\nprovide\n  comparisonCount\n  comparisonIncrement\n";
  await Bun.write(path.join(exact, "comparison-root.contract"), rootContract);
  const fixture = await Bun.file(path.join(root, "bench/comparison/exact-layout.contract")).text();
  await Bun.write(path.join(exact, "comparison-layout.contract"), fixture);
  const start = performance.now();
  await buildSite(exact);
  buildTimes.exact = Math.round(performance.now() - start);
  for (const name of ["headless", "matched", "ui"]) {
    const directory = path.join(cache, name);
    await mkdir(path.join(directory, "app/[[...slug]]"), { recursive: true });
    await symlink(
      path.join(templates, "node_modules"),
      path.join(directory, "node_modules"),
      "dir",
    );
    await cp(path.join(templates, "package.json"), path.join(directory, "package.json"));
    await cp(path.join(templates, "next.config.mjs"), path.join(directory, "next.config.mjs"));
    if (name === "ui")
      await cp(
        path.join(templates, "postcss.config.mjs"),
        path.join(directory, "postcss.config.mjs"),
      );
    for (const file of await readdir(path.join(templates, "common"))) {
      const dest = file === "page.jsx" ? "app/[[...slug]]/page.jsx" : `app/${file}`;
      await cp(path.join(templates, "common", file), path.join(directory, dest));
    }
    await cp(
      path.join(templates, name === "matched" ? "headless" : name),
      path.join(directory, "app"),
      { recursive: true },
    );
    if (name === "matched")
      await cp(path.join(templates, "matched"), path.join(directory, "app"), { recursive: true });
    await Bun.write(path.join(directory, "data/pages.json"), JSON.stringify(pages));
    for (const [i, index] of indexes.entries())
      await Bun.write(path.join(directory, `public/_search/${i}.json`), index);
    for (const [i, [locale, version]] of axes.entries()) {
      const data = documents
        .filter((doc) => doc.locale === locale && doc.version === version)
        .map((doc) => ({ title: doc.title, href: doc.path, text: doc.text.toLowerCase() }));
      await Bun.write(
        path.join(directory, `public/_search/substring-${i}.js`),
        `export default ${JSON.stringify(data)};`,
      );
    }
    for (const page of pages)
      await Bun.write(path.join(directory, "public", page.markdownUrl), page.markdown);
    const start = performance.now();
    const child = Bun.spawn(
      ["node", path.join(templates, "node_modules/next/dist/bin/next"), "build", "--webpack"],
      {
        cwd: directory,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
        stdout: "inherit",
        stderr: "inherit",
      },
    );
    if ((await child.exited) !== 0) throw Error(`Fumadocs ${name} production build failed`);
    buildTimes[name] = Math.round(performance.now() - start);
  }
  await Bun.write(
    path.join(cache, "build.json"),
    JSON.stringify({ versions, buildTimes }, null, 2),
  );
}
for (const out of Object.values(outputs))
  assert.ok(await Bun.file(path.join(out, "index.html")).exists(), `Missing built fixture ${out}`);
if (process.env.FUMA_BUILD_ONLY === "1") process.exit(0);

const corpus = await loadSite(source);
const query0 = queryFor(corpus.documents.find((doc) => doc.path === "/"));
const query1 = queryFor(corpus.documents.find((doc) => doc.path === "/guide-001"));
function serve(out) {
  const responses = new Map();
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
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
      const entry = responses.get(key);
      return new Response(entry.body, entry);
    },
  });
}
const servers = Object.fromEntries(
  Object.entries(outputs).map(([name, out]) => [name, serve(out)]),
);
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch();
const normal = (pathname) => pathname.replace(/\/$/, "") || "/";
async function setup(name) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
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
  const errors = [],
    requests = [];
  const inflight = new Map();
  let goal;
  cdp.on("Network.requestWillBeSent", (e) => {
    const record = {
      path: new URL(e.request.url).pathname,
      type: e.type,
      bytes: 0,
      bodyBytes: 0,
      headerBytes: 0,
    };
    inflight.set(e.requestId, record);
    requests.push(record);
  });
  cdp.on("Network.responseReceived", (e) => {
    const record = inflight.get(e.requestId);
    if (record) record.headerBytes = e.response.encodedDataLength;
  });
  cdp.on("Network.dataReceived", (e) => {
    const record = inflight.get(e.requestId);
    if (record) record.bodyBytes += e.encodedDataLength;
  });
  cdp.on("Network.loadingFinished", (e) => {
    const record = inflight.get(e.requestId);
    if (record) record.bytes = e.encodedDataLength;
  });
  cdp.on("Network.loadingFailed", (e) => {
    const record = inflight.get(e.requestId);
    if (record) {
      record.cancelled = e.canceled === true;
      record.error = e.errorText;
      record.bytes = record.headerBytes + record.bodyBytes;
    }
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.exposeBinding("__fumadocsPaint", (_source, event) => {
    if (goal?.test(event)) {
      goal.resolve(event);
      goal = undefined;
    }
  });
  await page.addInitScript(
    ({ ui }) => {
      const seen = new Map();
      const check = () => {
        const pathname = location.pathname.replace(/\/$/, "") || "/";
        const heading = document.querySelector("main h1")?.textContent;
        const code =
          document.querySelector('main [data-docs-part="code"], main pre code')?.textContent ?? "";
        const body = code.includes(`const route = "${pathname}";`) ? heading : undefined;
        const counter = document.querySelector('[data-testid="comparison-counter"]')?.textContent;
        const results = [
          ...document.querySelectorAll(
            ui ? '[role="listbox"] [role="option"]' : '[data-docs-part="search"] a',
          ),
        ].map((el) => ({ text: el.textContent, href: el.getAttribute("href"), id: el.id }));
        for (const [type, value] of [
          ["heading", heading],
          ["body", body],
          ["counter", counter],
          ["search", results.length ? results : undefined],
        ]) {
          if (!value) continue;
          const key = pathname + JSON.stringify(value);
          if (seen.get(type) === key) continue;
          seen.set(type, key);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (seen.get(type) === key)
                window.__fumadocsPaint({
                  type,
                  value,
                  path: pathname,
                  epoch: performance.timeOrigin + performance.now(),
                  sinceNavigationMs: performance.now(),
                });
            }),
          );
        }
      };
      new MutationObserver(check).observe(document, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    },
    { ui: name === "ui" },
  );
  await page.goto(servers[name].url.href, { waitUntil: "load" });
  await page.getByRole("heading", { name: "Guide 000", exact: true }).waitFor();
  await page.waitForFunction(
    () => performance.getEntriesByName("first-contentful-paint").length > 0,
  );
  const initial = await page.evaluate(() => ({
    fcpMs: performance.getEntriesByName("first-contentful-paint")[0].startTime,
    beforeActionMs: performance.now(),
  }));
  async function measure(test, action) {
    let timer;
    const paint = new Promise((resolve, reject) => {
      goal = { test, resolve };
      timer = setTimeout(() => {
        goal = undefined;
        reject(Error(`Paint goal timed out: ${name} ${page.url()}`));
      }, 30000);
    });
    const start = await page.evaluate(() => performance.timeOrigin + performance.now());
    try {
      await action();
      const event = await paint;
      return {
        ms: Math.round((event.epoch - start) * 10) / 10,
        sinceNavigationMs: Math.round(event.sinceNavigationMs * 10) / 10,
      };
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    context,
    page,
    cdp,
    errors,
    requests,
    initial,
    measure,
    bytes: () => requests.reduce((sum, request) => sum + request.bytes, 0),
    jsBytes: () =>
      requests.reduce((sum, request) => sum + (request.type === "Script" ? request.bytes : 0), 0),
  };
}
async function search(t, name, query) {
  if (name === "ui") {
    if (!(await t.page.getByRole("combobox").isVisible()))
      await t.page
        .getByRole("button", { name: /Search|搜索/ })
        .first()
        .click();
    await t.page.getByRole("combobox").fill(query);
  } else await t.page.getByRole("searchbox").fill(query);
}
async function closeSearch(t, name) {
  if (name === "ui") {
    await t.page.keyboard.press("Escape");
    await t.page.getByRole("dialog").waitFor({ state: "hidden" });
  }
}
function nav(t, name) {
  return name === "ui"
    ? t.page.locator("#nd-sidebar")
    : t.page.getByRole("navigation", { name: "Documentation", exact: true });
}
const rounded = (n) => Math.round(n * 10) / 10;
const sets = { exact: [], headless: [], matched: [], ui: [] };
try {
  for (let run = 0; run < (process.env.FUMA_VALIDATE_ONLY === "1" ? 0 : runs); run++) {
    const names = Object.keys(sets);
    if (run % 2) names.reverse();
    for (const name of names) {
      const t = await setup(name);
      try {
        assert.equal(
          t.requests.some((r) => r.path.startsWith("/_search/") || /^\/scope-\d+-/.test(r.path)),
          false,
          "No search database before a real query",
        );
        assert.equal(
          t.requests.some((r) => r.path.includes("guide-001")),
          false,
          "No route prefetch",
        );
        const initialBytes = t.bytes(),
          initialJsBytes = t.jsBytes();
        const metrics = Object.fromEntries(
          (await t.cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
        );
        const first = await t.measure(
          (e) => e.type === "search" && e.path === "/" && e.value[0].text.includes("Guide 000"),
          () => search(t, name, query0),
        );
        const afterMetrics = Object.fromEntries(
          (await t.cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
        );
        await t.page.waitForLoadState("networkidle");
        const firstSearchBytes = t.bytes() - initialBytes,
          jsThroughSearch = t.jsBytes();
        const repeat = await t.measure(
          (e) => e.type === "search" && e.value[0].text.includes("Guide 001"),
          () => search(t, name, query1),
        );
        await t.page.waitForLoadState("networkidle");
        const repeatBytes = t.bytes() - initialBytes - firstSearchBytes;
        const scopes = t.requests.filter(
          (r) => r.path.startsWith("/_search/") || /^\/scope-\d+-/.test(r.path),
        );
        assert.equal(scopes.length, 1, "Queries reuse exactly one current-scope database");
        await closeSearch(t, name);
        await t.page.getByTestId("comparison-counter").click();
        await t.page.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
        const beforeNav = t.bytes();
        const forward = await t.measure(
          (e) => e.type === "body" && e.path === "/guide-001" && e.value === "Guide 001",
          () => nav(t, name).getByRole("link", { name: "Guide 001", exact: true }).click(),
        );
        await t.page.waitForLoadState("networkidle");
        const coldNavBytes = t.bytes() - beforeNav;
        assert.equal(await t.page.getByTestId("comparison-counter").textContent(), "Count: 1");
        const beforeBack = t.bytes();
        const back = await t.measure(
          (e) => e.type === "body" && e.path === "/" && e.value === "Guide 000",
          () => t.page.goBack(),
        );
        await t.page.waitForLoadState("networkidle");
        assert.equal(await t.page.getByTestId("comparison-counter").textContent(), "Count: 1");
        assert.deepEqual(t.errors, []);
        const sample = {
          ...t.initial,
          beforeActionMs: rounded(t.initial.beforeActionMs),
          initialBytes,
          initialJsBytes,
          firstSearchMs: first.ms,
          coldOpenToSearchMs: first.sinceNavigationMs,
          firstSearchBytes,
          totalThroughSearchBytes: initialBytes + firstSearchBytes,
          searchIndexBytes: scopes.reduce((sum, request) => sum + request.bytes, 0),
          jsThroughSearch,
          initialScriptMs: rounded(metrics.ScriptDuration * 1000),
          searchScriptMs: rounded((afterMetrics.ScriptDuration - metrics.ScriptDuration) * 1000),
          repeatSearchMs: repeat.ms,
          repeatBytes,
          coldNavMs: forward.ms,
          coldNavBytes,
          backMs: back.ms,
          backBytes: t.bytes() - beforeBack,
          documentRequests: t.requests.filter((r) => r.type === "Document").length,
          cancelledResponses: t.requests.filter((r) => r.cancelled).length,
        };
        assert.equal(sample.documentRequests, 1, "All three keep the document during navigation");
        if (run === 0)
          await Bun.write(
            path.join(cache, `${name}-network.json`),
            JSON.stringify(t.requests, null, 2),
          );
        sets[name].push(sample);
        console.log(`${name} ${run + 1}: ${JSON.stringify(sample)}`);
      } catch (error) {
        await t.page.screenshot({ path: path.join(cache, `${name}-failure.png`), fullPage: true });
        console.error(
          name,
          await t.page.locator("body").innerText(),
          t.errors,
          t.requests.slice(-8),
        );
        throw error;
      } finally {
        await t.context.close();
      }
      const tCounter = await setup(name);
      try {
        const before = tCounter.bytes();
        const count = await tCounter.measure(
          (e) => e.type === "counter" && e.value === "Count: 1",
          () => tCounter.page.getByTestId("comparison-counter").click(),
        );
        await tCounter.page.waitForLoadState("networkidle");
        assert.equal(
          tCounter.requests.some(
            (r) => r.path.startsWith("/_search/") || /^\/scope-\d+-/.test(r.path),
          ),
          false,
          "Counter must not fetch a search database",
        );
        assert.deepEqual(tCounter.errors, []);
        Object.assign(sets[name].at(-1), {
          firstCounterMs: count.ms,
          coldOpenToCounterMs: count.sinceNavigationMs,
          counterBytes: tCounter.bytes() - before,
        });
      } finally {
        await tCounter.context.close();
      }
    }
  }
  // Timed contexts remain cold; broader scope acceptance runs only after timing.
  for (const name of Object.keys(sets)) {
    const t = await setup(name);
    try {
      await t.page.goto(
        new URL(name === "exact" ? "/zh/v1/guide-001" : "/zh/v1/guide-001/", servers[name].url)
          .href,
      );
      await t.page.getByTestId("comparison-counter").click();
      await t.page.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
      await t.page.waitForFunction(() => document.documentElement.lang === "zh-CN");
      await t.page
        .getByRole("navigation", { name: "Language", exact: true })
        .getByRole("link", { name: "English", exact: true })
        .click();
      await t.page.waitForURL((url) => normal(url.pathname) === "/v1/guide-001");
      await t.page.waitForFunction(() => document.documentElement.lang === "en");
      for (const [version, pathname] of [
        ["v1", "/v1/guide-001"],
        ["v2", "/guide-001"],
      ]) {
        if (version === "v2") {
          await t.page
            .getByRole("navigation", { name: "Version", exact: true })
            .getByRole("link", { name: "v2", exact: true })
            .click();
          await t.page.waitForURL((url) => normal(url.pathname) === pathname);
        }
        const query = queryFor(corpus.documents.find((doc) => doc.path === pathname));
        await search(t, name, query);
        const hit =
          name === "ui"
            ? t.page.getByRole("option").first()
            : t.page.locator('[data-docs-part="search"] a').first();
        await hit.filter({ hasText: "Guide 001" }).waitFor();
        if (name === "ui") {
          await hit.click();
          await t.page.waitForURL((url) => normal(url.pathname) === pathname);
        } else {
          assert.equal(
            normal(new URL(await hit.getAttribute("href"), t.page.url()).pathname),
            pathname,
          );
        }
        assert.equal(await t.page.getByTestId("comparison-counter").textContent(), "Count: 1");
      }
      assert.deepEqual(t.errors, []);
      await t.page.screenshot({ path: path.join(cache, `${name}-validated.png`) });
      console.log(
        `${name}: Chinese/archived deep link, language/version scope search and persistent root counter passed`,
      );
    } finally {
      await t.context.close();
    }
  }
  if (process.env.FUMA_VALIDATE_ONLY !== "1") {
    const results = Object.fromEntries(
      Object.entries(sets).map(([name, samples]) => [
        name,
        {
          samples,
          median: Object.fromEntries(
            Object.keys(samples[0]).map((key) => [
              key,
              samples.map((s) => s[key]).toSorted((a, b) => a - b)[Math.floor(samples.length / 2)],
            ]),
          ),
        },
      ]),
    );
    const report = {
      date: new Date().toISOString(),
      versions: { ...versions, bun: Bun.version, chromium: browser.version() },
      conditions: {
        runs,
        pages: 300,
        locales: 2,
        versions: 2,
        pagesPerScope: 75,
        latencyMs: 80,
        downloadBytesPerSecond: 200000,
        cpuSlowdown: 4,
        gzip: true,
        cacheDisabled: true,
        linkPrefetch: false,
        searchQuery: "Unique 16-hex token in a paragraph",
        fumadocsSearchDebounceMs: 100,
        matchedSearchDebounceMs: 0,
        uiDialogPreload: true,
      },
      buildTimes,
      results,
    };
    report.indexes = {};
    for (const name of Object.keys(outputs)) {
      const file =
        name === "exact"
          ? (await readdir(outputs[name])).find((file) => /^scope-0-/.test(file))
          : name === "matched"
            ? "_search/substring-0.js"
            : "_search/0.json";
      const bytes = await Bun.file(path.join(outputs[name], file)).bytes();
      report.indexes[name] = { file, raw: bytes.length, gzip: gzipSync(bytes).length };
    }
    report.reusedBuilds = process.env.FUMA_MEASURE_ONLY === "1";
    await Bun.write(path.join(cache, "results.json"), JSON.stringify(report, null, 2));
    await writeReport(report);
    console.log(
      JSON.stringify(
        Object.fromEntries(Object.entries(results).map(([key, value]) => [key, value.median])),
        null,
        2,
      ),
    );
  }
} finally {
  await browser.close();
  for (const server of Object.values(servers)) server.stop(true);
}

async function writeReport(report) {
  const names = ["exact", "headless", "matched", "ui"];
  const row = (label, key, bytes = false) =>
    `| ${label} | ${names
      .map((name) => {
        const value = report.results[name].median[key];
        return bytes ? (value / 1000).toFixed(1) : rounded(value);
      })
      .join(" | ")} |`;
  const headings =
    "| Metric | Exact Docs | Fumadocs Core, native search | Fumadocs Core, matched search | Fumadocs UI, native search |\n| --- | ---: | ---: | ---: | ---: |";
  const timing = [
    ["First contentful paint, ms", "fcpMs"],
    ["Elapsed before first action, ms", "beforeActionMs"],
    ["First search action to result, ms", "firstSearchMs"],
    ["Cold navigation start to search result, ms", "coldOpenToSearchMs"],
    ["Repeat search, ms", "repeatSearchMs"],
    ["First counter action, ms", "firstCounterMs"],
    ["Cold navigation start to counter result, ms", "coldOpenToCounterMs"],
    ["Cold destination body ready, ms", "coldNavMs"],
    ["Back body ready, ms", "backMs"],
    ["Script before first action, ms", "initialScriptMs"],
    ["Script during first search, ms", "searchScriptMs"],
  ]
    .map(([label, key]) => row(label, key))
    .join("\n");
  const transfer = [
    ["Before first action, KB", "initialBytes"],
    ["JavaScript before first action, KB", "initialJsBytes"],
    ["Additional first search, KB", "firstSearchBytes"],
    ["Total through first search, KB", "totalThroughSearchBytes"],
    ["Search index wire transfer, KB", "searchIndexBytes"],
    ["Additional repeat search, KB", "repeatBytes"],
    ["Additional first counter, KB", "counterBytes"],
    ["Additional destination navigation, KB", "coldNavBytes"],
    ["Additional Back, KB", "backBytes"],
  ]
    .map(([label, key]) => row(label, key, true))
    .join("\n");
  const indexRows = names
    .map((name) => `| ${name} | ${report.indexes[name].raw} | ${report.indexes[name].gzip} |`)
    .join("\n");
  const text = `# 300-page Fumadocs comparison

Measured ${report.date}. Fumadocs Core/UI ${report.versions["fumadocs-core"]}, Next.js ${report.versions.next} (production Webpack build, static export), React ${report.versions.react}, Tailwind ${report.versions.tailwindcss}, Bun ${report.versions.bun}, Chromium ${report.versions.chromium}.

This compares the current headless Exact framework with two Fumadocs Core integrations and Fumadocs UI. It does not change the Exact default theme. The same 300 authored URLs are English/Chinese × v2/v1 × 75 topics, with 24 paragraphs and one code block per page. Both use the same parsed document IR, HTML body and build-time syntax tokens; Fumadocs uses the documented [custom source API](https://www.fumadocs.dev/docs/headless/source-api/source). This deliberately excludes an end-to-end MDX/Markdown compilation-throughput comparison.

## What is measured

- **Exact Docs:** one root Exact application, its current body/metadata splitting and intent-triggered startup, its lazy per-scope substring search with no debounce, and the same fixture root counter/layout used by the Astro comparison.
- **Core, native search:** Next App Router, the real Fumadocs Source loader and TOC provider, a minimal unstyled layout, and Fumadocs' native advanced static search through useStaticSearch. The native engine is ZBSearch in this pinned version; the historical orama-static import name remains in its public API. Its default 100 ms debounce and page/section/text results are preserved.
- **Core, matched search:** the identical minimal Next/Fumadocs layout, using the public experimental_useSearch hook with a custom lazy substring adapter. It has the same normalized title/body text and 75-page data scope as Exact and delayMs=0. This is a controlled adapter, not a claim about Fumadocs' default search.
- **UI, native search:** the real RootProvider, DocsLayout, sidebar, DocsPage, breadcrumb, TOC, footer and default search dialog, with the neutral default Fumadocs theme. The default dialog-code preload and 100 ms debounce remain enabled. The fixture supplies scope links and keys the default dialog by its index API URL so version changes refresh its client. It does not replace the native search engine or dialog results.

Fumadocs' [static search configuration](https://www.fumadocs.dev/docs/headless/search/orama) exports a browser-side database. To align scope, this fixture builds four databases via createSearchAPI/staticGET, each containing only 75 pages, rather than asking Fumadocs to download all 300 pages. The matched adapter and Exact also load only their current scope. All searches are local; no hosted search API is involved. Queries are the same unique 16-hex marker in each target paragraph, not a title-only lookup or a shared word. Native server checks and actual client navigation verify the correct target.

Values are medians of ${report.conditions.runs} fresh-context trials, interleaved across all four implementations with reversed order on alternate rounds. The same Bun static server uses gzip, no-store delivery, cache disabled, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown. Viewport is 1280×900; motion is reduced. Route prefetch is disabled and checked. No reading delay, idle warmup or network-idle wait is inserted before the first action. One Chromium process hosts separate contexts; this is not a new browser-process/device boot for every sample.

The action clock begins after initial load/FCP observation. Since Next downloads and hydrates its client before interaction while Exact defers its application, action latency alone is incomplete. The tables also include elapsed time before that action, total navigation-start-to-result time, and cumulative transfer. UI search includes opening the default dialog; the headless inputs are inline. Render measurements observe real DOM changes and two animation frames through a binding, including across navigation, rather than locator-polling completion. Navigation readiness also requires the final code block to match the destination route, not only the heading. These are body/result readiness measures, not pixel parity, equal viewport composition or a meaningful-paint score for the default theme.

## Timings

${headings}
${timing}

## Transfer

KB means decimal 1,000 bytes. Wire measurements include response headers and reflect the requests in each fresh context, not the sum of every emitted chunk. Completed requests use CDP loadingFinished totals. Next can cancel a Flight stream after consuming its useful rows; these requests use observed response-header plus encoded dataReceived bytes and are lower bounds, rather than being incorrectly reported as zero. Bytes are credited at response completion/cancellation, so asynchronous dialog-code downloads can straddle the initial/action boundary; additional counter bytes are not necessarily caused by the counter. Exact's search data is JavaScript while the native Fumadocs databases are JSON, so script-only transfer should be read alongside total transfer.

${headings}
${transfer}

The first English/current-version index payloads, excluding response headers:

| Fixture | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
${indexRows}

Native structured full-text indexing and plain substring matching have different processing, result and corpus semantics. The matched-search column controls that difference and the debounce. It still includes the actual React/Next runtime, Fumadocs hook/result parsing and TOC behavior. No single result here establishes that one framework is generally faster.

## State and acceptance

All four increment the fixture counter once, retain Count: 1 on forward navigation and browser Back, and use only one document during the timed navigation. All four reuse exactly one current-scope index for repeated queries; a fresh counter-only context loads no search database. A separate acceptance pass verifies Chinese/archived deep links, English language switching, current-version switching, correct scoped body-query results, and preservation of the root counter through those changes. Uncaught page errors fail the harness. Validated screenshots are in .cache/fumadocs/*-validated.png.

The persistent React counter lives in the common root layout; it is an explicit fixture integration. The language/version Source adapters, scope controls and counter are authored for this corpus, not evidence that either framework has identical configuration APIs. The dialog's query can reset on scope change; only the stated root counter persistence is asserted. The fixture does not reproduce Exact's resource/mutation/task systems, arbitrary custom-page code, or native AppKit/UIKit hosts.

This run ${report.reusedBuilds ? "reused the explicitly requested prebuilt production artifacts" : "built all four production outputs from the fixture sources before timing"}. Build durations are excluded because common IR/highlighting, search-index generation, SDK compilation and Next builds are different pipelines. Source/lockfiles and generated-data adapters live under bench/fumadocs; generated projects and complete samples are under .cache/fumadocs. Production bundle structure, browser scheduling and local host load can influence small timing differences. This is not a comparison with the existing Lenso UI documentation site or a native/mobile performance result.

The corpus deliberately contains high-cardinality per-paragraph configuration identifiers. They increase a token index's size; this is not a general index-size budget for ordinary prose documentation. This is a **static-to-static** deployment comparison. Fumadocs also supports server-backed and hosted search, which do not require downloading the full database; those network/backend tradeoffs are not measured here.

## Reproduce

With the README's pinned Exact and Playwright environment, from this package:

\x60\x60\x60sh
bun install --cwd bench/fumadocs --frozen-lockfile --ignore-scripts
# Generate the standard corpus first if absent.
SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale
PERF_RUNS=5 bun run test:fumadocs
\x60\x60\x60

The normal runner rebuilds all outputs and tests both native and matched search. FUMA_BUILD_ONLY=1 stops after production builds; FUMA_MEASURE_ONLY=1 explicitly reuses existing outputs for repeated measurements. To run only scope acceptance on those outputs, combine FUMA_MEASURE_ONLY=1 with FUMA_VALIDATE_ONLY=1. Reuse does not rebuild edited fixture source. All numeric samples, versions, conditions and index sizes are in .cache/fumadocs/results.json.
`;
  await Bun.write(path.join(root, "FUMADOCS_COMPARISON.md"), text);
}
