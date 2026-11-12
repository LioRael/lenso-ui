# React and Exact Glass comparison

Measured 2026-11-11T21:11:30.240Z. Local production source builds; no shared implementation was changed for this experiment.

## Conditions

- Public React Glass and public Exact Contract Glass, sharing the same instrumented Glass engine source. Production React, no StrictMode. Browser screenshots are reviewed after optical initialization, not just DOM visibility.
- 8 panels, each 260 × 120 CSS pixels, radius 24 px, glass-small profile, blur 15.3 px, light appearance, DPR 2, 1200 × 900 viewport. Same marked Backdrop source (one 6000 px gradient div), panel placement and control styling; geometry is asserted before every sample. The supported source-copy path visibly blurs in WebKit as well as Chromium.
- Matched cohorts force liveBackdrop=false at the engine boundary, matching React Glass's current default. Exact-default retains liveBackdrop=true. This override only exists in the generated benchmark bundle.
- 5 fresh browser contexts per cohort and engine; cohort order rotates each round. Chromium uses 4× CPU throttling with cache disabled; WebKit has no CPU throttle. Requests use a local server with no network throttle. Compare within an engine, not between engines.
- The application is loaded before enabling Glass. First-enable timing starts at the enable click and ends after all 8 rim images are assigned plus two animation frames. This is a presentation opportunity, not an instrumented GPU completion timestamp, and excludes initial document/application loading. Any UI hatch imported on the first enable is included in click-to-attach.
- Scroll: a 3000 ms animation window, two up/down cycles over 3000 px, retaining every rAF interval observed; a slow final frame can overshoot the window. Interaction: 40 real pointer clicks, each updates all 8 labels, with a minimum 35 ms pause between updates. Click commit is DOM mutation latency; presentation adds two rAF callbacks.
- Lifetime wrappers count actual attachGlass/release and internal attachOptics/cleanup calls, with WeakMap identities plus live DOM and Exact root identity checks. They are injected by the benchmark build plugin; package sources are untouched.

## Results

All table values are medians across runs; times are ms. “Click p95” is the median of each run's 40-click p95. rAF gaps are a scheduling proxy, not GPU frame presentation or a full FPS measurement.

## Findings

This fixture does not show an overall Exact advantage. First enable is slower in both engines. Chromium has a larger pre-attach delay in Exact, and higher total style/layout work across 40 clicks. Small commit differences and the two-rAF presentation metric do not establish a general interaction win.

WebKit's marked-source copy path has large rAF gaps in both frameworks. All 30 samples retain the same 8 DOM owners and optical bindings through scroll and 40 counter updates, with zero release/optics-stop calls while mounted. This does not qualify navigation retention.

### chromium 156.0.8078.4

| Cohort        | Enable | Click to first attach | Attach to ready | Click commit p95 | Click presentation p95 | Scroll rAF p95 | Scroll gaps >25 ms (%) |
| ------------- | -----: | --------------------: | --------------: | ---------------: | ---------------------: | -------------: | ---------------------: |
| react         |  254.7 |                  13.7 |           241.0 |              1.8 |                   29.5 |           33.4 |                   34.8 |
| exact-matched |  376.4 |                 143.3 |           224.0 |              1.5 |                   11.5 |           33.4 |                   42.3 |
| exact-default |  351.0 |                 131.0 |           220.0 |              1.6 |                   10.9 |           33.4 |                   35.3 |

Main-thread CPU work from CDP (includes benchmark overhead; excludes GPU/compositor work):

| Cohort        | Enable task | Scroll task | Scroll script | Interaction task | Interaction script | Interaction style + layout |
| ------------- | ----------: | ----------: | ------------: | ---------------: | -----------------: | -------------------------: |
| react         |       215.3 |       143.6 |          27.8 |           1283.1 |              863.5 |                      112.2 |
| exact-matched |       328.4 |       118.1 |          36.6 |           1857.3 |              935.3 |                      516.8 |
| exact-default |       311.6 |        98.5 |          27.7 |           1832.3 |              934.4 |                      508.5 |

### webkit 27.2

| Cohort        | Enable | Click to first attach | Attach to ready | Click commit p95 | Click presentation p95 | Scroll rAF p95 | Scroll gaps >25 ms (%) |
| ------------- | -----: | --------------------: | --------------: | ---------------: | ---------------------: | -------------: | ---------------------: |
| react         |  491.0 |                   4.0 |           487.0 |              1.0 |                   27.0 |          317.0 |                   78.6 |
| exact-matched |  704.0 |                  39.0 |           665.0 |              1.0 |                   28.0 |          324.0 |                   78.6 |
| exact-default |  740.0 |                  38.0 |           704.0 |              1.0 |                   30.0 |          321.0 |                   78.6 |

## First-enable dispersion

Min–max across five runs (ms), exposing local scheduling variability:

| Engine / cohort          |   Min |   Max |
| ------------------------ | ----: | ----: |
| chromium / react         | 205.6 | 357.6 |
| chromium / exact-matched | 303.4 | 605.7 |
| chromium / exact-default | 316.9 | 588.4 |
| webkit / react           | 478.0 | 543.0 |
| webkit / exact-matched   | 660.0 | 757.0 |
| webkit / exact-default   | 690.0 | 876.0 |

## Instance lifetime

| Engine / cohort          | attachGlass | release | optics start | optics stop | Unique DOM owners | Same DOM / Exact root  |
| ------------------------ | ----------- | ------- | ------------ | ----------- | ----------------- | ---------------------- |
| chromium / react         | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | DOM retained; root n/a |
| chromium / exact-matched | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | all retained           |
| chromium / exact-default | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | all retained           |
| webkit / react           | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | DOM retained; root n/a |
| webkit / exact-matched   | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | all retained           |
| webkit / exact-default   | 8–8         | 0–0     | 8–8          | 0–0         | 8–8               | all retained           |

## Boundaries

These results cover stable mounted Glass with shared counter updates and programmatic document scrolling. They do not establish navigation, routing, conditional removal/reinsertion, resize, theme switching, custom backdropSource providers, native macOS/iOS performance, or a real device GPU ranking. A root-state guarantee alone does not prove Glass retention in those scenarios. The scrolling background is one marked CSS-gradient source, which exercises WebKit backdrop copying; it does not cover complex document, photo, or video capture.

The Exact cohort bundles its real broad UI hatch; React imports the real public Glass component. This is a consumer integration comparison, not a claim about the intrinsic speed of either framework. This measures activation after initial page load, not cold-page loading; a deferred UI hatch load still contributes to first-enable timing. A discarded pilot with an unmarked body background did not visibly blur in WebKit and is excluded from all tables. Local headless runs are sensitive to concurrent machine load; small differences should not be treated as wins.

## Reproduce

From the repository root:

```sh
EXACT_ROOT=/path/to/initialized/exact bun experiments/glass-comparison/build.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright WEBKIT_EXECUTABLE=/path/to/pw_run.sh bun experiments/glass-comparison/run.mjs
bun experiments/glass-comparison/provenance.mjs
bun experiments/glass-comparison/report.mjs
```

Frozen asset SHA256 hashes and machine details: [results/provenance.json](results/provenance.json). Raw samples and lifetime events: [results/results.json](results/results.json). Round-zero screenshots are in results/. The build output is isolated under this experiment's .cache/. Preview servers and browsers started by the runner are closed on completion.
