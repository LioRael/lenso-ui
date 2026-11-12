> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# NavigationBar for Exact Web

NavigationBar composes the existing Toolbar native root, focus controller, groups
and action buttons. It reuses shared NavigationBar/Toolbar/material recipes and
the source title-collapse and scroll-edge calculations. Both primitive packages
and the pinned Exact SDK remain unchanged.

`NavigationBarState(toolbar, title, large, level, edge, scrollport)` is explicit.
The toolbar must be horizontal. `level` is 1–6; `edge` is uniform/soft/none.
Use a scrollport element id or an empty string to infer the nearest vertical
scroll container, falling back to document scrolling. Standard Toolbar disabled,
direction, loopFocus, attached and elastic settings retain their ownership.

Compose NavigationBarLeading, NavigationBarTitle(state) and NavigationBarTrailing
inside NavigationBar(state). Add ordinary Toolbar groups/buttons/links to either
side. NavigationBarBack(state, label, disabled, press) provides the source back
chevron and native Toolbar action. Its chevron follows the toolbar direction.
The root owns a generated large heading immediately after the bar when large is
true; the centered duplicate title is aria-hidden. Without a large title, the
centered title is the accessible heading. Heading levels use native ARIA heading
semantics under the unchanged SDK.

The bar stays sticky within its scroll container. Large-title collapse uses the
source threshold (heading bottom minus 12px at the bar bottom); the small title
fades with the shared 200ms transition, disabled by Reduced Motion. Scroll edges
fade over at most 24px, clamp overscroll and remain absent for nonoverflowing
content. Uniform edge and progressive soft bands use the source shared recipes.
The soft bands preserve the original raised-cosine masks and composited variance
model; they are a bounded blur approximation rather than one varying Gaussian.

Explicit Web lifetime owners bind the selected scroll target, resize/content
observers and pending frames, restore owned markers/styles and release resources
on removal. Native Toolbar retains keyboard and activation. This family remains
Partial until browser, layout, lifecycle, caller-style, motion/optical and native/
device acceptance is qualified; implementation alone is not full acceptance.

## Verification

Chromium 156 and WebKit 27.2 pass the compiled consumer: source collapse threshold,
sticky placement, edge progress, large/small heading semantics, title replacement,
explicit/inferred/native target rebinding, keyboard/Home/RTL, disabled activation,
Reduced Motion, sampled opacity transition, attached state, edge replacement and
whole-root cleanup/remount. Replaced edge styles restore immediately instead of
retaining disconnected nodes until the navigation bar ends. Both engines pass a
native mobile-browser Back tap, followed by a programmatic scroll check; this is
not a claim of native touch scrolling or a physical device test.

Twenty-four scrolled captures cover two engines, light/dark, 390/820px and all
three edge settings, with bar height, sticky alignment and edge visibility
assertions. Two blocked-hatch captures verify initial 60px geometry, 34px large
title, hidden duplicate title, heading semantics and inactive scroll edge;
activation is verified after initialization resumes. Representative narrow soft,
wide uniform and initial large-title captures were inspected. Material/motion
matching remains unqualified; transparent WebKit paint is not evidence of optical
parity with Chromium.

Both engines pass the complete existing Toolbar regression with the shared native
root delegation. The focused suite passes 79 tests / 333 assertions; typechecking
covers 139 files. Affected lint/format and the full stock consumer build pass,
with the six existing SDK warnings. Receipts:
`.cache/acceptance/navigation-bar-lifetime/` and `navigation-bar-initial/`.

The family remains Partial for document-scroll acceptance, arbitrary caller/native/
ref/render/callback APIs, the complete level/leading/trailing/disabled/style and
material preference matrix, source optical/per-frame parity and physical/native
platform coverage. Static heading semantics and resumed interaction checks do not
qualify pre-hatch roving focus or scroll-bound behavior. No performance improvement,
full catalog completion, landing or publication is claimed.
