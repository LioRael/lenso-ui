# Slider for Exact Web

`SliderState` contains `id`, `label`, `labelledBy`, `describedBy`, `values`,
`min`, `max`, `step`, `largeStep`, `minStepsBetweenValues`, `collision`,
`orientation`, `direction`, `alignment`, `disabled`, `readOnly` and `name`.
`values` is an ordered, nonempty array even for a single value. Bounds and steps
must be finite, `max > min`, steps positive, and the minimum gap achievable.
Orientations are `horizontal`/`vertical`, directions `ltr`/`rtl`, alignments
`edge`/`center`, and currently supported collision modes `push`/`none`.
Lenso's default source composition uses edge alignment and push collision.

Compose `Slider`, `SliderLabel(state, label)`, `SliderOutput(id)` with caller
text, `SliderControl(state)`, `SliderTrack(state)` with `SliderFill(state)`, and
one `SliderThumb(state, index, label, valueText, change, commit)` per value.
Indices identify thumb positions; retain stable instance identities while values
change. `SliderMarks` is an optional decorative scale. The compiled example
switches between one and two thumbs without replacing the remaining input.

`change(nextValues)` proposes the full next array. The caller owns it and may
reject a proposal. Equal arrays do not emit a value change. Pointer push preserves
pushed neighbours when the thumb is dragged back; none mode clamps at the
neighbour gap. Keyboard movement clamps to neighbours for both modes, following
Base UI's keyboard contract. Arrow keys use step; Shift+Arrow and PageUp/PageDown
use largeStep; Home/End select the available neighbour/range boundary. Horizontal
arrows follow RTL while ArrowUp always increases. Commit callbacks receive the
owned array after a completed changed gesture or key operation.

## Native input and geometry ownership

Each thumb contains one native range input with an accessible name, value text,
orientation, bounds, step, disabled state and form name/value. Inputs retain
keyboard and assistive-technology semantics. Their pointer paint is hidden;
Exact-owned thumb containers and the control route pointer input to the nearest
thumb, remembering the last used thumb and bringing active thumbs above overlaps.
No Exact-owned nodes are replaced or moved. Native proposals are bounded before
dispatch, then Contract applies the authoritative gap/collision constraints.
Rejected proposals reconcile the native field with owned state.

Native FormData includes repeated name entries for multiple thumbs. Controlled
field defaults track the current owned values, so native form reset preserves the
controlled value without briefly resetting to the browser's midpoint. Reset the
owner's state for application defaults. Public external form association is not provided by this API.
Read-only controls retain focus and expose aria-readonly via the native hatch;
Contract and pointer/keyboard routing block changes.

Contract emits thumb position and range-gradient geometry, including correct RTL
and vertical fill direction, so they exist before the hatch loads. Static StyleX
maps and caller rules still style the parts; fill ink follows its color. Replacing
the dynamic fill background image through a caller map is an open styling gap.
SliderOutput and SliderLabel use Exact text nodes; native output/label tags are
not claimed, and label activation explicitly focuses the first input.

The adapter retains the shared slider styles, knob material, source lift springs,
velocity deformation and local track refraction. Its vertical grid repeats the
source vertical layout under a labelled-root selector: the shared :has(label or
output) rule otherwise overrides the vertical grid in the current StyleX output.
Native inputs do not intercept pointer gestures intended for the thumb/control.
All pointer capture, listeners, observers, frames, springs and local lenses are
released when their owning nodes end.

## Evidence and remaining gates

`test/slider.mjs` operates the compiled consumer: names and ARIA, persistent input
identity, keyboard steps/bounds, no-op suppression, push/none collision and drag
reversal, disabled/read-only guards, rejected proposals, RTL arrows, native
FormData/reset, single/range changes, vertical pointer geometry, edge/center
alignment, reduced motion, removal during drag, remount and light/dark layouts.
The browser runner includes this check; initial stylesheet and recipe parity
checks include slider parts as well.

The family remains Partial. Swap collision, per-thumb disabled/form names,
format/locale APIs, broader ref/render/event contracts, source-to-adapter motion
footage, optical capture acceptance and physical touch/scroll acceptance remain
open. WebKit's automated glass capture is still unqualified (VISUAL_CAPTURE.md).
No native-platform or relative-performance claim follows from these Web checks.
