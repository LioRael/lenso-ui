import assert from "node:assert/strict";
import { cp, mkdir, readdir, rm, symlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { buildSite, navigationGroups } from "../src/index.ts";
import { renderHtml } from "../src/renderers/html.ts";
import { choices, sameScope } from "../src/variants.ts";
import { staticResponse } from "../src/server.ts";

const root = path.resolve(import.meta.dirname, ".."),
  cache = path.join(root, ".cache/comparison");
const source = path.join(root, ".cache/scale/300"),
  exact = path.join(cache, "exact"),
  astro = path.join(cache, "astro");
const dependencies = path.join(root, "bench/astro/node_modules");
const runs = Number(process.env.PERF_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1 || runs > 10) throw Error("PERF_RUNS must be 1..10");
if (!(await Bun.file(path.join(source, "docs.json")).exists()))
  throw Error(
    "Generate the 300-page fixture with SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale first",
  );
if (!(await Bun.file(path.join(dependencies, "astro/bin/astro.mjs")).exists()))
  throw Error("Install the isolated bench/astro dependencies from its lockfile first");
await rm(cache, { recursive: true, force: true });
await mkdir(cache, { recursive: true });
await cp(source, exact, {
  recursive: true,
  filter: (file) =>
    !path
      .relative(source, file)
      .split(path.sep)
      .some((part) => part.startsWith(".") || part === "dist"),
});
const config = await Bun.file(path.join(exact, "docs.json")).json();
assert.equal(config.pages.length, 300);
config.name = "Documentation comparison";
config.root = { source: "comparison-root.contract" };
config.layout = { source: "comparison-layout.contract", component: "ComparisonLayout" };
await Bun.write(path.join(exact, "docs.json"), JSON.stringify(config));
await Bun.write(
  path.join(exact, "comparison-root.contract"),
  "state comparisonCount = 0\naction comparisonIncrement\n  comparisonCount = comparisonCount + 1\nprovide\n  comparisonCount\n  comparisonIncrement\n",
);
await Bun.write(
  path.join(exact, "comparison-layout.contract"),
  await Bun.file(path.join(root, "bench/comparison/exact-layout.contract")).text(),
);
const started = performance.now(),
  built = await buildSite(exact),
  exactBuildMs = Math.round(performance.now() - started);
await mkdir(path.join(astro, "src/pages"), { recursive: true });
await symlink(dependencies, path.join(astro, "node_modules"), "dir");
await Bun.write(
  path.join(astro, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies: { astro: "7.4.8" } }),
);
await cp(
  path.join(root, "bench/comparison/page.astro"),
  path.join(astro, "src/pages/[...slug].astro"),
);
await cp(path.join(root, "bench/comparison/client.ts"), path.join(astro, "src/client.ts"));
const scopes = [
  ...new Map(
    built.site.documents.map((doc) => [JSON.stringify([doc.locale, doc.version]), doc]),
  ).entries(),
];
const searchBranches = [];
for (const [index, [scope, key]] of scopes.entries()) {
  const data = built.site.documents
    .filter((doc) => sameScope(doc, key) && doc.search !== false)
    .map((doc) => ({ title: doc.title, href: doc.path, text: doc.text.toLowerCase() }));
  await Bun.write(
    path.join(astro, `src/search-scope-${index}.ts`),
    `export default ${JSON.stringify(data)};`,
  );
  searchBranches.push(
    `if(scope===${JSON.stringify(scope)}) index=(await import('./search-scope-${index}')).default;`,
  );
}
await Bun.write(
  path.join(astro, "src/search-scopes.ts"),
  `export async function search(scope:string,query:string){let index:{title:string;href:string;text:string}[]=[];${searchBranches.join("\n")}return index.filter(item=>item.text.includes(query)).map(({title,href})=>({title,href}));}`,
);
const pages = built.site.documents.map((doc) => {
  const scoped = built.site.documents.filter(
      (other) => sameScope(other, doc) && other.nav !== false,
    ),
    index = scoped.indexOf(doc);
  const link = (other) => (other ? { title: other.title, href: other.path } : null);
  return {
    path: doc.path,
    title: doc.title,
    locale: doc.locale,
    version: doc.version,
    scope: JSON.stringify([doc.locale, doc.version]),
    description: doc.description ?? "",
    markdown: doc.markdown,
    markdownUrl: `/_docs/markdown${doc.path === "/" ? "" : doc.path}/index.md`,
    html: renderHtml(doc.body),
    toc: doc.headings,
    groups: navigationGroups(scoped),
    previous: link(scoped[index - 1]),
    next: link(scoped[index + 1]),
    locales: choices(built.site.documents, doc, "locale", built.site.config.locales),
    versions: choices(built.site.documents, doc, "version", built.site.config.versions),
  };
});
await Bun.write(path.join(astro, ".cache/pages.json"), JSON.stringify(pages));
const baseline = process.env.EXACT_BASELINE_DIR;
if (baseline && !(await Bun.file(path.join(baseline, "app.js")).exists()))
  throw Error("EXACT_BASELINE_DIR must contain the saved comparison fixture output");
