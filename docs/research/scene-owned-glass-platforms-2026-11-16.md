# Scene-owned glass: browser and runtime constraints

Research date: 2026-11-16. This note covers primary platform sources, not a
benchmark or an audit of Lenso implementation. No implementation files changed.

**Conclusion:** a renderer that owns its backdrop scene can implement refraction
without repeatedly reconstructing arbitrary page DOM. That changes the rendering
contract, rather than making arbitrary DOM capture free. Keep native DOM controls
and semantics unless replacing those responsibilities is an explicit product
decision. Rust/Wasm is an optional CPU implementation choice, not a way around
browser capture or compositing boundaries.

## Evidence labels

- **Specification:** an API contract or draft algorithm, not proof of shipping.
- **Shipped, vendor-reported:** an explicit browser-vendor release statement,
  not a successful test on the user's browser or device.
- **Implementation evidence:** upstream bug status, maintainer explanation or
  proposed patch. An open patch does not establish shipping support.
- **Inference:** a Lenso architectural implication derived from those contracts.
- **Measured here:** none. No throughput, latency, memory, power or device
  comparison was performed for this research.

Sources were read on the research date. Living documentation can change; the
WebKit patch revision and WebGPU publication date are identified below.

## DOM-to-GPU capture has a source-ownership boundary

**Specification.** WebGPU's published Candidate Recommendation Draft dated
2026-09-15 defines `GPUCopyExternalImageSource` as `ImageBitmap`, `ImageData`,
`HTMLImageElement`, `HTMLVideoElement`, `VideoFrame`, `HTMLCanvasElement` or
`OffscreenCanvas`. It does not include an arbitrary `HTMLElement` or a browser
compositor's page backdrop. `copyExternalImageToTexture` rejects sources that
are not origin-clean. WebGL2 similarly exposes texture uploads from
`TexImageSource`, buffer data and its own framebuffer, rather than arbitrary page
elements. [1][2]

**Inference.** Adding WebGPU, using OffscreenCanvas, or moving calls into Wasm does
not itself provide page pixels. A renderer needs one of these inputs:

- an app-owned scene rendered into a texture or framebuffer;
- an explicitly supplied, supported image/video/canvas source;
- a bounded DOM reconstruction/snapshot mechanism with declared limitations;
- an engine-specific DOM-in-canvas facility, feature-detected separately.

**Specification.** Serializing HTML into SVG `foreignObject` creates another
document/image rendering operation. SVG image processing disables scripting,
interaction and external resource references, including within foreign content.
This is not an API for copying the already-composited live page. An implementation
must account for resource embedding, snapshot invalidation and visual differences;
SVG serialization alone does not prove capture parity. [3]

**Specification.** `getDisplayMedia` prompts the user to choose a display surface
each time, requires activation under its algorithm, and cannot persist a granted
permission. It is unsuitable as an invisible material-rendering dependency. [4]

### Important 2026 update: HTML-in-Canvas is no longer only an experiment

**Shipped, vendor-reported.** Chrome's announcement, published 2026-10-26, states
that HTML-in-Canvas shipped in Chrome 157. Its current technical documentation
describes direct DOM snapshots for 2D, WebGL and WebGPU. It would be incorrect to
state categorically that no shipping browser can render DOM into GPU textures.
This research did not execute Chrome 157 or verify other engines. [5][6]

The documented contract still requires ownership and integration work:

- The canvas opts into `content="drawable"`; eligible descendants carry
  `drawable`. This is not a general screenshot function for an unrelated page
  subtree behind an independently mounted lens.
- A nested drawable descendant is excluded from its drawable parent's snapshot
  and must be drawn separately.
- The `paint` event exposes `changedElements`. Drawing in the handler contributes
  to the current rendering update; DOM changes made in that handler appear in a
  subsequent update. Scheduling and invalidation still matter.
- The documented WebGL path uses `texElementSubImage2D`; the WebGPU path uses
  `GPUQueue.drawElementImageToTexture`. These additions are distinct from the
  published WebGPU `copyExternalImageToTexture` union above.
- In WebGL/WebGPU, the app must call `updateElementGeometry` to keep hit testing
  and accessibility bounds aligned with rendered geometry. Arbitrary shader
  distortion does not automatically become an equivalent DOM hit-test mapping.
- CSS pixels, texture pixels and canvas grid pixels must be mapped correctly,
  including resize, DPR and zoom. [6][7][8]

**Specification maturity.** WICG still calls its HTML-in-Canvas document a living
explainer/proposal. A vendor shipping the extension is different from established
cross-engine interoperability. Chrome documents feature detection and fallback;
no Safari or Firefox shipping statement was established in this study. [5][6][9]

