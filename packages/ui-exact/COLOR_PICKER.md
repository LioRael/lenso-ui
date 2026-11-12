# ColorPicker for Exact Web

ColorPicker combines a primitive-derived native popover invoker and positioner
with the existing controlled color controls. Its trigger uses shared control
button Glass styles, and its popup uses the shared ColorPicker geometry, scrolling
content and medium Glass lens. It does not load React state or interaction hooks.

## Public composition

`ColorPickerState` contains id, label, value, disabled, readOnly and direction.
Compose `ColorPicker(state)` with `ColorPickerTrigger(state)` and
`ColorPickerPopover(state=position)` in its slot. Position is the existing
`PopoverState`; its id must equal the picker id. Direction must agree. Use the
popup's labelledBy to name it from `ColorPickerDialog(id, level)`, whose slot
contains the visible title. This part is a heading, corresponding to the source
picker's title part; the popup supplies the dialog semantics.

The [compiled example](example/color-picker.contract) derives ColorArea,
ColorSlider, ColorField and ColorSwatchPicker states from one application value,
and routes every change through the same application action. Root value metadata
is a projection, not a second state owner. Hex editing, channel changes and
preset colors update all controls and the trigger swatch. Alpha and color space
follow the existing control models. Parent rejection is supported by each control.

There is no implicit inherited context in this initial Exact API. Callers must
pass value, direction, disabled and readOnly consistently to child state shapes,
and guard their shared change action. Read-only palettes use disabled radios.
The trigger's disabled flag prevents opening; disabling an already open picker
does not automatically close it. Explicit child states block edits. Read-only
pickers can open for inspection. These differences remain API coverage work.

Popover position, collision avoidance, native top-layer presence, Escape, outside
dismissal and return focus reuse the existing Popover adapter. Use PopoverClose
with the picker id for a Done action. The native showPopover/hidePopover actions
can target the same id. Opening is native command state; controlled open/default
open callbacks and modality inheritance are not implemented here. Popup content
is present while closed and becomes inert through Popover initialization.

The lens attaches when the popover opens, tracks the live backdrop and releases
on close or removal. High contrast, reduced transparency and forced colors use
an opaque fallback. Content scrolls within available height. Shared popup width
is 386px, capped for the viewport, with 32px upper and 58px lower corners.
The current animation comes from the existing Popover presentation; reference
ColorPicker motion parity is not established.

## Verification and open gates

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/color-picker-browser.mjs
```

PLAYWRIGHT_MODULE selects an installed browser module and
LENSO_EXACT_TEST_ARTIFACTS selects the evidence directory. The driver validates
the loaded app.js fingerprint. It checks shared field/slider/area/palette state,
external updates, rejection, read-only/disabled state, RTL, Escape and Done focus
return, outside dismissal, open removal/remount, forced colors and viewport
bounds. Captures cover light/dark at 390/820px. Native mobile-browser taps exercise
open, edit and close; they do not establish physical-device behavior.

The family remains Partial for automatic inherited context, broader render/ref/
attribute/event and open-state APIs, modal/portal integration, complete axis and
variant coverage, source reference motion/geometry, pre-initialization semantics,
qualified Glass optics, continuous touch and native/device adapters. The existing
Popover exit and color-control gates remain applicable. No speed claim follows
from composition or asset size.
