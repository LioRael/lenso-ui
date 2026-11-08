# Documentation readability review

## Scope

The shared Playground now groups parameters into Content, Appearance and State.
The preview occupies the row above the parameters. Fields now flow through one
grid, with three columns from 900px of available space, two from 600px, and one
below that. All parameters appear by default. Native Tabs filter by Content,
Appearance, State and More parameters without reserving separate group columns.
Button's full parameter area measured 228px high at 1600px, down from the
previous 302px arrangement. Its preview minimum is now 96px. Editing a label,
switching to State, changing disabled and returning to All retained both values
and updated the preview. Reset and Code synchronization were also checked.
A 390px dark-theme review had no document overflow; State displayed three usable
switch rows. The maintained browser check can edit disabled directly in All.
The parameter tabs use equal 96px slots to match the existing Tabs indicator
geometry. The previous content-sized override caused incorrect highlight
positioning. Content, Appearance and State were each checked: selected tab and
indicator widths measured 96px, and their left edges differed by less than
0.001px after settling. Panels now render their own parameter records.
At 390px, keyboard End selects State and scrolls it into view (x=280px,
right=376px); the document remains 390px wide. Focus scrolling applies only to
the Playground parameter tabs. Format, lint and docs typechecks passed again.
Unclassified parameters remain available under More parameters. Larger
compositions retain the existing preview size.
Parameter groups use one secondary background directly on each group.

The component-page generator gives common scenarios descriptive English and
Chinese titles. Other scenario titles omit the redundant component prefix.
Sizes, variants, disabled and full-width examples are collapsed on pages with
a Playground. Every scenario remains in the page and example inventory.
API component properties remain expanded on the first part; common properties,
callback state and inherited HTML/ARIA tables are available on demand.
The mobile floating navigation was outside this change's scope.

## Evidence

Playground-only focus refinement: mouse editing leaves the text caret visible
without an input underline or row outline. Tab navigation adds a 1.5px inset
rounded outline around the parameter cell. Inputs, selects and switches suppress
their duplicate focus decoration inside that cell. Pointer and keyboard modality
are tracked locally; leaving the parameter section resets keyboard entry.
Light and dark keyboard focus, forward/reverse Tab navigation, switch focus,
editing and Reset were exercised in Chromium. Computed input/select shadows were
none, input surfaces remained transparent, and the switch had only its row focus
outline. The shared component styles and preview component focus were unchanged.
Affected format/lint and docs typechecks passed.

| Check                                                    | Result                                                                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting and lint on changed source                    | Passed                                                                                                                                      |
| Docs application and generator typechecks                | Passed                                                                                                                                      |
| Docs regression suite                                    | 91 passed across 18 files                                                                                                                   |
| Final parameter test after a test-only typing correction | Passed                                                                                                                                      |
| Button, English, light, 1280px and 1600px                | Latest 1600px grid measured three 326.664px columns; full parameter area measured 228px                                                     |
| Button, Chinese, dark, 390px                             | Localized groups and titles; document width and scroll width both 390px; group fill measured rgb(28, 28, 30) over a transparent wrapper     |
| Button parameter editing                                 | Label and disabled updates reached the preview; Code reflected the edited label; Reset restored defaults                                    |
| Input advanced parameters                                | Earlier disclosure check verified elastic editing; the latest grid includes these controls under All and More parameters                    |
| Collapsed Button scenarios                               | Enter opened the basic-state section; Sizes preview mounted and displayed Small, Medium and Large                                           |
| API disclosure                                           | Enter exposed common properties and callback-state tables                                                                                   |
| API data preservation                                    | Existing all-family regression verifies every property record and part remains represented, and shared inherited tables remain deduplicated |

These were local dev Chromium checks. No production export, WebKit run, complete
all-page visual review or pixel-equivalence claim is included. Scenario title
localization covers common patterns; uncommon names retain readable English
fallbacks. Existing navigation, animation and component behavior were retained.

## Design review

Direction: continue the approved iOS grouped-form style. ENERGY 1, RHYTHM 1,
MOTION 1. The preview is the focal point; spacing separates content, appearance
and state. The existing tint indicates interaction. Source code retains its
monospace typography because it must be read and copied as code.

- Hard gate PASS for the changed surface: real controls and native disclosures
  were exercised; loading, empty and preview-error handling remain in place;
  the reviewed desktop and narrow layouts fit their viewports.
- Purpose gate PASS: each group has a single fill for visual separation; no new
  decorative effects, assets, marketing claims or navigation were introduced.
- Liveliness PASS: compact previews and named groups establish hierarchy using
  the existing typography, tint and form vocabulary.
- Craft review PASS for the recorded scope: editing, reset, code synchronization
  and keyboard disclosure behavior were checked; both themes were inspected.
