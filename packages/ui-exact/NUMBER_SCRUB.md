# NumberField drag adjustment

`NumberFieldScrubArea` and `NumberFieldScrubAreaCursor` complete the drag-oriented
parts of the source NumberField composition. Put the area inside the numeric
root, with a normal Label for its input. The cursor is optional decorative slot
content. The example uses an authored SVG and a registered caller cursor style.
The upstream Exact checkout remains unchanged.

The area accepts horizontal/vertical direction, pixelSensitivity and an optional
teleportDistance (`option<number>`). Its pointer deltas feed the existing nullable
numeric model, including source step modifiers, clamping and directional snapping.
As in Base UI 1.9.0, the sensitivity accumulates movement until its threshold,
then applies the current event's delta rather than the entire accumulated delta.
Horizontal movement increases to the right; vertical movement increases upward.
Scrubbing starts from the authoritative numeric value, not a rounded display.
Pointer release commits once; cancellation/removal does not emit a release commit.
An unrelated pointer release does nothing.

Mouse interaction focuses the editor and requests body pointer lock where the
engine supports it. WebKit skips the request, as the source does; rejection
continues with ordinary pointer movement. Touch skips pointer lock and the custom
cursor, and prevents single-touch scrolling over the area. A click without an
axis movement still forwards exactly one click to its original target, even when
pointer lock retargeted the native click to body. Press/hold remains independent.

An authored cursor uses a native manual popover in the top layer, preserving
Exact's node and lifecycle ownership while escaping transformed/clipped ancestors.
It appears only for a live, granted non-touch lock. Coordinates wrap at the visual
viewport or the area bounds expanded by half the teleport distance on each side;
the transform inversely scales with visualViewport.scale. It carries no interaction
or Glass material. No authored node is reparented or cloned.

Scrubbing presence attributes are scoped to the numeric root and its own parts;
nested numeric controls retain separate ownership. Disabled/read-only transitions,
lock loss and editor/area/root removal cancel the active session, release an owned
lock and restore attributes/cursor styles. A late lock result after removal is
released. Removing only the cursor keeps numeric dragging available.

## Remaining work

NumberField remains Partial: cancellable event reason/direction payloads and full
native render/ref/event/form/Field-context forwarding are still open. Before hatch,
the label and numeric editor remain native; drag enhancement starts at initialization.
Native-platform adapters follow Web completion. Physical touch/IME, Safari UI,
zoom/device acceptance and comparative performance need their own evidence.
