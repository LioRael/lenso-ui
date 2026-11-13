# React UI SDK migration

The former React Base UI runtime consumers have been replaced with UI SDK
`0.1.0-beta.1`. Vue and Svelte packages are outside this task. StyleX, semantic
tokens, Glass presentation, and date/time/color domain models remain in Lenso.
Existing custom product behaviors such as collection drag/drop and windowing,
wheel scrolling, refresh, indexed navigation, and table column resizing
remain owned by their components; this is not a claim that these behaviors are
shared across frameworks.

The owner authorized primitive internals to migrate and then approved native
SDK contracts, including breaking former Base UI APIs and updating callers.
No Base UI renderer facade or SDK dependency patch is retained. The public SDK
`renderElement` and `mergeProps` are used directly; the small slot renderer only
preserves Lenso's material slot names and forwards native props/state.

## Implemented families

| Families                                                             | SDK entries                                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Button, GlassButton, internal actions                                | `button`                                                                                       |
| ToggleButton, GlassToggleButton, ToggleButtonGroup, SegmentedControl | `toggle`, `segmented-control`                                                                  |
| Accordion, Disclosure, Notification, Sidebar groups                  | `accordion`, `collapsible`                                                                     |
| Avatar, Meter, ProgressBar, ProgressCircle, Separator                | `avatar`, `meter`, `progress`, `separator`                                                     |
| Tabs, Toolbar, NavigationBar                                         | `tabs`, `toolbar`                                                                              |
| TextField, Label, Description, FieldError, Fieldset                  | `field`                                                                                        |
| Input, TextArea, SearchField, input groups                           | `input`, `textarea`, `field`                                                                   |
| Checkbox, CheckboxGroup, Radio, RadioGroup, Switch                   | `checkbox`, `checkbox-group`, `radio`, `radio-group`, `switch`                                 |
| NumberField, Stepper, Slider, InputOTP                               | `number-input`, `slider`, `otp-input`                                                          |
| ListBox                                                              | `listbox`                                                                                      |
| Select, ComboBox, Autocomplete                                       | `select`, `combobox`, `autocomplete`                                                           |
| Menu, ContextMenu, PopupButton                                       | `menu`                                                                                         |
| Modal, AlertDialog, Popover, Tooltip                                 | `dialog`, `alert-dialog`, `popover`, `tooltip`                                                 |
| Drawer, Sheet, ShareSheet, ActionSheet                               | `drawer`, `dialog`                                                                             |
| Toast                                                                | `toast`                                                                                        |
| Command presentation                                                 | `command`, `dialog`                                                                            |
| Date/time/color families                                             | Native field, input, number-input, popover, color-picker and button parts around domain values |

Unstyled Command is imported directly from `@ui-sdk/react/command`; the redundant
Lenso primitive entry and its documentation page were removed. Lenso Command
presentation remains in `@lenso/ui/command`.
Unused DataGrid and ResizeHandle primitives, their exports and documentation
pages were also removed. Sidebar is the remaining primitives family; Table
and its TanStack integration examples remain separate.

Primitives use SDK rendering and interaction entries directly. Form is a styled
native `form`. SDK components read direction from the DOM. Runtime Base UI
imports are prohibited by `scripts/interaction-boundaries.ts`, including UI,
primitives, documentation components, examples and Storybook.

## Follow-up audit

The follow-up audit found and fixed the remaining custom ListBox interaction
engine. ListBox now uses native SDK Listbox values, arrays, activation, group
labels, indicators, form submission/reset and controllers. Its old selection,
key and action adapters were removed. The Table/TagGroup collection model was
separated from the ListBox renderer; those components do not run ListBox's
interaction engine. Virtual list callers supply native item records and logical
indices, and scroll in response to SDK `onHighlight`.