**Inference.** Treat HTML-in-Canvas as a separate progressive backend worth testing,
not the Safari solution or a reason to remove the scene-owned/source-provider
boundary. Test the installed browser's actual methods and rendering behavior,
not only a user-agent string or the existence of a WebGPU adapter.

## Safari SVG backdrop filters and scene-owned GPU optics are different paths

**Specification.** Filter Effects Level 2 describes copying a Backdrop Root Image
into a temporary buffer, applying the filter chain and clipping to the element's
border box, including border radius. The first filter function or filter reference
takes the backdrop image as input. The editor's draft explicitly says the
Backdrop Root definition does not yet have Working Group consensus. The algorithm
is not a guarantee about a particular GPU implementation or zero-copy behavior.
[10]

**Implementation evidence.** WebKit bug 245510 remains `NEW` when fetched. It tracks
`backdrop-filter: url(...)` not applying referenced SVG filters, including
`feDisplacementMap`. In related bug 297770, WebKit maintainer Simon Fraser states
that accelerated filters, including backdrop filters, cannot use SVG filters.
This is a constraint on that browser filter/compositing path, not a statement
that Safari GPUs cannot execute refraction shaders. [11][12]

The proposed fix in WebKit PR 68614 was still open and `merging-blocked` when
fetched, with changes requested. Its head was
`bf9f8394b4d2d820f30a59a3dcda03dd48d94483`. The proposal repaints a source buffer
and runs the reference filter through the software fallback machinery. Its stated
limitations include subframes, transformed sampling and accelerated-animation
updates. A 2026-11-12 review also raises security concerns and asks for an
architectural decision. Do not present this proposal, an old green EWS comment,
or its test additions as Safari support. [13]

**Shipped, vendor-reported.** WebKit explicitly shipped WebGPU in Safari 26.0 for
macOS, iOS, iPadOS and visionOS. WebGPU supports render pipelines, sampled textures
and compute; WebGL2 already supports framebuffer/texture rendering sufficient for
a multipass optical shader. WebGPU compute is not a prerequisite for refraction.
Neither API supplies arbitrary DOM backdrops through that fact alone. [1][2][14]

**Inference for Lenso.** A scene-owned backend can draw its scene into a texture,
then sample that texture through displacement/blur/highlight passes. This bypasses
the unsupported SVG-reference backdrop-filter route by owning the input pixels.
It does not recreate an arbitrary DOM page automatically. One canvas can share
scene and optical resources across surfaces, but pass count, overlap, resolution,
texture traffic and upload work still need measurement. No WebGL2-versus-WebGPU
speed ranking follows from these sources.

## What Flutter demonstrates, and what it does not

**Documented architecture.** Flutter compiles application/framework Dart to
JavaScript or Wasm and renders through CanvasKit/Skwasm using browser graphics
APIs. Skia's own CanvasKit documentation describes a WebAssembly build exposing
canvas, paint, path and text operations, with a WebGL-backed `SkSurface` drawing
to HTML canvas. CanvasKit is not simply Skia compiled to ordinary JavaScript.
The app compilation target and rendering-library compilation target are separate
choices. [15][16]

Flutter's current initialization documentation exposes renderer selection,
CanvasKit CPU-only fallback and surface limits, plus single-threaded Skwasm
configuration. Its Wasm documentation requires COOP/COEP for multithreading and
describes a JavaScript/CanvasKit fallback. Consequently, a Wasm build command does
not establish that the current session uses Wasm or multiple rendering threads.
Record the actual selected path. [17][18]

**Version-specific support.** Flutter 3.50's documented Dart-Wasm requirements are
WasmGC, JS String Builtins and Phase 4 Exception Handling. The loader also checks
an engine allowlist. Its documentation lists Chromium enabled by default and
WebKit/Gecko disabled by default, even where the engine meets the documented
feature thresholds. Those are Flutter loader policy and Dart-Wasm requirements,
not universal requirements for a small Rust `wasm32` module or WebGPU. [18]

**Documented semantics.** Flutter translates its internal Semantics tree into
accessible HTML DOM. Its web accessibility documentation describes opt-in
activation through an invisible "Enable accessibility" button or programmatic
`ensureSemantics()`. It maps semantic roles into HTML/ARIA and maintains separate
focus/input behavior. Canvas pixels do not provide these facilities on their
own. Flutter's FAQ also distinguishes app-centric rendering from text-rich,
document-centric sites. [19][20]

