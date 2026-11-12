> Archived direction: Exact development was paused on 2026-11-13. See the [retirement and recovery record](../archive/exact/README.md). The evidence below remains historical and cohort-specific.

# Refactor Lenso Exact UI onto Exact primitives

> Verification correction (2026-11-12): prior path-prefix before/after browser
> comparisons did not isolate resources under Exact's root base URL. Their
> baseline/pixel-parity claims below are withdrawn. The separate controlled
> independent-origin comparison is recorded at the end. Candidate-only behavior checks, compiler checks, source hashes
> and direct file sizes remain evidence for their stated narrower scope.
> See the correction section at the end.

## Intent

Use `@lenso/primitives-exact` as the reusable semantic/interaction foundation of
`@lenso/ui-exact`. Preserve caller-visible behavior, the Lenso appearance,
StyleX composition and the unmodified Exact pin. The matrix records the original
audit; the dated sections below record implemented slices and their evidence.

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

Reproduce with two isolated compiled output directories:

```sh
EXACT_BEFORE_DIST=/absolute/baseline/dist EXACT_AFTER_DIST=/absolute/candidate/dist EXACT_MIGRATION_MENU_BEHAVIOR=1 bun packages/ui-exact/test/primitive-migration.mjs
```

`PLAYWRIGHT_MODULE` may select an already installed Playwright module when its
browsers are available. `LENSO_EXACT_TEST_ARTIFACTS` selects the evidence folder.
The driver requires distinct origins, validates script response fingerprints,
compares selected DOM semantics and geometry, and checks exact screenshot hashes.
Screenshots establish parity only in the recorded browser capture surface;
WebKit native-window backdrop optics and physical-device behavior are separate.

A first independent-origin run passed Chromium but failed a WebKit narrow-light
Modal image comparison. The semantic/layout snapshot matched; image differences
included page content exposed through transparent modal corners. Other popup
images also exposed differing background content. The reused page could carry scroll restoration across capture setups. The follow-up uses a fresh page for each
scenario and explicitly scrolls its invoker before opening; the original failure
and hashes remain in `primitive-independent-origins/failed-webkit-comparison.json`.
Treat scroll restoration as a diagnostic explanation, not a product fix. The
follow-up result is recorded separately; historical comparisons stay withdrawn.

### Controlled result

Chromium 156.0.8078.4 and WebKit 27.2 pass 80 paired cases in total: ten selected
examples, two widths and two themes per engine. Each pair has identical selected
DOM semantics/layout and exact screenshot hashes. Response fingerprints prove
that each side executed its own distinct application script. The common runtime,
token, Glass and consumer source basis contains 389 byte-identical files.
Chromium used the initial independent-origin run; WebKit used the fresh-page
follow-up. Original WebKit mismatch artifacts remain preserved, without changing
product code to make screenshots agree.

Each engine also passes Menu's 36 geometry endpoints, 12 submenu cases, modal
pointer/scroll/focus behavior, MenuBar composition and browser touch fixtures.
Page/console errors are empty. The focused package suite passes 31 tests with
108 assertions; the typecheck covers 85 files. Affected lint and formatting pass.
Receipt: `packages/ui-exact/.cache/acceptance/primitive-controlled-migration-acceptance.json`.

This result covers selected examples rather than the full component catalog or
all previous historical scenarios. It does not close the unexplained Popover
hover observation or establish physical-device, optical or performance acceptance.
Both primitive packages and the upstream Exact SDK remain unchanged.

## Color input reuse (2026-11-12)

ColorField reuses the canonical Input derivative. ColorSlider and ColorArea reuse
a guarded derivative of canonical choice.Slider for their actual native range
nodes. These extensions retain whole-color ownership in the application and add
color-model projection in the UI adapter; the primitives and pinned Exact SDK
remain unchanged. ColorArea uses two ranges for accessible axes and atomic
pointer proposals rather than copying the primitive range's one-axis controller.

Focused ColorArea checks pass Chromium/WebKit keyboard, pointer, RTL, controlled
rejection, native form/reset, removal/remount and theme/width captures. Both pass
native taps; Chromium also passes a continuous two-axis native touch sequence.
These are candidate-only behavior and rendering checks, not a before/after
performance or geometry-parity claim. Receipt:
`packages/ui-exact/.cache/acceptance/color-areas-focus-final/acceptance.json`.
Broader API, source geometry/motion and device coverage remain open; see
`packages/ui-exact/COLOR_AREA.md` and the component coverage inventory.

## ColorPicker composition (2026-11-12)

The picker trigger is a separately guarded derivative of canonical
PopoverTrigger, preserving the actual native target, disabled state and rich
content slot. The positioner reuses PopoverPositioner. Lenso owns popup naming,
medium Glass geometry, preference fallback and the existing color-control
composition; the caller owns the shared value. No primitive or SDK change is
required. Automatic child context and controlled-open APIs remain explicit gaps.

Chromium/WebKit pass the focused color synchronization, editable/locked/rejected
state, keyboard dismissal and return focus, outside dismissal, removal/remount,
contrast fallback and mobile-browser tap fixtures. Eight theme/width captures
are retained. Receipt:
`packages/ui-exact/.cache/acceptance/color-pickers-ready/acceptance.json`.
These checks establish selected candidate behavior and rendering; they do not
establish reference optical/motion parity, physical devices or performance.

