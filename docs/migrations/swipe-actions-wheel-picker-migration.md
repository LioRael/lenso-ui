# SwipeActions and WheelPicker

Both families are additive exports from `@lenso/ui` and their matching subpaths.
Their token subpaths are `@lenso/tokens/swipe-actions` and
`@lenso/tokens/wheel-picker`. Existing consumers need no changes.

## SwipeActions

Supply `startActions` and/or `endActions`, each with a stable `id`, `label` and
`onAction`. Optional icons, disabled state and `danger`/`tint` variants compose with
native Base UI buttons. Visible reveal controls keep both sides reachable by
keyboard. Localize them through `startActionsLabel` and `endActionsLabel`.
Inside List, use `render={<li />}` so the row retains list semantics.

`openSide`, `defaultOpenSide` and `onOpenSideChange` use `start`, `end` or null.
Logical sides follow the Base UI direction provider. Closed action groups are
inert. Escape closes an open group and returns focus to its reveal button.
Vertical gestures retain browser scrolling; a canceled swipe preserves the
accepted state. Swiping does not activate an underlying row link or button.

No full swipe executes an action by default. Set `fullSwipe` on an action to
opt it in; the first enabled opt-in on that side is used after crossing 80% of
the row width. Deletion, confirmation, errors and undo remain application state.
Multiple rows can be open independently.
Disabled state applies to swipes and action controls; the application still
owns the interactivity of its row content.
Release selection considers distance and recent velocity, with a short
reduced-motion-aware settling transition. A paused release discards stale velocity.
Touch capture transferred from a descendant does not count as a canceled gesture.
Non-editable row text cannot start selection/callout; focused inputs, textareas
and editable content retain native editing. Action buttons now use inset rounded
shapes. `danger` and `tint` use solid fills with white text; the default neutral
action retains a readable label. No native spring or back-navigation parity is claimed.

## WheelPicker

Supply `options` with unique string `value`, string `label` and optional disabled
state. Use `value`/`onValueChange` for controlled state or `defaultValue` for local
state. An unmatched or disabled value resolves to the first enabled option.
All-disabled and empty collections have no selected value. `emptyLabel` localizes
the empty display. Label each wheel with `aria-label` or `aria-labelledby`.

Native touch/trackpad scrolling and CSS snapping select the nearest enabled item
after scrolling settles. Keyboard navigation uses ListBox with selection
following focus and no wrap. Controlled rejection restores the accepted wheel
position. Rem-based geometry is measured rather than assuming fixed pixel rows.
Scroll-end reconciliation waits for React to commit selection before centering
the accepted value. This avoids a brief jump to the previous value followed by
a second snap to the new value. Existing props and callbacks are unchanged.
The default viewport is now 216px high at a 16px root font, with 32px option slots,
a 34px center band and 9px band insets. Visual labels project onto a curved wheel
and grow at the center; option hit/scroll positions and accessible names remain
linear. Native scrolling uses `scrollend` when available, with a debounce fallback
for older engines. It can pass multiple snap positions during a fling. Non-editable
wheel labels do not invoke text selection or the iOS copy callout.
Compose multiple wheels for durations; applications own dependencies between
columns. There is no infinite loop, virtualization or native iOS inertia claim.

These presentation/gesture changes were compared on iPhone 15 Pro Max / iOS 27.2.
See [the physical-device report](../research/ios-swipe-wheel-comparison-2026-11-09.md).
Existing values and callbacks need no migration; layouts that assumed the former
180px wheel height should allow the new viewport height.

Optional `name` and `form` include a hidden value in form submission. Disabled
wheels are excluded. Native form reset restores the uncontrolled default;
controlled owners manage reset themselves. Native required-field validation is
not supplied by a hidden input; validate the value in the owning form.

## ListBox additions

`selectionFollowsFocus` defaults to false and `loopFocus` defaults to true,
preserving existing keyboard behavior. WheelPicker opts into single selection
following focus and clamps navigation at the ends. ListBox now respects an
explicit root `tabIndex`, including a disabled wheel's `-1`.
