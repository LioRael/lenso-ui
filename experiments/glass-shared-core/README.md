# Shared Glass core Web prototype

An isolated, unpublished iOS/iPadOS 27 comparison of retained map-based optics
and the current TypeScript/WebGL2 analytic renderer over an explicitly owned
background.

## Architecture and scope

Production owns the GLSL in `packages/glass/shaders` and the TypeScript driver in
`packages/glass/src/shared-core`. The browser comparison uses that TS driver by
default. `?driver=wasm` selects the optional historical wrapper: `core` and `web`
reference the Rust crate in `experiments/glass-driver-comparison/renderer`.
All drivers consume the same retained GLSL. No native renderer or FFI integration
is implemented; GLSL portability is not a Metal, GPUI, RN, MyGo or nsh adapter.

The first slice implements default-tint Small and Medium rounded rectangles in
light/dark appearance. It retains the current Snell profile, thickness, spectral
offsets, material color-transfer equations, inner shade, dark contour and opposing
rim highlights. It does not substitute MyGo's macOS material. See `NOTICE.md`.

The reference directly calls `createGeometryLens` from production source. When
WebGPU is available it also uses production `readOptics` / `createOpticsBatch`,
with an experiment-owned crop atlas and per-lens output canvases. The production
capture and scheduling layer is not exercised. SVG fallback remains explicitly
selectable; its input is cropped to each lens's optical neighbourhood. A local
compositing layer is necessary for Safari's SVG output. Both routes retain real
HTML controls outside the decorative scenes.

The analytic kernel is a visual approximation of those functions, not pixel
parity: the source uses 128-sample interpolation, encoded 8-bit displacement maps,
post-displacement 0.4px smoothing and browser SVG rasterization. The prototype
computes continuous displacement with bilinear GPU sampling and shader coverage.
Its CPU reference is a checkable model, not the rendering hot path.

Fusion, clear/large/knob materials, tint preferences, arbitrary DOM capture,
content lenses, elastic controls, system materials, reduced-transparency mapping,
device-loss recovery and native adapters are outside this slice. The harness
currently blurs the entire 600 × 400 source rather than dirty regions. It is not
ready to replace the production Web implementation.

## Build and run

For the default TS comparison, run `bun experiments/glass-shared-core/server.ts`; no Rust toolchain or Wasm assets are required.

For the optional Wasm route, use the repository Rust toolchain, installed `wasm32-unknown-unknown` target,
wasm-bindgen 0.2.127, and Bun. Build artifacts stay outside the checkout.

```sh
CARGO_TARGET_DIR=/tmp/lenso-shared-core-target cargo build --manifest-path experiments/glass-shared-core/Cargo.toml -p lenso-glass-core-web --release --target wasm32-unknown-unknown --offline
wasm-bindgen /tmp/lenso-shared-core-target/wasm32-unknown-unknown/release/lenso_glass_core_web.wasm --target web --out-dir /tmp/lenso-glass-core-wasm --out-name glass
bun experiments/glass-shared-core/server.ts
```

Default URL: `http://127.0.0.1:4197/`. `GLASS_CORE_PORT`, `GLASS_CORE_WASM` and
`GLASS_CORE_EVIDENCE` override port, artifact directory and receipt directory.
The server bundles source on startup; restart it after TypeScript edits.

Select appearance, material, lens count and DPR, then Apply. Animate background
starts/stops the selected route (both by default). Inactive routes retain their last frame. Compare performance runs each route separately
for three alternating rounds, warming 12 frames and measuring two seconds per
round. Keep the page visible and avoid builds or other browser benchmarks during
measurement. Navigation interrupts a run. Download measurements exports raw data;
completed runs also write local JSON receipts to `/tmp/lenso-glass-core-evidence`.

## Measurement contract

Preparation measures map/DOM setup on the reference side and the selected TS/Wasm driver,
initialization and GPU setup on the candidate side. It is order-dependent, not a
controlled cold-open benchmark. It neither measures first presentation nor
deployment-network latency. Compilation/pipeline caches can survive navigation.

RAF intervals measure browser frame opportunities, not confirmed displayed
frames. Callback timing includes source painting, source-copy updates and GPU
submission, but excludes asynchronous GPU execution and browser compositing.
The GPU baseline packs local crops into an atlas; the SVG baseline copies into
each lens's retained source canvas. The candidate uploads once and batches lenses. These are different rendering organizations, so this
does not establish that Wasm is faster than JavaScript driving identical shaders.
Memory, energy and mobile thermal behavior are unmeasured.

## Checks

```sh
cargo check --manifest-path experiments/glass-shared-core/Cargo.toml --workspace --offline
cargo test --manifest-path experiments/glass-shared-core/Cargo.toml --workspace --offline
cargo clippy --manifest-path experiments/glass-shared-core/Cargo.toml --workspace --all-targets --all-features --offline -- -D warnings
cargo doc --manifest-path experiments/glass-shared-core/Cargo.toml --workspace --no-deps --offline
cargo test --manifest-path experiments/glass-route-lab/rust/Cargo.toml --offline
bun check --no-script -p experiments/tsconfig.json
bun --bun oxlint --config .oxlintrc.json --deny-warnings experiments/glass-shared-core
```