## ListBox extension boundary (2026-11-12)

The canonical primitive package has no ListBox contract. The new UI ListBox is
therefore an explicit Lenso extension, not a claimed primitive migration. It uses
shared source ListBox recipes and controlled key arrays with scoped Web focus,
typeahead and range selection. A positional scalar mask avoids splitting authored
key strings. The pinned compiler's unsupported ARIA declarations are projected by
the Web adapter; the SDK and primitive packages remain unchanged.

The isolated consumer passes the focused Chromium/WebKit behavior and mobile
browser tap checks; eight theme/width captures are retained. Receipt:
`packages/ui-exact/.cache/acceptance/list-boxes-final/acceptance.json`.
Virtualization, drag/drop, broader APIs, reference motion, initial semantics and
native/device coverage remain open. This does not establish ComboBox or TagGroup
completion, nor does it provide a performance comparison.

## TagGroup collection reuse (2026-11-12)

Tag/TagGroup have no equivalent canonical headless primitive. This slice extends
the existing Lenso collection controller and extracts its scalar selection bridge
rather than adding another selection owner. Grid rows/cells retain the shared
Tag recipes and small material. Removal is parent-controlled: selected-key cleanup
and next/previous/group focus occur only after the requested row disconnects.

The isolated stock consumer passes Chromium/WebKit Tag selection/removal,
rejection/deferred confirmation, focus, state/size/variant, contrast and touch-tap
checks. The same compiled runtime passes ListBox's full focused behavior suite.
Receipt: `packages/ui-exact/.cache/acceptance/tags-readable/acceptance.json`.
Broad context/native APIs, optical/motion qualification, initial semantics and
physical/native adapters remain open. The primitive packages and SDK are unchanged;
this does not establish ComboBox or full catalog completion.

The initial selected-hover Tag capture exposed a low-contrast pair in the shared
source recipe. An explicit Exact presentation adaptation uses native contrast-color
against the unchanged hover fill. Chromium/WebKit qualify computed selected-hover
text contrast at 4.76:1 light and 7.39:1 dark, with the full focused Tag and ListBox
checks still passing. The fallback for browsers without contrast-color is authored
but untested in an unsupported browser. Shared tokens/original React UI are unchanged.

## ComboBox native-node reuse (2026-11-12)

ComboBox's Input derives from canonical field.Input. Its popover positioner and
invoker derive from Popover/PopoverTrigger; native option buttons derive from
MenuItem with explicit role and close-policy projections. Code-generation guards
reject canonical event/target/command drift. The closed input uses native form
submission; the open widget owns Enter selection. Primitives and SDK are unchanged.

Shared ComboBox recipes retain field/popup presentation. Web behavior owns virtual
focus, locale filtering, groups, status, chips and placement, while caller actions
own selected keys and displayed text. Native-button border-box/text alignment
adaptations preserve source item geometry. Mouse-only pointer prevention retains
WebKit touch activation. These are documented UI projections rather than raw
primitive semantic parity or an additional selected-value owner.

The isolated stock consumer passes focused Chromium/WebKit behavior, native form/
reset/external association and mobile-browser tap checks. Sixteen variant/theme/
width captures retain option geometry checks. Receipt:
`packages/ui-exact/.cache/acceptance/combo-boxes-layout/acceptance.json`.
Advanced collection/render/native APIs, initial readiness, reference motion/optics
and native/physical-device qualification remain open. No performance comparison
is inferred from this slice or its generated asset sizes.

## ToggleButton and Link native-node reuse (2026-11-12)

ToggleButton delegates to a guarded derivative of canonical Toggle, retaining its
controlled boolean inversion, disabled activation and child slot. Link delegates
to canonical Link with explicit UI projections for target, disabled href removal,
ARIA and tab order. Both add presentation metadata on the actual native node;
neither adds a wrapper or another state owner. Existing public UI props and the
primitive packages remain unchanged. The generated files retain the MIT notice
and canonical button-source hash. Drift tests reject changed activation, pressed
semantics, disabled behavior, navigation nodes and href bindings.

Progress, Status and Separator are not interchangeable with every existing UI
feedback component: the primitive Progress is a native progress node, Separator
is an hr, and Status accepts text rather than arbitrary SVG content. Switch also
uses a different native control and the UI retains readonly/form behavior.
Tooltip's explicit app scheduling differs from the existing provider contract.
These require their own compatibility decisions rather than blanket replacement.

The isolated stock baseline and candidate pass 16 paired render cases across
Chromium and WebKit, two widths and two themes. Selected DOM semantics, computed
styles, geometry and screenshot hashes match in every pair (32 captures).
Each origin's actual app.js response is fingerprinted. Both engines pass the
existing Toggle and Navigation behavior suites, including keyboard activation,
disabled links, target windows, dynamic state and removal/remount. Page and console
errors are empty. The package suite passes 61 tests / 214 assertions; typechecking
covers 112 files, and affected lint/format checks pass. Receipt:
`packages/ui-exact/.cache/acceptance/button-link-primitives/acceptance.json`.
`verification.json` confirms the six affected implementation/guard files match
the built candidate. This slice establishes selected Web compatibility, not a
performance improvement, native/device acceptance or full migration completion.

## Autocomplete popup-search composition (2026-11-12)

