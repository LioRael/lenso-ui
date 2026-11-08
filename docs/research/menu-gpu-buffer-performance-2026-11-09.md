# Menu and Select GPU drawing-buffer reuse

Date: 2026-11-09

## Change and cause

The GPU live foreground rim resized its WebGL drawing buffer to each animated
width and height. Profiling four icon-Menu open/close cycles attributed 538.6ms
to 318 drawing-buffer dimension assignments, versus 19.7ms to copying the rim
into its consumer canvas. This identified allocation/submission work as a larger
target than the preceding DOM-write reductions.

The shared producer now reserves the resting layout and current visible extent
in 128-physical-pixel steps. The viewport and resolution uniforms still use the
exact animated dimensions at the existing two-pixels-per-CSS-pixel density.
Consumers receive the active frame dimensions separately from backing capacity
and copy only that rectangle. Its source y offset converts WebGL's bottom-left
viewport into canvas-image coordinates. The shader, coverage samples, material
recipe, animation trajectories and durations are unchanged.

Each live-rim instance owns a distinct lease. A departing instance cannot trim
the buffer while another is drawing; releasing the last lease shrinks the
logical buffer to 1×1 while retaining the compiled program. Active capacity may
exceed the current frame, but large logical backing storage is not retained at
idle. Actual driver memory pooling was not measured. No per-popup WebGL context
or adaptive quality setting was introduced.

## Frozen runtime results

Before/after source trees differ only in `live-rim-gpu.ts` and `live-rim.ts`.
All 660 compiled dependency source entries match. Both complete production
asset sets are retained; final formatting/comment edits were verified to leave
the measured JavaScript and CSS byte-identical.

Apple M2 Pro, Chromium with verified ANGLE Metal rendering, 1440×1000, light
material mode. Each fixture was warmed, then tested in two alternating batches
with reversed initial allocation/execution order: eight trials per variant and
fixture, 80 trials total. Each trial opened the popup, waited 650ms, closed with
Escape and waited 650ms. No builds, tests or other browser probes from this task
ran during collection; unrelated host activity was not controlled.

Medians, milliseconds:

| Fixture                  | Renderer task before → after | Change | Process CPU before → after | Change |
| ------------------------ | ---------------------------: | -----: | -------------------------: | -----: |
| Text Menu                |                310.3 → 214.1 | −31.0% |            1503.4 → 1460.3 |  −2.9% |
| Icon Menu                |                286.3 → 176.8 | −38.3% |            1409.9 → 1254.9 | −11.0% |
| Selected-row Select      |                246.5 → 149.7 | −39.3% |            1127.1 → 1030.2 |  −8.6% |
| Stationary-source Select |                282.6 → 146.2 | −48.3% |            1246.2 → 1112.4 | −10.7% |
| Stationary-source Menu   |                256.2 → 146.0 | −43.0% |            1276.7 → 1118.3 | −12.4% |

CDP `TaskDuration` measures renderer task duration; script duration fell
52.1–59.9%. Process CPU sums browser, renderer and GPU-process CPU deltas, not GPU
execution time or power. Moving-animation RAF callback counts remained broadly
comparable, with one fixture's median falling about 6%; long callback intervals
did not improve uniformly. Presented frames were not measured. These results
establish reduced task/CPU burden, not a proportional frame-rate gain.

A separate instrumented candidate profile observed 34 buffer assignments taking
53.8ms. That run copied 146 frames versus the baseline profile's 165, so this
diagnostic supports the allocation mechanism rather than replacing the matched
80-trial comparison.

Parallel material/style edits in the checkout were excluded from the frozen
candidate. The table does not claim performance acceptance for all later
checkout changes or for dark themes, tinted recipes, WebKit or physical iPhones.

## Pixels, ownership and fallback

- The maintained GPU reference test passed 48 cases across Chromium/WebKit,
  light/dark, small/medium/clear recipes, fractional geometry, overshoot beyond
  the reservation hint and subsequent shrinking. Dimensions must match the
  visible pixel grid. Maximum alpha error was 1/255 and maximum premultiplied
  channel error about 1.216/255 against the analytic CPU reference, within the
  unchanged thresholds.
- The same test checks overlapping leases, duplicate release, bounded buffer
  allocations during 84 warm morph updates, regrowth and idle size 1×1.
- Four startup-unavailable/context-lost engine cases passed CPU fallback checks
  over three geometries each. They compare the unchanged CPU tile renderer,
  rather than claiming new analytic fractional-pixel parity for that fallback.
- A shared static module fixture ensures caller and backend use the same Vite
  module instance. The old direct dynamic imports could instantiate separate
  timestamped backend modules and invalidate ownership instrumentation. A small
  HTML fixture isolates these renderer tests from documentation SSR/navigation.

The initial fallback probe compared tile output with the analytic raster and
exposed the existing fractional-pitch approximation. It was corrected to verify
unchanged tile-path output; the normal GPU/analytic thresholds were not relaxed.

Both engines captured five fixtures at three opening and three closing poses:
60 paired full-page captures. 58 pairs were pixel-identical. The two differences
occurred on the returned stationary-source Menu button at closing 320ms, with
maximum channel deltas of 5/255 (Chromium) and 4/255 (WebKit). Two state snapshots
also differed in an icon surface's bounds after its opacity reached zero; their
images matched. All residuals are retained. Strict whole-page pixel parity is
not claimed.

## Integration coverage and limits

- Glass/UI/docs type checks, affected format/lint, 36 glass unit tests,
  35 glass DOM tests and 14 Menu/cascade motion tests passed.
- Glass/UI builds and installed-consumer exports/types/SSR/production-assets
  verification passed.
- Frozen production component pages passed 20 engine/width/family cases for
  native selection, focus restoration, early close, reopening, reduced motion
  and idle buffer release. Eight additional text-Menu/Select cases reopened
  during an in-flight return and also passed. Widths were 1440px and 390px,
  using touch taps for smaller-width trigger activation and keyboard option
  activation. The additional in-flight return was reopened programmatically.
- DPR-2 live docs contour checks passed all five source families and the cascade
  case in both themes and engines across complete and isolated runs. The first
  WebKit-dark text-close run captured a missing contour at 32ms. Isolated text
  and complete WebKit-dark reruns passed; its cause remains unestablished.
- Subsequent continuous docs-suite attempts on ports 3000 and 3002 encountered
  navigation failures, corroborated by independent HTTP timeouts. An isolated
  module-load failure was also retained. Existing servers were not terminated.
  Continuous documentation-preview acceptance is therefore incomplete; the
  frozen component tests are reported separately.

Real Safari/iPhone frame-rate and power acceptance, exhaustive accessibility and
theme acceptance, and an explanation of every residual pixel difference remain
open. No publication or landing was performed.

Artifacts, frozen builds/source/dependency manifests, profiles, raw trials,
screenshots, fallback/reference results and verification records:
`/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-gpu-buffer-performance/`.
Probe scripts retain their original `/tmp/lenso-menu-animation-round5` paths.
