# Compact edit menu bar

`MenuBar`, `MenuBarItem`, `MenuExpandTrigger` and `MenuExpandIcon` compose the
source Menu family's compact edit strip. They are ordinary buttons in a named
group, with normal Tab order; this is not a navigation menubar with arrow-key
roving. The compiled example is `example/menu-bar.contract`.

Pass the same `MenuBarState` to the bar and each item. It carries the accessible
name, direction, group disabled state and elastic setting. Per-item disabled
state remains independent when the group is re-enabled. Native button disabled
attributes and Contract action guards apply before hatch initialization.
`MenuExpandTrigger` takes a target MenuState ID and keeps the native popover
association, keyboard opening and ARIA expansion state.

The bar shares one compact glass-medium material layer. Items remain transparent
and the expand button uses the source 36px treatment without another Glass
instance. The source bar and item height is 44px. Shared press motion handles
pointer enlargement and release; disabling elastic removes that transform, and
Reduced Motion follows the common motion engine. Source styles, theme tokens and
registered caller StyleX recipes are reused.

The whole bar anchors the expanded popup and the modal backdrop cutout. Sibling
bar actions remain clickable while the popup is open. The popup keeps the existing
anchored Menu path: its trigger-to-popup morph, shared highlight plate and full
source spring choreography remain open. Caller-added custom portals, handles,
render/ref/event forwarding and arbitrary native fieldset attributes remain open.

The pinned Exact contract has no public native fieldset declaration. The bar
therefore uses an accessible group and explicit shared state for disabled
inheritance, following the existing Exact Fieldset composition. It does not claim
native fieldset/legend form semantics or arbitrary descendant auto-disable.
The upstream Exact checkout remains unchanged.

Native platforms follow Web completion. Physical-device touch, qualified optical
capture and comparative performance require separate evidence.

## Focused acceptance

Chromium 156.0.8078.4 and Playwright WebKit 27.2 verify 71 affected Menu
presentation recipes. The compiled consumer exercises pre-hatch actions and
group/item disabled state, Enter/Space, Tab order, first/last keyboard opening,
sibling actions through the backdrop cutout, item selection, independent disabled
restoration, shared press motion and removal/remounting. Four geometry captures
cover LTR/RTL at 390px and 820px. Separate light/dark captures, increased-contrast
fallback and Reduced Motion checks pass in both browsers. Emulated touch verifies
native expansion and selection. Existing Menu's 36 placement endpoints and modal
Menu behavior pass against the same built assets.

WebKit can use native material paints without a Chromium SVG filter variable.
Attachment checks use the shared runtime ownership marker and medium profile;
removal restores owned styles and disposes a filter when that path uses one.
These checks do not qualify glass optics or performance. The local receipt is
`.cache/acceptance/menu-bar-acceptance.json`. The full catalog browser suite and
physical devices were not tested in this slice. The compiler retains the existing
Popover `lower-dialog-role` warning and adds no new warning.
