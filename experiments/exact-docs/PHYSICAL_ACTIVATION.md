# Physical host-command split and SSR adoption

November 11, 2026. This opt-in web prototype retains a single root state, remains headless and does not change the default theme, product build path, initialized SDK source or native hosts.

## Physical boundary

Native host-command registration, including focus, clipboard, fullscreen, scrolling and default-prevention handlers, now lives in generated host-commands.js. The generated full view installs it once before mounting. Its original runtime state is accessed through live getters; imported host helpers are imported by the deferred module itself. The root resource stage does not install these commands. This is a bounded fixture with no arbitrary root commands/tasks/mutations; it is not a supported delayed-command policy for arbitrary user apps.

The builder checks the actual Rolldown chunk graph: every chunk containing host-commands.js must be outside the recursive static search closure. The receipt retains that closure and those chunk names. All relevant search/view dependencies are still prefetched under the approved render-preload policy; physical execution separation does not imply those bytes are never downloaded. Other DOM/navigation/resource-adapter dependencies remain coupled in the shared runtime. This is a real host-command split, not a completed standalone resource kernel.

## Reusing the SSR projection

The resource stage now completes the original checkpoint-loading step before root initialization. Promotion ends local listeners/effects, restores only the locally edited search subtree, and lets native Exact mount adopt the existing document instead of clearing exact-root. Search is synchronously normalized to its SSR empty value for adoption and restored through the same compiled action after mounting; the query is not copied into another state store. Root cells/resources remain shared throughout.

Adopting existing nodes exposed repeated capture-event replay, previously hidden because the old nodes were disconnected. The counter stage now consumes that queue once and replaces exact.taps with an empty drain. Verification requires a native "adopted the document" journal entry, no "adoption abandoned" entry, and identical counter/header/main DOM nodes immediately after promotion. Normal route changes can still replace page-specific regions. The search input/results subtree is restored rather than preserved by identity.

## Same-run comparison

Five cold samples per action/case, 300 URLs, two languages and versions, same zero-debounce scoped substring algorithm, Chromium, disabled cache, gzip, 4x CPU slowdown. The before column serves the exact saved output from the preceding resource-boundary prototype in .cache/local-activation/resource-before. It is **not** the original full Exact baseline from older reports. Cases alternate order. Fumadocs starts its client before action timing, so cold navigation totals are also included.

## Slow cohort

Latency 80 ms; download 200000 bytes/s. Median milliseconds, except byte metrics.

| Metric                  | Previous prototype | This prototype | Fumadocs matched |
| ----------------------- | -----------------: | -------------: | ---------------: |
| fcpMs                   |                212 |            212 |              276 |
| firstCounterMs          |              102.3 |          267.5 |             94.1 |
| firstSearchMs           |              591.3 |          557.8 |            413.7 |
| coldOpenToSearchMs      |              886.3 |          913.5 |           1652.7 |
| searchScriptMs          |               29.2 |           28.5 |             18.4 |
| coldNavMs               |              299.1 |          261.7 |            193.6 |
| backMs                  |               49.1 |           49.7 |             31.2 |
| jsThroughSearch         |             113876 |         117826 |           202229 |
| totalThroughSearchBytes |             137952 |         142028 |           208814 |

## Fast cohort

Latency 0 ms; download 10000000 bytes/s. Median milliseconds, except byte metrics.

| Metric                  | Previous prototype | This prototype | Fumadocs matched |
| ----------------------- | -----------------: | -------------: | ---------------: |
| fcpMs                   |                124 |            108 |               96 |
| firstCounterMs          |                113 |          106.1 |             82.9 |
| firstSearchMs           |                 80 |             76 |             59.4 |
| coldOpenToSearchMs      |              277.2 |            244 |            380.3 |
| searchScriptMs          |               27.4 |           23.4 |               13 |
| coldNavMs               |              198.4 |          218.7 |             89.1 |
| backMs                  |               45.9 |           44.7 |             28.1 |
| jsThroughSearch         |             113876 |         117826 |           202229 |
| totalThroughSearchBytes |             137952 |         142028 |           208814 |

The slow-cohort action timings improve modestly; total cold-open-to-search time does not improve. Search JS transfer increases despite the physical boundary, because chunk partitioning/shared code and HTTP overhead change. Native adoption removes the whole-root rebuild, but fast-cohort navigation regresses from 198.4 to 218.7 ms and both cohorts still trail Fumadocs. No default adoption is justified by these samples.

## Verification and reproduction

Chromium and WebKit checks cover root/getter/internal-node identity, one root initialization, rapid typing during delayed loading, actual resource search and error states, one increment per click after promotion, locale/version scope, history, failed lazy imports and DOM adoption. Native adoption diagnostics and direct DOM identity checks catch fallback rebuilds. Focused transaction/core checks and targeted format/lint checks also pass. Timings are local samples, not confidence intervals; arbitrary custom layouts, tasks/mutations and native hosts are not certified.

All samples, pinned versions, conditions, closure evidence and output hashes are retained in [physical-results.json](bench/local-activation/physical-results.json). Build and verify with the initialized Exact/Playwright environment from README. For benchmark reproduction, first preserve the prior resource prototype output before building this candidate, then use FUMA_ACTIVATION_BASELINE pointing to that snapshot, FUMA_LOCAL_ACTIVATION pointing to the new output, FUMA_LOCAL_ACTIVATION_LABEL=physical, FUMA_MEASURE_ONLY=1 and PERF_RUNS=5. Add FUMA_ACTIVATION_FAST=1 for the fast cohort. Earlier report generators must not be used to overwrite this receipt.

The remaining resource work is to isolate navigation and DOM publication dependencies, keep pure resource/store/overlay ownership independent of the view host, and define lifecycle rules for arbitrary root side effects. The chunk-boundary assertion should be extended to those modules before claiming the whole host dependency graph has been removed.
