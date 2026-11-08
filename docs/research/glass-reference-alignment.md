# Liquid Glass reference alignment

Date: 2026-11-08

Follow-up: [shadow input and elastic alignment](glass-elastic-shadow-alignment.md)
supersedes the exterior-only shadow and size-override limitations below. The
measurements in this document describe the first alignment build.

Reference: [onlymoein/liquidglass](https://github.com/onlymoein/liquidglass/tree/89f8b7360a4501940aba9b838710bceb56b23601), version 0.11.2, commit `89f8b7360a4501940aba9b838710bceb56b23601`.

## Implemented scope

This pass follows the material, interaction-light and fusion-contour priorities. CPU optimization remains paused; previous CPU measurements do not establish performance acceptance for this build. Antislop review was applied during the existing material work; no new page layout or decorative treatment was introduced.

Compatible untinted iOS 27 small/clear fusion groups now use a size-1 linear material surface without the standalone button inner shade. Standalone controls retain their fitted material; tinted, mixed and iOS 26 groups retain their supported recipes. The GPU material compositor rejects the new linear-transfer role rather than interpreting it as a standalone calibration. Worker displacement acceleration remains available.

Hover and held states use the reference white wash (.34 light, .30 dark). Filled controls use tint at 88% mixed with white. The local highlight has a 240px radius, .035 center opacity, .025 at halfway and a 220ms release. Native pointer, keyboard and focus ownership remains with Base UI. Forced colors suppress the interaction shadow at matching selector specificity.

The fusion smooth-union radius now equals `spacing`, without the previous 1.9 multiplier. CPU and GPU geometry agree. Default spacing changes from 12 to 20. Existing explicit values that need their former neck width should be multiplied by 1.9; the former implicit default corresponds to explicit 22.8. Grouped-toolbar special geometry is unchanged.

Compatible group contours use a black .3 hairline at 1px, a white .34 top/bottom gradient at .67px, and a 4px-down, 4px-blur exterior shadow (.03 light, .05 dark). A 24px canvas margin prevents clipping. Layer positioning is stable after settling and does not wake its own observer.

## Reference comparison

A shared production fixture exercised both libraries with the same 60/90/120px geometry, backgrounds, themes and transparency mapping. The 144-page matrix covers both engines, CSS/image backgrounds, light/dark, three transparency values and gray/pink/striped fields. All pages reported zero JavaScript page errors.

Chromium maximum center-channel differences (0–255 scale):

| Surface           | Flat backgrounds | Striped background |
| ----------------- | ---------------: | -----------------: |
| Standalone Glass  |           5.6875 |             4.9375 |
| Standalone button |           5.6875 |             4.9375 |
| Fusion group      |                9 |                  3 |

For regular dark pink groups, differences are 5/6/6 at 60/90/120px. The earlier 60px result was 42.5. These are specific spatial samples, not a full-image perceptual score. Refraction moves background samples, especially on stripes.

The old hover/press probe was invalid: a controlled-open modal menu blocked input to Lenso controls. The corrected fixture omits the menu during interaction probes. There is no valid pre-change interaction baseline. Corrected Chromium mouse hover/held samples differ by at most 3 channels; explicit blue filled controls match the reference samples in both themes. Real Chromium touch-start/held/touch-end injection differs by at most 3 channels. This is browser touch emulation, not physical iPhone validation.

WebKit reference backdrop calibration is unresolved, so its reference pixels are not used to claim material parity. Internal WebKit rendering, continuity and interaction checks remain useful.

## Verification

- Glass unit tests: 31 passed, including independent reference smooth-union math that catches the former radius multiplier.
- Glass DOM tests: 20 passed, including standalone/group transfer-role separation and iOS 26 preservation.
- Affected component DOM tests: 16 passed, including container, press highlight, toolbar and preferences.
- CPU versus actual worker/GPU field output: 32 cases across Chromium and WebKit; decoded field differences are zero. This compares the current two execution paths, not current appearance against the old build.
- Actual glass-lab alignment regression: both engines and themes verify delivered size-1 linear material, absence of standalone shade, padded contour bounds, zero idle contour draws over 500ms, keyboard release, reduced motion and forced colors.
- Fusion continuity: eight cases; stationary pending-field difference is zero. Maximum settled difference is .354; newly exposed face difference is .147 Chromium/.086 WebKit. This does not establish universal flicker freedom.
- Material consistency: 16 states across both engines; maximum neck/body difference is 1, with no page errors.
- Mobile: 390px viewport, both engines, no document overflow or page errors.
- Package production build, affected format/lint/type checks and installed-consumer exports/types/SSR/production-assets test passed.
- Canonical contract generation passed: 92 families, 610 parts, 218 exact Markdown documents, 1240 local example graphs and 92 style maps round-tripped.

The matrix preceded the final private active-fill variable separation and non-Apple positioning guard correction. Default mouse samples were repeated unchanged after that separation; explicit filled and touch probes cover the override. The guard is covered by the affected component tests. Final package build, types, consumer test, contract generation and actual lab checks use the final source.

## Remaining differences and limits

The reference shadow sits below the glass and can darken its sampled input. Lenso keeps its shadow exterior-only to avoid optical feedback; this is a plausible contributor to the remaining center difference, not a proven sole cause. No compensating color multiplier was added. Lenso retains merged refraction, denser contour tracing and continuous lighting across the neck. Elastic size overrides remain different and were not aligned in this pass.

No CPU benchmark was rerun. Real Safari/iOS, other GPUs, wide-gamut output and full contrast acceptance remain untested. These results establish scoped alignment, not complete pixel or Apple-native parity.

## Evidence

Artifacts: `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-reference-alignment/`.

The archive contains raw matrix/field results, scripts, fixture source, selected before/current source, screenshots and validation logs. Scratch scripts contain absolute local paths; restoring them elsewhere requires remapping the workspace, pinned reference and fixture paths. The maintained `apps/docs/test/glass-group-alignment.mjs` runs against the docs URL (default port 4337). Reference fixture servers were temporary and are stopped after verification; the existing docs preview is left running.
