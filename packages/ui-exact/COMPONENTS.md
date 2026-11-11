# Exact component coverage

Target: every public component family exported by `@lenso/ui`, implemented for
Exact Web first. Native Exact adapters follow Web completion. This is a tracked
implementation plan, not a declaration that partial families are complete.

A family passes acceptance when its public Exact composition is documented, its
interactive behavior and accessibility work in a compiled consumer, shared Lenso
styles render in light/dark and narrow/desktop layouts, and lifecycle cleanup is
verified in Chromium and WebKit. Relevant variants, disabled/read-only/loading
states, keyboard operation, focus restoration and reduced motion are part of that
family's gate. Native HTML or Exact owns native interaction; additional Web
behavior must preserve Exact state ownership. React prop parity is not an Exact
API, but omitting a capability is still an open coverage item.

The inventory below comes from `packages/ui/src/components/index.ts`. A supported
component name with missing behavior or a placeholder wrapper does not pass.
Publication and repository landing require separate user instructions.

| Lenso family           | Exact Web status      | Remaining acceptance                                                                                                                                                                  |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`            | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain                                                                                                       |
| `alert-dialog`         | Partial               | Native confirmation/material verified; optical, focus/portal/control and device gates remain open (ALERT_DIALOG.md)                                                                   |
| `alert`                | Partial               | Native status composition/material and browser behavior verified; glass capture/device gates remain (CONTENT.md)                                                                      |
| `autocomplete`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `avatar`               | Partial               | Image/fallback and shared variants implemented; delay/callback/render parity remains (AVATAR.md)                                                                                      |
| `avatar-group`         | Partial               | Explicit stack/grid/count composition; inheritance and automatic max/count remain (AVATAR.md)                                                                                         |
| `badge`                | Partial               | Placement, variants, accessible counts and lifecycle verified; glass capture/device gates remain (CONTENT.md)                                                                         |
| `breadcrumbs`          | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                             |
| `button`               | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                            |
| `button-group`         | Partial               | Ordinary/Glass actions, joined geometry, loading and native keyboard behavior implemented; inheritance, native contracts and optical/touch gates remain (BUTTON_GROUP.md)             |
| `calendar`             | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `calendar-year-picker` | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `card`                 | Partial               | All variants, composition, actions and cleanup verified; glass optical/device gates remain (LAYOUT.md)                                                                                |
| `checkbox`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `checkbox-group`       | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `chip`                 | Web behavior verified | Ordinary composition, variants, caller styles and browser behavior verified; broader delivery gates remain (CONTENT.md)                                                               |
| `close-button`         | Partial               | Native/loading behavior and rich content verified; shared Button-family integration remains (CONTENT.md)                                                                              |
| `color-area`           | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-field`          | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-input-group`    | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-picker`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-slider`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-swatch`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `color-swatch-picker`  | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `combo-box`            | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `date-field`           | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `date-input-group`     | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `date-picker`          | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `date-range-picker`    | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `description`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `disclosure`           | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain                                                                                                       |
| `drawer`               | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `empty-state`          | Web behavior verified | Composition, actions, names, themes and RTL verified; native paragraph-tag gap retained (LAYOUT.md, SEMANTIC_GAPS.md)                                                                 |
| `field-error`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `fieldset`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `form`                 | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `input`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `input-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `input-otp`            | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `kbd`                  | Pending               | Native kbd/abbr declaration path absent in pinned upstream; retained gap per owner choice (SEMANTIC_GAPS.md)                                                                          |
| `label`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `link`                 | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                             |
| `list-box`             | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `menu`                 | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `meter`                | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                           |
| `modal`                | Partial               | Native Web composition verified; WebKit exit motion and focus/portal/control parity remain open (MODAL.md)                                                                            |
| `number-field`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `pagination`           | Partial               | Native links, all source sizes, rich parts, responsive/RTL and browser behavior verified; pre-hatch disabled role, structural HTML and native forwarding gates remain (PAGINATION.md) |
| `popover`              | Partial               | Native non-modal interactions, anchored thick material, positioning and lifecycle verified; extended/modal/portal/native and optical gates remain (POPOVER.md)                        |
| `progress-bar`         | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                           |
| `progress-circle`      | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                           |
| `radio`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `radio-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `range-calendar`       | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `scroll-shadow`        | Partial               | Native timelines, observed edges and cold/warm keyboard verified; dynamic first-frame geometry and native/optical/touch gates remain (SCROLL_SHADOW.md)                               |
| `search-field`         | Partial               | Native editing/clear, shared Glass, initial styles and browser behavior verified; native/form/optical gates remain (SEARCH_FIELD.md)                                                  |
| `select`               | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `separator`            | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                             |
| `skeleton`             | Web behavior verified | Shared motion, nesting and registered caller styles verified; broader delivery gates remain                                                                                           |
| `slider`               | Partial               | Single/range state, geometry and interaction implemented; swap, extended API, motion/optical/touch gates remain (SLIDER.md)                                                           |
| `spinner`              | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                           |
| `surface`              | Partial               | Ordinary variants implemented; thick glass background and variant matrix remain                                                                                                       |
| `switch`               | Partial               | State, forms, keyboard and source motion implemented; optical, touch and extended API gates remain (SWITCH.md)                                                                        |
| `table`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `tab-bar`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `tabs`                 | Partial               | Selection, panels, keyboard and source motion implemented; overflow, extended API and optical/touch gates remain (TABS.md)                                                            |
| `tag`                  | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `tag-group`            | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `textarea`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `textfield`            | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                           |
| `time-field`           | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `toast`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `toggle-button`        | Partial               | Registered style/tint composition verified; dynamic inline values and Toolbar composition remain                                                                                      |
| `glass-toggle-button`  | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `toggle-button-group`  | Partial               | Registered style/tint composition verified; dynamic inline values and Toolbar composition remain                                                                                      |
| `toolbar`              | Partial               | Native focus, shared surfaces and detachable fusion verified; sticky edge/Menu/native and optical gates remain (TOOLBAR.md)                                                           |
| `navigation-bar`       | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `swipe-actions`        | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `wheel-picker`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `tooltip`              | Partial               | Native descriptions, timing, grouped triggers and thick material implemented; extended/native and optical gates remain (TOOLTIP.md)                                                   |
| `typography`           | Pending               | Native paragraph/code and full Prose/polymorphic semantics remain open on unchanged upstream (SEMANTIC_GAPS.md)                                                                       |
| `glass`                | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                            |
| `glass-container`      | Partial               | Shared fusion engine, member lifecycle, worker/GPU and CPU fallback verified; broader membership, native forwarding and optical/device gates remain (GLASS_CONTAINER.md)              |
| `glass-magnifier`      | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `glass-button`         | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                            |
| `context-menu`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `action-sheet`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `sheet`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `stepper`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `list`                 | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `page-control`         | Partial               | Controlled page window, keyboard/focus and shared track implemented; extended native contracts and optical/touch gates remain (PAGE_CONTROL.md)                                       |
| `popup-button`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `sidebar`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `notification`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `share-sheet`          | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `segmented-control`    | Partial               | Radio value model, forms, keyboard and shared selection motion implemented; extended contracts and optical/touch gates remain (SEGMENTED_CONTROL.md)                                  |
| `section-index`        | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `refresh-control`      | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |
| `command`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                  |

