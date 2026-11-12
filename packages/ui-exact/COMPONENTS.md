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

| Lenso family           | Exact Web status      | Remaining acceptance                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`            | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain                                                                                                                                                                                                                                                       |
| `alert-dialog`         | Partial               | Native confirmation/material verified; optical, focus/portal/control and device gates remain open (ALERT_DIALOG.md)                                                                                                                                                                                                                   |
| `alert`                | Partial               | Native status composition/material and browser behavior verified; glass capture/device gates remain (CONTENT.md)                                                                                                                                                                                                                      |
| `autocomplete`         | Partial               | Primitive-backed popup search, grouped single/multiple selection, controlled rejection, chip focus, native forms/reset, lifecycle and browser taps verified; loading/virtualization, broader APIs, initial semantics, motion/optics and native gates remain (AUTOCOMPLETE.md)                                                         |
| `avatar`               | Partial               | Image/fallback and shared variants implemented; delay/callback/render parity remains (AVATAR.md)                                                                                                                                                                                                                                      |
| `avatar-group`         | Partial               | Explicit stack/grid/count composition; inheritance and automatic max/count remain (AVATAR.md)                                                                                                                                                                                                                                         |
| `badge`                | Partial               | Placement, variants, accessible counts and lifecycle verified; glass capture/device gates remain (CONTENT.md)                                                                                                                                                                                                                         |
| `breadcrumbs`          | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                                                                                                                                                                             |
| `button`               | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                                                                                                                                                                            |
| `button-group`         | Partial               | Ordinary/Glass actions, joined geometry, loading and native keyboard behavior implemented; inheritance, native contracts and optical/touch gates remain (BUTTON_GROUP.md)                                                                                                                                                             |
| `calendar`             | Partial               | Primitive-derived native day buttons, single/multiple/none selection, localized month grid, bounds, keyboard, RTL and lifecycle verified in Chromium/WebKit; year/range/gestures/multi-month/API/native gates remain (CALENDAR.md)                                                                                                    |
| `calendar-year-picker` | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `card`                 | Partial               | All variants, composition, actions and cleanup verified; glass optical/device gates remain (LAYOUT.md)                                                                                                                                                                                                                                |
| `checkbox`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `checkbox-group`       | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `chip`                 | Web behavior verified | Ordinary composition, variants, caller styles and browser behavior verified; broader delivery gates remain (CONTENT.md)                                                                                                                                                                                                               |
| `close-button`         | Partial               | Native/loading behavior and rich content verified; shared Button-family integration remains (CONTENT.md)                                                                                                                                                                                                                              |
| `color-area`           | Partial               | Primitive-backed two-axis editing implemented; broader axes/API, source geometry/motion and device gates remain (COLOR_AREA.md)                                                                                                                                                                                                       |
| `color-field`          | Partial               | Hex and RGB/HSL/HSB channel model, drafts/commits, localized percent values, keyboard, rejection, readonly/disabled guards, form/reset and cleanup verified; initial formatting, validation/context and native gates remain (COLOR_FIELD.md)                                                                                          |
| `color-input-group`    | Partial               | Primitive-derived editable node, ordinary primary/secondary surfaces, prefix/suffix, redraw formatting and selection retention verified; caller-style/native forwarding and device gates remain (COLOR_FIELD.md)                                                                                                                      |
| `color-picker`         | Partial               | Primitive-backed Glass popover and shared color-control composition verified; automatic context, open-state/API, optical/motion and device gates remain (COLOR_PICKER.md)                                                                                                                                                             |
| `color-slider`         | Partial               | Primitive range and shared Slider behavior, gradients, hue endpoint, keyboard/pointer/RTL/vertical, controlled commits, form/reset, browser taps and disposal verified; broader channels, optical/touch/device and API gates remain (COLOR_SLIDER.md)                                                                                 |
| `color-swatch`         | Partial               | Named color/alpha samples, shared sizes/shapes and initial rendering verified; rich content, caller-style and native adapter gates remain (COLOR.md)                                                                                                                                                                                  |
| `color-swatch-picker`  | Partial               | Primitive-derived native radios, equivalent color values, alpha identity, keyboard/RTL, disabled, layouts, browser taps and cleanup verified; context/rich items, form/reset and native gates remain (COLOR.md)                                                                                                                       |
| `combo-box`            | Partial               | Primitive-backed editable selection, grouped filtering, chips and native form/touch behavior verified; custom/virtualized/inline/modal APIs, broad events/styles and native/device gates remain (COMBO_BOX.md)                                                                                                                        |
| `date-field`           | Partial               | Primitive input segments, source partial-date model, ISO/calendar/locale, controlled editing, native scalar forms, validity and cleanup verified in Chromium/WebKit; initial/source API/time/range/native gates remain (DATE_FIELD.md)                                                                                                |
| `date-input-group`     | Partial               | Primitive input segments, source partial-date model, ISO/calendar/locale, controlled editing, native scalar forms, validity and cleanup verified in Chromium/WebKit; initial/source API/time/range/native gates remain (DATE_FIELD.md)                                                                                                |
| `date-picker`          | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `date-range-picker`    | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `description`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `disclosure`           | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain                                                                                                                                                                                                                                                       |
| `drawer`               | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `empty-state`          | Web behavior verified | Composition, actions, names, themes and RTL verified; native paragraph-tag gap retained (LAYOUT.md, SEMANTIC_GAPS.md)                                                                                                                                                                                                                 |
| `field-error`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `fieldset`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `form`                 | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `input`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `input-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `input-otp`            | Partial               | Primitive-backed real input slots, controlled code/paste/autofill, keyboard/RTL, completion/auto-submit, forms/reset, Glass editing and lifecycle verified; broader APIs, initial Unicode semantics, optical/device and physical IME gates remain (INPUT_OTP.md)                                                                      |
| `kbd`                  | Pending               | Native kbd/abbr declaration path absent in pinned upstream; retained gap per owner choice (SEMANTIC_GAPS.md)                                                                                                                                                                                                                          |
| `label`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `link`                 | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                                                                                                                                                                             |
| `list-box`             | Partial               | Controlled selection, keyboard/ranges, grouped items and dynamic cleanup verified; virtualization, drag/drop, broad APIs, initial semantics and native/device gates remain (LIST_BOX.md)                                                                                                                                              |
| `menu`                 | Partial               | Anchored actions, checked items, submenus, compact edit bars and modal pointer/scroll ownership implemented; morph, extended/native and optical gates remain (MENU.md)                                                                                                                                                                |
| `meter`                | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                                                                                                                                                                           |
| `modal`                | Partial               | Native Web composition verified; WebKit exit motion and focus/portal/control parity remain open (MODAL.md)                                                                                                                                                                                                                            |
| `number-field`         | Partial               | Nullable model, locale drafts, keyboard/buttons/hold, scrub area/cursor and native form fixture verified; extended APIs and optical/native gates remain (NUMBER_FIELD.md, NUMBER_SCRUB.md)                                                                                                                                            |
| `pagination`           | Partial               | Native links, all source sizes, rich parts, responsive/RTL and browser behavior verified; pre-hatch disabled role, structural HTML and native forwarding gates remain (PAGINATION.md)                                                                                                                                                 |
| `popover`              | Partial               | Native non-modal interactions, anchored thick material, positioning and lifecycle verified; extended/modal/portal/native and optical gates remain (POPOVER.md)                                                                                                                                                                        |
| `progress-bar`         | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                                                                                                                                                                           |
| `progress-circle`      | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                                                                                                                                                                           |
| `radio`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `radio-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `range-calendar`       | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `scroll-shadow`        | Partial               | Native timelines, observed edges and cold/warm keyboard verified; dynamic first-frame geometry and native/optical/touch gates remain (SCROLL_SHADOW.md)                                                                                                                                                                               |
| `search-field`         | Partial               | Native editing/clear, shared Glass, initial styles and browser behavior verified; native/form/optical gates remain (SEARCH_FIELD.md)                                                                                                                                                                                                  |
| `select`               | Partial               | Single/multiple selection, keyboard/typeahead, native form values/reset/validation, positioning and lifecycle verified; extended API, motion and device gates remain (SELECT.md)                                                                                                                                                      |
| `separator`            | Web behavior verified | Composition, initial styles and browser behavior verified; pre-hatch disabled-link role and broader delivery gates remain                                                                                                                                                                                                             |
| `skeleton`             | Web behavior verified | Shared motion, nesting and registered caller styles verified; broader delivery gates remain                                                                                                                                                                                                                                           |
| `slider`               | Partial               | Single/range state, geometry and interaction implemented; swap, extended API, motion/optical/touch gates remain (SLIDER.md)                                                                                                                                                                                                           |
| `spinner`              | Web behavior verified | Shared presentation, semantics and browser behavior verified; broader delivery gates remain                                                                                                                                                                                                                                           |
| `surface`              | Partial               | Ordinary variants implemented; thick glass background and variant matrix remain                                                                                                                                                                                                                                                       |
| `switch`               | Partial               | State, forms, keyboard and source motion implemented; optical, touch and extended API gates remain (SWITCH.md)                                                                                                                                                                                                                        |
| `table`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `tab-bar`              | Partial               | Primitive-backed destinations and native actions, phone/tablet groups, source-derived indicator/drag/minimize springs, scroll minimization, keyboard focus, rejection and lifecycle verified; native taps both engines, Chromium continuous touch; initial, broader API, reference motion/optics and device gates remain (TAB_BAR.md) |
| `tabs`                 | Partial               | Selection, panels, keyboard and source motion implemented; overflow, extended API and optical/touch gates remain (TABS.md)                                                                                                                                                                                                            |
| `tag`                  | Partial               | Shared sizes/variants, grid semantics and controlled removal verified; standalone/context, broad APIs, optical/motion and native/device gates remain (TAGS.md)                                                                                                                                                                        |
| `tag-group`            | Partial               | Shared selection/ranges, accepted/rejected/deferred removal and focus recovery verified; broad collection/context/API and native/device gates remain (TAGS.md)                                                                                                                                                                        |
| `textarea`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `textfield`            | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain                                                                                                                                                                                                                                           |
| `time-field`           | Partial               | Shared primitive segments/draft owner, local ISO time, day periods/hour cycles/seconds, native editing, scalar form validity and cleanup verified in Chromium/WebKit; full source/zoned/bidi/initial/native gates remain (TIME_FIELD.md)                                                                                              |
| `toast`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `toggle-button`        | Partial               | Registered style/tint composition verified; dynamic inline values and Toolbar composition remain                                                                                                                                                                                                                                      |
| `glass-toggle-button`  | Partial               | Primitive Toggle, standalone/icon/group composition, controlled rejection, disabled optics cleanup, sizes/variants/tint, initial styles and browser taps verified; broad APIs, optics/motion and native/device gates remain (GLASS_TOGGLE_BUTTON.md)                                                                                  |
| `toggle-button-group`  | Partial               | Registered style/tint composition verified; dynamic inline values and Toolbar composition remain                                                                                                                                                                                                                                      |
| `toolbar`              | Partial               | Native focus, shared surfaces and detachable fusion verified; sticky edge/Menu/native and optical gates remain (TOOLBAR.md)                                                                                                                                                                                                           |
| `navigation-bar`       | Partial               | Shared Toolbar root/actions, sticky large-title collapse, scroll targets, uniform/soft edges, keyboard/RTL, initial styles, browser taps and cleanup verified; broad APIs, caller styles, material/motion and native/device gates remain (NAVIGATION_BAR.md)                                                                          |
| `swipe-actions`        | Partial               | Controlled reveal, keyboard/pointer actions, focus return, RTL, Reduced Motion and cleanup verified; browser taps and Chromium native touch verified; WebKit drag, nested/List composition and device gates remain (SWIPE_ACTIONS.md)                                                                                                 |
| `wheel-picker`         | Partial               | Shared ListBox selection/focus, native wheel settlement, cylindrical projection, rejection, dynamic options, rem scaling, external form values, browser taps and cleanup verified; initial, broader APIs/motion and native/device gates remain (WHEEL_PICKER.md)                                                                      |
| `tooltip`              | Partial               | Native descriptions, timing, grouped triggers and thick material implemented; extended/native and optical gates remain (TOOLTIP.md)                                                                                                                                                                                                   |
| `typography`           | Pending               | Native paragraph/code and full Prose/polymorphic semantics remain open on unchanged upstream (SEMANTIC_GAPS.md)                                                                                                                                                                                                                       |
| `glass`                | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                                                                                                                                                                            |
| `glass-container`      | Partial               | Shared fusion engine, member lifecycle, worker/GPU and CPU fallback verified; broader membership, native forwarding and optical/device gates remain (GLASS_CONTAINER.md)                                                                                                                                                              |
| `glass-magnifier`      | Partial               | Shared Glass renderer/motion, mouse bounds, independent flags, child controls, reduced motion, elastic composition, priorities/cleanup and Chromium touch drag verified; WebKit background magnification, full API/style/motion and native/device gates remain (GLASS_MAGNIFIER.md)                                                   |
| `glass-button`         | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                                                                                                                                                                                                                                                            |
| `context-menu`         | Partial               | Point popup, compact bar/expansion, inert preview/layout and Chromium return motion implemented; WebKit immediate-close fallback, full API/motion and native/device gates remain (CONTEXT_MENU.md)                                                                                                                                    |
| `action-sheet`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `sheet`                | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `stepper`              | Partial               | Shared numeric model, 92 x 32 geometry, keyboard/touch/hold and lifecycle verified; extended/native forwarding gates remain (NUMBER_FIELD.md)                                                                                                                                                                                         |
| `list`                 | Partial               | Grouped/plain composition, sections, actions and controlled editing selection implemented; keyboard reorder requests verified; pointer reorder/edge scrolling implemented; swipe actions and device gates remain (LIST.md)                                                                                                            |
| `page-control`         | Partial               | Controlled page window, keyboard/focus and shared track implemented; extended native contracts and optical/touch gates remain (PAGE_CONTROL.md)                                                                                                                                                                                       |
| `popup-button`         | Partial               | Shared ordinary button/indicator, primitive-backed Menu trigger and Select trigger composition verified, including initial styles, keyboard, controlled rejection, lifecycle and browser taps; generic native/ref/render APIs, submit/reset consumer flows and broader native gates remain (POPUP_BUTTON.md)                          |
| `sidebar`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `notification`         | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `share-sheet`          | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |
| `segmented-control`    | Partial               | Radio value model, forms, keyboard and shared selection motion implemented; extended contracts and optical/touch gates remain (SEGMENTED_CONTROL.md)                                                                                                                                                                                  |
| `section-index`        | Partial               | Primitive-derived fragment links, controlled location, roving keyboard, mouse scrubbing/cancel, scoped scrolling, opaque keys, disabled/RTL and lifecycle verified; both engines pass taps, Chromium continuous touch; broader APIs, initial local navigation, source/device gates remain (SECTION_INDEX.md)                          |
| `refresh-control`      | Partial               | Controlled operation, touch pull/trigger, status/error, timing, cleanup and initial feedback verified; broad native/ref/style, WebKit continuous touch and native/device gates remain (REFRESH_CONTROL.md)                                                                                                                            |
| `command`              | Pending               | Implementation, runnable example, browser acceptance                                                                                                                                                                                                                                                                                  |

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

The NumberField drag-adjustment checkpoint builds 4315 core recipes and 5831 consumer recipes.
Its focused cohort covers 21 affected presentation recipes, drag directions, sensitivity,
step modifiers, cancellation, release commits, touch fixtures and numeric regressions.
Chromium uses a real headed browser for native body pointer lock and top-layer cursor
geometry; WebKit follows the source policy of skipping pointer lock. See NUMBER_SCRUB.md
for fixture and device boundaries.
The preceding NumberField/Stepper checkpoint built 4313 core recipes and 5828 consumer recipes.
Its focused cohort covers 18 native-tag presentation recipes including a caller
style, nullable values, locale/IME drafts and caret, limits and stepping, holding,
form fixtures, preferences, source geometry and cleanup in Chromium/WebKit.
The preceding compact Menu bar checkpoint built 4296 core recipes and 5810 consumer recipes.
Its focused cohort covers 71 affected recipes, ordinary button actions, disabled
inheritance, shared material, source geometry, elastic press, expanded anchoring
and pointer cutouts, RTL and removal. See MENU_BAR.md for API gaps and acceptance.
The preceding modal Menu checkpoint built 4291 core recipes and 5805 consumer recipes.
Its focused cohort covers pointer isolation, a moving trigger cutout, Tab exit,
input-dependent scrolling, hot modality changes, removal and shared Dialog locks.
See MENU_MODAL.md for proof boundaries. The preceding submenu checkpoint built
4290 core recipes and 5804 consumer recipes.
Its focused Chromium/WebKit cohort checks 65 affected recipes and 12
presentation/direction/width combinations, three levels, tree dismissal and
parent/focus ownership. The preceding Menu checkpoint built 4285 core recipes
and 5799 consumer recipes.
Its focused Chromium/WebKit cohort checks 60 affected recipes, 36 placement
endpoints, native keyboard/actions, checked values, opaque fallback and cleanup.
Touch activation is checked in emulated mobile contexts. The preceding Tooltip
checkpoint built 4225 core recipes and 5739 consumer recipes.
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

## SwipeActions verification

SwipeActions now has a compiled public consumer and focused Chromium/WebKit
acceptance driver. Both engines pass keyboard action activation and focus return,
mouse reveal, vertical-axis rejection, opt-in full swipe, disabled editing, RTL,
Reduced Motion and removal/remount. Eight captures cover light/dark at 390/820 px.
Native browser taps execute both action sides. Chromium native CDP touch input
also verifies horizontal reveal without accidental execution and vertical page
scrolling. WebKit touch drag and physical iOS behavior remain unverified.

The action-focus regression initially timed out on the previous compiled runtime.
The Web adapter now returns focus after a focused action closes its controlled
surface, without retaining a second open-state owner. Static checks and the
31-test package suite pass. Page and console errors are empty in the focused
browser run. See SWIPE_ACTIONS.md for API and remaining family gates. This is
selected family behavior evidence, not complete catalog or device acceptance.

## Color Swatch and SwatchPicker verification

The public compiled consumer uses native color fill over the shared checkerboard
and primitive-derived radios. Chromium/WebKit agree before and after blocked
initialization on initial selection, disabled state, names, dimensions, color and
checkerboard delivery. Both pass directional/Home/End keyboard selection, RTL,
skipped disabled options, external RGB equivalence, alpha distinction, all sizes,
shapes and layouts, palette selection indicator, Reduced Motion, removal/remount
and native browser taps. Eight screenshots cover light/dark at 390/820 px.

The focused package tests pass 34 cases with 115 assertions and typechecking
covers 89 files. The shared pure color model bundle contains 44 dependency modules
and no React or React DOM runtime. This does not establish runtime performance,
physical-device or complete color-family acceptance. See COLOR.md for the API,
pre-initialization value requirement and remaining capabilities.

## ColorField and ColorInputGroup verification

The public compiled consumer binds whole-color, RGB/HSL channel and opacity
fields to one application color. Chromium/WebKit pass valid drafts versus
commits, invalid reversal, native required state, channel clamping and keyboard
boundaries, localized percentages, preserved HSL space/alpha, disabled/read-only
suppression, parent rejection, focused configuration changes and removal/remount.
Native browser tap focus and subsequent editing pass. Composition-event fixtures
are synthetic; they do not qualify a physical IME or software keyboard.

A native DOM form authored before initialization verifies formatted hex plus
numeric channel/fractional opacity output, reset and disabled-field exclusion.
An earlier WebKit read-only Enter callback is covered by a Contract guard. Image
review also exposed raw color strings after theme/surface redraw; the adapter now
reprojects formatted values on Exact node updates. Each theme/width capture checks
those values explicitly, and both formatted and dirty text selections survive
redraw. Eight captures cover light/dark at 390/820 px.

The focused package tests pass 41 cases with 136 assertions; typechecking covers
93 files. Affected formatting/lint and an isolated stock Exact consumer build
pass. Native Input is deliberately read-only before initialization; full initial
formatting/editing and broader validation/context/ref/render APIs remain open.
The full catalog goal is unchanged. See COLOR_FIELD.md for API and boundaries.

## ColorSlider verification

The compiled consumer couples hue, opacity and RGB red sliders to one color.
Chromium/WebKit pass keyboard focus continuity, the inclusive 360-degree hue
endpoint, directional/Home/End input, pointer commits, RTL and vertical thumb
geometry, disabled/read-only blocking, parent rejection, locale/output redraw,
active-gesture removal and remount. Native form fixtures verify numeric channel
values, reset and disabled exclusion. Both engines pass native browser taps;
Chromium additionally passes a vertical native touch drag. Eight captures cover
light/dark at 390/820 px. Page/console errors are empty.

The native range derives from primitive source with anatomy/event drift guards;
interaction and spring deformation reuse the existing Slider adapters. Ordinary
color thumbs have no Glass refraction. The hue string protocol preserves 360 as
a coordinate even though its color is equivalent to zero. See COLOR_SLIDER.md
for remaining channel, initial rendering, style/API, motion and device gates.
ColorArea is tracked below; ColorPicker is tracked below and the catalog goal is unchanged.

## ColorArea verification

ColorArea now composes two primitive-derived native ranges, shared ColorArea/Slider
recipes and the pure color gradient model. Its controlled adapter proposes one
color for both axes while retaining the third channel and alpha. Pointer cancel
restores the starting value; active removal retains the last live application
value without committing. The thumb reuses spring deformation without Glass
refraction.

Chromium/WebKit pass dual-axis keyboard focus, atomic pointer updates, cancelled
capture rollback, RTL, RGB/HSL/HSB switching, dots, controlled rejection,
disabled/read-only state, theme redraw, active removal and remount. Explicit
native tabindex fixes the observed WebKit secondary-axis Tab omission. Native
form fixtures verify coordinate output, reset and disabled exclusion. Both pass
native touch taps; Chromium passes a continuous native two-axis touch sequence.
Eight screenshots cover light/dark at 390/820 px; page/console errors are empty.

The package suite passes 53 tests with 171 assertions and typechecking covers 102
files. Affected lint/format checks and an isolated stock Exact consumer build
pass. Source geometry/per-frame motion, broader axis/API/style coverage, initial
rendering, WebKit continuous touch, physical devices and native adapters remain
open. See COLOR_AREA.md; ColorPicker is tracked below; the broader catalog remains unfinished.

## ColorPicker verification

ColorPicker composes a canonical primitive-derived invoker and existing Popover
positioner with the shared Glass control/popup geometry. One application color
feeds Area, hue/opacity sliders, hexadecimal field, palette and trigger swatch.
The popup uses a medium live-backdrop lens that releases on close/removal and
falls back to opaque material for contrast preferences.

The isolated stock consumer passes Chromium/WebKit shared-color updates, external
replacement, controlled rejection, read-only/disabled edits, RTL, Escape/Done
focus return, outside dismissal, open removal/remount and forced colors. Native
mobile-browser taps open, edit both area axes and close. Eight captures cover
light/dark at 390/820px, with scrollable content bounded by available height.
Page/console errors are empty. The package suite passes 54 tests/176 assertions;
typechecking covers 103 files and affected formatting/lint pass.

The initial Exact API explicitly derives child states; automatic inherited context,
controlled opening, modal/portal and arbitrary native/render/ref/event APIs are
still open. Qualified Glass optics, reference motion/geometry, continuous touch,
physical devices and native adapters remain unverified. See COLOR_PICKER.md.
This is candidate behavior/rendering evidence, not full catalog acceptance.

## ListBox verification

ListBox adds the ordinary shared item/indicator/section recipes and an explicit
controlled string-key collection API. The application owns selection; transient
focus, typeahead and range anchors belong to the Web adapter. Selection proposals
cross the scalar event bridge as a positional mask over a domain containing both
collection keys and retained selected keys. Empty/comma/Unicode identities are
preserved. The current primitive package has no ListBox; this is a Lenso extension.

The isolated stock consumer passes Chromium/WebKit single/multiple/none modes,
range extension/contraction, select-all/clear, disabled skipping and availability
changes, typeahead, RTL/wrapping, selection following focus, parent rejection,
external updates, retained unmounted selection, grouped ordinals, focused removal,
actions and removal/remount. Native mobile-browser taps verify multiple selection.
Eight captures cover light/dark at 390/820px. Page/console errors are empty.
The suite passes 56 tests/183 assertions, typechecking covers 107 files, and affected
lint/format plus the isolated consumer build pass.

The pinned compiler omits multiselectable/readonly/ordinal ARIA declarations;
the Web adapter supplies them after initialization. Full initial semantics,
virtualization, drag/drop and cross-collection operations, non-string/object keys,
broader render/ref/event APIs, caller styles, indicator reference motion and
native/device adapters remain open. See LIST_BOX.md. TagGroup and ComboBox are tracked below; the catalog is not complete.

## Tag and TagGroup verification

TagGroup reuses the ListBox scalar selection bridge, pure range helper and scoped
focus/keyboard controller. Tag adds grid cells, small Glass material and all
shared sizes/variants. The application owns item removal. Only a disconnected
requested row triggers deselection and next/previous/group focus; rejected and
deferred removal keep the row until the owner commits. No headless Tag primitive
exists, and both primitive packages plus the pinned SDK remain unchanged.

Chromium/WebKit pass selection modes and ranges, Delete/Backspace and single
button requests, accepted/rejected/deferred removal, post-commit deselection,
next/previous/empty focus, disabled/read-only/removable state, RTL, all six
size/variant combinations, forced-color fallback and removal/remount. Native
mobile-browser taps select and remove. Eight Tag theme/width captures and eight
ListBox regression captures are retained. The complete focused ListBox behavior
also passes against the shared-controller change. Page/console errors are empty.

The package suite passes 56 tests/183 assertions; typechecking covers 108 files.
Affected formatting/lint and an isolated stock Exact consumer build pass. Receipt:
`.cache/acceptance/tags-readable/acceptance.json`. Standalone/default/uncontrolled and
automatic context APIs, non-string keys, full custom-cell/render/ref/event/caller
styles, qualified Glass optics/reference motion, initial semantics and native/
physical-device behavior remain open. See TAGS.md; the full catalog remains active.

The initial Tag capture exposed low contrast for selected hovered labels: the
shared recipe pairs a strong tinted hover fill with tinted text. The Exact-only
presentation now retains the fill and uses native contrast-color for its label
and icon. Both checked browsers support that CSS function. The final cohort
records selected-hover computed text contrast of 4.76:1 in light mode and 7.39:1
in dark mode at both widths, with matching interaction/ListBox regression passes.
An unsupported-function CSS fallback uses primary text over a subtle fill; that
fallback is authored but has not been exercised in a browser lacking the function.
The original React component/shared tokens are unchanged. The initial receipt is
superseded for this visual issue, without invalidating its behavior observations.

## ComboBox verification

ComboBox derives its actual editable Input, native popover positioner/invoker and
option buttons from canonical primitives with explicit compatibility projections.
The option role replaces menuitem and unconditional hiding is removed for multiple
selection. Raw Input submit handling is delegated to native forms when the popup
is closed. The input group and popup retain shared ComboBox recipes; a small field
lens is used only where the source uses it. Pure filtering adapts Base UI's
installed collator helper and retains its MIT notice without React hooks.

One application owns the selected string array and input text. Query edits propose
text; selection callbacks propose values and display text together. The Web adapter
holds bounded input intent until acknowledgement/reconciliation, keeps virtual
focus in the input and manages filtering/positioning. Capture-phase option intent
handling accommodates Exact's native press event propagation. Mouse-only focus
prevention preserves WebKit touch clicks. Native bare-button geometry is projected
to border-box/start alignment so options and selection icons remain in the list.

Chromium/WebKit pass grouped contains/prefix/none filtering, accent matching,
disabled skipping, virtual focus, caret Home/End, single/multiple and unusual keys,
query/selection rejection, empty/status output, chip keyboard/pointer removal,
composition/redraw fixtures, external updates, dynamic options, read-only/disabled
state, RTL and disposal/remount. Native DOM form fixtures verify selected values,
empty-key required validity, invalid focus, closed Enter submission versus open
option commitment, reset/cancelled reset, external association and disabled
exclusion. Both engines also pass native mobile-browser focus/option taps.

Sixteen primary/secondary, light/dark and 390/820px captures include option bounds
and text alignment checks. Page/console errors are empty. The package suite passes
59 tests/199 assertions; typechecking covers 112 files. Affected formatting/lint
and an isolated stock Exact consumer build pass. Receipt:
`.cache/acceptance/combo-boxes-layout/acceptance.json`.

The family remains Partial for custom values, object models, async/virtualized
collections, inline/modal/portal/arrow/backdrop features, broad callback/ref/render/
native attributes and caller-style coverage, initial semantics, reference motion/
optics and native/device adapters. Composition tests are synthetic; mobile-browser
taps do not qualify a physical IME/keyboard or continuous touch. See COMBO_BOX.md.
The full catalog objective is unchanged.
