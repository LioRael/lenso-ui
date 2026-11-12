> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# SearchField for Exact Web

SearchField retains a native `input type="search"`, Exact-owned draft and commit
updates, and the source family's small Glass group. Ordinary `Input` remains an
ordinary field. Primary and secondary variants reuse the source maps. Exact's native search-input border, padding and appearance are neutralized so
the editor remains inside one material surface. Root width
is capped at 360px unless fullWidth is true; the group is 44px high.

`SearchFieldState` declares id/name, label/labelledBy/describedBy, value,
placeholder/autocomplete, variant, fullWidth, disabled/readOnly/required/invalid.
All fields are explicit. The root id is reserved along with its `-group`,
`-input` and `-clear` suffixes. Value and flags have one Exact owner; pass the
same state to each part. Label and help/error parts use the existing form family.
The native name and required properties are applied by the Web hatch because
pinned Exact only permits the native name attribute on radio inputs.

`SearchField(state, input, change, submit, clearLabel)` supplies the standard
search icon, native editor and clear glyph. Input/change actions receive a string;
submit has no parameters and reads the owner's current value. The clear label is
explicit for localization. Rich composition uses SearchFieldRoot, SearchFieldGroup,
SearchFieldInput, SearchFieldSearchIcon and SearchFieldClearButton with caller
content (SearchFieldClearIcon provides the default glyph). Do not nest another
SearchField in a group. Slots retain caller state and event ownership.

Escape clears a nonempty, enabled, writable editor through its native input
event and focuses it. An empty, composing or already-cancelled Escape remains
available to the caller. Clearing does not synthesize a submit or change event;
native blur/change retains its browser contract. The native clear button is
hidden/disabled for an empty or disabled field. Read-only fields retain the
source button presentation, but clearing does not edit their value. Pointer
activation retains input focus; Enter and Space work through the native button.
An already-cancelled click does not clear.

Group background/icon pointer presses focus its editor; caller buttons, links,
editors and tab stops keep their own interaction. The source document modality
rule suppresses the group focus ring while pointing/editing and shows it for
keyboard navigation. Shared document listeners are released when the last group
ends and restore the previous modality attribute. Input/clear/group listeners
and Glass optics are released when their hatches end. Presentation composes
registered caller StyleX maps last, including blocking first-frame CSS.

## Acceptance boundary

The compiled consumer exercises both the standard composition and rich parts.
Browser checks cover native search semantics, labels/descriptions/errors,
required/name, draft/selection retention, Enter submit, pointer/Space/Enter clear,
Escape/empty/composing/cancelled events, read-only/disabled, dynamic variants,
full width, LTR/RTL, reduced motion and removal/remount cleanup. Initial styles
are compared while the Web hatch is blocked. Recipe checks compare the affected
family's metadata and initialized class branches. Captures cover light/dark,
390/820px and both width/direction choices.

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass the compiled fixture,
11 affected recipe comparisons, blocking initial-style parity and existing
form regressions. The initial-style comparisons include native search-input
geometry; the fixture asserts its border, padding and appearance reset.
Screenshots have been inspected in both engines, with the existing WebKit
compositor capture qualification limitation retained.

The family remains Partial. Full native ref/render/event forwarding, external
form/reset/defaultValue APIs, custom input replacement, native-platform support,
qualified Glass optical/device evidence and comparative performance remain open.
The explicit state model does not implement React context inheritance. These
checks do not establish that Exact avoids WebKit's live backdrop limitations.
