# Glass performance: omit unused group shade

Date: November 8, 2026.

Follow-up: [fusion mask preparation](glass-fusion-mask-performance-2026-11-08.md)
measures a later candidate. That investigation also corrected the static
fixture's obsolete appearance prop: the intended dark captures below were
actually light. The field matrix and actual glass-lab continuity checks use
explicit, working dark-mode inputs and retain their stated coverage.

This round removes unused optical preparation from shared group materials.
It provides a measured improvement for the worker CPU path, especially one
moving group with staggered members. It does **not** establish overall
high-load performance acceptance: aligned four-group samples were slower.

## Change

The material compositor already omits the standalone inner shade for a
`materialSurface: "group"` lens. Its field preparation still sampled and encoded
that shade, sent it from the worker, and discarded it when constructing the
filter. Staggered integral planes additionally allocated a full-plane
`Float64Array` of local material coordinates solely for this unused shade.

`optical-fields.ts` and `fusion-gpu.ts` now pass the surface role to the shade
helpers. Both shade helpers omit group rasters, CPU preparation omits the local
coordinate buffer, and the GPU path accepts a group without a shade image.
Displacement, contour tracing, material transfer, density, blur, motion,
scheduling and the decoded-plane handoff retain their existing behavior. No
public API, dependency or primitive component source changed.

For a 360×120 CSS-pixel integral CPU plane at density 2, the removed coordinate
and shade buffers total 3,456,000 bytes (3.30 MiB) per preparation. This is an
allocation calculation, not a measured reduction in retained process memory.

## Fresh workload comparison

The baseline is this working checkout immediately before the change, including
the November 8 material/shadow work. Historical November 7 measurements are
not substituted for this baseline. Both frozen production fixtures use the same
UI/styles builds, photo, geometry and motion. There is no upstream-library
comparison in this round.

Sixty windows: two engines × three alternating rounds × two implementations ×
five scenarios (12 idle buttons, one/four aligned moving groups, one/four
staggered moving groups). Viewport 1200×800, DPR 1, light appearance, 3-second
measurement windows after warm-up. Staggering adds an 8px margin to the first
member, selecting the supported CPU field path. Builds, tests and profilers did
not run concurrently with these windows.

Chromium 156.0.8078.4 uses ANGLE Metal on Apple M2 Pro; WebKit is 27.2.
All sixty windows completed without page errors.

All CPU entries below are medians over three trials, in accumulated process CPU
milliseconds per window. Aggregate is the median of each trial's renderer +
GPU-process + browser-process sum.

| Chromium workload     | Renderer before → after | Aggregate before → after |
| --------------------- | ----------------------: | -----------------------: |
| 12 idle buttons       |             53.5 → 51.1 |              77.4 → 76.9 |
| One aligned group     |           1,598 → 1,588 |            2,374 → 2,351 |
| Four aligned groups   |           3,376 → 3,489 |            5,188 → 5,396 |
| One staggered group   |           3,432 → 2,696 |            4,165 → 3,357 |
| Four staggered groups |           5,797 → 5,513 |            7,553 → 7,405 |

The staggered single-group aggregate reduction is **19.4%** (renderer **21.5%**).
Its completed worker field replies remain 180 per window. Four staggered groups
reduce aggregate CPU by only **2.0%**, while median replies rise from 276 to 306;
main-thread task duration rises from 1,205 to 1,308 ms. These are different
amounts of completed optical work, not a fixed-throughput CPU comparison.

Aligned four-group aggregate CPU is **4.0% higher** in these samples. Three
rounds do not establish its cause or a stable regression size; the result is
retained as an unresolved limit, not described as a performance pass. The
aligned path previously reused a cached shade, so removing it offers much less
per-update work reduction than the staggered path.

Chromium callback-interval p95 remains about 16.7–16.8 ms. WebKit p95 stays 18 ms
for idle and single-group cases; four aligned groups change 21→23 ms and four
staggered groups 23→19 ms. Staggered four-group field replies rise 185→261.
These intervals measure callback scheduling, not presented display frames.
The harness provides no equivalent WebKit process CPU counter; missing data
are not zero CPU. GPU-process CPU is host work, not GPU execution time or power.

## Isolated field preparation

A separate browser benchmark prepares 25 changing 360×120 planes per trial,
after three warm-up preparations, with five alternating rounds per engine.
This exercises the CPU field preparation directly, outside the UI workload.

| Median elapsed time for 25 planes |   Before |    After | Reduction |
| --------------------------------- | -------: | -------: | --------: |
| Chromium, aligned                 | 321.5 ms | 328.6 ms |     −2.2% |
| Chromium, staggered               | 495.6 ms | 336.2 ms |     32.2% |
| WebKit, aligned                   |   410 ms |   410 ms |        0% |
| WebKit, staggered                 |   488 ms |   412 ms |     15.6% |

This is preparation latency, not a frame-rate or overall CPU acceptance result.

## Fidelity and checks

- Forty field cases across Chromium/WebKit: light/dark, small/clear,
  aligned/staggered/fractional/grouped geometry, plus non-group controls.
  Every retained displacement, highlight, contour and silhouette comparison has
  maximum decoded channel difference 0. Non-group shade also matches exactly.
  Eight actual GPU preparation pairs preserve displacement exactly and exercise
  acceleration rather than accepting a fallback silently.
- Eight whole-page before/after pairs (16 captures): both engines,
  aligned/staggered groups at matched stationary poses. A later audit found
  that the fixture passed the obsolete `appearance` prop instead of `theme`;
  both intended appearances were light. These captures establish light-mode
  equivalence only. Maximum channel
  difference and mean absolute difference are 0 in every pair. Worker GPU/CPU
  delivery is asserted for the respective geometry. One resulting capture was
  also visually inspected. This is scoped equivalence, not native Apple parity.
- Frozen production glass-lab continuity: all eight existing light/dark/clear/
  uniform checks pass, including held PNG decode and newly exposed face checks.
  Maximum stationary settled difference is .398; newly exposed face difference
  is .313 Chromium / .280 WebKit, within the maintained test limits.
- Glass unit tests: 34 pass. Glass DOM tests: 32 pass. Affected container,
  preferences, press-highlight and toolbar DOM tests: 16 pass. The two new
  cases catch accidentally sampling or allocating a group shade; geometry
  coverage alone does not catch unused material work.
- Affected format, lint and glass typecheck pass. Glass production package build,
  frozen browser fixture builds, and installed-consumer exports/types/SSR/assets
  check pass. DOM tests do not prove painting or geometry.

Cross-package DOM execution exposed test pollution from a nonconfigurable
`document.fonts` stub. The existing package suites pass separately (32 + 16);
their global test setup was not changed in this performance round.

Initial live docs full-sequence runs failed at clear appearance while other
browser checks were running. Clear-only checks then passed for both the
preserved baseline and candidate. Finally, full-sequence runs with no other
browser checks running passed all eight cases for both versions, including the
unchanged maintained test against the current dev server. The initial failures
are retained in the evidence; timing sensitivity is plausible, but its cause
was not isolated and concurrent-load continuity is not claimed.

Real iOS, native Safari, other GPUs, power, complete accessibility/theme
acceptance and the repository-wide landing candidate gate were not run.
No source was landed, released or deployed.

## Reproduction evidence

[Frozen fixtures, source snapshots, raw trials and pixel checks](/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/glass-performance/README.md)
include `source-sha256.json`, both 3-round workload datasets, isolated field
trials, eight screenshot comparisons, continuity scripts and validation logs.
The retained scripts use absolute local paths; remap them when moving evidence.
