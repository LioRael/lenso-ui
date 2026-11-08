# Global tinted glass: layer and optical differences

Follow-up: [foreground and shadow correction](glass-tinted-appearance-fix.md)
implements this diagnosis. The text below records the pre-fix state.

Date: 2026-11-08. Status: diagnosis complete; rendering changes are not implemented
or accepted by this audit.

## Scope and reference

The reported control is the homepage's top-right Theme popover, Global glass
appearance, at its most-tinted end. The actual page was driven through that
slider, rather than only changing a local glass-lab override. In a fresh browser
context, End sets tint to 1. The inspected homepage controls and portalled panel
inherit 1 and use iOS 27. Visible source sizes include 32×32, 62×28, 98×34, 264×48
and 80×40. This checks the current source in a fresh context, not the user's
persisted browser settings.

The public reference is
[onlymoein/liquidglass](https://github.com/onlymoein/liquidglass), using the local
0.11.2 fixture pinned at `89f8b7360a4501940aba9b838710bceb56b23601`.
The current public `main` versions of
[`src/styles.css`](https://github.com/onlymoein/liquidglass/blob/main/src/styles.css)
and
[`src/internal/refraction.ts`](https://github.com/onlymoein/liquidglass/blob/main/src/internal/refraction.ts)
were fetched again and match the fixture files byte-for-byte. The reference is
another Web implementation; its comments about native measurements are not an
independent physical-device validation in this audit.

Lenso's tint runs from clear 0 through regular 0.5 to tinted 1. The reference's
`--lg-transparency` runs in the opposite direction. The comparison uses
`reference transparency = 1 - Lenso tint`. Both most-tinted endpoints use
247/247/249 at 96% alpha in light mode and 30/30/32 at 95% alpha in dark mode.
The separate legacy `glassTransparency` and accessibility reduced-transparency
paths are not the control implicated by this homepage reproduction.

## What reproduces

Production fixtures were rebuilt from the current Lenso package output and
pinned reference output. They have matching positions, sizes and backgrounds.
Chromium uses Metal/GPU at 1200×720 and DPR 1. The first 24 captures cover both
libraries, light/dark, tint 0.5/0.75/1, and CSS/registered-image striped inputs.
Eight additional captures exercise 32/44/60px controls with a registered input at
regular and fully tinted states. All 32 comparison pages report no page errors.

Both libraries reach almost the same central color at maximum tint, but Lenso
loses the inner edge depth and much of the surrounding separation. The smaller
controls make this especially relevant to the homepage; it is not confined to
large decorative circles.

For a 120px light standalone Glass over a flat pink registered source:

| Maximum tint, red channel (0–255) |   Lenso | Reference |
| --------------------------------- | ------: | --------: |
| Center mean                       | 247.125 |   247.000 |
| Center minus upper inner band     |   0.000 |     4.250 |
| Center minus side inner band      |   0.000 |     5.000 |

A 44px light circle over the striped image likewise has center means
244.167/244.000, while side means are 244.125/239.000. Its near-identical center
therefore conceals a substantial difference in perceived contour. These are
specific spatial samples, not an image-similarity or perceptual-quality score.
Dark mode reproduces the mechanism with smaller absolute shade differences.

The old material audits explicitly limited their claims to sampled centers.
Those results remain valid within that limit; they do not establish the fully
tinted material's depth, rim, exterior shadow or overall parity.

## Isolating the cause

Twelve additional screenshots toggle only the foreground rim or tint wash,
in both libraries and both appearances, over the same flat pink source.

- Hiding the reference's `::before` rim leaves its center unchanged but reduces
  both measured light inner-band differences to zero.
- Hiding Lenso's `--lg-rim` also leaves those bands unchanged: its existing rim
  does not carry that broad interior shading.
- Hiding Lenso's tint wash restores a 3.062-level upper-band difference that
  was zero under maximum tint. That shading exists in its filtered input, but
  the near-opaque paint covers it.

This makes the layer difference causal in the fixture. It is not evidence that
one global opacity value is being dropped by the homepage or its portal.

The single-command red-capable check in the evidence archive is
`python3 check-tinted-rim.py`. It checks center agreement and compares retained
side depth against the reference. Current output is:

```text
Tinted side depth: Lenso=0.000, reference=5.000; center difference=0.125
AssertionError: The tinted wash erases the inner edge depth
```

The 75% reference-depth threshold detects this diagnosed gap; it is a proposed
reference-alignment check, not a native Apple specification. The check remains
red because this turn investigates the defect rather than implementing a partial
material replacement. It is kept with research evidence, not added as a failing
project test.

## Owning implementation differences

1. **Foreground contour and backing shade are different operations.** Lenso's
   `appleShade` and `appleContour` feed the background material filter. The
   preference wash is a CSS background-image above that filtered backdrop. The
   reference paints its directional bright line and inner shade in a separate
   foreground rim. Consequently its edge depth survives opaque tinting.
2. **The rim model still differs.** Lenso's optical field uses a narrow Gaussian
   directional highlight. The reference rim includes a top/bottom lit line,
   upper and side inner shading extending up to 15px, and an outside hairline
   extending up to 1px beyond the shape. Lenso's full-size background rim is
   clipped to its host; a replacement must account for that exterior extent.
   Increasing existing highlight intensity alone cannot reconstruct the missing
   black shade or move a clipped hairline outside the host.
3. **Standalone shadows have different size behavior.** The reference's shadow
   offset, blur and opacity interpolate with control size. Generic Lenso Glass
   uses a fixed 1px/3px drop plus an inset edge; GlassButton uses the existing
   action-shadow token. This is a source-confirmed difference. This audit does
   not attribute a quantified share of the total appearance gap to shadow alone.
4. **Backdrop refraction remains a separate mismatch.** The reference uses a
   linearly declining rim displacement, with a default bezel fitted to control
   size. Lenso retains its quartic optical profile and small-material defaults
   such as a 30px bezel and 0.7 refraction level. Tone-table alignment did not
   replace that optical model. Its contribution is clearer before full tint;
   the ablation above establishes the foreground-layer issue independently.

The shared fused surface already owns one tint wash over its neck and bodies.
Its foreground vector rim has separate ownership from standalone rims. Any
correction must avoid painting per-member depth a second time into fused glass.
Custom knobs, explicitly colored controls and the retained iOS 26 recipes also
need their own eligibility rules.

## Implementation direction established by this audit

The owning correction is to separate the standalone iOS 27 foreground rim from
backdrop transfer. The rim must retain its directional dark/bright structure
above the tint wash, allow its exterior hairline, and follow the same contour
without altering ink opacity. Keep tint as a backing-density preference and
preserve refraction underneath it. Regular, intermediate and maximum tint must
be compared together so the endpoint is not repaired by breaking the midpoint.

After that layer is correct, align the standalone size-dependent shadow and
measure the remaining refraction-profile gap. Reuse fitted/cached rim output;
none of the static rim math should become work on every pointer or animation
frame. Shared fusion must continue to paint one contour and one backing wash.

Required acceptance includes the real global homepage slider and portals,
32/44/60/90/120px sources, both appearances, intermediate tint, native/copy
backdrop paths, press/release, fused necks, reduced transparency and forced
colors. Native Safari and wide-gamut validation remain open. Prior automated
WebKit native-backdrop calibration was unresolved; this audit's reference pixel
claims are restricted to Chromium. No performance gain or native parity is
claimed, and no production material code changed in this research pass.

## Evidence

`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-tinted-appearance-audit/`

The archive retains comparison/ablation screenshots, exact region samples,
fixture sources, scripts, the known-red check, the actual homepage state and
source snapshots. Paths in the scratch fixtures are local and require remapping
on another checkout. The temporary comparison server was stopped; the existing
docs preview remains available on port 4337.
