import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
const root = path.resolve(import.meta.dirname, "../.."),
  read = async (file) => Bun.file(path.join(root, file)).json();
const build = await read(".cache/theme-performance/build.json"),
  cohorts = {
    slow: await read(".cache/fumadocs/theme-slow-results.json"),
    fast: await read(".cache/fumadocs/theme-fast-results.json"),
  };
const names = {
  exactHeadless: "Exact headless (standard build)",
  exactTheme: "Exact default Lenso theme",
  matched: "Fumadocs Core matched",
  matchedUi: "Fumadocs UI matched",
};
for (const r of Object.values(cohorts)) {
  assert.equal(r.conditions.runs, 5);
  assert.equal(r.conditions.pages, 300);
  assert.equal(r.conditions.navigationFirst, true);
  assert.equal(r.conditions.matchedSearchDebounceMs, 0);
  assert.equal(r.conditions.matchedUiSearchDebounceMs, 0);
  assert.deepEqual(r.outputs, build.outputs);
  for (const value of Object.values(r.results))
    assert.equal(value.median.firstNavigationDocumentRequests, 1);
}
async function asset(file) {
  const bytes = await Bun.file(file).bytes();
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
  };
}
const footprints = {},
  network = {};
for (const [name, out] of Object.entries(build.outputs)) {
  const html = await Bun.file(path.join(out, "index.html")).text(),
    files = { "index.html": await asset(path.join(out, "index.html")) };
  if (name.startsWith("exact"))
    for (const file of [
      "app.js",
      "style.css",
      ".gen/app.js",
      ".gen/rt.js",
      ".gen/main.js",
      ...(name === "exactTheme"
        ? [
            "modules/lenso-ui/web.css",
            "modules/lenso-ui/web.js",
            "modules/docs-theme/theme.css",
            "modules/index.js",
          ]
        : []),
    ])
      files[file] = await asset(path.join(out, file));
  footprints[name] = {
    activation: html.match(/data-activate="([^"]+)"/)?.[1] ?? "framework startup",
    files,
  };
  network[name] = await read(`.cache/fumadocs/theme-${name}-network.json`);
  const scripts = network[name].filter((record) => record.path.endsWith(".css"));
  for (const record of scripts)
    if (!files[record.path.slice(1)])
      files[record.path.slice(1)] = await asset(path.join(out, record.path.slice(1)));
}
// The source Markdown is unchanged; the counter is compiled into the existing content slot.
const originals = await read(".cache/scale/300/docs.json");
for (const page of originals.pages) {
  const expected = build.corpus.find((row) => row.path === page.path).sha256;
  for (const name of ["exactHeadless", "exactTheme"]) {
    const file = path.join(root, ".cache/theme-performance", name, page.source);
    assert.equal((await asset(file)).sha256, expected);
  }
}
const fumaPages = await read(".cache/theme-performance/matchedUi/data/pages.json");
assert.equal(fumaPages.length, 300);
for (const page of fumaPages)
  assert.equal(
    createHash("sha256").update(page.markdown).digest("hex"),
    build.corpus.find((row) => row.path === page.path).sha256,
  );
const sourceHashes = {};
for (const file of [
  "bench/fumadocs.mjs",
  "bench/theme/build.mjs",
  "bench/theme/search.jsx",
  "bench/theme/cold-check.mjs",
  "bench/theme/navigation-diagnostic.mjs",
  "src/delivery.ts",
  "src/web/navigation.ts",
  "src/theme.ts",
  "themes/lenso/layout.contract",
  "themes/lenso/styles.ts",
])
  sourceHashes[file] = await asset(path.join(root, file));
const diagnostic = await read(".cache/theme-performance/navigation-diagnostic.json"),
  cold = await read(".cache/theme-performance/cold-verification.json");