**Inference for Lenso.** The useful lesson is scene ownership plus an explicit
semantic/input bridge, not "compile the existing DOM UI to Wasm". Retaining Lenso's
DOM/SDK controls above a decorative canvas preserves existing semantics, native
editing and agent-facing controls. Replacing text and controls with canvas paint
would require synchronized accessibility, keyboard/focus, selection, IME, browser
zoom and hit testing. Such a replacement exceeds an optical backend experiment.

**Source limitation.** Search indexing still exposes Flutter's former `/renderers`
page, including approximate renderer download sizes and broad performance claims.
On a fresh fetch its HTML URL redirected to the web overview and its Markdown URL
returned 404. This note does not reuse those size figures or performance claims as
current, reproducible evidence. Current initialization, Wasm, overview and Skia
documentation support the narrower conclusions above.

## Rust/Wasm: CPU work placement, transfer cost and startup

**Documented boundary costs.** `wasm-bindgen` copies boxed numeric slices between
JavaScript typed arrays and Wasm linear memory. `str` conversion copies and
transcodes through TextEncoder/TextDecoder; `JsString` can retain a JavaScript
string handle instead. `js_sys::Uint8Array::view` offers a non-copying view into
Wasm linear memory, but has explicit lifetime/memory-growth safety constraints.
A zero-copy JavaScript view is not a guarantee of zero-copy GPU upload. [21][22][23]

**Specification.** WebGPU `writeBuffer`/`writeTexture` define copying input bytes
to the device timeline, with room for implementation optimization. Wasm does not
grant direct access to browser compositor textures, DOM layout internals or native
UI. The WebAssembly Web API explicitly confines access to the surrounding host
APIs. [1][24]

**Inference.** Keep per-frame boundary traffic bounded: batch numeric scene
updates, retain buffers and geometry, and keep dynamic optical work in shaders.
Rust is a plausible candidate for measured CPU-heavy geometry, spatial indexing,
or map generation. Moving a small JS scheduling layer to Rust while retaining
DOM capture, rasterization and upload work does not remove those stages. Compare
equivalent JS and Wasm kernels before accepting the extra runtime/build boundary.

**Specification and startup.** `instantiateStreaming` permits background/streaming
compilation from a response; the response must have an OK status, satisfy the
specified CORS conditions and use `application/wasm`. The current editor's draft
also describes compiled-module sharing as an engine optimization, not an
unconditional cache hit. Startup still includes download, compile/instantiate,
bindings, allocations and shader/pipeline preparation. [24]

**Inference.** Measure cold and warm navigation separately, distinguish compressed
transfer size from decoded Wasm and GPU allocations, and mark both renderer-ready
and first visibly correct glass. A faster steady-state CPU kernel alone cannot
establish faster startup or lower interaction latency. Cross-origin isolation is
relevant when using shared-memory threading; ordinary single-threaded Wasm and
the existence of WebGPU do not inherently require the Flutter threading headers.

## 外部架构与浏览器约束

- **边界是像素来源的所有权。** WebGL2/WebGPU 的常规图像上传接口不等于任意 DOM
  截图接口；SVG foreignObject 是受约束的重绘，不能视为实时合成器复制。[1][2][3]
- **2026 年的新情况必须单列。** Chrome 官方声明 HTML-in-Canvas 已在 Chrome 157
  发布，可把 canvas 内 `drawable` DOM 子树绘入纹理；仍需 paint 生命周期、几何同步和
  特性检测。本研究没有实测该版本，也未建立 Safari/Firefox 已发布支持的证据。[5][6][9]
- **Safari 的限制不是 GPU 不会折射。** WebKit SVG URL backdrop-filter 问题仍未关闭；
  PR 68614 尚未合并且有审查阻塞。Safari 26 已发布 WebGPU。场景自有纹理可以走自定义
  折射 pass，但不能顺便获得页面上任意 DOM 背景。[11][13][14]
- **Flutter 的启示是场景与语义双重所有权。** CanvasKit 是 Skia 的 Wasm 构建；Skwasm
  的多线程受部署头和运行时选择约束。Flutter 通过独立 Semantics-to-DOM 层提供辅助
  功能，不是 canvas 像素天然具备语义。Lenso 原型应保留 DOM/SDK 交互所有权。[16][17][18][19]
- **Rust/Wasm 不消除捕获或上传。** 字符串和某些数组绑定会复制；线性内存 view 也有
  生命周期限制。仅对已证明昂贵的 CPU 内核评估 Rust，并分别测冷启动、边界流量、
  shader/GPU 工作和显示结果。本研究没有设备帧率、能耗或倍数提速结论。[21][22][23][24]

