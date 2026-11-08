# @lenso/glass

Shared glass rendering and motion, extracted from Lenso UI. This workspace package
is not yet published. `@lenso/ui` uses it as a dependency; existing UI imports and
component props are unchanged.

| Entry                 | Responsibility                                                   |
| --------------------- | ---------------------------------------------------------------- |
| `@lenso/glass`        | DOM optics, optional map prewarming and material backdrop paints |
| `@lenso/glass/motion` | Analytic springs, elastic press, drag and velocity deformation   |
| `@lenso/glass/react`  | Optional React refs binding the same runtime                     |

The core and motion entries do not import React, React DOM or Base UI. Importing
them is safe during server rendering; attaching optics and running motion require
a browser. React 19.2–19.x is an optional peer for the React entry.

Material recipes and themes remain in `@lenso/tokens`. Load
`@lenso/tokens/styles.css` in the rendering document and compile the tokens
declaration modules in the official StyleX build. This package adds no independent
theme, stylesheet or component interaction system. Native control behavior,
keyboard handling, focus and portals belong to the consuming component.

## DOM lifecycle

```ts
import { attachGlass, prewarmGlass } from "@lenso/glass";

// `surface` is mounted, sized and styled with the desired glass recipe.
const pending = new AbortController();
const prepared = prewarmGlass(surface, { signal: pending.signal });

// Activation need not await prewarming. Both calls use the same bounded cache.
const detach = attachGlass(surface, { profileKey: "glass-small" });

// On disposal:
pending.abort();
detach();
await prepared;
```

`attachGlass(element, options?)` returns a cleanup function. Options are
`selection`, `profileKey`, `sourceAnchor`, `liveBackdrop` and `liveGeometry`.
These select the existing Lenso optical path; sizing and optical coefficients
come from computed theme/StyleX properties. Use one attachment per element.
`attachContentRefraction(element)` handles a transparent foreground lens.
`paintMaterialBackdrop(element, liquid?)` attaches backdrop paints without
requiring refraction.

Initial optical-map preparation waits until an attached surface approaches the
viewport, so mounting offscreen examples does not interrupt another control.
After that first preparation, the existing resize and theme lifecycle continues.
Use `prewarmGlass` when the caller knows a surface will be shown soon; explicit
prewarming also works outside the viewport.

Moving fusion planes share one module worker for optical-field preparation.
Each plane keeps one calculation in flight and coalesces waiting geometry to
its newest state. The live contour and decoded-field publication remain on the
rendering thread. Worker and synchronous paths use the same material equations
and optical resolution; unavailable or blocked workers retain the synchronous
path. The last active plane releases the worker. Consumer bundlers must retain
the packaged `react/fusion-worker.js` entry referenced by the React runtime's
standard `new Worker(new URL(..., import.meta.url))` expression. No component
prop or application setup changes are required with the supported Vite pipeline.

Eligible aligned fusion planes prepare displacement in worker WebGL 2 at the
same optical density. Pixels near quantization boundaries are recalculated with
the original double-precision sampler before lossless PNG encoding. Unsupported
materials, per-corner shapes, unavailable WebGL and lost contexts retain the CPU
field path. Detached transient filter graphs are reused within an eight-graph,
4 MiB budget, after their previous owner releases them. Generated optical SVG
resources do not invalidate unrelated backdrop consumers.

### Local control lenses

`createControlLens(glass, content, options, replaces?)` refracts a control's own
labels or track. Call `setActive(true)` while held, `update(amount)` after its
existing motion paints, `refit()` after layout changes, and `destroy()` on
disposal. `amount` is clamped to 0–1. Optional replacement elements are masked
only beneath active lenses, and their original inline masks are restored on
release. Multiple range thumbs share the same content filter.

