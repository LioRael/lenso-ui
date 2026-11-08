# Animation engines and rendering cost: source notes

Research date: 2026-11-09. This is a literature review and experiment proposal, not a measured performance result for Lenso UI. No production implementation was changed for this research.

## Decision supported by the reading

There is no primary-source basis for promising a substantial Chromium **and** WebKit improvement from replacing CSS animations wholesale. The useful distinction is between animation scheduling, style/layout invalidation, painting/filter work, and compositing. A different scheduler can address one of these while leaving the others intact. Browser-native CSS and WAAPI are both candidates for compositor execution; JavaScript calling WAAPI is different from JavaScript updating styles on every `requestAnimationFrame`.

The strongest initial experiment is to hold the visual output constant, compare CSS/WAAPI/rAF scheduling, and independently remove custom-property indirection or expensive rendering work. These are separate comparisons. Otherwise a cheaper material can be mistaken for a faster engine.

## Browser implementation evidence

### 1. Chrome/web.dev: animate at the compositing stage

[How to create high-performance CSS animations](https://web.dev/articles/animations-guide), last updated 2020-10-06, recommends `transform` and `opacity`, checking the rendering stages in DevTools, and using `will-change` sparingly. Its blur discussion identifies blur/shadow work as potentially expensive painting. This is a rendering-pipeline recommendation, not evidence that CSS syntax is intrinsically faster than JavaScript syntax.

[Chrome's non-composited animation diagnostic](https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations) explains that Chrome records compositing failure reasons in traces. Use that evidence on the exact failing Lenso element. An animation being expressed as `transform` is a hypothesis about acceleration, not sufficient proof of its actual execution path.

**Caveat:** the guide is old; its deliberately conservative property shortlist must not be interpreted as an exhaustive current acceleration support table.

### 2. Chrome/web.dev: custom-property inheritance is a separate cost

Bramus's [Benchmarking the performance of CSS @property](https://web.dev/blog/at-property-performance), 2024-10-02, uses Blink's `PerfTestRunner` infrastructure. It measures style invalidation/recalculation, finding a meaningful benefit from `inherits: false` because updates no longer affect descendants. Registration has an upfront cost. At publication, registered and unregistered custom-property animations ran on the main thread.

**Implication:** compare per-element direct `transform` keyframes against animations of variables consumed by `transform`. Merely registering variables does not establish compositor eligibility. Do not disable inheritance on a public token that intentionally feeds descendants.

**Caveat:** these are style-invalidation microbenchmarks, not glass rendering or frame-presentation benchmarks. The article's main-thread statement is dated 2024 and links a Chromium issue; it is not proof of every installed 2026 browser's behavior.

### 3. WebKit: CSS and WAAPI share the animation model

Antoine Quint's [Web Animations in WebKit](https://webkit.org/blog/8343/web-animations-in-webkit/), 2018, explains that CSS transitions and animations are represented through Web Animations objects. WAAPI can avoid the forced style invalidation sometimes used to establish dynamic CSS transition start/end states, while giving playback controls to JavaScript.

**Implication:** WAAPI is a credible way to simplify dynamically controlled animation and avoid a particular setup read/flush. It does not imply that substituting `element.animate()` for an already composited CSS keyframe reduces every frame's rendering cost.

**Caveat:** this article introduces the implementation in Technology Preview 59. Read it for architecture, not a current feature-support table.

### 4. WebKit: glass still needs rendering passes

Brent Fulgham's [Introducing Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/), 2015-08-10, describes obtaining backdrop pixels, filtering them, and compositing the result. Hardware support can accelerate this, but the extra rendering passes have a performance cost.

**Implication:** moving an element with a cheap transform does not establish that its changing backdrop is cheap. Switching CSS to GSAP or WAAPI does not itself remove those passes. Measure the same moving background and overlapping glass surfaces in each candidate.

**Caveat:** the historical prefix guidance is obsolete for modern Safari. The architectural cost explanation is useful; exact cost and optimization behavior require current measurements.

### 5. Current WebKit releases supersede old limitation lists

[WebKit Features for Safari 26.4](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/), 2026-03-24, reports threaded scroll-driven animations, fixes for transform overlap calculations, and improved drop-shadow/blur rendering performance. This invalidates a blanket claim that current Safari scroll-driven animations must always remain on the main thread. It also shows why old filter benchmarks need rerunning.

[WebKit Features for Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/), 2026-09-17, includes fixes for SVG filter invalidation, drop-shadow repainting, and blur clipping. These are correctness changes with possible relevance to performance comparisons; they are not quantitative proof that Lenso's filters are fast.

The [threaded time-based animation enablement tracker](https://bugs.webkit.org/show_bug.cgi?id=312015) records multiple enablement attempts/reopenings and changes through July 2026, with further linked duplicates in November. Do not carry forward 2025 claims about Safari `linear()`, `steps()`, springs, or additive animation acceleration without checking the tested engine build and concrete animation.

**Scope:** Playwright WebKit, installed Safari, and device Safari must be identified separately. A WebKit main-branch fix does not prove deployment in a particular binary.

## Engine-author guidance and experiments

### 6. Motion: useful hypotheses, not independent comparative proof

Matt Perry's [The Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list), 2025-11-05, distinguishes compositor-driven animation from main-thread updates of compositor-friendly properties. It highlights blur radius, large layers, variable inheritance and offscreen work. It also acknowledges benchmarks where rAF/GSAP beats accelerated animation for thousands of small elements.

The author's tier labels and comparative examples come from an animation engine vendor. They are valuable experiment leads, not a standardized browser guarantee or a Lenso benchmark. In particular, broad claims about every custom-property update causing paint or every `filter` being compositor-only need qualification by property, effect, browser and trace.

[Motion's performance documentation](https://motion.dev/docs/performance) similarly recommends treating acceleration as progressive enhancement and warns that browser eligibility rules differ. Its support claims describe Motion's current implementation; pin the tested version before comparing it.

### 7. GSAP: shared timing and transform management do not erase render cost

[GSAP ticker documentation](https://gsap.com/docs/v3/GSAP/gsap.ticker/) says the global timeline updates through `requestAnimationFrame`. Its lag smoothing changes the animation clock's reaction to stalls and explicitly does not improve the real frame rate. Record this setting in a comparison so altered timing is not mistaken for higher throughput.

[GSAP CSS documentation](https://www.gsap.com/docs/v3/GSAP/CorePlugins/CSS/) describes transform caching and default `force3D: "auto"`, which temporarily uses 3D transforms to encourage a compositing layer. It also says browser rendering quality remains the browser's responsibility.

These are first-party manufacturer descriptions. A promoted layer is different from off-main-thread animation timing. Neither `force3D` nor a shared ticker proves elimination of main-thread stalls, SVG filter recalculation, canvas work, or backdrop rendering. Compare layer policy explicitly; do not let GSAP's default layer hint be a hidden variable.

### 8. Paul Irish: realistic rendering complexity changes the experiment

[Why moving elements with translate() is better than pos:abs top/left](https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/), 2012-12-20 with a 2016 update, presents the author's own Chrome trace/video experiments. A trivial scene can hide meaningful paint differences; complex content exposes them. It also documents visual differences from subpixel interpolation.

**Implication:** verify text, edges and clipping as well as timing when changing animation properties. An empty-square demonstration cannot stand in for a glass Menu, clipped surface, or dynamic SVG effect.

**Caveat:** the browser-specific numerical results are historical. Reproduce the methodology, not the old performance ranking.

## Current Lenso implementation and priority

Source inspection on the research date finds that the Menu/Select work is already substantially JavaScript-driven:

- `packages/ui/src/utils/interaction/menu-timeline.ts` uses rAF and preserves pose/velocity during reversal. `packages/glass/src/motion/spring.ts` shares one rAF chain across active springs. Replacing these with another shared JS ticker is not an architectural move off the main thread.
- `packages/ui/src/utils/interaction/menu.ts` measures anchor/positioner geometry while moving and updates transforms, border radius, content clipping, optical contours and SVG ink. These channels have different rendering costs; transferring the transform trajectory alone does not eliminate the rest.
- `packages/ui/src/utils/interaction/menu-feedback.ts` writes scale/translation through CSS variables. `packages/tokens/src/components/menu/menu.styles.ts` consumes these variables and retains a CSS transition for the highlight plate. The morph itself disables CSS transitions.

The first candidate should therefore be a small native-WAAPI experiment on an independently movable highlight or simple panel channel, compared against its existing CSS/rAF path. Then test direct element transforms versus variable-fed transforms, with traces establishing the actual invalidation/compositing difference. Motion is worth adding when its control or interruption behavior supplies a concrete benefit. GSAP is a useful comparison for shared scheduling and transform management, not the default replacement hypothesis.

For the full morph, moving the surface on the compositor while its optical contour remains updated by main-thread rAF introduces a synchronization risk: under main-thread load, the surface may advance while its rim or clipping freezes. A shared start timestamp alone does not solve this. The experiment must exercise stalls, reversal and retargeting and preserve matching geometry before a split-clock implementation is accepted. Whole-surface bitmap scaling is not an equivalent substitute for the current contour geometry.

In parallel, profile glass rendering with fixed and moving backgrounds, overlapping surfaces, cold and warm resources, and representative DPRs. Prioritize invalidation area, render-pass count, repeated measurements and canvas/texture transfers according to the trace. Removing visual effects is a diagnostic ablation, not an accepted performance optimization.

Previous Chromium CPU savings and WebKit visual/functional checks establish different things. This review does not establish quantitative WebKit improvement. The next decision requires separate performance evidence for each engine; Playwright WebKit does not substitute for installed Safari or device Safari acceptance.

Paul Lewis's [FLIP Your Animations](https://aerotwist.com/blog/flip-your-animations/) (2015, updated 2022) supports moving measurements and trajectory preparation out of the steady-state frame loop where geometry is stable. That is a strategy applicable across engines, not an instruction to freeze geometry that actually changes during scrolling, viewport changes or native popup positioning.

## Proposed controlled experiment

This is a proposed local benchmark, with no claimed outcome yet.

1. Choose one actual slow interaction and a reduced standalone reproduction. Preserve duration, easing/spring samples, interruption/reversal semantics, pixel geometry, background motion, glass radius, clipping and surface count. Record commit, exact browser/library versions, hardware, power mode, viewport, DPR and display refresh rate.
2. Compare four schedulers on direct `transform`/`opacity`: current implementation, native CSS, native WAAPI and a pinned GSAP version. Add Motion only if it exercises a distinct WAAPI path. Use identical precomputed samples/keyframes where possible; otherwise separately report differences in solver/timing. Avoid per-frame React state.
3. Run independent rendering ablations: direct transform versus variable-fed transform; fixed versus animated border radius/clip; fixed versus updated SVG filter attributes/canvas; existing glass versus the same scene with its filter temporarily disabled. Ablations diagnose cost; filter-disabled results cannot be accepted as equivalent visual output.
4. Use idle runs and a deterministic main-thread-load scenario. Include interruption and rapid retargeting because a precomputed WAAPI trajectory may be fast until live gesture ownership requires main-thread coordination. Verify native Base UI interaction behavior independently.
5. Run at least five alternating-order trials per browser after warmup. Report per-browser median and spread of presented-frame misses, frame-time tails, main-thread work, style/layout/paint, layer count/size and GPU/rendering evidence available in each inspector. Record setup and cleanup costs. Observe native browser traces and rendered output; rAF timestamps alone measure callback cadence and miss compositor-only presentation behavior.
6. Define success before implementation: for example, at least a 20% improvement in a chosen failing frame metric in **each** engine, beyond baseline spread, with no meaningful input-delay, memory, visual or semantic regression. This threshold is a proposed project criterion, not a browser standard. If one engine improves and the other regresses, the wholesale replacement hypothesis fails.

The expected decision is selective: retain compositor-friendly native animations where they work, use WAAPI where dynamic control avoids setup invalidation or enables browser scheduling, and retain a small shared rAF loop for live simulation or renderer attributes that require it. A new engine is justified only by measured savings or a concrete control/maintenance benefit, not by the CSS-versus-JavaScript label.
