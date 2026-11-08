# Form invalid indicators

Date: 2026-11-03

## Rules

Transparent grouped editors use a 1.5px error-colored bottom line instead of a
rectangular frame. Invalid state owns the line color even during editing.
TextField.Input, Input, TextArea and InputGroup share this grouped treatment;
the inner control does not paint another error edge.

Independent input shells retain a single 1px inset error edge following their
own corners. Common material shells no longer switch to a 2px outer error ring
on focus. Date and color groups now display an error bottom line: setting a
border color alone did not paint an indicator with their zero-width borders.
Time and picker segment groups share the date-group styles.

Borderless Select and Autocomplete triggers use an error bottom line instead
of an error outline. Select also retains a subtle keyboard-focus fill. SearchField
now paints an error edge on its existing glass shell while preserving the shell
shadow, field associations and its separate input focus outline.

No form APIs, native validity rules, value models or error messages changed.

## Browser evidence

Reviewed the existing Chromium development docs. The TextField viewport was
746px wide, with an additional explicit 390 by 844 narrow check. Temporary
viewport overrides were restored afterward.

| Family           | Review                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TextField        | Playground invalid switch; focused and unfocused shells use red 1.5px bottom lines; no inner shadow or shell outline          |
| InputGroup       | Existing invalid example; one red 1px inset edge with 26px corners, no additional outline                                     |
| NumberField      | Existing validation example, resting and focused; one red 1px inset edge with 20px corners and the existing neutral elevation |
| DateField        | isInvalid switch; red bottom line remains while editing a date segment; segment's error focus fill remains visible            |
| ColorField       | invalid switch; red bottom line while editing, no outline                                                                     |
| Select           | Empty required example submitted; both triggers report aria-invalid and display red bottom lines                              |
| Autocomplete     | Empty required example submitted; both triggers report aria-invalid and display red bottom lines without error outlines       |
| SearchField      | One-character query in the form example; aria-invalid, linked error description and red inset edge are present                |
| TextField themes | Light line rgb(255, 56, 60); dark line rgb(255, 66, 69)                                                                       |
| Narrow TextField | 390px viewport, no document horizontal overflow                                                                               |

Input and TextArea were traced through their shared input styles. ComboBox was
traced through the common material shell. TimeField and picker fields were traced
through the date input group. Their separate invalid scenes were not individually
operated in this pass. InputOTP retains its existing per-slot error border and
was reviewed in source; its slots should remain independent surfaces.

Screenshots in the chat visualization directory: invalid-textfield-light.jpg,
invalid-textfield-dark.jpg and invalid-textfield-mobile.jpg.

## Checks and limits

Affected format/lint and token/UI typechecks passed. Existing component tests
passed (4 server and 25 DOM tests), and the token suite passed (8 tests). The
consumer contract was regenerated after the shared style updates.

This is development-preview evidence. WebKit, a production export, a complete
contrast audit and native-reference pixel comparison were not performed.