const receipt = {
  date: new Date().toISOString(),
  build,
  cohorts,
  footprints,
  network: { conditions: cohorts.fast.conditions, samples: network },
  diagnostic,
  cold,
  sourceHashes,
};
await Bun.write(
  path.join(import.meta.dirname, "results.json"),
  JSON.stringify(receipt, null, 2) + "\n",
);
const keys = {
  fcpMs: "FCP",
  firstBodyMs: "Article ready (FCP + two-frame observation)",
  firstNavigationMs: "Navigation as first interaction",
  coldOpenToNavigationMs: "Cold open to first destination",
  firstSearchMs: "First search action",
  coldOpenToSearchMs: "Cold open to first results",
  coldNavMs: "Uncached navigation after search/counter",
  backMs: "Back",
  initialScriptMs: "Initial script CPU",
  initialStyleMs: "Initial style recalculation",
  initialLayoutMs: "Initial layout",
  firstNavigationScriptMs: "First-navigation script CPU",
  firstNavigationTotalBytes: "Bytes through first navigation",
  initialBytes: "Bytes transferred at initial action gate",
  totalThroughSearchBytes: "Bytes through search (network idle)",
  jsThroughSearch: "Script bytes through search",
  coldNavBytes: "Additional bytes after activated navigation",
  firstNavigationDocumentRequests: "Document requests through first navigation",
};
function table(r) {
  return [
    "| Median metric | Exact headless | Exact Lenso | Fumadocs Core matched | Fumadocs UI matched |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...Object.entries(keys).map(
      ([key, label]) =>
        `| ${label} | ${Object.keys(names)
          .map((name) => Math.round(r.results[name].median[key] * 10) / 10)
          .join(" | ")} |`,
    ),
  ].join("\n");
}
const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const diagnostics = [];
for (const name of ["exactHeadless", "exactTheme", "matchedUi"])
  for (const phase of ["first", "warm"]) {
    const rows = diagnostic.samples.filter((row) => row.name === name && row.phase === phase);
    assert.equal(rows.length, 3);
    diagnostics.push(
      `| ${names[name]} / ${phase} | ${["elapsedMs", "scriptMs", "styleMs", "layoutMs", "addedElements", "removedElements"].map((key) => Math.round(median(rows.map((row) => row[key])) * 10) / 10).join(" | ")} |`,
    );
  }
const css = footprints.exactTheme.files["modules/lenso-ui/web.css"],
  adapter = footprints.exactTheme.files["modules/lenso-ui/web.js"];
