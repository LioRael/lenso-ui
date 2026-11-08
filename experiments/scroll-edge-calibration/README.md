# Soft scroll-edge calibration

An isolated physical-device optical fixture, not a public component or product
screen. It compares UIKit's public `UIScrollView.topEdgeEffect.style = .soft`
and `UIScrollEdgeElementContainerInteraction` with three WebKit recipes:

- Baseline: the former six full filter radii, 0.5–16 CSS px, tint opacity 0.22.
- Variance: the same nominal radii and tint, using incremental Gaussian variance.
- Calibrated: the first calibration snapshot, 4.48 px peak and tint opacity 0.45 light / 0.84 dark.
- Refined + Prev: the second calibration snapshot, 3.4 px peak, tint opacity 0.42 light / 0.81 dark.
- Refined + Now: the current shared `softEdgeBands` and `softEdgeTintMask`.
- Trials A–H: recorded parameter/weighting candidates; E is the accepted top-band refinement.

The bundled, synthetic sRGB PNG is shared by UIImageView and the Web page.
Both show it at 430 × 1800 points/CSS pixels. Native and WebView automatic
safe-area adjustment is disabled. Native top content inset is 96 points, so
offset zero is already past the initial resting position. This fixture measures
the visible material, not the scroll-bound reveal curve.

The overlay is 96 points/CSS pixels high. The native container holds the same
24-point semibold label that overlays all Web modes. iOS still owns the shape
and content-dependent extent of its effect; 96 points does not force a private
native shader extent. A mode label, theme and actual offset receipt remain
outside the measured region.

## Reproduce

From the repository root, generate the optional held-out photo quilt with
`python3 experiments/scroll-edge-calibration/photo.py` (Pillow), then generate
the Web fixture with
`bun experiments/scroll-edge-calibration/generate.ts`. It imports the current
shared radius/mask helper; the isolated page reproduces the shared paint stack
without loading the docs application. Browser acceptance of the actual StyleX
component must be checked separately in docs.

From this directory, run `xcodegen generate`, then build `ScrollEdgeProbe` for
the intended physical device using an existing authorized development signing
team/profile. No team, profile or account is embedded in this project. Put
DerivedData outside the checkout. Install the resulting app on that device.

For each theme and Y 0 / Y 128 / Y 384, select Native, Baseline, Variance,
Calibrated and Refined. Confirm the offset receipt and capture a settled full-resolution
frame for each. Store as `ios-{mode}-{dark}-{y}.png`, where mode is lowercase
and dark is 0 or 1. The recorded device was an iPhone 15 Pro Max, iOS 27.2,
430 × 932 points, 1290 × 2796 screenshot pixels. Avoid notification banners.

From the repository root, `python3 experiments/scroll-edge-calibration/analyze.py`
uses Pillow to calculate RGB MAE in screenshot pixels for the top 96 points,
and checks an unfiltered region for alignment/contamination. Its default output
directory is `output/scroll-edge-calibration`; pass another path as its argument.
The comparison image crops and scales captures equally; metrics use originals.
The checkerboard repeats at offsets 0 and 384: these are three scroll positions,
not three independent backgrounds. The Photo selector uses a quilt of existing public demo photographs, held out
from fitting. It contains no personal photo content. For the refinement dataset,
name photo captures `photo-ios-{mode}-{dark}-{y}.png` and run
`python3 experiments/scroll-edge-calibration/analyze-refinement.py`, whose default
output directory is `output/scroll-edge-refinement`.

`node experiments/scroll-edge-calibration/browser.mjs` captures the isolated
recipes in Chromium and desktop WebKit. On the reviewed host, desktop WebKit
did not paint backdrop blur even in an unmasked diagnostic. Its captures are
not an optical acceptance result; use the physical WKWebView comparison.

Pixel-error reduction is specific to this fixture and is not
a claim about overall native parity, browser frame rate or power consumption.

For the third-pass dataset, run
`python3 experiments/scroll-edge-calibration/analyze-refinement.py output/scroll-edge-fine refined trial-E`.
The captured candidate E matches the current production helper. `selection.json`
records all eight candidates on the four selection states; `metrics.json`
records full pattern/photo validation.
