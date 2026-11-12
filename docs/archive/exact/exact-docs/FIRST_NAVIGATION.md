> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# First-navigation dependency chain

Measured November 12, 2026 (Asia/Shanghai). Opt-in compiler-output/runtime experiment for 300 static documentation URLs (2 languages × 2 versions × 75 pages). Single application/root resources and headless output are retained. The default compiler, upstream SDK and default theme are unchanged. This cohort compares the previous shared-owner/projection prototype, this candidate and pinned Fumadocs with the same scoped substring algorithm and zero search debounce.

## Cause and architecture

The previous first navigation imported the owner, booted the root, then discovered the target body. The body incurred another network latency period after the shared code download. A separate dependency problem remained: the SDK router module contained both route state and browser projection; importing its pure route operations pulled shared DOM/focus/popover code into the initial owner closure.

The build now exposes lazy body handles for links already in the rendered page. On an eligible click, while owner code downloads are still pending, it starts importing only that destination alongside the original lazy entry and checkpoint. When every owner preload has already finished, it uses the direct native path; it does not infer network speed from a browser hint. No destination is fetched merely by reading or hovering, and no root/resource is executed speculatively. The existing source and projection subsequently import the same hashed module; its default body still goes through the original native data conversion, resource ticket, transaction and settlement machinery. One body request serves speculative loading, the typed resource and the projection. Rejected speculation is observed and leaves resource error handling/recovery in charge.

Native route state is physically moved out of browser projection. The extractor follows binding dependencies and writers, moving mutable route tables and fragment intents to a single owner; the original full router imports/re-exports those bindings. It does not maintain a second router or copy its history. Native launch URL parsing is also shared from a separate module. Browser projection/focus/time-view modules are excluded from the initial static graph and remain available for full-view escalation. The builder asserts that they cannot enter the resource-owner closure again.

The initial HTML includes handles only for links it already renders, rather than a global 300-page bootstrap manifest. Native scope maps and resource queries remain unchanged. This adds some HTML bytes, so FCP and cold-open totals are measured along with action latency. There is no target guess, benchmark-specific route prefetch or theme change.

## Dependency timing

The following are timestamps relative to the actual link click, from the median-paint sample of separate three-sample diagnostic captures at 80 ms latency, 200,000 bytes/s and 4× CPU slowdown. They are not the official five-run action medians below; diagnostic instrumentation and machine scheduling affect these absolute values. Data-start/ready events wrap the real native data adapter, and resource timings come from the browser.

| Boundary after click (ms)                       | Previous prototype | Candidate |
| ----------------------------------------------- | -----------------: | --------: |
| Last owner static dependency response completes |              228.4 |     219.1 |
| Owner module / checkpoint initialization starts |              235.4 |     224.1 |
| Root boot completed; local view host starts     |              247.2 |     237.2 |
| Native target resource asks                     |              256.9 |       247 |
| Target module network request starts            |              260.3 |       1.2 |
| Target module response completes                |              370.3 |     145.3 |
| Native checked reply is available               |              373.6 |     264.9 |
| Destination DOM is visible to observer          |              395.2 |     282.8 |
| Two animation-frame observation                 |              402.9 |     288.5 |

For an owner whose code is still downloading, the important ordering change is target request before owner initialization, instead of after it. When the code is already downloaded, preparation deliberately stays on the native path. The baseline fails this ordering assertion. The candidate passes with one target request and no search-index/full-renderer request. Browser response-to-reply and reply-to-DOM spans include scheduling, module evaluation, conversion, native settlement and projection; they are elapsed time, not CPU attribution. The official benchmark records script CPU separately.

## Matched slow cohort

Five samples per implementation/action, alternating order, Chromium, disabled browser cache, gzip, 4× CPU slowdown; latency 80 ms, throughput 200,000 bytes/s. Timings are milliseconds, byte values are encoded HTTP bytes. First navigation is the first interaction, in a separate fresh context. Activated navigation happens after search/counter actions. Fumadocs initializes its client before the action, so cold-open totals are included.

| Median metric                                    | Previous prototype | Parallel navigation | Fumadocs matched |
| ------------------------------------------------ | -----------------: | ------------------: | ---------------: |
| First contentful paint                           |                196 |                 204 |              276 |
| Counter first input                              |              103.6 |               101.9 |            110.1 |
| Search first input                               |              449.2 |               373.7 |            401.8 |
| Cold open to search results                      |              733.1 |               656.6 |           1617.7 |
| Navigation as first interaction                  |              459.2 |               315.9 |            209.1 |
| Cold open to first destination                   |              746.6 |               612.8 |           1427.3 |
| Navigation after search/counter activation       |              175.4 |               191.9 |            190.2 |
| Search script CPU                                |               20.9 |                19.9 |             14.7 |
| First-navigation script CPU                      |               19.8 |                  23 |             34.7 |
| Bytes through first navigation                   |              87635 |               73505 |           157791 |
| Back after activated navigation                  |               26.7 |                27.6 |               26 |
| Documents through first navigation               |                  1 |                   1 |                1 |
| Script bytes through first search                |              87058 |               71512 |           202229 |
| Target body/projection transfer after activation |               3958 |                3958 |             4397 |