The audit also removed the Glass backdrop lookup for Base portal nodes,
Base-specific focus-guard selectors, popup-open markers in tokens and the docs
presentation layer,
unused popup direction metadata, obsolete API prose and the primitive README's
Base installation dependency. Popover and tooltip arrows use the SDK's resolved
physical side. The source gate now rejects Base references in type-only imports
and rejects Base-specific handler/DOM contracts, including in token styles.
The installed consumer includes native generic ListBox composition.

`onOpenChangeComplete`, `data-starting-style`, `data-ending-style`, measured
panel heights and anchor positioning variables were checked against the
installed SDK documentation. They are also native SDK contracts and remain.
`slotRender` only decorates the native render props with Lenso material slots;
`NativeButton` only forwards a native SDK button and its ref. Neither translates
old flags, events, state objects or component composition.

The remaining component inventory has explicit owners:

- SDK interaction families are listed above, now including ListBox and the
  ListBox used by WheelPicker. Native SDK selection owns their keyboard state.
- Breadcrumbs, Pagination and TabBar are native navigation links. Form and
  presentation families use native HTML; they do not recreate a selection or
  popup state machine.
- Table is a rich table/treegrid, and TagGroup is a removable display grid.
  Neither has a corresponding SDK component with that semantic contract;
  TokenInput is an editable text input with tokens. Their existing domain
  collection engines, drag/drop and windowing remain custom product behavior.
- Calendar/date/time/color keep the internationalized domain models explicitly
  allowed by this migration. Wheel scrolling, refresh/swipe gestures, indexed
  navigation, table column resizing and Glass geometry remain product behavior.
  This is not a claim that those engines are SDK primitives or cross-framework.
- Fumadocs Story still brings a transitive Base dependency. Lenso component
  source, public contracts and direct package dependencies do not use it.

## Sidebar core composition

Sidebar now has a framework-independent definition at
`@lenso/primitives/sidebar/core`. It composes `definePrimitive`, `createChange`,
`bindPanel` and `createFocusRecovery`; its React entry maps native slots with
`createParts`. The previous React state/context, Group registry, Provider,
`targetId`, manual direction default and hand-written focus queue are removed.
External operations use a native controller. Changes carry native reasons,
sources and cancellation; controlled state remains authoritative.

Native data-open/data-closed replace the panel's data-state strings. Item is a
native navigation link with data-selected/data-nested. The styled UI Sidebar is
navigation content; it remains independently composable inside the shell panel.
The core entry imports no React runtime. Core SSR, controller/cancellation,
removed-panel focus recovery and agent behavior have regressions. Three deliberate
mutations (toggle, cancellation, focus target) were detected and restored.
Browser coverage includes Chromium and WebKit, with WebKit Option-Tab for its
native link-navigation preference. Strict declaration failures and the SDK
pattern-check helper limitation are recorded in the upstream issue note.

## Breaking contracts

- Floating surfaces use `Content`. Portal, Positioner, Popup and floating
  Viewport adapters were removed. Native container/controllers own placement,
  presence, focus and imperative actions. Submenus use `SubContent`.
- Tooltip delay belongs on Root. Drawer/Sheet use native sides, snap points,
  handles and `--drawer-progress`; the SDK owns translate and backdrop opacity.
- Native form submission, constraints and explicit invalid state replace the
  former Form/Field validation API. Cancellation uses SDK `details.cancel()`.
- Checkbox indeterminate state is `checked="indeterminate"`. Number, Slider and
  OTP commit callbacks are `onValueCommit`; OTP uses `maxLength` and slot `index`.
- Select/Combobox use native data records and value/query callbacks. Autocomplete
  edits free text. Selection/chip examples use ComboBox; they are no longer
  advertised as native Autocomplete examples.
- Toast uses `createToaster` and `Toast.Region`, with explicit queues. A toaster
  is callable; it has `update`, `dismiss` and `promise`. Promise returns an ID.
- Command uses `query` for search, `value` for highlight and Item `onSelect` for
  activation. Composed commands register their own items; native data lists can
  render `items` directly. Clear actions call a native controller.
- ListBox uses native scalar/array values, `label`, `index`, `activation`,
  `loop` and controllers. Old Set selection and key aliases are absent.
