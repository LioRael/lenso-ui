> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Switch for Exact Web

`SwitchState` has `id`, `label`, `describedBy`, `checked`, `disabled`, `readOnly`,
`required`, `invalid`, `size`, `name` and `value`. Sizes are `sm`, `md`, `lg`.
`Switch(state, change)` proposes the next boolean through `change(next)`;
the caller owns the value and may reject a proposal by retaining it.
Compose `SwitchContent`, `SwitchControl(size)`, `SwitchThumb(size, checked)` and
optional `SwitchIcon`. Pass matching size and checked values to the parts.
The root name describes the setting and remains stable as its value changes.

The root is a native button with `role="switch"`, explicit checked state and
Space/Enter activation. It never submits a form. A separate visually hidden
checkbox carries `name`, `value`, checked, disabled and required state; the
button is the single accessible and keyboard-operable control. Invalid required
validation focuses the visible switch. Read-only keeps focus but blocks changes.
The Web hatch supplies `aria-readonly` from the declared metadata because this
pinned compiler does not accept that ARIA attribute in Contract source.
No upstream compiler changes are required.

Native form reset proposes the initially mounted checked value through the same
activation. A rejected proposal or disabled/read-only control retains the current
controlled value. Hidden input reconciliation follows native changes and reset,
including a caller rejecting a change. Reset listeners and pending frames are
removed when Exact ends the input. Use ordinary app state initialization for
defaults and reset the owner's state for application-specific reset behavior.
Explicit external form association and an unchecked submission value are not
public Exact API fields yet.

## Motion and materials

The adapter retains the existing Lenso/Glisse switch springs, velocity deformation,
press lift, drag threshold, scroll cancellation and click suppression. A drag
commits through the native button and the Exact action; it never assigns the
owner's checked state directly. The source track refraction and shared knob
material are retained. Motion and lens resources are disposed with their owning
nodes. The adapter disables Exact's neutral whole-row hover wash so that the shared
thumb highlight owns the hover treatment. Track/label/icon presentation uses
the same shared StyleX maps; caller
maps still compose last. The example gives its optional check icon dark ink on
the white knob face through a caller rule.

## Verification and open gates

The compiled consumer checks Space/Enter, label-content activation, programmatic
activation guards, read-only/disabled state, required validation focus, native
FormData and reset, all sizes, two-way drag with one commit, reduced motion,
removal/remount, and light/dark at 390/820px in Chromium and WebKit. Recipe parity
and blocking CSS delivery also run in the full browser suite.

This family remains Partial: source-to-adapter transition footage, optical review
with a qualified capture, touch scroll/hold behavior on physical devices,
external labels and external form APIs, unchecked submission values and the
broader render/ref/event contract still need acceptance. WebKit's automated
backdrop capture remains unqualified (VISUAL_CAPTURE.md). These checks do not
establish a performance improvement over the existing Web component or native iOS.
