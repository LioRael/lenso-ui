# Scene-owned glass experiment

An independent DOM + WebGL2 scene testing one change: keep the background texture
in the optical renderer's context instead of passing a source Canvas to the
existing core. It is not an arbitrary DOM backdrop renderer or a published API.

See the [audit and recommendation](../../docs/research/scene-owned-glass-2026-11-16.md)
and [primary platform sources](../../docs/research/scene-owned-glass-platforms-2026-11-16.md).

## Run

Use the repository's pinned Bun/Node versions and installed workspace dependencies.
From the repository root:

```sh
bun --bun vite --config experiments/scene-owned-glass/vite.config.ts
```

The default port is 4325. Reuse an existing instance rather than starting a duplicate.
For a supervised review service, the command used for this experiment is:

```sh
amp orb service start lenso-glass-experiment --command 'bun --bun vite --config experiments/scene-owned-glass/vite.config.ts --port $PORT' --port 4325 --portal
```

Select either path, drag **Move glass** (or Alt + arrow keys), scroll the scene,
press the spring control in a four-lens scene, switch material, simulate/restore context loss, and
unmount/remount. Reduced motion starts paused. `?mode=upload&dpr=2` selects the
initial path and backing-pixel density; it does not emulate a physical device.
The page chrome remains light when the optical material switches to dark.

### Layered composition probes

Open `/ceiling.html` using the link at the top of the original experiment. This
separate entry tests the visual ceiling without changing the original timing
fixture: photo → supplied text region → lower glass → lower label → upper glass.
The upper lens samples completed lower layers through alternating render targets;
its own label and hit target remain native DOM above the final image.

Use **Probe** for overlap, text or photo/text-boundary positions. **Sampling**
switches to a deliberately incomplete shared backdrop; **Refraction** disables
only displacement, keeping blur and material fixed. Edit **Scene text** or
**Lower label**, hide the lower glass, adjust blur, switch material, drag (or
Alt + arrows), cancel with Escape, lose/restore the context and remount.

These are explicitly supplied Canvas2D text layers, not arbitrary DOM capture.
The two source regions share one composition domain. This does not establish
independent-scene exchange, Portal/clip ordering, native editable text, IME,
compositor-scroll synchronization or physical-device performance. Low default
blur exposes displacement and does not claim an Apple material match.

This path allocates seven full-size RGBA8 targets plus the photo texture. Ordered
frames ending in glass retain the completed lower composition and its blurred
input, reusing target 6 (otherwise used by the shared negative control). Moving
only the final glass then needs three draws and no paint upload or blur passes.
Paint sources opt into retention with an explicit revision, incremented whenever
their pixels or dimensions change. Unversioned paint remains uncached. Changes
to lower glass records, source identity/revision, layer order/count, background
revision, blur or sampling invalidate retention; material/size/context changes
rebuild the renderer. Cache misses add one full-target copy to the original path.
The default composition now uses local blur and in-place layer writes. Blur bounds
include conservative refractive/chromatic displacement, bilinear sampling and the
vertical pass's horizontal-intermediate halo. The final retained blur remains
full-size to preserve top-only reuse. With unchanged versioned paints/background,
a changed lower stack reconstructs the union of old/new glass and all convolution
dependencies in the existing composition target. Paint/background invalidation or
an incompatible previous frame forces reconstruction from the full background.
This is one conservative bounding region, not independent per-layer history or
tile tracking. No extra texture, downsampling or shader change is involved; paint
uploads and final presentation remain full-size.
It has no animation clock and draws on changes.
Do not reuse the original upload/resident benchmarks as a measurement of it.
Failure exposes readable DOM content instead of pretending to retain refraction.

The **Scene** selector also accepts `?scene=photo-dynamic` or
`?scene=photo-static-small`:

- `procedural`: the original animated test pattern and four lenses.
- `photo-dynamic`: a decoded real photograph panning behind four lenses. Native
  scene scrolling changes the sampled part of the photo.
- `photo-static-small`: the same photograph without time-based motion, with one
  172 × 64 CSS px lens (2.87% bounding-box coverage at 800 × 480). Move the lens
  to test retained textures; scrolling deliberately invalidates the background.

Both paths retain the source revision and blurred result when the background is
unchanged. Static lens motion must not trigger new source uploads or blur passes;
idle must submit no frames. The experiment still has a RAF clock, so zero draw
submissions does not mean zero scheduler/CPU work. The resident path composites
the full background when a lens moves; this is **not a cropped-atlas comparison**.

## Matched rendering contract

- **resident:** background shader → framebuffer texture → two blur passes →
  background composite plus instanced glass, all in one WebGL2 context.
- **upload:** the same background shader in its own Canvas → existing, unmodified
  `GlassRenderer.render_canvas()` → its upload, blur and optical rendering in a
  second Canvas. Only the background program is compiled in the source context;
  no unused optical program or redundant lens-buffer upload is added to this arm.
- Both use the current generated optical/blur shaders, `toneShader`, iOS 27
  material parameters, DPR-scaled lens records and the same spring implementation.
  Both preserve the existing shader's finite convolution support. No quality
  reduction or downsampling is used to favor the resident arm.
- UI appearance is compiled StyleX. The foreground remains actual DOM buttons;
  pointer dragging uses the installed public UI SDK `bindDrag` behavior.
- The internal Glass source imports are intentional for an isolated research
  fixture, not a supported application integration pattern. No package exports,
  build configuration, dependencies or public component contracts are changed.

