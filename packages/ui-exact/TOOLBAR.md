# Toolbar for Exact Web

Toolbar composes named native buttons and links in one roving-focus set. It
reuses the source toolbar, glass-button, link and small-material StyleX maps,
without changing ordinary Button or ToggleButton ownership.

`ToolbarState` explicitly declares id, label, orientation, direction, disabled,
loopFocus, attached and elastic. Root has toolbar semantics. Group declares a
unique id, label, glass, disabled, detachable and detached along with the root state. Separators have
an explicit perpendicular orientation; ToolbarButtonIcon accepts decorative
caller content. A normal glass group owns one material around plain buttons.
An attached root owns the common surface and its groups remove outer padding.

ToolbarButton takes state, id/label, size, variant, groupDisabled, grouped,
surface, detachable, detached, glass, iconOnly, elastic, destructive, tint, disabled,
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
2325 affected metadata/class comparisons, blocked-hatch floating/attached styles,
orientation/RTL/Home/End/loop navigation, optional focusable-disabled members,
group/root disabling, loading guards, native link navigation, 8px drag cancellation,
shared/individual press feedback, all sizes/variants, retained nodes, Reduced
Motion and removal/remount cleanup. Existing Link/Breadcrumbs regressions pass.

Captures cover light/dark, 390/820px, both axes and attached/floating RTL layouts;
representative output is inspected in both engines. Shared decorative press-light
parts move to the attached root without adding Tab stops. A separate native-DOM
fixture verifies nested root isolation and input-caret arrow ownership; it does
not claim a compiled nested-toggle integration. Dynamic children and the focused
member's removal are checked in the compiled example. The family remains Partial. Detachable/fused groups now use the Exact
GlassContainer adapter. Sticky scroll-edge modes, Menu morph
sources, nested ToggleButtonGroup integration, complete native ref/render/event
forwarding, qualified optical/device and native-platform acceptance remain open.
ToolbarLink retains the documented pre-hatch disabled-anchor role gap. The
one-Tab-entry controller begins at hatch initialization; before that point the
native authored tab stops remain. These are retained catalog requirements. This implementation does not establish
relative rendering performance or a WebKit backdrop workaround.

## Detachable group integration

Glass groups accept `detachable=true` with controlled `detached`. Pass the same
mode/state to their direct ToolbarButton children. The group becomes an Exact
fusion owner, retaining its group role, controls and focus. Auto variants resolve
to glass in detachable mode. Children ignore the enclosing surface context in
this mode, while the outer attached toolbar retains its own material.

The layout reserves 40px separated gaps and 12px group padding. A private joined
offset moves each member toward the group's centre; explicit direction handles
RTL independently of HTML :dir(). The shared 250ms transform/corner transition
retargets current CSS values on reversals. Geometry registration establishes the
initial joined layout before enabling transitions. Browsers with CSS tree-counting
functions also establish joined offsets before hatching. The Contract places its
single decorative surface after the direct button members; the CSS counts that
fixed anatomy. The initialized controller counts only toolbar members, so renderer
decorations do not change offsets. Browsers without these functions initialize
offsets at hatch time.

The contour engine reads live member rectangles/corners and keeps the compatible
material plane across join/separate changes. Member optical bindings are retained
when only detachment/motion ownership changes, so reversing a transition does not
tear down the field. Joined groups own elastic feedback; detached members regain
individual feedback with the source size-based growth and 230/31 release spring.
The public `--toolbar-joined-offset` override remains available; the controller
owns only its `--lenso-exact-toolbar-joined-offset` fallback.

Chromium and WebKit check intermediate and reversed geometry, persistent field
and member nodes, retained focus, joined/individual press ownership, light without
elastic motion, disabled/loading guards, dynamic membership, mode changes and
removal/remount cleanup. The 32 endpoint combinations cover 390/820px, light/dark,
both axes, RTL/LTR and joined/detached states. Separate checks cover opposite HTML
direction, all sizes, attached parents and opaque preference fallback. Linked CSS
is checked with the hatch script blocked. Representative final images are reviewed;
the frame traces establish geometry and identity, not optical pixel parity.
Full optical/per-frame reference comparison, sticky edges, Menu morph sources and
native integration remain separate gates.
