# Refactor Lenso Exact UI onto Exact primitives

> Verification correction (2026-11-12): prior path-prefix before/after browser
> comparisons did not isolate resources under Exact's root base URL. Their
> baseline/pixel-parity claims below are withdrawn pending independent-origin
> revalidation. Candidate-only behavior checks, compiler checks, source hashes
> and direct file sizes remain evidence for their stated narrower scope.
> See the correction section at the end.

## Intent

Use `@lenso/primitives-exact` as the reusable semantic/interaction foundation of
`@lenso/ui-exact`. Preserve caller-visible behavior, the Lenso appearance,
StyleX composition and the unmodified Exact pin. This audit is a migration plan,
not evidence that existing UI components have already migrated.

## Current evidence

Both packages target unmodified Exact 956ae33a35ffa5313d7be3cebc55ed84f9480e0a.
`primitives-exact` owns controlled contracts, IDs, commands and semantic intent;
Exact Host owns native behavior. It deliberately has no hatch, CSS or JS runtime.
See its API.md, COMPOSITION.md and VERIFICATION.md. Its core baseline passes,
but full modal lifecycle/focus/native accessibility coverage has known gaps.
Do not equate the package's existence with complete parity for every UI family.

The current UI package authors both native semantic controls and Web extensions.
Its presentation, Glass optics, anchoring, custom listbox behavior and motion are
not supplied by the primitive package. The unfinished SwipeActions work remains
unaccepted and must not become a migration prerequisite or regression baseline.

## Migration matrix

| Family                                | Existing primitive                                          | Work required before replacing UI implementation                                                                                                               |
| ------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text fields                           | Input, Textarea, Field, Fieldset, description/error         | Preserve name/form, required, labelledBy, autocomplete, rows and styling access; retain input/change/submit distinctions                                       |
| Checkbox/Radio/Switch/Slider          | Native controlled controls                                  | Preserve indeterminate, validation/form values, richer labels, vertical/range geometry and styling; avoid dropping live vs committed events                    |
| Disclosure/Accordion                  | Controlled state and named parts                            | Align panel/trigger IDs, retain animation, keyboard and hidden/inert behavior; establish styling on actual controls                                            |
| Tabs                                  | TabsList/Tab/TabPanel                                       | Preserve manual/automatic activation, focus model, indicators and layout; use stock AX limitations honestly                                                    |
| Dialog/AlertDialog                    | Native dialog and command parts                             | Preserve named content, confirmation, focus, scroll ownership and nested lifecycle; prove covered-modal isolation rather than deleting compensating code first |
| Popover/Menu                          | Native top-layer and command parts                          | Retain Floating UI placement, hover corridors, submenu/radio/checkbox behavior, modality and Glass; stock command support alone is insufficient                |
| Tooltip                               | Pure intent/deadline functions and explicit trigger/content | Reuse state transitions where possible; reconcile current provider API and app task scheduling before changing runtime ownership                               |
| Select                                | Native single select/options                                | Suitable for an explicit native-select path; not equivalent to the custom multiple/rich Glass listbox                                                          |
| Progress/Status/Separator/Link/Toggle | Corresponding primitives                                    | Candidate initial semantic migration once actual-node styling and public attribute forwarding are demonstrated                                                 |
| NumberField/List/SwipeActions/Glass   | No equivalent complete primitive                            | Keep as Lenso extensions; promote a headless interaction only after defining and testing its contract                                                          |

## Composition gate

The primitive public calls currently expose fixed props and slots, without
attribute spread, render/asChild, refs or transparent style forwarding. A styled
wrapper around an imported control does not automatically style the actual
control or forward its native attributes. Wrapper-only visual similarity is not
an accepted migration.

The pinned compiler rejects dynamic hatch bindings: contract/lower/src/dataset.rs
requires a literal hatch word. Adding a generic hatch string prop is therefore
not a working composition solution. Do not change the upstream SDK or silently
make the primitive core depend on Lenso's renderer to bypass this boundary.

Before replacing native nodes, compile a minimal imported Input/Tab/Popover
consumer demonstrating the intended appearance and attribute path. If the stock
compiler cannot express that path, resolve the composition API explicitly before
broad migration. Keep the current passing styled implementation in the meantime.

## Sequence and acceptance

