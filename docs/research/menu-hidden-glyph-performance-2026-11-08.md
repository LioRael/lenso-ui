# Menu and Select hidden-glyph work

Date: 2026-11-08

Menu and Select's shared presenter prepared a trigger glyph even with
`morphTrigger={false}`. Closing a stationary-source Select also cloned its new
label into a glyph that would remain invisible. During ordinary morphs, the
presenter continued updating glyph transforms and blur after glyph opacity
reached zero.

Prepare and refresh glyph geometry only for morphing sources, and write its
transform/filter only while its opacity is positive. Opacity remains updated on
every pose, and the first visible pose supplies its current transform and blur
synchronously. Native selection, focus, placement, source tracking, popup
contours, optical ink, trajectories and interruption corrections remain owned
by their existing implementations. No animation timing or public API changed.

An earlier canvas-resize probe found only 3–10 redundant dimension assignments
among 94–96 assignments per open/close case; most accompanied actual contour
size changes. No canvas resize or composition change was retained in this pass.

## Frozen runtime comparison

The isolated production fixture compiles the actual StyleX, ThemeScope,
Menu/Select, Base UI and glass source. Before/after source trees differ only in
`packages/ui/src/utils/interaction/menu.ts`. Both compiled asset sets and
their source hashes are retained. Backend checks confirmed light material mode,
fitted optical filters and GPU live-rim copies in both builds.

Chromium with Metal, 1440×1000. Each case was warmed first. Two batches each
alternated four before/after trials, reversing initial allocation and execution
order in the second batch: eight trials per variant/case, 80 trials total.
Each trial opens the popup, waits 650ms, closes with Escape and waits 650ms.
No other builds, tests or browser probes from this task ran during CPU
collection. Other host activity was not controlled.

Medians, milliseconds:

| Case                     | Renderer task before |   After | Change | Process CPU before |    After |
| ------------------------ | -------------------: | ------: | -----: | -----------------: | -------: |
| Text Menu                |              246.256 | 242.332 |  −1.6% |           1304.125 | 1287.977 |
| Icon Menu                |              225.127 | 220.636 |  −2.0% |           1213.041 | 1166.867 |
| Selected-row Select      |              176.437 | 176.576 |  +0.1% |            948.762 |  920.474 |
| Stationary-source Select |              191.944 | 189.099 |  −1.5% |           1058.976 | 1031.565 |
| Stationary-source Menu   |              214.263 | 204.959 |  −4.3% |           1133.714 | 1147.454 |

Renderer task time comes from CDP Performance metrics. Process CPU sums browser,
renderer and GPU-process CPU deltas; it does not measure GPU execution time or
power. Gains are small and batch-dependent: one scene is effectively flat,
and stationary-source Menu's process CPU increased about 1.2% despite lower
renderer task time. This is not evidence of a uniform CPU, latency or presented
frame-rate improvement. Raw trials retain the mixed results.

Material/style work progressed in parallel in the checkout. It was deliberately
excluded from the frozen candidate, which uses the baseline dependencies plus
this single-file change. Current-checkout integration was checked separately;
the performance table does not describe all subsequent checkout changes.

## Rendered output and interactions

Both Chromium and WebKit captured text/icon Menu, selected-row Select,
stationary-source Select and stationary-source Menu at three opening and three
closing checkpoints: 60 before/after image pairs.

- 56 pairs were pixel-identical. Four differed by at most 3/255 in a colour
  channel. Two Chromium text-close captures differed at only two pixels by 1/255;
  the other differences occurred on the returned stationary-source Menu button.
- 58 complete state snapshots matched. Two differences were bounds of a text
  Menu surface whose opacity was already zero. A repeated unmodified-baseline
  control also showed invisible-surface bounds variation and a two-pixel 1/255
  edge difference. All captures, including residual differences, are retained.
- These results support scoped appearance checks, not strict full pixel parity
  or a claim that every residual difference has been explained.

Current-checkout checks passed: affected format/lint, UI typecheck, 14 existing
Menu/cascade motion DOM tests, 16 browser interrupted-return cases, and standard
Menu/Select checks in both engines at 1440px and 390px (selection, focus,
reopening, text/icon return and reduced motion). The initial standard browser
run timed out during preview navigation; the complete rerun passed.

The anchored ink/spacing/selection/focus/reduced-motion portion of the existing
`menu-ink-reentry.mjs` suite also passed all four engine/width cases. This was
run as a scoped artifact script; the unrelated homepage re-entry section was
excluded, so it is not a pass for that complete suite.

UI and glass builds passed. Installed-consumer verification initially found a
stale generated glass license-notice copy after parallel notice edits. Rebuilding
the dependency through its existing workflow refreshed that artifact; the
exports/types/SSR/production-assets consumer check then passed. Original notices
and attribution sources were preserved.

Artifacts:
`/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-hidden-glyph-performance/`.

The compiled fixtures, source snapshots, manifests, raw CPU trials, screenshots,
state comparisons, baseline control and logs are retained there. Scripts retain
their original local paths under `/tmp/lenso-menu-animation-round4`.
Real Safari/iPhone and exhaustive theme/accessibility acceptance remain open.
