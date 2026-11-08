# Photos navigation material and geometry

The user identified a material mismatch and unequal visible heights between the
central Tabs and minimized TabBar groups, then clarified that the background
should refract like the indicator. The final requested reference for translucency
is GlassButton. The initial medium-panel treatment was rejected as too opaque.

## Reference and owning rules

The connected iPhone 15 Pro Max on iOS 27.2 was already showing Photos with the
collapsed navigation and timeline controls. Its screenshot showed background
detail and curved optical displacement through both circular backgrounds and the
central track. This is visual device evidence, not a recovered Apple shader or
pixel-parity claim. No photos or settings were changed; the phone lease was
released after the observation. Existing Photos reference flows were inspected;
none was needed to navigate further from this already relevant screen.

Shared corrections:

- `packages/glass/src/refraction.ts`: Chromium's native backdrop path no longer
  excludes `data-material-lens` decorations. These backgrounds now receive the
  existing optical displacement and color transfer instead of only the separate
  blur/mixing paints and rim. Non-Chromium fallback selection is preserved.
- Tabs and TabBar backgrounds use the existing `glass-small` material, matching
  GlassButton's action recipe. The former 20px medium-blur overrides are removed.
  This removes the dense panel-gray treatment while retaining refraction. No new
  material recipe, hardcoded translucent overlay or whole-control opacity is added.
- Glass Tabs include the shared accessible material styles, so increased contrast
  uses the same opaque fallback as adjacent groups. Ordinary Tabs remain ordinary.
- `packages/ui/src/utils/interaction/tabs.ts`: use fractional rendered bounds
  for indicator width and stride, with elastic-scale compensation, rather than
  accumulating rounded `offsetWidth` and `offsetLeft` measurements. RTL retains
  its reversed travel direction.

Page composition corrections in `photos-demo.stylex.ts`:

- The three item widths include the 4px list padding and both 4px gaps. The old
  calculation omitted the 8px gap total, causing the last item to extend beyond
  its track. The shared fractional measurement fix also prevents rounded drift.
- Use 44px item height plus the existing 4px list padding, and center the track
  in the navigation dock. All three visible material backgrounds are now 48px
  high. Their hit areas and optical outsets retain their component ownership.

The component conventions document these rules. Base UI still owns selection,
keyboard activation and focus. No public API or primitive component source changed.

## Rendered verification

Local Docs development preview, Chromium in-app browser, `/en/photos`:

| State                                   | Observed result                                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Light and dark, 589 by 795              | All backgrounds 48px high; top 725px, bottom 773px. Track right 444.5px, resting indicator right 442.5px |
| Light and dark, 390 by 844              | All backgrounds 48px high. Track right 310px, resting indicator right 307.992px                          |
| Dark, 320 by 795                        | All backgrounds 48px high. Track right 240px, indicator right 237.984px; labels remain visible           |
| Pointer drag All to Years, then release | Selection changes to Years; indicator settles inside the track                                           |
| Keyboard End from Years                 | Selection returns to All; resting indicator remains inset approximately 2px                              |
| RTL                                     | All appears at the opposite end, and the indicator aligns with it inside the track                       |
| Increased contrast, then restoration    | All three surfaces report the opaque fallback together, then restore translucent optics                  |

The active lens may enlarge while held as part of its existing interaction; the
reported overflow fix concerns resting geometry. No clipping patch was added to
hide the error or cut off the intended held-lens motion.

A temporary stripe backdrop independently checked the optical path. With blur,
color transfer and shape unchanged, zeroing only the SVG displacement scales
changed pixels inside each of the three surfaces. Mean RGB deltas were about
10.03 for the left circle, 3.74 for the unselected central track and 11.37 for the
right circle. This establishes actual backdrop displacement rather than merely
the existence of an SVG filter. It is not a perceptual parity or performance
benchmark. The fixture and modified filter scales were removed/restored afterward.

Evidence directory: `.artifacts/photos-tabs-material-2026-11-06/`.

- `final-light-589.jpg`, `final-dark-589.jpg`: contextual final screenshots.
- `final-comparison.jpg`: cropped side-by-side views from those screenshots.
- `final-light-390.jpg`, `final-dark-390.jpg`, `final-dark-320.jpg`: narrow states.
- `final-optics-on.jpg`, `final-optics-zero.jpg`: controlled displacement comparison.
- `drag-return.jpg`, `rtl.jpg`, `increased-contrast.jpg`: interaction/adaptation checks.

An additional search smoke-check hit a browser-control timeout after the above
acceptance was recorded; no rendered search result is claimed. The temporary
viewport override was reset and the agent's tab closed; the user tab was preserved.

## Automated verification

- Affected formatting, lint and interaction-boundary checks passed.
- Tokens, Glass and UI builds passed in dependency order.
- Glass, UI, testing and Docs typechecks passed.
- Focused component/material DOM cohort: 26 passed, 0 failed across eight files.
- Glass unit tests: 20 passed, 0 failed.
- Existing Photos regressions: 10 passed, 0 failed.
- Installed package consumer exports, types, SSR and production assets: passed.

The new fractional-geometry regression checks both LTR and RTL and fails with
the previous rounded measurement. The existing appearance regression now covers
both default decorative backgrounds and explicitly live materials, including
appearance changes before optical decoding. A test fixture's font setup now
respects a non-configurable font stub installed by another test in the same cohort.

Safari/Firefox rendered fallback, larger text, Chinese and a full-site contrast
audit were not performed. Builds and DOM tests do not establish these outcomes.
No merge, publication or deployment was requested or performed.

## Scoped antislop gate

Existing Apple Photos direction and motion intensity are retained. The purpose
is consistent optical hierarchy and reliable control geometry, without adding
new assets, copy or decorative animation.

- Hard gate R-26/R-33/R-35 PASS: shared authored source, successful builds,
  recorded rendered interactions and saved screenshot evidence.
- Adaptation R-03/R-32/R-34 PASS within the recorded cohort: narrow layouts,
  dark/light, RTL, keyboard selection, pointer release and increased contrast.
- Purpose R-10/R-19/R-31 PASS: reuse GlassButton's material for floating controls;
  retain lens motion for direct manipulation; correct geometry at its owners.
- Consistency/liveliness PASS within scope: content, spacing hierarchy and accent
  roles remain established; all three backgrounds use one existing action recipe.
- C-1/C-2/C-4/C-5 PASS within scope: documented causes, working controls, measured
  restoration and explicit evidence boundaries. No universal native-parity or
  accessibility certification is claimed.
