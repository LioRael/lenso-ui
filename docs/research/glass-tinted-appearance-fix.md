# Tinted glass foreground and standalone shadow correction

Date: 2026-11-08

This implements the foreground-layer correction diagnosed in the
[global tinted appearance audit](glass-tinted-appearance-audit.md).

## Delivered behavior

Untinted standalone iOS 27 Glass, GlassButton and decorative glass material
panels now paint a fitted foreground rim above their preference wash. Directional
upper/lower highlights, upper/side inner shade and an outside hairline no longer
vanish under the fully tinted backing. The image includes a 1px outset, rather
than clipping the hairline into the host. Existing pseudo-elements own this
paint; no extra interaction target or content clone is introduced.

The fit is adapted from the pinned reference's rim equations to Lenso's actual
rounded host contour. Existing light angle and intensity remain inputs. Clear
appearance strengthens the lit edge. The old highlight image remains available
to optical filters that use its mask, but is not painted a second time on
eligible standalone glass. The foreground remains independent of content/ink
opacity and background refraction.

Standalone shadow offset, blur and alpha now interpolate with the fitted size:
4–8px vertical offset, 8–21px blur and 0.016–0.07 alpha over the established
60–120px size interval. Caller shadow overrides retain priority. Shared fused
surfaces retain their own vector rim, shadow and single preference wash. A fused
member hides its standalone foreground. Colored materials, iOS 26, knobs and
selection lenses retain their previous ownership and recipes.

Foreground images share the existing reference-counted lens cache and decoded
byte budget. They decode before publication, release with their owner and are
restored after accessibility-mode changes. Their generation skips the fully
transparent interior past every nonzero edge band. A differential check against
the unoptimized implementation produced byte-identical encoded images in 16
cases: 28px/120px circles, 250×550/500×800 panels, two light angles and both clear
endpoints. This is a fitting optimization, not lower-resolution rendering or a
per-frame quality change.

## Before/after evidence

The original red check now passes using the same production fixture and sample
regions. On a 120px light Glass over the registered flat pink source:

| Maximum tint, red channel (0–255) |  Before |   After | Reference |
| --------------------------------- | ------: | ------: | --------: |
| Center mean                       | 247.125 | 247.125 |   247.000 |
| Center minus side inner band      |   0.000 |   4.812 |     5.000 |

A second matrix rebuilt the Lenso fixture with this correction and retained the
same pinned reference. Its 32 pages cover light/dark, default/intermediate/tinted,
CSS/registered-image inputs and 32/44/60/90/120px controls. All report no page
errors. The full-shape rectangular crop comparison includes the rim and a 5px
margin. Mean RGB error against the reference improved in 28 of 30 sampled
standalone cases. The two exceptions are regular light 32px and 44px controls:
3.683→3.806 and 3.490→3.631 on a 0–255 scale. These scalar image differences are
not perceptual scores and do not establish complete parity.

For the 120px striped-image crop:

| Appearance / tint    | Mean RGB error before | After |
| -------------------- | --------------------: | ----: |
| Light / default      |                 4.443 | 3.891 |
| Light / intermediate |                 2.704 | 2.068 |
| Light / most tinted  |                 2.145 | 0.808 |
| Dark / default       |                 4.125 | 3.364 |
| Dark / intermediate  |                 3.004 | 2.097 |
| Dark / most tinted   |                 2.282 | 1.108 |

The actual homepage's top-right global slider was exercised at its tinted end,
including its portalled controls, then switched between iOS 26 and iOS 27.
The existing development preview later stopped responding; its owned server was
restarted through the project preview workflow on the same port. Readiness and
the homepage slider/version checks passed again after restart.
The foreground follows its supported version and the global setting is retained.

## Verification

- Maintained `apps/docs/test/glass-tinted-rim.mjs`: Chromium/WebKit, light/dark,
  all three material owners, visible inner depth and forced-colors restoration.
- Existing material consistency: 16 fused states; maximum body/neck difference
  is one RGB level. Existing group alignment verifies shared material, shadow
  ownership and suppression of local contour paint in both engines/appearances.
- Continuous menu expansion: both engines at 1440px and 390px. Existing ink and
  glass re-entry checks exercise the same four combinations.
- Glass DOM suite, glass unit suite including foreground owner eligibility,
  affected React glass/preferences/toolbar tests, package build, affected lint
  and formatting, package/docs typechecks, installed-consumer production-assets
  test and generated-contract round-trip are recorded in the evidence archive.

Final serial browser runs pass the complete shared elastic suite (including
Toggle), all four Menu/Select selection/focus/return cases, and the four tinted
foreground cases. Earlier timing/navigation interruptions are retained in the
scratch evidence but are not the final acceptance result.

## Animation cost check

The same maintained isolated Menu runner was repeated twice after the correction.
It alternates the exact text Default example and a twelve-action circle at
1440×1000 in Chromium/Metal, using the same 650ms-open/650ms-close windows. The
first round is cold; the following three rounds supply each reported median.
The preceding two valid runs are retained rather than selecting one baseline.

| Renderer main-thread busy time per open/close |    Previous A/B |       After A/B |
| --------------------------------------------- | --------------: | --------------: |
| Text example                                  | 202.6 / 201.0ms | 211.5 / 214.4ms |
| Tall circle                                   | 196.2 / 218.1ms | 183.2 / 196.0ms |

The text result is about 4–7% higher; the circle is lower in these runs. Text
rAF p95 remains around 16.7–16.8ms and circle p95 is 33.4ms in both current runs;
the older circle runs varied between 16.8 and 33.4ms. These are local renderer
measurements at different times, not a contemporaneous paired causal profile,
total-process CPU or a performance improvement claim. The additional cached
foreground bitmap also uses decoded memory within the existing bounded budget.

## Limits

This corrects the diagnosed tinted-layer defect and standalone shadow mapping.
It retains the existing background displacement profile and material transfer;
those remain separate reference differences. Small regular light controls still
have a slight scalar crop-error increase in the two noted cases. Automated
WebKit checks establish internal rendering behavior, not calibrated native
Safari parity. Real-device web performance, wide-gamut output and total browser
CPU are not established by this pass.

No public prop contract or primitive component source changed. Two unused
TabBar context bindings that blocked the workspace typecheck were removed;
TabBar behavior was not changed by that cleanup.

Evidence:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-tinted-appearance-fix/`.
