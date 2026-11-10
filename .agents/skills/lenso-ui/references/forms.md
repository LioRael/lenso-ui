# Forms and value ownership

Resolve the installed family's parts and example through
[query.md](query.md) before writing JSX. Lenso's `TextField` family is not
shadcn's `Field`; `ComboBox` spelling and native callbacks come from Lenso exports.

## Choose the interaction

- Use TextField for composed text editing, Input/Textarea for their supported
  native control roles, and InputGroup for supported leading/trailing content.
- Use Select for choosing from fixed options; use ComboBox when users type to
  search options. Autocomplete is a distinct contract: inspect whether the task
  edits text or selects an item before choosing.
- Use CheckboxGroup for multiple selections, RadioGroup for one choice, Switch
  for an immediate boolean setting, and ToggleButton/ToggleButtonGroup for
  pressed actions. Tabs own content panels; they do not replace form choices.
- Use the matching date/time/color parts and their internationalized values.
  Inspect the actual `onValueChange` signature and conversion boundary instead
  of passing display strings or JavaScript Date objects by assumption.

## Keep semantics and data together

Use the family's native label, description and error association. Preserve
`name`, required/disabled/invalid state and form participation. Read how the
family associates IDs before hand-wiring them. Related controls belong in the
supported fieldset/group with a meaningful label.

Store selection keys or typed values independently from display text. Handle
clear/reset using the native empty value; do not change from uncontrolled to
controlled halfway through editing. Derive summaries and filtered rows from the
same state owner. Keep draft editing distinct from persisted values when the
workflow has Save/Cancel.

Use `Button type="submit"` for submission and `type="button"` for other form
actions. A pending supported Button uses `isLoading` to block repeat activation
while retaining focus. Keep validation errors next to their owning field and
preserve the user's draft after a failed submission.

## Verify

Operate typing, selection, clear/reset and keyboard navigation. Submit and
inspect actual values, including disabled controls and translated labels where
relevant. Exercise invalid input and error recovery. Confirm caret, selection,
paste and native editing still work after styling or render composition changes.
