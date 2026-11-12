# InputOTP for Exact Web

InputOTP composes real native inputs, one per character. It retains the shared
Lenso primary/secondary and optional floating Glass slot recipes. It does not
paint character copies over one hidden editor. Native hidden inputs only bridge
aggregate requests, form submission and validation.

`InputOTPState` explicitly declares `value`, `defaultValue`, `length` (1–64),
`validationType` (`numeric`, `alpha`, `alphanumeric`, `none`), disabled/readonly,
required/invalid, mask, autoSubmit, variant, glass, direction, name/form,
autocomplete and placeholder. `slotLabel` localizes the `{index}`/`{count}` input
names; `validationMessage` is a nonempty localized message for an incomplete code.
The root label and description name the group. The application owns code value.
`change(text)` proposes a complete string; `complete(text)` follows accepted
input/paste completion, and `autoSubmit` optionally requests native form submit.
Rejected proposals restore the canonical characters without advancing focus.
External model changes and reset do not trigger completion or auto-submit.

Compose Root/Group/Slot/Separator with consecutive explicit slot indices from
zero. The convenience InputOTP takes `indices`, which must match length. This is
explicit Contract composition rather than inferred React child indexing. The
runnable example has a split six-character code and a four-character backup.
Slots derive from the guarded canonical primitive Input with MIT provenance.
Native editing feeds a single aggregate Contract request; the adapter owns only
transient draft, focus and intent. It does not accept a second selection owner.

Numeric and alphabetic validation use Base UI's ASCII alphabets and remove
whitespace. `none` retains Unicode code points. Arrow navigation respects RTL;
Home/End, Backspace/Delete, paste and whole-code autofill keep values contiguous.
Only the active slot is a tab stop. Required and optional-but-partial validation
use a clipped native proxy; named hidden submission retains leading zeros.
The root's form association applies to every slot and proxy, including reset.

Broader native prop/ref/render forwarding, custom normalization callbacks,
async/deferred acceptance beyond the short reconciliation window, pre-hatch
supplementary Unicode display, physical keyboard/IME and device qualification,
reference motion/optics and complete API parity remain open. Browser checks and
rendered evidence are recorded separately from typechecks and code examples.

## Focused Web acceptance

An isolated stock Exact consumer passes Chromium/WebKit uninterrupted keyboard
entry, replacement/deletion, filtered and partial paste, leading zeros, rejected
requests without focus advancement, external model updates without completion,
masking, RTL, readonly/disabled guards, all four validation alphabets, Unicode
code-point deletion, synthetic composition, whole-code replacement input,
roving Tab, removal/remount and native browser taps. Required/optional-partial
validity, complete callbacks, explicit auto-submit, reset/cancelled reset and
external form association are verified. Physical IME and OS SMS autofill are not
established by these simulated composition/replacement events.

Thirty-two captures cover ordinary/Glass, primary/secondary, themes and widths,
with square slot bounds, containment, zero native border and round corners
asserted. A scoped StyleX native adaptation overrides Exact's default border,
radius and corner shape. Original rapid-input loss and host-corner observations
remain in earlier receipts. The runtime now moves focus immediately after the
parent acknowledges a proposal, avoiding an animation-frame delay between keys.
The short frame window only reconciles rejected requests.

Receipt: `.cache/acceptance/otp-round-normalized/acceptance.json`.
A separate focused check verifies native keyboard entry, deletion and Glass
remounting: `.cache/acceptance/otp-glass-edit/acceptance.json`. Its forced-color
step requests browser emulation but does not record the resulting media query;
it is not proof of a forced-color optical fallback. Neither capture cohort proves
optical parity with the source or physical devices. The package suite passes
66 tests / 243 assertions; typechecking covers 117 files, affected lint/format
checks and the isolated stock consumer build pass (six pre-existing warnings).