1. Establish that composition probe and the ownership boundary. Preserve the
   headless entry, stock SDK support and existing primitive callers.
2. Migrate one simple semantic family with a before/after consumer, proving no
   loss of native props, controlled updates, appearance, focus or keyboard use.
3. Migrate fields and choices; then disclosure/tabs; then overlays. Record gaps
   instead of treating a less capable primitive as equivalent functionality.
4. Remove duplicate UI behavior only after the corresponding primitive-backed
   consumer passes affected browser checks. Keep Lenso optics/motion/positioning
   where the primitive has no matching responsibility.
5. Run affected formatting, lint, types and behavior checks, and light/dark plus
   narrow/wide rendering checks. Native acceptance remains a separate stage.

`packages/primitives` stays byte-for-byte unchanged. This plan does not authorize
SDK patches, publication or landing. Avoid changes to another chat's worktree
edits and preserve provenance for the source and runtime assets being checked.

## Stock compiler composition probe (2026-11-11)

Run `EXACT_CONTRACT_BIN=/absolute/path/to/contract bun run --cwd packages/ui-exact
probe:primitives` (one shell line). `EXACT_COMPOSITION_CACHE` selects an isolated
cache. The probe stages the primitive package's distributable files rather than
using workspace aliases. Existing primitive contract tests cover control enums
and command semantics, but not this UI styling composition boundary.

Five real compiler cases passed their expected outcomes: importing primitive
Input succeeds; adding `hatch` or `padding` to its component call fails with
`type-unknown-prop`; an outer padded box succeeds as two nodes, without passing
padding to the input; a dynamic native hatch fails with `lower-hatch-value`.
The current local receipt is
`/tmp/lenso-ui-exact-primitive-composition-20261111/verification.json`.
These are compiler checks, not browser appearance or behavioral migration proof.
No UI component has been replaced on the strength of them.

The next migration task is an actual-node styling composition design compatible
with the stock compiler and the primitive package's headless contract. Merely
adding a generic hatch prop is proven insufficient; do not bypass this with a
second copy of primitive controls or with a downgrade to host-default styling.

## First migration: Description

`Description(id, label)` delegates to `StyledFieldDescription(id, message)`.
The styled primitive is generated from canonical primitive FieldDescription,
including its props, semantic text node, ID and testId. The sole presentation
transform appends literal hatch/description metadata to that same node. There
is no additional wrapper, JavaScript interaction layer or hand-maintained second
semantic implementation. This is build-time source reuse, not transparent
attribute forwarding through the original component call.

Run `bun run --cwd packages/ui-exact generate:primitives`; the normal package
build runs it automatically. The primitive package is a development dependency;
the generated Contract and provenance ship inside components, so consumers do not
need the generator or a runtime primitive package. Generation currently expects
the monorepo source checkout. A changed native anatomy fails closed for review.
The output retains the full MIT notice and a canonical-source SHA256.

This demonstrates the mechanism for one text part. It does not establish that
Input, Tabs, overlays or Tooltip have migrated, nor does it settle their extra
attribute and behavior requirements. Extend the bridge explicitly per component,
with before/after evidence and source-drift checks.

### Description acceptance

An isolated compiled consumer passed Chromium and WebKit. Four description nodes
retain their tag, IDs, text, presentation metadata, parent relationship, zero
extra descendants, computed fonts/colors/padding and geometry. Sixteen Profile
captures (before/after, light/dark, 390/820px, both engines) have exact paired PNG
hashes. Existing form interactions pass on the migrated consumer, with empty
page/console errors. Generator drift/license tests bring the regression total
to 20 passing tests; current typecheck covers 83 files. Local receipt:
`packages/ui-exact/.cache/acceptance/primitive-bridge-acceptance.json`.
This proves one migrated part, not the full library or native/device acceptance.

## Second migration: TextArea

`TextArea` delegates to generated `StyledTextarea`. Its editing events,
controlled value, disabled/readonly behavior and native textarea node come from
canonical primitive Textarea. The bridge appends explicit name, labelledBy,
rows, required and variant props/attributes needed by the existing public UI API.
It preserves the canonical event bindings and adds no wrapper or extra local
state. A changed canonical readonly/input/change binding fails generation pending
review. Description and Textarea share generation/provenance infrastructure;
other controls remain hand-authored until their own compatibility gates pass.

