# Toolbar for Exact Web

Toolbar composes named native buttons and links in one roving-focus set. It
reuses the source toolbar, glass-button, link and small-material StyleX maps,
without changing ordinary Button or ToggleButton ownership.

`ToolbarState` explicitly declares id, label, orientation, direction, disabled,
loopFocus, attached and elastic. Root has toolbar semantics. Group declares a
unique id, label, glass and disabled along with the root state. Separators have
an explicit perpendicular orientation; ToolbarButtonIcon accepts decorative
caller content. A normal glass group owns one material around plain buttons.
An attached root owns the common surface and its groups remove outer padding.

ToolbarButton takes state, id/label, size, variant, groupDisabled, grouped,
surface, glass, iconOnly, elastic, destructive, tint, disabled,
focusableWhenDisabled, loading and press, plus rich caller content. Pass grouped
and surface for group members; attached roots imply surface. Pass the group's
disabled value too, so native state and action guards are available before the
Web hatch. Variant auto resolves to plain in a normal group and glass elsewhere;
explicit glass/filled/plain are available. Size is sm/md/lg. All props are explicit.
The public tint variable remains available to registered caller maps. Dynamic
tint values reach the private fallback when the hatch initializes; custom tint
before that point requires a declarative caller map.

ToolbarLink keeps a real anchor and ordinary Link presentation. It declares
id/label/href/target/disabled plus content. Like Base UI Toolbar.Link, navigation
links remain available when the root or a button group disables its actions;
use the link's own disabled flag to make navigation unavailable. This explicit
flag also removes href before initialization and connects the common Link guard.

## Keyboard and activation

The initialized toolbar has one enabled Tab entry, remembers the focused member,
and uses the orientation/RTL arrow pair plus Home/End. loopFocus is explicit.
Disabled buttons are skipped unless focusableWhenDisabled is true, in which case
they expose aria-disabled and remain non-actionable. Loading actions remain
focusable and block repeated activation. Groups do not add Tab stops. Child
editors and nested toolbar roots retain their own keyboard operation.

The controller follows native disabled, group and item updates, dynamic children
and focus. It does not replace Exact-owned nodes or move their content. Exact
retains click state and application actions. Pointer activation waits for release;
a drag reaching 8px cancels the resulting click even if it returns to its start.
Keyboard/assistive activation remains available. The threshold follows the Lenso
Web contract; it is not a native iOS measurement.

Shared and individual press feedback reuse the existing non-React spring model.
Surface children keep the surface's deformation; plain/group controls avoid
additional lenses. Explicit elastic overrides restrict press initiation. Reduced
motion retains native activation and a resting surface. Removing hatches releases
window tracking, springs, observers, focus listeners, optics and owned attributes.

## Remaining work

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass the compiled consumer,
1169 affected metadata/class comparisons, blocked-hatch floating/attached styles,
orientation/RTL/Home/End/loop navigation, optional focusable-disabled members,
group/root disabling, loading guards, native link navigation, 8px drag cancellation,
shared/individual press feedback, all sizes/variants, retained nodes, Reduced
Motion and removal/remount cleanup. Existing Link/Breadcrumbs regressions pass.

Captures cover light/dark, 390/820px, both axes and attached/floating RTL layouts;
representative output is inspected in both engines. Shared decorative press-light
parts move to the attached root without adding Tab stops. A separate native-DOM
fixture verifies nested root isolation and input-caret arrow ownership; it does
not claim a compiled nested-toggle integration. Dynamic children and the focused
member's removal are checked in the compiled example. The family remains Partial. Detachable/fused groups and their contour
transition require the GlassContainer port. Sticky scroll-edge modes, Menu morph
sources, nested ToggleButtonGroup integration, complete native ref/render/event
forwarding, qualified optical/device and native-platform acceptance remain open.
ToolbarLink retains the documented pre-hatch disabled-anchor role gap. The
one-Tab-entry controller begins at hatch initialization; before that point the
native authored tab stops remain. These are retained catalog requirements. This implementation does not establish
relative rendering performance or a WebKit backdrop workaround.