This path adapts Glisse 0.5.0's
[local lens implementation at 46be5ba](https://github.com/0kzh/glisse/blob/46be5ba07b60eb507e887ff338ded7840576a79f/src/internal/lens.ts):
independent grayscale displacement axes, bounding-box filter coordinates for
WebKit, and separate color coverage for text. Lenso bounds the map cache to 32
entries and 8 MiB, keeps the existing control material and motion, and suspends
refraction for forced colors and reduced transparency. The filter should cover
small control content; this is not a full-page capture backend.

`prewarmGlass(element, { selection?, signal? })` prepares optical maps during
idle time and returns whether preparation completed while the element was still
connected and the request was not aborted. It does not change the element's
styles or hold a live filter. The existing cache retains at most 32 unused lenses
and 16 MiB of estimated encoded/decoded map storage. This retains a typical main
menu and submenu together through dismissal. Different geometry, theme,
optical parameters or pixel density require their own maps.

The element needs measurable layout; `display: none` and detached elements return
`false`. Cancellation skips queued work and releases an encode already in flight
when it completes. Prewarming does **not** prepare a background capture, GPU upload
or shader pipeline, and is not proof that a frame has appeared on screen. Do not
await it in the menu's activation path.

## React binding

```tsx
import * as stylex from "@stylexjs/stylex";
import { glassStyles } from "@lenso/tokens/glass";
import { useGlassRef } from "@lenso/glass/react";

const styles = stylex.create({
  geometry: { width: 240, height: 120, borderRadius: 24 },
});

function Lens() {
  const ref = useGlassRef<HTMLDivElement>(undefined, true);
  return <div ref={ref} {...stylex.props(glassStyles.root, glassStyles.optics, styles.geometry)} />;
}
```

`useGlassRef(ref, enabled, selection?, profileKey?, sourceAnchor?, liveBackdrop?, liveGeometry?)`
preserves forwarded ref cleanup. `useContentRefractionRef(enabled)` binds a
foreground lens. `useElasticRef(ref, options?)` adds press feedback independently
of optics, with `enabled`, `shouldStart` and `propertyPrefix` options. These hooks
do not implement accessible controls; use `@lenso/ui` for those contracts.

## Motion and browser scope

`GlassProvider` in `@lenso/ui` owns the app's glass appearance preference.
`useGlassPreferences()` exposes `tint` and `setTint`. The range is 0 (more clear),
0.5 (the unchanged reference recipe), and 1 (more tinted, still glass).
`ThemeScope glassTint` overrides the inherited value for one subtree and its portals.
The numeric CSS property is `--lenso-glass-tint-amount`. Text and rims stay opaque.
The clear half fades the sampled face; the tinted half adds a neutral wash using
light/dark endpoint colors adapted from Glisse's iOS 27 branch. This Web transfer
curve is not a recovered Apple shader or native slider calibration.

Reduced transparency, increased contrast and forced colors take priority and
release refraction resources until the preference is restored. The legacy
`glassTransparency` / `--lenso-glass-transparency` API retains its distinct range:
0 is opaque and 1 is the selected recipe. Prefer `glassTint` for new appearance controls.

`createSpring(value, stiffness, damping, paint)` returns `paint`, `set`, `tune`
and `stop`. Springs share one animation-frame chain, can retarget without losing
velocity, and settle without continuing to schedule frames. Instant updates,
hidden documents and reduced motion use the existing immediate-set behavior.
Stopping the last spring or setting it immediately cancels its pending frame;
retargeting springs from paint callbacks still shares one frame chain.
The advanceSpring(state, seconds) primitive exposes the same analytical solver
for sampled trajectories. It advances value and velocity without scheduling a
frame or painting; existing spring callers need no changes.
`press`, `glassMotion` and `createVelocityDeformation` retain the accepted motion
models and cleanup. Drag presentation still has its own loop; this extraction
does not claim that all browser work shares one frame callback.

Safari remains a supported rendering path. A visible `data-lenso-backdrop`
source allows copied input; eligible sources can use the shared WebGPU backend.
Unsupported content, transforms or GPU failures retain the established native
fallback. Chromium can apply SVG refraction to live backdrops. Unmarked arbitrary
DOM in browsers without that capability uses blur/rim or material-paint fallback.
The browser compositor still determines rasterization and first presentation.

Shader/Rust/HTML-in-Canvas comparisons remain in
[`experiments/glass-route-lab`](../../experiments/glass-route-lab/README.md).
Those experimental renderers are not shipped by this package. The current
production optical model is an approximation, not Figma's recovered shader.
Safari first-frame preparation and continuous animation require separate measurement.

The default iOS 27 profile retains the Figma reference's directional inner shade
and opposing highlights in both themes. The light reference includes a +40 px
Linear Burn inner shadow; a flat interior is not the acceptance criterion.
The Web optical model approximates those effects and does not reproduce Figma's
closed GLASS shader pixel for pixel.

## Registered backgrounds

An application that owns the complete paint behind a lens can supply
`GlassOptions.backdropSource`, or provide `GlassBackdropSourceContext` to its
React subtree. The source returns its element, readiness, a preparation function
and an optional change subscription for input that is invisible to DOM observers
(such as drawing to a canvas). Preparation receives an abort signal and a
checkpoint for yielding before more work.

`prepareGlassBackdrop` presents a detached input canvas at its original device
resolution and applies the lens's original material to it. The source gives the
lens origin in CSS pixels. If part of the source itself uses a browser material,
the source may also provide an inert replay and its painted regions in lens-local
CSS pixels. The renderer keeps native paint in those regions. Unknown input,
changed geometry, source changes, cancellation and disposal leave the original
lens in charge. The source owner must include the whole filter neighborhood and
must not pass a screenshot or an incomplete reconstruction. This interface does
not grant access to pixels of arbitrary DOM.

When there is room beside the lens, the renderer paints the owned source and
its complete optical filter in a separate region. An integer-pixel offset
presents that result at the lens position, so moving foreground content can
reuse the glass without changing its sampling resolution. In a tight viewport
the same material is painted in place.

## Rendering architecture

The selected production direction is TypeScript resource management, shared GPU
shaders for supported backdrop sources, DOM controls and native CSS/SVG fallback.
`@lenso/glass` owns optics, resource lifetime and motion; Base UI retains input,
focus, keyboard and accessibility behavior. Material recipes remain versioned in
`@lenso/tokens` and apply to every rendering path.

GPU work should share source captures, pipelines and bounded caches across lenses.
Prepare reusable resources outside input handlers, batch geometry reads before
writes, and render again only when geometry or source pixels change. A ready
native surface remains available while GPU resources are being prepared or when
a source cannot be represented faithfully. Animation retains the existing spring
model and interruption behavior.

This decision does not make every browser use the same backend today. The current
GPU integration targets eligible Safari/WebKit sources; Chromium retains native
SVG backdrop refraction. Broader GPU selection requires the same material,
interaction, lifecycle and performance checks on the actual browser. Native
Safari is a required acceptance target.

Rust/Wasm remains an experiment until a measured CPU workload justifies its
transfer and startup costs. The route lab's Rust and JavaScript implementations
run the same shader algorithm; changing the host language alone is not evidence
of faster rendering. HTML-in-Canvas remains an optional capture experiment, with
no dependency on it in the supported Safari path. The Aave-inspired full-backdrop
route remains comparison evidence; local control lenses use the bounded path
above without replacing the current material model.

Architecture selection and performance acceptance are separate. The fixed Docs
candidate must pass cold opening, repeated opening and continuous navigation at
the existing visual and motion standards before an optimization is accepted.

## Performance experiments

Keep three measurements separate: a first open after navigation, repeated opens
after resources are ready, and continuous interaction. Record input-to-visible
latency as well as frame intervals; a smooth animation can still start late.
The current extraction does not establish a first-frame improvement.

| Route              | Question to measure                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| DOM and compositor | Can batched layout reads and transform-based motion avoid repeated layout and paint while preserving the same shape?                  |
| Shared GPU         | Can cached pipelines, shared captures and bounded dirty regions reduce setup and per-frame work without stale backgrounds?            |
| Worker / Rust      | Does moving capture preparation or scene work off the main thread improve input latency after transfer and GPU synchronization costs? |
| HTML-in-Canvas     | Does browser-owned DOM capture improve the same scene where supported, with the existing Safari path retained?                        |

Start with Menu open, close and submenu transitions, then press/drag, interrupted
springs, moving backgrounds and multiple overlapping lenses. Include light/dark,
iOS 27 recipes, DPR 1/2, reduced motion, idle pages and repeated mount/dispose.
Use fixed production builds and serial browser runs. Compare Chromium, WebKit
and native Safari; WebKit automation alone is not native Safari performance proof.

Record capture/readback time, upload time, GPU submissions, layout reads, live
resources and frame P95/max separately. The former automated sustained-interaction
and first-open diagnostics have been retired. Their P95 < 34 ms and max < 150 ms
targets remain historical comparison criteria, not a currently verified gate.
First-open latency needs its own trace and baseline. Preserve the existing pixel
tolerances, animation timing and keyboard/focus contracts when comparing routes.

The former first-open trace recorded menu mounting, filter attachment, GPU
selection and frame callbacks separately, alongside device, pipeline and upload
completion spans. Canvas raster and asynchronous encoding spans can overlap and
must not be summed as CPU time. These milestones diagnose preparation; none proves
screen presentation or replaces native Safari acceptance.

## Development and licensing

```sh
bun run --filter @lenso/glass build
bun run --filter @lenso/glass typecheck
bun run --filter @lenso/glass test
bun run --filter @lenso/ui test
```

UI integration tests exercise the installed package entrypoints. Internal optical
reference tests retain source access without creating a public testing export.
The packed-consumer test installs this package together with UI and tokens.

The glass adaptations retain MIT attribution. The optional WebKit-derived WGSL
backend retains LGPL-2.0-or-later terms. Distributions include the full notices,
licenses and corresponding runtime sources/build configuration in `dist/source`.
Rebuild within this repository using its pinned toolchain and lockfile. Publishing
this package or its dependents requires a separately authorized release.

## Default shared optical core

Supported iOS/iPadOS 27 Small and Medium rounded rectangles now select the shared
TypeScript + WebGL2 optical core automatically. Existing `attachGlass`, React refs
and UI component props are unchanged; consumers do not choose a backend. The
existing DOM rim, highlights, foreground and interactions remain owned by their
components. The runtime uses its existing background scheduler, capture atlas,
visibility handling and dirty regions to feed the core. The comparison harness
uses the same kernel from `renderer`, rather than retaining another shader copy.

The current fast path requires default tint and optical settings, uniform circular
corners, DPR 1 or 2, unscaled axis-aligned geometry (allowing layout rounding), and self-contained opaque CSS
paint with its entire optical sampling neighbourhood inside the marked source.
Custom tints/optical parameters, fusion outlines, other profiles, transparent or
arbitrary DOM backgrounds, content lenses and unsupported capture remain on the
existing GPU/SVG/native path. This is a default cutover for supported input, not
complete analytic coverage of every material or arbitrary page capture.

The core initializes lazily, with TypeScript managing GPU resources and the
retained shared GLSL shaders performing the optical work. The default import
graph has no Wasm dependency. Applications need no Wasm URL, asset loader,
WebAssembly compilation permission or Rust installation. Missing WebGL2, allocation failures and context loss
retain/restore the existing complete copy. A lost group does not enter an
unbounded retry loop; remounting can initialize a new group. The fallback keeps
functionality and can have the original renderer's performance limitations.

The Rust/Wasm driver remains a comparison consumer of the same shaders. Its
binary has an enforced 48 KiB raw / 20 KiB gzip budget; debug names and producer
metadata are removed. Its Rust source, generated binary and tests live only in `experiments/glass-driver-comparison`; none ship in the npm package. To regenerate
only the TypeScript shader strings, with Bun and no Rust toolchain:

```sh
bun run --filter @lenso/glass generate:shaders
```

To also rebuild comparison Wasm after editing Rust or shaders:

```sh
bun experiments/glass-driver-comparison/build-wasm.ts
bun run --filter @lenso/glass build
```

Regeneration requires Rust 1.99+, the `wasm32-unknown-unknown` target and
wasm-bindgen CLI 0.2.127. `LENSO_CARGO` can select the Cargo executable. The source
and lockfile hash is checked by the experiment tests, alongside actual Wasm instantiation. Package tests check shader-source consistency. Normal package builds consume the checked-in generated shader strings.
Renderer source, notices and the regeneration script ship in `dist/source`.
The experimental Rust crate can be compiled with `default-features = false`; it is not a supported native rendering integration.

Browser integration fixture: run
`bun experiments/glass-shared-core/consumer-server.ts` from the checkout root,
then open its loopback URL. It uses the built `@lenso/ui` GlassButton and Glass
runtime, with controls for animation, context loss and unmount/remount. This is a
focused consumer fixture, not the documentation development entrypoint.
