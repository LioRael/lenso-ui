> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Shared application activation

Measured 2026-11-11T11:10:47.949Z, medians of 5 fresh-context trials. Saved Exact output and the current candidate are interleaved with the unchanged Fumadocs Core matched-search production fixture, reversing order on alternate rounds. All use gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown. The same corpus contains 300 URLs: English/Chinese × v2/v1 × 75 pages. [FUMADOCS_COMPARISON.md](FUMADOCS_COMPARISON.md) describes the matched adapter and the broader static-site comparison.

## Where the counter waits

The earlier five-run comparison recorded an 808.8 ms first counter action. A separate CPU/network diagnostic recorded 891 ms with profiling enabled; those wall times are not interchangeable. In that capture, app.js transferred for 659 ms while an input-only module and the full stylesheet were also downloading. After the entry finished, approximately 120 ms passed before the queued click replayed and another 58 ms before the two-frame paint signal. CPU sampling was predominantly idle. These overlapping observations identify network scheduling as the main opportunity; they are not a per-function allocation of all 809 ms.

The old cold interaction downloaded about 86.6 KB of application code, 13.6 KB of input glue and 12.9 KB of stylesheet wire data. The page already contained a critical stylesheet. The SDK main module then awaited a full stylesheet before mounting, while the documentation delivery hints pulled its otherwise post-paint input module into the activation bandwidth budget.

## Changes

Input-only glue is left on Exact's own post-paint import path. The application, checkpoint adoption, click replay and root state are unchanged. Keyboard activation of a native button is tested with the input-module response deliberately blocked, and must still increment exactly once. Hints continue to fetch the application on control intent without starting root tasks.

The original SDK critical/full stylesheet sequence is retained. Stylesheet contents, stylesheet admission, fonts and the first static paint keep their existing behavior. No CSS is inlined by this change. An earlier experiment moved complete CSS into the HTML, but was rejected after its fast-network pass showed extra cold-start cost. This avoids trading lower-bandwidth interaction speed for larger initial HTML and additional startup work.

## Same-run results

| Metric                                           | Exact before | Exact after | Fumadocs Core, matched search |
| ------------------------------------------------ | -----------: | ----------: | ----------------------------: |
| First counter action to paint, ms                |        793.6 |       712.9 |                          82.9 |
| Cold open to counter paint, ms                   |       1063.8 |       982.7 |                        1267.4 |
| Script during counter activation, ms             |         14.2 |        15.6 |                           5.0 |
| First contentful paint, ms                       |        196.0 |       196.0 |                         260.0 |
| Initial transfer, KB                             |         11.8 |        11.8 |                         156.1 |
| Counter bytes completed through paint, KB        |        124.8 |       111.2 |                         156.1 |
| Counter bytes completed through network idle, KB |        124.8 |       124.8 |                         156.1 |
| First search action to result, ms                |        915.2 |       842.2 |                         396.8 |
| Cold open to search result, ms                   |       1186.1 |      1101.9 |                        1583.5 |
| Total through first search, KB                   |        152.8 |       152.8 |                         208.8 |
| Repeat search, ms                                |         39.8 |        41.6 |                          34.6 |
| Destination body ready, ms                       |        178.3 |       178.4 |                         223.3 |
| Back body ready, ms                              |         34.9 |        36.8 |                          25.6 |

The first counter action improves 10.2% in this run. The matched Fumadocs fixture keeps its React/Next client startup before the first action; Exact still defers application execution. Action-only timing and cold-open timing therefore answer different questions. The matched adapter uses the same substring scope and zero debounce, while retaining Fumadocs hook/result parsing. This does not reproduce Exact's resource/mutation/task systems or compare native hosts.

KB is decimal. Transfer is credited at response completion/cancellation; through-paint bytes describe completed responses, not every partial byte in flight at that instant. The input module still loads once and finishes after the counter paints in the throttled trace, so its cost is visible in the network-idle total. It is not removed or replaced. Small timing differences remain subject to local machine load; five samples are not a statistical guarantee.

