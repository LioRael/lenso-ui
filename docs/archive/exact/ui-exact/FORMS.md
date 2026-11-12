> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Form components

All declared Contract props are required at a call site. Pass an empty string for
an unused text/ARIA field, and an application no-op action for an unused handler.
The complete [example](example/forms.contract) is compiled by `test:browser`.

## Editing

`Input` takes:

| Prop                                          | Type / purpose                                       |
| --------------------------------------------- | ---------------------------------------------------- |
| `id`                                          | Unique DOM id; also the Exact test id                |
| `name`                                        | Native HTML field name                               |
| `label`                                       | Accessible name when there is no visible label       |
| `labelledBy`                                  | Space-separated visible label ids; `""` uses `label` |
| `describedBy`                                 | Space-separated description or error ids             |
| `value`                                       | Raw draft string                                     |
| `input`                                       | Exact action receiving the edited string             |
| `change`                                      | Exact action receiving the committed string          |
| `submit`                                      | Exact action on Enter; no arguments                  |
| `placeholder`                                 | Native placeholder                                   |
| `type`                                        | An input type admitted by the pinned Exact compiler  |
| `autocomplete`                                | Native autocomplete hint                             |
| `disabled`, `readOnly`, `required`, `invalid` | Boolean state                                        |
| `variant`                                     | `primary` or `secondary`                             |

`TextArea` takes the same props except `type`, `autocomplete` and `submit`; it
adds numeric `rows`. It retains native line breaks, caret, selection and resize.
One row selects the shared single-line geometry. Normal editing has no glass or
elastic motion. Those optional presentations remain open coverage items.

Keep one draft owner in the application. `input` should store raw text without
trimming or formatting under the caret. Normalize in `change`. A submit action
should validate and normalize the draft it reads itself; do not assume that a
separate change action has already updated its captured state for the same Enter
event. Input methods remain on Exact's native input path.

Exact does not currently admit ordinary field `name` or native `required` as Contract attributes.
The hatch applies those native attributes to
the existing DOM input; it does not create a second input or synthesize editing
events. These additions arrive with the Web hatch. `readonly` is supported
directly by Exact and is authored declaratively, including before hatch loading.

## Labels, hints and groups

| Component                              | Props                                     | Children |
| -------------------------------------- | ----------------------------------------- | -------- |
| `TextField`                            | `id`, `invalid`, `disabled`               | Yes      |
| `InputGroup`                           | `id`, `variant` (`primary` / `secondary`) | Yes      |
| `InputGroupPrefix`, `InputGroupSuffix` | None; call with `()`                      | Yes      |
| `Label`                                | `id`, `controlId`, `label`, `required`    | No       |
| `Description`                          | `id`, `label`                             | No       |
| `FieldError`                           | `id`, `message`                           | No       |
| `Fieldset`                             | `id`, `label`                             | Yes      |

Connect a visible `Label.id` through the control's `labelledBy`; `controlId`
provides pointer focus/activation. Exact has no HTML `label` tag, so this is an
ARIA naming relationship with a pointer focus helper. The input remains the
keyboard focus target. A required label's asterisk is excluded from its
accessible name.

`TextField` owns field state selectors, keeping invalid hints and errors separate.
`FieldError` is an alert only while `message` is nonempty. Applications select the
relevant `describedBy` ids. `Fieldset` supplies a labelled `group` and legend,
not a native HTML fieldset: applications pass `disabled` to their controls.

An `Input` or `TextArea` inside `InputGroup` uses the shared inner-control styles.
The group owns the surface and focus outline. Clicking a noninteractive prefix
or the group's padding focuses its enabled control without stealing clicks from
buttons, links or editors. Fieldset rows, clear controls, group material/motion
and additional composition APIs still need implementation and acceptance.

## Checkboxes and radio buttons

`Checkbox` takes `id`, `name`, `label`, `describedBy`, `checked`, `indeterminate`,
`change`, `disabled`, `required` and `invalid`. `change` receives a boolean. When
leaving a mixed state, update both `checked` and `indeterminate` in that action.
The visible Lenso control is decorative; a real native checkbox owns focus,
Space, checked state and validity.

`Radio` takes `id`, `name`, `label`, `describedBy`, `value`, `checked`, `change`,
`disabled`, `required` and `invalid`. `change` receives the selected string.
Every radio in one group must share a unique nonempty `name`. The browser owns
arrow navigation, Space, mutual exclusion and disabled skipping; the application
updates the shared selected value. Choosing the same value does not synthesize
another change.

`CheckboxGroup(label, describedBy)` and
`RadioGroup(label, describedBy, orientation)` accept children. Radio orientation
is `vertical` or `horizontal`. Group components provide layout and naming;
application state remains explicit. Multiple-checkbox state can use captured
action arguments, such as `change=toggle("updates")`, with the checkbox boolean
appended by Exact. Secondary choice variants and full group constraints remain
open coverage items.