Supporting Exact components: `Theme` and `Backdrop` are implemented. Theme portal
synchronization, contrast, transparency preferences and directionality still need
acceptance alongside the families that consume them.

## Delivery gates

- Contract imports resolve through the distributable package, including split files.
- Browser assets, CSS and declarations build without React or a Rust requirement.
- Integration checks build against the pinned Exact checkout; no toolchain or
  compiler is installed implicitly.
- Ordinary package checks catch missing catalog entries without requiring Exact.
- Browser evidence covers actual interactions and rendered output, not source
  snippets or a successful compile alone.
- Docs, consumer setup, first-frame CSS and release contents are verified.
- Existing React primitives and public APIs remain unchanged.

## Current build and focused acceptance

The Tooltip checkpoint builds 4225 core recipes and 5739 consumer recipes.
Its focused Chromium/WebKit cohort checks 48 affected recipes, 36 placement
endpoints, native descriptions and actions, grouping, focus, timing and cleanup.
Touch is checked in emulated mobile contexts. The preceding Popover checkpoint
built 4177 core recipes and 5691 consumer recipes.
Its focused Chromium/WebKit cohort checks 66 affected recipes, linked first-frame
styles/native opening, keyboard and nested dismissal, 36 placement endpoints,
caller styles, scrolling/tracking opt-out, preference fallbacks and teardown.
Hover checks cover eight physical-side/direction routes with shared and diagonal
gap travel, rest delays, click promotion, active-invoker switching and cleanup.
Touch activation is checked in emulated mobile contexts, including popup focus
and suppression of compatibility hover. Browser shortcut modifiers remain native.
Modal, AlertDialog and navigation regressions cover the shared focus traversal.
The preceding Toolbar cohort checked 2325 affected recipes and 32 endpoints;
GlassContainer checked 5 affected recipes and worker/main-thread fallbacks.
This is not a rerun of the entire catalog. Earlier cohort counts below retain
their historical scope.

