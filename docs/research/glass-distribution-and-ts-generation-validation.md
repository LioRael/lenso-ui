# Glass distribution cleanup and TS generation comparison

Date: 2026-11-07 (Asia/Shanghai)

## Result

The published-package contents are now limited to the Web implementation and its
required source and notices. Rust, Cargo manifests, generated Wasm, bindings and
their regression test live in `experiments/glass-driver-comparison`. They are not
part of the normal package build, package test suite or npm archive.

The new TypeScript analytic renderer retained its multi-panel advantage over the
older TypeScript map-based WebGPU path in the Safari fixture. A single panel did
not show a frame-rate advantage, and its callback duration was higher in the new
path. This is a rendering-path comparison, not a claim that TypeScript itself got
faster or that every component workload benefits equally.

## Package boundary

- Canonical GLSL and its MIT/provenance notices now live in
  `packages/glass/shaders`; the TS generator requires only Bun.
- The experimental Rust crate includes those canonical GLSL files directly.
  Its existing shared-core compatibility wrappers point to the new crate path.
- Wasm generation and source-hash/size tests moved into the experiment. The
  relocated binary still instantiates and remains within 48 KiB raw / 20 KiB
  gzip limits (39,143 B raw / 16,940 B gzip in this rebuild).
- The package no longer has a Rust build script or a `build:renderer` command.
- Source copying rebuilds `dist/source` so deleted experimental files cannot
  survive a subsequent build. TS sources, GLSL, generator, build configuration
  and complete original third-party notices are retained.
- The installed-consumer regression checks the extracted tarball, including
  declarations and JavaScript, for Rust/Cargo/generated Wasm or binding files and
  WebAssembly code. It also requires the retained GLSL and license sources.

That regression failed against the previous distribution, then passed against
the rebuilt package. Independent tar audits found:

| Archive | Packed bytes | Unpacked bytes | Regular files | Experimental files |
| ------- | -----------: | -------------: | ------------: | -----------------: |
| Before  |      268,698 |        891,886 |           154 |                  9 |
| After   |      208,022 |        738,840 |           145 |                  0 |

Packed size decreased by 60,676 bytes, approximately 22.6%. The after archive also
contained no JavaScript WebAssembly references. These are actual `bun pm pack
--ignore-scripts` archives, not estimates from source-directory sizes. This is a
local package validation; nothing was published.

## Current TS versus retained TS

The maintained `experiments/glass-shared-core` harness now defaults to the
current package-owned TS/WebGL2 driver. Its reference explicitly used the
retained production WebGPU optical batch, not a forced SVG fallback. Saved
receipts identify `referenceBackend: webgpu` and `sharedBackend: ts`.

Native Safari 27.2, owned 600 × 400 canvas, DPR 2, identical material settings,
lens geometry and animated source. Three alternating isolated rounds per route,
12 warm-up frames and approximately two seconds per measured round:

| Case                    | Old TS median frame interval, three rounds | Current TS median frame interval, three rounds | Old p95  | Current p95 |
| ----------------------- | ------------------------------------------ | ---------------------------------------------- | -------- | ----------- |
| Light Medium, 16 panels | 36 / 37 / 36 ms                            | 17 / 17 / 17 ms                                | 38–40 ms | 17–18 ms    |
| Dark Small, 16 panels   | 24 / 24 / 24 ms                            | 17 / 17 / 17 ms                                | 25–26 ms | 17 ms       |
| Light Medium, 1 panel   | 17 / 17 / 17 ms                            | 17 / 17 / 17 ms                                | 17 ms    | 17–19 ms    |

Across these samples the new route's maximum interval was 23 ms, and the old
route's maximum was 44 ms. Median callback durations were respectively 33–34 vs
6 ms for 16 Medium panels and 21–22 vs 6 ms for 16 Small panels. For one Medium
panel, the old route was 3–4 ms and the new route 6 ms. Callback duration includes
Canvas painting, upload/submission and possible synchronization; it is not pure
CPU or isolated GPU execution time. There is no single-panel callback win here.

Preparation observations were old/new 138/34 ms, 90/9 ms and 3475/12 ms for the
three cases. They are diagnostic observations with uncontrolled cache warmth,
sequential setup and different map dimensions, not a controlled startup speedup
claim. No cache flushing or network-loading benchmark was performed.

The two routes represent their own rendering architectures: the old reference
packs cropped input and copies to per-lens WebGPU outputs; the analytic route
renders its batch into a scene canvas. This compares the retained prototype
paths, including their output topology, rather than isolating one shader
instruction sequence. Neither route exercises the full production DOM capture
and component-output scheduling layer. Frame intervals are rAF opportunities,
not proof of display presentation. This does not establish a whole-site speedup,
Menu opening acceptance, mobile/low-end performance or an equivalent Chromium
result.

The light Medium side-by-side fixture was visually reviewed. Its material model
remains the iOS/iPadOS model. The analytic kernel is an approximation of the old
map pipeline; no pixel-identical old/new appearance claim is made. The earlier
same-shader TS/Wasm pixel comparison is a separate experiment.

## Checks

- Package build and installed-consumer exports, types, SSR, production assets,
  complete notices and new archive-boundary checks passed.
- Glass, experiment and testing typechecks passed: 59, 41 and 101 files.
- Glass unit regressions: 26 passed. Optional relocated Wasm regression: 1 passed.
- Affected TypeScript format/lint passed; native Rust formatting passed.
- Standard Cargo native and wasm-target check, test (3 tests), and clippy with
  warnings denied passed for the relocated crate. The legacy wrapper workspace
  also passed its wasm-target check with the new dependency paths. These used
  the pinned toolchain and an isolated temporary target directory, without Blaze
  or persistent Cargo/toolchain changes.
- Primitive component source/API and unrelated working-tree changes were not
  modified. No release, deployment or landing was performed.

## Evidence

Artifacts:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1afcc-7814-7cd3-a626-6dd7915f00d9/glass-core/ts-generation-comparison/`.

Numbered JSON receipts contain all eighteen measured rounds. `summary.json`
aggregates them; `distribution-audit.json` records both actual package archives.
`distribution-red.log` and `distribution-green.log` retain the package regression
failure and successful cleanup. `safari-ts-generations.png` shows the current
light Medium comparison.

Reproduce the rendering fixture with
`bun experiments/glass-shared-core/server.ts`; optional `GLASS_CORE_PORT` and
`GLASS_CORE_EVIDENCE` select the loopback port and receipt directory. Select
Production WebGPU and click Compare performance. The default analytic driver is
TS; `?driver=wasm` selects the optional historical Wasm wrapper.
