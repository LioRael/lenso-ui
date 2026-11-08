# Shared glass rendering experiment

This opt-in prototype compares 100 actual `GlassButton` controls on one 600 × 600
backdrop. It is outside package exports and production components. Pixel parity,
input behavior and performance must pass together before this route can be
considered a replacement.

## Run

Build the current packages, then run from the repository root:

```sh
bun run --filter @lenso/tokens build
bun run --filter @lenso/ui build
```

The former browser benchmark runner has been removed. The measurements below are historical; package builds alone do not reproduce them.

## Measured result

The full matrix on 2026-10-28 passed all 16 pixel comparisons at the unchanged
one-step per-channel tolerance, covering 14,400,000 pixels. All 48 interaction runs
completed, with mouse and Space activation and no browser or GPU errors.

On Apple M2 Pro, macOS 27.0.1 and Chrome 156.0.8078.48, the median of the 24
per-run RAF interval P95 values fell from 66.7 ms for native SVG to 33.4 ms for the
shared GPU prototype. All eight paired scenarios improved. This is one complete
local matrix with fresh browser processes and a fixed native-then-GPU order;
it is not a cross-device benchmark or a presented-frame-rate measurement.
The archived production fixture, screenshots, source hashes and raw report
identify this evidence cohort; later builds require their own verification.

## Rendering

One WebGPU device owns the backdrop, shared material maps and intermediate atlases.
The renderer compiles the fitted production SVG graph without changing optical
coefficients, map density, Gaussian strength or motion parameters. It reproduces
float32 Gaussian kernels, paired linear sampling, mirrored blur boundaries,
physical-pixel crop bounds, and the graph's resolved 8-bit intermediates.

The source includes shadows from preceding controls in DOM paint order. A shared
shadow atlas uses render-only clones of the original controls, retaining their
classes and authored styles. Reconstructing these shadows from serialized computed
styles changes rasterization. The clones are inert and hidden from accessibility.
The backdrop and shadow captures are reused until their respective inputs change;
material kernels and GPU resources are also reused.

Resting controls receive GPU atlas tiles through individual canvas surfaces on the
same device. The original DOM button retains its label, rim, tint, shadow, focus,
input handlers and springs. Its wrapper preserves pointer targeting.

Transformed controls, controls on fractional CSS coordinates, and controls with a
foreground filter use a compact lossless image bridge for native edge composition.
Only those controls are packed into its atlas. Their optical graph still runs on
the shared GPU; a lightweight native SVG image filter performs final clipping and
composition with the original foreground. Pointer and keyboard behavior stays on
the same button. The full-scene image bridge was rejected because its encoding and
SVG resource update costs erased the rendering benefit.

Synchronous image encoding, transfer and submission are included in `cpuP95` and
the interaction measurements. `nativeExports`, `nativeExportPixels`, and
`maxNativeLenses` record use of the compact bridge. No frame throttling, reduced
resolution, weaker material or shorter spring is used.

The Gaussian sampling adaptation and license are recorded in [NOTICE.md](NOTICE.md).
The original optical material retains the MIT attribution in
[`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

## Scope and measurement limits

This remains an experiment for an owned opaque backdrop and 100 same-size,
neutral iOS 27 Small icon controls at DPR 1 or 2. Prominent materials, mixed sizes,
nested or overlapping glass, portals, arbitrary page capture, resize, device
recovery and Safari/Firefox support are not provided. Bounds and kernel capacity
are checked explicitly. This cannot be inserted transparently behind an arbitrary
existing DOM page.

The benchmark animates the backdrop and interacts with one control at a time.
It does not establish performance for 100 simultaneously transforming controls;
the compact bridge expands with the number of transformed controls. Cold shader
setup and browser-managed GPU memory need separate evaluation before production
adoption.

`completionP95` is asynchronous GPU queue completion latency, not a presentation
timestamp. RAF samples measure browser frame opportunities, not the display's
presented-frame rate. Retain the exact fixture and all failed reports when making
comparisons; a passing historical run does not qualify a different build.

The production shared-scheduling and fitted-map-cache changes are independent of
this experiment. No production component imports this renderer.

API references:
[HTML in WebGPU canvas](https://developer.chrome.com/docs/web-platform/html-in-canvas/webgpu),
[HTML-in-Canvas concepts](https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts).