## Verified integration slice (2026-11-10)

- Chromium 156.0.8078.4 and Playwright WebKit 27.2: button activation, disabled
  updates, dimensions and theme changes; glass disposal and recreation.
- Input/TextArea: live draft text, commit/submit normalization, selection, native
  required/name/readOnly/disabled state, visible-label focus, invalid/error/hint
  associations, and disposal/recreation without losing application state.
- Checkbox/Radio: mixed state, Space, controlled updates, native group arrow
  navigation and disabled suppression.
- InputGroup: its native editor retains selection; shell/prefix focus reaches
  that editor, and the inner control uses the shared grouped presentation.
- Form rendering: light/dark at 390 and 820 px, with an overflow assertion.
- WebKit filter overscan: clipping the copied output restored document scroll
  width from 414 to 390 px without changing the stabilized viewport pixels in
  the isolated clipping probe. This does not establish arbitrary live backdrop
  support or a performance improvement.

The browser check writes its exact engine versions and built asset hashes to
`.cache/example/verification.json`; failing runs remove the previous consumer
build and do not leave a new success receipt. This slice does not prove the
full variant/motion/composition gates above. Native Safari/iPhone remains untested.

## Expandable content verification

`Disclosure` and `Accordion` now provide the full documented Exact composition
through explicit state shapes and rich-content parts. Exact's slot fills keep
the caller's providers, so the API does not depend on React-style inherited
context across a receiving slot.

Browser acceptance covers native Enter/Space/Tab, ARIA trigger/region links,
closed-content inertness, focus restoration, retained drafts, single/multiple
selection, group/item disabled state, vertical/horizontal and RTL navigation,
Home/End, loop/clamp behavior and nested keyboard isolation. Both visual variants
and separators are exercised. Panels measure content and resize, reverse live
height/opacity transitions, settle for Reduced Motion, and release animations
and observers when removed. Per-frame samples accompany the screenshots.

Linked-page initial styles are now supplied by attribute alternatives generated
from the same StyleX recipes. The browser test blocks the page module through
rendered frames and compares pre-hatch and initialized presentation. Core generation retains 900 recipes. The styled consumer compares 1055
composed cases with their class branches in Chromium and WebKit. See
INITIAL_STYLES.md for the verified scope. Server response integration and native
attributes that require the hatch remain separate delivery boundaries.

## Navigation verification