Artifact payloads, raw / independently gzipped bytes:

| File       |         Before |          After |
| ---------- | -------------: | -------------: |
| index.html |  77615 / 10241 |  77578 / 10219 |
| app.js     | 286512 / 86431 | 286512 / 86431 |
| style.css  |  96077 / 12697 |  96077 / 12697 |

The shared application and SDK stylesheet hashes are retained in the JSON report. This is a delivery optimization, not removal of runtime features or a smaller application program.

## Verification

The saved and current pages pass pixel-identical comparisons at 1280 and 390 px widths, light and dark schemes, both reading and focused-search states: 8 screenshot pairs. These checks concern the tested fixture, not every possible consumer theme. Production browser checks in Chromium and WebKit verify application/stylesheet hints without an input-module request or application activation on hover, keyboard replay while input glue is unavailable, single loading of the eventual input helper, scoped search and root mutation retention.

The same-run three-way harness verifies forward navigation, Back, a complete destination code marker, one root counter update, and root-state retention across language/version changes. Every search-result selection must navigate to another correct page; the matched fixture retains its counter as well. Additional controlled content-loading/custom-layout suites cover stale replies, failures and reload recovery, reading positions, SEO, RTL and root state. Unit/type checks, lint and formatting pass. No default theme or additional application is introduced.

## Reproduce

Use the Exact/Playwright setup from README. Save the output of this same fixture before changing the compiler, outside .cache/fumadocs. Rebuild only its Exact candidate with the normal buildSite/CLI entry; the pinned Fumadocs matched artifact is unchanged.

```sh
PROFILE_ACTION=counter bun bench/startup-profile.mjs .cache/activation-before-dist .cache/activation-profile/before
FUMA_ACTIVATION_BASELINE="$PWD/.cache/activation-before-dist" FUMA_MEASURE_ONLY=1 PERF_RUNS=5 bun run test:fumadocs
```

This baseline mode tests exactly saved Exact, current Exact and Fumadocs matched search. It does not overwrite the earlier four-way report. Raw slow-network samples and artifact hashes are in .cache/fumadocs/activation-results.json. Fast-network request evidence is saved as activation-fast-*-counter-network.json. Counter request evidence from future runs is prefixed activation-slow- or activation-fast- so the conditions remain separate. The diagnostic CPU profiles and phase timelines are under .cache/activation-profile. The final candidate diagnostic records 725 ms with sampling: app.js completes in 587 ms and input-glue starts later, 671 ms after app.js starts; input-glue finishes after the observed counter paint. This is a diagnostic trace, not another five-run median. CPU sampling has overhead and its readiness polling is frame-granular; use the unprofiled benchmark's observed DOM plus two-frame timings for latency claims.

## Fast-network follow-up

A separate five-run check uses 0 ms injected latency and 10,000,000 bytes/second download, keeping 4× CPU slowdown and disabled cache. First-counter medians: 133.9 ms before, 138 ms after, 62.9 ms matched Fumadocs. Cold-open-to-counter: 280.6 → 283.9 ms. These are separate network conditions, not directly interchangeable with the main table. Full samples are in .cache/fumadocs/activation-fast-results.json. Add FUMA_ACTIVATION_FAST=1 to baseline mode to repeat this check.

## Rejected stylesheet experiment

An earlier five-run pass also inlined the unchanged complete SDK CSS and removed the stylesheet-load gate. Under the slow network, its counter improved 816.5 → 643 ms, but FCP changed 204 → 252 ms and initial transfer grew by 7852 bytes. On the fast network, cold-open-to-counter regressed 332 → 361.9 ms; script duration increased 19.8 → 48.8 ms. Eight screenshot pairs were pixel-identical, so appearance was not the reason for rejection. The delivery/CPU tradeoff was. The CSS-inlining implementation was removed; only input deferral remains. The exploratory passes are archived as activation-inline-results.json and activation-inline-fast-results.json under .cache/fumadocs.
