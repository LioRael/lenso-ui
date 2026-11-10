# Homepage material after leaving the photo

The previous alpha correction fixed dark SVG color arithmetic, but did not
establish a complete material handoff while scrolling. A direct WebKit follow-up
reproduced a separate issue: fixed header lenses retained `data-copy` after the
photo stopped covering them, so native page material remained suppressed.

Copied inputs now check their visible, ancestor-clipped coverage using the shared
geometry reads. If the input no longer covers the lens, hide the copied output,
release its ownership marker and pause its optional GPU output. Keep the input
and source invalidation for returning to the photo. Do not change Chromium's
live-backdrop path. Native material stays mounted behind copied small controls
and is hidden while a valid copy owns the face.

The native small-material fallback also previously discarded its backing layers
when a CSS tone filter was present. A filter alone supplies no backing paint.
Retain the existing small-material layer colors, fading their coverage with the
current clarity preference. Medium/large calibrated fallback behavior is unchanged.
This adds no public API or consumer migration.

## Verification

- New `test:home-scroll-material`: Chromium/WebKit, light/dark, widths 1440/390,
  DPR 2, viewport height 800. Two scroll-out/return cycles per case.
- WebKit asserts copied-input retirement, visible native backing, paint/lens
  geometry agreement within 1.5px, and copied ownership restoration on return.
  Hiding the backing must visibly change more than 100 rendered pixels.
- Original homepage regression passes in both engines.
- Moving Menu/Select/cascading Menu preference, closing and focus checks pass in
  both engines and appearances. An initial reduced-motion timing failure passed
  on rerun; it was not treated as evidence of material correctness.
- Glass typecheck and 83 package tests pass; affected format/lint and package
  build pass. Existing React directive bundling warnings remain.

Screenshots are under `output/playwright/home-scroll-material/`. The 1000px-high
desktop viewport stops with a small strip of photo still behind the header;
that boundary was inspected too. The 800px regression viewport permits a complete
exit from the photo rather than testing only that partial overlap.

Checks used the retained Playwright 1.64.1 package with installed matching
binaries, since the current 1.65 browsers are unavailable. Temporary import-only
test copies were removed. No native Safari/WKWebView or physical iPhone acceptance,
production docs build, landing or publication was performed. The existing
temporary preview stays available on port 4320.
