# Documentation search refinement

Historical first pass. The current design follows the later
[Tinycast revision](docs-search-tinycast-validation-2026-11-08.md).

Reviewed on 2026-11-08 using the existing hot-reloading documentation server at
`http://localhost:3000`. This is development evidence, not production acceptance.

## Design and ownership

This is a documentation lookup for developers, using Lenso's grouped content,
semantic colors and native editing. Energy/rhythm/motion: 1/1/1. The input is the
primary focus; compact page groups keep lookup predictable.

- SearchField supplies native editing, clearing and loading feedback. Fumadocs
  retains search, active-result selection and navigation.
- CloseButton dismisses the overlay; Kbd makes keyboard navigation discoverable.
  Escape dismisses even a nonempty query, preserving the previous search contract.
- The grouped surface and 26px outer corners follow the shell. One result viewport
  scrolls between the field and keyboard hints, keeping both controls available.
- Page titles lead indented heading/text matches. Underlines identify matched
  text without changing its readable semantic color.
- The header rises above mobile navigation while it contains the search dialog,
  so its existing modal backdrop covers the complete application.
- New optional labels cover clearing, loading, the initial hint and keyboard
  instructions. Existing consumers need no migration.

## Verification

| Surface                        | Coverage                                                                                                                                                            | Result                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Chromium and WebKit            | English/Chinese, 1280×844 and 390×844, light/dark, reduced motion                                                                                                   | Passed all 16 combinations           |
| Search interaction             | Native input, active-descendant semantics, ArrowDown, clear, empty results, Escape, focus restoration, reopening with an empty query, Enter navigation to Accordion | Passed in all combinations           |
| Loading and error              | Delayed and failed search-index request, visible spinner and error, close button                                                                                    | Passed in Chromium                   |
| Chromium and WebKit            | Backdrop covers mobile navigation, RTL, constrained 320×420 viewport, selection and dismissal                                                                       | Passed                               |
| Result text and keyboard hints | Computed foreground/background contrast, Chinese mobile, light/dark                                                                                                 | Minimum 6.74:1 light and 5.74:1 dark |
| Package checks                 | Documentation package build, documentation and app typechecks, affected lint/format                                                                                 | Passed                               |
| Existing regression tests      | Documentation package                                                                                                                                               | 70 passed                            |

## Scoped delivery review

- Hard gate PASS: real indexed content, functional controls, empty/loading/error
  states and keyboard navigation were exercised; reviewed layouts fit their viewport.
- Purpose gate PASS: shared materials distinguish the editing field from content;
  one modal shadow supplies elevation, and matched-text underlines aid scanning.
- Liveliness PASS: the stationary field is the focal point; grouped spacing,
  shared rounded surfaces and the existing focus accent preserve Lenso's identity.
- Craftsmanship PASS: source conventions, native behavior, localization, both
  appearances and cross-engine interaction were checked in the scope above.

Synthetic composing Escape also preserved the query and dialog in Chromium and
WebKit. Physical IME behavior remains untested.

No production build of the full documentation site, physical-phone keyboard,
screen-reader session or complete accessibility audit was performed. Contrast
measurements cover result text and footer hints, not every shared component state.
