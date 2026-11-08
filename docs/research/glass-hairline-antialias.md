# Foreground hairline pixel coverage

Date: 2026-11-08

## Cause and correction

The standalone foreground rim added in the tinted-material pass sampled each
texture pixel only at its center. Its continuous lighting model switches from
the outside dark hairline to the inside lit/shaded edge at the host contour.
Picking one side of that discontinuity creates isolated dark/light pixels along
oblique curves, especially on small controls.

The rasterizer now integrates premultiplied color and alpha over boundary pixels.
The discontinuous band uses a 16×16 area grid, reduced to one varying axis on
straight edges; nearby narrow bands use four samples per varying axis. The
remaining interior keeps its original single sample and transparent-interior
skip. Pixel spacing is fitted to the actual encoded extent when dimensions are
fractional. No global blur, opacity reduction, weaker rim, smaller displacement
or material transfer change is used.

Texture dimensions remain 2× the CSS plane including its 1px outset. The same
lens cache, decoded byte budget and publication-after-decode lifetime remain in
place. Integration runs during fitting, not on every animation/pointer frame.
The pure pixel generator is separate from browser PNG encoding so coverage can
be checked without a simulated canvas.

## Numerical regression

An independent Python integral evaluates 128×128 subpixel samples for selected
32px-circle edge pixels. The test failed before correction. At texture pixel
(11,11), the old center sample had approximately alpha 48 and premultiplied gray
46 on a 0–255 scale. The integral expects alpha 63.005 and premultiplied gray
31.338. The delivered corrected PNG decodes to RGBA [132,132,132,62], or
premultiplied gray 32.094. Eight oblique samples across the contour are checked
within two levels before PNG encoding; browser decoding allows three.

## Browser and material verification

- Maintained `glass-rim-antialias.mjs`: Chromium/WebKit at DPR 1 and 2, each
  checking actual delivered PNG coverage and visible pseudo-element paint for
  Glass, GlassButton and a decorative glass panel. All four cases pass.
- The existing tinted-depth/forced-colors restoration suite passes all four
  engine/appearance cases. Its inner-depth measurements are unchanged.
- Fused body/neck consistency passes all 16 states; the largest sampled channel
  difference remains one. The group's separate native canvas path is retained.
- Glass unit suite: 33 tests; glass DOM suite: 28 tests. Affected build/type/lint/
  format, docs types, installed-consumer production assets and generated-contract
  round-trip pass. The final numerical coverage test was repeated after cleanup.

Preview readiness and all four coverage browser cases were verified again after
restoring port 4337 with an invocation-local cache. Another docs preview was
running concurrently; no unrelated process or persistent app cache setting was
changed.

A before/after screenshot uses the same 32px control, backdrop and browser frame.
Only its foreground image is swapped for the old image. The enlarged crop uses
nearest-neighbor display to expose texture coverage; it is not a claim that a
magnified raster has no visible pixel grid. Real Safari, wide-gamut displays and
DPR 3 were not accepted in this pass.

## Fitting cost and limits

A local Bun-only warm pixel-generation check, excluding PNG encoding, measured
five runs per shape after warmup (median):

| Shape          | Previous center sampling | Area coverage |
| -------------- | -----------------------: | ------------: |
| 32×32 circle   |                   0.99ms |        4.96ms |
| 120×120 circle |                   1.63ms |       17.89ms |
| 250×550 panel  |                   2.61ms |       15.13ms |

The quality correction therefore costs more on a cache miss. It does not
increase texture dimensions or introduce per-frame fitting. These local
microbenchmarks do not establish total browser CPU or frame-time performance.
The attempted full Menu benchmark was interrupted when its temporary mounted
fixture disappeared during development reload; it produced no complete valid
comparison and is not reported as a performance result.

Evidence:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-hairline-antialias/`.
