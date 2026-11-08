# Glass renderer route laboratory

This isolated experiment compares a JavaScript shader driver, a Rust/Wasm
retained renderer, an Aave-inspired live-content SVG pipeline, and
HTML-in-Canvas as a backdrop input. No production component imports it.

Safari is an acceptance target, separately from Playwright WebKit.
The existing production renderer remains independent.

This laboratory retains historical iOS 26/27 comparison recipes. They do not
define supported library behavior: production Liquid Glass uses only the iOS 27
recipe and no longer exposes material version selection.

## What the routes actually do

| Route    | Rendering ownership                                                                             | Background input             | Browser requirement                   |
| -------- | ----------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------- |
| `shader` | JavaScript owns GPU resources and submits three shared passes                                   | Explicit canvas or video     | WebGL2                                |
| `rust`   | Rust owns programs, textures, framebuffers, the blur cache, instance buffer and draw submission | Same canvas or video         | Wasm + WebGL2                         |
| `aave`   | Native SVG filters the owned content directly; video uses the shared JS WebGL renderer          | Live DOM, canvas, video      | SVG filter features; WebGL2 for video |
| `html`   | Drawable DOM becomes a canvas input to the JS shader renderer                                   | Explicit descendant DOM tree | HTML-in-Canvas + WebGL2               |

Rust is not an alternative to shaders. The Rust and JS engines compile the
**same GLSL files**, allocate the same three RGBA8 textures, use the same
separable Gaussian and issue the same instanced glass draw. This comparison
isolates the rendering driver's cost instead of changing the material while
changing languages. It does not compare Rust/WebGL2 against JS/WebGPU.
The repository already has a production WebGPU path; this lab does not establish
a speedup over that renderer or the production Menu.

The Rust engine is more than the older displacement-map Wasm microbenchmark:
it creates and disposes GPU resources and executes the complete glass rendering
pipeline. It is still a browser renderer, with browser-provided graphics and
DOM/media inputs. There is no native Metal backend, general DOM rasterizer,
full scene graph, worker implementation or device-loss recovery in this prototype.

## Visual specification and fidelity boundary

All comparisons use a fixed 600 × 400 CSS-pixel scene, explicit DPR 1 or 2,
one 240 × 224 panel or a grid of equally sized lenses. The blue diagonal,
fine grid, warm moving rectangle and text expose color transfer, blur and
refraction. UI controls remain actual HTML buttons. The DOM route also includes
an editable field and an operable link. Video uses locally generated H.264
test footage, with one decoded frame sampled by all lenses.

The face paints come from the audited iOS 26/27 recipes, with Small and Medium,
Light and Dark. Native Figma face samples are read from
`fixtures/apple-material-color-reference.json`; its existing tolerance is
unchanged. Frost uses the current Web mappings: 26 Small 3.5px, 26 Medium 6px,
27 Small 3px, 27 Medium 8px. Depth is 16/30 and refraction 1/.7 respectively;
26 has no chromatic splitting and 27 maps the existing .2 dispersion value to
±2% red/blue displacement offsets.

Optics use a simplified Snell-law height profile with refractive index
1.5 and a rounded-rectangle distance field. The GPU computes it analytically;
SVG uses the existing 128-sample, 2× displacement map with quadrant symmetry.
This is **not Figma's recovered shader**. The GPU rim is deliberately an
experimental directional term, and the SVG prototype has no matching rim.
Neither route implements the complete production contours, shadows, opacity
groups, Apple adaptivity or Menu spring/morph behavior. Full SVG/GPU pixel
parity is therefore not an acceptance claim; the JS/Rust pair is expected to
match because it shares the same shader and input.

## Build and run

Use the installed Rust toolchain and `wasm32-unknown-unknown` target. The
dependency versions match the installed wasm-bindgen 0.2.127 generator.
No browser or system preferences need to change.

```sh
CARGO_TARGET_DIR=/tmp/lenso-glass-route-target cargo build --manifest-path experiments/glass-route-lab/rust/Cargo.toml --release --target wasm32-unknown-unknown --offline
wasm-bindgen /tmp/lenso-glass-route-target/wasm32-unknown-unknown/release/lenso_glass_route_lab.wasm --target web --out-dir /tmp/lenso-glass-route-wasm --out-name glass
ffmpeg -f lavfi -i 'testsrc2=size=600x400:rate=30:duration=3' -c:v libx264 -pix_fmt yuv420p -movflags +faststart /tmp/lenso-glass-route-wasm/scene-1.mp4
ffmpeg -f lavfi -i 'testsrc2=size=1200x800:rate=30:duration=3' -c:v libx264 -pix_fmt yuv420p -movflags +faststart /tmp/lenso-glass-route-wasm/scene-2.mp4
bun experiments/glass-route-lab/server.ts
```

The server reports its local URL. `GLASS_LAB_PORT` selects a fixed port.
`GLASS_LAB_WASM` changes the artifact directory. Generated binaries and browser
evidence stay outside the checkout.