`Link`, `Breadcrumbs` and `Separator` share their source families' ordinary
styles. The installed consumer verifies native anchor click/Enter navigation,
a new `_blank` context using a locally fulfilled destination, disabled href
removal before hatch, initialized synthetic-event guards, enabled-only Tab
order and focus indication. Breadcrumbs use explicit current-page/group state,
rich link content, separate decorative separators, RTL layout and chevrons.
Semantic and decorative separators cover both axes and all variants. Dynamic
state, removal/recreation, guard disposal, reduced motion, initial styles and
light/dark at 390/820 px pass in Chromium and WebKit. See NAVIGATION.md.

`Kbd` remains pending: the pinned Exact host does not expose native `kbd` or
`abbr` through the Contract elements. No visual-only substitute is counted as
completed keyboard semantics.

## Progress and loading verification

`ProgressBar`, `Meter` and `ProgressCircle` use explicit range shapes for one
source of numeric and visual state. The compiled consumer verifies nonzero
minimums, high/low clamping, reversed ranges, custom accessible output, disabled
presentation, all track sizes and colors, RTL fill alignment and circular dash
geometry. Unknown progress omits `aria-valuenow` before and after hatch while
meters retain their determinate measurement.

`Spinner` uses the shared eight-spoke geometry, named status and four sizes.
`Skeleton` retains the shared shimmer/pulse/none animations and nested parent
overlay, with an inert, accessibility-hidden placeholder subtree. Both browsers
verify Reduced Motion and removal/recreation, including released CSS animations.
Core generation retains 900 recipes; the styled consumer checks 1055 composed cases; screenshots include
light/dark at 390/820 px and RTL. Circle leaves use documented reserved ID
suffixes for declarative styles because Exact refuses hatches/data words on SVG
leaves. These checks do not establish native support. Registered caller styles are
verified separately below; arbitrary inline values remain unsupported. See FEEDBACK.md for the public composition and remaining boundaries.

## Toggle verification and selector factoring

Ordinary `ToggleButton` and `ToggleButtonGroup` now provide rich composition,
icon-only/full-width sizes, standard variants and aliases, joined/detached
layouts and explicit Exact selection state. The installed consumer passes native
Enter/Space, single/multiple/empty selection, disabled suppression, roving Tab
stops, arrow/Home/End navigation, loop/clamp behavior, RTL/vertical direction,
nested isolation, dynamic item removal/recreation and group listener cleanup.
Initial selection prefers an enabled selected item. Reduced Motion and
light/dark at 390/820 px pass in Chromium and WebKit. Registered static tint and caller styles are verified below. Dynamic inline
values and Toolbar integration remain open; see TOGGLES.md.

The adapter maps the shared persistent selected predicates to `aria-pressed`
for toggle nodes, preserving specificity. Exact retains its own transient
`data-pressed` marker; the adapter does not write it. Initial and initialized
selection presentation match in the blocked-hatch check.

Enumerating the complete ordinary toggle style matrix expanded the generated
stylesheet to about 4.46 MB. Identical selector tails are now factored while
retaining the same combinations, rule order and declarations. That checkpoint
emitted 392,990 CSS bytes / 30,840 gzip bytes for 469 recipes before the
reserved library class prefix was added. At that historical checkpoint the
prefixed core emitted 404,324 bytes / 31,104 gzip bytes with the same 469 recipes.
These byte counts predate the modal recipes. That 900-recipe checkpoint emits
561,843 CSS bytes / 39,928 gzip bytes; the styled consumer emits 600,456 CSS bytes.
Unit cases guard against widening diagonal combinations; both browsers compare every recipe
with its class branch, alongside all existing behavior regressions. These are
asset-size observations, not startup-time, frame-rate or device benchmarks.

## Registered caller-style verification

`PresentationRule`, `styleWeb` and `createWebHatch` provide one static rule set
for build-time and initialized StyleX composition. All presentation helpers
retain their maps until caller maps are composed last. The consumer separately
compiles its own styles, then stages CSS using the installed package's maps and
unaliased stylesheet. The core uses a reserved class prefix to avoid independent
compilation conflicts. Missing CSS definitions and class collisions fail before
staged CSS is replaced.