Autocomplete derives its search node and popup/trigger/options from the guarded
ComboBox native derivatives. The outer trigger is a tab stop and owns the closed
selected-value display; search remains inside the popup and is distinct from
selected keys. Both families share one scoped collection controller, with explicit
popup-search focus, query-clear and close policies. The application owns all
selection/query acceptance. Shared Autocomplete recipes and a scoped native-border
adaptation preserve the ordinary popup/field boundary; primitives and SDK stay
unchanged. The runnable example exercises compound grouped single selection and
convenience multiple selection with chips inside the external field.

Chromium/WebKit pass the focused behavior, forms/reset/external association,
lifecycle, synthetic composition and native tap suites. Sixteen popup and sixteen
field captures cover variants, themes and widths; selected geometry is asserted.
Receipt: `packages/ui-exact/.cache/acceptance/autocomplete-borderless/acceptance.json`.
The same shared-controller source passes ComboBox's full focused suite in the
preceding popup candidate; the final changes affect Autocomplete presentation and
its grouped example. Original border captures are retained. Broader APIs, initial
readiness, loading/virtualization, reference motion/optics and native/device gates
remain open in AUTOCOMPLETE.md. No performance gain is claimed.

## InputOTP real-editor composition (2026-11-12)

InputOTP's real slots derive from canonical Input through a guarded derivative,
retaining IDs, disabled/readonly, native editors and generated MIT provenance.
Slot events feed one aggregate controlled Contract request; they do not mirror a
second code state. The UI adapter adds contiguous character replacement, paste,
acknowledged focus requests, completion and native form integration.
Shared OTP recipes cover ordinary and explicit floating Glass fields. Exact's
native border/corner defaults require an explicit scoped presentation adaptation;
no primitive package or SDK modification is required.

The first browser run exposed lost characters during uninterrupted typing when
focus waited two animation frames. Accepted values now advance focus on the
parent acknowledgement; rejected requests retain the current location. Both
engines pass the resulting focused behavior/form/native-tap suite. Thirty-two
final captures verify the affected themes, widths, surfaces and round bounds.
Receipt: `packages/ui-exact/.cache/acceptance/otp-round-normalized/acceptance.json`.
A separate same-candidate check verifies Glass editing and remounting. Earlier
failed typing/corner observations remain preserved. Reference optics, broader
APIs and physical/native acceptance remain open; see INPUT_OTP.md. This is
candidate behavior/rendering evidence and does not establish a performance gain.

## PopupButton composition (2026-11-12)

PopupButton reuses the shared ordinary button/indicator recipe. Ordinary actions
use Exact's native button, as the canonical primitive package intentionally has
no generic Button wrapper. PopupButtonMenuTrigger derives from PopoverTrigger on
the actual control, retains Menu metadata and reuses its keyboard/placement/focus
controller. An explicit presentation marker excludes Glass trigger styling and
optics. PopupButtonSelectTrigger composes the existing SelectTrigger without an
extra node or selected/open state; it retains the custom Select's richer model.

The isolated stock consumer passes focused Chromium/WebKit initial style,
activation, selection/rejection, keyboard, readonly/disabled, RTL, dismissal,
removal/remount and native tap checks. Twenty-four captures cover the three
compositions and their popup surfaces across themes/widths. Receipt:
`packages/ui-exact/.cache/acceptance/popup-button-settled/acceptance.json`.
Fixture cleanup now awaits outstanding module handlers; captures await finite
transitions and compare transparent colors by alpha rather than invisible RGB
channels. Original failures remain preserved. Generic attribute/ref/render APIs,
submit/reset consumer flows and native/optical gates remain in POPUP_BUTTON.md.
The primitive packages and SDK remain unchanged; no performance gain is inferred.

## SectionIndex native-link foundation (2026-11-12)

SectionIndex items derive from canonical Link while the UI owns roving focus,
nearest-enabled pointer scrubbing and optional scrollport navigation. The caller
owns current location; an explicit hasValue flag preserves empty-key identity.
Native hrefs and modified activation remain available. Scoped local navigation
runs before the stock router's document-capture handler using a filtered window
capture listener, released with the controller. No SDK or primitive change is
required. The existing shared narrow-index recipes remain the visual source.

The isolated stock consumer passes focused Chromium/WebKit keyboard, fragment,
opaque-key, rejection, pointer/cancellation, scoped-scroll, dynamic/disabled/RTL,
remount and browser-tap checks. Chromium adds a continuous native touch sequence;
WebKit continuous touch remains open. Thirty-two index and thirty-two content
captures retain size/alignment/containment assertions. The final example fixes
its flex parent rather than changing the source rail width. Receipt:
`packages/ui-exact/.cache/acceptance/section-index-layout/acceptance.json`.
Existing link/navigation regressions pass both engines with isolated outputs.
Earlier fixture observations remain preserved; broader native/event/ref, initial
local-scroll and source/device gates remain in SECTION_INDEX.md. No performance
improvement or full catalog completion is inferred.

## TabBar destination and lifecycle composition (2026-11-12)

TabBar's native destination nodes derive from canonical Link; actions use Exact's
native buttons under the primitive package's documented Button boundary. Nav and
list roles retain destination semantics instead of borrowing content Tabs roles.
The source TabBar motion is adapted without React lifetime hooks, retaining
pointer selection, variable-width indicator geometry, copied-content ID hygiene,
refraction and spring return. Its minimization spring remains alive through
controlled reversals. The app owns activation/current route and minimized state;
scroll requests retain the source's threshold/direction/top-edge rules.

