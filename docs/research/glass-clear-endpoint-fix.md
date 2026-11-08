# Clear-end detail and opacity composition

This follows the [endpoint comparison](glass-transparency-endpoint-comparison.md).
The fix preserves source tone, source blur, refraction, dispersion, foreground
rim and shared fusion ownership. It introduces no new public preference API.

## Cause and correction

The WebKit copied-source path applied a 0.4px Gaussian after refraction, on top
of the selected source blur. At clear glass's 1.3px source blur, this extra
softening made the recorded 2px lines noticeably lighter than the reference.
A one-variable ablation removed only that post-refraction Gaussian: the maximum
line-channel difference fell from 17 to 2 while the rest of the optics remained.

Scaling the Gaussian radius toward zero was insufficient. A real 0.999 endpoint
regression still failed by 17: WebKit quantizes very small nonzero radii into a
visible softening step. The final graph instead interpolates the bent source
with its regular softened result. Its weights vary continuously with clarity.
At fully clear, the extra softening is zero. Chromium's native-backdrop recipe
retains its existing smoothing, and selection/legacy optical recipes are not
replaced by a clear material.

The fitted GPU reader recognizes this mixed graph. Intermediate materials mix
the unsoftened and softened textures before tone application. Fully clear GPU
batches bypass the three post-refraction softening passes. Regular materials
retain their existing pass count. No new per-frame JavaScript loop is added.
These observations are not an overall CPU benchmark.

## Opacity and appearance compose

The old explicit `glassTransparency` branch suppressed `glassTint`, even when
opacity was 1. That contradicted retaining the selected glass recipe. It now
controls a semantic opacity wash over the selected appearance, with the material's
tint wash underneath. Clear/tinted transfer and blur continue to follow
`glassTint`. `glassTransparency=0` remains solid and disables optics; a consumer
using only this old API retains the regular default and its existing 0–1 range.
System reduced-transparency/contrast/forced-color overrides still choose opaque
semantic surfaces. The API comment and English material guide explain this
composition rather than introducing another similarly named setting.

The composition is inherited by open menu portals. Shared fused members use one
shared preference paint, including when that paint contains both washes.

## Regression evidence

- The opacity regression first failed with clarity 0 instead of 1 when explicit
  opacity 1 was combined with clear appearance. It now passes, including the
  opacity-only midpoint and fully opaque detach behavior.
- Reinstating the old 0.4px Gaussian in the rendered graph reproduced a 17-level
  line error. A separate natural 0.999 run caught the failed radius-scaling
  candidate before the final interpolation fix.
- `glass-clear-detail.mjs`: all 16 WebKit light/dark × DPR 1/2 × implicit/explicit
  opacity × 0.999/1 cases passed. Maximum 4×4-CSS-pixel sample-channel error is
  2.75/255 against the CSS-copy clear reference, versus 17 before. The tests
  also retain displacement, tone and fitted GPU eligibility.
- `glass-rectangle.mjs`: Chromium/WebKit, both appearances and two tint values,
  card and menu retain tone/refraction/foreground and no detached inner shade.
  GPU batches compile at regular, intermediate and zero softness when available.
- `glass-opacity-appearance.mjs`: both engines/appearances passed opening a menu
  with partial opacity and tinted appearance, switching opaque, then restoring
  explicit opacity 1 with clear appearance through its portal.
- Fusion color checks include opacity 1 and 0.5 across tint endpoints and an
  intermediate value; body/neck differences stayed within one channel level.
- DPR 1/2 foreground antialias checks passed in both engines.
- 34 glass unit tests, 30 DOM regressions, affected format/lint, package build,
  glass types, docs types and installed-consumer production acceptance passed.

The pinned upstream comparison uses the same 320 × 140 glass, marked source,
seven transparency values and Chromium/WebKit light/dark scenarios as the audit.
All 28 states completed with no page errors. At both 0.999 and 1, WebKit line
samples improved from 17 to 2/255 in both appearances; Chromium remained at
2/255. Separate dynamic and actual reduced-transparency media runs passed.
The retained nonlinear dark transfer and continuous midpoint intentionally still
differ from the reference's WebKit approximation/Chromium midpoint switch.
No native-device acceptance or total CPU improvement is claimed.
