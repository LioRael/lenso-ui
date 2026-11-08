# WAAPI under main-thread load: implementation and measurement notes

Research date: 2026-11-09. Primary-source reading and proposed experiments only. This document does not report a measured Lenso improvement. Production code and dependencies were not changed. Read together with [the earlier source review](animation-engine-source-notes-2026-11-09.md).

## Actionable conclusion

The promising change is handing a complete, independently presentable trajectory to the browser before the main thread becomes busy. Replacing existing native CSS motion with WAAPI does not establish that change. Replacing a per-frame JavaScript transform spring with prepared native transform keyframes can establish it, subject to the actual engine's acceleration eligibility.

For Lenso, first investigate feedback motion whose whole visible surface can move together. The full Menu morph is a harder candidate: its optical canvas, SVG ink and clipping must continue to agree with geometry during a stall. A smooth compositor transform with frozen optical geometry is a correctness failure even if the transform benchmark improves.

These are engineering inferences from the sources below and the implementation inventory in the earlier review, not browser guarantees.

## Browser implementation evidence

### Chromium: distinguish independent properties from variable indirection

Current Blink [compositor animation checks](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/animation/compositor_animations.cc) explicitly list `transform`, `translate`, `scale`, `rotate` and opacity as candidates. They also check incompatible animations, target eligibility and timing. Independent transform properties on SVG targets have an explicit rejection path; an HTML wrapper and SVG target are different experiments.

The custom-property branch permits only specific typed values associated with CSS Paint usage. It does not establish a general compositor path for animating `--x` consumed by ordinary `transform`. Reference backdrop filters are rejected, and clip-path has separate native paint-worklet conditions. Thus neither “all variables are impossible on the compositor” nor “registered variables are composited” is a sound blanket statement.

This is moving main-branch code, not proof of the installed Chromium revision. Record the binary version and use its trace rejection reason. For the first direct-transform experiment, use explicit numeric keyframe values, a stable transform origin and one owner per animated property.

### Chromium: a compositor can progress while the renderer main thread is busy

Chromium's [compositor architecture description](https://github.com/chromium/chromium/blob/main/docs/how_cc_works.md) describes separate main/implementation trees and explains that multithreaded compositing can handle animation while the other thread is busy. It also documents special synchronous test modes. Ordinary browser presentation and deterministic headless frame-driving modes therefore must not be silently combined in one result.

