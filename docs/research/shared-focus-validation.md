# Shared form focus review

## Follow-up: quieter grouped focus

The user found the full-row blue outline too prominent. This follow-up replaces
it in the shared grouped-row style with `fillQuaternary` and a 2px by 18px tint
marker, 6px from the logical leading edge. There is no row outline or added
motion. Pointer editing shows neither cue. Standalone controls retain the
existing 1.5px outline. The initial-pass evidence below describes the earlier
implementation and is superseded for grouped focus by this section.

| Local dev Chromium check | Result                                                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form, light, 1280px      | Tab traversed Notes, Receive notifications and Frequency. Rows had no outline; keyboard focus showed the marker and neutral fill. Inner controls had no duplicate outline. |
| Pointer editing          | Email row fill was transparent and its marker opacity was zero.                                                                                                            |
| Select interaction       | Frequency opened on click and dismissed with Escape.                                                                                                                       |
| Form, dark, 390 × 844    | Switch keyboard focus remained visible with a short marker. Document and viewport widths both measured 390px.                                                              |
| Invalid field            | Submitting the empty required Email retained `aria-invalid=true` and the red 1.5px invalid underline.                                                                      |

Light keyboard fill measured `rgba(116, 116, 128, 0.08)` and dark fill measured
`rgba(118, 118, 128, 0.18)`. These reuse the theme's neutral fill role. The marker
uses the existing focus tint. No new text colors were introduced; a complete
contrast audit was not repeated. Evidence: `quiet-form-focus-light.jpg` and
`quiet-form-focus-dark-mobile.jpg` in the current task visualization directory.

Affected formatting/lint and token typechecks passed. Existing component and
focus-method DOM regressions passed (13 tests). No extra test was added for a
style-only change; browser checks establish the rendered behavior. No WebKit,
production export, full-site acceptance or native pixel-equivalence is claimed.

- Hard gate PASS: pointer editing, keyboard navigation, popup dismissal and
  invalid feedback were exercised; the narrow viewport had no overflow.
- Purpose gate PASS: neutral fill and the short marker locate keyboard focus
  without framing the entire row; the underlying material recipe is unchanged.
- Liveliness PASS: ENERGY 1, RHYTHM 1, MOTION 1 remain appropriate; only the
  current keyboard row receives the existing tint accent, with no new motion.
- Craft gate PASS for this scope: both themes and mixed row types were reviewed,
  and the same shared rule applies to forms and Playground parameters.

## Design and implementation

Continue the approved iOS grouped-form direction: ENERGY 1, RHYTHM 1, MOTION 1.
The current field is the focal point. Existing tint indicates keyboard location;
group surfaces and separators provide structure. No new animation or material
recipe is introduced.

Pointer editing retains the caret and native selection without an extra blue
editing line or outline. Keyboard navigation uses one 1.5px tint outline.
Grouped TextField and Fieldset rows own an inset rounded outline; their editing
controls suppress duplicate outlines. Standalone controls own their outline.
Auxiliary buttons keep an individual keyboard target. Invalid borders and
underlines remain independent from focus.

Input, TextArea, TextField, InputGroup, NumberField, ComboBox, SearchField,
Autocomplete, date and color input groups share document-level input-method
tracking. Tracking does not cancel native events, forwards refs and releases
listeners after the final participating field unmounts. Native `:focus-visible`
still determines whether an element is eligible for a keyboard indicator.
Select and grouped Switch focus follow the same row ownership. The shared focus
shadow no longer inserts a background-colored gap around the tint stroke;
Button, Tabs and field auxiliary buttons use the same thin outline width.

The Playground-local focus tracking and styling were removed. Text alignment in
Playground parameters remains scoped to its text inputs. This supersedes the
Playground-only focus section in `docs-readability-validation.md`.

## Browser evidence

Local dev Chromium checks at 1280px:

| Surface                       | Observed behavior                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grouped TextField             | Pointer: input and row have no outline. Tab: Email row has a 1.5px outline and its input has none.                                                                                 |
| Standalone Input and TextArea | Pointer: no outline. Forward/reverse Tab: a single 1.5px outline.                                                                                                                  |
| InputGroup and ComboBox       | Keyboard: shell owns the outline, inner input has none. Pointer: neither receives an outline.                                                                                      |
| DateField                     | Pointer: no outline. Tab between segments: one group outline. Invalid retains its red underline and segment invalid semantics.                                                     |
| ColorField                    | Keyboard: one group outline, no inner outline. Pointer: no outline.                                                                                                                |
| NumberField                   | Keyboard: one shell outline after removing the legacy style conflict.                                                                                                              |
| Select                        | One standalone rounded outline; Enter opens and Escape dismisses its popup.                                                                                                        |
| SearchField                   | Keyboard: group outline only. Pointer: no outline.                                                                                                                                 |
| Autocomplete                  | Keyboard trigger uses a 1.5px focus shadow. Popup search has a 1.5px inset outline; clicking its input removes that outline. Escape dismisses.                                     |
| Mixed Form                    | Tab from Notes reaches Receive notifications, then Frequency. Each row owns one outline; switch parts and select trigger have no duplicate outline. Enter opens Frequency options. |

At 390 × 844 in dark appearance, grouped TextField keyboard focus remained
inside its row and the inner input had no outline. Document scroll width and
viewport width both measured 390px. Light appearance and the original viewport
were restored afterward.

Screenshots are recorded in the current task's visualization directory:
`shared-focus-keyboard.jpg`, `shared-focus-pointer.jpg`,
`shared-focus-dark-mobile.jpg`, and `shared-focus-mixed-form.jpg`.

## Automated checks

- Component and interaction tests: 4 server tests and 27 DOM tests passed.
- Theme/token tests: 8 passed, including existing semantic status contrast tests.
- Documentation regressions: 91 passed across 18 files.
- UI, tokens, docs and test package typechecks passed.
- Affected source formatting and lint passed.

The new input-method tests catch pointer typing incorrectly switching to
keyboard presentation, cancelled native events, broken forwarded refs and
shared-listener cleanup. Existing DOM tests do not exercise this tracking.
DOM tests do not establish layout or browser rendering. No WebKit, full-site
visual acceptance, production export or native Apple pixel-equivalence claim
is included. Button and Tabs width changes were source-reviewed; this review
does not establish all states of every component that consumes the shared token.

## Design delivery gate

- Hard gate PASS for the changed focus behavior: real controls were exercised
  with pointer and Tab, Select/Autocomplete opened and dismissed, invalid
  feedback remained, and the reviewed narrow surface had no horizontal
  overflow. No content, assets, navigation or marketing claims were added.
- Purpose gate PASS: tint locates keyboard focus; an inset row outline avoids
  clipping at the group boundary. Existing glass recipes remain unchanged.
- Liveliness PASS: the declared low-energy, stationary interaction keeps one
  current target visible, using the existing grouped-form hierarchy and tint.
- Craft gate PASS for the recorded scope: both themes, native editing,
  mixed-control navigation and standalone/grouped ownership were checked;
  shared focus has no Playground-specific implementation.
