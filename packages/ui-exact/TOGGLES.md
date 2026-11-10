# Toggle controls

`ToggleButton` and `ToggleButtonGroup` are ordinary content controls. They share
Lenso's Button, ToggleButton and joined-group StyleX recipes. Glass toggles are
a separate family and are not implemented by changing an ordinary variant.

## Standalone composition

`ToggleButton(id, label, pressed, change, disabled, size, variant, iconOnly,
fullWidth)` accepts rich children. Every prop is required by Exact. `change`
receives the next boolean; the caller owns `pressed`. Native buttons own
Enter/Space activation and disabled suppression. `aria-pressed` carries the
persistent state and `label` supplies a localized accessible name.

Sizes are `sm`, `md` and `lg`. Variants are `prominent`, `bordered` and
`borderless`, with source-compatible aliases `default` → `bordered` and `ghost`
→ `borderless`. `iconOnly` selects the square size recipe, while `fullWidth`
uses the available width. `ToggleButtonIcon()` accepts decorative icon content;
keep meaningful text or the accessible name on the button.

Exact uses `data-pressed` for transient pointer feedback. The shared selected
selectors are adapted to `aria-pressed=true` specifically on toggle buttons,
without changing their specificity. The adapter never writes Exact's transient
marker. Selection therefore survives pointer release and is already styled
before the page hatch initializes.

## Groups and state

`ToggleButtonGroupState` contains:

| Field                      | Meaning                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| `id`, `label`              | Root DOM/test id and accessible group name                                       |
| `value`                    | Selected item values, as a string array                                          |
| `multiple`                 | Allow independent selection; otherwise the next selected item replaces the array |
| `disabled`                 | Disable every item                                                               |
| `size`, `variant`          | Shared ordinary button presentation                                              |
| `fullWidth`, `detached`    | Equal-width fill and separated versus joined controls                            |
| `orientation`, `loopFocus` | Horizontal/vertical navigation and wrap/clamp behavior                           |

`ToggleButtonGroup(state)` accepts `ToggleButtonGroupItem(state, id, value,
label, disabled, iconOnly, change)` children. Each item accepts rich content.
`change` receives the next string array. Selecting a pressed item removes it,
including in single-selection mode; single selection permits an empty array.
The caller should keep values unique and pass at most one value when `multiple`
is false. Switching selection modes is also caller-owned: normalize an existing
multiple selection if the application changes to single selection.

Exact slot fills retain caller scope. Pass the same state explicitly to each
item and `ToggleButtonGroupSeparator(state)`; there is no inherited React
context. The separator preserves the source family anatomy and is decorative;
joined controls draw their own seams. A derived state with different size or
variant can supply an item's presentation override while retaining the same
selection and disabled policy. Keep the outer group's state consistent with the
item state used for orientation, joined layout and focus behavior.

```text
use ToggleButtonGroupState, ToggleButtonGroup, ToggleButtonGroupItem from "@lenso/ui-exact"

component Formatting
  state selected = ["bold"]
  derive group = ToggleButtonGroupState(id="format", label="Formatting", value=selected, multiple=true, disabled=false, size="md", variant="bordered", fullWidth=false, detached=false, orientation="horizontal", loopFocus=true)
  action select(value: string[])
    selected = value
  view
    ToggleButtonGroup(state=group)
      ToggleButtonGroupItem(state=group, id="format-bold", value="bold", label="Bold", disabled=false, iconOnly=false, change=select)
        text "Bold"
      ToggleButtonGroupItem(state=group, id="format-italic", value="italic", label="Italic", disabled=false, iconOnly=false, change=select)
        text "Italic"
```

This snippet illustrates composition. The installed-consumer build executes
[example/toggle.contract](example/toggle.contract) with interactive controls,
state changes, dynamic items and nested groups.

## Keyboard and lifecycle

After initialization, each group has one enabled Tab stop. Initial entry prefers
a selected enabled item, then the first enabled item. Focus within the group is
retained across selection and presentation changes. Horizontal arrows follow
the computed text direction; vertical groups use Up/Down. Home/End reach the
first/last enabled item. Arrows move focus without selecting; Enter/Space or a
pointer changes selection. Disabled items are skipped. Before the Web hatch,
the enabled buttons remain native focusable buttons; group roving navigation
starts with initialization.

Adding/removing or disabling items repairs the Tab stop. Nested groups own
independent focus and value state. The controller observes only child membership
and relevant native state, and removes its observer and listeners when ended.
Original tabindex attributes are restored on cleanup. An all-disabled group has
no Tab stops. Reduced Motion uses the shared non-animated feedback.

## Scope

The current implementation includes ordinary sizes/variants, aliases, rich
content, icon-only and full-width composition, joined/detached and horizontal/
vertical groups, single/multiple/empty selection, group/item disabling and
keyboard/lifecycle behavior. Registered caller maps support static custom tint
and StyleX composition before and after initialization; see STYLING.md. Dynamic
inline-value adapters remain open. GlassToggleButton and Toolbar composition require their own adapters and
acceptance. These ordinary families are therefore tracked as partial in
COMPONENTS.md rather than declaring the complete source family API delivered.

The installed-consumer browser suite passes in Chromium 156 and Playwright
WebKit 27.2. It verifies the behaviors above, blocked-hatch selection styling,
all 689 composed consumer cases (613 core recipes), light/dark at 390/820 px and RTL
screenshots. It also runs the existing forms, disclosure, navigation, progress
and material regressions. This is Web evidence; native adapters and physical
Safari/iPhone acceptance remain outstanding.
