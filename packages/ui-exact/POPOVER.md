# Popover for Exact Web

Popover composes native `popover="auto"` invokers with a non-modal dialog. Exact
owns the nodes, application actions and editable values; the browser owns top-layer
presence, Escape and pointer light dismissal. No upstream Exact changes are needed.
Use Modal or AlertDialog for a modal task.

The parts are Popover, PopoverPortal, PopoverTrigger, PopoverPositioner,
PopoverPopup, PopoverArrow, PopoverTitle, PopoverDescription, PopoverViewport and
PopoverClose. Every prop is explicit in `components/popover.contract`. Trigger and
Close are native buttons with standard Button size/variant maps and rich content.
The trigger also uses the source Popover focus/disabled map. Title has an explicit
heading level; Description exposes a paragraph role on a native box.

Popover and Portal are identity-preserving `display: contents` wrappers. The
native top layer provides stacking while retaining theme inheritance and the
original DOM ancestry. Portal does not support a custom destination/container.
Positioner is the native popover. Popup is the accessible named dialog inside it.
Pass unique ids and the same state to Positioner, Popup and Arrow.

## Position, focus and material

PopoverState declares id, label/labelledBy/describedBy, side, align, direction,
sideOffset, alignOffset, collisionPadding, collisionAvoidance and
disableAnchorTracking. Sides are top/bottom/left/right/inline-start/inline-end;
alignment is start/center/end. The source defaults can be expressed with bottom,
center, 16px side offset, zero align offset, 8px collision padding and tracking on.

Floating UI DOM 1.8.0 computes fixed coordinates, flipping, shifting, available
space and arrow position. Scroll, viewport and element-size tracking starts only
while open and stops on closing or removal. Stale asynchronous positions cannot
write after closure, replacement or teardown. Native CSS fallback positioning is
disabled once the adapter owns coordinates, avoiding a second browser flip.
`--available-width`, `--available-height`, `--anchor-width`, `--anchor-height` and
`--transform-origin` remain available to caller maps. Adapter coordinates use
private variables and restore pre-existing inline values on teardown.

Opening focuses the first eligible editor/action, or the dialog when none exists.
Native controls without an authored tab index receive an explicit Tab stop, while
caller tab indices remain intact. Closed and exiting content is inert and hidden
from the accessibility tree; its decorative exit transition can finish.
Tab remains non-modal; leaving the popup closes it. Shift+Tab at the first control
returns to the invoker. Nested native popovers dismiss from the inside out. Closing
returns focus when it was inside; an independently focused outside control keeps
focus. Reapplication preserves the owner, native open state, text and selection.

The source anchored presentation uses thick material rather than a liquid Glass
lens. Popup, arrow, title and description use the existing Lenso StyleX maps.
AnchoredMaterial's shared shape combines the panel and default arrow into one
native-coordinate backdrop sample. Existing upper/lower paints remain inside
that mask. Opaque contrast/transparency and forced-color preferences remove the
paints and retain a readable shaped surface. Caller static maps compose last.
The source 150ms entry/100ms exit maps and Reduced Motion treatment are retained.

## Acceptance and remaining work

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass 66 affected metadata/class
comparisons and 36 physical/logical side, alignment and direction endpoints.
Blocked-hatch checks cover linked presentation and native opening/closing.
The compiled example edits
and exports a document name, supports multiple invokers and native programmatic
show/hide actions, and includes a nested format panel. Geometry checks exercise
physical/logical sides, alignment, RTL, collisions, scrolling, tracking opt-out,
opaque/forced-color preferences, optional outer arrows with nested content and
available height. A native DOM tall-content fixture checks viewport scrolling.
Checks retain the editable node, draft and selection across updates, then verify
focus, mask, coordinate and observer ownership on removal/remount. Captures cover
light/dark at 390/820px; source maps and geometry are verified, while qualified
optical/per-frame reference acceptance remains open. Modal, AlertDialog and native
navigation regressions cover the shared focus traversal.

The pinned compiler emits one `lower-dialog-role` warning for the non-modal dialog
role on Popup's box. The enclosing native popover supplies Escape and light
dismissal; Tab intentionally reaches the page. This does not create a native iOS
sheet or a modal focus trap, and the warning is retained rather than suppressed.

The family remains Partial: modal/trap-focus mode, Backdrop, hover opening,
controlled open state/change reasons and payloads, advanced collision/anchor
options, viewport transitions, custom arrows, custom portal destinations and full
native ref/render/event forwarding remain open. Native-platform adapters and
qualified optical/device/per-frame reference acceptance remain open too.
Before hatching, native open/close and linked presentation work; full state-driven
placement/offsets, focus policy and the merged arrow mask start at hatch time.
Literal native paragraph tags retain the agreed upstream gap. This implementation
does not establish a performance advantage or bypass WebKit backdrop limitations.
