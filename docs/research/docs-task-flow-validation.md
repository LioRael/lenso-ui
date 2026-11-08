# Documentation task flow review

This local development review follows `DESIGN.md` and the Apple guidance map.
It supersedes the example organization described in `docs-readability-validation.md`.
It does not supersede that report's separate Playground focus history.

## Changes

- Component Usage opens the canonical example source, including its existing
  local file graph. The Preview tab remains available. Interaction guidance
  precedes the secondary examples.
- Secondary examples are grouped into state/data, composition, validation and
  appearance disclosures. Every source example remains in the inventory.
  Common scenario names have English and Chinese task labels.
- Component navigation uses the catalog's shared categories. A route's current
  category opens on navigation; other disclosure choices remain remembered.
  Category labels and item text retain their shared leading edge. Previous/next
  links use the flattened category order.
- References are collapsed. Copy Markdown keeps an accessible name when its
  visible label is hidden on narrow screens. Component TOCs show major sections.
- Ordinary example scenes use a 128px minimum; larger Playground scenes use
  160px on desktop and 144px on narrow screens. Intrinsic content can grow.
- Main API property rows reflow on narrow screens with visible Type and Local
  default labels. Root aliases with identical properties and callback states
  link to the canonical contract. Literal defaults remain distinct from effective
  context defaults; Button's guide explains its medium/bordered defaults.
- Search is centered within narrow viewports. Generated native API declarations
  and source paths are omitted from the search index. Exact page titles rank
  ahead of incidental headings. Each page contributes fewer results, with a
  two-line snippet limit and a distinct title hierarchy. Keyboard selection
  scrolls within the StyleX viewport, and closing restores trigger focus.
- Quick start exposes its framework choices and first component earlier.
  Design principles explain when to choose Input, TextField, Fieldset and Form.
  Colors includes a rendered background/content/error pairing in both locales.

## Verification

| Check                                       | Result                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Affected source formatting and lint         | Passed with oxfmt and oxlint                                                                                           |
| Docs application and generator typechecks   | Passed                                                                                                                 |
| Documentation framework and test typechecks | Passed                                                                                                                 |
| Docs application regressions                | 91 passed across 18 files                                                                                              |
| Documentation framework regressions         | 70 passed across 10 files                                                                                              |
| Search regression                           | Exact page names precede incidental headings; child snippets remain grouped                                            |
| Generated contract                          | 218 Markdown documents, 1,240 local example graphs and 92 style maps round-tripped                                     |
| Safari desktop, 1280 × 844                  | DatePicker compact preview; current category expanded; light and dark appearances                                      |
| Safari responsive view, 390 × 844           | Form metadata, API property reflow and alias disclosure; search panel stays within viewport                            |
| Search keyboard                             | Form is first for `form`; Enter opens Form; twelve ArrowDown presses reveal ColorField; Escape returns focus to Search |
| Usage and examples                          | Source initially selected; Preview switch works; appearance disclosure exposes the Small/Medium/Large examples         |
| Supporting guides                           | Colors background/content/error pairing inspected in dark appearance                                                   |
| DatePicker interaction                      | Calendar opens from the reduced scene; Escape closes it                                                                |

Rendered evidence was captured through native Safari because the in-app browser
connection was unavailable. These are local dev checks, not a production export,
all-page visual acceptance, mobile-device test or cross-browser guarantee. The
quick-start and component-selection prose changes target the English guides;
uncommon scenario names may retain readable English fallbacks. Complex inherited
API and callback-state tables retain their explicitly scrollable presentation.

## Design gate

Direction: developer reference documentation in the approved Apple-inspired
grouped-content language. ENERGY 1, RHYTHM 1, MOTION 1. The live example remains
the focal point; existing tint identifies interaction; detail is disclosed when
needed. Monospace is reserved for code and API identifiers.

- Hard gate PASS within the recorded scope: the rendered narrow search and API
  fit; search navigation, Escape/focus restoration, tabs and disclosures work.
  Existing loading/error/empty handling remains present. No fictional claims or
  decorative assets were added.
- Purpose gate PASS: each content group owns its surface. Search elevation
  identifies an overlay; chevrons indicate disclosure. No new decorative motion,
  gradients or unrelated icons were introduced.
- Liveliness PASS: the restrained dials match the reference task. Grouped rows,
  consistent leading edges and the existing tint provide continuity.
- Craft review PASS within the recorded scope: source and preview remain paired,
  complete example inventories are retained, aliases preserve canonical links,
  and the affected checks passed. The coverage limits above remain explicit.