The baseline is the current **core with Canvas input**, not the complete current
DOM/SVG component stack. Neither arm serializes DOM. This experiment cannot assign
a measured saving to avoiding DOM capture or claim Safari normally selects this
baseline. The separate ceiling entry now covers supplied overlapping layers;
cropped-atlas comparison, arbitrary clipping, Portal ordering, fusion and real
video sources remain future work.

## Reproduce checks

Install the repository's Playwright Chromium and WebKit engines if absent, following
`CONTRIBUTING.md`. The scripts resolve the existing docs workspace installation.
They write screenshots and raw JSON under `.amp/in/artifacts/scene-owned-glass/`;
ensure `/.amp/in/` is in the repository-local Git exclude before running them.

```sh
bun check --no-script -p experiments/scene-owned-glass/tsconfig.json
bun --bun oxlint --config .oxlintrc.json --deny-warnings experiments/scene-owned-glass
bun --bun oxfmt --check experiments/scene-owned-glass
node experiments/scene-owned-glass/test.mjs
node experiments/scene-owned-glass/ceiling-test.mjs
node experiments/scene-owned-glass/benchmark.mjs
node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

The ceiling test compares ordered output against two sequential, unmodified
`GlassRenderer` composites, then checks lower-label influence inside the upper
lens against the shared-backdrop negative control. It isolates text displacement
from blur, verifies cross-region GPU movement away from the DOM label, and checks
keyboard/drag cancellation, editing, material/blur controls, context recovery,
remounts and narrow geometry in Chromium/WebKit at DPR 1/2. Its raw JSON and
screenshots go to the `ceiling/` artifact subdirectory.

The separate ceiling benchmark measures the existing two-layer UI through its
Alt + arrow handler and the same renderer with 1/2/4/8 ordered glass
layers. It keeps two supplied paint canvases, the photo, material and full
resolution fixed. Defaults: DPR 1/2, blur 1.2/15.3 CSS px, three reversed-order
sweeps, 24 warm-up draws, 30 idle callbacks, then 120 measured callbacks per
case. `DPRS`, `KIND=ui|renderer`, `LAYERS`, `BLUR`, `PERF_FRAMES` and `PERF_RUNS`
can narrow a run. Each invocation overwrites `ceiling/performance-layered.json`;
set `PERF_OUTPUT` to another filename to preserve separate conditions, or save
prior results before running a different scope. Repeating a single
case in separate invocations tests fresh browser sessions rather than the
history of one sweep.

`KIND=renderer PERF_WORK=full PERF_RETAIN=0` omits paint revisions and exercises
the original uncached composition. `KIND=renderer PERF_MOTION=all` moves every glass layer,
forcing cache misses. The default moves only the final glass. The one-glass
fixture ends with foreground paint, so it intentionally has no retained prefix.
The UI arm always uses its application's versioned paint and top-glass motion.

`PERF_WORK=full|local-blur|local|dirty` retains the original full-target path,
bounded blur, bounded blur plus in-place layer composition, and the latter with
cross-frame region reconstruction as historical controls. `cached` adds paint
texture reuse to `dirty`; `bounded` additionally generates the final retained blur
only over its optical dependencies and a motion margin. Default: `bounded`. Non-default modes
require `KIND=renderer`; the UI continues to use the default. Every resident
renderer sample compares six moving frames against `full` before warm-up, then
disposes that reference. Formal frame windows never read pixels.

The spatial work validation used eight moving layers, DPR 2, σ15.3 and 30 frames:

| Work mode  | Draws/frame | Blur-pass pixels/frame | Copy/paint-pass pixels/frame |
| ---------- | ----------: | ---------------------: | ---------------------------: |
| full       |          38 |             25,907,200 |                   22,668,800 |
| local-blur |          38 |              7,310,720 |                   22,668,800 |
| local      |          29 |              7,310,720 |                    8,096,000 |
| dirty      |          29 |              7,310,720 |                    5,329,040 |

These are GL calls and scissor-bounded shader-pass pixel counts, not hardware
bandwidth, GPU execution time or presented FPS. Each Chromium/Metal sample passed
six-frame full-image parity with maximum channel difference zero, idle submitted
no work and disposal released all explicit GL objects. These four historical modes upload
12.35 MiB of paint input per frame and retain 49.75 MiB of explicit textures.
Raw files: `spatial-validation-{full,local-blur,local,dirty}.json`.
The machine reported `com.apple.loginwindow` throughout these validation windows;
their timings are **not valid foreground performance comparisons**. The guarded
WebKit timing run was initially rejected for the same reason.

The subsequent unlocked WebKit 27.2 comparison completed 18 valid fresh-session
samples: four all-moving modes plus full/dirty top-only controls, three rounds.
All native foreground boundary checks reported Playwright; idle RAF P50 was 17 ms.
Each sample used 24 warm-ups, 30 idle callbacks and 30 measured callbacks at DPR 2,
σ15.3. All-moving order was full/local-blur/local/dirty, reversed in round two;
top-only order was full/dirty, also reversed in round two.

| Work mode  | All-moving RAF P50 by round (ms) | RAF P95 by round (ms) |
| ---------- | -------------------------------- | --------------------- |
| full       | 62 / 64 / 65                     | 79 / 79 / 78          |
| local-blur | 27 / 28 / 29                     | 37 / 38 / 40          |
| local      | 28 / 29 / 30                     | 35 / 36 / 40          |
| dirty      | 29 / 29 / 30                     | 38 / 35 / 37          |

Top-only full and dirty both stayed at 17/17/17 ms, three draws and zero
paint uploads/blur work per frame. Every sample passed six-frame pixel parity
with full (maximum zero), zero explicit readbacks in the measured window and
complete explicit GL disposal. Raw files: `spatial-unlocked-r{0,1,2}-{work}.json`
and `spatial-unlocked-top-r{0,1,2}-{full,dirty}.json`.

The dominant measured gain is local blur. In-place writes and dirty regions
reduce submitted work but show no additional RAF improvement in this dense case.
Full-to-dirty P50 medians changed 64 to 29 ms (54.7% lower); this is not GPU time
or actual presentation latency and still exceeds a 60 Hz frame budget. Use this
run's full arm, not the earlier separate 54 ms session, as the timing baseline.
No physical residency/power measurement or true Safari/iPhone acceptance is implied.
To reproduce in an unlocked session:

```sh
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_WORK=dirty PERF_MOTION=all PERF_RUNS=3 PERF_FRAMES=30 PERF_FOREGROUND=1 PERF_OUTPUT=spatial-foreground-dirty.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

