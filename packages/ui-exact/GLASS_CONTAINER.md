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

`GlassContainerItem(id)` supplies the same small Glass presentation as Glass,
with caller content. Existing small Glass and GlassButton optical roots can also
join the nearest container. Native layout determines member positions; a
container neither arranges its children nor creates an application selection.
Disabled and opaque containers form context barriers; nested containers own
their own members. The shared renderer handles geometry, material compatibility,
preference fallback and member restoration.

Browser acceptance is in progress. Full native ref/render/event forwarding,
all other family membership integrations, qualified optical/device acceptance,
native-platform adapters and performance comparisons remain open.
