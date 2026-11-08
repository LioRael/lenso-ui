# TypeScript and Wasm WebGL driver comparison

Date: 2026-11-07 (Asia/Shanghai)

Follow-up: [Distribution cleanup and current/retained TS comparison](glass-distribution-and-ts-generation-validation.md).
Rust/Wasm sources, artifacts and tests are now experiment-only and no longer ship
inside the npm package; the measurements below record the earlier driver comparison.

## Result

The default Web optical core now uses TypeScript to manage WebGL2 resources. It
retains the same shared GLSL, optical equations, background capture, material
selection, DOM highlights and component interactions. The default built runtime
graph contains no WebAssembly initialization or embedded Wasm payload. No public
component or runtime API changed.

The measured Rust/Wasm driver did not show a stable rendering advantage over the
TypeScript driver. It remains a comparison consumer of the same shaders, with a
smaller binary and explicit build/test size limits. This conclusion concerns the
driver language; it does not compare the new shader renderer with the older SVG
pipeline or resolve the separate Menu opening/layout investigation.

## Equal-work comparison

`experiments/glass-driver-comparison` imports both package-owned drivers. Both
use identical retained vertex, blur and glass shaders, RGBA8 textures, two blur
passes, lens records, blend state, output dimensions and source revisions. Each
source is an opaque 1200 × 800 canvas representing 600 × 400 CSS pixels at DPR 2.
The shader source strings generated for TypeScript are checked against the Rust
crate's actual GLSL files.

Three complete runs were recorded: two in native Safari 27.2, exchanging initial
module load order, and one in the Chromium 156 in-app browser. Each run included:

- Eight direct RGBA comparisons: light/dark × Small/Medium × 1/16 panels.
- Three alternating-order rounds per driver for 1, 16 and 100 panels.
- Five warm-up renders, twelve serial render calls followed by `gl.finish`,
  and ninety requestAnimationFrame samples per timing case.
- Separate module import and renderer construction timing.

All **24 pixel cases were identical**, with nonempty rendered output. All **54
timing cases completed without a GPU error or frame interval over 50 ms**.
Readback was confined to pixel validation and excluded from timed samples.
The final TypeScript driver bundle was byte-compared with the served, measured
bundle: SHA-256 `907f46beaf7a72f8ea54d7d1732e2f67dafe424e7eb1db330e4a323178cf7051`.

Aggregated frame interval p95:

| Panels | Safari TS | Safari Wasm | Chromium TS | Chromium Wasm |
| ------ | --------: | ----------: | ----------: | ------------: |
| 1      |     17 ms |       17 ms |      9.3 ms |        9.3 ms |
| 16     |     17 ms |       17 ms |      9.3 ms |        9.3 ms |
| 100    |     17 ms |       17 ms |      9.3 ms |        9.3 ms |

The maximum was 19 ms for Safari TS and 18 ms for Safari Wasm; Chromium maxima
were 9.4 ms for both. Safari's combined median render-submission durations were
6, 6 and 7 ms for both drivers at 1, 16 and 100 panels. Chromium's were about
0.1 ms for both. These call durations can include driver synchronization and
must not be interpreted as pure CPU calculation time. Serial `gl.finish`
samples are also not isolated GPU timer-query measurements.

Native Safari module import took 2–4 ms for TS and 15–16 ms for Wasm in the two
load orders. Chromium recorded 6 and 7.2 ms respectively. These are local page
imports, not cold-machine or real-network startup benchmarks: the comparison
server serves uncompressed JavaScript, browser/driver caches were not cleared,
and the browsers have different frame clocks and timer precision. Cross-browser
absolute timing is not evidence of a driver-language speedup. The useful result
is comparable within-browser rendering with a substantially smaller TS payload.

## Size and delivery

Byte counts use gzip defaults; KB below means 1,000 bytes.

