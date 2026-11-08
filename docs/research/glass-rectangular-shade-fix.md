# Rectangular interior shade correction

The reported Toolbar `GlassPreferences` card exposed a shared material ownership
bug. The independent foreground rim already paints directional light and inner
edge depth. Its fitted filter still applied the older full-height post-tone shade
and dark contour. On a pale background, the extra vertical shading outlined a
flat near-white interior, making it look like a rectangular backing panel.

Layer ablations of the actual Chinese demo kept this feature when the foreground
rim was hidden and reduced it when the legacy shade was removed. Child heading
and paragraph backgrounds were transparent. This is a material-layer problem,
not an opaque text wrapper.

Standalone foreground-owned materials now omit that legacy shade and contour.
Their source tone transfer, blur, displacement, dispersion and foreground rim
remain enabled. In particular, tone application must not depend on the presence
of a shade texture. That dependency was caught by the rendered graph regression
while implementing this fix.

The same owner travels through SVG, fitted WebGPU optics and the analytic WebGL
core. Fitted GPU graphs explicitly allow a missing shade only for marked
foreground-owned materials; their bind groups omit the corresponding texture.
The analytic core skips its old shade/contour when the foreground owns them.
Its batch key includes this state. Snapshot fallback also reads the foreground
owner. Group geometry, colored materials, iOS 26 and knob recipes retain their
existing ownership.

## Verification

- Package build: all 8 tasks passed.
- Glass types: 79 files passed.
- Glass unit tests: 33 passed; DOM regressions: 29 passed.
- Installed consumer production build, exports, declarations and SSR: passed.
- Tinted foreground depth and forced-colors restoration: Chromium and WebKit,
  both appearances passed.
- Shared fusion body/neck color checks: Chromium and WebKit, light/dark and
  multiple tint values passed (maximum channel difference 1).
- The new rendered regression passed all 8 Chromium/WebKit × appearance × tint
  cases. Its marked image backdrop supplies WebKit’s copied-source path. It exercises the actual Chinese card and Menu with
  source tone, displacement and foreground rim retained, and without legacy
  shade/contour. It also checks fitted GPU graph eligibility and compiles GPU
  batches when WebGPU is available.

Development HMR interrupted initial browser runs. The final matrix uses a
separate temporary preview with HMR disabled; it was stopped after verification.
The ordinary preview remains a
hot-reloading development server. This is targeted material verification, not a
new total-CPU benchmark or native iOS acceptance.

The before/after crop is retained in the chat artifact directory under
`glass-rectangular-shade-fix/before-after.png`. It uses the same 512 × 114 CSS
pixel demo card, default tint, Chromium at DPR 2. Earlier captures made before
all StyleX rules arrived were excluded.

## Follow-up: remaining foreground band

The first correction was incomplete visually. The user still saw an inner
rectangular face, and a fresh ablation reproduced it. Hiding the foreground rim
removed the remaining frame; disabling source optics left it visible. The
foreground recipe itself had an upper shade crest centered 9 CSS pixels inside
the edge and a constant side shade before its short fade. That detached band
outlined the pale interior even after the redundant filter shade was removed.

The foreground now keeps the outer hairline and narrow highlights, but gives
inner shade a continuous falloff. Upper shade starts after the highlight and
fades from the rim rather than peaking 9px inward. Side shade tapers smoothly;
its peak compensates for the shorter contrast at the 9px dark-mode holdout so
depth survives 8-bit compositing. The quantized tail is transparent before the
24px fitting cutoff. This is a Lenso Web correction, not a newly measured native
Apple curve. Source tone, refraction and fusion geometry are unchanged by this
follow-up.

The new RGBA regression failed on the previous implementation (upper shadow
increased from 0 to 1 away from the edge), then passed after correction. The
rendered card/Menu matrix now also decodes the delivered foreground PNG and
checks that its inner upper shadow does not rise again farther inside.

Final checks: 34 glass unit tests, 29 DOM tests, glass typecheck, affected
format/lint, the 8 rendered card/Menu combinations, Chromium/WebKit tinted-depth
and forced-colors checks, DPR 1/2 antialias checks, shared fusion color checks,
package build and installed-consumer acceptance passed. The unchanged narrow
hairline remains covered by the independent area-integral goldens.

This changes one-time cached rim fitting work; it adds no per-frame layer or
animation. It is not an overall CPU optimization. Interleaved Bun microprobes
showed additional fitting cost for large panels (roughly 6–19ms in these loaded
runs); these probes ran alongside browser work and are not an idle performance
acceptance benchmark. No native-device retest was performed.
