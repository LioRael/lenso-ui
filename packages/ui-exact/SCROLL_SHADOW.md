# ScrollShadow for Exact Web

`ScrollShadow(state, change)` retains caller content inside one native scroll
viewport using Exact's native scroll node. It applies the shared Lenso fade mask rather than adding shadows or
duplicating content. The caller declares a native height bound and can compose registered StyleX
rules; the compiled example supplies a 160px height.

`ScrollShadowState` contains `id`, `label`, `role`, `tabIndex`, `orientation`,
`height`, `direction`, `size`, `offset`, `hideScrollBar`, `visibility`, `enabled`.
Orientation is vertical/horizontal, direction ltr/rtl, and size/offset are finite
pixel values. Defaults corresponding to Lenso are size 40, offset 0, vertical,
auto visibility, enabled and a visible scrollbar. All Exact props are explicit.
The sole source variant is fade. Choose a meaningful region label and Tab entry
when the content needs native keyboard scrolling.

Visibility accepts auto/both/top/bottom/left/right/none. Explicit modes choose
the corresponding edges, even when enabled is false, matching the source. An
edge from the other axis selects no mask. Disabled auto mode uses no mask and
does not report visibility. Manual modes stop automatic observers and reports.

## Native scrolling and updates

Supported browsers use the shared scroll-driven CSS timelines, typed fade
properties and animation ranges. The property declarations are linked in the
initial stylesheet before the hatch loads. Browsers without those timelines use
the measured edge values. Horizontal masks follow the explicit Exact direction,
including when the document's HTML direction differs from that CSS direction.

Auto mode measures scroll offset, viewport size and content size. It observes
the viewport and direct children, DOM/text/style/class/src changes and descendant
loads. Frames are coalesced; unchanged before/after/overflow states do not report
again. Content that stops overflowing removes the mask entirely, including the
opaque mask that would otherwise isolate descendant backdrop filters.

`change(visibility)` reports both/top/bottom/left/right/none after auto
measurement. Horizontal left/right retain the source's before/after labels in
RTL; the mask itself follows direction. Reports use a private, visually hidden
native input action, excluded from the Tab sequence, accessibility tree and form
association. Caller content retains its own Exact event and state ownership.

The adapter updates presentation by composing the current edge state with the
original caller StyleX rules. It preserves foreign classes and public variable
overrides, rather than appending conflicting classes after caller styles. Class replacement
is atomic, so WebKit never sees an intermediate viewport without its dimensions
and overflow styles during an edge update or hatch reapplication.
Geometry uses owned private variables; the public scroll-shadow variables remain
available to caller rules. Ending the root releases its observers, listeners,
frame, attributes and private geometry. Ending child hatches retains their usual
independent cleanup.

## Verification and remaining work

The compiled example and browser checks cover start/middle/end, unchanged-edge
report suppression, retained draft text/selection,
content and text growth, child resizing, overflow removal, size/offset updates,
manual/disabled modes, horizontal RTL, hidden scrollbars, caller overrides,
the observer fallback, reduced motion and unmount/remount. Captures cover both
orientations, LTR/RTL, light/dark and 390/820px. Blocking stylesheet checks include
typed-property declarations and native first-frame fade values when supported;
affected recipe parity and Tabs regression accompany the family checks.

Keyboard gates cover first entry before any programmatic scrolling and the
already-scrolled viewport. Both Chromium and WebKit require an actual offset
change. Native key gestures hold ArrowDown for 50ms so WebKit can process a
scrolling frame before keyup. Zero-duration synthetic gestures were not a
qualified native-scroll probe. The canonical browser suite includes the strict
first-entry gate; diagnostic HTML comparisons do not replace it.

The family remains Partial. A non-default dynamic size/offset reaches its private
variables when the hatch initializes; the pre-hatch geometry still uses the
40px/0px fallback unless a declarative caller map supplies it. Full native
ref/render/event forwarding, reference pixel/transition comparison, physical
touch/overscroll and broader descendant Glass acceptance remain open. This is
Web behavior and geometry evidence, not native-platform or comparative rendering
performance acceptance.