const outputs = { ...(baseline ? { exactBefore: path.resolve(baseline) } : {}), exact: built.out },
  buildTimes = { exact: exactBuildMs };
for (const [name, client] of [
  ["astroStatic", false],
  ["astroRouter", true],
]) {
  const started = performance.now();
  const child = Bun.spawn(
    ["node", path.join(dependencies, "astro/bin/astro.mjs"), "build", "--outDir", `dist-${name}`],
    {
      cwd: astro,
      env: {
        ...process.env,
        COMPARE_CLIENT_ROUTER: client ? "1" : "0",
        ASTRO_TELEMETRY_DISABLED: "1",
        CI: "true",
      },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await child.exited) !== 0) throw Error(`Astro ${name} build failed`);
  const out = path.join(astro, `dist-${name}`);
  outputs[name] = out;
  buildTimes[name] = Math.round(performance.now() - started);
  for (const page of pages)
    await Bun.write(path.join(out, page.markdownUrl.slice(1)), page.markdown);
}
function serve(directory) {
  const cache = new Map();
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const key = new URL(request.url).pathname;
      if (!cache.has(key)) {
        const response = await staticResponse(request, directory),
          headers = new Headers(response.headers),
          raw = Buffer.from(await response.arrayBuffer()),
          compress = /^(text\/|application\/(javascript|json))/.test(
            headers.get("content-type") ?? "",
          );
        if (compress) headers.set("content-encoding", "gzip");
        headers.delete("content-length");
        headers.set("cache-control", "no-store");
        cache.set(key, { body: compress ? gzipSync(raw) : raw, headers, status: response.status });
      }
      const entry = cache.get(key);
      return new Response(entry.body, entry);
    },
  });
}
const servers = Object.fromEntries(
  Object.entries(outputs).map(([name, out]) => [name, serve(out)]),
);
const require = createRequire(new URL("../../../apps/docs/package.json", import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch(),
  results = {};
async function setup(server) {
  const context = await browser.newContext({ reducedMotion: "reduce" }),
    page = await context.newPage(),
    cdp = await context.newCDPSession(page),
    errors = [],
    requests = [];
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
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("request", (request) =>
    requests.push({ path: new URL(request.url()).pathname, type: request.resourceType() }),
  );
  let goal;
  await page.exposeBinding("__comparisonPaint", (_source, event) => {
    if (goal && goal.test(event)) {
      goal.resolve(event);
      goal = undefined;
    }
  });
  await page.addInitScript(() => {
    const last = new Map();
    const check = () => {
      const heading = document.querySelector("main h1")?.textContent;
      const counter = document.querySelector('[data-testid="comparison-counter"]')?.textContent;
      const links = [...document.querySelectorAll('[data-docs-part="search"] a')].map((link) => ({
        href: link.getAttribute("href"),
        title: link.textContent,
      }));
      for (const [type, value] of [
        ["heading", heading],
        ["counter", counter],
        ["search", links.length ? JSON.stringify(links) : undefined],
      ]) {
        if (!value) continue;
        const key = location.pathname + "\0" + value;
        if (last.get(type) === key) continue;
        last.set(type, key);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (last.get(type) === key)
              window.__comparisonPaint({
                type,
                value,
                path: location.pathname,
                epoch: performance.timeOrigin + performance.now(),
              });
          }),
        );
      }
    };
    new MutationObserver(check).observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  await page.goto(server.url.href, { waitUntil: "load" });
  await page.getByRole("heading", { name: "Guide 000", exact: true }).waitFor();
  await page.waitForFunction(
    () => performance.getEntriesByName("first-contentful-paint").length > 0,
  );
  const fcp = await page.evaluate(
    () => performance.getEntriesByName("first-contentful-paint")[0].startTime,
  );
  const measure = async (test, action) => {
    let timer;
    const event = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        goal = undefined;
        reject(Error(`Paint goal timed out at ${page.url()}`));
      }, 30000);
      goal = { test, resolve };
    });
    const start = await page.evaluate(() => performance.timeOrigin + performance.now());
    try {
      await action();
      const result = await event;
      return Math.round((result.epoch - start) * 10) / 10;
    } finally {
      clearTimeout(timer);
    }
  };
  return { context, page, cdp, errors, requests, fcp, bytes: () => bytes, measure };
}
try {
  const sampleSets = Object.fromEntries(Object.keys(servers).map((name) => [name, []]));
  for (let run = 0; run < runs; run++) {
    const order = Object.entries(servers);
    if (run % 2) order.reverse();
    for (const [name, server] of order) {
      const samples = sampleSets[name];
      const t = await setup(server);
      try {
        assert.equal(
          t.requests.some(
            (request) =>
              request.path.includes("search-scope-") || /^\/scope-\d+-/.test(request.path),
          ),
          false,
        );
        const initialBytes = t.bytes(),
          metrics = Object.fromEntries(
            (await t.cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
              name,
              value,
            ]),
          );
        const firstSearchMs = await t.measure(
          (event) =>
            event.type === "search" && event.path === "/" && JSON.parse(event.value).length === 1,
          () =>
            t.page
              .getByRole("searchbox", { name: "Search documentation" })
              .fill("acceptance-target-000"),
        );
        assert.deepEqual(
          await t.page
            .locator('[data-docs-part="search"] a')
            .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
          ["/"],
        );
        const afterMetrics = Object.fromEntries(
          (await t.cdp.send("Performance.getMetrics")).metrics.map(({ name, value }) => [
            name,
            value,
          ]),
        );
        await t.page.waitForLoadState("networkidle");
        const firstSearchBytes = t.bytes() - initialBytes;
        const repeatSearchMs = await t.measure(
          (event) =>
            event.type === "search" &&
            JSON.parse(event.value).some((link) => link.title === "Guide 001"),
          () =>
            t.page
              .getByRole("searchbox", { name: "Search documentation" })
              .fill("acceptance-target-001"),
        );
        assert.deepEqual(
          await t.page
            .locator('[data-docs-part="search"] a')
            .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
          ["/guide-001"],
        );
        await t.page.waitForLoadState("networkidle");
        const repeatBytes = t.bytes() - initialBytes - firstSearchBytes;
        await t.page.getByTestId("comparison-counter").click();
        await t.page.getByTestId("comparison-counter").filter({ hasText: "Count: 1" }).waitFor();
        assert.equal(
          t.requests.some((request) => request.path === "/guide-001"),
          false,
        );
        const beforeNav = t.bytes();
        const coldNavMs = await t.measure(
          (event) =>
            event.type === "heading" && event.path === "/guide-001" && event.value === "Guide 001",
          () =>
            t.page
              .getByRole("navigation", { name: "Documentation", exact: true })
              .getByRole("link", { name: "Guide 001", exact: true })
              .click(),
        );
        await t.page.waitForLoadState("networkidle");
        const coldNavBytes = t.bytes() - beforeNav;
        const counterAfterNav = await t.page.getByTestId("comparison-counter").textContent();
        assert.equal(counterAfterNav, name === "astroStatic" ? "Count: 0" : "Count: 1");
        const beforeBack = t.bytes();
        const backMs = await t.measure(
          (event) => event.type === "heading" && event.path === "/" && event.value === "Guide 000",
          () => t.page.goBack(),
        );
        await t.page.waitForLoadState("networkidle");
        const backBytes = t.bytes() - beforeBack;
        assert.equal(
          await t.page.getByTestId("comparison-counter").textContent(),
          name === "astroStatic" ? "Count: 0" : "Count: 1",
        );
        assert.deepEqual(t.errors, []);
        const sample = {
          fcpMs: t.fcp,
          initialBytes,
          firstSearchMs,
          firstSearchBytes,
          scriptMs: Math.round((afterMetrics.ScriptDuration - metrics.ScriptDuration) * 10000) / 10,
          repeatSearchMs,
          repeatBytes,
          coldNavMs,
          coldNavBytes,
          backMs,
          backBytes,
          counterAfterNav,
          documentRequests: t.requests.filter((request) => request.type === "document").length,
        };
        samples.push(sample);
        console.log(`${name} ${run + 1}: ${JSON.stringify(sample)}`);
      } finally {
        await t.context.close();
      }
      const tCounter = await setup(server);
      try {
        const before = tCounter.bytes();
        const counterMs = await tCounter.measure(
          (event) => event.type === "counter" && event.value === "Count: 1",
          () => tCounter.page.getByTestId("comparison-counter").click(),
        );
        await tCounter.page.waitForLoadState("networkidle");
        Object.assign(samples.at(-1), {
          firstCounterMs: counterMs,
          firstCounterBytes: tCounter.bytes() - before,
        });
        assert.deepEqual(tCounter.errors, []);
      } finally {
        await tCounter.context.close();
      }
    }
  }
  for (const [name, samples] of Object.entries(sampleSets)) {
    const median = (key) => {
      const values = samples.map((sample) => sample[key]).toSorted((a, b) => a - b);
      return values[Math.floor(values.length / 2)];
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
  const entries = {};
  for (const name of baseline ? ["exactBefore", "exact"] : ["exact"]) {
    const app = await Bun.file(path.join(outputs[name], "app.js")).bytes();
    const generated = await Bun.file(path.join(outputs[name], ".gen/app.js")).bytes();
    const input = (await readdir(outputs[name])).find((file) =>
      /^input-glue-[\w-]+\.js$/.test(file),
    );
    assert.ok(input, "The fixture must contain its native input bridge");
    entries[name] = {
      raw: app.length,
      gzip: gzipSync(app).length,
      generatedRaw: generated.length,
      generatedGzip: gzipSync(generated).length,
      inputGzip: gzipSync(await Bun.file(path.join(outputs[name], input)).bytes()).length,
      styleGzip: gzipSync(await Bun.file(path.join(outputs[name], "style.css")).bytes()).length,
    };
  }
  const report = {
    date: new Date().toISOString(),
    versions: {
      bun: Bun.version,
      chromium: browser.version(),
      astro: (await Bun.file(path.join(dependencies, "astro/package.json")).json()).version,
    },
    conditions: {
      runs,
      pages: 300,
      locales: 2,
      versions: 2,
      paragraphsPerPage: 24,
      latencyMs: 80,
      downloadBytesPerSecond: 200000,
      cpuSlowdown: 4,
      gzip: true,
      cacheDisabled: true,
    },
    buildTimes,
    entries,
    results,
  };
  await Bun.write(path.join(cache, "results.json"), JSON.stringify(report, null, 2));
  const metrics = [
    ["fcpMs", "First contentful paint (ms)"],
    ["initialBytes", "Transfer before interaction (bytes)"],
    ["firstSearchMs", "First search rendered (ms)"],
    ["firstSearchBytes", "Additional first-search transfer (bytes)"],
    ["scriptMs", "Script during first search (ms)"],
    ["repeatSearchMs", "Repeat search rendered (ms)"],
    ["repeatBytes", "Additional repeat-search transfer (bytes)"],
    ["firstCounterMs", "First counter interaction (ms)"],
    ["firstCounterBytes", "Additional first-counter transfer (bytes)"],
    ["coldNavMs", "Cold destination body ready (ms)"],
    ["coldNavBytes", "Additional cold-navigation transfer (bytes)"],
    ["backMs", "Back body ready (ms)"],
    ["backBytes", "Additional Back transfer (bytes)"],
  ];
  const rows = metrics
    .map(
      ([key, label]) =>
        `| ${label} | ${baseline ? `${results.exactBefore.median[key]} | ` : ""}${results.exact.median[key]} | ${results.astroStatic.median[key]} | ${results.astroRouter.median[key]} |`,
    )
    .join("\n");
  await Bun.write(
    path.join(root, "ASTRO_COMPARISON.md"),
    `# 300-page Astro comparison\n\nMeasured ${report.date}. Astro ${report.versions.astro}, Bun ${report.versions.bun}, Chromium ${report.versions.chromium}.\n\nSame 300 authored URLs: English/Chinese × v2/v1 × 75 topics, 24 paragraphs and one code block per page. Both render the same document IR and build-time syntax tokens. Both expose grouped scope navigation, language/version links, TOC, pagination, descriptions, raw-source actions, lazily imported per-scope substring search and a counter. Exact uses its normal page-data compiler plus a fixture-only root counter/layout; Astro uses semantic HTML, a small vanilla client script, and optionally its official ClientRouter with a persisted counter element. Neither product styling nor Exact's default theme is changed.\n\nValues are medians of ${runs} fresh-context runs, interleaved across implementations with reversed order on alternate rounds: gzip delivery from the same Bun static server, cache disabled, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown. Animations are disabled/reduced; link prefetch is explicitly disabled. No reading delay or idle application warmup is inserted. Search/counter trials start separately in fresh contexts. Render timing comes from observed DOM changes and two animation frames, reported through a binding that survives full-page navigation; it excludes locator-polling overshoot. Destination body readiness does not measure theme layout or viewport-specific meaningful paint.\n\n| Metric | ${baseline ? "Exact before | " : ""}Exact Docs | Astro static navigation | Astro ClientRouter |\n| --- | ${baseline ? "---: | " : ""}---: | ---: | ---: |\n${rows}\n\n## State and functional checks\n\nThe forward-navigation counter is ${results.exact.samples[0].counterAfterNav} for Exact, ${results.astroStatic.samples[0].counterAfterNav} for static Astro, and ${results.astroRouter.samples[0].counterAfterNav} for ClientRouter. Static Astro replaces the document; its counter resets on the destination. ClientRouter uses \`transition:persist\` and keeps its counter's memory; Exact retains its root state. These observations are asserted, not inferred from framework names. Each search returns only its scope, repeat search changes the result, counter changes once, destination/Back headings match, and uncaught browser errors fail the harness.\n\n## Shared entry\n\n${baseline ? `The saved pre-change output is served unchanged in this run, without rebuilding it. Shared app.js raw/gzip bytes: ${entries.exactBefore.raw}/${entries.exactBefore.gzip} before, ${entries.exact.raw}/${entries.exact.gzip} after. Generated native application code before bundling: ${entries.exactBefore.generatedRaw} → ${entries.exact.generatedRaw} raw bytes (${entries.exactBefore.generatedGzip} → ${entries.exact.generatedGzip} independently gzipped). Those generated-file gzip values are diagnostic and not additive portions of the final entry.` : `Shared app.js is ${entries.exact.raw} raw bytes, ${entries.exact.gzip} gzip bytes.`} TOC, descriptions, canonical/robots/alternate SEO and locale/version counterpart choices now travel in the same lazy module as each page body, including custom Exact pages. Initial activation reuses the checkpoint; no new metadata request is added. Adjacent links also travel with page data. Route identity, shared scope navigation/language/version settings, layouts, templates and root state remain in the single application. On a nonempty search input, the current scope module starts loading alongside activation with a low-priority module script; Exact owns the resulting search resource and state. See [SEARCH_STARTUP.md](SEARCH_STARTUP.md) for this loading change, [ROUTING_STARTUP.md](ROUTING_STARTUP.md) for route/scope extraction and [STARTUP.md](STARTUP.md) for the earlier metadata stage.\n\n## Limits\n\nThis is a controlled reading/search/state fixture, not Starlight or a comparison of complete documentation products. Exact additionally carries its typed resource/mutation/task model and native control/runtime contracts. The Astro client only implements the stated controls; it does not reproduce those systems. Generated DOM and host CSS differ, despite approximately aligned benchmark typography. Both retain pre-rendered body HTML. Static versus client routing is shown separately because navigation and state semantics differ. No conclusion about general Astro parity, native targets, real devices or future Lenso UI appearance follows from these samples.\n\nAstro receives HTML rendered from the common parsed/highlighted IR, so the recorded build durations are not comparable end-to-end Markdown pipeline timings and are excluded from the table. Runtime samples and build details are in [.cache/comparison/results.json](.cache/comparison/results.json). Build dependencies are isolated under bench/astro and pinned by its lockfile.\n\n## Reproduce\n\nWith the Exact/Playwright setup documented in README, generate the corpus first if absent: \`SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale\`. Install bench/astro from its existing frozen lockfile, then run \`bun run test:compare\`. \`PERF_RUNS\` accepts 1–10 (default 3). \`EXACT_BASELINE_DIR\` optionally points to an unchanged output of this same fixture saved before compiler changes; it must be outside .cache/comparison. The harness creates disposable comparison projects under .cache/comparison and does not edit the source corpus or product example.\n\nAstro navigation and persistence are configured according to its [official view-transitions documentation](https://docs.astro.build/en/guides/view-transitions/).\n`,
  );
} finally {
  await browser.close();
  for (const server of Object.values(servers)) await server.stop(true);
}