const doc = `# Default-theme performance acceptance

Measured November 12, 2026 (Asia/Shanghai). This is a measurement of the real default Lenso Web theme and ordinary Exact builds, with a same-algorithm Fumadocs Core and UI comparison. Both headless and themed Exact keep one application root. No theme CSS, Glass renderer, controller or default interaction was removed for timing.

## Comparable builds and actions

300 URLs, two languages × two versions × 75 pages, 24 paragraphs plus a code block per page. Original Markdown hashes are equal between both Exact projects and the source corpus. Fumadocs Core reuses the previous frozen matched output; Fumadocs UI is built from the same stored page data and public substring indexes. Its normal DocsLayout, DocsPage and SearchDialog parts remain in use, with only the search adapter changed to the same zero-debounce scoped substring algorithm. Exact uses its existing native source/resource query, not a browser-side replacement.

The default layout is unmodified. A small benchmark-only compiler-entry shim inserts a plain root counter into its existing article slot; the headless fixture retains the preceding counter layout. Counters are root state in all cases and must remain 1 across navigation, Back and language/version changes. The benchmark control's position is not identical across layouts; counter latency is retained in raw data but is not a primary ranking here. No Markdown or search text was altered to insert the control.

Exact headless and Exact Lenso are rebuilt with the same initialized stock SDK. These are standard production builds, not the preceding opt-in lexical-owner/projection transform. That transform's earlier numbers are not a before/after baseline for this theme: its support boundary does not cover these theme controls. The common single-application constraint and the headless option remain intact.

Each implementation/action has five fresh browser contexts, alternating case order, Chromium, gzip, disabled browser cache and 4× CPU slowdown. First navigation is measured separately as the first action. First search includes opening Fumadocs UI's dialog; Exact's search field is inline. Fumadocs initializes its client before the action; native Exact activation follows the SDK policy (headless: ${footprints.exactHeadless.activation}; Lenso: ${footprints.exactTheme.activation}). Cold-open totals expose that scheduling difference.

FCP is the browser paint entry. Article readiness requires the heading and unique code/body marker, observed over two animation frames, and is clamped to at least FCP. It is a visible-content readiness proxy, not LCP, a filmstrip or proof that all progressive Glass enhancement has finished. Initial action timing begins after page load and this content gate, without waiting for network idle. Bytes include received partial response data; full through-search bytes are sampled after network idle. Script/style/layout values are browser Performance counters and are not interchangeable with elapsed action time.

## Slow connection

80 ms latency, 200,000 bytes/s download; all durations below are milliseconds, transfer sizes are encoded HTTP bytes.

${table(cohorts.slow)}

## Fast connection

No additional latency, 10,000,000 bytes/s; still 4× CPU slowdown.

${table(cohorts.fast)}

## What adds the cost

The shipped component stylesheet is ${css.raw} raw / ${css.gzip} gzip bytes. The separate theme stylesheet is ${footprints.exactTheme.files["modules/docs-theme/theme.css"].gzip} gzip bytes. The UI Web adapter entry alone is ${adapter.gzip} gzip bytes; it also imports presentation and supporting modules, so that entry is not the entire adapter footprint. All requested assets and their actual transfer sizes are retained in the fast network snapshots.

In the slow cohort the theme's initial style-recalculation median is ${cohorts.slow.results.exactTheme.median.initialStyleMs} ms versus ${cohorts.slow.results.exactHeadless.median.initialStyleMs} ms headless; its initial script median is ${cohorts.slow.results.exactTheme.median.initialScriptMs} ms. The fast cohort still exhibits high style cost, so bandwidth alone cannot explain the regression. The default adapter currently stages the complete component stylesheet/registry; neither is selected by the components actually used in these pages.

## Bounded navigation diagnostic

A separate three-sample fast-connection diagnostic records first navigation and a subsequent uncached navigation after network idle. It adds a DOM observer and is not part of the five-run medians. Added/removed counts are unique element identities seen in mutation records. Script/style/layout durations are counter deltas around the action; they are not a flamegraph or proof of one exact selector/function. “Warm” means the application/adapter is initialized, not that the target page body is cached.

| Case / phase | Elapsed ms | Script ms | Style ms | Layout ms | Added elements | Removed elements |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${diagnostics.join("\n")}

The observer also records header identity, adapter transfer/readiness and root identity. A retained root does not imply a retained theme subtree: the current native route renders a new layout tree. The measured node churn and style recalculation identify the integration layer as the next optimization target. They do not prove that every millisecond comes from CSS size alone. A bounded next candidate would select component CSS/adapter code by use and reduce repeated style application/forced recalculation while preserving native interaction ownership; it requires its own visual and behavior acceptance.

## Single-app correctness fixed before timing

The preflight exposed a real first-link problem in the ordinary build: the SDK's lazy capture ignores anchors, and its normal control replay happens inside mount before router installation. A first click could either reload the document or be replayed too early. The framework now holds only declared same-origin document links separately until both module loading and native startup settle, then replays against the current native link. It coalesces pending plain navigation intents and keeps native control input in the SDK queue. The link capture itself starts the app only on an eligible click; the theme retains the SDK’s existing eager activation policy. Modified, download, external, same-page and custom-press links retain their existing handling. This is a common correctness fix for both Exact variants, not a special themed benchmark shortcut.

Chromium/WebKit held-entry checks passed for both Exact variants: latest pending link wins, a queued counter click survives, subsequent navigation retains every root slot and only one document is requested. The five-run cohorts also assert native root-slot identity after navigation/Back, persistent counter values, one current-scope search index, no search database on navigation/counter-only paths, no route prefetch and language/version/deep-link behavior. First navigation is one document in all four cases.

The new route script has a standalone-serialization/HTML escaping test. Formatting, lint, type checks and 18 documentation unit tests pass. The theme's previous desktop/mobile/keyboard acceptance is recorded separately; this run does not replace native macOS/iOS qualification or a broad device study.

## Acceptance decision

The current theme is functionally working but does not meet a strong performance gate. Compare both action and cold-open totals: a short search action does not compensate for a late first screen. Preserve headless and the single root; prioritize the stylesheet/adapter and style-update behavior before another small app.js size reduction. No UI library source or theme presentation was changed by this measurement.

Full samples, build paths/conditions, corpus and generated-asset hashes, frozen source hashes, the fast network snapshots, diagnostic observations and cold-navigation receipts are in [results.json](bench/theme/results.json). No deployment or publication is included.

## Reproduce

From experiments/exact-docs with the initialized SDK, built workspace UI assets and the previous Fumadocs matched fixture available:

\`\`\`sh
EXACT_ROOT=/path/to/exact bun bench/theme/build.mjs
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/theme/cold-check.mjs
FUMA_THEME_MANIFEST="$PWD/.cache/theme-performance/build.json" FUMA_MEASURE_ONLY=1 FUMA_NAV_FIRST=1 PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat with FUMA_ACTIVATION_FAST=1 for the fast cohort.
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/theme/navigation-diagnostic.mjs
bun bench/theme/report.mjs
\`\`\`
`;
await Bun.write(path.join(root, "THEME_PERFORMANCE.md"), doc);
console.log("Wrote default-theme comparison and measured receipts");
