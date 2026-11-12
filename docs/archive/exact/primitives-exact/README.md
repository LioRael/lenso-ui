> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Exact primitives

Composable controls. Native semantics. Agent-testable.

`@lenso/primitives-exact` is a private Contract component library for
[Expo Exact](https://github.com/expo/exact). It follows Base UI's separation of
interaction from application styling, using Exact's own controls and host
interactions. It has no React, JavaScript runtime, CSS bundle, hatch, theme,
or dependency on `@lenso/ui-exact`. Unspecified appearance belongs to the host.

The [API boundary](API.md) lists supported names, payloads and migration steps.
The [composition contract](COMPOSITION.md) defines behavior ownership and the
Tabs, Dialog and Tooltip probes. Component count is not a composition guarantee.

The source targets **unmodified** Exact `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`.
It requires no SDK patch; patch files are excluded from the package.
Exact is pre-1.0; newer revisions require revalidation. Native semantics express
intent; platform accessibility and focus guarantees require separate evidence.
Nested Dialog/lifecycle behavior and native AX restrictions are explicit in the
[stock verification matrix](VERIFICATION.md).

## Use

Install or link this directory as `@lenso/primitives-exact` in an Exact app.
Exact resolves its default export as Contract, not JavaScript. All declared
props are required by this Exact revision. `id` is both the host ID and agent
`testId`; give each mounted instance a unique, stable ID. Give controls a
nonempty, localized `label` matching their visible title. `description` is a
space-separated list of IDs of explanatory text, or `""`.

```contract
use Switch from "@lenso/primitives-exact"

component App
  state enabled = false
  state count = 0
  action setEnabled(value: bool)
    enabled = value
  action increment
    count = count + 1
  view
    column
      Switch(id="notifications", label="Notifications", description="", checked=enabled, disabled=false, change=setEnabled)
      button id="add" testId="add" press=increment
        text "Add one"
      text `${count}` testId="count"
```

The library never mirrors a controlled prop in local state. Input events call
the application's action with the host's payload: strings for text, radio and
select; booleans for checkbox/switch; numbers for slider. A Toggle sends the
next boolean, and accordion sends the next string array. Text Input exposes
live `input`, committed `change`, and Enter `submit` independently. The app
decides validation and when to save. See [the compiled example](example/app.contract).

## Components

| Entry        | Public parts                                                                                               | Interaction owner                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `button`     | Toggle, Link                                                                                               | Host activation, navigation; app owns toggle value                               |
| `field`      | Field, Fieldset, FieldDescription, FieldError, Input, Textarea                                             | Host editor, selection and readonly; app owns value and validation               |
| `choice`     | Checkbox, Switch, RadioGroup, Radio, Select, SelectOption, Slider                                          | Native control; app owns selection/value                                         |
| `disclosure` | Disclosure, DisclosureTrigger, DisclosurePanel; Accordion, AccordionItem, AccordionTrigger, AccordionPanel | App owns open/selection; library derives relationships and next selection        |
| `dialog`     | Dialog, AlertDialog, DialogTrigger, DialogClose, DialogAction                                              | Host modal presentation, focus containment and return                            |
| `popover`    | Popover, PopoverTrigger, PopoverClose, Menu, MenuItem, MenuSubmenuTrigger                                  | Host top layer, dismissal, menu keys and native menu projection                  |
| `tabs`       | TabsList, Tab, TabPanel                                                                                    | Host roving focus; app owns selected value; explicit activation                  |
| `tooltip`    | TooltipTrigger, Tooltip                                                                                    | Primitive intent transitions; app root scheduler; host nonmodal anchored popover |
| `feedback`   | Progress, Status, Separator                                                                                | Host progress, live region and separator semantics                               |

All parts can be imported from the package root or their named entry. Components
with `slot` accept Contract children; the source is the complete typed API.
There are no React `asChild`/`render` props, refs, or implicit DOM portals.
Use Contract styles on authored layout and content. This initial API does not
forward arbitrary attributes/styles through a component call. Native controls
retain their default appearance; rich button content may opt into Exact's bare
button presentation under its own rules.

### Native button API

Use Exact's built-in `button` for ordinary actions. It already provides native
activation, disabled behavior, accessible naming from its content, and host
presentation. The library adds Toggle and specialized triggers rather than
maintaining a second, narrower button API.

```contract
button id="save" testId="save" press=save disabled=saving buttonStyle="filled"
  text "Save"
button id="remove" testId="remove" press=remove destructive=true
  text "Delete"
```

Keep Exact's names: `press`, `disabled`, `buttonStyle`, `destructive`, `id`,
`testId`, `aria-*`, `commandfor`/`command` and `popovertarget`. `appearance`
continues to choose native or authored presentation under Exact's rules.
Native button content can include a title, subtitle and supported symbol;
an icon-only action needs `aria-label`. Author styles directly on the native
button when needed. The pinned Contract grammar has explicit component props,
with no generic attribute spread; a wrapper cannot transparently preserve this
API. No JavaScript hatch should be added just to emulate property forwarding.

Migration from the initial local prototype: remove `Button` from imports and
replace `Button(id=…, label=…, disabled=…, press=…)` with
`button id=… testId=… disabled=… press=…`, retaining the child content. Add
`aria-label` when the content does not supply its name. `Toggle` and all
specialized triggers keep their existing contracts.

### Fields and groups

Fieldset renders a labelled group with a visible legend. Field is a labelled
group for composition; it is not an HTML label or a form submission boundary.
Input/Textarea use explicit accessible names. Description and error IDs are
supplied to Input's `description`; FieldError stays mounted so its polite live
region can announce later errors. Clear its message with `""`. It does not
implement async validation or native required constraint validation. Input's
`invalid` reports the app's validation state. No hidden Web-only input mirrors
are used. Input accepts `text`, `search`, `email`, `url`, `tel` and `password`; choices and numeric
ranges have their own components.

Radios in one group must share a unique `name`, distinct from other groups, and
each option needs a unique `value`. SelectOption can disable an unavailable
choice. Slider needs a finite `min < max`, a positive step, and a value in range.
The application owns those domain constraints. Checkbox is two-state; mixed
state is not implemented by this revision's common native control contract.

### Disclosure and accordion

Pass the same `{ id, open, disabled }` record to all Disclosure parts.
Accordion takes `{ id, value: string[], multiple, disabled }`; each item takes
`{ id, value, disabled }`. Use unique item IDs and values. Single selection can
collapse to an empty list. Multiple selection preserves the other open values.
Place a trigger in an authored heading when it is a document section heading.
Panels remain mounted, hidden and inert while closed, retaining editor state.
Accordion uses ordinary button Tab navigation; optional arrow-key navigation
is not implemented. State changes are immediate and contain no library timers.

### Overlays

Keep Dialog/AlertDialog mounted. DialogTrigger names their `id` in `target`;
the host opens them with `show-modal`. DialogClose closes without an app
action. DialogClose and PopoverClose require an explicit `disabled` prop.
Disabling a close button does not block Escape or other dismissal paths.
DialogAction runs `press` and closes: use it for synchronous confirmed
actions. For async saves that must remain open on failure, use a native `button` inside
Dialog and call Exact's `close(id)` only after success. Dialog and AlertDialog delegate
cancellation to the Host. Explicit Cancel/Close buttons are core; iOS
agent-recognized Dialog Escape remains experimental. AlertDialog's title and message
must fit the native alert model, with simple action buttons. It is not a general
custom sheet. Labels/descriptions and native focus/dismissal belong to the host.

PopoverTrigger also opens Menu. Menus use button items and Exact's native menu
projection; put a submenu and its trigger inside the parent Menu. Each MenuItem
names the outer menu ID in `target`, closing the menu chain on activation. Popover is
nonmodal and uses the host's auto-popover dismissal. Overlay open state belongs
to Exact, with no second boolean in the library. Arbitrary controlled `open`
props and position engines are deliberately absent.

### Tabs

Each Tab names its panel ID; each TabPanel names its tab ID. Share the app's
`selected` string. Disabled tabs are skipped by host key navigation. Arrows
move focus; Enter/Space activates. Inactive panels are mounted but hidden and
inert. Use TabsList for in-page content. Application destinations should use
Exact routes and navigation rather than replacing routes with tab state.

### Tooltip composition

Tooltip now supplies delayed hover, immediate focus, hoverable text content,
Escape dismissal and single activation without taking focus. It composes on the
same native button as a Dialog command. Its state transitions are reusable pure
Contract functions; the app connects one controlled record, a gated root task,
popover commands and root Escape arbitration. Reset it before disabling or
unmounting its trigger. Read the [complete Tooltip connection](TOOLTIP.md),
which is compiled by `test:contracts`.

This explicit root scheduling is required by the pinned Exact compiler; the
library does not hide a timer in a child component or add a runtime hatch.

## Verification

The fixture instantiates every exported component through a copied package
containing only its distributable files. Its `app.test.contract` exercises the
same state and interaction contract using Exact's agent. Browser checks add
real keyboard input, accessible names, ID relationships, hidden-panel focus,
modal return, menu navigation, remounting and geometry. DOM simulations alone
are not acceptance for these interactions.

```sh
bun run --cwd packages/primitives-exact typecheck
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:contracts
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact example:build
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:browser
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:agent
```

Build requires an initialized **stock** Exact checkout and compiler. These
commands install no toolchains or SDK patches. Browser checks use the docs
workspace's Playwright (`PLAYWRIGHT_MODULE` can override it); the agent uses
Exact's installed Chrome. Generated builds and evidence default to
`.cache/upstream`, isolated from the old modified-SDK research receipts.
`EXACT_PRIMITIVES_CACHE` selects another cache root.

Default agent tests run eight core scenarios. The complete original seventeen
scenarios remain available with `EXACT_AGENT_SCOPE=all`; no experimental
assertion was deleted or weakened. Browser tests similarly default to core;
`test:browser:experimental` adds the original modal lifecycle checks. A core
state/interaction pass does not establish native AX correctness.

```sh
EXACT_ROOT=/absolute/path/to/stock-exact bun run --cwd packages/primitives-exact test:baseline web
EXACT_ROOT=/absolute/path/to/stock-exact EXACT_SIM=<dedicated-udid> bun run --cwd packages/primitives-exact test:baseline macos ios
EXACT_ROOT=/absolute/path/to/stock-exact bun run --cwd packages/primitives-exact test:agent:experimental
EXACT_ROOT=/absolute/path/to/stock-exact bun run --cwd packages/primitives-exact test:browser:experimental
```

The baseline collector compares every present tracked SDK file with the pinned
Git objects before and after execution and rejects changed sources. An archive
may supply `EXACT_BASE_GIT=/path/to/object-store`. It records every phase and
returns nonzero if any strict test fails; recorded experimental failures are
not green acceptance. Results are grouped by requested hosts under
`.cache/upstream/baseline`. The copied consumer contains only distributable
library files, without SDK patches.

`test:native macos` / `test:native ios` build the same source package, run the
core agent scenarios and independently check native AX. Set `EXACT_SIM` to a
dedicated simulator. Exact Host role/state projection, native Dialog Escape,
covered-modal AX isolation and modal focus/route lifetimes can fail even when
the components compile. Read [API.md](API.md) for ownership and experimental
scope and [VERIFICATION.md](VERIFICATION.md) for actual stock results.

Static ID/ARIA relationships and Dialog names remain application obligations:
the stock compiler accepts invalid combinations demonstrated in [COMPILER.md](COMPILER.md).
The library supplies semantic attributes and native commands, not a replacement
focus manager, accessibility tree or compiler. Repository-only `patches/` and
`VERIFICATION-PATCHED.md` preserve historical upstream research. They are not
installation requirements or evidence of stock platform support.

Linux's historical six-of-seven windowless result remains a gap, with no new
Linux desktop/AT-SPI acceptance. Spoken announcements, physical-device input,
arbitrary modal depth and interactive navigation cancellation remain unverified.

This private catalog is not full Base UI parity. Combobox, autocomplete, context
menu, number field, multi-thumb slider, mixed checkbox, drag/drop and advanced
form validation need separate implementation and platform acceptance. No package
publication or changes to the existing React primitives are part of this work.
