# Fusion CPU optimization follow-up

Date: November 7, 2026.

The later [material/contour alignment](glass-reference-alignment.md) changes the
candidate after these CPU measurements. These numbers describe the pre-alignment
build; performance was not reaccepted for the later material pass.

## Acceptance result

The candidate reduces four-group renderer CPU by **36.5%** and aggregate
renderer + GPU + browser CPU by **28.2%** against the preceding worker refactor.
It **does not pass** the requirement to stay at or below the original continuous
four-group CPU cost. Renderer CPU remains **5.7% above** the original; aggregate
CPU remains **34.0% above** it. WebKit high-load scheduling still trails the
reference. This is a measured local improvement, not overall CPU/power acceptance.

Checked material and fusion output remain unchanged against the original Lenso
implementation. This does not establish broader Apple/native/reference parity;
retain the limitations in the [material audit](glass-material-consistency-audit.md).

## Computation path retained

- Eligible aligned, shared material planes compute the original displacement
  equations in worker WebGL 2, at unchanged 2× optical density. A conservative
  uncertainty mask identifies quantization and contour boundary pixels for the
  original double-precision CPU sampler to repair before PNG encoding.
- The common, aligned material shade is reused only when interpolation error
  cannot change a quantized channel. Its cache key uses actual raster dimensions;
  images remain full size and lossless. Other materials/geometry use the existing
  CPU path. A missing/lost GL context falls back without removing the material.
- A pixel-pack buffer and fence avoid synchronously waiting for every readback.
  Encoding reuses a private CPU-oriented 2D canvas; the shared queue prevents its
  storage from being overwritten before encoding completes.
- Integer contour-graph indices replace per-edge string keys. Conservative
  exterior support lists skip interior pixels while retaining original raster
  coverage, glints and dilation. Invariant image byte views are read once.
- Released transient filter graphs are detached and reused within eight graphs
  and 4 MiB. New inputs must decode before publication; old optical planes and
  silhouette intersections remain alive through the existing handoff.
- Generated optical SVG resources do not recursively invalidate background
  consumers. Repeated writes to already-fused members are skipped. A maintained
  DOM regression verifies that real backdrop edits still invalidate consumers.

No component prop, primitive component source, material formula, blur, spectral
split, union blend radius, tracing step, elastic response, optical resolution or
explicit frame-rate limit changed. No dependency was added. Custom PNG codecs,
WASM, atlas batching and active-filter replacement experiments are not retained.

## Unchanged 72-window production benchmark

Six original scenarios × two libraries × Chromium/WebKit × three alternating
rounds. Viewport 1200×800, DPR 1, photo, geometry, motion, warm-up and window
lengths match the [original benchmark](liquidglass-performance-comparison.md).
Chromium 156.0.8078.4 uses Apple M2 Pro Metal; WebKit is 27.2. The reference is
onlymoein/liquidglass 0.11.2, pinned to
`89f8b7360a4501940aba9b838710bceb56b23601` (local checkout verified).

The accepted run is `benchmark-candidate`, copied from `acceptance72`.
Its compiled assets and source were frozen during all 72 windows; builds,
profilers and other browser tests did not run concurrently. Subsequent rejected
experiments were reverted, the source matched the accepted SHA-256 list, package
builds were restored and the exact measured fixture was reinstated. Exploratory
runs and the earlier checkpoint are excluded from the accepted comparison.

The original 72-window baseline is historical; a fresh original-build probe
reproduced renderer CPU at 3,796 ms and aggregate CPU at 4,386 ms for four groups,
close to the original 3,771 / 4,365 ms. This supports retaining the original
baseline rather than attributing the gap to changing machine load.

### Four continuously moving groups: CPU

All entries are medians over three trials, in accumulated CPU milliseconds per
3-second measurement window. Aggregate is the median of each trial's summed
process deltas, not the sum of independently chosen medians.

| Metric                    | Original | Previous worker refactor | Candidate |
| ------------------------- | -------: | -----------------------: | --------: |
| Renderer CPU              |    3,771 |                    6,281 |     3,986 |
| GPU-process CPU           |      475 |                    1,435 |     1,520 |
| Browser-process CPU       |      120 |                      471 |       362 |
| Aggregate CPU             |    4,365 |                    8,144 |     5,850 |
| Main-thread task duration |    3,005 |                    1,646 |     1,509 |

