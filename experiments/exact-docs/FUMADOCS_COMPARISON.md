# 300-page Fumadocs comparison

Measured 2026-11-11T10:15:43.936Z. Fumadocs Core/UI 16.18.4, Next.js 16.4.6 (production Webpack build, static export), React 19.3.1, Tailwind 4.3.5, Bun 1.4.4, Chromium 156.0.8078.4.

This compares the current headless Exact framework with two Fumadocs Core integrations and Fumadocs UI. It does not change the Exact default theme. The same 300 authored URLs are English/Chinese × v2/v1 × 75 topics, with 24 paragraphs and one code block per page. Both use the same parsed document IR, HTML body and build-time syntax tokens; Fumadocs uses the documented [custom source API](https://www.fumadocs.dev/docs/headless/source-api/source). This deliberately excludes an end-to-end MDX/Markdown compilation-throughput comparison.

## What is measured

- **Exact Docs:** one root Exact application, its current body/metadata splitting and intent-triggered startup, its lazy per-scope substring search with no debounce, and the same fixture root counter/layout used by the Astro comparison.
- **Core, native search:** Next App Router, the real Fumadocs Source loader and TOC provider, a minimal unstyled layout, and Fumadocs' native advanced static search through useStaticSearch. The native engine is ZBSearch in this pinned version; the historical orama-static import name remains in its public API. Its default 100 ms debounce and page/section/text results are preserved.
- **Core, matched search:** the identical minimal Next/Fumadocs layout, using the public experimental_useSearch hook with a custom lazy substring adapter. It has the same normalized title/body text and 75-page data scope as Exact and delayMs=0. This is a controlled adapter, not a claim about Fumadocs' default search.
- **UI, native search:** the real RootProvider, DocsLayout, sidebar, DocsPage, breadcrumb, TOC, footer and default search dialog, with the neutral default Fumadocs theme. The default dialog-code preload and 100 ms debounce remain enabled. The fixture supplies scope links and keys the default dialog by its index API URL so version changes refresh its client. It does not replace the native search engine or dialog results.

Fumadocs' [static search configuration](https://www.fumadocs.dev/docs/headless/search/orama) exports a browser-side database. To align scope, this fixture builds four databases via createSearchAPI/staticGET, each containing only 75 pages, rather than asking Fumadocs to download all 300 pages. The matched adapter and Exact also load only their current scope. All searches are local; no hosted search API is involved. Queries are the same unique 16-hex marker in each target paragraph, not a title-only lookup or a shared word. Native server checks and actual client navigation verify the correct target.

Values are medians of 5 fresh-context trials, interleaved across all four implementations with reversed order on alternate rounds. The same Bun static server uses gzip, no-store delivery, cache disabled, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown. Viewport is 1280×900; motion is reduced. Route prefetch is disabled and checked. No reading delay, idle warmup or network-idle wait is inserted before the first action. One Chromium process hosts separate contexts; this is not a new browser-process/device boot for every sample.

The action clock begins after initial load/FCP observation. Since Next downloads and hydrates its client before interaction while Exact defers its application, action latency alone is incomplete. The tables also include elapsed time before that action, total navigation-start-to-result time, and cumulative transfer. UI search includes opening the default dialog; the headless inputs are inline. Render measurements observe real DOM changes and two animation frames through a binding, including across navigation, rather than locator-polling completion. These are body/result readiness measures, not pixel parity, equal viewport composition or a meaningful-paint score for the default theme.

## Timings

| Metric                                      | Exact Docs | Fumadocs Core, native search | Fumadocs Core, matched search | Fumadocs UI, native search |
| ------------------------------------------- | ---------: | ---------------------------: | ----------------------------: | -------------------------: |
| First contentful paint, ms                  |        232 |                          292 |                           288 |                        996 |
| Elapsed before first action, ms             |      326.5 |                       1476.7 |                        1281.2 |                     1723.6 |
| First search action to result, ms           |      956.6 |                       2160.7 |                           427 |                     3120.1 |
| Cold navigation start to search result, ms  |     1292.8 |                       3617.3 |                        1713.3 |                     4831.1 |
| Repeat search, ms                           |       42.1 |                        133.8 |                          46.1 |                      155.6 |
| First counter action, ms                    |      828.6 |                         85.5 |                          82.8 |                      184.8 |
| Cold navigation start to counter result, ms |     1125.4 |                       1529.5 |                        1346.9 |                     1925.9 |
| Cold destination body ready, ms             |      218.3 |                        212.3 |                           195 |                      256.5 |
| Back body ready, ms                         |       48.5 |                         28.8 |                          33.3 |                       54.3 |
| Script before first action, ms              |       10.7 |                        181.7 |                         175.5 |                      165.8 |
| Script during first search, ms              |       37.3 |                         23.7 |                          20.6 |                      168.1 |

## Transfer

KB means decimal 1,000 bytes. Wire measurements include response headers and reflect exactly the requests in each fresh context, not the sum of every emitted chunk. Exact's search data is JavaScript while the native Fumadocs databases are JSON, so script-only transfer should be read alongside total transfer.

| Metric                                | Exact Docs | Fumadocs Core, native search | Fumadocs Core, matched search | Fumadocs UI, native search |
| ------------------------------------- | ---------: | ---------------------------: | ----------------------------: | -------------------------: |
| Before first action, KB               |       11.8 |                        192.6 |                         156.1 |                      249.4 |
| JavaScript before first action, KB    |        1.4 |                        186.0 |                         149.5 |                      211.5 |
| Additional first search, KB           |      141.0 |                        347.9 |                          52.7 |                      397.6 |
| Total through first search, KB        |      152.8 |                        540.5 |                         208.8 |                      647.0 |
| Search index wire transfer, KB        |       28.0 |                        323.2 |                          28.0 |                      323.2 |
| Additional repeat search, KB          |        0.0 |                          0.0 |                           0.0 |                        0.0 |
| Additional first counter, KB          |      113.0 |                          0.0 |                           0.0 |                       49.8 |
| Additional destination navigation, KB |        1.8 |                          4.4 |                           0.0 |                        0.0 |
| Additional Back, KB                   |        0.0 |                          0.0 |                           0.0 |                        0.0 |

The first English/current-version index payloads, excluding response headers:

| Fixture  | Raw bytes | Gzip bytes |
| -------- | --------: | ---------: |
| exact    |    404711 |      27790 |
| headless |   2734908 |     323030 |
| matched  |    407999 |      27859 |
| ui       |   2734908 |     323030 |

Native structured full-text indexing and plain substring matching have different processing, result and corpus semantics. The matched-search column controls that difference and the debounce. It still includes the actual React/Next runtime, Fumadocs hook/result parsing and TOC behavior. No single result here establishes that one framework is generally faster.

## State and acceptance

All four increment the fixture counter once, retain Count: 1 on forward navigation and browser Back, and use only one document during the timed navigation. All four reuse exactly one current-scope index for repeated queries; a fresh counter-only context loads no search database. A separate acceptance pass verifies Chinese/archived deep links, English language switching, current-version switching, correct scoped body-query results, and preservation of the root counter through those changes. Uncaught page errors fail the harness. Validated screenshots are in .cache/fumadocs/*-validated.png.

The persistent React counter lives in the common root layout; it is an explicit fixture integration. The language/version Source adapters, scope controls and counter are authored for this corpus, not evidence that either framework has identical configuration APIs. The dialog's query can reset on scope change; only the stated root counter persistence is asserted. The fixture does not reproduce Exact's resource/mutation/task systems, arbitrary custom-page code, or native AppKit/UIKit hosts.

This run built all four production outputs from the fixture sources before timing. Build durations are excluded because common IR/highlighting, search-index generation, SDK compilation and Next builds are different pipelines. Source/lockfiles and generated-data adapters live under bench/fumadocs; generated projects and complete samples are under .cache/fumadocs. Production bundle structure, browser scheduling and local host load can influence small timing differences. This is not a comparison with the existing Lenso UI documentation site or a native/mobile performance result.

## Reproduce

With the README's pinned Exact and Playwright environment, from this package:

```sh
bun install --cwd bench/fumadocs --frozen-lockfile --ignore-scripts
# Generate the standard corpus first if absent.
SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale
PERF_RUNS=5 bun run test:fumadocs
```

The normal runner rebuilds all outputs and tests both native and matched search. FUMA_BUILD_ONLY=1 stops after production builds; FUMA_MEASURE_ONLY=1 explicitly reuses existing outputs for repeated measurements. To run only scope acceptance on those outputs, combine FUMA_MEASURE_ONLY=1 with FUMA_VALIDATE_ONLY=1. Reuse does not rebuild edited fixture source. All numeric samples, versions, conditions and index sizes are in .cache/fumadocs/results.json.
