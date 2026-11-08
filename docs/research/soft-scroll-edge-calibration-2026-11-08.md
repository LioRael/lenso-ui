# Soft scroll-edge physical-device calibration

November 8, 2026, Asia/Shanghai. Reviews the current working tree, including
pre-existing material work. No commit, landing, publication or deployment.
Supersedes the radius/tint tuning in the November 5 soft-edge investigation.

The later [same-day refinement](soft-scroll-edge-refinement-2026-11-08.md)
supersedes the recipe values below. These measurements remain the first-pass
historical dataset.

## Result and implementation

Keep the six overlapping raised-cosine mask bands, their 40% transition widths,
independent tint, transparent/unfiltered outer group, scroll binding and opaque
accessibility fallbacks. Use incremental Gaussian radii
`sqrt(target² - previousTarget²)`, following the approach in
[MyGo blurLevels](https://github.com/egoist/mygo/blob/main/plugins/glass/blur.go).
At full coverage, variances add; stacking all the old 0.5–16 px radii instead
reached approximately 18.47 px. Partial-mask mixtures still approximate, rather
than equal, a single spatially varying Gaussian. MyGo attribution and its MIT
notice are retained in `THIRD_PARTY_NOTICES.md` and the built UI notices.

Incremental radii alone improved checkerboard error modestly and left the
solid-color phase essentially unchanged. Native preserved more high-frequency
detail and applied a stronger appearance-dependent background wash. A second
candidate scales the nominal target radii to 0.14, 0.28, 0.56, 1.12, 2.24 and
4.48 CSS px, with tint opacity 0.45 light / 0.84 dark over the existing
`--lenso-material-edge-hard` color. All six measured states improved, so this
candidate is now the shared soft default.

No consumer prop changes are required. Internal compositions retain
`--material-edge-tint` and `--material-edge-tint-opacity` overrides. Photos keeps
its explicit black tint and opacity 1. The default wash is stronger while blur
is lighter; consumers relying on implicit tint opacity will see this intentional
visual change. Uniform/hard recipes are unchanged by this work.

## Matched physical-device evidence

Device: iPhone 15 Pro Max, iOS 27.2; 430 × 932 points, DPR 3; full screenshots
1290 × 2796. The isolated fixture is `experiments/scroll-edge-calibration`.
Its synthetic sRGB image is shared by UIImageView and WKWebView, displayed at
430 × 1800 points/CSS px. Native uses public UIKit soft scroll-edge APIs and a
96-point top container with a 24-point semibold label; the same native label
overlays the Web modes. The system controls its own effect shape and extent.

Both views disable automatic safe-area adjustment. A discovered 59-point
WebView top inset was corrected before this dataset was captured. Native's
96-point top content inset means Y 0 is past its resting offset of -96; the
fixture measures full visible material rather than the reveal curve. Actual
native offsets and Web `scrollTop`, `innerWidth` and DPR are shown outside the
measurement region. Offsets are 0, 128 and 384 points in each appearance.
The image repeats at 384 points, so 0 and 384 are distinct positions over the
same pattern phase, not independent backgrounds. There are no personal photos.

Twenty-four clean screenshots cover Native, Baseline, Variance and Calibrated
for all six combinations. Two notification-contaminated candidate captures
were discarded and replaced before analysis; no notification is retained in
the final dataset. MAE is the mean absolute difference of encoded RGB channels
in the top 96 points (1290 × 288 screenshot pixels), including the shared label.
It is not a perceptual color metric or a native-shader identity test.

| Appearance | Offset | Baseline MAE | Variance-only MAE | Calibrated MAE |
| ---------- | ------ | ------------ | ----------------- | -------------- |
| Light      | 0      | 15.25        | 14.14             | 7.81           |
| Light      | 128    | 10.32        | 10.35             | 5.05           |
| Light      | 384    | 15.25        | 14.14             | 7.81           |
| Dark       | 0      | 20.87        | 19.83             | 6.43           |
| Dark       | 128    | 14.14        | 14.15             | 3.54           |
| Dark       | 384    | 20.87        | 19.83             | 6.43           |

Mean error falls from 16.1184 to 6.1787: **61.7% lower in this fixture**.
The unfiltered control region, y=120–600 points, has MAE 0.264 or less in
every comparison. This supports matched content/offset and detects banner
contamination; it is not pixel identity. The analysis rejects control-region
MAE ≥0.5. The comparison image crops and scales each column identically;
measurements use full-resolution originals.

Local evidence, relative to repository root:

- `output/scroll-edge-calibration/comparison.png`
- `output/scroll-edge-calibration/metrics.json`
- `output/scroll-edge-calibration/ios-{native,baseline,variance,calibrated}-{0,1}-{0,128,384}.png`
- `experiments/scroll-edge-calibration/analyze.py`, with reproduction instructions in its README.

## Validation

- Package build: all eight tasks passed after the final source/theme changes.
- UI, tokens and testing package typechecks passed after the build. An earlier
  overlapping build/typecheck encountered transient missing token declarations;
  the ordered rerun passed. The experiment generator also typechecked.
- Three soft-edge tests passed, 282 assertions. The added regression catches
  cumulative overblur that the existing mask-shape tests cannot detect.
- Four existing consumer-token/theme-config tests passed. Changed TypeScript
  lint/format and interaction/source boundary checks passed.
- Actual docs development preview at port 4318: Chromium and desktop WebKit at
  430 × 900 verified emitted incremental filters, light tint 0.45, scroll
  activation, keyboard PageDown, both-edge hiding for short content, and
  increased-contrast suppression of all seven decorative layers. Light/dark
  screenshots were captured separately. Photos was rendered in both engines;
  its explicit black tint/opacity 1 remained present.
- The UIKit fixture built, signed with an existing compatible local profile
  and installed on the physical device. It uses no private rendering API.

Desktop Playwright WebKit did not paint backdrop blur in the isolated probe,
including an unmasked diagnostic with a settled capture. Its computed styles
and behavior checks do not establish optical fidelity. The physical WKWebView
captures above do show live backdrop blur and are the WebKit optical evidence.

## Limits

This is controlled-pattern calibration for one public UIKit composition on
one iOS version/device, not universal Apple parity. Real photo/text content,
other bar geometry, content-aware system choices, other device scales, bottom
or horizontal native edges, RTL optics, reduced-transparency/forced-colors
browser rendering and exhaustive contrast acceptance were not calibrated.
The existing opaque fallbacks and mask directions remain in place. Photos was
visually checked in Web browsers but not matched pixel-for-pixel to native
Photos. No frame-rate, energy or high-load performance improvement is claimed.
No full docs production build, installed-consumer production acceptance or
release gate was required or performed for this recipe-only change.
