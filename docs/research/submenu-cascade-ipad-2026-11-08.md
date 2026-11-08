# Cascade submenu motion on iPad

Date: 2026-11-08

## Reference and diagnosis

The physical reference is Photos on an 11-inch iPad Pro (M5), iPadOS 27.2,
landscape. Its Sort and Filter menu exposes leftward Media Types and View
Options submenus. Opening/returning and switching these children was observed
without selecting a filter or changing settings. The parent and its source row
remain visible; the child unfolds beside the row and settles faster than a
root menu. Its text resolves as the contour settles.

The first MP4 recording delivered approximately 10fps and was not used to
calibrate timings. A separate quality H.264 capture preserved 1,348 original
frames and their presentation timestamps. Dynamic intervals below 100ms have a
median of 18.884ms and a 90th percentile of 22.902ms. This is variable delivery,
not sustained 60fps or display-refresh proof. Raw capture orientation was
corrected for inspection; no interpolated frames were inserted.

Evidence: `output/playwright/submenu-cascade-ipad/native-quality.h264`,
`native-quality-timestamps.json`, and `burst-*.jpg`. Bursts 1/2 show Media Types
opening/returning; burst 3 shows View Options opening. The captured parent has
real personal-photo backdrops; these files are local investigation material.

The previous `submenu-cascade.ts` used its own 600/46 opening spring and
900/57 return, a small source-circle geometry, a 0.92–1 text scale and opacity.
It had not adopted root Menu's shared continuous timeline or moving ink lens,
softness and clipping. This explains the reported mismatch.

## Change

Cascade now uses `createMenuTimeline`, `sampleMenu` progress and `createMenuInk`.
It preserves native Base UI placement, activation, focus and unmount ownership,
and the existing per-panel press feedback and parent retention.

Cascade adapts the geometry to its own relationship: width begins at 65% of
its destination and grows with the shared width channel; height begins at the
source-row height; the adjoining edge remains fixed. Corner settling stays
bounded and content scales from 0.8 to 1 around the adjoining edge/source row.
The real source row remains visible and does not receive a trigger rebound.
Text is clipped against the live contour and receives the shared optical tail.
Root Menu and stacked-submenu presentation were not changed.

The shared sampled clock runs twice as fast for cascade: 221ms opening and
149.5ms return. This is a bounded Lenso adaptation informed by the faster iPad
capture, not a recovery of native constants or a numerical native fit. Reversal
retains current channels/velocity. Reduced motion clears transient effects and
completes retention/unmount cleanup. The return is guarded against duplicate
unmount callbacks after settling.

An initial candidate applied the root's travelling circle directly. Clock-stepped
browser frames exposed a detached circular child and inflated middle content;
that candidate was rejected. The final candidate keeps the adjacent edge fixed
and does not grow from the root-style circle.

## Verification

- Affected formatting/lint and UI/testing typechecks passed.
- Focused Menu/cascade/stacked regression cohort: 16 passed, 0 failed.
- New cascade tests cover both sides, attached-edge geometry, moving ink clipping
  and softness, interrupted return/reopen, settling, reduced motion changing
  during return, single parent release, and the untouched source row. Existing
  stacked-title and root compact/tall tests remain in the cohort.
- Chromium and WebKit, 1194 by 834 development Photos preview: leftward cascade
  opening/return, moving optical frames, settled cleanup, parent-trigger focus
  restoration, interrupted close/reopen, reduced motion and Escape passed.
- Rightward collision placement and Escape passed in both engines with the
  existing root anchor moved left for the probe; this is synthetic placement
  coverage, not a second physical native reference.
- Nine Chromium clock-stepped frames show opening/return contour and text. These
  are inspection captures, not frame-rate or performance measurements.
- Physical iPad Safari: the corrected View Options and Media Types panels opened
  adjoining the parent; their final labels were readable and unclipped. Switching
  between them worked. A 29-frame, 3.915s recording at 1210 by 834 (approximately
  7.41fps overall) and its inspected contact sheet showed no detached circular
  child in the sampled frames. This sparse Web capture does not establish
  frame-level native parity. Recording:
  `/Users/leosouthey/.iphone-use/instances/ipad/runs/recordings/2026-11-08T11-44-57Z.mp4`.
  The automation accessibility tree omitted the filter trigger and failed to
  activate View Options by its AX locator; pixel interaction worked. Those AX
  observations are a verification limitation, not proof of complete VoiceOver
  support or a diagnosis of a new component accessibility regression.

The preview's package rebuild initially invalidated old module paths. Its
existing server recovered after restart/cache refresh and restoring package
declarations. A separately started preview preparation failed while dependent
UI declarations were still being generated; sequential declaration regeneration
then passed. No clean full repository/production gate is claimed.

There is no public API or consumer migration. No primitives source change,
landing or publication was performed. Native shader parity, sustained frame
rate, every nesting depth and all custom themes are outside this evidence.
