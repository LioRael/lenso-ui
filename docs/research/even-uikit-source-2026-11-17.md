# UIKit Gallery: deployed source and shader investigation

Date: 2026-11-17. Target: <https://uikit.even.how/>.

## Scope and result

This is a static investigation of the deployed HTML, JavaScript glue, complete WebAssembly payload, and exact WGSL descriptors captured by the parallel browser investigation. No downloaded application JavaScript or WebAssembly was executed by this investigation. `WebAssembly.validate` was used only to validate the completed binary. No browser was launched here. Browser timing, WebKit appearance, frame performance, and the local prototype belong to the parallel investigation.

The deployed application is a canvas/WebGPU application with Emscripten glue and identifiable C++ `uiui::` and `ipr::rendering::` symbols. Its glass shader **does implement displaced texture sampling**, in addition to blur, color transforms, highlights, shadows, and optional chromatic aberration. This is more than a blur-only implementation. It is screen-space refraction/distortion, not evidence of a physically traced optical medium. The presence of that implementation does not prove which branches or uniform values a particular WebKit frame uses.

No public repository for this exact gallery/UiUi/IPR renderer was established. Two relevant public repositories by the identified author were inspected, but neither is the deployed gallery's source. Shader comments claim a QuartzCore-derived port, with all rights reserved; they are not independent proof of exact Apple implementation identity or a redistribution license.

## Evidence inventory and reproducible asset identity

First-party deployed URLs:

- HTML: <https://uikit.even.how/>.
- JavaScript: <https://uikit.even.how/KitGalleryWeb.js?v=7f63bbb9d8c3>.
- WebAssembly, referenced by `findWasmBinary()` in that JS: <https://uikit.even.how/KitGalleryWeb.wasm?v=cfce45e12917>.
- Author identity: <https://even.how/> identifies ktiays and links <https://github.com/ktiays> and <https://x.com/ktiays>.
- Original author's announcement: <https://x.com/ktiays/status/2122389687218381147>, “UIKit is running on the Web.” The accessible announcement does not explain a compiler, license, or implementation language.

Local evidence supplied by the parallel investigation:

- [HTML](../../.amp/in/artifacts/even-uikit/index.html), 4,626 bytes, and [HTML response headers](../../.amp/in/artifacts/even-uikit/headers.txt).
- [JavaScript](../../.amp/in/artifacts/even-uikit/KitGalleryWeb.js), 84,388 bytes, and [JS response headers](../../.amp/in/artifacts/even-uikit/js-headers.txt). The JS is minified onto one line; offsets below are zero-based character positions in that file.
- [Chromium capture JSON](../../.amp/in/artifacts/even-uikit/chromium-probe.json), especially `probe.shaders`, `resources`, and `navigation`. Shader indices below are zero-based indices into `probe.shaders`, not shader IDs invented here.

New scratch evidence, all under `.amp/in/even-source/`:

- **Complete valid WASM:** [KitGalleryWeb-complete.wasm](../../.amp/in/even-source/KitGalleryWeb-complete.wasm), **5,752,039 bytes**. Absolute path: `/Users/leosouthey/Projects/framework/lenso-ui/.amp/in/even-source/KitGalleryWeb-complete.wasm`.
- SHA-256: `cfce45e129179ad42c072a500a6aefc81263dccac539a04265fc42eb0eff8511`. The URL's version token matches its hash prefix.
- [Brotli response body](../../.amp/in/even-source/KitGalleryWeb.wasm.br), **2,282,461 bytes**, and [response headers](../../.amp/in/even-source/wasm-br-headers.txt). Download completed with HTTP 200 and curl exit 0; Brotli decompression succeeded. `WebAssembly.validate` returned `true` on the decompressed file. Static section-length walking also reached the exact end of the file.
- [shader-00.wgsl](../../.amp/in/even-source/shader-00.wgsl) through `shader-20.wgsl` are verbatim UTF-8 copies of the supplied live descriptors' `code` fields. They were not reconstructed by decompiling WASM.
- An earlier identity-encoding attempt left `KitGalleryWeb.wasm`, **5,574,529 bytes**, after curl error 18, “Transferred a partial file.” It is incomplete and **must not be used for replay, sizes, or validation**. It was not overwritten. Use `KitGalleryWeb-complete.wasm` instead.