### TextArea acceptance

The compiled consumer passes Chromium and WebKit against the preceding
Description-migration build. Four paired light/dark and 390/820px Profile captures
per engine match byte-for-byte (16 screenshots total). Native textarea identity,
name, rows, labels/descriptions, value, readonly/disabled/required state, parent,
computed styling and geometry match. Existing form editing/selection, readonly,
disabled and remount regression passes with no page/console errors. The fixture
uses the secondary grouped textarea; this is not a full variant or native gate.
Twenty-one tests and the 83-file typecheck pass. Receipt:
`packages/ui-exact/.cache/acceptance/primitive-textarea-acceptance.json`.

## Choice migration: Checkbox and Radio

Checkbox and Radio now render generated canonical primitive inputs inside their
existing Lenso presentation anatomy. Checkbox retains the bool event payload and
checked/disabled props; the UI adapter adds name, required, invalid and
indeterminate metadata. Radio retains name/value/string events and the canonical
selected-value comparison; the UI adapter adds description and validation props.

The existing UI Radio API accepts a bool `checked`. It maps true to its own value
and false to that value plus one space. The false marker is always distinct from
the original finite string; it is used only for the primitive's local equality
check. The actual radio value and submitted payload are never changed or parsed.
A compiled compatibility example checks both empty and whitespace-only values.

The source generator records field.contract and choice.contract fingerprints
independently. Native checked/change expression drift blocks generation pending
review. CheckboxGroup/RadioGroup and richer Switch/Slider behavior have not been
migrated by this slice; preserve those existing implementations until their own
API and composition requirements are resolved.

### Choice acceptance

Chromium and WebKit pass against the prior TextArea migration: four paired
Profile captures per engine match byte-for-byte (16 screenshots); native
checkbox/radio identity, values, checked/mixed state, name, validation,
description and parent anatomy match. Existing form keyboard selection,
disabled and remount checks pass with empty page/console errors. Independent
empty/whitespace radio checks prove bool adaptation and the native FormData
payload; that temporary form restores the input to its original parent. These
edge checks are wired into the regular browser entry. Twenty-two tests and the
83-file typecheck pass. Local receipt:
`packages/ui-exact/.cache/acceptance/primitive-choices-acceptance.json`.
This is not a full variant, physical-device or native-platform acceptance.

## Disclosure/Accordion root and trigger migration

Five parts now derive from canonical disclosure.contract: Disclosure,
DisclosureTrigger, Accordion, AccordionItem and AccordionTrigger. Public state
constructors share generated canonical state declarations, with the existing UI
Accordion layout/focus fields appended. The former UI accordion toggle/action
implementation is removed; the canonical primitive supplies expanded state,
disabled guards, single/multiple selection, collapse and its action payload.

Compatibility adaptations are explicit: generated triggers retain Lenso's
`-content` control target rather than primitive `-panel`; their names continue to
come from caller slotted content, so the primitive's explicit label prop/binding
is removed in the styled derivative. Literal bare-button presentation, focusability
and Lenso style/motion metadata are appended. AccordionItem also accepts UI state
for separator appearance. Before/after DOM and accessible-name checks cover this
adaptation; it is not transparent forwarding of the unmodified primitive call.

DisclosureContent and AccordionPanel remain the existing Lenso height/measurement
renderers. Canonical primitive panels switch display directly, which would remove
the current interrupted/reversed close animation. This slice preserves those
renderers and the animation/focus adapter rather than deleting behavior without
an equivalent primitive composition. Headings, indicators and bodies also remain
presentation-owned. No native/platform parity is inferred from Web evidence.

### Disclosure/Accordion acceptance

The isolated consumer passes Chromium and WebKit against the prior choices
migration. Closed/open Disclosure and Accordion DOM/layout/style snapshots match
in light/dark at 390/820px. Sixty-four before/after screenshots have exact paired
hashes. Existing disclosure regression covers keyboard navigation, nested and
single/multiple selection, disabled handling, focus restoration, retained draft,
height changes, mid-motion reversal, reduced motion and removal cleanup. A
separate named-button check confirms Details/Account/Privacy accessible names in
both engines. Page/console errors are empty. Twenty-three tests and the 83-file
typecheck pass. Local receipt:
`packages/ui-exact/.cache/acceptance/primitive-disclosure-acceptance.json`.
The full catalog browser suite and native/device behavior were not revalidated.