Run the other three work modes with distinct output filenames, alternating their
order across fresh invocations. Do not compare a background run against the
historical foreground baseline below or bypass the foreground guard.

### Implemented paint cache and bounded final blur

Paint textures are retained by paint-layer slot and validated against source,
revision and source dimensions before upload. The first slot reuses target 5;
additional slots allocate textures without framebuffers. Mutable/unversioned
paint is uploaded each frame. Removed slots, an uncached work mode, non-composed
rendering and disposal release extra textures. The page's existing context-restore
handler creates a new renderer, so no lost-context texture is reused. Paint inputs
remain stage-sized canvases; this is not an arbitrary DOM capture API.

The final blur records a valid sample rectangle. It includes the unchanged
optical displacement halo, with an extra motion margin of the larger of 16 CSS px
and one convolution radius. A top-only move inside the rectangle reuses blur;
outside it, the renderer recomputes a local rectangle from the retained prefix.
Horizontal output also includes vertical convolution support. No kernel,
resolution, material or refraction parameter changes. This recomputes the whole
requested local rectangle, not just the newly exposed strips.

M2 Pro/AC, WebKit 27.2, eight all-moving layers, DPR 2, σ15.3, three fresh-session
rounds (reverse order in round two), 30 measured callbacks per sample:

| Work    | RAF P50 by round (ms) | RAF P95 by round (ms) | Uploads/frame | Blur-pass pixels/frame |
| ------- | --------------------- | --------------------- | ------------- | ---------------------- |
| dirty   | 30 / 30 / 28          | 38 / 36 / 37          | 2             | 7,310,720              |
| cached  | 20 / 21 / 21          | 24 / 25 / 24          | 0             | 7,310,720              |
| bounded | 17 / 16 / 18          | 30 / 30 / 28          | 0             | 4,960,000              |

All foreground boundary checks reported Playwright, idle P50 was 17 ms, moving
full-reference parity was zero, measured readbacks/errors were zero, and disposal
released all tracked GL objects. Raw files: `implemented-r{0,1,2}-{work}.json`.
Separate single-session top-only controls (`implemented-top-{dirty,bounded}.json`)
both stayed at RAF P50 17 ms with three draws and zero uploads/blur per frame.
No continuous foreground audit or physical memory/power measurement was performed.

At DPR 2 the optimized explicit texture ledger is 58,643,200 bytes (55.93 MiB),
6,476,800 bytes (6.18 MiB) above dirty, not the diagnostic probe's 12.35 MiB extra.
Submission P95 is 1 ms, not a zero-cost claim. Median RAF improved 30 to 17 ms,
but P95 remains 28–30 ms and is worse than the paint-only mode's 24–25 ms in this
short sample. Stable presented 60 FPS is not established.

The ceiling test adds cache invalidation/source replacement, mutable paint,
slot removal/reinsertion and full-mode transitions, plus bounded top motion
inside/outside the valid rectangle. Both optimized modes also run the existing
DPR 1/2 spatial edge/halo matrix against `full`. The uncached legacy composite
remains an independent optical reference.

### Tail cadence and extended-session diagnostics

`PERF_TIMELINE=1` records RAF timestamps **and actual callback arrival**, per-frame
API/pass counts, a 50 ms independent timer, explicit GL resources every 300 frames,
and native foreground samples at approximately 1 Hz. Native sampling can miss
brief focus changes; it is not a continuous foreground audit. This opt-in path
retains background observations instead of failing the final foreground assertion.
Filter those windows before interpreting foreground performance.

`PERF_IDLE_FRAMES=0` removes the default 30 no-draw callbacks between warm-up and
measurement. `PERF_FENCE=1 PERF_TIMELINE=1` separately polls the previous frame's
fence with `clientWaitSync(sync, 0, 0)` and deletes it. Optional
`PERF_FENCE_FLUSH=1` flushes after inserting the fence. These are perturbing
diagnostics, not GPU timers, presentation measurements or production optimizations.
No blocking wait or synchronous pixel readback occurs in the timed window.