Chromium and WebKit pass 1055 composed recipe comparisons, blocked-hatch style
parity, responsive radius, hover states, ordered global/instance maps, null
removal of background/radius, custom toggle tint after pointer feedback and
styled SVG leaves. Target identifiers containing quotes, slashes and newlines
match correctly. Unsupported inline StyleX results fail both build composition
and runtime decoration before class mutation. Existing interaction, motion,
disposal and narrow/desktop light/dark regressions pass. See STYLING.md.

This closes the registered-style and custom-shape gap for Skeleton and supplies
a common extension path for other recipe kinds. Dynamic inline-value adapters,
remaining component family capabilities, native adapters and physical-device
acceptance remain outstanding. It is not a claim that the full catalog is done.

## Native Modal verification

Modal now has a compiled consumer and shared-token presentation for all six
sizes, four placements, three backdrops, both scroll modes and rich native
controls. Chromium and WebKit pass command/action opening, validation, focus and
Tab boundaries, dismissal policies, nested return, removal cleanup, scroll
locking, responsive geometry and reduced-motion checks. Both animate entry;
only Chromium retains the native top layer for exit with the tested overlay
transition support. WebKit closes immediately. Per-frame traces include a
transformed clipped ancestor and close/reopen interruption. The family remains
partial for WebKit exit and broader focus/portal/control APIs; see MODAL.md.

## AlertDialog verification

AlertDialog composes the existing medium glass material, native alertdialog
semantics, explicit application confirmation actions, icon tones and automatic
footer layouts. The installed browser consumer covers least-destructive initial
focus, validation without premature dismissal, focus boundaries, outside-click
suppression, removal cleanup, preference fallback and all static variants.
Its frame traces cover interrupted native motion. A paired native-window and
Playwright probe establishes that the current WebKit screenshot omits backdrop
blur; native dark 390 px review shows the expected blur. The earlier transparent
panel diagnosis from that screenshot is unproven. Optical acceptance still needs
a qualified capture matrix; see VISUAL_CAPTURE.md. The family remains partial
for optical/device acceptance and broader open/focus/portal APIs; see ALERT_DIALOG.md.

## Content families verification

Alert and Badge use the existing medium/small glass profiles, with explicit
state for colored parts, accessible message/count semantics and native contrast
fallback. Chip remains an ordinary rich label. CloseButton supports default and
custom content, native disabled behavior and loading activation guards while
retaining focus. The shared material lifecycle now supports these ordinary
surfaces as well as an enclosing native dialog.

The installed consumer checks colors/sizes/variants, four physical Badge corners,
rich label/close composition, Enter/Space/pointer/programmatic activation,
loading/disabled/destructive state, forced-color/contrast fallback, reduced
motion, removal/remount and long-message line bounds. Caller Chip styles work
before and after hatching. Screenshots cover light/dark at 390/820 px; material
optical acceptance still requires a qualified capture (VISUAL_CAPTURE.md).
CloseButton retains broader Button-family integration gates; see CONTENT.md.

## Card and EmptyState verification

Card supports all five source variants, with a medium lens only in glass mode.
Header/title/description/content/footer compose caller-owned content. EmptyState
supports its complete content/message/title/description/action anatomy and both
icon treatments. The consumer performs document creation/import, focuses the new
link and resets to empty content through Exact actions. Registered caller maps
provide wide action buttons and a title weight override.

Checks cover named regions and heading levels, ordinary/glass switching without
replacing existing card/empty-state nodes, lens disposal, contrast/forced colors,
long text, LTR/RTL and light/dark at 390/820 px. Card's glass optical gate remains
open. Description boxes expose the paragraph role; literal native paragraph tags
and Typography/Kbd native HTML support remain upstream gaps retained by owner
choice (SEMANTIC_GAPS.md). The full catalog target is unchanged.
