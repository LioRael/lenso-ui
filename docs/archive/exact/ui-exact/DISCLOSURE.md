> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Disclosure and Accordion

These components share Lenso's StyleX presentation. Native buttons and Exact
actions own activation and application state. The Web adapter measures retained
content and supplies interruptible height/opacity transitions and accordion
focus navigation.

## Disclosure

`DisclosureState` has three required fields: `id: string`, `open: bool` and
`disabled: bool`. Derive it from application state and pass the same value to
the root, trigger and content. It is view data, not a second state owner.

```text
use DisclosureState, Disclosure, DisclosureHeading, DisclosureTrigger, DisclosureIndicator, DisclosureContent, DisclosureBody from "@lenso/ui-exact"

component App
  state expanded = false
  derive details = DisclosureState(id="details", open=expanded, disabled=false)
  action expand(value: bool)
    expanded = value
  view
    Disclosure(state=details)
      DisclosureHeading(level=2)
        DisclosureTrigger(state=details, change=expand)
          row gap=8 align-items="center"
            text "Details"
            DisclosureIndicator()
      DisclosureContent(state=details)
        DisclosureBody()
          text "Content can include editors, links and other components."
```

The root, trigger and region use `id`, `${id}-trigger` and `${id}-content`.
Trigger and region have reciprocal ARIA associations. Enter and Space activate
the native button. Closing makes the retained content inert and hidden from
accessibility immediately; keyboard focus in that content returns to its trigger.
Closing does not discard the editor or its draft.

## Accordion

`AccordionState` contains:

| Field           | Type / purpose                                          |
| --------------- | ------------------------------------------------------- |
| `id`            | Unique root DOM / test id                               |
| `value`         | Array of expanded application keys                      |
| `multiple`      | Whether activation may add another expanded key         |
| `disabled`      | Disable this root's triggers                            |
| `orientation`   | `vertical` or `horizontal`, selecting the keyboard axis |
| `loopFocus`     | Wrap or stop at the ends when navigating with arrows    |
| `variant`       | `default` or `surface`                                  |
| `hideSeparator` | Hide item separators                                    |

`AccordionItemState(id, value, disabled)` names an item. Its `id` must be globally
unique; its `value` is a stable application key, independent of the visible label.

| Component            | Required props            | Content                      |
| -------------------- | ------------------------- | ---------------------------- |
| `Accordion`          | `state`                   | Items                        |
| `AccordionItem`      | `state`, `item`           | Heading and panel            |
| `AccordionHeading`   | `level`                   | Trigger                      |
| `AccordionTrigger`   | `state`, `item`, `change` | Label and optional indicator |
| `AccordionPanel`     | `state`, `item`           | Body                         |
| `AccordionBody`      | None                      | Rich content                 |
| `AccordionIndicator` | None                      | Built-in SVG chevron         |

For example, derive `settings = AccordionState(...)` and
`account = AccordionItemState(id="account-section", value="account", disabled=false)`:

```text
Accordion(state=settings)
  AccordionItem(state=settings, item=account)
    AccordionHeading(level=3)
      AccordionTrigger(state=settings, item=account, change=select)
        text "Account"
        AccordionIndicator()
    AccordionPanel(state=settings, item=account)
      AccordionBody()
        text "Manage account settings."
```

`select(values: string[])` writes the application's selected array. A trigger
removes its key when expanded; otherwise it appends the key in multiple mode or
replaces the array in single mode. The supplied controlled value remains
authoritative. When switching multiple mode off, the application should also
normalize any existing multi-selection, as the example does.

Arrow keys follow the orientation and text direction, skip disabled items and
stay within their nearest accordion. Home and End reach the first and last
enabled trigger. These keys move focus without selecting a panel; Enter and
Space activate the focused trigger. Nested accordions have independent values,
keyboard boundaries and disabled state. All triggers are explicit Tab stops,
except when natively disabled. Orientation selects keyboard behavior; it does
not turn the item layout into horizontal columns.

The [compiled consumer example](example/disclosure.contract) includes single and
multiple selection, disabled items, nested groups, both variants and separators.
Every declared prop is required, including all fields of the state shapes.

## Composition, motion and lifetime

Exact slot fills keep the caller's providers. They do not inherit an enclosing
library wrapper's `provide` values. Passing the shared state explicitly lets
custom compositions and nested accordions retain Exact's lexical scope.

Panels keep one private measurement wrapper around their content. They retain
the actual children throughout collapse, use intrinsic content height, and
update after content or viewport changes. The adapter animates height and
opacity using the shared Lenso duration and timing curves; editors and text are
not scaled. Reversing a running transition starts from its current rendered
values. A fully expanded parent follows nested content's layout changes without
adding another delayed transition.

Reduced Motion settles a transition immediately and disables future transition
animation while enabled. Re-enabling motion applies to subsequent toggles.
Removing a panel cancels its animations, disconnects its resize observer and
preference listener, and restores the inline properties it owned. Application
state persists when the example remounts the controls; child-local state follows
Exact's ordinary mount lifetime.

`test:browser` verifies these behaviors in Chromium and WebKit, captures both
appearances at 390 and 820 px, and writes per-frame motion samples. Those checks
do not establish iPhone performance or native motion parity. See [initial style delivery](INITIAL_STYLES.md) for the linked-page styling path
and its remaining initialization boundaries.
