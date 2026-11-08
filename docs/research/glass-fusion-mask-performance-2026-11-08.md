# Fusion mask preparation performance

Date: November 8, 2026.

Follow-up: [nonaligned GPU displacement](glass-staggered-gpu-performance-2026-11-08.md)
measures a later candidate against this implementation. The figures below
describe the preceding mask-preparation change.

This follow-up improves aligned moving groups against the preceding
[group-shade optimization](glass-performance-2026-11-08.md). Chromium aggregate
CPU falls **6.7%** for four aligned groups, with essentially unchanged optical
update throughput. This is a scoped improvement, not overall performance or
power acceptance. Staggered single-group CPU remains inconclusive.

## Implementation

- [fusion.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/src/fusion.ts)
  generates the initial or non-Apple bridge mask where it is consumed, instead
  of also serializing discarded masks during ordinary Apple-plane tracking.
- [fusion-optics.ts](/Users/leosouthey/Projects/framework/lenso-ui/packages/glass/src/fusion-optics.ts)
  skips bridge SVG generation for shared material planes, retains it for mixed
  materials, and reuses one current contour-mask URL within an update.
- The group contour strokes a vector path. It no longer allocates or fills the
  raster support list used only by the other contour renderer. Prominent,
  iOS 26, mixed-material and retiring pixel contours retain that support list.

Contour tracing, optical sampling, shaders, material recipes, density, blur,
interaction, scheduling and decoded-plane ownership are unchanged. The
asynchronous commit still checks its revision before updating the live contour;
the retained optical silhouette intersection remains in place. No public API,
dependency, primitive component source or generated contract changed.

A fresh diagnostic profile identified contour tracing, material reads and mask
updates on the presentation thread. Profiles are separate diagnostic captures,
not before/after CPU acceptance measurements. The changes remove unused work
from that path without introducing another cache or reducing output precision.

## Frozen workload measurements

The baseline includes the preceding shade optimization. Both production
fixtures use the same UI/styles builds, photo, geometry and motion. Final source
and compiled fixtures were frozen during timing; an earlier exploratory pilot
with different mask-write ordering is excluded.

Sixty windows: two implementations × Chromium/WebKit × three alternating
rounds × five workloads. Viewport 1200×800, DPR 1, light appearance, 3-second
windows after warm-up. An 8px margin on the first member selects the supported
staggered CPU-field path. A separate five-round, ten-window Chromium retest
investigates its single-group result. Builds, tests, captures and profilers did
not run concurrently with timing windows.

Chromium 156.0.8078.4 uses ANGLE Metal on Apple M2 Pro; WebKit is 27.2.
All seventy timing windows completed without page errors.

CPU entries are medians in accumulated CPU milliseconds per window. Aggregate
is the median of each trial's renderer + GPU-process + browser-process sum;
task duration is the main-thread task counter. Replies count completed optical
fields during the same measurement window.

| Chromium workload     | Aggregate CPU before → after | Main-thread task before → after | Field replies before → after |
| --------------------- | ---------------------------: | ------------------------------: | ---------------------------: |
| 12 idle buttons       |                  77.8 → 75.5 |                     28.2 → 23.9 |                        0 → 0 |
| One aligned group     |                2,587 → 2,172 |                       585 → 486 |                    180 → 180 |
| Four aligned groups   |                5,611 → 5,233 |                   1,312 → 1,151 |                    349 → 347 |
| One staggered group   |                3,712 → 3,926 |                       605 → 594 |                    172 → 177 |
| Four staggered groups |                7,468 → 7,390 |                   1,377 → 1,204 |                    292 → 336 |

Four aligned groups reduce aggregate CPU **6.7%** and main-thread task duration
**12.3%**, with field replies differing by less than 1%. One aligned group
reduces aggregate CPU **16.1%**. Four staggered groups reduce aggregate CPU only
**1.0%**, while completing **15.1%** more optical updates; that is a different
amount of completed work, not a fixed-throughput comparison.

The initial staggered single-group sample increases aggregate CPU **5.8%**.
The independent five-round retest reverses the median direction: 3,640→3,440 ms
(−5.5%), with replies 180→179. Its paired trials vary in both directions; even
the median paired CPU change is slightly positive. Neither a stable saving nor
a stable regression is established for that case. The retest is retained
separately rather than pooled into a more favorable result.

