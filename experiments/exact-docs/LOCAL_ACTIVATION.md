# Local activation experiment

Measured on November 11, 2026. This is an opt-in transform of one qualified compiler output, with a copied SDK runtime. Production build behavior, native hosts and the default theme are unchanged. Keep the prototype headless.

The counter can activate independently while retaining the same root array, signal getter, internal signal node and compiled action when the rest of the app starts. Search can use the original Exact resource while binding only the existing search surface. First navigation promotes to the generated full view. This establishes feasibility for this fixture, not general compiler support for arbitrary user pages.

## Compiler and runtime findings

The inspected `host/web-js/src/emit.rs` emits root slots, derives, resources and actions inside one factory, followed by paint setup, `mount`, router setup, and root state getters. The factory boundary can be partitioned without copying state values. The original `rt.js` couples typed commits to resource settlement, navigation, host commands and DOM rendering. Merely moving the view behind an import left a 75.2 KB gzip entry in an exploratory build.

The prototype extracts the original reactive functions and shared mutable runtime bookkeeping into one module. Before any resources exist, a narrow transaction adapter permits only the compiler-generated numeric counter action qualified by the build assertions. Loading the full runtime installs the native commit/write implementation; subsequent calls through the existing counter action delegate to it. Both runtimes use the same reactive globals and cells. This early adapter is additional experimental code, not an unchanged native commit implementation.

The search stage initializes the remaining compiled root once, adopts the existing counter cell/action, installs Exact's original checked TypeScript data adapter, and uses the original `docsSearchPages` resource and scoped substring algorithm. Its DOM adapter binds the counter/input/results in place. It still loads the large native resource/host runtime; it is not a minimal standalone resource kernel. A resource failure renders the existing localized status. Chunk import failure records `exact.activationError` and preserves the active counter; retry UI is not implemented.

The full view is deferred until navigation. It ends the partial binding scopes/listeners, loads the original stylesheet, clears the old projection and mounts the compiler-generated view over the same root. It rebuilds the projection rather than performing fine-grained adoption of every custom element.

## Same-run comparison

Each cohort uses 300 URLs: 2 languages × 2 versions × 75 pages. Chromium, cache disabled, gzip, 4× CPU slowdown, alternating case order, five cold contexts per action/case, unique 16-hex paragraph query, identical zero-debounce substring search for Exact and Fumadocs matched. Fumadocs versions are pinned in the receipt. Fumadocs starts its client before the timed action; Exact executes its app on interaction. Cold navigation-to-paint totals are therefore also reported. These are local samples, not confidence intervals or universal rankings.

Slow cohort: 80 ms latency, 200,000 bytes/s download.

| Metric (ms, median of 5)             | Full Exact | Local prototype | Fumadocs matched |
| ------------------------------------ | ---------: | --------------: | ---------------: |
| First contentful paint               |      272.0 |           324.0 |            312.0 |
| Counter input to paint               |      478.8 |           170.7 |            150.7 |
| Script CPU after counter input       |       45.3 |             8.5 |             11.8 |
| Cold navigation to counter paint     |      878.6 |           738.8 |           1627.7 |
| Search input to results              |      375.9 |           350.0 |            517.4 |
| Cold navigation to search results    |      988.1 |           893.0 |           2060.4 |
| Script CPU after search input        |       62.9 |            62.4 |             27.4 |
| First in-app navigation after search |      271.6 |           498.9 |            231.7 |
| Back navigation                      |       76.4 |           113.9 |             47.6 |

Fast cohort: 0 ms added latency, 10,000,000 bytes/s download, still 4× CPU slowdown.

| Metric (ms, median of 5)             | Full Exact | Local prototype | Fumadocs matched |
| ------------------------------------ | ---------: | --------------: | ---------------: |
| First contentful paint               |      112.0 |           128.0 |            140.0 |
| Counter input to paint               |      173.2 |           108.1 |             81.8 |
| Script CPU after counter input       |       26.4 |             6.5 |              5.6 |
| Cold navigation to counter paint     |      384.2 |           334.3 |            477.6 |
| Search input to results              |      147.3 |            88.9 |             87.1 |
| Cold navigation to search results    |      347.6 |           313.4 |            497.0 |
| Script CPU after search input        |       36.8 |            31.6 |             20.3 |
| First in-app navigation after search |      176.8 |           256.9 |            110.8 |
| Back navigation                      |       53.6 |            55.7 |             32.0 |

