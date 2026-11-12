> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# SegmentedControl for Exact Web

SegmentedControl chooses one value; Tabs selects a panel. The Exact port retains
that distinction with a radiogroup and radio items, not tab roles.

`SegmentedControlState` contains `id`, `label`, `value`, `hasValue`, `direction`,
`size`, `lift`, `elastic`, `glass`, `disabled`, `readOnly`, `required`, `name`,
`form`. Use ltr/rtl, sm/lg and finite non-negative lift. Source defaults are sm,
lift 20, elastic enabled and ordinary material. `hasValue=false` means no
selection; `hasValue=true` can select an empty string value. The owner initializes
and resets its state and accepts `change(nextValue)` proposals explicitly.
Equal selections do not emit another value change.

`SegmentedControl(state, items, emptyLabel, change)` accepts
`SegmentedControlOption(value, label, disabled)` records. Values are stable keys;
DOM ids use the group id and item position rather than encoding arbitrary values.
String labels retain the source ellipsis treatment and remain fully named for
assistive technology. Their Exact text leaves use inline layout so the label
container can draw the ellipsis. No options renders emptyLabel without fake radio items.

For rich labels compose `SegmentedControlRoot(state)`,
`SegmentedControlItem(state, id, value, label, disabled, change)` with caller
content, then `SegmentedControlIndicator()`. Supply safe unique ids independently
of arbitrary value strings. Item label is the accessible name; the slot renders
its visible content. The compiled example includes both the collection and a
composed group with an empty-valued option and a value containing whitespace.

## Native behavior and forms

The radio group has one enabled keyboard entry point. Arrow keys move focus and
selection, skip disabled items, loop and follow RTL; Home/End select the boundary.
Space activates, while Enter is prevented from activating a radio. Programmatic
focus alone does not select an item. Read-only retains navigation/focus but
prevents changes; disabled groups/items cannot activate. The caller can reject a
proposal, and native fields reconcile with the owned selection.

Each item has a separate visually hidden native radio input. Name, form owner,
value, checked, disabled and required semantics use the actual field. Public form
association supports an external form id or normal ancestor ownership with an
empty form string. Controlled defaults follow owned state, so form.reset()
preserves the controlled selection. Change owner state to apply application
reset defaults. Native input focus forwards to its visible radio; required group
validation focuses a selected eligible item or the first enabled item. Private
input clicks do not bubble as extra user clicks.

## Shared presentation and verification

The port reuses the source segmented styles and shared selection presentation:
ordinary/Glass track, moving highlight, local text refraction, lift, velocity
deformation and optional elastic press. It uses the same motion implementation
as the Exact Tabs port with the source radio selection attribute. Decorative
copies are inert, use isolated ids and omit Exact ownership markers. Original
items remain owned by Exact. Observers, listeners, frames and optics end with the
group. Caller StyleX rules compose through the shared registration, including
public lift-variable overrides. Material accessibility preferences use the shared
fallback. Live direction changes reposition the highlight without requiring a
selection change; Tabs shares that synchronization.

The compiled consumer checks names and radio roles, keyboard and pointer/drag
selection, no-op selection, disabled/read-only guards, rejected proposals,
persistent item identity, RTL, native form submission values/reset/required focus,
empty-string versus absent values, arbitrary value strings, empty/remounted
collections, long-label truncation, size, Glass accessibility fallback, reduced
motion and unmount/remount. Ordinary screenshots cover light/dark, LTR/RTL and
390/820px. Initial stylesheet and all registered recipe comparisons run alongside
Tabs regression.

The family remains Partial. The broader native ref/render/event and Field/Form
context contracts, source-to-port transition footage, optical acceptance and
physical touch/scroll acceptance remain open. WebKit's automated Glass capture is
still unqualified (VISUAL_CAPTURE.md). These are Web behavior/style checks, not a
native-platform or relative-performance result.
