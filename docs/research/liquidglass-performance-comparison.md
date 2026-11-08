# Liquid Glass performance comparison

Historical baseline. The subsequent
[fusion computation refactor](glass-fusion-computation-refactor.md) records the
new implementation and a repeat of this production benchmark. Results below
describe the pre-refactor candidate.

Date: November 7, 2026. This compares the current Lenso working-tree build with
onlymoein/liquidglass commit `89f8b7360a4501940aba9b838710bceb56b23601` (0.11.2).
It measures the implementation after the material/motion follow-up. No runtime
code was changed during this investigation.

## Finding

The reference is substantially lighter during continuous group fusion. Ordinary
stationary controls and menu animation retain similar callback cadence. Lenso's
single moving group already consumes nearly the entire Chromium main-thread
budget; four groups exceed that budget in both tested engines.

This is a current implementation bottleneck, not evidence that adopting the
reference's appearance has also achieved its performance.

## Controlled setup

- Apple M2 Pro, Mac14,9, 16 GiB RAM; viewport 1200 × 800, DPR 1, light appearance.
- Playwright Chromium 156.0.8078.4 and WebKit 27.2. Chromium explicitly used
  `--use-angle=metal --enable-gpu`; CDP confirmed the Apple M2 Pro Metal renderer,
  accelerated compositing, rasterization and canvas. The default SwiftShader
  calibration run was excluded from the measurements below. WebKit used its
  default launch configuration; equivalent GPU diagnostics were unavailable.
- Separate minified Vite production entries, served by one local static server.
  Both use React/ReactDOM 19.3.1. No docs shell, development server or HMR runs
  inside either measured page. Builds and profiled runs occurred outside the
  formal measurement windows.
- Same existing photograph as a CSS backdrop, 120 × 60px standalone buttons,
  60 × 60px grouped circles, 6px physical gaps, and spacing prop 20. A group has
  three buttons. Each group's first member moves horizontally with the same
  22px sinusoidal transform. The existing library effects remain enabled.
- Each trial uses a fresh browser context, 800ms initial settling, 1000ms workload
  warm-up and 300ms further settling. Menu warm-up dismisses and waits 650ms.
  Measurement lasts 3000ms, or 4000ms for menu open/close cycles every 650ms.
- Three rounds alternate Lenso/reference order. Six scenarios × two libraries ×
  two engines × three rounds yield 72 measurement windows. Reported values are
  medians of the three trial statistics. No page errors occurred.
- Continuous press uses matching primary touch pointer events, with one control
  pressed among twelve. Menu activation invokes the real trigger's click and
  native component open/close lifecycle. Geometry movement writes the same
  transforms in both fixtures and is included in both measurements.

## Callback cadence

Values are p95 `requestAnimationFrame` callback intervals in milliseconds; lower
is better. These are main-thread scheduling measurements, not a compositor FPS
or physical display presented-frame counter.

| Scenario                                       | Chromium Lenso | Chromium reference | WebKit Lenso | WebKit reference |
| ---------------------------------------------- | -------------: | -----------------: | -----------: | ---------------: |
| 12 stationary buttons                          |           16.8 |               16.7 |           18 |               18 |
| 48 stationary buttons                          |           16.7 |               16.7 |           18 |               18 |
| One continuously pressed/moved button among 12 |           16.8 |               16.7 |           19 |               19 |
| One moving fusion group, 3 buttons             |           16.7 |               16.7 |           36 |               17 |
| Four moving fusion groups, 12 buttons          |        **100** |           **16.7** |      **145** |           **17** |
| One four-item menu repeatedly opening/closing  |           16.7 |               16.8 |           19 |               19 |

For four moving groups, median callback frequency was 21.1 versus 60.2 callbacks/s
in Chromium and 10.6 versus 60.1 in WebKit. Intervals exceeding 25ms represented
79.7% and 97.0% of Lenso callbacks respectively, versus 0% for the reference.
Those frequencies describe scheduling under the fixture, not true displayed FPS.

## Chromium main-thread and retained heap

`Performance.getMetrics` task duration includes main-thread work during the
measurement window. GC for retained-heap measurements occurs outside that window.
WebKit did not expose equivalent CDP metrics, so its CPU/heap values are omitted.

| Scenario                          | Window | Lenso task time | Reference task time | Lenso retained JS heap | Reference retained JS heap |
| --------------------------------- | -----: | --------------: | ------------------: | ---------------------: | -------------------------: |
| 12 stationary buttons             |     3s |            45ms |                54ms |               2.74 MiB |                   2.00 MiB |
| 48 stationary buttons             |     3s |            56ms |                54ms |               3.28 MiB |                   2.10 MiB |
| Continuous press among 12 buttons |     3s |           127ms |                87ms |               2.89 MiB |                   2.10 MiB |
| One moving fusion group           |     3s |     **2,977ms** |           **513ms** |               3.42 MiB |                   2.04 MiB |
| Four moving fusion groups         |     3s |     **3,005ms** |           **754ms** |               3.66 MiB |                   2.15 MiB |
| Repeated menu animation           |     4s |           306ms |               257ms |               4.54 MiB |                   2.38 MiB |

