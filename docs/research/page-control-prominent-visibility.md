# PageControl prominent visibility correction

Reviewed 2026-11-09 after the user reported that prominent and plain appeared
identical. The initial variant implementation added only Ultrathin material.
Its nearly transparent paint has no independent contour, so it disappears into
flat light/dark backgrounds. The earlier structural browser assertions confirmed
different DOM/material parts but did not establish a visible difference.

Prominent now composes the existing Glass component and its small material,
including the shared rim, shadow and accessibility fallbacks. The capsule is
26px high; the button hit areas remain 44px. Plain has no material or capsule
padding. Page count/windowing, selection callbacks and keyboard behavior are
unchanged. This is a correction to the initial presentation, documented in the
[migration note](../migrations/navigation-bar-page-control-migration.md).

The maintained `test:navigation-controls` regression now renders matching
six-dot controls side by side on a flat primary background in both appearances.
It captures each control in memory and compares pixels in a band above the dots.
Prominent must paint at least 20 more non-background pixels than plain. This
catches the reported presentation failure, rather than relying only on the
presence of material attributes. Screenshots are not retained by the test.

## Verification

- Chromium and WebKit, light/dark: the capsule pixel assertion and existing
  navigation/pagination keyboard, RTL, controlled-focus and disabled checks passed.
- Representative Chromium light and WebKit dark side-by-side captures were
  visually inspected: prominent has a visible capsule while plain has only dots.
- The two focused navigation/pagination DOM tests passed.
- Affected format/lint, UI/tokens/docs typechecks, the independent installed
  consumer build/types/SSR check and documentation contract generation passed.
  No physical iPhone/Safari or native pixel-parity check was run.

## Scoped design gate

The existing calm Apple-inspired direction remains energy 1, rhythm 1, motion 1.
Hard gate PASS for the exercised controls: working keyboard selection, real
buttons, clear focus ownership and both appearances. Purpose gate PASS: the
capsule marks the prominent presentation using the shared material. Liveliness
PASS: selection is the focal point and the established typography/dot rhythm
remains intact. Craftsmanship PASS: rendered pixels now establish the visual
distinction and existing interaction assertions continue to pass. An exhaustive
contrast or assistive-technology audit remains outside this scoped correction.