Scoped window click arbitration precedes the stock router so a drag's trailing
native click cannot navigate twice. Minimized normal lists are inert and restore
keyboard focus through the explicit expand action; separate actions remain live.
Shared material/knob helpers and TabBar recipes remain responsible for rendering,
with deferred material optics during resizing. Primitive packages and SDK are
unchanged.

The isolated stock consumer passes focused Chromium/WebKit navigation, native
actions, rejected requests, drag activation, minimize focus, scroll behavior,
phone/tablet/RTL and remount checks. Both pass taps; Chromium adds continuous
touch. Thirty-two final captures retain dimensions and indicator assertions.
Receipt: `packages/ui-exact/.cache/acceptance/tab-bar-keyboard/acceptance.json`.
Earlier cross-frame reversal sampling, native WebKit pointer-focus assumptions
and stage-width observations are retained. Initial minimized markers, broader
APIs, full reference motion/optics and native/device gates remain in TAB_BAR.md;
no performance improvement or full catalog completion is claimed.

## ToggleButtonGroupItem composition (2026-11-12)

The group item now derives from canonical Toggle through the same guarded
build-time bridge as ToggleButton. Canonical `change(not pressed)` supplies the
next boolean; the existing group action maps it into its single/multiple string
selection. Disabled checks, direct native-button anatomy, child slots,
presentation metadata and group keyboard ownership are preserved. Both primitive
packages and stock Exact remain unchanged. Drift coverage rejects a changed
canonical inversion and checks the derivative's native anatomy and group metadata.

The isolated before/after consumers exclude the unfinished RefreshControl draft
and its generated status output in both cohorts. Only the isolated generators
omit that output; the workspace draft is preserved. The unfiltered workspace
currently fails the manifest data-word test and production's missing-initial-
presentation gate on that draft. Those are not claimed as passing full-workspace
checks. The isolated candidate passes 71 tests / 276 assertions, the workspace
127-file typecheck and affected lint/format checks pass. Detailed browser results
are recorded in `packages/ui-exact/.cache/acceptance/toggle-group-primitives/`.
This slice does not change the Progress/Status/Separator, native Switch or
Tooltip compatibility boundaries described above, and makes no performance claim.

Both Chromium 156 and WebKit 27.2 pass the existing Toggle behavior suite. Sixteen
paired group cases (two engines, two widths, two themes, joined/detached) retain
identical selected DOM semantics, geometry and PNG hashes: 32 comparison captures.
The group is captured after changing selection, and behavior additionally covers
single/multiple/empty selection, disabled controls, nested groups, RTL/vertical
keyboard navigation, full-width geometry, Reduced Motion and removal/remount.
`acceptance.json` fingerprints each origin's actual app.js response;
`verification.json` records the snapshot exclusions and confirms the two changed
Contract implementations match the candidate. Representative candidate images
were visually inspected. Native/device acceptance remains separate.

## RefreshControl completion of the pending Web slice (2026-11-12)

RefreshControl now integrates its public Contract parts, ordinary shared token
recipes, initialized Web lifecycle and literal initial styles. Its live text
status derives from canonical primitive Status with guarded anatomy and full MIT
provenance. Trigger activation uses Exact native buttons under the primitive
package's documented ordinary-button boundary. The application owns operation
status, generation and async work; the controller owns touch intent and transient
presentation only. The root example actually schedules timed success/failure,
supports synchronous completion and invalidates old deadlines when removed.

This resolves the unfinished-draft manifest/initial-presentation blockers recorded
in the ToggleButtonGroupItem slice. The final isolated stock consumer includes all
current component files without draft exclusions. It passes compilation with six
existing diagnostics from unrelated families. Both primitive packages and the
SDK remain unchanged. The package suite passes 74 tests / 293 assertions,
128-file typechecking and affected lint/format checks. StyleX duration composition
was corrected to retain source 180ms return timing together with zero-duration
pulling/Reduced Motion; supported literal metadata hides inactive parts where the
stock compiler rejects native `hidden` declarations.

Chromium/WebKit pass controlled outcomes, real timed completion/failure, retry,
request rejection, synchronous generation acknowledgement, repeat protection,
disabled result settlement, draft preservation, stale deadline cancellation and
remount. Synthetic touch checks cover axis/slop/resistance, cancellation,
default-prevented and multiple touches, top-edge ownership, editable/list/swipe
exclusions, click suppression before stock routing and eligible detached-node
cleanup. Both engines pass native mobile-browser trigger taps; Chromium also
passes a continuous native pull. Twenty-four initialized captures cover
complete/refreshing/error, two themes and 390/820px with geometry assertions.
Six blocked-hatch captures verify idle/refreshing/error at 390px/light, including
native trigger dimensions, offsets, arrow/spinner/error display and live text.
The existing navigation suite passes both engines with the window listener active.

Receipts are `.cache/acceptance/refresh-control-events/acceptance.json`,
`refresh-control-duration-initial/acceptance.json` and
`refresh-control-cleanup/acceptance.json`. The final verification file confirms
13 implementation files match the candidate and records the later strengthened
cleanup helper run. Earlier failed touch-constructor and duration candidates are
retained. REFRESH_CONTROL.md records broad API/initial-matrix/native/device gaps;
the family moves from Pending to Partial. This does not complete the full catalog
or infer a performance gain. Package test-script metadata and final documentation
were updated after the compiled candidate; no publish or landing was performed.