## TabsList migration (initial stage)

TabsList now delegates to a styled derivative of canonical primitive TabsList.
Its IDs, tablist role, label and orientation remain primitive-derived; the existing
Glass track/lens children remain in caller slots. Direction, size, disabled,
activation mode, loop focus and lens metadata are explicit UI adapter props.

The derivative maps primitive row layout to the pre-existing UI box and lets
StyleX own flex direction. It retains the UI's string orientation prop instead of
changing the public TabsState API to the primitive enum; the original primitive
entry and its enum contract remain unchanged. These are presentation/API
compatibility adaptations, not transparent attribute forwarding.

Tab and TabPanel remain Lenso implementations. The UI retains aria-disabled
focus handling, guarded/reselection activation, conditional aria-controls for
unmounted panels, keepMounted state and native panel focus rules. Directly using
the narrower primitive versions would drop those capabilities. The remaining
migration must resolve these differences explicitly before deleting that logic.

### TabsList acceptance

Chromium and WebKit pass against the previous disclosure migration. Eight
horizontal/vertical, light/dark and 390/820px cases per engine preserve native
nodes, tab roles/names/relationships, disabled/focus state, typography, flex
layout and geometry. Thirty-two before/after captures have exact paired hashes.
The existing Tabs behavior regression also passes, producing sixteen further
captures and covering automatic/manual activation, RTL, disabled/reselection
behavior, kept/unmounted panels, retained values, Glass, caller lift styling and
cleanup. Empty page/console errors are retained. Twenty-four tests and the
83-file typecheck pass. Receipt:
`packages/ui-exact/.cache/acceptance/primitive-tabs-acceptance.json`.
This does not establish complete Tabs primitive migration or native/device parity.

## Input migration: first compatibility candidate (superseded below)

Text/search/email/url/tel/password Input calls now delegate to generated canonical
StyledInput. Native editing, commit, submit, readonly, disabled, invalid and mode
mapping remain primitive-derived. UI name, labelledBy, autocomplete, required and
variant attributes are explicit additions on the same native node. Public props
remain unchanged. Other Input type calls retain the original UI native renderer;
this is a partial migration rather than deleting those existing capabilities.

A real compiler probe exposed a pre-existing SDK boundary: passing an arbitrary
runtime type string fails in the old renderer too (`lower-input-type`). Dynamic
text-mode choices must be expressed as literal text-mode branches. The consumer
fixture exercises those six dynamic modes plus a separate static numeric input;
it does not promise unsupported mixed-kind runtime switching. The rejected
single-node legacyType experiment was removed. The preserved renderer handles
static legacy types; the six text modes stay in their migrated branch.

The compatibility helper checks the same native node and focus survive text-mode
switching; live/commit/Enter actions, editing selection, readonly/disabled state,
autocomplete, name, required and static numeric value/type are covered. It is
wired into the regular browser entry. The before/after fixture is the same source
in isolated old and migrated consumers, rather than inferring baseline behavior.

### Input acceptance

Both isolated consumers compile against the stock SDK. Chromium and WebKit pass
before/after comparison for all six dynamic text modes, including node identity,
focus, live/commit/Enter events, selection, readonly and disabled state. Static
number type/value checks also pass in the unchanged legacy path. Existing form
regression passes; sixteen paired light/dark and 390/820px Profile screenshots
match byte-for-byte. Page/console errors are empty. Twenty-five tests and the
83-file typecheck pass. Local receipt:
`packages/ui-exact/.cache/acceptance/primitive-input-acceptance.json`.
The receipt records generated app sizes; no performance improvement is claimed.

## Input compact projection (current)

The branch-based Input derivative added 48,306 bytes to the fixed fixture's
`.gen/app.js`. The current adapter uses a single generated native node instead.
It first requires the original six-mode enum and exact native mode expression;
that canonical expression is identity over its declared enum. The styled UI
projection can therefore use the unchanged public string type directly on the
same native node. This widens only the private styled derivative to the existing
UI API; the original primitive's enum API is unchanged. Enum expansion or a
non-identity canonical mapping fails generation pending review.