## Matched fast cohort

Five samples, no added latency, 10,000,000 bytes/s, still 4× CPU slowdown. Same corpus, algorithm and actions.

| Median metric                                    | Previous prototype | Parallel navigation | Fumadocs matched |
| ------------------------------------------------ | -----------------: | ------------------: | ---------------: |
| First contentful paint                           |                132 |                 136 |              128 |
| Counter first input                              |              106.2 |               112.3 |             90.7 |
| Search first input                               |               70.9 |                66.3 |             87.5 |
| Cold open to search results                      |              263.9 |               276.8 |            478.6 |
| Navigation as first interaction                  |              186.8 |               188.6 |            149.6 |
| Cold open to first destination                   |                386 |               355.3 |            502.2 |
| Navigation after search/counter activation       |               93.3 |                96.1 |             97.9 |
| Search script CPU                                |               22.3 |                21.6 |             14.9 |
| First-navigation script CPU                      |               21.3 |                24.5 |             46.5 |
| Bytes through first navigation                   |              87635 |               73505 |           160521 |
| Back after activated navigation                  |                 30 |                28.8 |             36.6 |
| Documents through first navigation               |                  1 |                   1 |                1 |
| Script bytes through first search                |              87058 |               71512 |           202229 |
| Target body/projection transfer after activation |               3958 |                3958 |             4397 |

## Acceptance and the fast-path correction

In the final slow cohort, first navigation changes from 459.2 to 315.9 ms; matched Fumadocs is 209.1 ms. On the fast cohort it changes from 186.8 to 188.6 ms; matched Fumadocs is 149.6 ms. These are local five-sample medians, not universal guarantees.

The first unconditional-preparation variant reduced slow navigation, but regressed fast first navigation (182.5 to 229.1 ms in that cohort). Its complete samples remain in the receipt. The final variant only prepares destinations while owner transfers are outstanding. The held-owner and fully-downloaded-owner branches are both covered directly. FCP and cold-open totals remain visible above; the added inline handles change initial HTML from 11552 to 12968 gzip bytes. This result remains opt-in; arbitrary application integration is not qualified.

## Code and acceptance boundaries

The recursive owner/search static graph changes from 55228 to 39664 gzip bytes, summing compressed modules. These figures include every static dependency, not only app.js, and exclude the lazily loaded target body and scoped search index. Script bytes through search and first-navigation transfers are captured in the raw receipt. The retained early-download policy continues to download owner code while reading; it does not execute the app until interaction.

This remains the grant-free generated static-document path. Arbitrary custom data, root mutation/task effects and custom layouts need their original full path and separate acceptance. Full-view promotion reinstalls the native host over the same root; it is not a general SDK/compiler release. No native macOS/iOS performance assertion is made.

## Verification

Chromium/WebKit passed an explicit held-owner regression: a first-click target request begins while the owner module is blocked; the counter remains usable; releasing the owner preserves the same root, counter and native content resource. Only one document and one body module request occur; no search index/full renderer is loaded. A failed speculative destination keeps the old URL/document and recovers on another route with the counter retained. A fully downloaded owner uses the direct native path and initializes the root once.

Existing Chromium/WebKit checks passed root/resource identity, typed rollback, stale replies, malformed source replies, strict shape errors, failure recovery, full-view escalation, language/version navigation, latest destination, history/scroll restoration, Copy Markdown and widget preservation. The ordinary two-slot framework build without the benchmark counter is independently checked. Reactive binding/core audits and affected formatting/lint checks pass. Both matched cohorts also verify scope/state behavior and eight pixel-identical reading/focus screenshots.

Raw samples, diagnostic boundaries, conditions, exact input/generated/source hashes, transitive asset sizes and functional receipts are in [navigation-results.json](bench/local-activation/navigation-results.json). The previous [owner/projection report](OWNERSHIP_ACTIVATION.md) remains a historical record; comparisons here rerun that frozen output in the same cohort.

## Reproduce

From experiments/exact-docs, preserve the previous output and use an initialized Exact checkout:

```sh
LOCAL_PARTITION=1 LOCAL_DESTINATION=1 EXACT_ROOT=/path/to/exact bun bench/local-activation/build.mjs /path/to/native/dist "$PWD/.cache/local-activation/navigation-adaptive"
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-start-check.mjs .cache/local-activation/navigation-adaptive
PERF_RUNS=3 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-profile.mjs /path/to/previous/complete .cache/local-activation/navigation-before-profile.json
NAV_EXPECT_OVERLAP=1 PERF_RUNS=3 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-profile.mjs .cache/local-activation/navigation-adaptive .cache/local-activation/navigation-adaptive-profile.json
FUMA_MEASURE_ONLY=1 FUMA_ACTIVATION_BASELINE=/path/to/previous/complete FUMA_LOCAL_ACTIVATION="$PWD/.cache/local-activation/navigation-adaptive" FUMA_LOCAL_ACTIVATION_LABEL=navigation-adaptive FUMA_NAV_FIRST=1 PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat the last command with FUMA_ACTIVATION_FAST=1 for the fast cohort.
bun bench/local-activation/navigation-report.mjs
```