The added native regression guards displacement sign, neutral centre and scale
invariance; existing driver tests cover malformed input and capacity. Neither
executes a browser. Browser checks must separately exercise actual shader
compilation, nonblank output, visual comparison and the measurement controls.

## Local observations on 2026 November 6

macOS 27.2, in-app Chromium 156. Scene 600 × 400 CSS pixels, DPR 2, three alternating
two-second rounds. These historical receipts carry implementation
`ios27-analytic-v1-composited-reference`; earlier receipts predate the Safari
compositing correction and are not the final timing cohort.

| Case                    | Reference RAF median | Prototype RAF median | Reference RAF p95 | Prototype RAF p95 |
| ----------------------- | -------------------- | -------------------- | ----------------- | ----------------- |
| Light Small, 1 lens     | 8.3 ms               | 8.3 ms               | 9.3 ms            | 9.3 ms            |
| Light Medium, 16 lenses | 16.4–16.5 ms         | 8.3 ms               | 17.5–17.6 ms      | 9.3 ms            |

No interval exceeded 34 ms in these final rounds. Callback p95 was 0.2–0.3 ms
for the reference and 0.2–0.6 ms for the prototype; low callback time does not
mean the reference's asynchronous filtering is free. The multi-lens result
is superseded as a comparison of current production paths: the original reference
forced SVG and omitted production WebGPU. It does not establish the advantage
of Wasm over the current production renderer.

The release Wasm is 78,765 bytes raw / 22,008 bytes gzip; generated JS is 22,788
bytes raw / 5,233 bytes gzip (gzip level 9). The local server serves raw bytes;
gzip sizes describe a compressed deployment, not this local transfer. The
comparison harness and production-source bundle are separate, development-only
costs. Brotli, deployment caching and real network loading are unmeasured.

First observed candidate preparation was 453.5 ms in Chromium and 727 ms in
Safari. Subsequent observed preparations ranged from 16 to 66.6 ms. These are
individual observations, not a distribution or a promise about added site-load
latency. The final two Chromium cases measured 66.6 and 21.5 ms respectively.

Small light/dark and Medium light/dark were visually inspected in Chromium.
Safari separately rendered the corrected dark Medium 16-lens pair. Its initial
uncomposited reference was visibly wrong and was fixed. The original animation
path was subsequently found to be unusably slow in Safari; see the follow-up below. No iPhone, iPad or low-end Android test occurred.

Initial Chromium CSS screenshot probes (interiors inset 5px, pre-compositing-fix
captures) averaged 1.16–1.70 RGB levels of difference on a 0–255 scale, with
channel p95 of 3–5. Different screenshot subpixel origins and unmeasured rounded
edges make these exploratory values, not a parity threshold or acceptance gate.
The corrected Safari pair visibly retains the dark material and edge light;
fine refraction, blur and antialias differences still require calibration.

Recommendation: retain production Web behavior, keep this adapter optional,
and measure identical-shader JS/Wasm drivers plus real component/background
integration before choosing a production migration.

## Safari animation follow-up

The six-second browser regression probe (`?probe=both`, `reference` or `shared`)
records raw frame intervals and rejects hidden documents. Its 100 ms ceiling
catches the reported long stalls; passing does **not** mean 60 fps or confirmed
presentation. Do not interact with other tabs during a run.

On Safari 27.2, 16 Small dark lenses at DPR 2, the original full-scene SVG
reference measured median 2,409 ms with both routes running; reference alone was
2,342 ms, while the shared core alone was 17 ms (p95 18, max 23). Cropping each
SVG input improved its median to 263 ms, still unacceptable. Cloning a separate
filter per lens did not improve it (268 ms) and was reverted.

The default reference now uses the existing production WebGPU optical batch
when supported, instead of forcing its SVG fallback. Receipts identify
`ios27-analytic-v3-production-gpu-reference` and the actual reference backend.
No production rendering files were changed by this follow-up.

Six-second Safari measurements after that correction (600 × 400, DPR 2):

| 16-lens case | Route       | Median | p95   | Maximum |
| ------------ | ----------- | ------ | ----- | ------- |
| Dark Small   | Both        | 26 ms  | 33 ms | 99 ms   |
| Light Medium | Both        | 43 ms  | 46 ms | 52 ms   |
| Light Medium | Shared only | 17 ms  | 18 ms | 30 ms   |

Three alternating isolated rounds of the corrected Light Medium case measured
production WebGPU medians of 36/37/37 ms (p95 38/39/40), versus shared-core
medians and p95 of 17 ms in all rounds. Warm preparation on that navigation was
130 ms for the reference and 38 ms for the candidate. Small dark and Medium
light were visually inspected in native Safari, and the comparison and animation
controls were exercised. These checks do not establish full material parity.

A first corrected Small run also contained a 1,047 ms stall and is retained as
failed evidence. Its cause was not established; the repeat above passed the
long-stall check. This is not a stable 60-fps acceptance result. Reference GPU
preparation in these runs took about 3.1–3.3 seconds and needs separate work.

These measurements correct the test harness, not a production Web migration.
The old Chromium SVG-versus-analytic results must not justify enabling Wasm by
default. Repeat isolated reference/shared rounds with the corrected backend,
then validate actual component integration and low-end/mobile devices.