The UI wrapper now has one StyledInput call, with no copied legacy renderer or
runtime branch between primitive and legacy nodes. Existing static types retain
the original native `type` projection. The stock compiler still rejects an
arbitrary runtime type string (`lower-input-type`); a separate compile probe
confirms that boundary after this change.

The same fixture produces 1,221,618 raw app-script bytes, down from 1,269,968 in
the branch candidate and 44 bytes below the 1,221,662-byte original native UI
baseline. These are generated script sizes, not download or runtime speed claims.

### Compact Input acceptance

Chromium and WebKit pass against the branch candidate with the same consumer
fixture. Six text modes retain node identity/focus, event payloads, commits,
Enter, selection, readonly and disabled behavior; static number type/value checks
pass too. Existing forms pass and sixteen paired light/dark, 390/820px captures
match byte-for-byte. Page/console errors are empty. Twenty-six tests and the
83-file typecheck pass. Local receipt:
`packages/ui-exact/.cache/acceptance/primitive-input-compact-acceptance.json`.
Input's generated renderer is migrated, but complete variants and native/device
acceptance remain separate work; runtime performance has not been measured here.

## Tab and Panel native-node migration (current)

TabsTab and TabsPanel now delegate to generated canonical Tab/TabPanel nodes,
completing the native-node migration of all three primitive Tabs parts. Existing
UI wrappers preserve public props, callback guards and `keepMounted`. Navigation,
Glass, motion and dynamic association repair remain Lenso enhancements.

Compatibility adaptations are explicit. Tab keeps the primitive role, label,
selection comparison and value activation payload. The wrapper forwards the
payload through its existing disabled/reselection guard. Native disabled is
passed false, preserving the existing UI's aria-disabled focus contract; the
actual inactive flag controls aria-disabled, initial tabindex and metadata.
Initial aria-controls remains conditional on selection, with the existing Web
adapter repairing associations only for mounted panels.

Panel retains primitive ID/labelled-by semantics and slot content. Its native
column is projected to the existing UI box, selected-only initial tabindex and
aria-hidden metadata. The primitive's direct display/inert fields are replaced
by the pre-existing StyleX display policy, while the UI conditional controls
mounting. This keeps the old Web behavior; it does not claim that the raw
primitive visibility policy was retained or that native platforms are validated.

Generator drift guards cover canonical activation arguments, panel relationships
and visibility clauses. A change to those source contracts requires review.

### Tab and Panel acceptance

Chromium and WebKit pass against the compact Input candidate. Tab roles, labels,
selection, target associations, disabled/focus state, panel relations and geometry
match across eight orientation/theme/width cases per engine. Thirty-two paired
before/after captures have equal hashes; the existing Tabs regression adds
sixteen captures and passes automatic/manual activation, RTL, disabled items,
callback rejection/reselection guards, dynamic/kept panels, retained draft,
caller style composition, Glass and cleanup. No page/console errors are recorded.
Twenty-seven tests and the 83-file typecheck pass. Raw fixture app scripts are
1,221,618 bytes before and 1,221,709 after; this is not a speed measurement.
Receipt: `packages/ui-exact/.cache/acceptance/primitive-tab-parts-acceptance.json`.
The full library, full variants and native/device gates remain open.

## Modal/AlertDialog native dialog and command migration

Eight parts now derive from canonical dialog.contract: Modal and AlertDialog
roots; each family's Trigger, Close and CloseIcon. Literal show-modal/close
commands, target/ID wiring, native disabled behavior and dialog/alertdialog roles
remain primitive-derived. Existing popup/content/backdrop renderers and Web
focus, nesting, scroll and exit-animation ownership remain UI enhancements.

Compatibility adaptations preserve the UI API: labelledBy is added to both
roots; Modal's dismiss string replaces the primitive's fixed closerequest value;
AlertDialog retains its old explicit closerequest policy. Buttons receive bare
presentation, tabindex and Lenso style metadata. AlertDialogClose keeps its
initialFocus/autofocus prop. Fixed close-icon SVG content remains authored in the
UI slot. No extra native wrapper is introduced.

ModalAction and AlertDialogAction remain the existing native action buttons.
The primitive DialogAction closes unconditionally, while UI validation/save
callbacks intentionally leave invalid dialogs open. Replacing these with an
automatic close command would change behavior; the migration does not do that.
Stock primitive/SDK focus and lifecycle limitations are not claimed repaired or
validated on native platforms by this Web migration.

