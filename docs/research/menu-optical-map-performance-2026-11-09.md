# Menu optical-map and animation mechanism performance

Date: 2026-11-09. Local implementation and bounded cross-browser experiments. This does not establish comprehensive frame-presentation, release or device acceptance.

## Implemented changes

- Control-lens input geometry now honors the existing `--lg-map-radius`, as backdrop optics already do. Menu shells counter-scale their visible corners during morphing; those animated CSS corners must not become a new optical input radius when the ink lens reactivates. The old path could generate three PNG maps on dismissal, even after warming the cache. The fix also removes dependence of the refraction map on the first closing frame's timing. Transient refraction can therefore differ intentionally from the old, incorrectly fitted map.
- Lens-map generation computes horizontal and vertical terms once per column/row rather than once per pixel. Sampling density and optical formulas remain unchanged. All four output maps matched byte-for-byte for six representative shapes/options in each tested browser, including fractional geometry, DPR 2, dome/splay endpoints and clamped radii. The standalone kernel medians were 46.35 → 45.95ms in Chromium and 50 → 45ms in WebKit for a 250×524 input at density 2; the Chromium difference is too small to claim a meaningful speedup by itself.
- Menu, Select and cascading submenus suspend their ink lens while item opacity is zero and restore it with current geometry when visible again. Closing items reach zero opacity at roughly 67ms, well before the contour finishes returning. Hidden frames no longer update the ink SVG graph or its blur. Other active lenses sharing the content retain their filter reference.

Base UI retains selection, placement, keyboard, focus, interruption and dismissal ownership. The motion curves and glass sampling precision were not reduced.

## Final frozen-build comparison

Apple M2 Pro, macOS 27.2; Playwright Chromium 156.0.8078.4 and WebKit 27.2. Viewport 1440×1000, browser DPR 1. Five alternating-order trials per variant and case, after two warmup cycles. Each final trial opens once and closes once, waiting 650ms per phase. Results below are medians in milliseconds; PNG is encoding-call count per trial.

The before/after package snapshots differ only in `control-lens.ts`, `menu-ink.ts`, `menu.ts` and `submenu-cascade.ts`. Both final fixtures were built from the same harness. Standalone production fixtures isolate this work from concurrent documentation/source changes.

| Engine   | Case   | Main-thread task ms    | Script ms            | Process CPU ms          | CPU min–max before / after | PNG calls |
| -------- | ------ | ---------------------- | -------------------- | ----------------------- | -------------------------- | --------- |
| chromium | text   | 149.2 → 109.3 (-26.7%) | 62.8 → 34.0 (-45.8%) | 1140.0 → 1160.0 (+1.8%) | 1130–1200 / 1130–1170      | 3 → 0     |
| chromium | icon   | 152.7 → 119.7 (-21.6%) | 64.1 → 34.2 (-46.6%) | 1150.0 → 1130.0 (-1.7%) | 1070–1450 / 1080–1380      | 3 → 0     |
| chromium | select | 130.8 → 103.2 (-21.1%) | 59.3 → 36.3 (-38.8%) | 960.0 → 920.0 (-4.2%)   | 830–1000 / 860–990         | 3 → 0     |
| webkit   | text   | not available          | not available        | 780.0 → 780.0 (+0.0%)   | 740–850 / 750–950          | 0 → 0     |
| webkit   | icon   | not available          | not available        | 850.0 → 860.0 (+1.2%)   | 770–870 / 770–960          | 3 → 0     |
| webkit   | select | not available          | not available        | 910.0 → 760.0 (-16.5%)  | 880–1010 / 690–870         | 3 → 0     |

Chromium main-thread task/script savings are clearer than its total CPU result. WebKit's Select case improved in this batch; text and icon CPU results do not establish a consistent gain. These measurements do **not** satisfy a broad claim of large gains across both engines or all Menu/Select cases.

CPU means accumulated process CPU time, not GPU execution time, power or total system load. Chromium includes the launched browser process tree. macOS hosts WebKit GPU/WebContent/Networking as XPC services outside that tree: the final WebKit run used an unchanged, isolated copy of the installed browser bundle so the collector could attribute its XPC processes by executable path. A process-ownership guard rejects ambiguous ownership. Original and copied executable hashes and process IDs are retained in the evidence.

The rAF interval arrays measure callback cadence, including waits inside the trial. They are not presented-frame counts, and no rendered-FPS improvement is claimed. Small sample sizes, background system activity and timing variation limit generalization.