The fresh reference consumes 897 ms renderer CPU and
1,481 ms aggregate CPU under the same four-group
workload. The libraries do not render identical material implementations, so
this is a matched UI workload, not identical shader work.

For one moving group, candidate renderer CPU is 1,949 ms and aggregate CPU
2,799 ms, versus 3,529 / 4,312 ms in the preceding refactor. These single-group
savings do not override the four-group acceptance failure.

CPU deltas include worker/native renderer threads; multiple threads can exceed
3,000 ms per window. GPU-process CPU measures host work, not GPU execution time.
This is not a power measurement. The harness exposes no equivalent WebKit CPU
counter; its zero placeholders are **unavailable data**, not zero CPU use.

### Callback interval p95

Milliseconds; each value is the median of three trial p95 values. This measures
requestAnimationFrame scheduling, not actual presented display frames.

| Scenario               | Chromium previous | Candidate | Reference | WebKit previous | Candidate | Reference |
| ---------------------- | ----------------: | --------: | --------: | --------------: | --------: | --------: |
| 12 stationary buttons  |              16.8 |      16.7 |      16.8 |            18.0 |      18.0 |      17.0 |
| 48 stationary buttons  |              16.7 |      16.7 |      16.7 |            17.0 |      18.0 |      18.0 |
| Press among 12 buttons |              16.7 |      16.7 |      16.8 |            18.0 |      18.0 |      18.0 |
| One moving group       |              16.8 |      16.8 |      16.8 |            17.0 |      18.0 |      18.0 |
| Four moving groups     |              16.8 |      16.7 |      16.8 |            26.0 |      27.0 |      17.0 |
| Menu animation         |              16.7 |      16.8 |      16.7 |            18.0 |      18.0 |      18.0 |

All 72 windows completed without page errors. Four-group intervals above 25 ms
were 0% in Chromium and 8.1% in WebKit (previously 0% / 5.8%). WebKit's 26→27 ms
p95 is not claimed as an improvement. Static/press/menu callback scheduling
remains broadly unchanged; their full CPU records are included in the artifact.

## Fidelity and regression evidence

- **88 pixel comparisons:** both engines, aligned/staggered/mixed/grouped shapes,
  fractional positions, small/clear/tinted/iOS 26/spectral/zoom materials and
  standalone/selection controls. Decoded displacement, shade, highlight, contour,
  silhouette and zoom outputs match the saved original, maximum difference 0.
- **12 whole-page comparisons:** both engines, light/dark, four groups at three
  poses. Every screenshot has MAE 0 and maximum channel difference 0.
- **8 held-decode continuity cases:** stationary face difference 0 while PNG
  decoding is held; settled values remain below 0.5. Newly exposed face checks
  pass with differences 3.307 / 3.054. These checks do not prove every motion frame
  on every browser is flicker-free.
- **16 material states:** light/dark and concentration 1/.75/0/1 in both engines;
  neck/body channel differences are at most 1 (limit 3). Actual worker delivery is
  required, preventing a broken asset URL from silently passing via fallback.
- Four GL-unavailable/context-loss cases and four missing/blocked-worker cases
  retain a visible CPU material path without page errors. The normal path
  delivers all four planes through one worker.
- 30 unit tests, 19 DOM regressions, affected lint/type checks, full package builds
  and the installed-consumer package check pass. DOM tests do not verify layout.

The final diagnostic profile was collected separately after the accepted run.
Worker samples still show native PNG conversion, readback and image transport
cost; the presentation thread still traces/rasterizes contours and reads styles.
Reducing field math alone has not eliminated the aggregate cost of continuously
publishing and compositing optical images. Active-filter replacement and native
reader probes did not reduce measured aggregate CPU and were reverted.

Real iOS, native Safari, other GPU vendors, wide-gamut output and hardware power
were not retested. The quantization repair is validated on these two engines and
this Apple GPU; the checked cases are not a universal floating-point proof.

## Reproduction artifacts

[Raw trials, fixtures, source snapshots, profiles and verification logs](/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-fusion-cpu)
include `comparison.json`, process environment, source/build SHA-256 manifests,
the original unchanged runner, both measured production fixtures, original and
previous baselines, image-equivalence fixtures and before/after screenshots.
The preview remains [glass-lab](http://127.0.0.1:4337/cn/glass-lab).
