# Shared GPU displacement follow-up

Date: November 8, 2026.

This is the retained implementation of the nonaligned GPU optimization. The
[first exploratory candidate](glass-staggered-gpu-performance-2026-11-08.md)
raised aligned-control concerns and was replaced. Its measurements are kept
separately, not pooled with the fresh comparison below.

Chromium aggregate CPU decreases **25.0%** for one staggered group and **29.7%**
for four staggered groups against the same preserved pre-round baseline. The
revised aligned moving controls do not reproduce the earlier decrease in
WebKit field throughput. The idle CPU control is higher, so this is not overall
regression-free or power acceptance.

Delivery scope: final hash checking detected concurrent changes in
`foreground-rim.ts`, `live-rim.ts` and `refraction.ts`. They were preserved;
the two optimization modules still match the measured source exactly. The
performance and whole-page comparisons below apply to the frozen candidate,
not the complete subsequently changed working tree. Current-tree integration
checks are recorded separately below.

## Implementation and ownership

The displacement shader already supports independently positioned rounded
rectangles. Its old row-alignment gate existed to reuse an equal-height shade,
which shared group materials no longer display.

- [fusion-gpu.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/src/fusion-gpu.ts)
  removes the unconditional alignment exclusion and retains the original direct
  shade-helper call structure.
- [apple-material.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/src/apple-material.ts)
  owns whether a repeated shade is available. Missing row data returns
  `undefined`; group surfaces already decline that shade. Ordinary materials
  without repeatable rows therefore keep the CPU path without throwing.
- A maintained regression in
  [group-shade.dom.test.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/test/browser/group-shade.dom.test.ts)
  catches that missing-row case. The previous group-only cases could not catch
  a shade exception disabling the worker shared by other eligible planes.

The shader and its double-precision repair, density, blur, material transfer,
mask, scheduling and decoded-plane handoff are unchanged. Existing exclusions
remain for mixed materials, grouped hulls, per-corner geometry, more than 16
members, zoom, spectral highlight and anchored-edge outputs. No public API,
dependency, primitive component source or generated contract changed.

## Fresh frozen measurements

The baseline includes the earlier shade and mask optimizations. Both production
fixtures use the same UI/styles, photo, geometry and motion, with computed light
mode asserted. Candidate source and builds were frozen before timing.

Sixty windows: five workloads × two implementations × Chromium/WebKit × three
alternating rounds, at 1200×800 and DPR 1. Measurement windows last 3 seconds
after warm-up. An 8px margin creates the staggered geometry. Each group window
asserts real GPU delivery in the aligned controls and CPU→GPU delivery in the
staggered comparison. Builds, tests, captures and profiles do not run during
these timings. All sixty windows complete without page errors.

Chromium is 156.0.8078.4 on ANGLE Metal / Apple M2 Pro; WebKit is 27.2.
Entries are medians in accumulated CPU milliseconds per window. Aggregate is
the median of each trial's renderer + GPU-process + browser-process sum.

| Chromium workload     | Aggregate CPU before → after | Renderer CPU before → after | Main-thread task before → after |
| --------------------- | ---------------------------: | --------------------------: | ------------------------------: |
| 12 idle buttons       |                 59.2 → 130.7 |                 40.9 → 88.6 |                     21.9 → 47.9 |
| One aligned group     |                2,210 → 2,129 |               1,449 → 1,416 |                       486 → 459 |
| Four aligned groups   |                5,037 → 4,880 |               3,311 → 3,188 |                   1,125 → 1,062 |
| One staggered group   |                3,165 → 2,374 |               2,554 → 1,602 |                       445 → 506 |
| Four staggered groups |                7,146 → 5,021 |               5,411 → 3,277 |                   1,061 → 1,103 |

Staggered single-group replies remain **180→180**. Four-group replies change
**382→373**, so its 29.7% aggregate reduction accompanies 2.4% fewer completed
fields; this is not a strictly fixed-throughput result. Main-thread task time
increases in the staggered cases: field computation is relieved, while
presentation remains a separate cost. The aggregate counter includes GPU-process
host work rather than claiming renderer relief alone as a total saving.

