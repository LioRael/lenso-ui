# Continuous menu expansion and animation cost

Date: 2026-11-08

## Diagnosis and physical reference

The two reported opening defects were reproducible in the old geometry functions.
For a 140×44 source and a 250×600 panel, the text opening was already about
78×259 at 48ms: height approached its destination while width was still narrow.
The circular opening added extra height and vertical travel through
`1 - roundness`. As corners flattened, a tall menu therefore began another
height expansion. In that same 600px fixture, height advanced from 166px at
160ms to 281px at 192ms and 370px at 208ms. Late peak height speed was
approximately 5.64px/ms, versus 1.54px/ms in the initial phase.

A separate SwiftUI fixture with stock twelve-action Menus was installed on the
physical iPhone 15 Pro Max running iOS 27.2. Its wide glass label and circular
More source contain inert actions and no personal data. The recording is
`/Users/leosouthey/.iphone-use/runs/recordings/2026-11-07T20-04-38Z.mp4`.
This supplements the shorter Files reference in
[the circular-menu report](menu-icon-device-alignment.md).

Native menus can briefly neck before blooming. Removing all narrowing would
therefore contradict the recording. The important distinction is continuous
proportionate growth, rather than an almost full-height column or a second
height rollout tied to corner flattening. In the tall circular capture, the
panel reaches roughly 761 of its final 790 capture pixels by about 184ms; its
corners and small overshoot continue settling afterward.

The stream is variable-rate, roughly 25–30fps while moving, with static frames
deduplicated. Bounds were estimated from frame differences and visually checked;
source erasure contaminates the earliest wide-label difference bounds. Those
bounds do not establish a precise label trajectory. Terminal/source geometry and
corner estimates are fitted within several pixels, and onset lies between
captured frames. No native spring mass, stiffness or damping was recovered.

## Geometry and retained optical behavior

`menu-curves.ts` normalizes the short and tall captured outlines and interpolates
between them by final panel aspect ratio. Each channel uses monotone cubic
Hermite interpolation with continuous knot velocity. Measured overshoot remains;
interpolation does not add new extrema between measured knots. Height and centre
move continuously, independently of corner settling. Opening settles at 442ms.

Both circular and text Menu/Select sources now use that common opening geometry.
A wide source retains an early width residual with a fitted 44ms Gaussian scale;
this is an adaptation, not a directly measured Apple parameter. The centred tall
probe does not identify diagonal travel, so its normalized vertical centre
trajectory also drives horizontal interpolation when a consumer has an offset
anchor. Closing was subsequently unified in the
[whole-panel closing follow-up](menu-whole-panel-closing.md). Stationary
sources, Base UI placement/selection/focus, reversal handling and reduced-motion
behavior remain under their existing contracts.

The foreground blur and rim-refraction tails remain independent of width and
clear at rest. Background material, transparency, sampling density and fusion
recipes are unchanged. Existing blur/fade timings were retained; these captures
do not uniquely identify native ink opacity or blur strength.

## Reducing repeated work

- The menu supplies its already-computed local lens box and measured content
  dimensions. The control lens avoids repeating geometry reads for that owner;
  other controls retain the measured path. An independent scaled-DOM test checks
  equivalent displacement placement and zero additional owner layout reads.
- Presentation-only style mutations no longer trigger preference rereads.
  Real tint, contrast, transparency, class, media and optical-style changes still
  notify observers. Lens activation uses the observed opaque state rather than
  reading computed preferences on every frame.
- Style writes skip unchanged values. Neutral menu lenses omit the unused shape
  PNG when neither replacement masking nor rim blur needs it. Displacement map
  resolution and optical math are retained.
- The decoded map budget is bounded at 16MiB and 32 entries, up from 8MiB. The
  alternating DPR2 main/tall menu working set fits without repeated encoding.
  This trades up to 8MiB of additional retained map data for less repeated work.
- Chromium retains its filter ID during parameter updates. WebKit and other
  engines retain the previous ID-invalidation path. Browser pixel tests compare
  zero refraction, active refraction and a forced ID change: activation changes
  pixels and forced invalidation produces identical active pixels in both tested
  engines. This checks the fixture, not every engine version or SVG graph.

## Performance measurement

The maintained runner is `apps/docs/test/menu-animation-performance.mjs`.
It mounts the exact Chinese Default menu example and a twelve-action circular
menu in an isolated docs-hosted fixture. Chromium uses Metal/GPU at 1440×1000.
Each round alternates text and circle; each interaction waits 650ms open and
650ms after Escape, with a 250ms settled gap. The first round is reported as cold
and excluded from the three warm-round medians. Animation-frame sampling reads
no geometry. Before and after use the same runner and windows; the candidate's
opening lasts 442ms instead of 400ms.

CDP `TaskDuration` measures renderer main-thread busy time. It does not measure
total browser/process CPU, GPU cost or OS energy. These are local measurements,
not a broad performance acceptance result. The initial cold round also includes
map creation and must not be represented as warm interaction performance.

| Source / metric             | Before | Candidate A | Candidate B |
| --------------------------- | -----: | ----------: | ----------: |
| text / main-thread ms       |  206.0 |       202.6 |       201.1 |
| text / style recalculations |  217.0 |       181.0 |       182.0 |
| text / rAF p95 ms           |   16.8 |        16.8 |        16.8 |
| icon / main-thread ms       |  216.5 |       196.2 |       218.1 |
| icon / style recalculations |  214.0 |       159.0 |       145.0 |
| icon / rAF p95 ms           |   33.2 |        16.8 |        33.4 |

The two complete candidate runs are both retained. Warm text main-thread time
falls about 1.7–2.4%; circle time ranges from a 9.4% reduction to a 0.7% increase.
Style-recalculation counts fall about 16–32%, but total main-thread savings and
frame-tail improvement are not established consistently. No stable total CPU
improvement is claimed. Cold text main-thread times were 331.5ms before and
598.0ms / 348.4ms afterward; cold circle times were 245.8ms before and
250.1ms / 255.8ms afterward. Cold behavior also needs further profiling.

Intermediate measurements made after a blocked build used old compiled output;
they were discarded and are not included in the comparison.

## Verification

- Regression geometry tests failed before the change for both reported defects.
  Afterward, 16 targeted React motion/activation/submenu tests pass, including
  measured short-menu anchors, continuous knot velocity, reversal and source return.
- Glass DOM: 28 tests / 213 assertions; glass unit: 31 tests / 55,663 assertions.
  Coverage includes explicit geometry equivalence, preference reactivity and
  alternating-menu cache reuse.
- Rendered continuous expansion: Chromium/WebKit × 1440/390, all four cases pass
  for the exact text Default example and tall circular menu.
- Existing Select/Menu selection, focus, source return and reduced-motion cases:
  all four combinations pass. The initial combined run reported one WebKit
  `[object Event]` page error while generated/build assets were changing; separate
  desktop and mobile reruns with a settled server pass. Its cause was not proven.
- Existing stationary-source ink/spacing and glass re-entry suite: all four cases
  pass. Control-lens repaint pixel comparisons and shared glass-button elastic
  regression checks pass in Chromium and WebKit.
- Package build, affected format/lint, glass/UI/docs typechecks, installed-consumer
  exports/types/SSR/production-assets test and generated-contract round-trip pass.
  The round-trip covers 218 documents, 1,240 example graphs and 92 style maps.

The tests cover component geometry and behavior, not exact native visual parity.
The baseline is an isolated component benchmark, not the complete docs page or
four continuously moving fusion groups. Physical iPhone capture establishes the
native reference; current web rendering was checked in desktop Chromium and
Playwright WebKit, not in a full real-device web performance run.
