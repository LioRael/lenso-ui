> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# WheelPicker for Exact Web

WheelPickerState supplies id, accessible label/labelledBy, options (unique string
value, label, disabled), controlled value, disabled, direction, name, form and
emptyLabel. WheelPicker(state, change) proposes one string. The application owns
the value and may reject changes. An invalid or disabled value renders the first
enabled option, matching the source fallback; this does not write application
state. Empty and all-disabled collections have no selected option.

The native ListBox root, items, key/selection bridge and focus controller are
shared with ordinary ListBox. Wheel-specific presentation composes the existing
ListBox and WheelPicker recipes. Native vertical scroll/snap positions and option
semantics remain linear; only labels receive the source cylindrical transform,
visibility and opacity projection. Measured row height supplies the radius and
alignment, so rem geometry follows the font scale.

Scrollend chooses the nearest enabled row; engines lacking that event use the
source 150ms fallback. Accepted values realign after the Host commits; rejected
requests realign to the confirmed selection. Click/keyboard proposals reuse the
ListBox bridge and reconcile afterward. Resize, external values, disabled state
and collection changes also realign. Labels and pending frames/timers restore or
release when removed. A named hidden input supplies the effective scalar value
and supports external form association after hatch initialization. This controlled
composition leaves reset policy with the application.

The family remains Partial pending compiled-consumer, browser layout/interaction,
caller-style, form, source-motion and native/device acceptance. Both primitive
packages and the stock SDK remain unchanged; ListBox is an existing Lenso
extension because the headless package has no corresponding primitive.

## Verification

Chromium 156 and WebKit 27.2 pass the compiled consumer: initial confirmed focus,
vertical/Home/End keys, disabled skipping, RTL, native browser mouse-wheel
settlement, accepted/rejected value reconciliation, root disabling, external
replacement, removed-value fallback, empty/repopulated options, source label
visibility, font-scale geometry and removal/remount cleanup. Committed selection
aligns synchronously with the source layout-effect behavior; deferred intent
reconciliation remains available for rejected requests. Removed labels restore
styles even when the collection becomes empty.

Native external-form fixtures verify successful scalar values, controlled reset
retention and association changes through the public form metadata. Fixtures keep
Exact-owned nodes in place. Native mobile-browser taps select a different option;
this does not qualify continuous finger scrolling. The complete existing ListBox
regression passes in both engines against the internal root/item delegation and
new private selection request entry point. Ordinary ListBox props remain unchanged.

Eight WheelPicker captures cover 390/820px and light/dark in both engines, with
216px viewport, 32px rows, centered projection, opacity and 1.15 scale assertions.
A 20px root font fixture verifies proportional 270px viewport / 40px row geometry.
Representative Chromium narrow light and WebKit wide dark captures were inspected.
Receipts: `.cache/acceptance/wheel-picker-settle/acceptance.json` and
`verification.json`, plus the existing ListBox regression captures in that folder.
The focused package suite passes 79 tests / 333 assertions and 141-file typechecking.
Affected format/lint and the full consumer build pass with six existing SDK warnings.

Initial centering/projection and form metadata require initialization. Uncontrolled/
default/reset convenience, all-disabled and broader dynamic/key/label/style/form
matrices, native event/ref/render forwarding, the 150ms no-scrollend fallback,
continuous touch, reference motion and physical/native-device acceptance remain
open. Earlier fixture diagnostics are not runtime-bug receipts: an incorrect DOM
id wait and reparenting an owned node were corrected in the browser fixtures.
No source timing-regression or performance-improvement claim follows from them.
The family remains Partial and the full catalog objective remains active.
