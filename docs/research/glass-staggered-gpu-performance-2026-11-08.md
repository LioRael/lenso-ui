# GPU displacement for nonaligned shared glass

Date: November 8, 2026.

This document records the first exploratory candidate, which is not retained.
The [follow-up implementation](glass-staggered-gpu-follow-up-2026-11-08.md)
moves the missing-row decision into shade preparation and measures a separate
candidate against the same preserved baseline. Do not apply the figures below
to that later source or pool the datasets.

This follows the [mask preparation optimization](glass-fusion-mask-performance-2026-11-08.md).
Against that working baseline, Chromium aggregate CPU decreases **26.4%** for
one staggered group and **30.0%** for four staggered groups. Completed worker
field replies are equal or differ by less than 1%. Overall performance and
power acceptance remain incomplete; aligned control samples still raise
regression concerns, especially in WebKit.

## Implementation

The existing displacement shader already accepts independently positioned
rounded rectangles. Its eligibility check still required equal-height members
on the same row, originally needed to reuse a uniform shade image. Shared
`materialSurface: "group"` materials no longer consume that shade.

[fusion-gpu.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/src/fusion-gpu.ts)
now requires row alignment only when preparing a repeated shade. Supported
shared group planes can use the existing GPU displacement path when staggered,
vertical, fractionally positioned or unequal in height. Materials that still
need the repeated shade retain their alignment requirement.

The existing exclusions remain: mixed materials, grouped hull transitions,
per-corner radii, more than 16 members, zoom, spectral highlight and anchored
edge output. Missing or lost GL contexts still select the CPU path. The shader,
double-precision CPU repair, density, material transfer, blur, mask, scheduling
and decoded-plane handoff are unchanged. No public API, dependency, primitive
component source or generated contract changed.

A fresh staggered-group worker profile identified CPU field preparation and PNG
assembly. After the change, active worker samples chiefly show native PNG
conversion and GPU readback. These are separate diagnostic profiles, not
process CPU or power measurements.

## Fresh workload comparison

Both frozen production fixtures use the same UI/styles builds, geometry, photo
and motion. The baseline contains both preceding performance rounds. Timing
uses actual light mode, asserted from computed material properties.

Sixty windows: five workloads × two implementations × Chromium/WebKit × three
alternating rounds. Viewport 1200×800, DPR 1, 3-second windows after warm-up.
Staggering adds an 8px margin to the first member. Every moving-group window
asserts real worker field delivery: aligned groups use GPU in both versions;
staggered groups use CPU before and GPU after. Builds, profiles, captures and
other tests did not run concurrently with timing windows.

Chromium 156.0.8078.4 uses ANGLE Metal on Apple M2 Pro; WebKit is 27.2.
All sixty windows completed without page errors. A separate ten-window,
five-round WebKit aligned-group retest also completed without page errors.

CPU entries are medians in accumulated CPU milliseconds per window. Aggregate
is the median of each trial's renderer + GPU-process + browser-process sum,
not the sum of independently selected process medians.

| Chromium workload     | Renderer CPU before → after | Aggregate CPU before → after | Main-thread task before → after |
| --------------------- | --------------------------: | ---------------------------: | ------------------------------: |
| 12 idle buttons       |                 63.9 → 59.0 |                  97.5 → 85.2 |                     33.4 → 31.1 |
| One aligned group     |               1,452 → 1,502 |                2,174 → 2,270 |                       484 → 508 |
| Four aligned groups   |               3,254 → 3,203 |                5,008 → 4,939 |                   1,103 → 1,106 |
| One staggered group   |               2,606 → 1,609 |                3,225 → 2,372 |                       457 → 508 |
| Four staggered groups |               5,402 → 3,215 |                7,142 → 5,001 |                   1,060 → 1,082 |

The staggered single-group renderer reduction is **38.2%**, with aggregate
reduction **26.4%** and replies **180→180**. Four staggered groups reduce renderer
CPU **40.5%** and aggregate CPU **30.0%**, with replies **379→376**. The aggregate
accounting includes the GPU-process host cost rather than presenting renderer
relief alone as a total saving.

Main-thread task duration increases **11.1%** for one staggered group and
**2.1%** for four; this round optimizes field preparation, not all presentation
work. The unchanged aligned single-group path has **4.4% higher** aggregate CPU
in these samples. Its cause and repeatability were not isolated. The idle and
aligned controls are retained, not claimed as additional optimization wins or
evidence of universal absence of regressions.