```sh
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_WORK=bounded PERF_MOTION=all PERF_RUNS=1 PERF_FRAMES=18000 PERF_FOREGROUND=1 PERF_TIMELINE=1 PERF_OUTPUT=tail-long-bounded.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

On this M2 Pro/AC, the 18,000-frame window lasted 296.736 seconds. RAF and actual
arrival P50/P95/P99 were 16/28/31 ms; ten successive 30-second bins (last partial)
had P95 27–29 ms without progressive degradation. All 301 native samples reported
Playwright; every frame reported visible/focused. Of 1,652 intervals above 25 ms,
1,638 were followed by an interval below 10 ms; their pair median was 34 ms.
Submission P95 was 1 ms. The independent timer P95/max was 54/59 ms.
All frames performed 29 draws, zero uploads/readbacks and 4,960,000 blur-pass pixels.
All 61 resource snapshots retained 58,643,200 explicit texture bytes (55.93 MiB),
9 textures and 7 framebuffers, without context loss; disposal released tracked
objects. This does not establish physical residency, power or hours-long stability.

Two 600-frame runs without the new timeline/fence probes also had P95 28 ms.
Removing the idle gap did not eliminate tails. In a separate WebKit fence window,
all 66 sub-10 ms callbacks saw an unsignaled previous-frame fence; 43/46 above-25 ms
callbacks saw it complete. Explicit flush preserved the same qualitative pattern
and P95 28 ms. A lower-blur diagnostic (σ1.2) had P95 18 ms and all 599 preceding
fences complete, but changes the image and is **not** a valid quality-preserving
speedup. These results implicate in-flight rendering and callback pacing rather
than variable paint/cache work; they do not isolate GPU execution from compositor
or display acknowledgements. Chromium's different RAF clock/arrival behavior and
fence reporting must not be treated as equivalent GPU completion timing.

Raw files use `tail-*.json` in the ceiling artifact directory; `tail-analysis.json`
contains derived summaries. See the research note for controls and limitations.
Renderer, shaders and component appearance were not changed for this investigation.

### Remaining-cost diagnostics (pre-implementation)

`PERF_DIAGNOSTIC` defaults to `none`, with no additional GL wrappers. Opt-in
diagnostics require `PERF_WORK=dirty`, `KIND=renderer`, `PERF_PIPELINE=resident`, `PERF_MOTION=all`,
an explicit `LAYERS` greater than one and `PERF_RUNS=1`:

- `api-times` aggregates wall time inside selected GL API calls. This is a
  separately instrumented window, not pure JavaScript or GPU execution time.
- `cache-paint` keeps the fixture's two unchanged paint sources in two extra
  textures. It is specific to these immutable sources, not a general revision
  cache. Six alternating full-image comparisons force prefix invalidation in
  both paths before timing; maximum channel difference must be zero.
- `skip-final-blur`, `skip-prefix-blur`, `skip-blur` suppress respectively the
  final two blur draws, the preceding blur draws, or all blur draws. These
  deliberately produce incorrect optics and measure sensitivity only. They
  are not optimizations or eligible visual results.

All probes activate after the ordinary six-frame full-reference check.
`raw.parity` therefore describes the unmodified renderer, not skip-blur output;
`raw.diagnosticPixelParity` additionally validates the paint-cache path.
The existing `raw.calls` counters count **attempted** API calls, including calls
suppressed by a diagnostic. `raw.diagnosticResult` records skipped draws,
cached uploads and instrumented API wall time. No timed frame reads pixels.

Fresh-session WebKit 27.2, M2 Pro/AC, DPR 2, eight all-moving layers, σ15.3,
30 measured callbacks: formal rounds `bottleneck-screen-r{1,2,3}-{mode}.json`
reversed their order between rounds. `r0` was initial screening, not part of
this comparison. All formal foreground boundary checks reported Playwright;
idle RAF P50 was 17 ms. Baseline P50 was 29/30/29 ms, cached paint 20/19/20 ms,
skip-final-blur 18/18/21 ms, skip-prefix-blur 16/16/17 ms and skip-blur 17/17/17 ms.
Do not add these deltas: CPU/GPU overlap, RAF quantization and altered pixels
prevent an additive stage budget.

The cache probe reduced submission P50 from 10 ms to a timer-rounded 0 ms
(P95 1 ms), without removing blur. Its explicit texture ledger grew from
49.75 to 62.10 MiB; this is not a minimum cache allocation or physical residency.
API probes spent 286/291/287 ms inside 60 Canvas `texSubImage2D` calls per
30-frame window, about 9.5–9.7 ms/frame. This includes browser conversion,
submission and any implicit synchronization; their internal split is unknown.
The final retained blur covers 3,238,400 of 7,310,720 blur-pass pixels/frame,
about 44.3%, solely so arbitrary top-only motion can reuse it later. Deferred or
region-valid caching is the next candidate, not a proven equivalent optimization.

```sh
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_WORK=dirty PERF_MOTION=all PERF_RUNS=1 PERF_FRAMES=30 PERF_FOREGROUND=1 PERF_DIAGNOSTIC=cache-paint PERF_OUTPUT=bottleneck-cache-paint.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

