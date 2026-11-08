# Native Menu feedback: measured performance and boundaries

Date: 2026-11-09. This round implements native playback for elastic Menu press and drag-return feedback. It does not migrate the opening/closing optical morph. Select explicitly disables elastic feedback and keeps that behavior. No dependencies were added and no release is claimed.

## Decision and implementation

The existing feedback drove inherited CSS variables from a shared JavaScript frame loop. Eligible Menu cards now receive explicit `scale` and `translate` WAAPI keyframes for the complete popup, including its contents and material. The existing analytical spring solver is shared through the additive `advanceSpring` export. Retargeting samples position and velocity at one wall-clock instant; it does not restart from rest or reverse an unrelated timeline.

Keyframes sample the analytical curve at 120 samples per second. This is a sampling interval, not a measured display rate. The default DocumentTimeline shares the `performance.now()` origin, while its frame-sampled `currentTime` can be stale after a long task. Playback therefore uses the same wall-clock time as the spring sample and backwards fill. Final inline values own the resting pose; completed effects and temporary promotion hints are released.

Authored inline transforms, nonidentity computed transforms, copied optical inputs and stationary controls retain the existing backend. A copy attached during playback transfers the same trajectory to JavaScript so the panel and its JS-positioned optical input stay together during a stall. Reduced motion and hidden documents settle playback. Cleanup recognizes CSSOM serialization (`0px 0px` becoming `0px`) and preserves subsequent caller writes.