## Verification

```sh
cargo check --manifest-path experiments/glass-route-lab/rust/Cargo.toml --offline
cargo test --manifest-path experiments/glass-route-lab/rust/Cargo.toml --offline
cargo clippy --manifest-path experiments/glass-route-lab/rust/Cargo.toml --all-targets --all-features --offline -- -D warnings
cargo doc --manifest-path experiments/glass-route-lab/rust/Cargo.toml --no-deps --offline
```

The former automated browser benchmark runner has been removed. Historical browser results below are not reproducible through a maintained test command.

For system Safari, open `/native-case?index=0` to obtain the first case's query,
then navigate to `/?<query>` in a dedicated Safari window. The local page records
its own measurements and sends them to this local server, then advances through
the matrix. This avoids enabling Safari's remote automation preference. Receipts
go to `GLASS_LAB_EVIDENCE` or `/tmp/lenso-glass-route-evidence`. UI interaction and
native screenshot checks are separate from this self-reporting performance run.
`native=1&single=1&case=N` records just one manually selected case. `probe=1`
records capability and initialization state; adding `measure=1` runs the same
short benchmark without advancing to another case.

The concrete regressions covered are blank/failed GPU rendering, invalid lens
records, JS/Rust output divergence, drift from previously captured material
face colors, non-advancing video, lost native pointer/keyboard activation, and
lost DOM editing/link behavior. Existing production suites do not import or
exercise these independent engines.
The SVG smoke cases also check that content outside a lens is unchanged and
that its face actually renders. This catches WebKit clipping even when DOM
editing and button activation still work.

## Reading measurements

Performance uses alternating JS/Rust order across three rounds, identical
inputs and DPR, and retains raw intervals. RAF intervals are browser frame
opportunities, not displayed frames. CPU timing covers the callback, canvas
painting, Wasm marshaling and GPU submission; it excludes asynchronous GPU and
browser compositing work. SVG callback CPU time is consequently not comparable
to total SVG rendering cost. Texture bytes count only the three explicitly
allocated RGBA8 images, not total browser/GPU memory. Cold time includes local
shader/Wasm setup and local fetches, not real network deployment cost.

Run benchmarks serially without competing browser tests or builds. A capability
property alone is not a successful rendering test. Unsupported input combinations
must remain explicit; replacing live DOM/video with a static bitmap would invalidate
the compatibility result. These experiments do not establish production Menu,
scrolling, nested glass, arbitrary backdrop, mobile-device, battery or sustained
thermal performance.

## Local result, 2026-10-29

On an Apple M2 Pro Mac running macOS/Safari 27.0.1 and Chrome 156.0.8078.48:

- 32 JS/Rust scene pairs were pixel-identical in Chrome and Playwright WebKit.
- 96 GPU and 48 SVG face samples passed the existing 6/255 tolerance; the
  largest difference was 2/255. The SVG samples were rerun after its WebKit fix.
- 17 smoke cases passed: 15 supported rendering/interaction cases plus two
  expected default HTML-in-Canvas unsupported results. SVG cases additionally
  preserved pixels outside the lens and visibly changed its face.
- System Safari separately rendered JS/Rust canvas and video inputs, and the
  corrected SVG DOM route retained editing, links and button activation.
- SVG initially clipped its output in WebKit. Giving the source a local
  compositing layer fixed the coordinate problem; moving definitions alone did not.
- Safari's JS/Rust RAF median was about 17ms in the short runs. This did not
  establish a language-driven speedup. The SVG Medium case was substantially
  slower in this prototype; its rendering is not identical to the GPU rim model.
- Flagged HTML-in-Canvas passed its functional case. Its larger benchmark
  stopped after eight measurements when Chrome exited. Other long Chrome
  matrices also exited, so the cause cannot be attributed to that API.

The `perf` matrix is available for reproduction but was not completed as a
separate Chrome/WebKit performance cohort in this investigation. System Safari
provided the recorded route timings. No production Menu speedup or full Figma
optical equivalence is claimed.

## Sources

- [Figma renderer architecture](https://www.figma.com/blog/figma-rendering-powered-by-webgpu/)
- [Figma Glass behavior and limitations](https://help.figma.com/hc/en-us/articles/360041488473-Apply-effects-to-layers)
- [Figma GlassEffect and separate ShaderEffect API](https://developers.figma.com/docs/plugins/api/Effect/)
- [Aave's live-content and shared-video approaches](https://aave.com/design/building-glass-for-the-web)
- [HTML-in-Canvas overview](https://developer.chrome.com/blog/html-in-canvas)
- [HTML-in-Canvas 2D geometry and paint lifecycle](https://developer.chrome.com/docs/web-platform/html-in-canvas/2d)

The Aave route is a local experiment following the author's architecture; it is
not Aave's shipped implementation or its benchmark. See `NOTICE.md` for adaptations.
