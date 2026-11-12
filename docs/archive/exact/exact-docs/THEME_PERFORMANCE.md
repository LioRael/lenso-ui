> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Default-theme performance acceptance

Measured November 12, 2026 (Asia/Shanghai). This is a measurement of the real default Lenso Web theme and ordinary Exact builds, with a same-algorithm Fumadocs Core and UI comparison. Both headless and themed Exact keep one application root. No theme CSS, Glass renderer, controller or default interaction was removed for timing.

## Comparable builds and actions

300 URLs, two languages × two versions × 75 pages, 24 paragraphs plus a code block per page. Original Markdown hashes are equal between both Exact projects and the source corpus. Fumadocs Core reuses the previous frozen matched output; Fumadocs UI is built from the same stored page data and public substring indexes. Its normal DocsLayout, DocsPage and SearchDialog parts remain in use, with only the search adapter changed to the same zero-debounce scoped substring algorithm. Exact uses its existing native source/resource query, not a browser-side replacement.

The default layout is unmodified. A small benchmark-only compiler-entry shim inserts a plain root counter into its existing article slot; the headless fixture retains the preceding counter layout. Counters are root state in all cases and must remain 1 across navigation, Back and language/version changes. The benchmark control's position is not identical across layouts; counter latency is retained in raw data but is not a primary ranking here. No Markdown or search text was altered to insert the control.

Exact headless and Exact Lenso are rebuilt with the same initialized stock SDK. These are standard production builds, not the preceding opt-in lexical-owner/projection transform. That transform's earlier numbers are not a before/after baseline for this theme: its support boundary does not cover these theme controls. The common single-application constraint and the headless option remain intact.

Each implementation/action has five fresh browser contexts, alternating case order, Chromium, gzip, disabled browser cache and 4× CPU slowdown. First navigation is measured separately as the first action. First search includes opening Fumadocs UI's dialog; Exact's search field is inline. Fumadocs initializes its client before the action; native Exact activation follows the SDK policy (headless: interaction; Lenso: eager). Cold-open totals expose that scheduling difference.

FCP is the browser paint entry. Article readiness requires the heading and unique code/body marker, observed over two animation frames, and is clamped to at least FCP. It is a visible-content readiness proxy, not LCP, a filmstrip or proof that all progressive Glass enhancement has finished. Initial action timing begins after page load and this content gate, without waiting for network idle. Bytes include received partial response data; full through-search bytes are sampled after network idle. Script/style/layout values are browser Performance counters and are not interchangeable with elapsed action time.

## Slow connection

80 ms latency, 200,000 bytes/s download; all durations below are milliseconds, transfer sizes are encoded HTTP bytes.

| Median metric                               | Exact headless | Exact Lenso | Fumadocs Core matched | Fumadocs UI matched |
| ------------------------------------------- | -------------: | ----------: | --------------------: | ------------------: |
| FCP                                         |            224 |        1492 |                   264 |                 980 |
| Article ready (FCP + two-frame observation) |          266.2 |        1520 |                 264.3 |                 980 |
| Navigation as first interaction             |          587.2 |       792.4 |                 231.3 |               452.9 |
| Cold open to first destination              |          897.7 |      3226.6 |                1461.4 |              2173.3 |
| First search action                         |          608.6 |       290.3 |                 405.2 |               833.8 |
| Cold open to first results                  |          927.8 |      2693.1 |                1635.8 |              2554.9 |
| Uncached navigation after search/counter    |          195.7 |       731.4 |                 201.6 |               269.9 |
| Back                                        |           49.3 |       378.4 |                  29.4 |                66.8 |
| Initial script CPU                          |           15.4 |        51.4 |                 160.5 |               173.5 |
| Initial style recalculation                 |           11.6 |       804.7 |                  21.4 |                19.4 |
| Initial layout                              |           55.8 |        85.7 |                    38 |                83.2 |
| First-navigation script CPU                 |           51.3 |        53.2 |                  39.1 |               186.9 |
| Bytes through first navigation              |         122330 |      223857 |                157791 |              266385 |
| Bytes transferred at initial action gate    |          25226 |      207481 |                156124 |              249551 |
| Bytes through search (network idle)         |         148484 |      250011 |                208814 |              314979 |
| Script bytes through search                 |         121916 |      133962 |                202229 |              276952 |
| Additional bytes after activated navigation |           1809 |      108230 |                  1667 |                4096 |
| Document requests through first navigation  |              1 |           1 |                     1 |                   1 |

