# Menu feedback and foreground-lens initialization

Date: 2026-11-08

The shared Menu feedback originally repainted both scale and translation from
each scale, x and y spring callback. Scale callbacks now write only scale, and
x/y callbacks write only translation. The scale value no longer needs a second
copy in the shared offset object. Calls remain synchronous; no extra animation
frame, microtask, scheduler, spring tuning or public API was introduced.

Menu/Select foreground ink previously activated its lens at the default full
strength, then immediately updated it to zero before the first popup pose.
Seed the zero amount before activation, preserving the resting-panel fit while
avoiding the discarded full-strength update. Optical maps, shape, blur and the
subsequent time-based refraction are unchanged. Cascading menus share this code.

## Measured work

Chromium and WebKit, 1440×1000 daily preview at port 3000, matched paused-clock
input sequences. The gesture probe presses a Menu row, samples eight 16ms
steps, drags outside for eight more, then releases and samples fifty steps.
It counts calls writing the two feedback properties. Comparison is within
each engine/fixture, not an engine-to-engine performance comparison.

| Gesture fixture                 | Before | After |
| ------------------------------- | -----: | ----: |
| Chromium text Menu              |    224 |   112 |
| Chromium icon Menu              |    224 |   112 |
| Chromium stationary-source Menu |    188 |    94 |
| WebKit text Menu                |    224 |   112 |
| WebKit icon Menu                |    224 |   112 |
| WebKit stationary-source Menu   |    224 |   112 |

Feedback property writes halved in all six cases. All 396 sampled scale,
translation and computed-transform states matched exactly. Select deliberately
keeps elastic feedback disabled, so this gesture gain is not claimed for Select.

The separate open/Escape probe covers text Menu, icon Menu, selected-row Select
and stationary-source Select in both engines. Each case made 22 fewer writes
to connected control-lens SVG elements after the initialization reorder.
Opening at 176ms and closing at 128ms produced identical optical graphs,
encoded maps, clipping, transforms and filter references in all 16 comparisons,
after normalizing generated filter IDs. Source hashes for the popup, cascade,
contour/refraction, control lens and Menu styles remained unchanged between runs.

These are work counts and sampled output comparisons, not aggregate CPU,
presented-frame, power or screenshot pixel-parity results. The probes use the
daily preview, not frozen production builds.

## Validation scope

Affected format/lint and UI typecheck passed, together with 14 existing
Menu/cascade motion DOM tests. These small private changes use existing
regressions and matched before/after gesture probes rather than adding a test
that mirrors the implementation.

Rendered regressions passed all 16 interrupted-return cases, eight quick-action
engine/width/fixture cases and four standard Menu/Select engine/width cases,
including selection, focus return, icon/text return and reduced motion.
The package build and installed-consumer exports/types/SSR/production-assets
check also passed; verification.json records the results.
Real Safari/iPhone, exhaustive theme coverage and production performance
acceptance remain unverified. This pass does not establish a fix for the
intermittent mobile selection-retention failure recorded in the preceding pass.

Artifacts: `/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-feedback-and-ink-performance/`.
That directory contains baseline source copies, candidate source and hashes,
dependency hashes, probe scripts, raw results and comparison.json. The probes
retain their original local output paths under /tmp/lenso-menu-animation-round3.
