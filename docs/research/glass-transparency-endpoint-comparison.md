# Transparency endpoint comparison

Date: 2026-11-08. Reference: onlymoein/liquidglass `89f8b7360a4501940aba9b838710bceb56b23601`
(version 0.11.2). `git ls-remote` confirmed that this was still upstream `main`.
This is an implementation/appearance audit; it does not change material behavior.

## The controls have different contracts

| Input                         | Tinted endpoint        | Regular                | Clear endpoint               |
| ----------------------------- | ---------------------- | ---------------------- | ---------------------------- |
| Reference `--lg-transparency` | 0                      | 0.5                    | 1                            |
| Lenso homepage `glassTint`    | 1                      | 0.5                    | 0                            |
| Lenso `glassTransparency`     | 0 = fully opaque solid | No equivalent midpoint | 1 = regular glass, not clear |

The correct homepage comparison is `glassTint = 1 - referenceTransparency`.
Comparing the two properties named transparency at equal values is not an
appearance-equivalence test. Also, any inherited explicit Lenso
`glassTransparency`, even 1, selects the legacy branch and disables the clear
mapping from `glassTint`. The current docs/homepage uses `GlassProvider` and
`glassTint`; it does not set `glassTransparency`.

### 0 and almost 0

Reference 0 retains the optical face and rim beneath a 96% light / 95% dark tint
(`rgb(247 247 249 / .96)` / `rgb(30 30 32 / .95)`). It is fully tinted, not a
100%-opaque solid. Source blur remains 15.3px. Lenso homepage `glassTint=1`
uses these same endpoint colors, keeps optics/rim, and is close in the measured
interior samples: maximum RGB channel difference 0–2 in this fixture.

Lenso `glassTransparency=0` instead installs a semantic solid, detaches optics
and hides the foreground rim. The light sample was `(242,242,247)` throughout,
and dark `(28,28,30)`, rather than the slightly backdrop-dependent reference.
At 0.001, optics/rim return but the nearly opaque solid wash still dominates.
This exact-zero switch is a real endpoint behavior difference.

### 1 and almost 1

Reference 1 and Lenso homepage `glassTint=0` both retain glass rather than becoming
an unfiltered opening. Both request 1.3px source blur and the clear transfer
`contrast(.793) brightness(1.205) saturate(1.117)`. Refraction and the lit rim
remain. At 0.999, both request 1.328px blur when mounted at that value.

Chromium static clear-end samples differed by at most 2 RGB levels. WebKit's
flat-color samples were also within 2, but its 2px source-line samples differed
by up to 17: reference light red-line `(172,60,82)` versus Lenso `(189,62,87)`.
The line is visibly lighter/softer through Lenso. This localizes an outstanding
clear-end rendering difference around fine detail; identical requested blur
values do not establish identical effective kernels. The precise WebKit
copy/filter/rasterization cause remains unisolated.

Lenso `glassTransparency=1` retains regular 15.3px blur and clarity 0. It cannot
reach the reference clear endpoint by itself.

## Midpoint and dynamic changes matter

Reference Chromium dark mode uses its nonlinear sampled curve through 0.5, then
switches to the CSS contrast/brightness/saturation approximation above 0.5.
Fresh-mounted 0.5 → 0.501 changes measured channels by up to 26 in this fixture,
although the numeric input changed only 0.001. Lenso interpolates continuously
between its sampled regular transfer and clear transfer. In WebKit, the reference
uses the CSS approximation even at regular glass; Lenso uses its fitted sampled
transfer. The regular-dark flat samples consequently differ by up to 25 (27 at
line samples). A difference here does not establish which is closer to native.

Upstream's fitted optics only refit after resize; changing an ancestor's
transparency updates CSS but does not refit the existing lens. A 0 → 1 update
therefore differs from mounting at 1. Chromium retains the previous fitted
source blur, and dark mode retains the previous curve. At the gray line, a
fresh-mounted Chromium clear sample was 143, while the 0 → 1 sample was 212 in
light mode and 127 in dark mode. Lenso's mapped appearance updates blur/clarity
and matches its own fresh endpoint. WebKit's reference copy uses live CSS blur,
but its fitted foreground can still retain the previous clearness. Static and
dynamic runs are retained separately so this upstream issue is not mistaken
for a target material recipe.

## Accessibility override

With `prefers-contrast: more`, both libraries override the user's request for
clear glass. The reference chooses its tinted endpoint and retains some
backdrop visibility. Lenso chooses a fully opaque semantic solid and removes
optics. In the dark Chromium sample, the reference retained `(40,31,35)` over
red and `(30,33,42)` over blue; Lenso used `(36,36,38)` uniformly.

Reduced transparency follows the same respective policies in source. A separate
Chromium CDP run verifies the actual `prefers-reduced-transparency: reduce` media
query rather than overriding `matchMedia`: the reference stayed tinted and
Lenso became fully opaque, in both light and dark. WebKit reduced-transparency emulation
and real-device acceptance were not performed.

## Method and evidence

- Same 320 × 140 CSS pixel glass, radius 20, at DPR 1 over identical marked
  red/blue/gray SVG backgrounds with 2px black lines.
- Chromium and WebKit; explicit light and dark; static values 0, 0.001, 0.499,
  0.5, 0.501, 0.999, 1: 28 states, each containing all three API variants.
- Separate 0 → 1 dynamic runs and high-contrast runs. Browser page-error lists
  were empty. PNGs, computed state and line/flat-color samples were retained.
- The three-color probes are local samples, not an image-wide fidelity score.
  Different corners and foreground shading remain visible outside the probes.
- `glass-transparency-fixture.tsx` receives the reference component at runtime;
  no reference package or dependency was added to this repository. Formatting,
  affected lint, docs types (2,248 files) and docs script types (42 files) passed.
- No full menu/fusion matrix or native iPhone retest is claimed by this audit.

Evidence is in the chat artifact folder `glass-transparency-endpoints`. The
scratch harness supplies the pinned upstream bundle via the isolated Vite
preview's allowed filesystem path. `fresh=true` remounts each value;
`fresh=false` tests live changes without resizing.

## Next implementation priorities

1. Make the legacy opacity contract and the appearance contract unambiguous;
   preserve existing consumers if a unified transparency API is introduced.
2. Isolate the WebKit clear-end line discrepancy using the same recorded source
   and pixel probes; preserve the endpoint tone, refraction and foreground rim.
3. Keep Lenso's continuous dark transition and preference-driven refitting;
   copying the upstream midpoint switch or stale-lens behavior would regress them.

Sources: [reference CSS](https://github.com/onlymoein/liquidglass/blob/89f8b7360a4501940aba9b838710bceb56b23601/src/styles.css#L162),
[reference fitting](https://github.com/onlymoein/liquidglass/blob/89f8b7360a4501940aba9b838710bceb56b23601/src/internal/refraction.ts#L466),
[Lenso preferences](../../packages/glass/src/preferences.ts),
[Lenso transfer](../../packages/glass/src/material-tone.ts).

Implementation follow-up: [clear-end detail and independent opacity composition](glass-clear-endpoint-fix.md) corrects the WebKit fine-detail discrepancy and prevents explicit opacity from suppressing the selected appearance. The measurements above retain the pre-fix audit evidence.
