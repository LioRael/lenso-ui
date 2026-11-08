# Fusion computation-path refactor

Date: November 7, 2026.

This is the first worker-refactor measurement. See the subsequent
[CPU optimization report](glass-fusion-cpu-optimization.md) for the current
candidate and aggregate process CPU accounting.

## Result

The refactor substantially improves interaction scheduling and reduces the cost
of completing a fixed set of optical updates. Checked material and fusion
outputs remain pixel-identical to the saved pre-refactor implementation.
It is **not an overall CPU/power acceptance**: four continuously moving groups
consume more renderer-process CPU per second, and WebKit still trails the
reference under that load. Existing reference-material calibration gaps remain
those documented in the [material audit](glass-material-consistency-audit.md).

## Computation path

- Extracted optical field preparation from DOM filter construction into
  `optical-fields.ts`. Field buffers are allocated as ImageData without creating
  a canvas/context merely to obtain pixel storage.
- Fusion planes share one module worker. Each plane has one in-flight field;
  its existing drain retains only the latest waiting geometry. Independent
  per-plane workers were rejected after an exploratory run increased renderer
  CPU to about 13.5 seconds per 3-second four-group window.
- The worker uses the same geometry, displacement, material and lossless PNG
  functions as the synchronous fallback. The live contour, press light, decoded
  filter construction and atomic publication remain on the rendering thread.
  The retained optical coordinate plane and silhouette intersection are unchanged.
- Compatible shared planes no longer calculate or encode an unused rim,
  subtractive contour or silhouette. A highlight is still generated whenever
  spectral edge saturation consumes it. Mixed materials retain their outputs.
- Raster loops cache dimensions and material constants. Exterior coverage uses
  byte reads before evaluating edge shading. Geometry precomputes invariant
  dimensions/thickness and skips normal/material interpolation for zero-weight
  participants. Integral optical grids retain Float64 local coordinates for the
  shade pass; fractional grids preserve the independent original samples.
- Repeated shade pixels reuse only exactly equal local coordinates. Knob-only
  Gaussian calculations run only for knob materials.

No optical density, refraction coefficient, tone curve, blur, contour tracing
step, blend radius, elastic behavior or public component prop was reduced or
changed. No primitive component source was edited.

## Same production benchmark

The original harness was repeated unchanged: six scenarios, both libraries,
Chromium and WebKit, three alternating rounds, for **72 windows**. Viewport,
DPR, photo, geometry, input trajectories, warm-up and measurement durations
match the [original report](liquidglass-performance-comparison.md). Chromium
again used the Apple M2 Pro Metal renderer. Reference remains
`onlymoein/liquidglass` 0.11.2 at
`89f8b7360a4501940aba9b838710bceb56b23601`.

The final production build was frozen before measuring. Builds, profilers and
other browser tests did not run during its 72 measurement windows. All windows
completed without page errors. An interrupted intermediate run is archived
separately and excluded. The original pre-refactor 72-window medians are shown
as the historical baseline; an additional fresh eight-window pre-edit probe
reproduced its bottleneck (four-group p95: Chromium 100ms, WebKit 114ms).

Values below are medians of trial p95 callback intervals, in milliseconds.
They measure main-thread requestAnimationFrame scheduling, **not actual
presented display FPS**.

| Scenario                    | Chromium before | Chromium after | Chromium reference, repeated | WebKit before | WebKit after | WebKit reference, repeated |
| --------------------------- | --------------: | -------------: | ---------------------------: | ------------: | -----------: | -------------------------: |
| 12 stationary buttons       |            16.8 |           16.8 |                         16.7 |            18 |           18 |                         18 |
| 48 stationary buttons       |            16.7 |           16.7 |                         16.8 |            18 |           17 |                         18 |
| Press/move among 12 buttons |            16.8 |           16.7 |                         16.7 |            19 |           18 |                         18 |
| One moving fusion group     |            16.7 |           16.8 |                         16.7 |            36 |           17 |                         17 |
| Four moving fusion groups   |             100 |           16.8 |                         16.8 |           145 |           26 |                         17 |
| Repeated menu animation     |            16.7 |           16.7 |                         16.7 |            19 |           18 |                         18 |

Four-group callback frequency improved from 21.1 to 59.8 callbacks/s in Chromium
and from 10.6 to 50.3 in WebKit. The fraction of intervals exceeding 25ms changed
from 79.7% to 0% and from 97.0% to 5.8%, respectively. WebKit high-load
scheduling remains below the reference; the small idle/menu changes are not
claimed as optimization wins.

## Main-thread relief versus total CPU

Chromium task durations below include main-thread work during the 3-second
window. Renderer-process CPU includes worker and other renderer threads;
multiple threads can accumulate more than three seconds. It excludes the
separately running GPU process and is not a power measurement.

