# Grouped form validation

Date: 2026-11-03

## Implementation

The shared group recipe supplies grouped-secondary background and 26px corners
for default Surface, List, Fieldset.Group and Accordion's surface variant.
Fieldset.Group supplies the transparent editing context. TextField defaults to
row layout inside it, and Fieldset.Row composes Base UI Field.Root for non-text
controls. Legacy grouping exports remain deprecated compatibility entries.

The mixed Form example includes text editing, multiline editing, an input shell,
a switch, a select, expandable settings, native validity and local feedback.
The maintained projection source and generated component pages describe the new
contracts. See ../migrations/grouped-forms-migration.md for consumer changes.

## Automated checks

| Check                                              | Result                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Affected Oxfmt and Oxlint paths                    | Passed                                                                                 |
| UI, tokens, testing and docs typechecks            | Passed                                                                                 |
| Component/testing package                          | 4 server tests and 25 DOM tests passed                                                 |
| Final narrow component regression after corner fix | 11 passed                                                                              |
| Tokens tests                                       | 8 passed                                                                               |
| Docs tests                                         | 89 passed                                                                              |
| Docs projection, locale and source-file checks     | 13 passed                                                                              |
| Native API/content generation                      | Completed with maintained generators                                                   |
| Consumer contract generation                       | Contract 3 round-tripped 218 Markdown documents, 1240 example graphs and 92 style maps |

The new DOM regression catches loss of label associations, clearing, native
form values, disabled-state propagation through mixed sections, or a grouped
layout context leaking into a sibling standalone field. Existing legacy-group
coverage remains. An existing Tabs test used a removed variant prop; it now
uses the current Tabs contract.

The shared recipe lives in surface.styles.ts, keeping one owning style-map
source per family as required by consumer contract generation.

## Browser review

Reviewed the hot-reloading docs in the in-app Chromium browser. Desktop viewport
was 1280 by 720; narrow viewport was 390 by 844.

| Observation                               | Result                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Group backgrounds in light appearance     | All four families measured rgb(255, 255, 255)                                                                        |
| Group backgrounds in dark appearance      | All four families measured rgb(28, 28, 30)                                                                           |
| Outer group corners                       | 26px across the four families                                                                                        |
| Text, list and surface-accordion dividers | 0.5px; 16px insets                                                                                                   |
| Desktop text row                          | 52px; label and input occupy separate columns                                                                        |
| Narrow form                               | Labels stack; no document horizontal overflow                                                                        |
| Editing shells                            | Grouped Input and InputGroup are transparent; no doubled inline padding                                              |
| Grouped Accordion                         | Transparent root, square inner trigger corners, 52px trigger                                                         |
| Native validity                           | Empty required email becomes invalid on submit                                                                       |
| Clear action                              | Keyboard activation clears the value and returns input focus                                                         |
| Focus                                     | Visible input bottom lines and circular clear-button outlines; no second shell ring when the clear button is focused |
| Mixed disabled section                    | Input, switch and select all disabled                                                                                |
| Form workflow                             | Selection, toggling, expansion, local save feedback and reset operated                                               |
| List workflow                             | Wi-Fi toggle updates the displayed network status                                                                    |
| Accordion workflow                        | Enter expands the standalone surface example                                                                         |
| RTL                                       | No document horizontal overflow in the mixed form                                                                    |
| Reduced motion                            | Accordion indicator transition measured 0s                                                                           |

Viewport, direction and reduced-motion overrides were restored after review.
Screenshots are stored in the chat's visualization directory as
grouped-form-desktop-light.jpg, grouped-form-desktop-dark.jpg and
grouped-form-mobile-light.jpg.

## Scope of acceptance

This is component and development-preview verification. WebKit, production
static export, installed-consumer distribution and native-reference pixel
comparison were not run. No comprehensive color-contrast audit was performed;
the existing Apple semantic foreground tokens remain in use. No commit,
publication or deployment is part of this change.

## Focus refinement

The follow-up removes rectangular outlines from transparent grouped inputs.
A shared 1.5px bottom line now indicates focus on grouped editing surfaces,
List.Action and Accordion triggers. Standalone ordinary fields retain a 1.5px
rounded outline. The 44px clear target uses a circular inset keyboard outline;
focusing it does not light the surrounding editing shell. Error edges remain
visible alongside focus. Explicit floating glass recipes are unchanged.

Chromium development preview checks confirmed light and dark bottom-line colors,
keyboard Tab movement into the input shell, the circular clear indicator, and
combined invalid-email and focus treatment. The existing component DOM suite,
tokens checks, affected format/lint and typechecks cover this refinement.
Screenshots: focus-group-light.jpg, focus-group-dark.jpg and focus-clear-light.jpg
in the chat visualization directory. This does not add WebKit or production
acceptance to the scope above.
