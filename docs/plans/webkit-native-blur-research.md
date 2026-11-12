# WebKit native frosted material research

Research date: 2026-11-12. Primary-source review with a bounded local WebKit
experiment appended below. No native Safari, physical-device or production
acceptance is claimed.

## Recommendation

Evaluate a true CSS `backdrop-filter` frosted material for WebKit with one
bounded A/B on the homepage bottom-right Glass Toggle. Keep the current
implementation as the baseline. Treat this as a material-rendering change:
preserve Base UI state, events, focus, keyboard operation, hit targets and
motion semantics. A simpler material is worth considering if it gives timely,
readable feedback, even when it gives up refraction. No source evidence alone
establishes that it will fix the reported state-change problem.

Here, “native” means browser-managed CSS backdrop filtering. It does not mean
UIKit/AppKit Liquid Glass or a promise of identical platform rendering.

## What upstream actually does

Reviewed `onlymoein/liquidglass` at
[`cf8804252dd092a399e50eebfa23b0d97de745d1`](https://github.com/onlymoein/liquidglass/tree/cf8804252dd092a399e50eebfa23b0d97de745d1).
Its Safari behavior has two materially different paths:

| Condition | Rendering path |
| --- | --- |
| No eligible marked source, or selection mode | Native CSS backdrop blur/tone plus a fitted rim; no live SVG displacement. |
| Eligible `data-liquidglass-backdrop` source | Copied DOM with CSS `filter` blur/tone in a sibling layer. Safari still pays for copying and synchronization, although its SVG refraction is disabled. |

The decisive source locations are:

- [`refraction.ts:349–353`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/internal/refraction.ts#L349-L353): the library's UA-based branches select live SVG filtering for Chromium and disable SVG filtering of the copy for AppleWebKit. These are library assumptions, not a comprehensive browser capability test.
- [`refraction.ts:720–732`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/internal/refraction.ts#L720-L732): `useRefraction` chooses the no-source fallback or `copyBackdrop`.
- [`refraction.ts:488–508`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/internal/refraction.ts#L488-L508): deep clone with computed styles copied inline.
- [`refraction.ts:547–561`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/internal/refraction.ts#L547-L561), [`651–695`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/internal/refraction.ts#L651-L695): CSS filtering, mutation/resize/scroll observation and a continuous animation-frame synchronization loop.
- [`base.css:188–199`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/styles/base.css#L188-L199), [`237–251`](https://github.com/onlymoein/liquidglass/blob/cf8804252dd092a399e50eebfa23b0d97de745d1/src/styles/base.css#L237-L251): native backdrop filtering on the glass is explicitly disabled when the copy is active.

Consequently, “upstream has no Safari refraction” does not imply “upstream never
copies the DOM in Safari.” Copying upstream wholesale would not necessarily
produce the proposed pure native-backdrop candidate.

## Visual and cost tradeoffs

Native backdrop filtering retains live frost, saturation/tone adjustments,
translucent fill and CSS borders/shadows. It can retain a decorative rim. It
does not supply the displaced or magnified backdrop that defines a refracting
lens. Preserve contrast and selected/pressed-state distinction independently
of that optical detail. Masking, stacking and overlapping surfaces still need
rendered checks.

WebKit explains that browser-managed backdrop filtering can use hardware
support, while requiring extra rendering passes. It also describes why manual
background copies need alignment work as layouts change. This supports the
hypothesis that removing application-managed copies may help; it does not
prove that native filtering is cheap for this scene. Filtered area, radius,
overlap, clipping and backdrop changes are variables to hold constant or
record during the comparison. [WebKit: Introducing Backdrop Filters](https://webkit.org/blog/3632/introducing-backdrop-filters/)

Safari 18 removed the need for the prefix and included interoperability fixes.
Syntax support is separate from performance or visual acceptance.
[WebKit: Safari 18.0, Backdrop Filter](https://webkit.org/blog/15865/webkit-features-in-safari-18-0/#backdrop-filter)

## Relevant engine reports and their limits

- [WebKit bug 315118](https://bugs.webkit.org/show_bug.cgi?id=315118) is **RESOLVED FIXED**. The engineer's diagnosis links very large blur deviation (200px) and page-color sampling snapshots to slow first paint; the fix landed at `313563@main`. [Bug 316769](https://bugs.webkit.org/show_bug.cgi?id=316769), despite its broad title about all CSS blurs, is **RESOLVED DUPLICATE** of that issue. Its engineer comments narrow the mechanism and confirm the fix. This is evidence against assuming blur is free, not evidence that ordinary small-radius backdrop blur currently freezes every Safari build.
- [Bug 323948](https://bugs.webkit.org/show_bug.cgi?id=323948) concerns large-radius **foreground `filter: blur()`**, with a reporter observing a device-only stall absent in Playwright WebKit. It is **RESOLVED CONFIGURATION CHANGED**; a WebKit engineer reports current iOS versions passing. It neither reproduces Lenso's toggle problem nor establishes a current general backdrop-filter defect.
- [Safari Technology Preview 252](https://webkit.org/blog/18304/release-notes-for-safari-technology-preview-252/) records a fix for backdrop filtering clipping to rounded rectangles instead of `corner-shape`. This makes corner/mask correctness a concrete acceptance concern. A Technology Preview fix does not establish the fix is present in every supported stable Safari version.
- [Bug 319479](https://bugs.webkit.org/show_bug.cgi?id=319479) is an open report about backdrop-filter affecting Safari chrome tint sampling. A WebKit contributor could not reproduce it on their macOS configuration. Treat it as an unconfirmed compatibility report, not a diagnosis of this page or a measured performance result.

## Bounded decision gate

Compare the unchanged baseline with exactly one native-backdrop candidate on
the same page, viewport, theme, hardware and recorded browser/OS version.
Capture complete off-to-on, on-to-off and mid-transition reversals, including
the first changed frame and settled state. Include one changing/scrolling
backdrop pass; record visible lag, frame pacing and stale/blank material as
separate outcomes. Check pointer and keyboard activation, focus visibility,
reduced motion and selected-state readability.

Confirm that the candidate actually stops the copied-backdrop capture and
synchronization work for that surface; merely hiding its output leaves the
main hypothesis untested. Prefer actual supported Safari for the user-facing
decision. Playwright WebKit can provide a useful repeatable regression check,
but the engine reports above show why it cannot stand in for device Safari.

Adopt only if the bounded comparison improves the reported transition and the
loss of optical detail is acceptable. If it does not, retain the baseline and
inspect the failing transition trace before trying another rendering strategy.
This note does not identify which current Lenso renderer or transition owns
the reported defect, and it establishes no speed ratio or broad Safari rollout
decision.

## Local homepage Toggle evidence

A subsequent bounded experiment on the actual `/cn` page found that the
favorite Toggle itself already uses native CSS blur15.3px with tone and a
second luminosity paint, without an SVG backdrop URL or its own copied source.
The state change nevertheless invokes background `copyOf`30 times elsewhere
in the scene.

Two fresh pages per arm, rotated order, off→on and on→off each, WebKit27.2
via Playwright1.64.1, viewport1440×926/DPR3. A route-only candidate returns
null from automatic `findBackdrop` and leaves component interaction/motion
source unchanged. It removes these automatic copied backgrounds while
retaining native paints and rims; it does not disable explicit owned snapshots
or every foreground/Fusion optical path.

| Metric across four changes per arm | Current | Native candidate |
| --- | --- | --- |
| `copyOf` invocations per change | 30 | 0 |
| Synchronous time inside `copyOf` | 662–680ms | 0ms |
| Maximum observed rAF gap | 833–1246ms | 21–37ms |

These measurements identify a strong scene-specific benefit, not a steady
FPS ratio or a physical-iPhone result. The candidate was injected only in
the experimental browser; no production default was changed. Source-copy
refraction/calibration can visibly differ. The earlier428px mobile probe
failed to find a visible favorite button, so no mobile result is asserted.
Full scripts, counters, per-action data and screenshots are in
[Round87 evidence](/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-select-round87-webkit-native-blur/REPORT.md).

The decision is now better grounded: evaluate native frosted material as
WebKit's ordinary default, while preserving state, motion, focus and
legibility. In parallel, an independently proven scheduler fix may avoid
reconstructing unrelated content and retain more optics. Changing only the
Toggle's blur declaration cannot remove the measured copied-background work.
