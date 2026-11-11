# Search startup loading

Measured 2026-11-11T09:32:13.130Z. Same 300 authored URLs as the preceding route/scope extraction: English/Chinese × v2/v1 × 75 topics, 24 paragraphs and one code block per page. Values below are medians of five fresh-context trials interleaved across saved Exact, current Exact and both Astro modes, reversing order on alternate rounds. Delivery uses gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown. [ASTRO_COMPARISON.md](ASTRO_COMPARISON.md) contains the full comparison and fixture limits. Earlier changes remain documented in [ROUTING_STARTUP.md](ROUTING_STARTUP.md) and [STARTUP.md](STARTUP.md).

## Diagnosis

The first-search path waited for the shared application before discovering its scope's index import. A diagnostic CPU/network capture showed app.js finishing 655 ms after its request started; the index request began at 765 ms and finished at 992 ms. Sampled idle time dominated that capture. This identifies a download dependency and substantial waiting; it is not a complete per-function CPU attribution.

The new diagnostic capture shows the index starting at 43 ms and finishing at 524 ms, while app.js finishes at 802 ms. Times here are relative to each capture's app request, not page navigation. The captures use CPU sampling, Playwright polling and separate local contexts, so their wall durations are not the benchmark table. Their purpose is to verify overlap. Chromium reports the application request as High priority and the index as Low. Priority is a browser hint, not a scheduling guarantee.

## Change

Build output records the emitted scope module URLs in the delivery manifest and exposes the current scope's search-index identity on the generated page context. On a nonempty input in a search field inside data-docs-part="search", the bridge loads that scope's pure data module through a low-priority module script. It does not execute the application or user root module. When Exact activates and replays the input, its normal search resource imports the same URL and reuses the browser's module map. Exact continues to own filtering, results, pending/error feedback and root state.

Hover, focus, whitespace-only queries and counter buttons load no index. There is no speculative loading of other languages or versions. Custom layouts can use the same semantic search markup without changing their props or injection API. Scope changes still use Exact's normal resources; there is no second search-state implementation.

Search modules are not modulepreload hints. That approach failed the WebKit failed-index/reload check in this fixture; actual module loading passes recovery on both tested engines. No browser sniffing, persistent failure retry policy or SDK patch is introduced. Native generation is unchanged and retains bundled offline indexes. The framework remains headless with one root application and no default-theme changes.

## Results

| Metric                                     | Before |  After |
| ------------------------------------------ | -----: | -----: |
| Initial transfer, bytes                    |  11544 |  11783 |
| First search rendered, ms                  |  997.7 |  929.7 |
| Additional first-search transfer, bytes    | 140981 | 140996 |
| Script during first search, ms             |   37.2 |   24.4 |
| Repeat search rendered, ms                 |   34.8 |   34.4 |
| First counter interaction, ms              |  822.3 |  799.2 |
| Additional first-counter transfer, bytes   | 113018 | 113033 |
| Cold destination body ready, ms            |  186.8 |  190.7 |
| Additional cold-navigation transfer, bytes |   1809 |   1809 |
| Back body ready, ms                        |   43.9 |     44 |
| Additional Back transfer, bytes            |      0 |      0 |

First search improves by 68.0 ms, or 6.8%, in this run. Repeated search and Back are effectively unchanged; cold navigation is 3.9 ms slower. The counter also fluctuates, although this change does not intentionally optimize its activation. Local machine load affected timings, and five samples are not a statistical guarantee.

Shared app.js grows from 286,470/86,416 raw/gzip bytes to 286,512/86,431. Input glue remains 13,393 gzip bytes and the stylesheet 12,697. The delivery manifest/context and loading bridge add 239 bytes to initial transfer in this fixture; first-interaction transfer adds 15 bytes. This is a loading-order improvement, not code-size reduction. The remaining shared-entry/input/style downloads still dominate the gap. Astro ClientRouter's same-run search is 249.1 ms, static Astro's 248 ms. Neither fixture reproduces Exact's full resource/mutation/task or native runtime contracts.

## Verification

The new production regression blocks app.js deliberately. A whitespace-only input makes no scope request; a real Chinese-scope query requests exactly its own module before the application is available. After releasing the application, the latest input is replayed, matching scoped results appear, and the module has still been requested only once. This passed in Chromium and WebKit. Before the fix, the index-request assertion timed out while app.js was blocked.

Production checks also retain no activation on hover, nested-route activation, no index on a cold counter press, root mutation state and repeated-paragraph rendering. Custom-layout acceptance passes in both engines, including locale/version/RTL switching, a delayed old-scope reply, failed-index feedback, normal reload recovery, keyboard focus and Back reading position. Controlled content-loading checks cover page-only imports, root state, stale replies, deferred fragments and failure recovery. Unit tests, package typecheck, affected lint and formatting pass. No native performance improvement or new native-device acceptance is claimed by this Web-only change.

The final five-run pass reused the already built application/page and Astro artifacts and rebuilt only the changed metadata/loading bridge with the same Bun settings used by buildSite. The candidate bridge's SHA-256 was checked against a build from final source. The same browser measurement/assertion code from bench/compare.mjs was used unchanged. The earlier full-build three-run pass established the direct-import variant's smaller/noisy benefit; it is not the table above. Final samples, entry sizes and artifact notes are in .cache/comparison/results.json. Profiling artifacts are under .cache/startup-profile.

## Reproduce

With the README's Exact/Playwright setup, preserve this same fixture's old output before changing source, outside .cache/comparison. Then run from this package:

```sh
EXACT_BASELINE_DIR="$PWD/.cache/search-parallel-before-dist" PERF_RUNS=5 bun run test:compare
bun run test:startup-profile
```

The normal comparison rebuilds the candidate and both Astro modes, then runs the same browser measurements. CPU/network diagnostics can also target a saved output and separate artifact directory:

```sh
bun bench/startup-profile.mjs .cache/search-parallel-before-dist .cache/startup-profile/before
bun bench/startup-profile.mjs .cache/comparison/exact/dist .cache/startup-profile/after
```

The profiler writes report.json and cpu.cpuprofile and asserts a real scoped search result with no uncaught page errors. Its durationMs includes locator polling and CPU-profiling overhead; use the comparison's DOM-plus-two-frame measurements for latency claims.