| Scenario           | Main task time before | Main task time after | Main task time reference | Renderer CPU before | Renderer CPU after | Renderer CPU reference |
| ------------------ | --------------------: | -------------------: | -----------------------: | ------------------: | -----------------: | ---------------------: |
| One moving group   |               2,977ms |                623ms |                    426ms |             3,663ms |            3,529ms |                  535ms |
| Four moving groups |               3,005ms |              1,646ms |                    738ms |             3,771ms |            6,281ms |                  879ms |

Single-group main-thread work fell about 79%; four-group main-thread work fell
about 45%. Four-group renderer CPU **rose about 67%** under continuous motion.
The recovered callback cadence permits more presentation updates, so lower
main-thread occupation must not be reported as lower total processing cost per
second. This remains a material performance limitation, not a passed energy gate.
WebKit exposes no equivalent CPU metrics in this harness.

The moving-group fixture loads about 184.1 KiB gzip of JS/CSS including its
worker, versus the old 177.5 KiB and reference 87.0 KiB. The repeated main-page
heap metric is about 3.15 MiB for one group and 3.70 MiB for four; worker heaps
are outside that metric. Neither total memory reduction nor leak freedom is
claimed.

## Fixed completed work

A separate Chromium Metal probe compares the saved immediate pre-edit build
with the final candidate. Four groups receive the same forty translations
(-20 through +19 CSS pixels). Each step waits until every group's newly decoded
optical filter is published before issuing the next step. Thus both versions
complete the same 160 group poses instead of comparing different amounts of
work in a fixed time window. Three rounds alternate order; startup is excluded.
This supplemental experiment does not replace or change the original benchmark.

| Median of three trials       |  Before |   After |
| ---------------------------- | ------: | ------: |
| Elapsed time for forty steps | 5,368ms | 2,031ms |
| Main-thread task time        | 5,046ms |   458ms |
| Renderer-process CPU         | 6,238ms | 2,731ms |

For this fixed completed workload, renderer CPU fell about 56% and elapsed time
about 62%. These results show reduced cost for equal completed optical updates;
they do not negate the higher CPU consumption of continuous four-group motion.

## Image and lifecycle verification

- **88 decoded-pixel comparisons passed with maximum channel difference zero.**
  Twenty-eight geometry cases cover two engines, light/dark, aligned and
  fractional/staggered/mixed/grouped geometry, clear, tinted, iOS 26, spectral
  and zoom recipes. They compare the old fields, new synchronous fields and
  worker fields, including full outputs used by mixed-material compositions. Sixty additional
  standalone cases cover light/dark/non-Apple, selection, clear, spectral,
  magnification and knob fields.
- **Twelve complete rendered comparisons were identical:** both engines,
  light/dark, four groups at -18/0/+18px translations, DPR 1. Saved before and
  after screenshots have zero channel differences. These are settled poses;
  they do not certify every in-motion optical field's publication latency.
- Existing held-decode continuity: all eight cases passed. A stationary face
  had zero pending-decode difference; settled differences remained below 0.5.
  Newly exposed-area differences remained 3.071 in Chromium and 2.637 in WebKit.
- Actual `/cn/glass-lab` material checks: all sixteen preference/theme states
  passed with at most one RGB unit of member/neck difference. The test now also
  requires successful worker delivery, so a broken worker URL cannot pass by
  silently using the fallback.
- Both engines used exactly one worker for four planes. Missing and
  constructor-blocked workers retained a working synchronous material path.
  DOM tests cover shared ownership, resolving pending work on teardown and
  retiring a failed idle worker. The last owner terminates the worker.
- Package dependency build: eight tasks successful. Glass unit tests: 30;
  optical DOM tests: 18; installed consumer package/StyleX/SSR test: one.
  Affected format/lint and glass/UI/tokens/docs typechecks passed.

No native Safari, real iPhone, DPR 2/3, battery/power, worker-heap, long-duration
leak or complete docs-production-export acceptance was performed. Existing
browser-specific native-backdrop limits from the material audit still apply.
Antislop review is scoped to preserving existing materials and interaction;
this change introduces no page layout, copy, decorative surface or motion design.

## Evidence and reproduction

Archive:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-fusion-refactor/`.

`final-results/raw.jsonl` contains only the final 72 windows; `summary.json`
is regenerated by the original summarizer. `candidate-source-manifest.json`
records the frozen source hashes. The archive includes immediate pre-edit
source/builds, final builds, original fixture scripts, the pinned reference
build, pixel comparison sources/results, before/after screenshots, fallback
and lifecycle logs, and the separate fixed-work trials. Intermediate quick and
interrupted runs are diagnostic evidence, not final measurements.

The benchmark fixture still uses `/tmp/lenso-glass-performance`, port 4357 and
absolute checkout imports, as described in the original fixture README. Restore
its retained source/config/HTML/photo, serve the candidate as `dist/lenso` and
reference as `dist/upstream`, link the existing dependencies, and run the
unchanged `run.mjs` with a new `RESULTS_DIR`. Source rebuilding requires the
current generated theme chunk and pinned reference checkout. No release,
publication or landing is implied.