Chromium callback-interval p95 remains around 16.7–16.8 ms. WebKit results:

| WebKit workload       | Callback p95 before → after | Completed field replies before → after |
| --------------------- | --------------------------: | -------------------------------------: |
| 12 idle buttons       |                  18 → 18 ms |                                  0 → 0 |
| One aligned group     |                  18 → 18 ms |                              179 → 179 |
| Four aligned groups   |                  19 → 20 ms |                              336 → 288 |
| One staggered group   |                  18 → 18 ms |                              179 → 179 |
| Four staggered groups |                  19 → 19 ms |                              258 → 320 |

Four staggered WebKit groups complete **24.0%** more fields at unchanged median
callback p95. Replies measure worker completions, not presented frames or
committed visible planes. No equivalent WebKit process CPU counter is available.
GPU-process CPU is host activity, not GPU execution time; hardware power was
not measured. These results do not establish stable display presentation or
overall WebKit acceptance.

The aligned four-group control completes **14.3% fewer** fields in the initial
WebKit samples. Its separate five-round retest has p95 **21→23 ms** and field
replies **285→241** by independent medians. Paired trials vary in both directions
(field changes +42, −6, −123, −7, +14); their median field change is −6, while
median paired p95 improves by 1 ms. This does not establish the cause or a
stable regression size, and it does not establish unchanged performance.
Both datasets are retained separately. The candidate is **not accepted for
overall WebKit/high-load performance** on this evidence.

## Precision, fallback and interaction

- **214 real-worker checks:** 96 geometry/theme/profile combinations per engine
  plus one pre-context-loss GPU field per engine yield **194 accelerated
  comparisons** against the preserved CPU implementation. Aligned, staggered,
  fractional, vertical, unequal-height and overlapping geometry cover 2, 3, 8
  and 16 members in light/dark small/clear materials. Every decoded displacement
  and shade comparison has maximum channel difference 0; scale also matches.
  Each engine compares 10,514,672 pixels and exercises 1,204,971 CPU precision
  repairs. Eight unsupported-input checks and two context faults per engine
  account for the other **20** checks.
- **24 whole-page pairs, 48 captures:** both engines and actual light/dark
  modes cover aligned, staggered, fractional, vertical, unequal-height and
  mixed materials. Computed modes, membership and actual CPU/GPU backends are
  asserted. All **16 newly accelerated scene pairs** match exactly. Overall,
  23 pairs have maximum difference 0; an unchanged Chromium light mixed-CPU
  control has maximum 2/255 and RGBA MAE .0000909. Its cause was not isolated.
  This is scoped equivalence, not a universal floating-point or rendering proof.
  A genuine dark vertical-group capture was also visually inspected.
- **Eight production-worker GPU fault cases:** missing GL and deliberately lost
  contexts in both engines and themes retain visible CPU field delivery without
  page errors. All eight whole-page comparisons against the four healthy GPU
  controls have maximum difference and MAE 0. Only owned test-worker contexts
  are changed; no system GPU setting is modified.
- Production and unchanged maintained dev glass-lab continuity each pass all
  eight light/dark/clear/uniform held-decode cases. Maximum stationary settled
  difference is .398; newly exposed face difference is .313 Chromium / .280
  WebKit, within the existing limits.
- The maintained group-alignment browser check passes in both engines, covering
  material/contour ownership, idle drawing, iOS 26 restoration, keyboard release,
  reduced motion and forced colors.
- Glass unit tests **34 pass**, glass DOM tests **32 pass**, affected component
  DOM regressions **16 pass**. Affected format, lint and glass typecheck pass.
  Glass package and production fixture builds pass, as does installed-consumer
  export/type/SSR/asset verification. DOM tests do not establish painting/layout.

An initial auxiliary static mask counter ran before every baseline plane was
initialized and failed on the baseline. Explicit field/member readiness was
added before resetting that counter for the WebKit captures. No library source
or numerical tolerance changed; the initial log is retained.

## Remaining scope and evidence

Native Safari/iOS, other GPUs, wide-gamut output, hardware power, full theme/
RTL/large-text acceptance and the repository-wide landing candidate gate were
not run. No source was landed, released or deployed. The changes do not replace
the remaining high-load acceptance work.

[Frozen source/builds, field inputs, raw trials, images, profiles and logs](/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/glass-performance-round3/README.md)
include source SHA-256 manifests and separate timing, numerical, visual and
fault-test results. The scripts use absolute local paths; remap them if moving
the evidence. Do not rebuild fixtures during timing.