## CSS versus WAAPI versus rAF experiment

A separate mechanism experiment animates the actual highlight plate over a settled glass Menu: identical 100ms linear legs, six alternating legs, 750ms observation, five alternating-order trials after warmup. It isolates animation scheduling, not the complete morph, spring interruption or gesture behavior. No Motion or GSAP package was installed or benchmarked.

| Engine   | Mechanism | Median process CPU ms | Min–max ms |
| -------- | --------- | --------------------- | ---------- |
| chromium | css       | 420                   | 390–440    |
| chromium | waapi     | 400                   | 390–450    |
| chromium | raf       | 490                   | 410–490    |
| webkit   | css       | 100                   | 60–100     |
| webkit   | waapi     | 90                    | 70–110     |
| webkit   | raf       | 140                   | 70–180     |

CSS and native WAAPI ranges overlap; this experiment does not justify replacing the existing native highlight transition. Per-frame rAF style updates were more costly at the median, but this small test is not a universal engine ranking. Native WAAPI remains a candidate where its dynamic control removes real work. A WAAPI-backed library must still demonstrate its own control/maintenance benefit and full-morph synchronization correctness.

## Retained SVG-filter reference experiment

An isolated candidate stopped changing WebKit filter IDs on parameter updates. At DPR 2, forty paired screenshots across both engines (twenty per engine), light/dark ink, zero/nonzero dispersion and five placements/strengths matched exactly. This establishes only the tested current-build repaint behavior. Older supported WebKit versions and full interaction behavior were not established, so this change was **not** applied to production source. Its attempted CPU comparison was rejected by the ownership guard when another WebKit instance appeared; no performance conclusion is drawn from it.

## Verification and evidence

The added regressions catch distinct failures: output-map byte changes that neutral-axis checks miss; PNG regeneration when shell corners animate despite fixed optical input; and hidden-ink graph mutations plus failure to resume after interruption. Formatting, lint, glass/UI/testing typechecks and affected regression results are recorded alongside the raw runs.

Final browser and build outcomes are listed in the completion note below. The frozen integration checks cover desktop/narrow selection, focus restoration, early close, reduced motion and GPU-buffer release; separate reentry checks reopen during return. Real installed Safari, iPhone, representative high-load scenes, native presented-frame traces and comprehensive production acceptance remain outside this round.

Authoritative performance files are `final2-chromium.json` and `final2-webkit.json`. Earlier batches are diagnostic/staged results, not additional samples of the final implementation. In particular, WebKit `cpuMs` in the first `benchmark.json` omitted XPC services and is invalid for total CPU comparisons.

The implementation follows the distinctions in [the source review](animation-engine-source-notes-2026-11-09.md): animation scheduling, style invalidation, rendering and compositing require separate evidence. The next broad optimization should target measured rendering/invalidations under representative load rather than assume an engine replacement solves them.

### Completion note

- Passed format/lint on affected files; glass typecheck (83 files), UI typecheck (270 files) and testing typecheck (143 files).
- Passed 36 glass unit tests, 36 glass DOM tests and 20 Menu/submenu regressions. Added tests verify byte output, fixed-radius cache reuse and hidden-ink suspension/resumption.
- Passed glass and UI distribution builds. An initial UI declaration build could not resolve two unrelated style declarations; the later retry passed with those existing outputs present, without changes to the owning components.
- Passed all 20 final frozen browser interaction cases and 8 in-flight reentry cases. These exercise Chromium/WebKit at desktop and narrow widths, actual narrow-screen trigger taps, keyboard selection, focus return, early closing, reduced motion and buffer release.
- Passed current source-preview checks in Chromium and WebKit at DPR 2, including opening, closing and restored source/focus. The first source check was interrupted by navigation; waiting for the page and network readiness resolved it. Opening/closing screenshots were retained, and closing contours were inspected. These real-clock captures are not synchronized for cross-engine pixel comparison.
- The four changed production files match the final frozen candidate byte-for-byte. No installed Safari/iPhone, comprehensive high-load benchmark or presented-frame trace was run.

Local evidence: `/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-optical-map-performance/`. It includes frozen sources/builds, source and runtime hashes, benchmark scripts/raw results, screenshots and verification logs. The isolated browser clone is excluded; metadata records hashes against the unchanged installed binaries.