The earlier retained-cache comparison on 2026-11-17 used DPR 2, σ15.3, three sweeps and
30 measured callbacks per case, with 24 warm-up draws and 30 idle callbacks.
WebKit was activated and checked at both boundaries; idle P50 stayed 17 ms.
WebKit P50 medians for 2/4/8 layers changed from 20/32/55 to 17/17/17 ms.
Chromium's uncached/versioned comparison changed 9.1/23.4/50.1 to 8.3/8.3/8.3 ms.
These are RAF callback intervals, not GPU or presented-frame timings. Eight
fully moving layers remained about 54–55 ms in WebKit with either cache policy.
Explicit DPR 2 texture bytes stayed 49.75 MiB. Warm retained movement reduced
paint upload input from 12.35 MiB/frame to zero; this is not measured bandwidth.
See `ordered-before-cache.json`, `ordered-after-cache.json`,
`ordered-chromium-{uncached,cached}.json`, `ordered-all-{cache,uncached}.json`
and `ordered-ui-cached.json` in the evidence directory. These compare the same
layered experiment, not production `attachGlass`, DOM capture or a cropped atlas.

`PERF_PIPELINE=legacy KIND=renderer BLUR=15.3 LAYERS=2` (or `LAYERS=8`)
adds an equal-capability sequential reference through the unchanged
`GlassRenderer.render_canvas()`. One core context is reused, Canvas2D supplies
ordered composition, and static lower layers are retained in this arm too.
Both arms use `antialias:false`; each legacy sample must pass a full-image pixel
comparison before timing. This mode disallows GL timer queries because they
would omit Canvas2D work. Its separate synchronous diagnostic reads the final
Canvas2D pixel as well as the GL pixel, not just the optical surface.

Final WebKit DPR 2 samples (`ordered-legacy-final-{2,8,all}.json`) showed both
cached pipelines at 17 ms RAF P50 when only the top glass moved. With eight
moving layers, old core sequential composition measured 123/126/124 ms versus
the resident pipeline's 55/54/54 ms. Chromium top-only eight-layer results were
also tied near 8.3 ms (`ordered-legacy-final-chromium.json`). The legacy arm has
18.53 MiB explicit GL textures plus three full-size Canvas2D surfaces; resident
has 49.75 MiB GL textures. These incomplete ledgers do not establish total
physical residency or a memory winner. This remains a core adapter comparison,
not acceptance of the complete production DOM/SVG/atlas integration.

It records active and idle RAF intervals, document visibility/focus, the native
foreground application on macOS, renderer submission and synthetic handler wall time;
none is compositor-present latency. A separate 20-draw diagnostic times render
plus a synchronous one-pixel readback, including CPU, waiting and readback
overhead. No readback occurs in the live measurement window. The texture ledger
counts declared RGBA8 pixel bytes, not physical GPU residency, process RSS,
default buffers, upload staging, Canvas2D or driver pools. Explicit objects must
return to zero after each renderer-only disposal.

`PERF_QUERY=1` separately writes `performance-layered-query.json` for instrument
diagnosis, **not trusted GPU execution timing**. The observed ANGLE Metal query
results exceeded frame intervals; inspected ANGLE source sums command-buffer
spans. WebKit exposes no timer extension here. Formal sweeps disable queries.
The retained results include a large WebKit history-dependent slowdown that
must not be hidden by the median or reported as a fixed shader cost. A later
same-context diagnostic reproduced 413 ms RAF and 397 ms idle intervals while
the native browser was not foreground; activating it restored 59/17 ms without
changing rendering resources. DOM visibility and focus both remained true.
Subsequent process-policy interventions identified a causal contribution from
macOS UI-process CPU suppression (`lowpri_cpu` and `suppressed_cpu`). In one
unlocked, non-foreground session, clearing only those two fields changed drawing
RAF P50 from 394 ms to 65/61 ms; restoring them returned it to 393/406 ms.
Other suppression fields, child-process policies and rendering inputs stayed
unchanged. Idle RAF changed from 403 ms to 33/33 ms, then back to 404/403 ms.
A separate locked-session full-policy intervention recovered 54 ms drawing and
17 ms idle; restoring its original policy brought back approximately 400 ms.
These are separate conditions, not interchangeable performance samples.

The two CPU fields have not been isolated individually. Clearing only the timer
or `active` field did not recover the locked-session slowdown. WebKit's separate
`IsVisuallyIdle` state was also observed; inspected public sources do not establish
a fixed 400 ms rAF policy. Attaching System Trace disturbed the slow state.
The private Mach-policy interventions were temporary, restricted to owned test
browser processes and restored before closing them. They are not a product API,
persistent power-setting change, proof of a GPU leak or a Safari/iPhone result.

On macOS headed WebKit, `PERF_FOREGROUND=1 ENGINE=webkit` activates the native
Playwright application before each case and asserts it is foreground at both
sample boundaries. This intentionally changes native application focus; run it
separately from other desktop activity. It does not alter persistent power
settings or protect a product against background throttling. The 60-case
foreground run below had 17 ms idle P50 throughout and 54/54/54 ms P50 for the
DPR 2 eight-layer high-blur case. This uses 60 measured frames, not the original
120, and does not replace the historical data or prove physical present time.

