# Documentation search: Tinycast revision

## Motion follow-up

Reference inspected at Tinycast commit
`fd1701b2d0b85befa325ffa2eb66a03d50ce17f4`:

- [PaletteWindowController.swift](https://github.com/abue-ammar/tinycast/blob/fd1701b2d0b85befa325ffa2eb66a03d50ce17f4/Tinycast/Palette/PaletteWindowController.swift)
  delegates the expanded launcher's window motion to AppKit `.documentWindow`;
  the compact launcher uses its separate reveal rather than this native window
  animation.
- [PanelTransition.swift](https://github.com/abue-ammar/tinycast/blob/fd1701b2d0b85befa325ffa2eb66a03d50ce17f4/Tinycast/DesignSystem/Interaction/PanelTransition.swift)
  defines the general panel entrance at scale 0.94 → 1, with ease-out entry and
  ease-in window fade-out.
- [Theme.swift](https://github.com/abue-ammar/tinycast/blob/fd1701b2d0b85befa325ffa2eb66a03d50ce17f4/Tinycast/DesignSystem/Theme.swift)
  defines general panel durations of 180ms entry / 120ms exit. `Motion.swift`
  suppresses motion when animations are disabled.

The Web search now uses an independently authored StyleX scale/opacity
presentation based on those general panel values, with a symmetric return to
0.94 on exit. No Swift implementation or assets were copied. AppKit's native
window transition is not available in the browser, and its internal timing is
not exposed by that source; this is a Web interpretation, not a matched-pixel
claim about the native launcher or the installed Tinycast 0.12.8 build.

The dimming overlay uses the same timing. Reduced motion disables both
animations. Only presentation scale and opacity animate; the renderer retains
the final layout dimensions and continuous live rim. Query/result updates do
not acquire layout transitions. Clearing the query waits until close autofocus
cleanup, after exit, to avoid switching back to quick-access results and
changing height during the fade.

Chromium and WebKit verified entry/exit timing and keyframes, retained query
and height during exit, empty query on a fresh reopening, successful rapid
reopening during exit, and reduced-motion suppression. The existing search
stability suite was repeated at 1440px / 390px for the animation integration;
the material suite checks home/docs ownership and existing blur behavior.
Both appearances passed the stability suite in both engines (8 cases). The
material suite passed Chromium pixel checks and WebKit ownership checks, with
the existing headless WebKit native-blur-control limitation. Initial parallel
runs hit preview navigation timeouts; sequential reruns completed. Docs build,
docs/app typechecks and affected format/lint passed. A paused Chromium frame at
90ms was reviewed: scale 0.981079, opacity 0.684643, final layout height 350px,
and the continuous live rim present.
See the same-day stability report for what these frame checks establish;
they do not constitute high-speed native Safari or matched AppKit video parity.

Reviewed on 2026-11-08 in development at `http://127.0.0.1:4310`.
This supersedes the [first search pass](docs-search-validation-2026-11-08.md).

## Reference and design

The primary reference was the owner's installed Tinycast, observed directly in
its empty-query, `safari` results and ArrowDown selection states. The application
version was not established. This is a structural adaptation, not a native pixel
match. Raycast's [current search manual](https://manual.raycast.com/search-bar)
also describes the single search entry and keyboard-first root-results model.

The task is a developer looking up documentation. Energy/rhythm/motion remain
1/1/1: immediate editing, predictable rows and stationary content. A single list
was chosen over a split preview because these short documentation matches fit
within a title and summary, and the same hierarchy works on phones.

- SearchField.Input, SearchIcon and ClearButton compose directly into the panel,
  removing the nested pill field. The input has no leading blue marker.
- The complete panel uses the shared medium Liquid Glass recipe and renderer,
  including its blur, optical edge and refraction. Result items use a neutral
  selected fill without individual glass layers. The previous thick Surface and solid active fill are
  replaced; icon backings are removed. A lightly dimmed backdrop leaves material
  filtering to the panel instead of blurring the entire application.
- FileText identifies pages; Hashtag identifies section links. These use the
  existing Gravity icon dependency. Titles, one-line summaries and trailing type
  labels occupy stable columns, with one neutral active-row treatment.
- Body matches become their page's summary instead of separate selectable rows.
  Headings keep their independent deep links. The existing exact-title ranking
  remains in place, and the source search data is not mutated.
- The application provides six real quick-access pages through optional `links`.
  Consumers that omit `links` retain the initial text hint. New optional labels
  localize sections, result types and contextual actions; no migration is required.
- The footer's GlassButton opens the active page or section. Its action and Enter
  hint follow selection. CloseButton retains a compact Escape hint.

## Verification

### Scroll edges

The follow-up inspected Tinycast's
[EdgeDissolve.swift](https://github.com/abue-ammar/tinycast/blob/main/Tinycast/DesignSystem/Scrolling/EdgeDissolve.swift),
[OverflowFade.swift](https://github.com/abue-ammar/tinycast/blob/main/Tinycast/DesignSystem/Scrolling/OverflowFade.swift)
and [UI documentation](https://github.com/abue-ammar/tinycast/blob/main/docs/ui.md).
These establish scroll-driven opacity masks, with a separate palette treatment
for content underlapping floating bars. The Web integration independently reuses
Lenso's existing ScrollShadow; no Tinycast source implementation was copied.

The approved compact layout keeps its header and footer as siblings of the
viewport, so the result scroller uses 24px edge fades instead of Tinycast's
bar-sized underlap bands. One viewport owns scrolling and the mask; the outer
glass and action remain outside it. Scroll padding reserves the same 24px for
keyboard reveal. Chromium and WebKit light/dark checks passed fitting lists,
top/middle/bottom scroll states, keyboard reveal and resetting to no results.
The package build, documentation/app typechecks and affected lint/format passed.

### Compact layout

The later density pass narrows the panel from 720px to 640px, replaces the fixed
520px height with content sizing capped at 460px, and reduces result rows from
56/48px to 36px for single-line entries and 48px when a summary is present.
Input and footer spacing are reduced together so short and empty lists do not
retain unused panel height. The single outer glass plane and ordinary selected
row remain unchanged.

Chromium and WebKit light/dark density checks measured 350px for quick access,
460px for the long Button result list, and 219px for no results. Row heights were
36/48px. Arrow-key selection, dismissal, internal scrolling and fitting within
320×420 also passed. The density pass passed the documentation package build,
typecheck, affected lint and formatting checks.

| Check                        | Evidence                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chromium and WebKit          | All 16 English/Chinese × light/dark × 1280×844/390×844 combinations passed                                                                                               |
| Search editing and selection | Query entry, active-descendant updates, ArrowDown, clear to six quick-access pages, empty results, Escape, restored trigger focus, reopening and Enter navigation passed |
| Contextual actions           | Quick-access page activation and Open section navigation to an existing fragment passed in both engines                                                                  |
| Constrained layout           | 320×420, RTL, internal result scrolling, backdrop above mobile navigation and synthetic composing Escape passed in both engines                                          |
| Loading/error                | Delayed and failed index requests displayed the spinner and error; close button worked in Chromium                                                                       |
| Rendered review              | Chinese desktop and phone, light/dark captures inspected with actual Button search results                                                                               |
| Sampled text contrast        | Visible desktop result text, summaries and type labels: minimum 6.67:1 light and 5.30:1 dark, using rendered background samples and computed foreground colors           |
| Package validation           | Documentation package build, documentation/app typechecks, affected format/lint and 71 documentation regression tests passed                                             |

The additional regression catches body snippets becoming independent keyboard
stops or losing their parent page while ensuring headings keep their own URLs.
Existing ranking coverage did not cover this presentation transformation.

Increased-contrast checks in Chromium and WebKit confirmed that the panel glass plane
uses the shared opaque fallback, with refraction disabled, while selection and
dismissal remain functional. The material correction adds a direct workspace
dependency on `@lenso/glass`; it does not change the public search API. The 71
lookup regression tests above were retained from the preceding structural pass;
this material pass reran package/app typechecks, the package build, affected
format/lint and the browser checks.

## Scoped delivery review

- Hard gate PASS: real content and quick links, functional controls,
  empty/loading/error states, keyboard access and fitting viewports were exercised.
- Purpose gate PASS: one continuous window establishes scope; semantic icons,
  matched-text underlines and the contextual action support lookup and navigation.
- Liveliness PASS: the large unboxed input is the focal point; consistent leading
  guides, neutral selection and the floating action follow the observed reference.
- Craftsmanship PASS: native editing and selection ownership, localization,
  cross-engine geometry and navigation passed the checks above.

This is development verification. The original port-3000 process developed stale
module errors and HTTP 500 responses, so the maintained preview entrypoint started
an independent server on port 4310. The original process was not stopped.
No production site build, physical-phone keyboard, real IME, screen-reader session,
full contrast audit or native material equivalence was established. Sampled
contrast does not cover every possible backdrop or shared component state.