Useful retrieval command, operating on data only:

```sh
curl -sS -L --max-time 90 -H 'Accept-Encoding: br' \
  -D .amp/in/even-source/wasm-br-headers.txt \
  'https://uikit.even.how/KitGalleryWeb.wasm?v=cfce45e12917' \
  -o .amp/in/even-source/KitGalleryWeb.wasm.br
brotli --decompress \
  --output=.amp/in/even-source/KitGalleryWeb-complete.wasm \
  .amp/in/even-source/KitGalleryWeb.wasm.br
```

## Payload, compression, and first-load implications

These byte counts are from the supplied browser capture, not synthetic compression estimates or a new runtime measurement:

| Resource                                | Response encoding | Encoded body bytes | Decoded body bytes | Resource Timing transferSize |
| --------------------------------------- | ----------------- | -----------------: | -----------------: | ---------------------------: |
| HTML                                    | zstd              |              2,139 |              4,626 |                        2,439 |
| KitGalleryWeb.js                        | br                |             22,309 |             84,388 |                       22,609 |
| KitGalleryWeb.wasm                      | br                |          2,282,461 |          5,752,039 |                    2,282,761 |
| **Observed document + resources total** | mixed             |      **2,306,909** |      **5,841,053** |                **2,307,809** |

`transferSize` is the browser's Resource Timing accounting, not packet-level bandwidth including TLS/TCP. This capture's resource list contains only JS and WASM, plus HTML in navigation. The separately supplied `3b6292e3-image.png` is not in this capture's requests or the loader references and is **not included**. This is the observed initial request set, not a guarantee about every interaction or future deployment.

The independent completed Brotli fetch exactly matches both captured WASM sizes. Its headers include `content-type: application/wasm`, `content-encoding: br`, and `cache-control: public, max-age=31536000, immutable`. Supplied JS headers also use the immutable one-year policy; HTML uses `public, max-age=0, must-revalidate`. `vary: accept-encoding` is present. Do not infer download size from the earlier curl request that did not advertise compression.

Static first-load dependency: the HTML loads the JS asynchronously, but the WASM URL is discovered by running that JS. There is no WASM preload in the HTML. The JS attempts `WebAssembly.instantiateStreaming(fetch(...), imports)` before falling back to an ArrayBuffer instantiation. The entry point cannot initialize before the binary is available/instantiated. The browser also has to create shader modules and pipelines: the supplied probe contains 21 shader descriptors and 175 pipeline-creation calls. That count describes initialization requests in the supplied capture, not GPU completion time or proof that all pipelines are used each frame.

Consequently a ~2.28 MB compressed WASM download, compilation/instantiation, and renderer pipeline initialization are concrete cold-load work. **Their relative elapsed costs, and whether download or compilation dominates a particular slow load, require the parallel timing results.** This document does not derive a performance verdict from bundle size alone.

## Framework and renderer: what is verified

The HTML's application surface is `<canvas id=canvas tabindex=0>`. The status bar, spinner and failure message are DOM elements. Its feature check is literally:

```js
navigator.gpu || window.uiuiHostStatus("WebGPU is not available in this browser.", !0);
```

The JS exposes Emscripten imports/exports, heap views, `emscripten_stack_*`, and the `emwgpu` WebGPU C-API bridge. It imports WGSL from WASM memory into `device.createShaderModule(desc)` (JS offset 46,991), calls `navigator.gpu.requestAdapter(opts)` (47,978), and creates the visible canvas context with `canvas.getContext("webgpu")` (77,401).

The complete WASM contains these exact strings at zero-based **file byte offsets**:

|    Offset | String                                                                                    |
| --------: | ----------------------------------------------------------------------------------------- |
| 4,453,628 | `UiUi.resources`                                                                          |
| 4,453,751 | `IPR frame uploads`                                                                       |
| 4,453,841 | `IPR content atlas`                                                                       |
| 4,457,108 | `/emsdk/emscripten/system/lib/libcxxabi/src/private_typeinfo.cpp`                         |
| 4,466,219 | `IPR pooled texture`                                                                      |
| 4,470,630 | `a render thread's renderer draws commits; setLayer is ignored`                           |
| 4,472,597 | `IPR_FULL_REDRAW`                                                                         |
| 4,472,662 | `IPR_SCENE_COMMIT`                                                                        |
| 4,472,894 | `IPR_OCCLUSION_CULL`                                                                      |
| 4,479,668 | `uiui::WindowScene::dispatchKey` (within `bool uiui::WindowScene::dispatchKey(KeyEvent)`) |
| 4,479,762 | `ipr::rendering::SceneSnapshot::prepareRasterCaching` (within a full C++ signature)       |
| 4,480,589 | `void ipr::rendering::SceneSnapshot::beginIncrementalFrame()`                             |