## ContextMenu pointer-root composition (2026-11-12)

The ordinary ContextMenu popup composes the canonical native Menu derivative,
shared Menu items/submenus, existing Glass material and an optional Floating UI
virtual reference. Context triggers are focusable area nodes, matching the
source area trigger rather than adding a button around arbitrary content. Their
right-click, Shift+F10 / ContextMenu key and 500ms/10px long-press intent delegates
to the same Menu owner. Multiple triggers update the active opener; removing the
active target closes its popup. The native context backdrop is outside content
for release arbitration even though it lives inside this top-layer root.

Native release observations exposed two distinct sequences: WebKit can dismiss
before the opening right mouseup; Chromium touch can dismiss after the later
compatibility mouseup. Bounded opening-gesture handling preserves the native
`popover=auto` contract, uses physical event timestamps through synchronous
rendering delays, and waits for the compatibility default action where needed.
New input, keyboard dismissal, outside focus and unmount cancel the handler.
Explicit prior dismissal and genuinely held releases remain authoritative.
No second open state, replacement renderer or SDK patch is introduced.

The stock consumer builds all current files without exclusions and retains the
six prior SDK warnings from other families. Package checks pass 75 tests / 299
assertions, 130-file typechecking and affected lint/format. Both primitive
packages are unchanged. The context positioner bridge retains canonical Menu's
role/top-layer node and full generated MIT provenance; trigger adaptation retains
Base UI's full MIT license in its source file.

Chromium/WebKit pass the focused context behavior suite and existing ordinary
Menu regressions. Sixteen context captures cover two widths, themes and text
directions with popup geometry checks. Both pass native mobile taps; Chromium
adds continuous native long-press/release/item activation. Separate native release
checks cover both engines' backdrop, Escape, explicit close, held outside release
and a bounded 650ms processing stall. Two default-modal viewport captures were
inspected alongside representative popup images. Network receipts fingerprint
both actual app.js and the separately delivered Web runtime module; controller
changes need not change the Contract script.

Final receipts live in `.cache/acceptance/context-menu-compatibility/`,
`context-menu-compatibility-touch/` and `context-menu-compatibility-cancel/`.
Earlier point/release/native-touch failures and diagnostic timestamp traces are
retained for their narrower observations. The family moves Pending to Partial:
preview/return animation, preview layout, compact bar/expansion, full callbacks /
controlled/native composition, optical/motion parity and native/device gates remain
in CONTEXT_MENU.md. The full catalog objective is unchanged. Test-command metadata
and final documentation were updated after the compiled candidate; no publication
or landing is performed.

## ContextMenu compact action and expansion composition (2026-11-12)

ContextMenuBarItem and the More action derive from canonical MenuItem, preserving
native activation/disabled/close commands, literal presentation metadata and the
full generated MIT notice. ContextMenuBarPopup shares the actual popup anatomy
with ordinary MenuPopup through an internal presentation part; the existing
public MenuPopup props, native node, IDs and slots are retained. Compact styles
come directly from the shared ContextMenu/Menu recipes. The application owns the
compact flag, acknowledges reset on opening and conditionally mounts the compact
or full branch. Host popup-open ownership is unchanged.

The controller adds horizontal/RTL arrows with disabled skipping, per-open reset,
focus handoff when More unmounts and source 600/46 expansion geometry. Captured
compact bounds are retained while placement settles. CSS transform transitions
are suspended while the spring drives the transform, then the original inline
transform/origin/transition are restored. Reduced Motion and close/removal stop
that work. Rejected expansion leaves the compact branch authoritative.

Stock consumer builds include all files, with six existing unrelated SDK warnings.
Package checks pass 76 tests / 307 assertions, 131-file typechecking and affected
lint/format. Both primitive packages remain unchanged. Chromium/WebKit pass
compact/full keyboard interaction, RTL, reset, rejection, Reduced Motion, removal
during motion and continuous geometry samples. Sixteen compact/full captures
cover two themes and widths, including 44px compact height and 22/34px radius.
Native mobile More/action taps pass both engines; Chromium additionally opens
with a continuous native long press. Ordinary ContextMenu/Menu regressions pass
both engines on the shared-anatomy recipe candidate.

Blocked-module checks exposed overlapping ordinary/compact initial aliases.
Because aliases preserve atomic specificity via :where, the cases now explicitly
exclude the replacement presentation rather than depending on extra selector
specificity. Final style-only fixtures pass both engines at 390px/light with
250x44 popup geometry, 22px radius and 36px actions. They explicitly place a native
popup and do not claim pre-hatch point interaction or keyboard orientation.

The final disjoint-selector candidate has its own build, initialized bar replay
and blocked-module receipts. The earlier recipe candidate's native-touch and
ordinary-menu receipts retain their cohort hashes; its atomic CSS and initialized
presentation function are unchanged by the selector-only fix. Verification records
that boundary explicitly. Main receipts are `.cache/acceptance/context-menu-bar-disjoint/`,
`context-menu-bar-initial-disjoint/`, `context-menu-bar-touch/` and
`context-menu-bar-context-regression/`. Opening-scale and overlapping-alias
observations are retained in earlier cohorts. Preview/return layout, broader APIs,
full motion/optics and native/device acceptance remain open in CONTEXT_MENU.md.
This remains movement toward the unchanged full-catalog goal, with no performance,
publication or landing claim. Final documentation/test-command metadata postdates
the compiled consumer; implementation files are checked against the final snapshot.

