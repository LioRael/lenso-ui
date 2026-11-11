import path from "node:path";
const rounded = (n) => Math.round(n * 10) / 10;
export async function writeReport(root, report) {
  const names = ["exact", "headless", "matched", "ui"];
  const row = (label, key, bytes = false) =>
    `| ${label} | ${names
      .map((name) => {
        const value = report.results[name].median[key];
        if (
          bytes &&
          key === "coldNavBytes" &&
          report.results[name].samples.some((sample) => sample.cancelledResponses > 0)
        )
          return `≥ ${(value / 1000).toFixed(1)}`;
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

All four increment the fixture counter once, retain Count: 1 on forward navigation and browser Back, and use only one document during the timed navigation. Search-result selection must navigate to a different correct page in both versions and retain the counter; UI selection must also close its dialog. All four reuse exactly one current-scope index for repeated queries; a fresh counter-only context loads no search database. A separate acceptance pass verifies Chinese/archived deep links, English language switching, current-version switching, correct scoped body-query results, and preservation of the root counter through those changes. Uncaught page errors fail the harness. Validated screenshots are in .cache/fumadocs/*-validated.png.

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