## Fast connection

No additional latency, 10,000,000 bytes/s; still 4× CPU slowdown.

| Median metric                               | Exact headless | Exact Lenso | Fumadocs Core matched | Fumadocs UI matched |
| ------------------------------------------- | -------------: | ----------: | --------------------: | ------------------: |
| FCP                                         |            132 |         416 |                   116 |                 176 |
| Article ready (FCP + two-frame observation) |            152 |       448.3 |                 118.8 |               180.5 |
| Navigation as first interaction             |          245.4 |      1318.1 |                 129.7 |               292.2 |
| Cold open to first destination              |          442.7 |      2582.9 |                 484.6 |               767.9 |
| First search action                         |          135.2 |         186 |                    86 |               351.3 |
| Cold open to first results                  |          336.6 |      1388.6 |                 448.5 |               826.4 |
| Uncached navigation after search/counter    |          140.8 |       935.7 |                  94.4 |               163.5 |
| Back                                        |           53.1 |       485.4 |                  28.3 |                63.8 |
| Initial script CPU                          |           12.6 |        48.6 |                 153.6 |               164.9 |
| Initial style recalculation                 |            8.3 |       781.1 |                    24 |                18.7 |
| Initial layout                              |           54.9 |        93.7 |                  38.3 |                79.4 |
| First-navigation script CPU                 |           48.8 |        81.7 |                  35.3 |               138.8 |
| Bytes through first navigation              |         122330 |      372613 |                160521 |              267157 |
| Bytes transferred at initial action gate    |         106955 |      221392 |                156124 |              249551 |
| Bytes through search (network idle)         |         148484 |      398767 |                208814 |              314979 |
| Script bytes through search                 |         121916 |      282718 |                202229 |              276952 |
| Additional bytes after activated navigation |           1809 |        1809 |                  4397 |                4868 |
| Document requests through first navigation  |              1 |           1 |                     1 |                   1 |

## What adds the cost

The shipped component stylesheet is 1304527 raw / 82941 gzip bytes. The separate theme stylesheet is 3249 gzip bytes. The UI Web adapter entry alone is 104276 gzip bytes; it also imports presentation and supporting modules, so that entry is not the entire adapter footprint. All requested assets and their actual transfer sizes are retained in the fast network snapshots.

In the slow cohort the theme's initial style-recalculation median is 804.7 ms versus 11.6 ms headless; its initial script median is 51.4 ms. The fast cohort still exhibits high style cost, so bandwidth alone cannot explain the regression. The default adapter currently stages the complete component stylesheet/registry; neither is selected by the components actually used in these pages.

## Bounded navigation diagnostic

A separate three-sample fast-connection diagnostic records first navigation and a subsequent uncached navigation after network idle. It adds a DOM observer and is not part of the five-run medians. Added/removed counts are unique element identities seen in mutation records. Script/style/layout durations are counter deltas around the action; they are not a flamegraph or proof of one exact selector/function. “Warm” means the application/adapter is initialized, not that the target page body is cached.

| Case / phase                            | Elapsed ms | Script ms | Style ms | Layout ms | Added elements | Removed elements |
| --------------------------------------- | ---------: | --------: | -------: | --------: | -------------: | ---------------: |
| Exact headless (standard build) / first |      323.3 |      54.6 |     43.9 |       5.6 |            311 |              309 |
| Exact headless (standard build) / warm  |        104 |      28.6 |     19.4 |       5.6 |            309 |              309 |
| Exact default Lenso theme / first       |     1535.5 |     161.2 |   1171.9 |      11.3 |            554 |              531 |
| Exact default Lenso theme / warm        |     1173.1 |      79.4 |   1023.7 |       9.4 |            567 |              567 |
| Fumadocs UI matched / first             |      401.3 |     187.4 |     47.4 |       8.9 |            299 |              292 |
| Fumadocs UI matched / warm              |      109.5 |      46.5 |     12.4 |       5.9 |            294 |              294 |

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

```sh
EXACT_ROOT=/path/to/exact bun bench/theme/build.mjs
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/theme/cold-check.mjs
FUMA_THEME_MANIFEST="$PWD/.cache/theme-performance/build.json" FUMA_MEASURE_ONLY=1 FUMA_NAV_FIRST=1 PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat with FUMA_ACTIVATION_FAST=1 for the fast cohort.
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/theme/navigation-diagnostic.mjs
bun bench/theme/report.mjs
```