- Native SDK render and event state replaces Base-specific handler methods,
  button flags and state fields. Package consumers, documentation examples,
  Storybook, installed-consumer fixtures and contributor guidance were updated.

## Regression evidence

`apps/docs/test/ui-sdk-native.mjs` exercises the actual docs Vite/StyleX setup in
Chromium and WebKit. It covers disabled-fieldset submission, enable/reset,
radio keys, agent-driven switch and ListBox changes, ListBox multi-selection
and form reset, virtual-list End navigation with actual focus at logical item
1000, native async-button pending state, number/date/color submission, color
area updates, slider keys, OTP, menus/submenus, context menus, selection and free
text, dialog focus return, dark scoped popovers, tooltip dismissal, Drawer,
Sheet handle keyboard and pointer activation, and Toast action/geometry.

The combination catches namespace aliasing between Menu and ContextMenu. Color
conversion has a separate regression for modern SDK CSS syntax and unquantized
alpha. Sheet material sampling reads native progress and tests intermediate
shapes, reversal, cleanup, percentage and content snap points. Bun DOM tests do
not substitute for the browser checks.

Run the browser check with `bun run --filter @lenso/ui-docs test:ui-sdk-native`.
It uses standard installed Playwright browsers. Optional
`UI_SDK_CHROMIUM_CHANNEL` and `UI_SDK_WEBKIT_EXECUTABLE` select an existing local
browser. The local validation used Chrome 157 and WebKit 27.2 with reduced
motion; real Safari/iPhone and complete visual/performance parity are unverified.

## Validation commands

The migration checks used the existing project configurations:

| Command                                                               | Result                                                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `bun run --filter @lenso/ui typecheck`                                | Exit 0; source and test projects                                 |
| `bun run --filter @lenso/ui test`                                     | Exit 0; 13 pure and 103 DOM tests                                |
| `bun run --filter @lenso/primitives test`                             | Exit 0; 11 Sidebar tests                                         |
| `bun run --filter @lenso/ui-docs typecheck`                           | Exit 0                                                           |
| `bun check --no-script -p packages/storybook/tsconfig.json`           | Exit 0                                                           |
| `bun run --filter @lenso/docs typecheck`                              | Exit 0                                                           |
| UI docs, docs framework, repository, Glass and token tests            | Exit 0; 98, 71, 79, 109 and 8 tests respectively                 |
| `bun run lint` / `bun run source:check` / `git diff --check`          | Exit 0                                                           |
| `bun apps/docs/scripts/generate-docs.ts all --skip-build`             | Exit 0; 99 families, 599 public parts and 1240 example graphs    |
| `bun run --filter @lenso/ui-docs test:ui-sdk-native`                  | Exit 0 in Chromium and WebKit                                    |
| `bun run --filter @lenso/ui-docs build`                               | Exit 0 with pinned Node 26.10.0; static export size check passed |
| `bun run --filter @lenso/ui-docs test:stylex-artifacts`               | Exit 0; both production CSS and static alias tests               |
| `bun test --timeout 180000 tests/consumer/installed-consumer.test.ts` | Exit 0; installed exports, types, SSR, assets and notices        |
| `bun run --filter @lenso/primitives typecheck`                        | Exit 1; the upstream declaration issue below                     |

The full formatting check exits 1 only for the unrelated local
`docs/plans/webkit-native-blur-research.md`; migration files pass. React Doctor
exits 1 with 24 diagnostics across the broader checkout and an unavailable
remote score API. Its only error points to the unchanged Glass refraction effect,
whose returned cleanup disconnects observers and stops its paint subscriptions.
This scan is not a clean migration acceptance signal.

## Upstream gate

The unmodified SDK has a strict declaration incompatibility, recorded separately
in [upstream-ui-sdk-types.md](../upstream-ui-sdk-types.md). Primitives strict
build/typecheck remain red for that issue. Passing component, consumer and
browser checks do not override that gate. No landing or publication was requested.
