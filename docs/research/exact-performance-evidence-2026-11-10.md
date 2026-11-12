> Archived direction: Exact development was paused on 2026-11-13. See the [retirement and recovery record](../archive/exact/README.md). The evidence below remains historical and cohort-specific.

# Exact performance evidence

Reviewed on 2026-11-10. This is an upstream evidence review, not a local reproduction. No Exact builds, toolchain installations or device benchmarks were run. Upstream main changes frequently; the partial repository-tree snapshot inspected identifies `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. The measurements below name their own older revisions and must not be attributed to that snapshot or current main.

## Assessment

Exact has credible application-shaped, physical-device list benchmarks. In the selected workloads it can approach UIKit scrolling and outperform ordinary SwiftUI implementations, particularly under live updates. It often consumes more process CPU than UIKit. Neither these comparisons nor its startup budgets establish superior energy efficiency or Lenso Glass performance.

## Physical iOS evidence

[Heavy-list methodology and standings](https://github.com/expo/exact/blob/main/bench/heavy-list/README.md) compare 10,000 rich messages. The following iPhone 13 Pro Max results are three-round medians from 2026-09-29, Exact `dedbe6e8`; OS is not specified in these standings.

| Metric                                        | Exact | UIKit | SwiftUI |
| --------------------------------------------- | ----: | ----: | ------: |
| Scrolling FPS                                 | 116.9 | 117.3 |   106.4 |
| Scrolling FPS with live updates               | 117.0 |  91.5 |     0.6 |
| Process CPU ms per second, ordinary scrolling |   411 |   263 |     342 |
| Peak footprint MB, ordinary scrolling         |   110 |   109 |      87 |
| Cold start ms, separate linked-probe series   |   156 |   311 |     330 |

CPU ms/s is accumulated process CPU time, not frame duration or power. Exact uses approximately 56% more process CPU than UIKit in this scrolling series. The unusually poor SwiftUI live result belongs to this implementation and workload, not SwiftUI universally. The separate cold series measures process start to the first display-link sample with the list present and blank-free. It is not network-data readiness or direct optical time to first visible pixel.

The iPad Pro M1 heavy-list result (2026-09-30, `9fdf7e564`, three rounds) similarly reports Exact 119.9 FPS, UIKit 119.6, SwiftUI 92.1; process CPU 435, 297, 445 ms/s respectively. Its separate linked-probe cold series is from the preceding revision/day: 210, 320, 328 ms, two rounds. Do not substitute the table's 168 ms injected-probe result for that separate launch series.

[Simple-list results](https://github.com/expo/exact/blob/main/bench/list/README.md), iPhone 17 Pro Max, 2026-09-25, `9e06c4ea8`, show Exact and SwiftUI both at 120 FPS with 8.3 ms p95 through the tested speeds. This is parity at the display ceiling.

[Crypto-list results](https://github.com/expo/exact/blob/main/bench/crypto-list/README.md), iPhone 13 Pro Max, 2026-09-30, `9fdf7e564`, reinforce the CPU tradeoff: Exact inline SVG 118.5 FPS / 114.0 live FPS / 511 CPU ms/s, UIKit 120 / 120 / 247. Exact is not uniformly the fastest or cheapest implementation.

## Mixed content, including glass

[Extra-heavy feed](https://github.com/expo/exact/blob/main/bench/extra-heavy/README.md) contains 3,000 rows of 19 kinds, including glass over images, GPU effects, video, maps and nested lists. The 2026-09-30 iPhone 13 Pro Max aggregate (`7647f6d78`) reports:

| Metric           | Exact | UIKit | SwiftUI |
| ---------------- | ----: | ----: | ------: |
| FPS              | 115.1 | 112.4 |   103.1 |
| Process CPU ms/s |   587 |   409 |     543 |
| Blank samples    |   489 |   321 |     466 |

Exact has higher aggregate FPS but more blank samples and CPU than UIKit. Native comparator arms have two rounds versus Exact's three; thermal states range 0–1. These aggregates cannot isolate glass cost or establish equal glass visual quality.

The same README reports a historical Web comparison on Mac mini M4, Chrome 154, 60 Hz, 2026-09-28, Exact `558a5bd8` using its Wasm target: Exact 57.8 FPS versus Expo Web 57.0; reported per-page memory 82 versus 153 MB. This is neither a modern JS-target comparison nor a baseline against minimal DOM/CSS or Lenso Web Glass.

## Web follow-up: the JavaScript target

The [Dioxus benchmark](https://github.com/expo/exact/blob/main/bench/dioxus/README.md) provides a more relevant JS-target comparison than the older Wasm/Expo series. It uses production builds, headed Chrome, a fresh profile, a 420 × 900 CSS-pixel viewport at DPR 2, and three interleaved rounds on Mac17,6. Results date to 2026-10-03, not current main. Dioxus is 0.8.0-alpha.1 with application-authored list windowing. Background load averages were 37–54; interleaving mitigates but does not eliminate that confound. Raw results are not committed.

With the whole feed (`31ba85771`), Exact's first row was 147 ms versus Dioxus 114 ms, and median reaction tap duration 88 versus 16 ms. Exact shipped 21.68 MB of non-image resources uncompressed, partly because baked/data representations duplicated the feed. Returning all 10,000 rows through the Wasm-to-JS data boundary on each tap was expensive even though the UI used the JS target.

The bounded-answer series, including `cf12cb9ae` and `ca83e4eaa`, reports:

| Metric                                | Exact bounded |  Dioxus |
| ------------------------------------- | ------------: | ------: |
| First row ms                          |            45 |     129 |
| LCP ms                                |           112 |     172 |
| Median tap Event Timing ms            |            24 |      16 |
| Non-image uncompressed resource bytes |       7.54 MB | 7.85 MB |
| JS heap MB                            |           4.1 |     1.8 |
| Renderer RSS MB                       |           285 |     279 |

These are paired results within that series; do not combine Dioxus values from the whole-feed series as a single unchanged control. Event Timing only reports events at or above the configured 16 ms threshold. Local-load first-row and LCP results do not establish mobile-network performance or field Core Web Vitals. The whole-feed series reported approximately 123 rAF callbacks/s for both implementations; this is callback pacing, not independently verified display FPS. Bounded-window scrollTop resets also make raw scroll distance misleading, so the harness adds row-progress measurement.

The current [JS runtime source](https://github.com/expo/exact/blob/main/host/web-js/rt.js) uses tracked dependencies, memoized derivations, effects and batched commits. It updates DOM and delegates layout to the browser. Inference: it can reduce UI update overhead compared with implementations that recompute more work, but it does not remove browser style, layout, paint or GPU costs.

The root README's 26 KB versus React's 81 KB and approximately 300 ms earlier readiness are historical claims. Its linked detailed RFC (`llp/1071-exact2-web-target.rfc.md`) returned HTTP 404 during this follow-up, so the original experimental conditions were not verified. A later [size issue](https://github.com/expo/exact/blob/main/issues/closed/20261008-realworld-app-js-over-budget.md) records RealWorld at 43.45 KiB Brotli on `fe5b26798` (2026-10-12). Current [metrics code](https://github.com/expo/exact/blob/main/scripts/metrics.mjs) retains a 45 KiB budget for runtime plus app.js; GPU, Canvas 2D and editor pieces loaded on demand are excluded. The budget is not a fresh measurement, and app.js size is not total page weight. Neither number should be presented as current all-inclusive runtime cost.

For Lenso, reduced framework/update work is plausible; lower optical rendering cost has not been demonstrated. No inspected source supplies a matched comparison against Lenso, minimal DOM/CSS, or current Solid/Svelte, nor target-iPhone Safari GPU measurements.

## Broader application tests and changing results

[Bake-off methodology](https://github.com/expo/exact/blob/main/bench/bakeoff/README.md) uses agent-built matched specifications, simulator gestures and a passive scroll recorder. It measures both the framework and the generated implementation. Simulator results cannot establish physical iPhone 120 Hz performance.

Historical [r21](https://github.com/expo/exact/blob/main/bench/bakeoff/results/r21/summary.md), `f0eeade6b1`, reports Exact 5/11 clean lists versus native 10/11, mean hitch 21.7 versus 2.1 ms/s. A later located [r34](https://github.com/expo/exact/blob/main/bench/bakeoff/results/r34/summary.md), `f2cbe5de1c`, reports Exact 15/15 versus native 12/15, mean hitch 0.6 versus 1.7 ms/s. This is evidence of substantially different outcomes across rounds, not a controlled before/after measurement: application sets, implementations and runtime versions vary. Do not present r21 as current performance or r34 as proof of universal superiority. The r34 overall app preference score favors native 9 to 6; it is not a performance metric.

## Measurement boundaries

- [The native probe](https://github.com/expo/exact/blob/main/bench/heavy-list/probe/probe.m) drives `contentOffset` from `CADisplayLink` and records timestamp intervals. This detects application-side frame pacing and main-thread stalls; it does not independently verify every GPU completion or physical display presentation. Programmatic scrolling also bypasses touch/release behavior.
- Timing and blank-sampling passes are separate because capturing views perturbs timing. Layer snapshots have limitations for Metal content. Raw physical-device standings are explicitly not committed, limiting independent auditing of the reported aggregates.
- [The Web probe](https://github.com/expo/exact/blob/main/bench/extra-heavy/web/probe.js) measures animation-frame intervals and structural blanks via `elementFromPoint`; its comments explicitly exclude rows whose structure exists but pixels have not painted. Its process memory and CPU measures are not direct GPU energy measurements.
- [100 ms startup](https://github.com/expo/exact/blob/main/rules/RULES.md) is a budget target. Different benchmark workloads report longer launches. Agent-controlled clock tests prove deterministic behavior, not sustained wall-clock smoothness.

## Implications for Lenso Glass

Inference: Exact's architecture and measurements justify an isolated prototype. They do not justify migrating Lenso's renderer for an assumed speedup. Native system Glass and Lenso's custom Web optics require separate evaluation.

A relevant comparison should hold backdrop content, dimensions, scrolling workload and visual quality constant. Compare system Glass under Exact versus UIKit on the same iPhone; compare Lenso Glass under an Exact Web adapter versus its existing Web host. Include one, several and fused surfaces, scrolling backgrounds, direct touch, light/dark appearances and a sustained run. Record frame-time percentiles and stalls, blank/stale backgrounds, CPU, GPU time, footprint and thermal/energy behavior. Cold startup should separately report base UI, first glass appearance and first responsive interaction so deferred effects cannot hide their cost.
