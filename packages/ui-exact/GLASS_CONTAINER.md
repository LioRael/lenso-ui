# GlassContainer for Exact Web

GlassContainer uses the shared non-React Lenso fusion engine. Exact owns the
container, members, caller content and hidden decorative surface; the Web hatch
owns member registration, preferences and the engine lifecycle. It does not
replace member DOM or move caller content.

`GlassContainerState` declares id, spacing, disabled and tint. Spacing follows the
source normalization: non-finite values use 20, finite values clamp at zero.
Tint affects connecting material without rewriting members. Dynamic tint is
installed by the hatch; declarative caller styles can provide initial tint.
The root reserves its id with `-fusion` for its decorative surface.

`GlassContainerItem(id, elastic)` supplies the same small Glass presentation as Glass,
with caller content. Elastic is explicit (false matches the source default),
reuses the shared spring model and retains native editing ownership. Existing small Glass and GlassButton optical roots can also
join the nearest container. Native layout determines member positions; a
container neither arranges its children nor creates an application selection.
Disabled opts out of fusion while preserving caller control behavior. Disabled
and opaque containers form context barriers; nested containers own
their own members. The shared renderer handles geometry, material compatibility,
preference fallback and member restoration.

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass the compiled consumer,
5 affected style comparisons and blocked-hatch presentation. Both load the
packaged module worker from the nested consumer path and report GPU field
preparation. A separate no-worker run in each engine reports main-thread CPU
preparation and verifies opt-out plus native editing preservation. The packaged
non-React API's reachable JavaScript and worker assets are checked separately;
its reachable import graph contains no React runtime imports.

The main fixture covers disabled/zero/negative spacing, bridge tint and distant
separation, explicit opacity/contrast, emulated contrast and Reduced Motion,
member removal, nested-container barriers, hatch reapplication, foreign caller
classes/variables, elastic member feedback and press light. Native button actions,
input drafts and selections remain owned by Exact. Removal restores member
styles and releases decorative optics; remount retains the owner's draft.
Geometry checks cover both axes, LTR/RTL, light/dark and 390/820px; final
representative captures show light desktop/LTR and dark narrow/RTL output. These are field,
behavior and geometry receipts, not a comparative rendering-performance gate.

The family remains Partial. Full native ref/render/event forwarding,
all other family membership integrations, qualified optical/device acceptance,
native-platform adapters and performance comparisons remain open.