The rationale and primary sources are in [the WAAPI load review](waapi-load-source-notes-2026-11-09.md), including [Chromium compositor eligibility](https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/renderer/core/animation/compositor_animations.cc), [WebKit acceleration checks](https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WebCore/animation/KeyframeEffect.cpp) and the [Web Animations specification](https://www.w3.org/TR/web-animations-1/). Source inspection guided experiments; actual runtime observations establish the results below.

## Three-way ablation

Environment: Apple M2 Pro, macOS 27.2, Chromium 156.0.8078.4 and Playwright WebKit 27.2, Node 26.10.0. Production fixture builds use frozen UI, token and glass sources. Each trial performs two real pointer gestures: press popup padding, drag outside, hold, release and settle. Five alternating-order trials per variant, case and engine give 90 trials. Native effects are asserted during warmup and no effects remain at rest.

- Before: inherited variables, shared JavaScript spring loop.
- Direct: same JavaScript spring loop writing individual CSS properties; experimental ablation only.
- Native: individual CSS properties with prepared WAAPI spring keyframes.

Chromium medians, milliseconds per two-gesture trial:

| Menu     | Main-thread task: before / direct / native | Process CPU: before / direct / native |
| -------- | ------------------------------------------ | ------------------------------------- |
| Icon     | 109.55 / 61.25 / 28.88                     | 1200 / 1210 / 1070                    |
| Text     | 110.29 / 59.85 / 29.40                     | 1240 / 1180 / 1100                    |
| Anchored | 102.45 / 55.70 / 28.46                     | 1210 / 1220 / 1090                    |

Native main-thread task time is about 72–74% below the original path; accumulated process CPU is about 10–11% lower. Removing variable indirection explains a substantial part of the task reduction, and native playback removes additional frame-loop work. These are gesture-window results, not whole-application speedups.

WebKit accumulated process CPU medians and observed ranges, milliseconds:

| Menu     | Before        | Direct JS     | Native        |
| -------- | ------------- | ------------- | ------------- |
| Icon     | 620 (420–660) | 450 (430–520) | 540 (480–610) |
| Text     | 580 (520–660) | 510 (460–530) | 570 (560–670) |
| Anchored | 610 (480–670) | 510 (480–520) | 580 (550–660) |

WebKit native CPU medians improve about 2–13%, with overlapping ranges. Direct JavaScript uses less CPU than WAAPI in this experiment. WAAPI is selected for independent playback under main-thread blockage, not for a claim of universal CPU superiority. WebKit has no corresponding CDP task-duration measurement here.

CPU includes owned browser, renderer and GPU-process CPU time, not GPU execution time or energy. WebKit XPC processes are attributed using a separate, unchanged copy of the installed browser bundle so unrelated browser runs cannot contaminate the sample. These five-sample comparisons are descriptive rather than statistical confidence bounds. The measured controller is retained as `native-measured.ts`; subsequent changes tighten initial ownership checks and fix CSSOM cleanup, without changing the analytical sampling or native playback algorithm. Final behavior checks use the corrected candidate; the 90-trial series was not repeated after those cleanup changes.

## Independent presentation under load

In the marker controls, both engines continue native transform, individual scale/translate and tested native `linear()` playback during a 600ms busy loop; the JavaScript marker remains fixed. Full Menu baseline/candidate captures likewise show the original feedback frozen while the native whole-popup feedback returns during the stall. The v2 full-Menu run asserts a held gesture and matching baseline/candidate geometry before release. The earlier v1 prototype had an argument-shape mistake and is excluded.

Evidence uses OS window captures of only the owned browser window. Playwright screenshots synchronize through the page and cannot independently prove progress while page JavaScript is blocked. Capture request start/end times must lie inside the stall; late captures are not evidence. A later overloaded 600ms final run exceeded its capture interval and is retained separately as `native-final-os-late-capture`, excluded from the stall conclusion.

The corrected final candidate also passes a separate 2000ms blocked-thread capture in both engines and both themes. Its single during-stall capture interval is checked explicitly; later captures provide the settled reference. This longer run avoids conflating screenshot latency with the earlier 600ms window.

A high-contrast striped background checks optical agreement rather than just a moving outline. In the dedicated patterned run, the returned interior matches the settled reference exactly in Chromium and within one channel value in WebKit. This establishes the tested whole-panel feedback case; it does not establish that resizing optical geometry can be detached from JavaScript.

No presented-frame-rate, input-latency, installed Safari or physical iPhone claim follows from these captures. Event handling still needs the main thread.

## Rendering experiments not adopted

Reusing the 2D rim destination backing store reduced 59 coalesced paint submissions from approximately 3 to 2.5ms in Chromium and 2 to 1ms in WebKit, with dimension writes falling from 118 to 4. Both engines passed 120 pixel/crop comparisons in total. However, these coalesced submissions do not measure per-frame presentation; a partial full-loop Chromium icon result increased main-thread task time, and the WebKit full-loop run was invalidated by process attribution. The added wrapper and reserved memory are not justified by this evidence.

Tightening the SVG output region matched all 32 Chromium paired captures, but WebKit showed channel differences up to 179. A primitive-coordinate correction still differed by up to 132. Neither filter-region change is adopted. A cheaper result that changes the material is not an accepted optimization.

## Verification

The corrected native controller has focused DOM regressions for wall-clock retargeting and velocity, optical-copy transfer, reduced motion, CSSOM cleanup, caller ownership and eligibility. The new cleanup regression catches an observed real-browser failure that existing DOM coverage missed.

Current source and test typechecks pass for UI (277 source files, 165 test files) and glass (84 files). Affected formatting and lint pass. Glass unit tests: 37 passing; glass DOM tests: 36 passing. The final Menu/submenu motion DOM selection passes 25 tests across seven files with 4,532 assertions, including the five corrected native-controller tests. These DOM tests do not verify layout.

Frozen production browser checks cover Menu and Select selection/focus/closing/reduced motion (20 cases), in-flight reopening (eight cases), and native Menu interruption/idle/opt-out/disposal on desktop and narrow viewports (12 cases). Actual source-preview checks assert native feedback playback, closing style cleanup and trigger restoration in both engines at DPR 2. This is targeted acceptance, not the complete repository landing gate.

## Evidence and next bottleneck

Raw 90-trial data, frozen sources/builds, scripts, logs and OS captures are archived under the local visualization directory linked in the delivery. Rejected experiments are retained separately from the native candidate. Temporary browser copies and the owned fixture server are removed after verification.

The next substantial shared bottleneck is opening/closing: changing dimensions, SVG optical geometry, canvas output and mask state still share a JavaScript timeline. Moving only its outer transform would split presentation during stalls. That requires a separate whole-material representation experiment and visual parity evidence; this round establishes a useful native backend without claiming that larger problem solved.