This directly identifies C++ components, a UiUi UI layer and IPR rendering layer. Incremental scene snapshots, raster caching, atlases, pooled textures and culling are suggested by the symbols/labels; their precise policy and effectiveness cannot be recovered from names alone. The section table has 4,419,861 bytes of code payload and 1,307,199 bytes of data payload, and no custom name/source-map sections. It is not a downloadable source distribution.

No `Flutter`, `flutter`, `skia` or `rustc` strings were found in the complete binary; absence of strings is not proof of absence. There is **positive C++/UiUi/IPR evidence**, not positive Flutter or Rust engine evidence. It is not defensible to call this Flutter, Rust, or Apple's original Swift/Objective-C runtime merely from the gallery's native appearance. Likewise the author's unrelated Rust scrolling library does not establish this binary's language.

### Fallbacks and browser branching

No alternative WebGL or CSS `backdrop-filter` rendering path was found in the HTML or JS. When WebGPU is missing or `requestAdapter` returns null, the loader/bridge reports failure. The JS has offscreen `getContext("2d")` helpers for content/path/text rasterization and upload; these are not a whole-app fallback compositor. Other uses of “fallback” include pointer-lock options and ArrayBuffer WASM instantiation, not substitution of frosted glass for refraction.

This is bounded to inspected HTML/JS. WASM could still choose uniform values or shader variants based on capabilities or browser-specific policy. A `glassR = false` shader specialization exists, independently of any JavaScript fallback. No claim that Safari selects it is established here.

## Glass: exact displaced sample coordinates

Primary evidence: supplied `probe.shaders[16]`, label **`IPR glass`**, **43,544 characters**. Its exact code SHA-256 is `d6d6d95cdf634785d971cbc4aad70ea5c9ba9742e4b3c2dcf3a952dc2c5d3318`. Readable local copy: [shader-16.wgsl](../../.amp/in/even-source/shader-16.wgsl).

The live module is assembled from shared snippets rather than present as one contiguous identical string in WASM. Its core functions are nevertheless present in the complete binary: `fn glassProfile(` at byte 4,577,570; `fn glassRead(` at 4,578,045; `fn glassBase(` at 4,581,760; `fn foregroundBase(` at 4,596,788. Several other live modules match whole byte strings in WASM, including backdrop copy, backdrop luma, mesh, path field, IntelligentLight and EdgeLightMask.

### Background path

Relevant ranges in the extracted live code:

- Lines 260–264: specialization constants `glassC`, `glassR`, `glassE`, each defaulting to false.
- Lines 267–390: uniforms, textures and samplers, including displacement matrix, inner/outer refraction amount/height, blur radii, aberration, and shape/SDF fields.
- Lines 443–445: source coordinate `t0 = position * glassDraw.sourceMap.xy + glassDraw.sourceMap.zw`.
- Lines 484–498: profile, blur LOD and actual texture fetch.
- Lines 573–590 and 660–725: displacement and inner/outer ray sampling.
- Lines 815–882: texture-shape and inline-SDF wrappers and fragment entry points.

The decisive code, abbreviated without changing the expressions:

```wgsl
fn glassProfile(x: f32, amount: f32, inverseHeight: f32) -> f32 {
    let s = saturate(inverseHeight * x);
    return amount - saturate(sqrt((2.0 - s) * s)) * amount;
}

// In glassBase, g is the shape/SDF gradient and d its signed distance.
let m = (*u).displacement_mat;
let displacement = vec2f(dot(g, m.xy), dot(g, m.zw));
let nd = -d;
let origin = t0;
// In the glassR branch:
let inner = glassProfile(nd, (*u).inner_refraction_amount, (*u).inner_refraction_inv_height);
let coordinate = origin + vec2f(inner) * displacement;
sampled = glassRead(coordinate, glassLevel(radius), clampRect);

fn glassRead(coordinate: vec2f, lod: f32, clampRect: vec4f) -> vec4f {
    return textureSampleLevel(source, s4, clamp(coordinate, clampRect.xy, clampRect.zw), lod);
}
```