[Chrome DevTools frame documentation](https://developer.chrome.com/docs/devtools/performance/reference#frames) distinguishes normal, dropped and partially presented frames. Its partial-presentation example specifically contrasts late main-thread canvas work with timely compositor work. A global frame count can hide Lenso's surface/rim disagreement. Inspect both the frame classification and the component pixels.

### WebKit: sampled keyframes and `linear()` are separate candidates

WebKit's current [KeyframeEffect implementation](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/animation/KeyframeEffect.cpp), particularly `canBeAccelerated`, rejects reference filters, some size-dependent transforms and discrete transform intervals. The threaded-animation representation takes a distinct path. On the fallback Core Animation path, `steps()` and `linear()` with points are rejected; non-replace composition and compositing keyframes have additional restrictions.

That source suggests comparing explicit transform samples with ordinary `easing: 'linear'` against a two-endpoint effect using CSS `linear(...)`. They need not share acceleration behavior. Additive animation also deserves a separate test; it should not be assumed interchangeable with replace-mode keyframes.

This is architecture evidence from main, not a support table for Playwright WebKit or installed Safari. Keep the actual runtime result authoritative.

In [WebKit bug 312407](https://bugs.webkit.org/show_bug.cgi?id=312407), an engine maintainer said in April 2026 that released Safari's time-based `linear()` animations had the reported main-thread limitation, while the threaded feature in Technology Preview addressed it; scroll-driven support had shipped separately in 26.4. [The enablement tracker](https://bugs.webkit.org/show_bug.cgi?id=312015) records later reopenings and changes through July, plus a November duplicate. The April report cannot settle the November binary's behavior. Identify Playwright browser revision, OS and headed/headless mode rather than writing “Safari supports/does not support this.”

### Specification: control semantics are not spring velocity ownership

The [Web Animations specification](https://www.w3.org/TR/web-animations-1/) defines a time-based model, asynchronous readiness and playback control. It warns that directly changing `playbackRate` can jump for animations running on another thread and provides `updatePlaybackRate()` for synchronization. It does not promise that all animated properties execute outside the main thread, nor supply a physical spring solver.

For a precomputed spring, our implementation must still define velocity-preserving interruption. Reversing a timeline retraces its existing path; retargeting a spring from current position and velocity is a different contract. Evaluate the same analytical/sample trajectory at interruption time, create the new trajectory and replace atomically. Test cancellation, finish callbacks and disposal. Do not measure a position-only restart as equivalent to Lenso's existing velocity-preserving reversal.

## Why ordinary screenshots cannot establish progress inside a stall

The version-pinned [Playwright 1.56.1 screenshotter](https://raw.githubusercontent.com/microsoft/playwright/v1.56.1/packages/playwright-core/src/server/screenshotter.ts) runs in-page preparation and waits for fonts before taking a screenshot. Its WebKit synchronization path injects a style, reads geometry and removes the style. This precedes the early return for allowed animations and an unchanged caret. Consequently `animations: 'allow', caret: 'initial'` does not remove that WebKit synchronization. A requested capture may complete after the blocking task, even when the compositor moved throughout it. Inspect the installed package before applying this historical implementation detail to another version.

The corresponding [WebKit delegate](https://raw.githubusercontent.com/microsoft/playwright/v1.56.1/packages/playwright-core/src/server/webkit/wkPage.ts) enables stylesheet synchronization and invokes `Page.snapshotRect`. Current upstream [InspectorPageAgent](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/inspector/agents/InspectorPageAgent.cpp) implements a rectangle snapshot through the local frame's snapshot operation. Calling the raw inspector command bypasses Playwright preparation, but does not itself prove an independent view of already presented compositor pixels. Playwright's patched WebKit can differ from upstream. Validate request/response timing and returned pixels before using this method as an in-stall observer.

[Playwright's public screenshot API](https://playwright.dev/docs/api/class-page#page-screenshot) also documents that disabling animations finishes finite motion and resets infinite motion. Its screenshot assertion workflow waits for stable matching captures. Those modes are appropriate for endpoint comparisons, not motion-through-load evidence.

## Proposed experiment and acceptance evidence

These are proposed procedures. No numbers below are benchmark results.

1. **Validate the observer first.** Use a simple, long-running native direct-transform control beside an rAF-driven control with distinct colors. Allow native setup/readiness and a visible startup interval before a bounded 500 ms main-thread busy task. Obtain multiple independent observations strictly inside the task, not only a different endpoint after it. Measure external capture timestamps and task start/end boundaries. The long task is a diagnostic stressor, not a representative production workload by itself.
2. **For Chromium**, collect compositor/presentation and main-thread trace evidence together. A raw CDP surface screenshot or screencast is a candidate observation channel, not a guaranteed presentation timestamp. First prove that it yields intermediate control positions while the main thread is blocked. Do not replace wall-clock presentation with explicit synthetic `beginFrame` stepping and call it the same experiment.
3. **For macOS Playwright WebKit**, prefer an OS capture of the visible browser window when available. Preselect the window and crop before the measured interval so capture does not query page geometry. Continuous window video or timed window captures should show intermediate native positions while the rAF control freezes. Confirm capture cadence using the native control: a low-rate recorder can establish progress during a long stall, but cannot establish 60/120 Hz smoothness. If no independent observer is available, report compositor progress as unverified; callback cadence and endpoint screenshots cannot fill that gap.
4. **Separate controls from the real surface.** Compare (a) current rAF direct values, (b) native CSS equivalent, (c) WAAPI explicit transform samples and (d) WAAPI/CSS `linear(...)` spring encoding. Test direct `transform`, independent `translate`/`scale`, and inherited variable-fed transform separately. Keep the same sampled positions, timing, transform order, origin, layer hints and actual glass content. Use an HTML target before testing SVG-specific acceleration.
5. **Exercise interruptions.** Test normal settling, reversal, rapid repeated targets, disposal mid-flight, first interaction before resources warm, scrolling and resized anchors. Include targets during a busy interval: native ongoing playback may continue, but the input handler cannot retarget until the main thread handles the event. Report that input delay separately.
6. **Check full-surface synchronization.** Record bounds, rim, content clip and glass contour together. Add diagnostic colored boundaries if needed in an isolated fixture. If the compositor moves the panel while optical channels freeze, reject that split-clock implementation. A shared timestamp aligns resumed computations; it cannot execute blocked JavaScript, upload missing WebGL uniforms/textures or mutate SVG during the stall. Freezing/removing those channels is an ablation, not equivalent output.
7. **Measure realistic load after the stress control.** Use alternating warm trials with an observed docs workload, not just a busy loop. Report median and spread of stall-visible progress, missed/partial frames where available, main-thread style/layout/paint and scripting, setup/retarget cost, peak layer memory and input delay per engine. Lower idle scripting alone is insufficient evidence for a substantial user-visible gain. Define the failing interaction and meaningful improvement threshold before selecting a winner.

## Candidate ordering for Lenso

Start with one feedback translation/scale trajectory that can carry the complete already-rendered surface together. Confirm that its direct transform does not overwrite the Base UI positioning owner or the Menu morph transform. A wrapper can separate owners, but changes rendering/layer geometry and needs its own verification; additive composition should not be used as an untested escape hatch.

Keep the highlight's existing native CSS animation as a baseline, since changing its API syntax offers no demonstrated scheduling advantage. Leave the coupled Menu morph alone until a candidate preserves optical synchronization. If no visually equivalent full morph can remain independent during load, optimize its actual main-thread renderer work and geometry reads instead of promising that a library swap solves it.

The earlier @property microbenchmark remains useful for descendant invalidation, but [its author explicitly measures style invalidation/recalculation](https://web.dev/blog/at-property-performance). It does not measure actual compositor presentation or the cost of Lenso's optical renderer. Reducing inheritance and handing a complete trajectory to the compositor are separate hypotheses.

## Follow-up: promotion semantics and retargeting clocks

### Temporary `will-change: scale, translate` on the card ancestor

The [CSS Will Change draft](https://drafts.csswg.org/css-will-change/#will-change) requires stacking-context and absolute/fixed containing-block side effects immediately when the hinted property would create them. Promotion itself is a rendering hint, not a guaranteed layer allocation. The draft recommends selective use and removing hints when work ends; it also permits changed text antialiasing in preparation for motion.

[CSS Transforms 2](https://drafts.csswg.org/css-transforms-2/#individual-transforms) specifies that individual `scale`/`translate` values other than `none`, including identity values, create stacking contexts and containing blocks. Their composition order precedes the existing `transform` list and uses `transform-origin`.

**Application inference:** a temporary scale/translate hint can alter stacking and descendant positioning before feedback begins, then change them again during cleanup. Verify absolute SVG/canvas overlays, fixed descendants, overlapping popup content and removal at rest. If the card already establishes the relevant context through its morph transform, the additional semantic effect may be redundant; inspect actual computed styles instead of assuming that. Restoring scale to `1` is not semantically identical to removing it back to `none`. Preserve pre-existing inline values and hints on cleanup.

The [Filter Effects 2 draft's Backdrop Root definition](https://drafts.csswg.org/filter-effects-2/#BackdropRoot) explicitly excludes transforms, allowing a transformed ancestor's descendants to filter backgrounds outside that ancestor. `will-change` creates a Backdrop Root when it names a property that creates one, such as opacity or filter. A stacking context or GPU layer is therefore not automatically a Backdrop Root. The definition is work in progress, and its introduction notes lack of full Working Group consensus.

**Application inference:** scale/translate hints alone should not sever descendant backdrop sampling under that draft model. Adding `will-change: opacity`, `filter`, masks or clipping as a generic promotion trick can change it. A neutral background cannot expose backdrop-source differences: compare a patterned background at idle, during feedback and immediately after hint removal, including overlapping glass. Existing SVG reference filters still carry their own semantics. These sources provide no guarantee that promotion preserves all engine-specific rasterization, filter clipping or texture behavior; retain the actual Chromium/WebKit pixel checks.

### Default DocumentTimeline versus `performance.now()` after a long task

The [Web Animations default timeline definition](https://www.w3.org/TR/web-animations-1/#the-default-document-timeline) gives it zero origin-time offset. Its milliseconds roughly correspond to `performance.now()`, but `document.timeline.currentTime` stays unchanged between animation-update procedures. The animation's start time is expressed in its timeline's coordinates.

**Implementation inference for this candidate:** for a running, active, same-document default timeline at playback rate 1, capture one `now = performance.now()`, evaluate the old spring's position and velocity using `now - storedStart`, generate the replacement trajectory and assign its `startTime = now`. This avoids evaluating a resumed spring using the stale cached frame timestamp. `fill: 'backwards'` keeps the first replacement pose applicable while cached timeline time is temporarily earlier than that explicit start. This is a clock-mapping rationale, not proof of seamless presentation in a particular engine.

Use the same captured time for old-state evaluation and new start; do not reset startTime after expensive keyframe generation without advancing the state again. Clamp a settled trajectory to its final pose/zero velocity. Finite sampled keyframes approximate the analytic solver between samples, so verify actual interruption continuity at high-velocity and overshoot phases. Custom-origin DocumentTimelines require their origin offset; scroll timelines, paused/seeked animations, changed playback rates and another document's clock require separate handling. `animation.currentTime` and `getComputedStyle()` after a blocked interval are not substitutes for an independently observed presentation timestamp.