## ContextMenu preview and layout composition (2026-11-12)

The canonical primitive Menu popup now remains discoverable across an optional
ContextMenuLayout wrapper; menu rows exclude supplied inert preview content.
ContextMenuPreview supplies caller-owned content with the shared 351px/160px/30px
recipe. Layout reuses the shared vertical/horizontal and leading/trailing recipes.
The existing compact popup expands inside the same layout and native menu root.

The source preview spring and opacity handoff use explicit lifetimes. Native open
state closes immediately; Chromium retains only exit drawing while the layout
returns to the live source. Settling cancels retained drawing and releases optics.
WebKit 27.2 removes native popover drawing immediately despite discrete display
transitions; the verified fallback restores the source immediately. This is an
explicit remaining animation gap, not a cross-engine parity or speed claim.

The final isolated stock-SDK consumer passes both browser preview suites, including
native right-click, keyboard exclusion, compact expansion, close/reopen reversal,
caller opacity priorities, removal and Reduced Motion changes. Thirty-two captures
cover two engines, two themes, two widths and all layout/alignment combinations;
representative Chromium desktop and WebKit narrow captures were inspected. Final
compact-bar regressions pass both engines. Ordinary ContextMenu/Menu regressions
pass the preceding consumer; the later changes only add preview exclusion to bar
row discovery and correct the example target's background token. Receipt hashes
retain this boundary rather than claiming all runs used the same build.

Unit checks remain 76 tests / 307 assertions; typechecking covers 134 files.
Affected lint and format checks pass. The full consumer builds with the six
existing SDK warnings. All 255 implementation/config/example files selected in
verification match the final sealed snapshot; both primitive packages have no
changes from HEAD. Final README/notice/report prose postdates that build.
Receipts: `.cache/acceptance/context-preview-final/`,
`context-preview-bar-regression/` and `context-preview-menu-regression/`.
The family remains Partial for the WebKit return path, broad APIs/caller styles,
full motion/optical and native/device acceptance. No landing or publication occurred.

## GlassToggleButton primitive composition (2026-11-12)

The remaining GlassToggleButton family now derives its actual button and boolean
inversion from canonical primitive Toggle. Standalone/icon-only controls and
explicit grouped items reuse shared GlassButton/ToggleButton/GlassToggleButton
recipes. Mixed groups reuse the existing selection model and roving controller;
joined items suppress independent elastic ownership. Runtime tint, optical
profiles and elastic feedback use the existing glass package with cleanup.
Selection-only updates retain the optical owner.

Browser evidence exposed a real disabled-lifetime defect: native disabled changes
alone did not notify the optical hatch. The generated projection now includes
disabled metadata, releasing optics on disable and restoring them on enable.
Native data-variant metadata also preserves the renderer's prominent tint path.
The selected-style CSS bridge now includes the Glass toggle slot while leaving
Exact's transient press marker under Host ownership.

The final isolated consumer passes Chromium/WebKit behavior, native browser taps,
cleanup, all sizes/variants and ordinary Toggle regressions. Forty-eight captures
cover width/theme/variant/size; two additional blocked-hatch captures verify
initial size and persistent selection. Chromium and WebKit representative images
were inspected. WebKit uses native blur, not a claim of SVG-refraction parity.
77 tests / 323 assertions, 135-file typechecking and affected lint/format pass;
the stock consumer builds with the six existing SDK warnings. Receipt folders:
`.cache/acceptance/glass-toggle-tint/` and `glass-toggle-initial/`.

Both primitive packages remain byte-for-byte unchanged from HEAD. Final prose,
test-command metadata and focused browser fixtures postdate the compiled cohort;
implementation/config/example hashes and actual app/runtime response hashes retain
that evidence boundary. The family moves from Pending to Partial; full APIs,
caller-style/fusion/motion/optical and native/device gates remain in
GLASS_TOGGLE_BUTTON.md. The full catalog goal remains active; no publication or
landing is claimed.

## NavigationBar shared Toolbar composition (2026-11-12)

NavigationBar delegates the actual root to internal ToolbarRootPresentation;
public Toolbar props remain unchanged. The same focus, disabled, drag, elastic
and optics ownership recognize both root slots and preserve nested isolation.
Leading/title/trailing composition and Back reuse the existing Toolbar actions.
Shared NavigationBar/Toolbar/material recipes supply sticky geometry, title
transition and uniform/soft edges. A pure source model retains progressive blur
variance, raised-cosine masks, overflow clamping and the 24px edge fade threshold.

The explicit Web owner observes the chosen scroll container and source large
heading, supports id/inference and target rebinding, and restores owned markers
and CSS on child replacement or root disposal. Replaced edges release their
journals immediately rather than retaining disconnected nodes. Source collapse
uses heading-bottom minus 12px against the sticky bar's bottom. Exact ARIA heading
semantics preserve the chosen level and hide the centered duplicate when large.