The idle aggregate control rises by about **72 ms per 3-second window** and
has zero fusion field replies. Its cause and repeatability were not isolated;
the higher result is retained and prevents a universal no-regression or idle
power claim. The lower aligned CPU medians are controls, not additional claimed
optimization wins.

Chromium callback-interval p95 stays around 16.7–16.8 ms. WebKit:

| Workload              | Callback p95 before → after | Completed field replies before → after |
| --------------------- | --------------------------: | -------------------------------------: |
| 12 idle buttons       |                  18 → 18 ms |                                  0 → 0 |
| One aligned group     |                  18 → 18 ms |                              179 → 179 |
| Four aligned groups   |                  18 → 18 ms |                              342 → 342 |
| One staggered group   |                  18 → 18 ms |                              179 → 176 |
| Four staggered groups |                  19 → 18 ms |                              268 → 338 |

Four staggered WebKit groups complete **26.1%** more fields in these medians.
Replies measure worker completions, not presented frames or committed visible
planes. WebKit has no equivalent process CPU counter in this harness.
GPU-process CPU is host activity, not GPU execution time or hardware power.

## Precision and runtime checks

- **214 real-worker checks pass again for this source:** 194 accelerated field
  comparisons have maximum decoded displacement/shade difference 0 and matching
  scale against the preserved CPU implementation. They cover aligned,
  staggered, fractional, vertical, unequal-height and overlapping geometry with
  2/3/8/16 members in actual light/dark small/clear inputs. The other 20 checks
  cover unsupported outputs and missing/lost contexts. Precision repair is
  exercised, not bypassed by accepting a silent CPU fallback.
- **24 whole-page pairs, 48 captures:** both engines, actual computed light/dark,
  aligned/staggered/fractional/vertical/unequal-height/mixed geometry. Actual
  worker backends and shared membership are asserted. Every pair has maximum
  channel difference and mean absolute difference 0, including all 16 newly
  accelerated scene pairs.
- **Eight production-worker GPU fault views** remain visible through worker CPU
  delivery in both engines and themes. Missing GL and owned-context loss produce
  screenshots exactly matching four normal GPU controls, with no page errors.
- Production glass-lab and unchanged maintained dev continuity each pass all
  eight light/dark/clear/uniform held-decode cases. Maximum stationary settled
  difference is .398; newly exposed face difference is .313 Chromium / .280
  WebKit, within existing limits.
- The maintained group-alignment check passes both engines, including idle
  drawing, material/contour ownership, iOS 26 restoration, keyboard release,
  reduced motion and forced colors.
- Glass unit **34**, glass DOM **33**, and affected component DOM **16** tests
  pass. Affected format/lint/type checks, glass production build, frozen fixtures
  and installed-consumer export/type/SSR/asset checks pass. DOM tests alone do
  not establish painting or layout.

After detecting concurrent source changes, the current package was rebuilt and
its integration checks repeated: unit **36**, glass DOM **33**, component DOM
**16**, typecheck (82 files), installed-consumer verification and all eight
maintained dev continuity cases pass. The additional unit cases belong to the
parallel work. This does not substitute for rebenchmarking those concurrent
rendering changes. Source drift and current-check logs are retained alongside
the frozen evidence.

These samples establish scoped equivalence on this GPU, not a universal
floating-point or native Apple rendering proof. Physical iOS, native Safari,
other GPUs, wide-gamut output, hardware power, complete theme/RTL/large-text
acceptance and the repository-wide candidate gate were not run. No change was
landed, released or deployed; overall high-load/power acceptance remains open.

## Evidence

[Frozen source/builds, raw trials, field inputs, screenshots, faults and logs](/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/glass-performance-round3b/README.md)
preserve this implementation separately from the exploratory candidate. The
baseline source and compiled assets are the same preserved pre-round revision.
Scripts use absolute local paths and dependency symlinks; remap them if moving
the evidence and do not rebuild fixtures while measuring.