The counter's startup and script CPU improve substantially. Slow-cohort search improves only modestly; fast-cohort search approaches Fumadocs matched. First in-app navigation regresses because it now pays full-view loading/projection work. First contentful paint also regresses relative to full Exact in these medians. Do not adopt this as the default yet.

## Entry and transfer accounting

- Full Exact app.js: 281800 bytes raw / 79570 gzip.
- Counter activation app.js: 10994 bytes raw / 4699 gzip. This is the critical counter entry, not all downloaded JavaScript.
- The approved render-preload policy remains: search runtime and its static dependencies download at low priority without evaluating the root. The browser verification checks zero root initializations after counter-only activation. Search indexes remain query-loaded.
- Slow-cohort median total transferred through first search: full Exact 146735 bytes; local 133158; Fumadocs matched 208814. These include HTTP overhead and non-script assets.
- Even a counter-only visit can finish downloading the prefetched search runtime: local median counter total is 105195 bytes. A 4.7 KB entry does **not** mean a 4.7 KB reading-session download.
- The initial no-search-preload exploration exposed an extra first-search request waterfall. The final measured candidate preloads that static dependency closure, keeping execution deferred. This trades earlier bandwidth for shorter search wait.

## Verification and limits

Chromium and WebKit passed: compiler-generated counter click/keyboard action; rapid input while the search chunk is delayed; actual resource results; exactly one remaining-root initialization; root/getter/internal-node identity across promotion; one increment per click after promotion; language/version scope changes; browser back; failed lazy search import leaving the counter usable. The comparison harness also passed scope/root-state checks and eight pixel-identical reading/focused screenshots at 1280/390 px in light/dark for each cohort.

The focused core check covers typed write refusal, rollback after an earlier write, aborted actions, commit delegation and binding-scope cleanup. Formatting and targeted lint are checked separately. No Rust source was edited and no native-host acceptance is claimed.

The build refuses unqualified slot/derive/resource layouts and counter actions. Arbitrary root mutations/tasks, child state, custom layouts, scheduling, source-grant lowering and general dependency/lifecycle analysis are outside this prototype. It does not change the public compiler or install/modify the SDK. Original .gen source hashes, generated artifact hashes, all timed samples, pinned versions and verification receipts are retained in [results.json](bench/local-activation/results.json). The copied source files remain under the ignored .cache directory.

## Reproduce

Use the initialized SDK and browser environment described in README. First generate the existing 300-page production/Fumadocs fixtures. Then, from experiments/exact-docs:

```sh
LOCAL_RESOURCE_SPLIT=0 EXACT_ROOT=/path/to/initialized/exact bun bench/local-activation/build.mjs
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/verify.mjs
bun bench/local-activation/core-check.mjs
FUMA_MEASURE_ONLY=1 FUMA_ACTIVATION_BASELINE="$PWD/.cache/fumadocs/exact/dist" FUMA_LOCAL_ACTIVATION="$PWD/.cache/local-activation/dist" PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat with FUMA_ACTIVATION_FAST=1 for the fast cohort.
bun bench/local-activation/report.mjs
```

Output stays under .cache/local-activation; the input fixture and initialized SDK are preserved. LOCAL_SEARCH_PRELOAD=0 creates the exploratory no-search-preload variant; do not mix its measurements with the final receipt. Old production performance reports are not overwritten by this benchmark mode.

The next compiler experiment should emit an explicit activation dependency/lifecycle boundary and extract resource settlement from DOM/navigation/host commands. It should reuse the full runtime's transaction semantics and define activation rules for root tasks/mutations before extending this to arbitrary Exact pages. The navigation/FCP regressions are acceptance blockers for a default rollout.