Chromium callback-interval p95 stays around 16.7–16.8 ms. WebKit results:

| WebKit workload       | Callback p95 before → after | Field replies before → after |
| --------------------- | --------------------------: | ---------------------------: |
| 12 idle buttons       |                  18 → 18 ms |                        0 → 0 |
| One aligned group     |                  18 → 18 ms |                    178 → 165 |
| Four aligned groups   |                  25 → 24 ms |                    205 → 226 |
| One staggered group   |                  17 → 18 ms |                    178 → 179 |
| Four staggered groups |                  21 → 18 ms |                    239 → 264 |

The single aligned WebKit group completes fewer fields in these samples; its
unchanged callback p95 does not establish unchanged optical throughput. Larger
group scheduling improves in these medians, but does not establish stable
display presentation or overall WebKit acceptance. The harness provides no
equivalent WebKit process CPU counter. GPU-process CPU is host work, not GPU
execution time or hardware power.

## Output and interaction evidence

- **160 exact vector outlines:** grouping, spacing, fractional poses, staggered
  members and per-corner geometry produce identical SVG strings with and
  without the optional raster support list.
- **24 matched whole-page pairs, 48 captures:** both engines, actual light/dark
  modes, aligned/staggered, prominent, mixed, iOS 26 and distinct tint-preference
  states. Computed material mode, version, worker delivery and shared/mixed
  membership are asserted. Twenty-three pairs have maximum channel difference 0. One Chromium light mixed-preference pair has maximum 3/255 and RGBA MAE
  .0000683, concentrated on control edges. Two subsequent matched captures of
  that case, plus before/before and after/after controls, have difference 0.
  The initial difference is retained; its cause is not isolated and this is
  not a universal bit-exact rendering proof. A genuine dark capture was also
  visually inspected.
- After initialization, each shared four-group pose encodes **0** bridge masks
  versus **12** in the baseline. Mixed variants and distinct preferences still
  encode their required bridge masks (**8** versus **12**). The probe checks
  real encoded SVG output instead of accepting an unexercised branch.
- Production glass-lab and the unchanged maintained dev continuity script each
  pass all eight light/dark/clear/uniform held-decode cases. Maximum stationary
  settled difference is .398; newly exposed face difference is .313 Chromium /
  .280 WebKit, within existing limits.
- The maintained group-alignment browser check passes in both engines,
  including material/contour ownership, idle drawing, iOS 26 restoration,
  keyboard press/release, reduced motion and forced colors.
- Glass unit tests **34 pass**, glass DOM tests **32 pass**, and affected
  container/preferences/press-highlight/toolbar DOM regressions **16 pass**.
  Affected format, lint and glass typecheck pass. The production glass package,
  frozen fixtures and installed-consumer exports/types/SSR/assets check pass.
  DOM tests do not prove painting or layout.

## Correction to earlier static theme evidence

The inherited static fixture passed the obsolete `ThemeScope appearance` prop;
its intended dark captures actually stayed light. That also affects the static
captures cited by the preceding shade report, which has been corrected. The
earlier explicit dark optical-field inputs and actual glass-lab dark toggle
were valid. All workload timings were explicitly light-only and are unaffected.

Final static fixtures use `ThemeScope theme` and assert the computed mode on
every control. The 48 captures above use the corrected fixtures. Obsolete
captures are retained with explicit labels rather than used as dark evidence.
The distinct-preference fixture also uses the actual tint-amount input instead
of assigning the renderer-owned derived paint variable.

## Limits and reproduction

No real iOS, native Safari, other GPU vendors, hardware power, full theme/RTL/
large-text acceptance or repository-wide landing candidate gate was run. No
change was landed, published or deployed. These results do not replace the
remaining high-load acceptance work.

[Fixtures, source/build snapshots, raw trials, profiles, captures and logs](/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/glass-performance-round2/README.md)
include source SHA-256 manifests and separate accepted, retest and exploratory
datasets. Benchmark assets remain frozen; corrected theme visuals use separate
builds. Scripts contain absolute local paths and need remapping when moved.
