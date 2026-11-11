import assert from "node:assert/strict";
import { writeReport } from "./fumadocs-report.mjs";
import { writeActivationReport } from "./activation-report.mjs";
import { writeEntryReport } from "./entry-report.mjs";
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
const activationBaseline = process.env.FUMA_ACTIVATION_BASELINE;
const localActivation = process.env.FUMA_LOCAL_ACTIVATION;
const localLabel = process.env.FUMA_LOCAL_ACTIVATION_LABEL ?? "local-activation";
assert.ok(/^[a-z-]+$/.test(localLabel));
const entryComparison = process.env.FUMA_ENTRY_COMPARISON === "1";
assert.ok(
  !entryComparison || activationBaseline,
  "FUMA_ENTRY_COMPARISON requires an activation baseline",
);
const fastActivation = process.env.FUMA_ACTIVATION_FAST === "1";
assert.ok(
  !fastActivation || activationBaseline,
  "FUMA_ACTIVATION_FAST requires an activation baseline",
);
const latencyMs = fastActivation ? 0 : 80;
const downloadBytesPerSecond = fastActivation ? 10000000 : 200000;
if (activationBaseline) outputs.exactBefore = path.resolve(activationBaseline);
if (localActivation) {
  assert.ok(
    activationBaseline && process.env.FUMA_MEASURE_ONLY === "1",
    "Local prototype requires a baseline and reused builds",
  );
  outputs.exact = path.resolve(localActivation);
}
const cases = activationBaseline ? ["exactBefore", "exact", "matched"] : Object.keys(outputs);
const isExact = (name) => name === "exact" || name === "exactBefore";
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
if (process.env.FUMA_MEASURE_ONLY === "1") {
  const built = await Bun.file(path.join(cache, "build.json")).json();
  assert.deepEqual(
    built.versions,
    versions,
    "Dependencies changed; rebuild the fixtures before reusing output",
  );
  Object.assign(buildTimes, built.buildTimes);
}
for (const out of cases.map((name) => outputs[name]))
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
    latency: latencyMs,
    downloadThroughput: downloadBytesPerSecond,
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
    timeOrigin: performance.timeOrigin,
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
        sinceInitialNavigationMs: Math.round((event.epoch - initial.timeOrigin) * 10) / 10,
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
const sets = Object.fromEntries(cases.map((name) => [name, []]));
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
        assert.equal(sample.documentRequests, 1, "All four keep the document during navigation");
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
        const initialCounterMetrics = Object.fromEntries(
          (await tCounter.cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
        );
        const count = await tCounter.measure(
          (e) => e.type === "counter" && e.value === "Count: 1",
          () => tCounter.page.getByTestId("comparison-counter").click(),
        );
        const throughPaintBytes = tCounter.bytes();
        const counterMetrics = Object.fromEntries(
          (await tCounter.cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
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
        if (run === 0)
          await Bun.write(
            path.join(
              cache,
              `${localActivation ? `${localLabel}-` : ""}${activationBaseline ? `${entryComparison ? "entry" : "activation"}-${fastActivation ? "fast" : "slow"}-` : ""}${name}-counter-network.json`,
            ),
            JSON.stringify(tCounter.requests, null, 2),
          );
        Object.assign(sets[name].at(-1), {
          firstCounterMs: count.ms,
          counterInitialBytes: before,
          counterThroughPaintBytes: throughPaintBytes,
          counterTotalBytes: tCounter.bytes(),
          counterScriptMs: rounded(
            (counterMetrics.ScriptDuration - initialCounterMetrics.ScriptDuration) * 1000,
          ),
          coldOpenToCounterMs: count.sinceNavigationMs,
          counterBytes: tCounter.bytes() - before,
        });
      } finally {
        await tCounter.context.close();
      }
      if (process.env.FUMA_NAV_FIRST === "1") {
        const firstNav = await setup(name);
        try {
          const before = Object.fromEntries(
            (await firstNav.cdp.send("Performance.getMetrics")).metrics.map((m) => [
              m.name,
              m.value,
            ]),
          );
          const event = await firstNav.measure(
            (e) => e.type === "body" && e.path === "/guide-001" && e.value === "Guide 001",
            () => nav(firstNav, name).getByRole("link", { name: "Guide 001", exact: true }).click(),
          );
          const after = Object.fromEntries(
            (await firstNav.cdp.send("Performance.getMetrics")).metrics.map((m) => [
              m.name,
              m.value,
            ]),
          );
          await firstNav.page.waitForLoadState("networkidle");
          assert.deepEqual(firstNav.errors, []);
          const documentRequests = firstNav.requests.filter((r) => r.type === "Document").length;
          if (name !== "exactBefore") assert.equal(documentRequests, 1);
          assert.equal(
            firstNav.requests.some(
              (r) => r.path.startsWith("/_search/") || /^\/scope-\d+-/.test(r.path),
            ),
            false,
            "A first navigation must not load search indexes",
          );
          assert.equal(
            await firstNav.page.getByTestId("comparison-counter").textContent(),
            "Count: 0",
          );
          Object.assign(sets[name].at(-1), {
            firstNavigationMs: event.ms,
            coldOpenToNavigationMs: event.sinceInitialNavigationMs,
            firstNavigationDocumentRequests: documentRequests,
            firstNavigationScriptMs: rounded((after.ScriptDuration - before.ScriptDuration) * 1000),
            firstNavigationTotalBytes: firstNav.bytes(),
          });
        } finally {
          await firstNav.context.close();
        }
      }
    }
  }
  // Timed contexts remain cold; broader scope acceptance runs only after timing.
  for (const name of Object.keys(sets)) {
    const t = await setup(name);
    try {
      await t.page.goto(
        new URL(isExact(name) ? "/zh/v1/guide-001" : "/zh/v1/guide-001/", servers[name].url).href,
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
      for (const [version, current, target] of [
        ["v1", "/v1/guide-001", "/v1/guide-002"],
        ["v2", "/guide-002", "/guide-003"],
      ]) {
        if (version === "v2") {
          await t.page
            .getByRole("navigation", { name: "Version", exact: true })
            .getByRole("link", { name: "v2", exact: true })
            .click();
          await t.page.waitForURL((url) => normal(url.pathname) === current);
        }
        const doc = corpus.documents.find((doc) => doc.path === target);
        await search(t, name, queryFor(doc));
        const hit =
          name === "ui"
            ? t.page.getByRole("option").first()
            : t.page.locator('[data-docs-part="search"] a').first();
        await hit.filter({ hasText: doc.title }).waitFor();
        await hit.click();
        await t.page.waitForURL((url) => normal(url.pathname) === target);
        if (name === "ui") await t.page.getByRole("dialog").waitFor({ state: "hidden" });
        await t.page.getByRole("heading", { name: doc.title, exact: true }).waitFor();
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
  let appearance;
  if (activationBaseline) {
    let pairs = 0;
    for (const width of [1280, 390])
      for (const colorScheme of ["light", "dark"]) {
        const captures = [];
        for (const name of ["exactBefore", "exact"]) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            colorScheme,
            reducedMotion: "reduce",
          });
          try {
            const page = await context.newPage();
            await page.goto(servers[name].url.href);
            await page.evaluate(() => document.fonts.ready);
            await page.locator("main").scrollIntoViewIfNeeded();
            const reading = await page.screenshot({ caret: "hide", animations: "disabled" });
            await page.getByRole("searchbox").focus();
            assert.equal(await page.evaluate(() => Boolean(globalThis.exact?.state)), false);
            const focused = await page.screenshot({ caret: "hide", animations: "disabled" });
            captures.push([reading, focused]);
          } finally {
            await context.close();
          }
        }
        for (const [index, state] of ["reading", "focused"].entries()) {
          assert.ok(
            captures[0][index].equals(captures[1][index]),
            `CSS appearance changed: ${width}px ${colorScheme} ${state}`,
          );
          pairs++;
        }
      }
    appearance = {
      pairs,
      pixelIdentical: true,
      widths: [1280, 390],
      colorSchemes: ["light", "dark"],
      states: ["reading", "focused"],
    };
    console.log(`activation: ${pairs} pixel-identical before/after screenshots`);
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
        latencyMs,
        downloadBytesPerSecond,
        cpuSlowdown: 4,
        gzip: true,
        cacheDisabled: true,
        navigationFirst: process.env.FUMA_NAV_FIRST === "1",
        linkPrefetch: false,
        searchQuery: "Unique 16-hex token in a paragraph",
        fumadocsSearchDebounceMs: 100,
        matchedSearchDebounceMs: 0,
        uiDialogPreload: true,
      },
      buildTimes,
      appearance,
      outputs: Object.fromEntries(cases.map((name) => [name, outputs[name]])),
      results,
    };
    report.indexes = {};
    for (const name of cases) {
      const file = isExact(name)
        ? (await readdir(outputs[name])).find((file) => /^scope-0-/.test(file))
        : name === "matched"
          ? "_search/substring-0.js"
          : "_search/0.json";
      const bytes = await Bun.file(path.join(outputs[name], file)).bytes();
      report.indexes[name] = { file, raw: bytes.length, gzip: gzipSync(bytes).length };
    }
    report.reusedBuilds = process.env.FUMA_MEASURE_ONLY === "1";
    const reportFile = localActivation
      ? `${localLabel}-${fastActivation ? "fast" : "slow"}-results.json`
      : entryComparison
        ? fastActivation
          ? "entry-fast-results.json"
          : "entry-results.json"
        : fastActivation
          ? "activation-fast-results.json"
          : activationBaseline
            ? "activation-results.json"
            : "results.json";
    await Bun.write(path.join(cache, reportFile), JSON.stringify(report, null, 2));
    if (localActivation) console.log("Local activation experiment: production reports unchanged");
    else if (entryComparison && !fastActivation) await writeEntryReport(root, report);
    else if (activationBaseline && !fastActivation) await writeActivationReport(root, report);
    else if (!activationBaseline) await writeReport(root, report);
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
