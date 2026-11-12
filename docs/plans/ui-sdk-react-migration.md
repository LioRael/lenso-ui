# React UI SDK migration

Status: in progress. This is not a completed replacement of Base UI.

The requested scope is the existing React library. Vue and Svelte packages are
outside this task. Keep StyleX, semantic tokens and Glass presentation. The owner
explicitly authorized migration inside `packages/primitives`, with its existing
public API preserved. Other in-flight Glass and Exact changes are outside this
migration.

Both `@ui-sdk/core` and `@ui-sdk/react` are pinned to `0.1.0-beta.1` in
`packages/ui`. Read the documentation shipped at
`packages/ui/node_modules/@ui-sdk/react/docs/llms.txt` before implementing a
family. No SDK implementation JavaScript was used as an API reference.

## Implemented

| Family or integration | UI SDK entry | Coverage |
| --- | --- | --- |
| Button, GlassButton, internal action buttons | `button` | Existing loading, ref, composition and group tests; agent discovery and activation |
| ToggleButton, GlassToggleButton, ToggleButtonGroup | `toggle` | Controlled state, multiple selection, group disable and agent changes |
| Accordion | `accordion` | Expansion, retained panels and Lenso arrow-key navigation |
| Disclosure, Sidebar disclosure, Notification | `collapsible` | Nested sidebar, retained panels, refs, state styles and agent opening |
| ProgressBar, ProgressCircle | `progress` | Names, range, fill width and unknown progress |
| Meter | `meter` | Accessible name, range and public slot |
| Avatar | `avatar` | Type/build coverage; image loading behavior still needs focused browser coverage |
| Separator | `separator` | Type/build coverage |
| Agent bridge | `@lenso/ui/agent` | Re-exports SDK tools without registering browser tools automatically |

`slotRender` uses the SDK's public `renderElement` API to retain Lenso's public
`data-slot` names. Material hooks and selectors depend on these names. Native
action buttons share this handling and forward polymorphic refs. Existing
whole-group disable semantics remain native on Lenso toggle buttons.

Expansion indicators now read `aria-expanded`, replacing Base UI's
`data-panel-open`. The token stylesheet declares the SDK cascade layer before
its existing layers. Framework packages remain external in the UI build.

## Outstanding migration

| Area | Remaining work |
| --- | --- |
| Forms | Migrate Field, Label, Description, FieldError, Fieldset, Form, Input, TextArea and SearchField together; verify labels, validation, reset and submission across controls |
| Checked controls | Migrate Checkbox, CheckboxGroup, Radio, RadioGroup, Switch and SegmentedControl with the field contexts |
| Selection | Migrate Select, ComboBox, Autocomplete, ListBox and related selection consumers; preserve key/value behavior, cancellation and form integration |
| Navigation | Migrate Tabs, Toolbar, NavigationBar, TabBar and PageControl interaction ownership; internal buttons alone do not complete these families |
| Anchored overlays | Migrate Menu, ContextMenu, Popover, Tooltip and PopupButton compositions, including positioning, focus return, portals, submenus and Glass motion |
| Modal overlays | Migrate Modal, AlertDialog, Drawer, Sheet, ActionSheet and ShareSheet, including gestures, detents and scroll ownership |
| Notifications | Migrate Toast; Notification already uses SDK Collapsible |
| Editing models | Migrate NumberField, Stepper, Slider, InputOTP, date/time and color families while preserving their public value models |
| Product behaviors | Audit List, Table, WheelPicker, SectionIndex, SwipeActions and RefreshControl against SDK core behaviors; migrating their action buttons is insufficient |
| Preserved primitives | Migrate Command, Sidebar and ResizeHandle internals with characterization of their existing public props, callbacks and ref behavior |
| Shared helpers | Replace remaining Base UI render, merge, direction, ref and scroll-lock helpers after their consumers migrate |
| Docs and consumers | Update interaction references, examples, generated API, skills, package descriptions and migration instructions after each family; remove Base UI dependencies only after the final consumer audit |

## Consumer changes in this batch

- Accordion item values are strings. Updated the shipped examples' values and
  controlled arrays accordingly. Its optional `orientation` and `loopFocus`
  navigation extension remain available.
- `ToggleButtonGroup.loopFocus` maps to the SDK's `loop` option.
- SDK buttons infer their native element from `render`; the docs no longer pass
  `nativeButton` to Button or GlassButton.
- Button action callbacks receive the SDK's second details argument, including
  `source`. Internal forwarding callbacks pass it through.
- SDK render callback props currently have an index signature. Examples that
  read children use `props["children"]` under this repository's TypeScript rules.
- Controlled sidebar navigation passes `open` and uncontrolled navigation passes
  `defaultOpen`; it no longer supplies both.

## Validation record

The affected UI package typecheck, docs app typecheck, docs package typecheck,
source-boundary check and package build passed. The UI suite passed 12 non-DOM
tests and 101 DOM tests, including five new SDK wiring tests. These checks do not
verify the outstanding families or establish browser visual parity.

Browser validation is separate from simulated DOM coverage. The local host
requires Node 26.10.0; an invocation-local PATH selected the already-installed
version. Playwright's configured Chromium binary was unavailable. Installed
Chrome and the existing WebKit 2370 runtime were used for initial page inspection.
The old docs browser marker `data-example-mounted` is absent from current source;
that wait cannot serve as acceptance evidence.

No signed candidate, landing or publication has been performed.
