# Glass material consistency audit

This is the historical November 7 audit. The subsequent
[reference alignment pass](glass-reference-alignment.md) changes compatible group
material selection intentionally: a group and standalone control no longer need
identical center colors. The earlier interaction-brightness probe was invalid
because a permanently open modal menu blocked Lenso's pointer input; its numbers
must not be used as evidence of a brightness gap.

The [global tinted appearance audit](glass-tinted-appearance-audit.md) later
reproduces a foreground rim/depth difference at maximum tint despite close center
colors. Its layer ablation establishes a gap outside this audit's center samples.

## Result

Overall material parity with `onlymoein/liquidglass` is **not accepted**.
This audit fixes two internal material defects and verifies their visible
behavior. It does not certify Apple-native fidelity, complete reference parity,
or performance acceptance.

Reference: [onlymoein/liquidglass](https://github.com/onlymoein/liquidglass),
version 0.11.2, commit `89f8b7360a4501940aba9b838710bceb56b23601`.
Both production fixtures use React 19.3.1. Audit completed November 7, 2026.

## Corrections

1. Generic Glass applied an extra saturation multiplier of 1.5, while
   GlassButton used 1. Generic Glass now starts at 1 and selects the existing
   small-glass material profile, including its material-paint fallback.
   On the pink Chromium backdrop, its center changed from approximately
   `[252, 130, 218]` to the button's `[252, 146, 202]`.
2. Fused members owned their tint preference wash individually, leaving the
   connecting neck clear. Compatible members now share one wash over the union;
   local washes are suppressed while the shared surface is visible and restored
   when it ends. Different preference paints are rejected as a shared material.
   Preference changes update the shared wash without requiring a resize.

For the fully tinted pink-background sample, the light body/neck changed from
`[247, 243, 247]` / `[253, 147, 203]` to matching `[247, 243, 247]`.
The dark sample changed from `[39, 32, 37]` / `[207, 76, 143]` to matching
`[39, 32, 37]`. These are controlled flat-background samples, not whole-image
similarity scores.

## Rendered comparison

Fixtures use a 1200 × 720 viewport at DPR 1, 60/90/120 px circles, identical
layout and backgrounds, and a 240 × 180 px menu panel. Inputs include light/dark,
clear/regular/tinted, and both CSS backgrounds and identical registered SVG
backdrop images. Chromium uses Metal; the second engine is Playwright WebKit.

The broad matrix contains 144 pages after the saturation correction, covering
gray, pink and striped backgrounds. After the shared-wash correction, 48 pink
background pages were repeated across both libraries, engines, source paths,
appearances and preferences. The full 144-page matrix was not repeated after
the second correction.

In the final flat-pink samples:

| Measurement                                                                     | Maximum absolute RGB channel difference (0–255) |
| ------------------------------------------------------------------------------- | ----------------------------------------------: |
| Lenso Glass / GlassButton / fused member, matching size and state, center means |                                           0.262 |
| Lenso fused member center / connecting neck                                     |                                           0.688 |
| Lenso vs reference, Chromium standalone Glass or button center                  |                                            5.69 |
| Lenso vs reference, Chromium menu center                                        |                                               2 |
| Lenso vs reference, Chromium fused member center                                |                                            42.5 |

The remaining group difference is most visible in regular dark material. The
reference group and Lenso currently select different size-dependent tone recipes.
Changing only the group recipe to match that sample would also change its
relationship to standalone controls; this audit leaves that calibration open.

## Remaining acceptance gaps

- Edge, rim, shadow and refraction parity remain open. Generic Glass and
  GlassButton still have different bezel, dispersion and refraction defaults.
  Center-color agreement cannot establish agreement at their boundaries.
- The original interaction-brightness probe is invalid: its always-open modal
  menu blocked Lenso targets while the reference menu did not. See the alignment
  report for corrected, unobstructed pointer measurements. The earlier unchanged
  Lenso hover/press center values are not a valid before/after baseline.
- The menu's CSS fallback remains an approximation, separate from the fitted
  tone path used with a registered backdrop image.
- Native Safari acceptance is outstanding. A minimal page without either
  library produced unchanged pink pixels in both headed and headless automated
  WebKit despite a native contrast/brightness/saturation backdrop filter;
  Chromium visibly applied it. This calibration failure makes WebKit/native
  reference differences unsuitable for diagnosing library material parity.
  The registered-image continuity checks still provide useful internal evidence.
- This work does not improve or remeasure the high-load performance failures
  in the [performance comparison](liquidglass-performance-comparison.md).

## Verification

- Production builds: affected package dependency graph (7 tasks), plus both
  isolated production Vite fixtures with extracted StyleX CSS.
- Glass unit tests: 30 passed; optical DOM tests: 16 passed; focused component
  DOM tests: 15 passed. The new compatibility test failed before the preference
  comparison was added, then passed.
- Actual `/cn/glass-lab` regression: Chromium and WebKit, light/dark,
  preference sequence 1 → 0.75 → 0 → 1. All 16 states passed; member/neck
  differences were at most 1 RGB unit with no page errors.
- Existing decoded-plane continuity regression: all 8 cases passed. Stationary
  face difference while a decode was held was zero in every case; settled
  differences were below 0.5. Newly exposed-area differences were 3.071 in
  Chromium and 2.637 in WebKit.
- Affected formatting, lint, glass/UI/tokens typechecks and docs typechecks
  passed. No primitive source or public API changed. No full docs export,
  native Safari, real-device or complete-page visual acceptance was performed.

Antislop review is scoped to these material corrections: no new page structure,
copy, decorative surfaces, motion or radius conventions were introduced. The
overall material comparison remains open for the explicit gaps above.

Evidence archive:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-material-audit/`.
It contains the fixture sources, broad and final measurements, screenshots,
native-filter probe, interaction probe, before/after neck samples and check logs.
Fixtures retain local absolute source paths and a generated theme-chunk import;
rebuilding against another checkout requires updating those paths.