Chromium/WebKit pass the focused behavior and full ordinary Toolbar regression,
including native mobile-browser Back taps (scrolling in this fixture is
programmatic), opacity frame samples, target changes and cleanup. Twenty-four
scrolled captures cover widths/themes/edge variants; two blocked-hatch captures
verify initial large-title layout and semantics. Representative Chromium soft,
WebKit uniform and initial captures were inspected; optical/per-frame equivalence
remains unqualified. 79 tests / 333 assertions, 139-file typechecking, affected
lint/format and the full stock consumer build pass (six existing SDK warnings).
Receipts: `.cache/acceptance/navigation-bar-lifetime/` and
`navigation-bar-initial/` with actual app/runtime response fingerprints.

Both primitive packages remain unchanged. Final docs, focused browser fixture
changes and test-command metadata postdate the compiled cohort; verification
records matching runtime/contracts/examples separately. NavigationBar moves from
Pending to Partial. Broader source API/style, document-scroll, material/motion and
native/device gates remain in NAVIGATION_BAR.md. The full catalog goal stays active;
no landing or publication occurred.

## WheelPicker shared ListBox composition (2026-11-12)

WheelPicker now composes internal ListBox root/item presentation helpers and the
same native selection/focus controller. Ordinary ListBox props are unchanged.
The private controller request method shares scalar mask encoding for native
scroll settlement. Options are stable string identities; the effective selection
falls back to the first enabled option without writing application state.
The application may reject proposals. Shared WheelPicker/ListBox tokens and the
source measured radius/angle/opacity formulas project labels while rows and native
snap positions remain linear.

The adapter aligns confirmed updates synchronously like the source layout effect,
reconciles rejected intent, observes resize and collections, supports scalar native
external-form values, and restores removed label styles even for empty collections.
Pending frames/timers and form attributes release on root disposal. Both primitive
packages and the existing SDK archive remain unchanged by this work.

Chromium/WebKit pass keyboard, native mouse-wheel settlement, disabled/rejection,
external/removal/empty updates, rem scaling, projection and lifecycle checks. Native
mobile-browser taps choose a different option. External form fixtures test scalar
values, controlled reset retention and form association without moving Exact-owned
nodes. Both pass the full existing ListBox regression. Eight Wheel captures cover
widths/themes in both engines with native geometry assertions; representative
Chromium and WebKit images were inspected. 79 tests / 333 assertions, 141-file
typechecking, affected lint/format and the full stock consumer build pass (six
existing SDK warnings). Receipts: `.cache/acceptance/wheel-picker-settle/`.

Earlier wait failures came from a fixture using testId as DOM id and from moving
an Exact-owned node into a native form; they do not establish a runtime timing bug.
Corrected fixtures retain diagnostic material separately. Runtime/contracts/examples
are fingerprinted against the sealed consumer, with final docs, fixture changes
and test-command metadata recorded separately. WheelPicker moves Pending to Partial;
initial rendering, broader APIs/form/style matrices, fallback event paths, continuous
touch, source motion and native/device gates remain. The catalog goal stays active.
No landing, publication or performance improvement is claimed.

## GlassMagnifier existing renderer/motion composition (2026-11-12)

GlassMagnifier is an authored material component; no headless counterpart exists.
Its native box composes the existing Glass and Magnifier maps and existing renderer,
while the unchanged glassMotion helper owns pointer capture, parent-center bounds,
velocity lift/deformation and shadow springs. Optional elastic feedback imports the
same press helper used by Glass. Exact-specific ownership reconfigures only when
flags change, preserves optics across those changes and restores owned styles with
priorities on cleanup. Inactive motion does not claim later caller styles.
Both primitive packages, shared motion source and upstream SDK remain unchanged.

Chromium/WebKit pass mouse drag/bounds, flag combinations, sampled motion,
Reduced Motion, interactive child guards, synthetic cancellation/blur handler
fixtures, active removal/restoration and remount. Separate compound elastic drag
and cleanup pass both engines; Chromium also passes a continuous native browser
touch sequence, while both pass native mobile child-button taps. Eight captures
cover widths/themes and record layout/radius/zoom input. Representative captures
were inspected; WebKit shows material fallback without the same visible background
magnification/refraction as Chromium. This backend gap is retained explicitly.

79 tests / 333 assertions, 143-file typechecking, affected lint/format and the full
consumer build pass (six existing SDK warnings). Receipts:
`.cache/acceptance/glass-magnifier-owner/` and `glass-magnifier-elastic/`.
A first mouse fixture was corrected to anchor movement to its actual pointer-down
position rather than a changing animated bounding box; CSS translate assertions
also normalize omitted zero components. Neither fixture finding establishes a
shared motion regression. Runtime/contracts/examples match the final sealed
snapshot, while final docs, test fixtures and command metadata are recorded
separately. The family moves Pending to Partial; full optical/API/style/fusion,
initial, WebKit touch and native/device gates remain. The full catalog goal is
unchanged; no speed, landing or publication claim is made.

## DateField / DateInputGroup source model and primitive input (2026-11-12)

The date-only foundation derives native spinbutton text segments from canonical
primitive Input; a Host-owned keyed layout follows Intl field order. The Web
owner formats segment values and literals without moving or creating Host nodes.
ISO scalar identity is independent of the displayed locale/calendar. Public
Root/Input/Prefix/Suffix parts preserve ordinary input-group composition.
The pure Adobe IncompleteDate model from react-stately 3.51.0 retains partial and
invalid drafts, leap-day intent, cycle/page steps and blur normalization. Its
full Apache notice and source provenance ship in source. @internationalized/date
3.12.4 is a direct pinned dependency, matching the existing workspace version;
the lockfile adds only that direct package entry for this slice.