Thus the background sample center is **`t0 + profile(-d, A, 1/H) * M*g`**, not simply `t0`. The outer ray independently uses **`t0 + profile(-d, outerA, outerInvH) * M*g`**, then blends by `refraction_opacity` and a signed-distance threshold. Radius-dependent LOD supplies blur at the displaced coordinate. If `glassR` is false, the face branch reads `glassRead(t0, glassLevel(alpha0 * blur_radius), clampRect)` instead: an actual centered blur path exists too.

Analytical example only, **not captured uniform values**: choose `t0=(0.5,0.5)`, gradient `g=(1,0)`, matrix rows `(0.01,0)` and `(0,0.01)`, amount `A=4`, and an unclipped source rectangle. At the contour (`d=0`), `s=0`, profile=4, so the fetch center is `(0.54,0.5)`. At depth `-d=H/2`, profile=`4*(1-sqrt(0.75))`, so it is approximately `(0.505359,0.5)`. At depth `H`, profile=0 and it returns to `(0.5,0.5)`. A left-facing gradient reverses the shift. The shape-dependent movement of the center distinguishes refraction-like distortion from a centered blur kernel.

`glassAberrate` (lines 542–570) adds chromatic separation about that displaced center: three positions toward `+offset`, four toward `-offset`, each calling a four-tap `glassBox`. That is **28 explicit source texture-sampling calls** for this enabled branch, before other face/outer/bleed/shadow reads. It is a static branch cost, not a count for every pixel or a measurement of hardware memory transactions. Plain glass can take cheaper branches.

### Foreground path

Lines 885–950 implement foreground displacement separately:

```wgsl
let rd = (*u).refraction_dir;
let refractionDirection = vec2f(dot(foregroundRow(m.xy, rd), g), dot(foregroundRow(m.zw, rd), g));
let s = saturate((depth - (*u).refraction_offset) * (*u).inv_refraction_height);
let refraction = (*u).refraction_amount - saturate(sqrt((2.0 - s) * s)) * (*u).refraction_amount;
let displacement = refraction * refractionDirection;
let centre = displacement + p;
```

Seven taps are then taken around `centre`, split toward positive and negative aberration offsets. `foregroundRead` (lines 892–895) maps those positions through `sourceTextureMap` and clamps them before `textureSample`. The foreground is therefore not just a tinted overlay either.

**Interpretation:** there is real spatial resampling of source imagery under a shaped lens profile. There is no requirement to find WGSL's `refract()` builtin to establish that. Conversely, this code is not a volumetric renderer, a measured refractive-index simulation, or a proof that every visible glass control refracts. “Screen-space refraction plus blur and material composition” is the supported description.

## Shader entry points and architecture

All identifiers below come from live `createShaderModule` descriptors. Their existence establishes renderer capabilities, not a per-frame pass schedule.

