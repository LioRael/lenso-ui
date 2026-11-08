# NavigationBar and PageControl validation

Historical initial validation. PageControl's Ultrathin capsule described below
was subsequently replaced with small Glass after a user reported that prominent
and plain looked identical on flat backgrounds. See
[the visibility correction](page-control-prominent-visibility.md) for current evidence.

Reviewed 2026-11-08 against the current working tree. Unrelated existing work
was retained. No primitives component source or public API was edited.

## Delivered behavior

- NavigationBar adapts upstream commit `0d9a1c51fc6e533f9a655330570312159e7f4787`
  through Lenso Toolbar, ScrollEdge, semantic tokens and StyleX. It supports a
  collapsing large title, inline headings, action slots, labelled back action,
  native toolbar disabled state, forwarded refs and Base UI direction.
- Scroll ownership can be explicit, the nearest scrolling ancestor or the
  document. Resolve inferred ownership at ref attachment, and subscribe after
  ancestor refs commit. Resize observation updates the collapse threshold.
- PageControl adds `prominent` and `plain`; the default preserves the existing
  Ultrathin capsule. Plain omits the material without changing hit geometry.
- A single selected dot enters the Tab sequence. Arrow keys and Home/End select
  pages and transfer focus across the nine-dot window. Left/Right follow Base UI
  direction. Bounds clamp, modified keys remain native and caller cancellation
  is respected. Controlled selection must be accepted before focus moves.
- Public exports, documentation Stories, generated API/content/contracts,
  migration notes and MIT attribution were updated.

## Evidence

| Check                                                                                    | Result                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Affected oxfmt and oxlint                                                                | Passed                                                                                                                                                                                      |
| UI, tokens, docs/scripts and testing typechecks                                          | Passed                                                                                                                                                                                      |
| UI and tokens package builds, including declarations                                     | Passed                                                                                                                                                                                      |
| Navigation/PageControl and existing Toolbar group DOM regressions                        | 3 passed                                                                                                                                                                                    |
| Documentation projection regressions                                                     | 9 passed                                                                                                                                                                                    |
| Isolated installed consumer: public subpaths, declarations, SSR and production CSS build | Passed, including new NavigationBar and both PageControl variants                                                                                                                           |
| Generated contract                                                                       | 220 documents, 1,240 example graphs and 93 style maps round-tripped                                                                                                                         |
| Chromium and WebKit, light/dark, 390px viewport                                          | Passed title collapse, sticky bounds, heading ownership, back action, keyboard window crossing, bounds, controlled acceptance/rejection, cancellation, disabled state and material variants |
| Chromium and WebKit, 1280px viewport                                                     | Passed RTL chevron and horizontal-overflow checks                                                                                                                                           |
| Actual NavigationBar Story                                                               | Album entry, return and reverse ordering passed in both engines and appearances                                                                                                             |

The browser regression is `bun run --filter @lenso/ui-docs test:navigation-controls`.
It serves an isolated hydrated fixture through the docs Vite/StyleX configuration.
It does not save images. Separate temporary captures of the 390px light/dark
states were visually reviewed in Chromium and WebKit.

React Doctor scanned the existing dirty workspace and reported 65/100, including
findings outside these component changes. This is not a clean baseline or proof
of a score improvement; the affected format, lint and type checks above are the
specific validation for this delivery.

## Scoped design review

The existing Apple-inspired direction remains calm and predictable: energy 1,
rhythm 1, motion 1. Title opacity communicates a scroll-state change, and the
shared material distinguishes navigation controls from content.

- Hard gate PASS in the reviewed fixture: real buttons, one exposed heading,
  no narrow-view overflow, and working keyboard and dark-appearance states.
- Purpose gate PASS: navigation uses the existing Toolbar/ScrollEdge material;
  the plain pagination variant adds no optical layer.
- Liveliness PASS: the large heading is the focal point, shared leading edges
  organize content, and selected dots retain the established visual language.
- Craftsmanship PASS for the exercised interactions: native Toolbar control
  ownership, accepted controlled state, cancellation and focus are retained.

## Limits

No native iPhone/Safari device comparison, screen-reader session, exhaustive
contrast audit or full docs production build was run. The fixture uses reduced
motion for deterministic assertions; title-fade timing was not quantitatively
measured. Upstream title sizes and the 12px collapse threshold are Web choices,
not measured native parity. Routing, navigation history, edge-swipe gestures and
application focus/scroll restoration remain outside NavigationBar's contract.
