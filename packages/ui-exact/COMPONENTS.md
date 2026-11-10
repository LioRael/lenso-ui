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

| Lenso family           | Exact Web status      | Remaining acceptance                                                                        |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `accordion`            | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain             |
| `alert-dialog`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `alert`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `autocomplete`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `avatar`               | Pending               | Implementation, runnable example, browser acceptance                                        |
| `avatar-group`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `badge`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `breadcrumbs`          | Pending               | Implementation, runnable example, browser acceptance                                        |
| `button`               | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                  |
| `button-group`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `calendar`             | Pending               | Implementation, runnable example, browser acceptance                                        |
| `calendar-year-picker` | Pending               | Implementation, runnable example, browser acceptance                                        |
| `card`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `checkbox`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `checkbox-group`       | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `chip`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `close-button`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-area`           | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-field`          | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-input-group`    | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-picker`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-slider`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-swatch`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `color-swatch-picker`  | Pending               | Implementation, runnable example, browser acceptance                                        |
| `combo-box`            | Pending               | Implementation, runnable example, browser acceptance                                        |
| `date-field`           | Pending               | Implementation, runnable example, browser acceptance                                        |
| `date-input-group`     | Pending               | Implementation, runnable example, browser acceptance                                        |
| `date-picker`          | Pending               | Implementation, runnable example, browser acceptance                                        |
| `date-range-picker`    | Pending               | Implementation, runnable example, browser acceptance                                        |
| `description`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `disclosure`           | Web behavior verified | Linked-page initial styles and behavior verified; broader delivery gates remain             |
| `drawer`               | Pending               | Implementation, runnable example, browser acceptance                                        |
| `empty-state`          | Pending               | Implementation, runnable example, browser acceptance                                        |
| `field-error`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `fieldset`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `form`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `input`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `input-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `input-otp`            | Pending               | Implementation, runnable example, browser acceptance                                        |
| `kbd`                  | Pending               | Implementation, runnable example, browser acceptance                                        |
| `label`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `link`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `list-box`             | Pending               | Implementation, runnable example, browser acceptance                                        |
| `menu`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `meter`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `modal`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `number-field`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `pagination`           | Pending               | Implementation, runnable example, browser acceptance                                        |
| `popover`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `progress-bar`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `progress-circle`      | Pending               | Implementation, runnable example, browser acceptance                                        |
| `radio`                | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `radio-group`          | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `range-calendar`       | Pending               | Implementation, runnable example, browser acceptance                                        |
| `scroll-shadow`        | Pending               | Implementation, runnable example, browser acceptance                                        |
| `search-field`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `select`               | Pending               | Implementation, runnable example, browser acceptance                                        |
| `separator`            | Pending               | Implementation, runnable example, browser acceptance                                        |
| `skeleton`             | Pending               | Implementation, runnable example, browser acceptance                                        |
| `slider`               | Pending               | Implementation, runnable example, browser acceptance                                        |
| `spinner`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `surface`              | Partial               | Ordinary variants implemented; thick glass background and variant matrix remain             |
| `switch`               | Pending               | Implementation, runnable example, browser acceptance                                        |
| `table`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `tab-bar`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `tabs`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `tag`                  | Pending               | Implementation, runnable example, browser acceptance                                        |
| `tag-group`            | Pending               | Implementation, runnable example, browser acceptance                                        |
| `textarea`             | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `textfield`            | Partial               | Core behavior verified in Chromium/WebKit; complete family API and acceptance matrix remain |
| `time-field`           | Pending               | Implementation, runnable example, browser acceptance                                        |
| `toast`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `toggle-button`        | Pending               | Implementation, runnable example, browser acceptance                                        |
| `glass-toggle-button`  | Pending               | Implementation, runnable example, browser acceptance                                        |
| `toggle-button-group`  | Pending               | Implementation, runnable example, browser acceptance                                        |
| `toolbar`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `navigation-bar`       | Pending               | Implementation, runnable example, browser acceptance                                        |
| `swipe-actions`        | Pending               | Implementation, runnable example, browser acceptance                                        |
| `wheel-picker`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `tooltip`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `typography`           | Pending               | Implementation, runnable example, browser acceptance                                        |
| `glass`                | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                  |
| `glass-container`      | Pending               | Implementation, runnable example, browser acceptance                                        |
| `glass-magnifier`      | Pending               | Implementation, runnable example, browser acceptance                                        |
| `glass-button`         | Partial               | Complete API, motion and variant matrix beyond the initial consumer checks                  |
| `context-menu`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `action-sheet`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `sheet`                | Pending               | Implementation, runnable example, browser acceptance                                        |
| `stepper`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `list`                 | Pending               | Implementation, runnable example, browser acceptance                                        |
| `page-control`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `popup-button`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `sidebar`              | Pending               | Implementation, runnable example, browser acceptance                                        |
| `notification`         | Pending               | Implementation, runnable example, browser acceptance                                        |
| `share-sheet`          | Pending               | Implementation, runnable example, browser acceptance                                        |
| `segmented-control`    | Pending               | Implementation, runnable example, browser acceptance                                        |
| `section-index`        | Pending               | Implementation, runnable example, browser acceptance                                        |
| `refresh-control`      | Pending               | Implementation, runnable example, browser acceptance                                        |
| `command`              | Pending               | Implementation, runnable example, browser acceptance                                        |

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
rendered frames and compares pre-hatch and initialized presentation. All 71
current recipes match their class branches in Chromium and WebKit. See
INITIAL_STYLES.md for the verified scope. Server response integration and native
attributes that require the hatch remain separate delivery boundaries.