| Index / label                        | Identifiable entry points and role                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 / IPR mipmap generation            | `vertexMain`, `fragmentMain`; four `textureLoad` reads average a 2x2 source footprint.                                                                                                                                                                                                                                                                                                                                      |
| 1–7 / composite families, projection | `compositeVertex`, `compositeFragment`, `layerShadowCompositeFragment`, `compositeColorMatrixFragment`, `compositeGradientFragment`, `compositeMaskedFragment`, `compositeSDFGlassDisplacementFragment`, `projectColorFragment`; textured composition, masks, effects and projection.                                                                                                                                       |
| 8 / IPR mesh                         | `meshDrawVertex`, `meshDrawFragment`.                                                                                                                                                                                                                                                                                                                                                                                       |
| 9 / IPR corner mask                  | `cornerMaskSaveVertex`, `cornerMaskSaveFragment`, `cornerMaskVertex`, `cornerMaskMultiplyFragment`, `cornerMaskAddFragment`.                                                                                                                                                                                                                                                                                                |
| 10 / IPR filters                     | `filterVertex`, `colorMatrixFragment`, `displacementMapFragment`, `chromaticAberrationFragment`, `vibrantColorMatrixFragment`, `homeAffordanceBaseFragment`, threshold and curve variants.                                                                                                                                                                                                                                  |
| 11 / IPR blur                        | `blurPassVertex`, `singlePassBlurFragment`, `blurDownsample4Fragment`, `blurDownsample8Fragment`, `blurPrefilteredDownsample2Fragment`, `blurPrefilteredDownsample4Fragment`, `blurNarrow7Fragment` through the named 11/15/19/23/27 variants, `blurUnpremultipliedUpsampleFragment`, `blurShadowUpsampleFragment`, `blurKeptSourceUpsampleFragment`, `blurFieldResolveFragment`, `blurSourceVertex`, `blurSourceFragment`. |
| 12 / IPR backdrop copy               | `backdropCopyVertex`, `backdropCopyFragment`, `backdropDownsample4Fragment`, `backdropDownsample8Fragment`; copies or filters the source texture into a capture target.                                                                                                                                                                                                                                                     |
| 13 / IPR backdrop luma               | `backdropAverageLumaKernel` (16x16 workgroup), `backdropSumLumaKernel` (256x1); texture reduction through workgroup memory/storage buffers.                                                                                                                                                                                                                                                                                 |
| 14–15 / IPR variable blur            | `variableBlurCopyKernel`, `variableBlurMirrorCopyKernel`, `variableBlurDownsampleKernel` (16x16), `variableBlurVertex`, `variableBlurFragment`; chain construction and radius-selected LOD sampling. Two modules differ by chain storage format.                                                                                                                                                                            |
| 16 / IPR glass                       | `glassVertex`, `glassBackgroundFragment`, `glassBackgroundSDFFragment`, `glassForegroundFragment`, `glassForegroundSDFFragment`.                                                                                                                                                                                                                                                                                            |
| 17 / IPR SDF                         | `sdfElementVertex`, `sdfElementWriteFragment`, `sdfElementUnionTextureFragment`, `sdfElementSubtractionTextureFragment`, `sdfEffectVertex`, `sdfGlassDisplacementFragment`, `sdfKeyFillHighlightFragment`, `sdfDiffuseKeyFillHighlightFragment`, `sdfVisualizationFragment`.                                                                                                                                                |
| 18 / IPR path field                  | `pathFieldKernel`; path-edge field construction.                                                                                                                                                                                                                                                                                                                                                                            |
| 19 / IntelligentLight                | `IntelligentLightVert`, `IntelligentLightFrag`; colored Siri-like light field.                                                                                                                                                                                                                                                                                                                                              |
| 20 / EdgeLightMask                   | `EdgeLightVertex`, `EdgeLightFragment`; noisy screen-outline light mask.                                                                                                                                                                                                                                                                                                                                                    |

The architecture supported by the descriptors is a GPU scene compositor with source textures, captures/downsampling, blur chains, SDF/analytic shapes, material evaluation, luminance reduction, and final composition. This differs materially from trying to refract an arbitrary live DOM subtree through CSS: the renderer already owns its scene textures. Cost drivers visible in code are render-target area, resolution/DPR, intermediate surfaces and mip levels, blur passes, enabled aberration taps and material variants. Those explain possible tradeoffs, not measured speed, cache hit rate or idle efficiency.

## Source provenance, availability and licensing

The glass code comments explicitly say:

```text
Created by ktiays on 2026/11/9.
Copyright (c) 2026 ktiays. All rights reserved.

Core Animation's glass background and foreground, ported from the Metal backend's float family
(Shaders/GlassBackground.metal ... Shaders/GlassForeground.metal ...).
Those port QuartzCore's ... (`default.metallib`; Research/GlassShaderReads.md).
```

The backdrop copy comment names `CA::OGL::capture_backdrop`; SDF comments name Core Animation and QuartzCore; luma comments name `OpenCoreAnimation Source/Shaders/ShaderUtilityLuma.metal`. These are strong evidence of the author's **stated design/provenance**, not independent verification of Apple source, 1:1 behavior, reverse-engineering accuracy, or legal rights. Named Metal/Research files are references inside comments, not public URLs or files supplied by this deployment.

The main investigator supplied a screenshot of AndrewPrifer's follow-up asserting a “C++ recomp” rather than a direct Swift/Objective-C runtime compile, shared UIKit/CoreAnimation internals 1:1, and exact QuartzCore-to-WGSL ports. That is an **attributed secondary claim**: the C++ part agrees with the deployed symbols, while exact 1:1 identity remains unverified. No independently retrievable URL for that follow-up was supplied here. The Joe Blau reply visible under the original announcement asserts Safari becomes frosted; it is neither an author statement nor a substitute for a WebKit test.

