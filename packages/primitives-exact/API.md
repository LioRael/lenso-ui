# Primitive API boundary

This is the supported v0.1 surface. It targets Exact
`956ae33a35ffa5313d7be3cebc55ed84f9480e0a` plus the documented Host series.
It is still private; this is not a promise of compatibility with newer Exact.

## Shared rules

- All declared props are required by the pinned compiler. Pass `description=""`
  for no description and explicit booleans for flags.
- `id` is a stable, unique mounted Host ID and agent `testId`. A `label` is a
  nonempty accessible name. `description` contains referenced element IDs,
  separated by spaces; it is not prose. `message` is visible text.
- `target` names a native command target. Tab `panel` and panel `tab` name the
  reciprocal IDs; `value` is the application selection key, not a Host ID.
- `change` receives the next value; `input` receives live edits; `press` is a
  zero-argument action. The app writes controlled values through its actions.
  The generic Contract `action` type does not prove callback payload arity.
- Slots retain caller bindings. They do not inject state, forward attributes or
  merge handlers. No `asChild`, `render`, implicit provider, private focus trap,
  attribute spread or second modal `open` value is supplied.
- Use native `button` for ordinary actions and custom trigger appearance. It
  preserves Exact's full `press`, command, style, disabled and naming API.
  Specialized triggers are conveniences with explicit props, not wrappers that
  transparently forward every native capability.

## Supported parts and payloads

All names below are available from the root and the corresponding subpath.
Component props are defined in the linked source; the table describes ownership.

| Entry                                        | Supported names                                                                                                                     | Value / action contract                                                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [button](components/button.contract)         | Toggle, Link                                                                                                                        | `pressed: bool`, `change(next: bool)`; Link uses `href`                                                                                                            |
| [field](components/field.contract)           | Field, Fieldset, FieldDescription, FieldError, Input, Textarea                                                                      | Text `value: string`, `input(next: string)`, `change(next: string)`; Input `submit()`                                                                              |
| [choice](components/choice.contract)         | Checkbox, Switch, RadioGroup, Radio, Select, SelectOption, Slider                                                                   | Checkbox/Switch `checked`, `change(bool)`; Radio `selected`, `change(string)`; Select `value`, `change(string)`; Slider `value`, `input(number)`, `change(number)` |
| [disclosure](components/disclosure.contract) | DisclosureState, Disclosure, DisclosureTrigger, DisclosurePanel                                                                     | Shared `{id, open, disabled}` record; trigger `change(next: bool)`                                                                                                 |
| disclosure                                   | AccordionState, AccordionItemState, Accordion, AccordionItem, AccordionTrigger, AccordionPanel                                      | Shared `{id, value: string[], multiple, disabled}` and item `{id, value, disabled}`; trigger `change(next: string[])`                                              |
| [tabs](components/tabs.contract)             | TabsList, Tab, TabPanel                                                                                                             | Shared `selected: string`; Tab `change(value: string)`; orientation `horizontal` or `vertical`; manual activation                                                  |
| [dialog](components/dialog.contract)         | Dialog, AlertDialog, DialogTrigger, DialogClose, DialogAction                                                                       | Host owns opening, cancellation and focus. Trigger/Close/Action expose `disabled`; Action calls `press()` then closes                                              |
| [popover](components/popover.contract)       | Popover, PopoverTrigger, PopoverClose, Menu, MenuItem, MenuSubmenuTrigger                                                           | Host owns presentation/dismissal; Trigger/Close/items expose `disabled`; MenuItem calls `press()` then hides the named menu chain                                  |
| [tooltip](components/tooltip.contract)       | TooltipState, TooltipInitial, TooltipHover, TooltipContentHover, TooltipFocus, TooltipDismiss, TooltipTick, TooltipTrigger, Tooltip | Controlled intent/deadlines; `change(next: TooltipState)`; Trigger `press()`; app owns root scheduling and lifecycle cleanup                                       |
| [feedback](components/feedback.contract)     | Progress, Status, Separator                                                                                                         | Progress numeric `value/max`; Status text `message`; Host owns semantics/live announcements                                                                        |

Exact requires literal branches to lower native Input kinds; the wrapper
projects the validated enum through those text-only branches.

Input supports `text`, `search`, `email`, `url`, `tel` and `password`. It does not
accept checkbox/radio/range/file or numeric/date controls through a stringly
`type`. Use the matching choice primitive or Exact's native control and its own
payload contract. Textarea has no `type`. Validation, submission and native
constraint policy remain application responsibilities.

`disabled` on a close button blocks that button's activation. It does not change
Dialog Escape policy or prevent dismissal through other controls. A pending save
that must prevent all dismissal requires the native dialog's appropriate
`closedby` policy; the wrapper does not pretend a disabled button is a modal lock.
DialogAction is for synchronous accepted actions. For async acceptance, use a
native button and call `close(id)` after success.

Tooltip's six-field record is runtime intent, not an editable configuration
bag. Use the named transitions. `delay`, `closeDelay` and the root scheduler
must be shared explicitly by both parts; the pinned compiler cannot schedule
inside a child. `TooltipResolve` and `TooltipIntent` are implementation helpers
in the source module, not supported public entry points. The root no longer
re-exports `TooltipIntent`. [The complete connection](TOOLTIP.md) is compiled.

## Migration in this consolidation

1. Add `disabled=false` (or the owner's busy flag) to `DialogClose` and
   `PopoverClose`. There are no hidden defaults.
2. Narrow any dynamic Input `type` to the six-value enum above. Move choice,
   numeric and date input to controls with the correct native value model.
3. Replace root `TooltipIntent` imports with the specific Hover, ContentHover
   or Focus transition. Existing Initial/Dismiss/Tick use is unchanged.

No existing selection names or state shapes were renamed. `description` keeps
its ID-list meaning. Compiler probes enforce the Input enum and compile the
close-button subpath API; the copied consumer exercises every exported part.
Missing names/targets and incompatible combined commands remain compiler gaps,
recorded separately in [COMPOSITION.md](COMPOSITION.md).
