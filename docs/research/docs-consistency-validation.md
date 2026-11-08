# Documentation consistency follow-up

This local development review addresses the seven follow-up findings after
`docs-task-flow-validation.md`. It replaces that report's notes about English-only
guide changes and the first-file default in Usage. It is not all-page visual or
production acceptance.

## Changes

- Documentation supplementary text uses `--docs-label-secondary`, derived from
  68% primary label over the page background. This documentation role leaves the
  component library's Apple color roles intact. Validation examples use the
  existing semantic error-text role instead of the raw system red.
- Sidebar categories use a smaller gap. Route changes reveal the current link
  within the sidebar scroll area. Subsequent manual disclosure changes preserve
  the user's browsing position.
- TextField previews retain native associated labels after typing. Multiline
  examples use Fieldset.Group and stacked TextField. The basic example is a
  short, self-contained composition in both languages; its stage owns the outer
  background. Shared scenario examples no longer add another background shell.
- Form Usage initially selects the actual grouped-form implementation. All
  source files remain available. Standalone example source is limited to
  `min(420px, 60dvh)` with a named keyboard-scrollable code region.
- Scenario classification excludes the family prefix and matches `form` as a
  complete scenario token. Formatting belongs to appearance; Form's render
  composition belongs to composition. A regression covers these failures.
- Authored disclosures use a native summary through DisclosureSummary. This
  avoids raw MDX HTML bypassing the component map. References, source disclosures
  and API disclosures use the same 1.5px focus outline and rounded target.
- Form/TextField task instructions are concise lists; generic integration tables
  remain in a closed reference disclosure. Chinese quick start and design
  principles now include the framework choices and field-component selection
  guide. Reference, copy, search and navigation actions are localized, and the
  duplicate English/Chinese Handbook groups are unified.

## Recorded checks

| Check                                                            | Evidence                                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Formatting, lint, application/generator and framework typechecks | Passed                                                                                                  |
| Full docs regression suite                                       | 92 passed across 18 files                                                                               |
| Full framework regression suite                                  | 70 passed across 10 files                                                                               |
| Final affected generation, locale and search regressions         | 19 passed                                                                                               |
| Contract round-trip                                              | 218 Markdown documents, 1,240 local example graphs, 92 style maps                                       |
| Desktop, 1280 × 720                                              | TextField current link at y=614–652 within the sidebar; typing Alex retains its native Name label       |
| Standard light appearance                                        | Description/References 7.86:1; sidebar category 7.05:1; error text 4.51:1                               |
| Standard dark appearance                                         | Description/References 9.40:1; sidebar category 7.62:1; error text 6.80:1                               |
| Narrow, 390 × 844                                                | Document scroll width equals viewport width; labeled preview fits; source region capped at 420px        |
| Keyboard                                                         | References and integration summaries have a 1.5px outline and 6px corners; Enter toggles native details |
| Source selection                                                 | Form selects shared/grouped-form.tsx; TextField opens its self-contained basic.tsx                      |
| Chinese search                                                   | Chinese title/input/close/empty state; Escape returns focus to the search trigger                       |
| Chinese guide                                                    | Field-component selection table renders with locale-correct component links                             |

Browser checks used the in-app browser against the hot-reloading dev server.
Contrast was calculated from rendered colors and ancestor background compositing
in the default theme, with no image backdrop. Custom palettes, increased text
size, RTL, screen-reader operation and a new WebKit run were not reviewed here.
No production build, candidate gate, publication or native pixel-equivalence
claim is included.

## Design gate

Direction remains developer reference documentation in the approved grouped
content language: ENERGY 1, RHYTHM 1, MOTION 1. Labels, code and usable examples
carry the content; existing tint identifies interaction.

- Hard gate PASS for the recorded scope: measured text pairs meet the project
  threshold, the current route is visible, narrow content fits, and keyboard
  disclosure/search behavior was exercised.
- Purpose gate PASS: one example stage owns the background; source scrolling
  bounds a real reading task. No decorative assets or motion were added.
- Liveliness PASS: consistent leading edges, grouped fields and the existing
  accent preserve the restrained visual direction.
- Craft review PASS for the recorded scope: labels, source selection,
  classification and locales were checked against real content. The verification
  limits above remain explicit.