| Artifact                                                                 |      Raw |     Gzip |   Brotli |
| ------------------------------------------------------------------------ | -------: | -------: | -------: |
| TS comparison driver, including shaders                                  |  8,856 B |  3,678 B |  3,281 B |
| Optimized Wasm comparison driver, including bindings and embedded binary | 62,049 B | 27,188 B | 23,289 B |
| Default TS batch adapter, including the driver and shaders               |  9,919 B |  4,173 B |  3,738 B |
| Retained Wasm binary alone                                               | 39,147 B | 16,949 B | 14,073 B |

The prior Wasm binary was 76,083 B raw and 22,086 B gzip. Removing its debug name
and producer metadata reduced raw size by approximately 49% and gzip size by
23%, without changing the renderer source, optimization level or optical math.
The full Wasm driver payload is larger than the binary alone because it includes
bindings, initialization and base64 embedding.

`build:renderer` and the package regression enforce **48 KiB raw / 20 KiB gzip**
for the retained binary. The default batch bundle regression enforces **8 KiB
gzip** and rejects WebAssembly references. The latter failed against the prior
default Wasm batch and passed after the cutover. A separate build of the emitted
package entry produced six JavaScript outputs with no WebAssembly references.

`generate:shaders` regenerates the TS strings using Bun alone. Normal package
builds require no Rust toolchain. `build:renderer` still regenerates both shaders
and the comparison Wasm using the pinned Rust/wasm-bindgen toolchain. The Wasm
comparison remains lazy and is not downloaded by normal Web consumers. These
sizes describe the renderer modules, not total component/CSS/site transfer size.

## Actual component checks

The built-package consumer fixture was served independently on port 4325. In
native Safari, its `disable-wasm` option removes the global WebAssembly API
before the controls initialize:

- Sixteen real GlassButtons activated the default shared core without Wasm.
- Animated DOM background and click activation worked.
- Simulated WebGL context loss restored the existing copy fallback.
- Unmounting removed the copied lenses; remounting restored 16/16 shared lenses.
- Dark Medium material initialized 15/16 visible lenses with the first control
  hidden; revealing it restored 16/16. Light Small and dark Medium screenshots
  were saved separately.

The fixture's rolling frame indicator settled at approximately 18 ms p95. Its
initialization and unmount could still produce long intervals, including initial
597 ms p95 while preparation was in progress. These are not steady-state driver
samples and are not claimed as fixed. No complete docs/Menu opening or mobile
Safari performance acceptance was performed in this pass.

## Checks

- Glass package production build and installed-consumer export/type/SSR/asset
  regression passed.
- Glass and experiment typechecks passed (60 and 39 files).
- Affected TypeScript format and lint checks passed.
- Glass unit regressions: 27 passed; backdrop ownership and Menu/Toolbar DOM
  suites: 3 passed each in separate processes.
- Running those two DOM suites in a shared process exposed an existing global
  `document.fonts` descriptor conflict; that combined invocation failed. Their
  separate runs passed without changing either suite's expectations.
- Standard native Cargo, bypassing the personal command wrapper: wasm-target
  and native `cargo check`, `cargo test` (3 tests), `cargo clippy --all-targets
  -- -D warnings`, and `cargo fmt --check` passed. A first check against the
  shared target directory failed when output directories disappeared; final
  checks used an isolated temporary target directory. No persistent toolchain,
  Cargo configuration or dependency change was made.

No release, deployment or landing was performed. Existing unrelated workspace
changes, including primitive test migration, were preserved.

## Evidence and reproduction

Artifacts:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1afcc-7814-7cd3-a626-6dd7915f00d9/glass-core/driver-comparison/`.
Numbered JSON files contain complete samples; `summary.json` aggregates them and
`bundle-sizes.json` records the independent production-minified driver payloads.
`bundle-guard-red.log` records the regression rejecting the prior default path.

Run `bun experiments/glass-driver-comparison/server.ts`, open its loopback URL,
and click **Compare drivers**. Use `?first=wasm` for the alternate load order.
The server and scripts document optional evidence/port settings in the local
experiment README. The existing consumer fixture accepts
`GLASS_CONSUMER_PORT=4325`; its `?disable-wasm=1` path verifies the default driver.