```sh
ENGINE=webkit DPRS=1,2 PERF_RUNS=3 PERF_FRAMES=60 PERF_FOREGROUND=1 PERF_OUTPUT=session-foreground.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

See the research note for the full diagnosis, limits and independent
fresh-session checks. Renderer/shader code was not changed for this diagnosis.

`GLASS_LAB_URL` overrides the default loopback URL. `ENGINE=chromium` or
`ENGINE=webkit` selects one engine. `PERF_RUNS` changes the benchmark's default
three alternating pairs per engine/DPR/scene. `SCENES=photo-dynamic,photo-static-small`
selects the photo extension (48 samples); the default includes all three scenes.
Run correctness and timing **separately**,
without source edits, builds or another GPU workload during timing.

The photo extension writes `correctness-photo.json` and `performance-photo.json`.
The retained first-round `results-2026-11-16.json` uses the pre-photo fixture;
`results-photo-2026-11-16.json` records the photo round separately. Do not compare
their navigation-to-ready values as a before/after startup result: the new fixture
eagerly loads and decodes the photo even when starting on the procedural scene.

The timing script's Chromium launch is deliberately **macOS-specific**: headed
ANGLE Metal. The initially observed default headless Chromium used SwiftShader;
those samples were discarded. Adapt the launch and verify a real GPU renderer
before using this harness on another platform. A software-renderer assertion is
not proof of a specific physical GPU on all platforms.

## What the measurements mean

- Callback frame intervals: P50/P95/P99 between application RAF timestamps,
  **not GPU execution or compositor-present time**. Each sample waits 180 RAFs,
  after 500 ms warmup. Every 12 callbacks, dynamic scenes receive a synthetic
  range-input event; static-small receives alternating Alt + left/right lens
  movement with no background scroll. Static idle is checked for another 60 RAFs.
  The input and scroll events can cause additional submissions within one RAF.
- Submission time: foreground updates and JS/WebGL submission wall time. The
  browser may block inside an upload; this is not a separate GPU timer.
- Synthetic input-to-submission: starts in the programmatically dispatched
  handler, ends after draw submission. It excludes hardware input, event queue
  waiting, compositor scheduling and scanout. It is not input-to-visible latency.
- Navigation-to-ready: Node-side navigation start to an initialized lab flag,
  with Vite/browser caches potentially warm. It is **not cold first visible paint**.
- Chromium CDP `TaskDuration`: main-renderer-thread task seconds over the sample,
  not total process CPU. WebKit does not expose this metric through this harness;
  unsupported long-task observation is `null`, not zero.
- Instrumented API counts: distinguish uploads, explicit readbacks, SVG
  serialization and image decoding. They cannot reveal internal driver copies,
  physical memory residency or hidden browser readbacks.
- Resource checks: six mount/unmount cycles assert zero live explicitly created
  textures/framebuffers/programs/buffers/VAOs after each disposal. They do not
  measure GPU/CPU allocation bytes or when a driver physically reclaims memory.
- Pixel parity: fixed time/scroll, light/dark material, same browser and DPR,
  composed stage screenshots. It tests matching these two implementations,
  not equivalence to native Apple materials or complete artistic acceptance.

True macOS Safari, iOS Safari, Windows and Android acceptance remains open. See
the report for failed access attempts, final visual-inspection limits and results.

## Convolution pairing probe

`SceneRenderer` has an experimental final `convolution` argument, defaulting to
`"reference"`. `"paired"` keeps the center tap and combines adjacent taps on each
side using LINEAR sampling and symmetric weights. It keeps the original kernel
support, full-resolution RGBA8 targets and highp arithmetic. At sigma 30.6 backing
pixels, shader texture calls decrease from 145 to 73, without adding targets.
This does **not** guarantee identical pixels or halve hardware texture traffic.
The normal UI and published glass implementation remain unchanged.

```sh
node experiments/scene-owned-glass/convolution-test.mjs
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_MOTION=all PERF_FRAMES=600 PERF_RUNS=1 PERF_FOREGROUND=1 PERF_TIMELINE=1 PERF_CONVOLUTION=paired PERF_OUTPUT=convolution-candidate.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

The first command writes `ceiling/convolution-parity.json` before asserting exact
cross-kernel equality. It currently **exits 1**: Chromium/WebKit each cover 64
composition cases and 40 isolated single/two-pass blur cases; composition differs
by up to 3/255 in this matrix. The zero-difference gate has not been relaxed.
It also scans a black/white RGBA8 input into an RGBA32F output when float targets
are supported, isolating LINEAR sampler precision from final RGBA8 quantization.

The second command is diagnostic timing, not approval of the failed candidate.
For `paired`, benchmark full-region parity uses the **same selected kernel** on both sides;
its zero difference validates cache/region correctness, not cross-kernel equality.
Omit `PERF_CONVOLUTION` or set it to `reference` for the original shader.

Three fresh-process alternating WebKit pairs at 880 × 460 CSS px, DPR2, sigma15.3,
eight moving layers measured reference callback P95 27/29/28 ms versus paired
18/18/18 ms, with matching actual-arrival quantiles and the same 55.93 MiB explicit
texture capacity. This is not pure GPU time, physical memory, presented FPS or
long-session validation. Final data uses `convolution-symmetric-r*.json`; older
`convolution-r*.json` files measured a superseded asymmetric candidate with up to
7/255 composition differences. See the research note for evidence and limits.

## Adjacent-output reuse without interpolation

The explicit `"reused"` constructor/benchmark option computes four neighboring
outputs per fragment with `texelFetch`, four ordered accumulators and rolling
weights. Four compact RGBA8 MRT attachments share scratch storage between axes;
an extra unpack pass writes each axis into its normal full-resolution target.
This preserves the original support, weights, per-output accumulation order and
RGBA8 inter-pass boundary without relying on filtered samples. It is an opt-in
experiment, not a published renderer or a new UI default.

