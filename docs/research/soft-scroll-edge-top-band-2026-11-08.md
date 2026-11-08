# Soft scroll-edge top-band refinement

November 8, 2026, Asia/Shanghai. Continues and supersedes the recipe values in
[the second pass](soft-scroll-edge-refinement-2026-11-08.md). This is a local
working-tree change, not a commit, landing, release or deployment.

## Result

Eight candidates were screened on four physical-device pattern states. The
selected candidate E was then checked on all six pattern and six photo states:

| Dataset | Previous MAE | New MAE | Reduction |
| ------- | ------------ | ------- | --------- |
| Pattern | 3.4122       | 3.0423  | 10.8%     |
| Photos  | 3.8178       | 3.7761  | 1.1%      |

All twelve states improve, but the photo gain is small. Two repeat captures of
the smallest-gain light/photo Y 0 pair reproduced the original top-region pixels
exactly for both previous and candidate recipes. This checks capture stability
for that pair; it is not a statistical uncertainty estimate for all scenes.

## Implementation

The previous mid-edge profile was already close; simply increasing its peak or
changing every mask worsened most selection states. Candidate E merges the two
subpixel tail levels, freeing one of the existing six filters for a localized
bar-adjacent enhancement. The five broad bands still reach 3.4 CSS px; the sixth
raises the full-coverage radius to 4.2 CSS px and fades to zero within the nearest
25% of the edge. The remaining broad masks and tint curve retain their previous
values. The tail now starts at 0.2125 CSS px and still clears at 100% extent.

Nominal accumulated radii: 0.2125, 0.425, 0.85, 1.7, 3.4, 4.2 CSS px. Filters
use incremental Gaussian variance. Their incremental radii need not increase:
the final addition is smaller than the previous one, while cumulative variance
still rises. The shared test now checks that actual invariant rather than
requiring every incremental radius to increase. A new regression prevents the
localized top enhancement from accidentally extending through the middle.

There are still six blur layers plus one tint layer. Scroll visibility,
directions, opaque fallbacks, existing tint overrides and public component props
are unchanged. No new dependency, sampling renderer or extra filter surface was
introduced. No frame-rate, energy or high-load performance benefit is claimed.

## Selection evidence

Selection used Y 0 / Y 128 in both themes. It did not use the photo scores to
choose E. Values below are mean RGB MAE over those four selection states, so they
are not directly interchangeable with the six-state means above:

| Candidate | Approach                                                   | Selection MAE |
| --------- | ---------------------------------------------------------- | ------------- |
| Previous  | Six broad bands, 3.4 px peak                               | 2.9766        |
| A         | Scale all radii to 4.2; mask power 2.2                     | 4.5483        |
| B         | Raise only the top level to 4.2; its mask power 2.5        | 3.0786        |
| C         | Top level 4.0; its mask power 2.0; stronger wash           | 2.8298        |
| D         | Scale all radii to 4.0; mask power 1.9; stronger wash      | 4.0027        |
| E         | Merge subpixel tail; localized 4.2 px enhancement over 25% | 2.6950        |
| F         | Same enhancement over 35%                                  | 2.7923        |
| G         | Localized 4.0 px enhancement; stronger wash                | 2.7066        |
| H         | Geometric levels with target-variance interpolation        | 3.7377        |

The variance-interpolation and uniform-scaling alternatives were not retained
in production. Their fixture implementations and the complete selection matrix
remain available for reproduction; an offline model prediction was not treated
as acceptance.

## Capture and reproduction

Same iPhone 15 Pro Max, iOS 27.2, public UIKit native soft-edge composition,
shared image, 96-point bar/label and exact offsets as the earlier passes.
Full screenshot size is 1290 × 2796; MAE uses encoded RGB in the top 96 points
(1290 × 288 pixels). Native, previous and candidate modes share the native label.
The fixture's extra candidate selector reduced its bottom viewport extent by
34 points; the top origin, image size, bar geometry and measured/control regions
are unchanged. A fresh native pattern Y 128 capture confirms the same top state.

Candidate captures use the existing native references and previous-refinement
captures. The y=120–600-point control-region MAE stays below 0.265 in every
accepted comparison. No notification-contaminated capture was accepted in this
dataset. The same photo quilt and tested source-photo positions were reused for
regression validation, not new independent photo coverage.

Evidence: `output/scroll-edge-fine/selection.json`, `metrics.json`,
`comparison.png`, `ios-trial-{A..H}-{0,1}-{0,128}.png`, plus E's Y 384 and photo
captures. The two repeats are named `repeat-photo-ios-{refined,trial-E}-0-0.png`.
Comparison columns crop and scale equally; metrics use original full-resolution
pixels. Recalculate accepted-candidate metrics with:

```sh
python3 experiments/scroll-edge-calibration/analyze-refinement.py output/scroll-edge-fine refined trial-E
```

In the rebuilt fixture, `Refined + Prev` is the historical 3.4 px recipe;
`Refined + Now` imports the current shared renderer parameters. Trial E freezes the
accepted candidate independently. Other trial controls reproduce rejected
candidates. Fixture controls are not part of the product UI.

## Verification and limits

Final package build passed all eight tasks. UI, tokens, testing and fixture
generator types passed; nine narrow tests passed, including five soft-edge
regressions with 304 assertions. Changed TypeScript lint/format and source
boundary checks passed. Browser checks use the actual docs dev renderer in
Chromium and desktop WebKit at 430 × 900, covering the new filter radii,
tint opacity/curve, scrolling, keyboard PageDown, short-content hiding and
increased-contrast fallback. Actual compiled masks were also checked to clear the localized sixth band at
25%; Photos retained its explicit tint and was captured in both appearances.
Physical WKWebView provides the optical evidence;
the earlier desktop-WebKit backdrop-paint limitation remains.

The evidence supports a small additional improvement for this device, content
set and bar composition. No lower bound has been established. A broader native
reference set is needed to assess further backdrop-dependent transfer changes.
This does not establish private-shader identity, arbitrary toolbars, other OS or
device scales, bottom/horizontal native edges, RTL optics or full accessibility
acceptance. No full docs production build or installed-consumer production gate
was run for this recipe-only change.