The single-group result explains why apparently smooth Chromium motion is not
performance headroom: its callback cadence remains close to 60Hz while the main
thread is nearly saturated. With four groups, callbacks are delayed substantially.
The fourth row is about 5.8× the reference's task time; this is not an overall
library performance multiplier. Heap measurements show retained size, not a leak
test or process/GPU memory measurement.

## Load footprint

The combined button/group/menu fixture loaded approximately **177.5 KiB gzip** of
Lenso JS + CSS versus **87.0 KiB** for the reference, including the same React
runtime and excluding the identical photograph. These are the observed fixture
entry costs, not package tarball sizes or an isolated material-function size.
Upstream injects its stylesheet from JS; that cost is counted in its JS response.
Optional Lenso GPU chunks were not loaded by these common-backdrop scenarios.

Local navigation-to-React-effect readiness for the twelve-button scene was
36.2ms versus 33ms in Chromium, and 30ms versus 24ms in WebKit. This uses a local
server, warm filesystem and no network throttling. It is not optical readiness,
FCP/LCP, or an internet/mobile cold-load benchmark.

## Hotspot sampling

A separate Chromium production run with source maps sampled four moving groups
for approximately three seconds. Profiling was not enabled during the 72 formal
windows. Source-map attribution stops at the retained distribution modules;
the corresponding current source was inspected to identify the owning functions.

Lenso's largest self-sampled locations were:

| Location                                      | Share of sampled time |
| --------------------------------------------- | --------------------: |
| `paintFusionContour` mask pixel accessor `at` |                 33.7% |
| Optical map pixel `paint`                     |                 11.9% |
| Fusion distance/normal `sample`               |                  6.8% |
| `paintFusionContour` outer loop               |                  6.1% |
| `appleShade`                                  |                  5.4% |
| `gaussianTail`                                |                  4.8% |
| `maps` outer work                             |                  3.0% |
| `encodeOpticalMap`                            |                  2.5% |
| `fusionOutline`                               |                  1.3% |

The contour accessor and outer loop together account for about 40% of this
sample. The reference profile spent about 70% of sampled time idle; its main
active locations were distance evaluation and vector outline construction.
Sampling percentages are diagnostic self-time observations, not a promise that
removing one function would yield an equal end-to-end speedup.

Source confirms the distinction:

- [Lenso contour painting](../../packages/glass/src/fusion-contour.ts) rasterizes a
  2× mask, reads pixels, scans the canvas and reconstructs the edge image as the
  outline changes.
- [Lenso union optics](../../packages/glass/src/fusion-optics.ts) also rebuilds
  geometry-dependent [optical maps](../../packages/glass/src/refraction.ts),
  shade and encoded images for the changing field.
- [Reference GlassGroup](https://github.com/onlymoein/liquidglass/blob/89f8b7360a4501940aba9b838710bceb56b23601/src/glass-group.tsx)
  primarily publishes the vector outline to masks, shadow and rim paths.

The measured priority is to reduce contour rasterization and repeated optical
map/shade work during moving fusion. Cache stable material work and separate
shape publication from expensive optical preparation; evaluate parameterized GPU
geometry while preserving shared optics and light. Press style recalculation and
load footprint are secondary targets. Spring constants are not the measured
fusion bottleneck.

## Boundaries and reproducibility

The existing effects are not pixel identical. In particular, Lenso has a broader
neck and shared union optics/light; the reference uses different rim/shadow and
optical handling. Physical geometry and input are matched, not every visual
operation. The measurements establish current implementation costs and do not
normalize both libraries to an identical feature set.

This fixture uses a common CSS photographic backdrop. It does not exercise
Lenso's explicitly registered image/live-page GPU capture path, video, arbitrary
page capture, dark appearance, DPR 2/3, native Safari, real iPhone, battery/power,
GPU hardware execution time, or long-duration leaks. GPU process CPU counters in
the raw Chromium records are not GPU utilization or GPU execution time.

Raw trials, environment diagnostics, source fixtures, minified builds, source
maps and `.cpuprofile` files are retained in
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-performance/`.
`summary.json` is regenerated from `raw.jsonl` with an explicit engine/library/
scene/count/mode grouping. No production optimization, release or deployment is
implied by this comparison.