```sh
CONVOLUTION=reused node experiments/scene-owned-glass/convolution-test.mjs
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_MOTION=all PERF_FRAMES=600 PERF_RUNS=1 PERF_FOREGROUND=1 PERF_TIMELINE=1 PERF_CONVOLUTION=reused PERF_OUTPUT=reused-candidate.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

Cross-kernel equality passes on this machine: Chromium/WebKit each have 64 layered
and 320 isolated cases, including odd/even and narrow textures, translucent color
noise, offset clipping and both axes. The second command also compares six moving
frames against the **original kernel in full-region mode**, not the reused kernel.
Neither check proves universal bitwise equivalence on other drivers or formats.

Three new alternating WebKit pairs at the same eight-layer fixture measured
original callback P95 18/18/18 ms versus reused 27/28/23 ms; separate render plus
readback P50 was 13/13/13 versus 16/16/16 ms. Draws increased 29→45 and explicit
texture capacity 55.93→62.10 MiB. This route is **not adopted**. Do not compare it
against the older, slower baseline to manufacture an improvement. The reason for
the faster new baseline and the split of unpack/register/driver costs remain open.
No five-minute validation, physical memory, power or pure GPU timing was performed.

Benchmark viewport accounting now includes packed dispatch dimensions;
`blurPixels` counts blur viewport/scissor positions (including discarded atlas
padding), not four MRT outputs or actual texel traffic. `copyPixels` includes
unpack writes; `repackPixels` identifies that subset. Reference data is unchanged
by these accounting definitions at its full-size viewport. Evidence is
`ceiling/reused-r{0,1,2}-{reference,reused}.json`, `reused-analysis.json` and
`convolution-reused-parity.json` under the thread's local artifacts directory.

## Consume the packed intermediate directly

The opt-in `"direct"` composition kernel keeps the horizontal four-output reuse,
writes its RGBA8 results into four layers of a NEAREST `TEXTURE_2D_ARRAY`, and
lets the vertical convolution fetch those layers directly into the normal target.
There are two convolution draws per layer and **no unpack draws**. Vertical outputs
are accumulated individually, so this trades vertical sample reuse for simpler
presentation and no unpack writeback. Gaussian support, weights, accumulation
order, full resolution and the RGBA8 boundary remain unchanged. Ordinary,
non-composition rendering deliberately uses the reference path and its uniforms.

```sh
CONVOLUTION=direct node experiments/scene-owned-glass/convolution-test.mjs
ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_WORK=bounded PERF_MOTION=all PERF_FRAMES=600 PERF_RUNS=1 PERF_FOREGROUND=1 PERF_TIMELINE=1 PERF_CONVOLUTION=direct PERF_OUTPUT=direct-candidate.json node experiments/scene-owned-glass/ceiling-benchmark.mjs
```

Chromium/WebKit each pass 64 layered, four composition-exit and 160 isolated
two-pass cases with exact pixels. A separate photo sequence covers source and
background changes, cache/region changes and composition exit/reentry. The benchmark
still compares six moving frames against the original full-region kernel.

Three fresh-process WebKit rounds, with rotated reference/reused/direct ordering,
measure reference and direct callback P95 **18/18/18 ms** for both. Separate
render plus readback P50 is reference **13/13/13 ms**, reused **17/16/16 ms**,
direct **12/12/12 ms**. A final 600-frame pair after the composition-exit boundary
change ties at **13 ms** for both; the small completion gain did not persist.
Direct removes the reused path's 16 unpack draws and
4,960,000 unpack output pixels per frame in the eight-moving-layer fixture.
At this stage explicit texture capacity stayed **62.10 MiB**, versus reference **55.93 MiB**;
the unused normal horizontal target had not yet been retired (see the next section). Array layers count
toward bytes even though they occupy one GL texture object. The new counter
tracks `texImage3D` allocations rather than omitting them from the ledger.

An earlier linear-atlas/four-sampler direct reader passed pixels but measured
WebKit P95 57 ms in a 60-frame screen. Only the array layout is retained. Addressing,
branching and storage changed together; this is not isolated attribution of that
regression. The final option is **not the default**: a small synchronous-completion
gain in only some runs does not establish better presented FPS, physical VRAM or power, and
no five-minute run was performed. Evidence: `direct-r{0,1,2}-*.json`,
`direct-analysis.json`, `convolution-direct-parity.json`, `direct-refresh.json`
and `direct-visual.json` in the same local evidence directory.

## Retire the unused ordinary horizontal target

Direct composition now omits the ordinary horizontal texture/FBO. Its pair entry
accepts the real source and final destination, without passing a nonexistent
ordinary intermediate. Leaving composition lazily allocates that target and
recomputes ordinary blur even if the background revision did not change;
reentering composition deletes it again. Ordinary rendering retains the reference
shader and sigma semantics. This trades a cold mode-switch allocation for lower
steady composition capacity; the warm timings below exclude that allocation.

At 880×460 CSS px and DPR2, direct capacity falls **65,120,000→58,643,200 bytes**
(62.10→55.93 MiB, **9.95%**), matching the reference. Texture/FBO counts fall
10/8→9/7; direct still has six programs versus the reference's four. These are
explicit RGBA8 capacities, not physical VRAM residency. Array padding can add up
to three columns at other widths; capacity equality is specific to this fixture.
Ordinary mode temporarily needs both intermediates until composition reentry.

Three fresh-process WebKit pairs, 600 frames each, rotate reference/direct order.
Both measure callback and arrival P95/P99 **18/18 ms** in every round. Separate
render plus readback P50 is reference **12/13/13 ms**, direct **12/12/12 ms**.
Two before-retirement direct controls measured **12/13 ms**, so this does not
establish that retiring the texture improves speed. All paths still use 29 draws
per eight-moving-layer frame. One Chromium pair has arrival P95 **12.5/11.2 ms**,
but synchronous P50 **12.4/12.7 ms**; do not claim a universal completion speedup.

Chromium/WebKit each pass 64 layered, eight composition-exit (including unchanged
revision) and 160 isolated two-pass exact-pixel checks. The resource regression
first failed with eight textures/FBOs instead of seven, then passed initialization,
three mode-switch cycles, reentry and zero-live-object disposal. Each engine's
17-step photo/paint/geometry/invalidation sequence matches the original full-region
kernel exactly. WebKit DPR2 overlap/text/boundary screenshots match the reference
PNG hashes, including context restoration and three remounts. Existing refracted
text ghosting remains; this is not readability acceptance.

The default ceiling regression, reused-kernel matrix, typecheck, oxlint, oxfmt,
Node syntax and all nine workspace test tasks pass. Top-only and DPR1/small-blur
controls also pass; top-only remains three draws with zero blur/upload/unpack.
No five-minute session, physical-memory/power measurement or production gate was
run. The default remains reference; all work is local, uncommitted and unpushed.
Evidence: `retire-before-{0,1}.json`, `retire-r{0,1,2}-{reference,direct}.json`,
`retire-chromium-{reference,direct}.json`, `retire-{top,one-low,validation,analysis}.json`
and `retire-{reference,direct}-{overlap,text,boundary}.png` in the local ceiling
evidence directory. Reuse the commands above to reproduce the current direct path.

## Local TabBar text refraction comparison

`/text-refraction.html` compares legacy SVG text optics, a bounded WebGL2 reader
and unfiltered DOM glyphs. This is not a production TabBar replacement. Native
navigation, the selected lens and outer material are outside this probe.

The GPU input retains the actual device-pixel size, with no blur, mipmaps or
downsampling. Continuous sampling replaces SVG displacement stepping. Spectral
channels retain premultiplied ink coverage rather than averaging their alpha.
The legacy strength remains 0.3 in the review panel; GPU strength is deliberately
0.08 so a lifted lens does not destroy a small navigation label. Legacy pixels
are a comparison, not a correctness target. A mild local bend remains intentional.

```sh
node experiments/scene-owned-glass/text-refraction-test.mjs
node experiments/scene-owned-glass/text-refraction-benchmark.mjs
```

The first command captures the real docs Home item's DOM, SVG icon and embedded
fonts, then replays that owned input. It requires the existing docs dev service
at port 4311 (`DOCS_URL` overrides it). It covers 72 image cases across Chromium
(explicit ANGLE Metal) and WebKit, light/dark, DPR1/2, thin Latin/CJK and the actual
item. Every matrix cell produces 24 different optical pixel hashes from 24
fractional positions, with valid premultiplied output. Context loss/restoration,
unavailable WebGL2 and 390px layout are checked separately. Glyph detail is an
edge-energy smoke check, not a perceptual or typography proof; a 0.5px blur
negative control fails it. Embedded-font replay has rasterization differences
from native DOM, including a baseline difference at WebKit DPR2. This is not
bit-identical text rendering. Inspect the screenshots as well as the numbers.

The second command reuses that captured Home fixture, equalizes displacement
amplitude, hides the inactive panel and alternates SVG/GPU in eight blocks per
DPR. Each block warms for 30 callbacks and samples 120. In the final headless
WebKit run, both paths have 17ms callback P50 and approximately 18ms P95 at DPR1/2.
**This does not establish a speedup for this small cached-input case.** These are
callback intervals, not GPU execution, present time, physical Safari or power.
Submission-clock resolution is 1ms here; zero readings do not mean zero cost.
Combined fixture preparation was 88/94ms, not GPU-only cold startup.

The renderer retains two RGBA8 textures: 104,544 bytes at DPR1 and 418,176 at DPR2,
plus browser Canvas presentation storage (not physical VRAM totals). Each GPU
optical update uses one draw. Across 600 updates per DPR there are no new image
uploads; disposal releases both explicitly tracked textures. Live DOM mutations,
font/theme/size invalidation, arbitrary global pixel phase, interruption and
integration with the real TabBar still need production-specific verification.
Evidence lives in `.amp/in/artifacts/tab-bar-text/{quality.json,performance-webkit.json}`.

## Licensing

This fixture imports retained MIT/LGPL optical work and includes an experimental
Gaussian pairing and adjacent-output reuse probe. Preserve [`packages/glass/shaders/NOTICE.md`](../../packages/glass/shaders/NOTICE.md),
the accompanying license and [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md)
when redistributing derived renderer/shader output. This experiment is not an npm
package or a production deployment.

The photograph reuses `apps/docs/public/assets/demo/photos/0.jpg` (1600 × 1067),
already in this repository. Its Unsplash source and license record are in the
[photo asset README](../../apps/docs/public/assets/demo/photos/README.md). No new
external asset, runtime CDN request or dependency was introduced. The image is
decoded once per page and uploaded once per new scene context; those initialization
costs occur before the warm measurement window and recur after context restoration.
