# Physical iOS hard scroll-edge comparison

November 8, 2026. Supersedes the MyGo hard-material recipe in
`docs-header-toc-shared-edge-2026-11-08.md`. The shared header/TOC owner and
inside hairline placement remain current. No commit, release or deployment.

**Later correction:** the light default now uses transparent fill and 4.5px
blur without brightness adjustment. The measured brightness 1.1 / 50% fill
recipe below turned a uniform rgb(240,240,240) backdrop white and washed
rgb(40,110,180) to rgb(150,188,227) in the actual docs header. The user rejected
that behavior. These physical-device measurements remain historical evidence
for the recorded trial, not acceptance of the current light default. Dark
parameters and shared header/TOC ownership remain unchanged.

The correction was checked in the actual hot-reloading docs header in Chromium
over controlled uniform backdrops. Before / after painted RGB values were:
240,240,240 → 255,255,255 / 240,240,240; 210,210,210 → 243,243,243 / 210,210,210;
40,110,180 → 150,188,227 / 40,110,180. The final paint reports transparent fill
and `blur(4.5px)` without brightness. The updated tokens build, typecheck and
eight existing token tests passed. This backdrop-color correction was not
recalibrated against the physical UIKit fixture and carries no native-parity claim.

## Finding and final change

The macOS-derived MyGo recipe is **not closer overall to the measured iOS hard
edge**. Its 82.45% fill is much too opaque for this iPhone composition. It
improves the previous light recipe slightly, but substantially worsens dark
appearance. Matching MyGo's numeric recipe did not establish iOS fidelity.

The recorded physical-device trial used this recipe:

| Appearance | Backdrop filter             | Fill                                                             |
| ---------- | --------------------------- | ---------------------------------------------------------------- |
| Light      | 4.5px blur, brightness 1.1  | Primary background at 50%                                        |
| Dark       | 4.5px blur, saturation 1.15 | Primary background raised by 10/255 per channel, clamped, at 59% |

The existing 0.5 CSS pixel hairline remains inside the bounds for Safari. Its
dark color is now 10% white, alongside 10% black in light mode. At DPR 1 the
1px fallback uses half opacity. The physical native screenshot's final material
row supports roughly 10% contrast in both appearances; this is not a complete
subpixel line-kernel reconstruction. Header and narrow TOC still share one
scroll-bound edge. Soft-edge tints and filters are unchanged.

## Physical-device method

- iPhone 15 Pro Max, iOS 27.2 (24B119), 430 × 932 points, DPR 3.
- Native uses public `UIScrollView.topEdgeEffect.style = .hard` and
  `UIScrollEdgeElementContainerInteraction`; Web uses the physical device's
  WKWebView. Both share the same native 24-point semibold title.
- A 96-point bar overlays the same 430 × 1800 image. Automatic content inset
  adjustment is disabled. Native top inset is 96 points, so Y 0 is already past
  the resting position of -96 and displays full material.
- Pattern offsets 0, 128 and 384 in both appearances; held-out public-photo
  quilt at 128 in both appearances. Offsets 0 and 384 repeat the pattern phase.
- Compared Native, Previous Lenso (3px / 85% white or 55% black), the MyGo
  snapshot, and the final Trial. All 32 full-resolution captures have a verified
  offset receipt. Web receipts also confirm width 430 and DPR 3.
- The initial wireless automation connection failed; USB and on-phone UI
  automation authorization restored it. All reported captures happened after
  `drivable:true`. The phone lease was released after capture and again after
  replaying the saved flow.

The pattern's two distinct phases guided a small blur search and affine color
fit. We selected a simple appearance-specific CSS recipe, then checked it on
the held-out photo quilt. The final Trial was regenerated from the actual
shared filter token and theme CSS, rebuilt, reinstalled and recaptured after
the 10% dark-line update. MyGo and Previous remain fixed comparison snapshots.

## Results

RGB MAE is measured over the top 96 points (1290 × 288 screenshot pixels),
including the identical title. Lower is closer within this fixture.

| Content                 | Appearance | Offset | Previous |   MyGo | Final Lenso |
| ----------------------- | ---------- | -----: | -------: | -----: | ----------: |
| Pattern                 | Light      |      0 |   33.544 | 31.533 |       4.642 |
| Pattern                 | Light      |    128 |   46.228 | 41.778 |       4.031 |
| Pattern                 | Light      |    384 |   33.544 | 31.533 |       4.642 |
| Pattern                 | Dark       |      0 |   10.986 | 27.475 |       3.248 |
| Pattern                 | Dark       |    128 |    3.980 | 23.648 |       2.572 |
| Pattern                 | Dark       |    384 |   10.986 | 27.475 |       3.248 |
| Photo                   | Light      |    128 |   41.615 | 38.758 |      10.492 |
| Photo                   | Dark       |    128 |    8.963 | 23.433 |       5.918 |
| Mean of recorded states |            |        |   23.731 | 30.704 |       4.849 |

Final recorded-state mean is **84.2% lower than MyGo**, and 79.6% lower than
Previous. This is encoded RGB error for this fixture, not a perceptual score or
a general native-fidelity percentage. All unfiltered control-region errors are
below 0.265 (acceptance bound 0.5), supporting matching content and geometry.

Both pattern and photo comparison figures were reviewed. They show residual
differences, particularly the light photo's color/brightness distribution; the
final material is a Web approximation rather than native shader identity.

Evidence under `output/hard-scroll-edge-device/`:

- `metrics.json` and all `{pattern|photo}-{native|previous|mygo|trial}-{dark}-{y}.png` originals.
- `comparison-pattern.png`, `comparison-photo.png`: Native / MyGo / Final,
  with identical crops and scale for light and dark rows.
- `comparison-initial.png`: Native / Previous / MyGo before calibration.

Reproduction source: `experiments/hard-scroll-edge-calibration/`.

## Checks and limits

- Physical app builds and installations succeeded using an existing authorized
  development profile. No private rendering API was used.
- Tokens build, tokens/UI typechecks, eight existing tokens tests and affected
  format/lint passed. The fixture generator ran successfully; analysis rejects
  mismatched-size or contaminated control captures.
- Live docs at port 3000 in Chromium and desktop WebKit, narrow light/dark:
  one shared header/TOC edge, final filter/fill/line tokens, inside line bounds,
  TOC expansion to 268px and anchor selection/dismissal were verified.
- Desktop headless WebKit still does not paint backdrop filtering in the known
  native-blur control environment. Physical WKWebView captures are the optical
  evidence here; desktop WebKit computed styles are not substituted for it.
- User-authorized local flow `lenso/hard-scroll-edge-recheck` was saved,
  validated and replayed: 24 steps completed. A final element read confirmed
  Trial / Dark / Pattern / Y 128. It is a navigation/receipt smoke check, not
  automated optical acceptance. No public flow was published.

Only one iPhone/OS and one 96-point top-bar composition were calibrated. The
combined expanded TOC geometry was checked in desktop browsers, but 268-point
native bars were not calibrated. Other devices, OS versions, arbitrary theme
backgrounds, bottom/horizontal native effects, HDR/color-space behavior,
increased contrast, reduced transparency, motion/performance and full-site
production acceptance remain outside this result.

No consumer prop changes are required. Existing hard-edge consumers receive
the revised appearance. The internal `--lenso-material-edge-hard-filter` token
now owns the appearance-specific filter; soft overrides remain independent.
