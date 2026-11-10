# WebKit backdrop reuse — 2026-11-10

## Change and supported scope

The shared backdrop atlas retains a source-space region with a 96 CSS pixel
margin around the requested tiles. Scrolling the source or translating a lens
inside this region crops retained pixels into the existing optical atlas instead
of serializing SVG and decoding an image for every movement. The optical renderer
still receives updated input for each changed position.

This applies to the existing self-contained CSS paint path in `gpu-capture.ts`:
plain DIV/SPAN paint without text, external images, nested flow layout or other
unsupported paint effects. It does not add capture support for arbitrary page
content, video, Canvas, text, or owner-supplied settled snapshots. Chromium's
native backdrop-filter path is unchanged; its shared-copy path can also reuse
this cache.

A source revision or leaving the retained region refreshes the capture. Scale
changes, offsets between physical pixels, independently animated paint and large
source spans keep the existing tiled path. Retained canvas pixels are limited to
16 MiB per atlas and 4096 pixels per dimension. This is a retained-canvas bound,
not a bound on all browser image/texture allocations. Capturing the extra region
adds initial/refresh work in exchange for cheaper subsequent movement. Disposal
releases retained pixels and the output canvas.

## Repeatable regression

With the existing docs development server running:

```sh
DOCS_URL=http://127.0.0.1:4310 bun run --filter @lenso/ui-docs test:backdrop-cache
```

The check runs WebKit and Chromium at DPR 2, exercises 24 vertical and 24
horizontal position changes, and requires one retained capture rather than 49
captures including initial preparation. It checks content invalidation, cache
boundary refresh, 11 lenses across atlas rows, DPR 1, half CSS pixel movement at
DPR 2, fractional/scale/budget fallbacks and transparent source boundaries.
Fresh destination captures provide pixel comparisons. Axis-aligned pattern
comparisons allow at most 1/255 channel difference. WebKit's angled gradient
rasterization varies with capture origin: observed peak error was 4/255 and mean
absolute channel error 0.237/255; the check bounds these at 4/255 and 0.5/255.
This is a numerical tolerance, not a claim of pixel identity.

A second fixture uses the real `copyBackdrop`, scheduler, shared-core renderer
and presentation canvas. It scrolls the window under a fixed lens and changes
the lens's horizontal position, recording time until the visible canvas's
`drawImage` returns. It tests the translation path used by dragging, not pointer
or touch gesture recognition. Timings end at canvas command submission, not
physical display scanout. Every movement must produce a visible canvas update.

For a controlled comparison, `BASELINE=1` removes only the retained-cache branch
from the Vite module response. The workspace source is not changed. The baseline
asserts the original per-movement capture count. `ENGINE=webkit` limits the run
to WebKit. Timing values are reported; regression assertions use capture counts,
pixels and presentation behavior rather than host-dependent timing thresholds.

## Local measurements

Three alternating baseline/candidate pairs ran sequentially against the same
local docs server, without concurrent builds or browser tests. Each run used a
fresh browser page. Per-run medians and p95s, in milliseconds:

| Metric                              | Baseline runs | Cached runs  |
| ----------------------------------- | ------------- | ------------ |
| Captures for initial + 48 movements | 49 / 49 / 49  | 1 / 1 / 1    |
| Input preparation median            | 2 / 2 / 5     | <1 / <1 / <1 |
| Input preparation p95               | 9 / 10 / 22   | 1 / <1 / 1   |

WebKit's timer reported zero for values listed as <1; these are not zero-cost
updates. Input preparation improves substantially. Raw local logs are under
`output/playwright/backdrop-cache-2026-11-10/` (untracked).

Correction during the follow-up: the original baseline interceptor matched only
module URLs without Vite timestamp queries. Direct atlas input measurements above
used that exact URL and remain applicable. The presentation path could import a
timestamped current module, so its earlier comparative timing rows are withdrawn.
The interceptor now matches the URL pathname, including timestamped requests.
See [the isolated follow-up](webkit-backdrop-prefetch-2026-11-10.md) for corrected
presentation comparisons, with baseline/candidate redraw counts checked explicitly.
No physical-device latency or frame-rate claim is made.

## Validation and migration

The new browser regression passes in WebKit and Chromium. Existing moving glass
preferences checks pass for Menu, Select and cascading Menu in both engines and
both appearances, including close/reopen and focus return. The WebKit pending
Canvas/navigation regression passes. Glass package tests, typecheck, build and
affected format/lint checks pass. The package build reports existing bundler
warnings about React `use client` directives; this change does not alter those
entries. No production docs build was needed for this internal sampling change.

No consumer imports, props, styles or source markers need migration. Unsupported
content preserves its existing rendering path. Real Safari, physical iPhone,
touch-driven scrolling, continuous content animation, cold capture latency and
full material visual acceptance were not measured.