## Unverified items and experiment implications

- Real Safari/iPhone GPU context creation, device loss, sustained performance,
  heat, power and optical correctness remain untested here. Playwright WebKit
  would not substitute for an installed Safari or physical iPhone measurement.
- HTML-in-Canvas's stated Chrome release is vendor evidence only in this note.
  Verify the actual browser build, methods, invalidation and native interaction
  before selecting it. Cross-engine support remains unestablished here.
- Do not infer text/image/video/iframe DOM capture fidelity from a scene-owned
  procedural fixture. Identify every backdrop input source in prototype results.
- Flutter is architectural evidence, not a benchmark opponent measured here.
  No exact CanvasKit/Skwasm package size or startup improvement is asserted.
- No identified first-party Telegram demo source was supplied or encountered.
  Its implementation and performance were not investigated or used as evidence.

## Primary sources

1. WebGPU specification, published CR Draft 2026-09-15, source types, copies,
   resource/shader model and origin restrictions:
   <https://www.w3.org/TR/2026/CRD-webgpu-20260915/>
   (read through <https://www.w3.org/TR/webgpu/>).
2. Khronos WebGL2 specification, texture upload and framebuffer contracts:
   <https://registry.khronos.org/webgl/specs/latest/2.0/>.
3. SVG processing modes and foreign-content restrictions:
   <https://www.w3.org/TR/SVG/conform.html#secure-static-mode>.
4. Screen Capture specification, `getDisplayMedia`:
   <https://www.w3.org/TR/screen-capture/#mediadevices-additions>.
5. Chrome release announcement, published 2026-10-26:
   <https://developer.chrome.com/blog/html-in-canvas>.
6. Chrome HTML-in-Canvas concepts, lifecycle, geometry and fallback:
   <https://developer.chrome.com/docs/web-platform/html-in-canvas/concepts>.
7. Chrome HTML-in-Canvas WebGL integration:
   <https://developer.chrome.com/docs/web-platform/html-in-canvas/webgl>.
8. Chrome HTML-in-Canvas WebGPU integration:
   <https://developer.chrome.com/docs/web-platform/html-in-canvas/webgpu>.
9. WICG HTML-in-Canvas explainer:
   <https://github.com/WICG/html-in-canvas>.
10. Filter Effects Level 2 editor's draft, backdrop algorithm and consensus caveat:
    <https://drafts.csswg.org/filter-effects-2/>.
11. WebKit SVG backdrop-filter bug, status fetched on research date:
    <https://bugs.webkit.org/show_bug.cgi?id=245510>.
12. Related WebKit filter/backdrop compositing bug and maintainer explanation:
    <https://bugs.webkit.org/show_bug.cgi?id=297770#c1>.
13. Unmerged WebKit reference-backdrop-filter implementation proposal:
    <https://github.com/WebKit/WebKit/pull/68614>;
    inspected revision:
    <https://github.com/WebKit/WebKit/commit/bf9f8394b4d2d820f30a59a3dcda03dd48d94483>.
14. WebKit Safari 26.0 shipping announcement:
    <https://webkit.org/blog/17333/webkit-features-in-safari-26-0/>.
15. Flutter current web architecture overview:
    <https://docs.flutter.dev/platform-integration/web>.
16. Skia CanvasKit architecture and APIs:
    <https://skia.org/docs/user/modules/canvaskit/>.
17. Flutter current loader/renderer configuration:
    <https://docs.flutter.dev/platform-integration/web/initialization.md>.
18. Flutter current Wasm support, browser allowlist and threading headers:
    <https://docs.flutter.dev/platform-integration/web/wasm.md>.
19. Flutter semantics and web accessibility:
    <https://docs.flutter.dev/ui/accessibility/web-accessibility.md>.
20. Flutter Web FAQ, app/document distinction:
    <https://docs.flutter.dev/platform-integration/web/faq.md>.
21. wasm-bindgen boxed number slice copying:
    <https://wasm-bindgen.github.io/wasm-bindgen/reference/types/boxed-number-slices.html>.
22. wasm-bindgen string conversion and handles:
    <https://wasm-bindgen.github.io/wasm-bindgen/reference/types/str.html>.
23. js-sys typed-array view safety and copy operations:
    <https://wasm-bindgen.github.io/wasm-bindgen/api/js_sys/struct.Uint8Array.html>.
24. WebAssembly Web API editor's draft, streaming, module serialization and host
    access limits:
    <https://webassembly.github.io/spec/web-api/index.html>.