The final sealed consumer is /tmp/lenso-ui-exact-date-field-form-20261112.
It uses the configured unmodified SDK pin 956ae33a35ffa5313d7be3cebc55ed84f9480e0a
from the existing metadata-free SDK archive, rather than claiming a fresh Git
identity check. The production consumer build succeeds with six existing warnings.
84 tests / 362 assertions, 148-file typechecking and affected lint/format pass.
Chromium/WebKit pass native editing, rejected updates, flags, locale/calendar/RTL,
label focus, native scalar external forms, required/range validation, replacement,
disposal/remount and native mobile-browser tap focus. Sixteen captures cover both
widths/themes/variants/engines. Actual app/runtime hashes and rendered receipts
are in .cache/acceptance/date-field-form/. Representative images were inspected.

The earlier form fixture changed a Host-owned form attribute directly; the next
application redraw overwrote it. The final fixture authors the association in
state and creates only the external native form, leaving owned nodes in place.
This is not evidence of a native validation defect. Both primitive packages stay
unchanged. Final report prose and test-command metadata postdate the consumer;
implementation and executed-fixture fingerprints retain that boundary.
DateField/DateInputGroup move Pending to Partial. DATE_FIELD.md lists remaining
source API, initial, time/range/calendar and native/device gates. The full catalog
goal remains active; there was no landing, publication or performance qualification.

## TimeField shares the segmented native owner (2026-11-12)

TimeField now composes the canonical Input-derived segment skeleton and the same
DateInputGroup Web owner. An internal value-model interface selects date or local
time serialization/limits/formatting, so there is no duplicated focus, draft,
controlled reconciliation, proxy validation or disposal implementation. Public
DateField props remain unchanged; the internal group presentation adds explicit
time/hour-cycle/granularity metadata. TimeFieldRoot imports the shared TimeField
recipe. The existing Adobe pure draft algorithm handles cycle-specific hour and
day-period identities, preserving undisplayed seconds. Both primitive packages
and the SDK remain unchanged. Full notices/provenance now have explicit package
file entries.

The sealed consumer /tmp/lenso-ui-exact-time-field-20261112 builds with the six
existing SDK warnings. Chromium/WebKit pass the TimeField behavior matrix and
the full preceding DateField regression. Sixteen Time captures cover engines,
themes, widths and h12/h23; sixteen Date regression captures cover its previous
matrix. Representative actual images were inspected. Pure/unit checks pass
87 tests / 402 assertions, types cover 151 files, and affected lint/format pass.
Receipts: .cache/acceptance/time-field/ and time-field-date-regression/. Actual
app.js/runtime response hashes distinguish the executed consumer. This archive
uses the configured unmodified SDK pin rather than a fresh Git-metadata check.
Final prose, file-list/command metadata and later browser fixtures are recorded
separately from compiled implementation. TimeField moves Pending to Partial;
TIME_FIELD.md lists source API, time-zone/date-time, bidi, initial and native gates.
The full catalog goal remains active. No landing or publication occurred.

## Calendar native Toggle composition and month model (2026-11-12)

Calendar now derives its actual day buttons from canonical primitive Toggle;
Contract actions translate its boolean intent to application-owned single or
multiple ISO selections, with an explicit none mode. Native disabled and the
read-only capture guard block invalid activation. Shared Calendar styles supply
ordinary geometry, colors and RTL icons. Public named parts and a ready Calendar
composition share the same root/grid owner. A hidden scalar layout request asks
Exact to render keyed complete weeks; the Web owner only decorates existing
heading/weekday/day-label nodes and owns roving/focus and month navigation.
CalendarDate/Intl handle locale calendars, source heading adjustment, day/week/
month/year math and source default calendar-offset bounds. Today is explicit.

The first stock-compiler candidate rejected array addition and undeclared ARIA
syntax; it was not a passing consumer. The final version uses concat and applies
aria-readonly/multiselectable to the actual grid through a reversible native
journal. The SDK and both primitive packages stay unchanged. Rendered Persian
short weekdays exceeded column width; source weekdayStyle is now exposed and the
Persian example uses narrow labels. An earlier WebKit test assumed pointer clicks
focus buttons; final retention checks use keyboard activation and preserve
platform pointer behavior.

The final sealed consumer /tmp/lenso-ui-exact-calendar-weekdays-20261112 builds
with six existing warnings. The existing metadata-free SDK archive uses configured
pin 956ae33a35ffa5313d7be3cebc55ed84f9480e0a; no fresh Git SHA proof is claimed.
91 tests / 437 assertions, 155-file types and affected lint/format pass.
Chromium/WebKit pass native selection modes/rejection/flags, bounds/unavailable,
roving and day/week/month/year keyboard navigation, locale/Persian/RTL, external
updates, disposal/remount and native mobile-browser taps. Sixteen screenshots
cover both engines/themes/widths/locales with column-overflow/selected-fill
assertions; representative actual images were inspected. Receipts and actual
app/runtime response hashes: .cache/acceptance/calendar-weekdays/.

Final report/file-list/test-command metadata postdate the compiled consumer;
implementation and executed fixture fingerprints retain that boundary. Calendar
moves Pending to Partial; CALENDAR.md retains year/range/gesture/multi-month,
source API/style, initial and native/assistive-technology gates. The complete Web
catalog goal remains active. There was no landing or publication.
