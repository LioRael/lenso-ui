# Exact primitives

Accessible by default. Native on every platform. Agent-testable.

`@lenso/primitives-exact` is a private Contract component library for
[Expo Exact](https://github.com/expo/exact). It follows Base UI's separation of
interaction from application styling, using Exact's own controls and host
interactions. It has no React, JavaScript runtime, CSS bundle, hatch, theme,
or dependency on `@lenso/ui-exact`. Unspecified appearance belongs to the host.

The [composition contract](COMPOSITION.md) defines behavior ownership and the
Tabs, Dialog and Tooltip probes. Component count is not a composition guarantee.

The source targets Exact `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`.
Exact is pre-1.0; newer revisions require revalidation. The slogan above is the
design target; Web acceptance and native platform acceptance are separate.

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

| Entry        | Public parts                                                                                               | Interaction owner                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `button`     | Toggle, Link                                                                                               | Host activation, navigation; app owns toggle value                        |
| `field`      | Field, Fieldset, FieldDescription, FieldError, Input, Textarea                                             | Host editor, selection and readonly; app owns value and validation        |
| `choice`     | Checkbox, Switch, RadioGroup, Radio, Select, SelectOption, Slider                                          | Native control; app owns selection/value                                  |
| `disclosure` | Disclosure, DisclosureTrigger, DisclosurePanel; Accordion, AccordionItem, AccordionTrigger, AccordionPanel | App owns open/selection; library derives relationships and next selection |
| `dialog`     | Dialog, AlertDialog, DialogTrigger, DialogClose, DialogAction                                              | Host modal presentation, focus containment and return                     |
| `popover`    | Popover, PopoverTrigger, PopoverClose, Menu, MenuItem, MenuSubmenuTrigger                                  | Host top layer, dismissal, menu keys and native menu projection           |
| `tabs`       | TabsList, Tab, TabPanel                                                                                    | Host roving focus; app owns selected value; explicit activation           |
| `feedback`   | Progress, Status, Separator                                                                                | Host progress, live region and separator semantics                        |

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
are used. Use text-compatible `type` values with Input; choices and numeric
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
action. DialogAction runs `press` and closes: use it for synchronous confirmed
actions. For async saves that must remain open on failure, use a native `button` inside
Dialog and call Exact's `close(id)` only after success. Dialog permits platform
cancel; AlertDialog preserves the native Cancel/Escape path. AlertDialog's title and message
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

## Verification

The fixture instantiates every exported component through a copied package
containing only its distributable files. Its `app.test.contract` exercises the
same state and interaction contract using Exact's agent. Browser checks add
real keyboard input, accessible names, ID relationships, hidden-panel focus,
modal return, menu navigation, remounting and geometry. DOM simulations alone
are not acceptance for these interactions.

```sh
bun run --cwd packages/primitives-exact typecheck
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact example:build
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:browser
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:agent
```

Build requires an already initialized Exact checkout and compiler. It does not
install Rust, Bun, Hermes or native SDKs. Browser checks use the docs workspace's
Playwright installation (`PLAYWRIGHT_MODULE` can override it). The agent uses
Exact's installed Chrome. Generated consumer builds stay in `.cache/example`.
The source-only package needs no asset build. These optional integration
commands are separate from the repository's ordinary build and test loops.

Native hosts consume the same Contract package without hatches or a Web bridge.
To qualify a native host, install the package in an app created with `exact new`,
copy this fixture's Contract and tests, build that host with the app's `exact.mjs`,
then run `bun exact.mjs test macos` / `test ios` / `test linux` as applicable.
Passing Web tests does not establish VoiceOver, UIKit/AppKit rendering, physical
touch, Linux accessibility, Android or Windows acceptance.

Verified on 2026-11-10 against the pinned Exact revision: the copied consumer
compiled with zero warnings, all six Exact Web agent tests passed, and the
browser suite passed on Chromium 156.0.8078.4 and Playwright WebKit 27.2. Package
format, lint and tooling typecheck passed. Browser evidence covers keyboard,
DOM semantics and layout; screen-reader speech and native host runs remain
unverified. The local browser run used Playwright 1.64.1 with its matching
installed engines through `PLAYWRIGHT_MODULE`.

This is an initial primitive catalog, not full Base UI parity. Combobox,
autocomplete, tooltip, context menu, number field, multi-thumb slider, mixed
checkbox, drag/drop and advanced form validation need their own implementation
and platform acceptance. No package publication, upstream modification or
changes to the existing React primitives are part of this package.