### Dialog parts acceptance

Chromium and WebKit pass against the prior Tab/Panel migration. Eight
Modal/AlertDialog, theme and width cases per engine preserve native dialog
roles/names/relations, closedby, modal state, initial focus, popup geometry and
button command/disabled/autofocus metadata. Thirty-two paired popup captures
match exactly. Existing Modal and AlertDialog regression adds sixteen captures
and passes validation veto, nested focus, dismissal, scroll ownership, motion,
reduced motion and removal cleanup. Four motion logs and empty page/console
errors are retained. Twenty-eight tests and the 83-file typecheck pass. The raw
fixture script changes from 1,221,709 to 1,221,712 bytes, not a speed measurement.
Receipt: `packages/ui-exact/.cache/acceptance/primitive-dialog-parts-acceptance.json`.
Optical quality, complete variants and native/device gates remain separate work.

## Popover positioner/invoker migration

PopoverPositioner, PopoverTrigger and PopoverClose now delegate to derivatives
of canonical Popover/PopoverTrigger/PopoverClose. Native auto top-layer presence,
IDs, targets, labels and disabled controls are source-derived. Root/Portal layout
wrappers, the named Popup, arrow, viewport, Floating UI tracking, hover corridors,
modality integration and Glass remain UI enhancements.

The UI positioner is a presentation box, while the inner Popup owns the accessible
dialog name/description. The derivative therefore projects the primitive column
role/dialog label to the existing presentation container and removes its label
prop. Placement, direction, offsets and collision/tracking fields are explicit
UI metadata props. Trigger retains the old explicit toggle action and hover
configuration. Close projects canonical hide-popover intent to the pre-existing
popovertarget/hide attributes, preserving the invoker contract the UI adapter
observes. These adaptations preserve the UI's actual node tree, not the raw
primitive component's complete public rendering contract.

Native invoker, auto-popover and hide-command changes in canonical source fail
generation for review. The upstream SDK and headless primitive source remain
unchanged. This slice does not migrate Menu, Select or Tooltip, whose richer
interaction/lifetime contracts require independent compatibility work.

### Popover migration evidence and open observation

The final isolated Chromium/WebKit cohort passes: sixteen paired popup captures
match exactly across theme/width cases, and normal/hover regression adds sixteen
captures. Each engine passes 36 geometry endpoints, eight hover routes/44 trace
transitions and a mobile-browser touch fixture. Desktop page/console and mobile
page errors are empty. Twenty-nine tests and the 83-file typecheck pass. Source
fingerprints and runtime assets are recorded in
`packages/ui-exact/.cache/acceptance/primitive-popover-acceptance.json`.

A WebKit focus-ring comparison initially sampled different modality readiness;
the driver now waits for the real shared observer before pointer input and records
matching pointer modality. Two isolated focus probes also agree. No production
focus behavior was changed to force the comparison.

One Chromium right-side diagonal hover assertion failed in an intermediate run.
Old/new independent pairs and the final full run pass; the cause is not established.
This observation remains OPEN, not fixed or attributed to the environment. Full
Popover family acceptance is not claimed by the native-part migration.

## Verification correction and Menu migration (2026-11-12)

The old comparison servers served before/after pages under path prefixes, but
Exact emits a root base URL. A before page could therefore execute the after
application. Those historical paired screenshots, focus probes and old/new hover
attributions are invalid comparisons. Ten local receipts explicitly withdraw
their baseline claims. Candidate-only behavior checks and direct artifact hashes
retain their narrower meaning. The unexplained hover failure remains open.

The replacement driver `test/primitive-migration.mjs` serves each compiled
consumer at a separate origin and validates the actual response bytes for its
application script against the corresponding artifact. Its regression test
catches root-base resource mixing. The controlled baseline replaces only the
seven pre-migration Contract modules (forms, disclosure, tabs, modal, alert-dialog,
popover and menu), using the current runtime, tokens, Glass and consumers for
both sides. This is a new controlled comparison, not restored historic evidence.

Menu now derives seven native parts from canonical primitive source: positioner,
trigger, item, action, checkbox item, radio item and submenu trigger. Styling and
UI metadata are projected onto those actual controls. The UI retains link items,
positioning, hover, modality, navigation and Glass. Canonical native role,
activation and target changes fail generation pending review.
