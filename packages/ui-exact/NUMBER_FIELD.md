# NumberField and Stepper

Both families share NumberFieldState and a nullable numeric value, using
`option<number>` in Contract. An empty field is `none`, separate from zero. Pass
the same state and change/commit actions to the root, input and buttons. See the
compiled `example/number-field.contract` for the composition. Every state option
is explicit: optional min/max use `none`; format is an empty string or a JSON
Intl.NumberFormat options object. Native Exact remains unchanged.

NumberFieldGroup reuses the source field material and primary/secondary token
maps. Stepper uses the ordinary source two-segment 92 x 32 treatment; it has no
Glass layer. StepperInput remains a visually hidden, keyboard-accessible editor.
Stepping buttons have tabindex -1 and unavailable ARIA semantics, as in Base UI;
keyboard users step through the input. Caller styles use the normal registered
StyleX recipes.

The adapter reuses Base UI 1.9.0's locale parsing and numeric validation utilities,
including Unicode digits/signs, percent/currency/unit decoration, decimal snapping,
rounding and clamp order. A bounded formatter cache avoids repeated Intl setup.
Typing keeps an unformatted draft and emits parseable numeric values; partial
signs/IME drafts do not become zero. Blur and Enter commit and normalize parseable drafts; incomplete nonempty text
stays visible without a commit. External
value changes replace the draft. Stepping starts from the normalized edited value
and a cleared field seeds zero, clamped into its allowed range. Shift/Alt select
large/small steps. Home/End jump only when their bound is defined. Focused wheel
stepping is optional. Mouse buttons focus the input; touch buttons avoid opening
the hidden Stepper keyboard. Holding repeats after 400ms at 60ms intervals.

Exact continues to own canonical values and callback state. Native input-event
bridges carry proposals and commits; only the transient edit text and press state
belong to this adapter. Per-button disabled state stays independent of the root.
Removal of a root or editor releases listeners, repeat timers and pending frames;
editor reinsertion reconnects against the current canonical value.

A separate hidden input carries the canonical form value; the visible formatted
editor stays unnamed. Required and range validity apply to the editor. A native
HTML form present at initialization can reset to the value observed at that
initialization. Native forms in the browser acceptance are DOM fixtures, since
Exact's author-facing form/container surface is a separate coverage item.
Before hatch, native numeric inputs and Contract button actions are available;
locale drafts, snapping/format policy and hold behavior start with initialization.

## Remaining work

Drag adjustment and its decorative cursor are documented in [NumberField drag adjustment](NUMBER_SCRUB.md).

Both families remain Partial. Cancellable event reason/direction payloads, custom input and button rendering,
ref/event and native form/Field context forwarding and physical-device behavior remain open. Full
native-platform adapters follow Web completion. Source React callbacks and
optional/default prop syntax are not this flat Contract API. This slice does not
qualify Glass optics, source motion parity or comparative performance.

## Focused acceptance

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass 18 affected presentation
recipes using actual input/button tags and native input attributes. A registered
caller font rule applies before and after hatch. Native input edits, empty seeds
and button actions work before enhancement. The Stepper root and group both
measure 92 x 32, including the focused root ring; its hidden editor is 1 x 1.

The compiled consumer verifies parseable/partial/empty drafts, fullwidth IME and
paste/caret DOM fixtures, external overrides, declared/absent bounds, directional
snapping, fractional steps and modifiers, Home/End, wheel, press/hold, independent
disabled/read-only/invalid state, nested ownership, and editor/root removal during interaction.
Separate native DOM form fixtures verify canonical FormData, required validity,
reset and disabled exclusion. Locale checks cover en-US, de-DE and ar-EG with
currency formatting. Eight captures per browser cover primary/secondary, light/dark
and 390/820px. RTL and full-width layout, spinbutton semantics under Reduced
Motion/forced-colors settings, and emulated touch are also checked. SearchField and caller-style regressions pass, including shared
focus-method retention across numeric/search controls and final-owner cleanup.

Numeric callbacks retain the source JavaScript-number model and its bounded
floating-point cleanup. A direct comparison with the installed Base UI confirms
the same fractional snapping result; browser numeric comparisons allow 1e-12
for that source precision boundary. Unformatted typed digits are not truncated
indiscriminately. This does not establish arbitrary-precision arithmetic.

The local receipt is `.cache/acceptance/number-field-acceptance.json`. The full
catalog browser suite and physical devices were not tested. The compiler keeps
the existing Popover `lower-dialog-role` warning and adds no new warning.
