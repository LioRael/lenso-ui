# Menu and Select animation work reduction

Date: 2026-11-08

The shared Menu/Select timeline sampled its new trajectory at 0ms and 1ms on
every animated transition, including a transition starting from rest. Those two
samples only contribute to position/velocity correction during an interruption.
Root popup samples also measure the trigger and positioner, and cascading
submenu samples measure the row and popup. Sample the correction trajectory
only while reversing an active animation. A normal start now takes one initial
sample instead of three, avoiding four redundant bounding-box reads for root
Menu and Select. Interrupted transitions retain both correction samples.

Menu and Select's shared highlight plate previously interleaved row measurements
with plate size, colour and radius writes. Read the complete row geometry,
offset-parent chain and computed appearance before writing the plate. Keep the
first-placement flush that prevents an entering highlight from travelling from
its previous location. Subsequent highlights retain their existing transition.

The sampled shape, duration, blur, refraction, trigger return and reduced-motion
policy are unchanged. Native Base UI continues to own selection, keyboard
navigation, scrolling, dismissal and focus. No public API, material recipe or
primitive component source changed in this pass.

## Exploratory measurements

Chromium, 1440×1000, existing daily docs preview on port 3000. Four runs per
case; the table uses medians of runs 1–3, excluding initial warm-up. The highlight
probe sends 12 ArrowDown and 12 ArrowUp keys through the twelve-row fixture.

| Highlight probe                     |   Before |    After |
| ----------------------------------- | -------: | -------: |
| Text Menu layout count              |        2 |        1 |
| Text Menu style recalculation count |      115 |      109 |
| Text Menu renderer task time        | 29.529ms | 24.551ms |
| Select layout count                 |        0 |        0 |
| Select style recalculation count    |       78 |       77 |
| Select renderer task time           | 23.348ms | 19.884ms |

The whole open/close probe did **not** show an overall task-time improvement:
warm medians were 255.254→257.929ms for text Menu, 178.750→210.245ms for icon
Menu, 186.406→194.239ms for Select and 190.725→195.505ms for stationary-source
Select. These before/after development-server runs were not alternating frozen
builds; they include native placement, material work and browser scheduling.
They establish neither a general CPU reduction nor smoother presented frames.
Keep the narrow work-elimination claim separate from full performance acceptance.

## Regression coverage

- Four existing DOM suites: 14 tests covering shape, full-channel interruption,
  circular/text source return, stable Select anchors, native scrub modifiers and
  touch scrolling, plus cascade reversal and reduced-motion cleanup.
- `menu-select-animation.mjs`: Chromium and WebKit, 1440px and 390px. Adds plate
  alignment checks after Home, ArrowDown and End; existing checks retain native
  selection/focus, reopening, icon/text return and reduced motion.
- `menu-action-group.mjs`: both engines and widths, default/photo menus. Adds
  highlight geometry checks across nested quick actions and ordinary rows.
- `menu-close-motion.mjs`: 28 engine/width/popup cases, including above-anchor,
  selected-row and stationary-source placement. Checks whole-panel contraction,
  source-label attachment, final source visibility and focus restoration.
- `menu-reversal.mjs`: 16 engine/width/family cases. Reopens a visible interrupted
  return and checks that its box and opacity remain continuous, then verifies
  settling and final focus. This covers component-level presenter lifetime,
  which the existing timeline unit test cannot observe.
- Affected formatting/lint, UI typecheck, package build and the isolated installed
  consumer check passed (exports, types, SSR and production assets).

The extended ink/re-entry suite passed its Chromium cases. Its initial WebKit
1440px run failed the separate homepage retained-glass-node assertion; the
isolated matching rerun passed. Preserve that first failure as a stability limit
rather than treating the first complete suite as clean. It did not fail a Menu
or Select motion assertion. The isolated WebKit 390px case also passed, completing
the four engine/width cases across the original and isolated runs.

Artifacts, baseline source copies, exploratory probes, raw metrics, screenshots
and candidate source hashes:
`/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-animation-performance/`.

These are scoped local checks on the daily preview, not production performance
acceptance, real Safari/iPhone validation or an exhaustive dark-theme audit.