Public-source investigation used the author's linked GitHub identity, the first page of its repository listing, and targeted searches for `KitGalleryWeb`, `UiUi`, `IPR` and `OpenCoreAnimation`. GitHub's unauthenticated API returned a rate-limit response, so this is not an exhaustive account inventory. Two relevant first-party public repositories were cloned and inspected:

1. **[ktiays/GlassExplorer](https://github.com/ktiays/GlassExplorer/tree/be76c5d9e8de4b6903b8060cbe891f258ef540eb)**. Its [README, lines 1–13](https://github.com/ktiays/GlassExplorer/blob/be76c5d9e8de4b6903b8060cbe891f258ef540eb/README.md#L1-L13) describes an iOS app experimenting with private UIKit glass APIs. [ConfigurationView.swift, lines 233–251](https://github.com/ktiays/GlassExplorer/blob/be76c5d9e8de4b6903b8060cbe891f258ef540eb/GlassExplorer/ConfigurationView.swift#L233-L251) exposes inner/outer refraction amount/height, bleed, blur-distance and blur-opacity knobs. This corroborates the author's work on this material family, **not that this app is the gallery source**. It imports native UIKit and is a separate iOS project. No LICENSE/COPYING/NOTICE filename was found in the inspected tree.
2. **[ktiays/OpenFoundation](https://github.com/ktiays/OpenFoundation/tree/e3eee635b2c0449b9e97c1c5246b8b56305a1249)**. Its [README, lines 1–10](https://github.com/ktiays/OpenFoundation/blob/e3eee635b2c0449b9e97c1c5246b8b56305a1249/README.md#L1-L10) describes restoring scoped Foundation/CoreFoundation behavior for OpenCoreAnimation and OpenCoreGraphics. Its [WASM port README, lines 1–7 and 24–39](https://github.com/ktiays/OpenFoundation/blob/e3eee635b2c0449b9e97c1c5246b8b56305a1249/Port/README.md#L1-L39) documents an experimental wasm32 Emscripten/Objective-C runtime port and its limits. That is evidence of related public work, **not proof this library is linked into the C++ gallery**. [Scope.md, lines 1–18](https://github.com/ktiays/OpenFoundation/blob/e3eee635b2c0449b9e97c1c5246b8b56305a1249/Documentation/Reference/Scope.md#L1-L18) carries an all-rights-reserved notice and pins an OpenCoreAnimation binary consumer revision. No top-level distribution license was established.

Search also found `1amageek/OpenCoreAnimation`, but it has a different owner and a Swift implementation description. No first-party link or matching deployed implementation was established; it must not be substituted for ktiays's referenced project or used to infer the gallery's license.

Publicly downloadable WASM and visible WGSL are inspectable assets, **not a permissive reuse grant**. Do not copy the gallery's shader implementation into Lenso under an assumed MIT/Apache license. An explicit license or author permission would be needed; this report is not a legal determination.

## Remaining limits

- WebKit's actual enabled glass variants, bindings and uniform values, and visual distortion versus frost, require browser evidence. Shader module creation alone does not prove a refraction branch executed in a draw.
- Exact original C++ sources, build flags/toolchain revision, IPR/UiUi expansion, and source-to-WASM revision remain unknown.
- A public gallery/renderer source repository and a reuse license were not found; this is not proof none exists or will be published.
- Apple provenance, correctness of shader-port claims and bit-for-bit or behaviorally exact parity are not independently verified.
- Cold-load attribution, GPU pass timings, frame cadence, battery cost and comparative performance remain the parallel investigation's responsibility.

## Local clones

- `ktiays/GlassExplorer` at `be76c5d9e8de4b6903b8060cbe891f258ef540eb`: `.amp/in/even-source/ktiays__GlassExplorer/`.
- `ktiays/OpenFoundation` at `e3eee635b2c0449b9e97c1c5246b8b56305a1249`: `.amp/in/even-source/ktiays__OpenFoundation/`.

Clones were relocated under the requested scratch directory after inspection. No builds, package installation or tests were run in them, and no application/library code was modified.
