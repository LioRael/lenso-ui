# Menu and toast source-story evidence

Lenso 0.9 projects upstream Dropdown to canonical Menu. The upstream filenames,
source export names and hashes below remain provenance records; local stories
and native parts use Menu. Earlier browser results describe the pre-rename
candidate and are not fresh 0.9 validation.

## Boundary and result

This batch authors exactly **27 named source cases**, dropdown 16 and toast 11.
All 27 have live native implementations. The production browser proof opened
every dropdown and enqueued a toast in every toast case in both themes:
**54 active iframe mounts**, not 54 empty story shells.

Changed files are only `stories/menu.stories.tsx`,
`stories/toast.stories.tsx`, the uniquely owned `stories/menu-toast*` fixtures,
and this document. Shared UI, styles, primitives, configuration, inventory,
coverage, dependencies and release files are outside this batch. Parent
integration owns inventory changes. Nothing was published or landed.

These are native adaptations, not a claim of complete upstream visual or
interaction parity. The native toast focus hotkey difference is recorded below.

## Immutable authority

HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
Both complete raw files were read, including all render templates:

| Family   | Complete raw source                                                                                                                                                              | Lines | SHA-256                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: | ------------------------------------------------------------------ |
| Dropdown | [dropdown.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/dropdown/dropdown.stories.tsx) |   905 | `15424e5b7383decf00dcc9f2bb6d4543593866c8a1bc4de5b56454e48cc4ec4c` |
| Toast    | [toast.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/toast/toast.stories.tsx)          |   757 | `29acf55a1cbcb7114fff53ff4d649ffc0bbf769e4bc4a6a92a5ec65b9218be6b` |

Additional pinned implementation references clarify toast defaults and semantics:

- `packages/react/src/components/toast/constants.ts`: default width **460px**,
  default timeout **4000ms**, visual cap 3; older toasts fade but keep running.
- `toast-queue.ts`, SHA-256
  `2eaf44ce136f2fe09ff3f14dcc36b679988c69b046fada3f3a1877e514d62cb6`:
  visual-only limits, newest-first ordering, in-place promise/loading updates.
- `toast.tsx`, SHA-256
  `f0d9a334d48f7eb17fe6eb103d61847eae8325dcab6d61ee0582d3b2b9090dc1`:
  indicator/content/action anatomy, mobile action inside content, custom render
  path, permanent expansion without timer suspension.
- `packages/styles/components/toast.css`: spacing, placement, responsive action
  layout and surface geometry.

The scoped StyleX viewport sets `--toast-width: 460px`; scoped providers default
to 4000ms. This does not change shared native defaults. Source placement radio
labels remain `top start`, `top`, `top end`, `bottom start`, `bottom`,
`bottom end`; only the native viewport boundary normalizes spaces to hyphens.

## Exact named cases

The durable proof asserts both authored and pinned source export names/order.
The built Storybook index independently contains exactly these 27 story entries.

| Family   | Exact exports, in upstream order                                                                                                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dropdown | `Default`, `WithSingleSelection`, `SingleWithCustomIndicator`, `WithMultipleSelection`, `WithSectionLevelSelection`, `WithKeyboardShortcuts`, `WithIcons`, `LongPressTrigger`, `WithDescriptions`, `WithSections`, `WithDisabledItems`, `WithSubmenus`, `WithCustomSubmenuIndicator`, `Controlled`, `ControlledOpenState`, `CustomTrigger` |
| Toast    | `Default`, `Placements`, `Expanded`, `SimpleToast`, `PromiseToast`, `CustomIndicator`, `LoadingState`, `WithCallbacks`, `CustomToast`, `CustomQueue`, `ToastInModal`                                                                                                                                                                       |

No advanced case aliases `Default`. The source texts, item order, SVG indicators,
shortcut labels, avatar, promise results, callback history, queue limits and
modal content are retained.

## Native implementation decisions

- Menu uses native `Menu.Trigger`, `Portal`, `Positioner`, `Popup`,
  `Section`, checkbox/radio items, indicators, radio groups and submenu roots.
  Source `textValue` becomes the native typeahead `label`, not a collection
  compatibility layer. The source single and multi-selection examples are
  respectively native radio and checkbox menu items.
- The long-press case has one bounded local 500ms pointer hold, with an 8px
  movement cancellation threshold, controlling the native root. Native mouse
  opening is cancelled via `preventBaseUIHandler` and root change cancellation;
  keyboard activation remains native. Pointer up/cancel, lost capture,
  movement, disabled state and unmount clear the pending hold. A native disabled
  argument is exposed for the gesture proof. No shared gesture API was added.
- Toast uses native `Toast.Provider`, `createToastManager`, `useToastManager`,
  `add`, `close`, `update` and `promise`. There is no copied `ToastQueue`, global
  source `toast` facade, source timer implementation or React Aria toast runtime.
  Placement and custom queue managers have stable per-mount identity.
- `Expanded` uses the existing public **`Toast.Viewport alwaysExpanded`**.
  It does not fabricate an `expanded` prop or force the native hover/focus state.
  Three timed additions retain natural-height, nonoverlapping stack geometry
  even after moving the pointer away. Normal auto-dismiss timers still run.
- The custom queue caps 2/3/1 use native provider `limit` and native
  `data-limited` semantics. This matches the pinned source's visual-only,
  newest-first cap. It is not a FIFO backlog.
- Toast action rendering composes native `Toast.Action` with `Button`.
  Responsive visibility and source action tones are composed on that render
  child, with a mobile action inside content and desktop action beside it.
  Only the visible action is exposed to accessibility queries.
- Geometry is compiled StyleX, including popup widths, responsive actions,
  custom toast layout, callback history, modal width and icon sizes. There are
  no Tailwind runtime classes or React Aria ordinary controls in these stories.
  Callback history retains the source 200ms fade/8px slide and 50ms stagger,
  with reduced-motion suppression and a 24px clear action.

## Why scoped browser proof was needed

Existing navigation, choice and action proof scripts do not open these source
menus or enqueue these source toast cases. Export counts, a successful build
or a static source snippet cannot prove:

1. Native check/radio selection or section selection wiring.
2. Nested submenu keyboard entry/return, disabled action blocking, or root
   focus restoration.
3. A real long hold distinct from a short click, including cancellation.
4. Promise/loading settlement, source action dismissal, independent visual caps,
   persistent callbacks or permanent expansion without timer suspension.

`stories/menu-toast-proof.mjs` tests those behaviors, native semantics and
measured geometry. It does not assert generated class names.

## Verification performed

Final source package snapshot was built from fresh source with **Node 24.18.0**
and **pnpm 11.5.0**, using only scratch-owned directories and read-only dependency
links to the parent checkout:

| Check                                                                                         | Result                     |
| --------------------------------------------------------------------------------------------- | -------------------------- |
| Fresh tokens package build, declarations and CSS copy                                         | PASS                       |
| Fresh UI package build and declarations                                                       | PASS                       |
| Full existing Storybook TypeScript project, `--noEmit --strict`                               | PASS                       |
| Production Storybook build                                                                    | PASS                       |
| Exact pinned 16/11 names and source SHA-256 checks                                            | PASS                       |
| Actual light/dark production iframe mounts                                                    | PASS, 54                   |
| Every dropdown opened / every toast case enqueued                                             | PASS                       |
| Native ArrowDown/Enter/Escape and root focus return                                           | PASS, both themes          |
| Disabled menu item blocks pointer and keyboard activation                                     | PASS, both themes          |
| Native single radio, controlled checkbox and independent section selection                    | PASS, both themes          |
| Two-level submenu ArrowRight/ArrowLeft and parent focus return                                | PASS, both themes          |
| Real hold vs short click, movement/pointercancel cancellation, disabled hold and native Enter | PASS                       |
| All five default toast variants and their action dismissals                                   | PASS, both themes          |
| Promise loading to success and promise loading to error                                       | PASS, both themes          |
| Manual loading to successful in-place update                                                  | PASS, both themes          |
| Permanently expanded three-toast geometry, no hover/focus required                            | PASS, both themes          |
| `alwaysExpanded` does not suspend 4000ms native auto-dismiss timers                           | PASS                       |
| Independent native 2/3/1 visual caps, five older limited entries noninteractive               | PASS, both themes          |
| Six simultaneous source placements                                                            | PASS, both themes          |
| Toast above native modal and close interaction                                                | PASS, both themes          |
| Persistent timeout 0, manual close history, 3s timeout callback and clear                     | PASS                       |
| Native F6 focus entry / Shift+Tab return                                                      | PASS                       |
| Source desktop toast width 460px on every toast mount                                         | PASS                       |
| 390px toast bounds and reduced-motion transition disabled                                     | PASS                       |
| Uncaught browser errors                                                                       | PASS, zero                 |
| Scoped oxlint                                                                                 | PASS, zero warnings/errors |
| Scoped oxfmt                                                                                  | PASS                       |
| Scoped React Doctor changed-file scratch snapshot                                             | PASS, 100/100, no issues   |

Builds report existing bundler `"use client"` preservation and plugin timing
warnings; they do not fail. React Doctor's initial source-style callback-history
index-key warning was addressed with stable per-history-entry UUIDs without
changing visible source content.

The proof writes 54 local active-state screenshots plus
`menu-toast-proof.json` containing each mount's measured geometry, assertion
results, pinned source hashes and per-icon/asset hashes. Those generated
artifacts are scratch-only; the recipe below regenerates them.

## Genuine assets and licenses

`stories/menu-toast-icons.fixtures.tsx` contains the exact original SVG path
bytes for these 14 Gravity UI icons:
`square-plus`, `folder-open`, `floppy-disk`, `trash-bin`, `ellipsis-vertical`,
`pencil`, `bars`, `arrow-right`, `gear`, `persons`, `arrow-right-from-square`,
`hard-drive`, `star`, `bell`.
The proof can re-fetch Iconify's Gravity UI collection and compare every path.
The fetched raw JSON used during authoring had SHA-256
`da7cf2437d5d5622d11878abf92d9b6dc774b39b64a158eb2ebdfac06de00c0c`.
The collection endpoint is not an immutable Git source; per-path hashes are
also recorded in each proof result.

Gravity UI copyright and MIT terms are preserved verbatim in
`stories/menu-toast-icons-LICENSE.txt`. HeroUI-derived story/geometry files
identify the pinned Apache-2.0 source; the existing repository and third-party
Apache notices remain in place.

The actual source avatar is
`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg`,
SHA-256
`8b15ec8c71b3a381b6c8117f340742e4f429ab0b65af5c3b220d01a700f0e08d`.
The browser proof bridges this URL with original curl-fetched JPEG bytes only
to handle local Chromium transport limitations, never replacement artwork.
Both source avatar images decode in `CustomTrigger`. The avatar is a source
reference asset, not a fabricated customer claim or a newly licensed photo.

## Rerun

From this repository root, with an existing dependency checkout:

```sh
export PATH="$HOME/.local/share/mise/installs/node/24.18.0/bin:$PATH"
DEPS=/absolute/path/to/read-only/dependency-checkout
SCRATCH=$(mktemp -d "${TMPDIR:-/tmp}/lenso-menu-toast.XXXXXX")

node packages/storybook/stories/menu-toast-build.fixtures.mjs "$SCRATCH" "$DEPS"

MENU_TOAST_VERIFY_PIN=1 node packages/storybook/stories/menu-toast-proof.mjs \
  "$SCRATCH/menu-toast-storybook-static" \
  "$DEPS/packages/react/node_modules/playwright/index.mjs" \
  "$SCRATCH/menu-toast-proof"

"$DEPS/node_modules/.bin/oxlint" --config packages/standard/oxlint.json \
  packages/storybook/stories/menu.stories.tsx \
  packages/storybook/stories/toast.stories.tsx \
  packages/storybook/stories/menu-toast*.tsx \
  packages/storybook/stories/menu-toast*.ts \
  packages/storybook/stories/menu-toast*.mjs

"$DEPS/node_modules/.bin/oxfmt" --check --config packages/standard/oxfmt.json \
  packages/storybook/stories/menu.stories.tsx \
  packages/storybook/stories/toast.stories.tsx \
  packages/storybook/stories/menu-toast*.tsx \
  packages/storybook/stories/menu-toast*.ts \
  packages/storybook/stories/menu-toast*.mjs \
  packages/storybook/MENU-TOAST-EVIDENCE.md
```

The build recipe copies source packages and the existing payment-icon fixture
needed by the full Storybook TypeScript project. It never edits that imported
reference. Workspace `@lenso/ui` and `@lenso/tokens` links point to the freshly
built scratch packages, not stale parent `dist` output. Dependency symlinks,
Vite caches, compiler output and Storybook output are all scratch-owned.
Use a fresh scratch directory for each build run.

## Antislop DURING delivery review

Design read: component-development stories for library users, exact HeroUI
3.2.6 reference language. ENERGY 1 / RHYTHM 1 / MOTION 2: quiet controls,
source-specific menu/content structure and state-driven overlay transitions.

- Source identity/content PASS: names, text, icon paths, avatar and examples
  derive from the pinned source; no new branding, metrics or testimonials.
- Purpose PASS: menu groups separate actions/settings, danger color identifies
  destructive items, icons identify actual file/social/notification actions,
  stack motion exposes enqueue/settlement/close rather than decoration.
- Function/semantics PASS for the tested workflows: the scoped production proof
  exercises native state, keyboard, focus, gesture, async and dismissal paths.
  Source shortcut annotations are not claimed as installed global shortcuts;
  source Cut/Copy/Paste entries are not claimed as clipboard implementations.
- Theme/geometry PASS for the measured coverage: 54 active theme mounts,
  source popup widths, desktop toast width, mobile toast bounds and reduced
  motion; no generated-class-name assertions.
- Engineering PASS: fresh package/strict TS/production builds, scoped
  lint/format and zero uncaught browser errors, with rerunnable evidence.
- Source-authority exception: exact upstream colors include known normal-text
  contrast failures, as `DESIGN.md` states. This batch does not claim WCAG AA
  and does not replace the locked palette to manufacture a contrast pass.

## Honest limits

1. **Missing native hotkey contract:** the existing public native toast viewport
   uses F6 focus navigation. It does not expose HeroUI's configurable default
   Alt+T hotkey. The proof verifies native F6 and Shift+Tab; no shared API or
   document-level source-runtime hotkey shim was added.
2. **Visual coverage:** local active screenshots and geometry were checked
   against complete source content, source CSS and constants. A separately
   running upstream Storybook or screenshot-diff parity harness was not built.
   This is not an exhaustive pixel-parity claim.
3. **Breadth of focused workflows:** the full matrix mounts all cases, but
   focused async assertions cover upload success/create-event error and manual
   upload success. The random-save/fetch-user branches, manual payment/error
   branches and 10s/default callback histories remain authored source workflows,
   not individually asserted branch coverage.
4. **Gesture coverage:** pointer hold/up, movement, pointercancel, disabled hold
   and native keyboard are live-tested. Disabled-state transition during an
   already pending hold and unmount cleanup are implemented, but not separately
   observed in the production browser proof. Touch hardware timing is untested.
5. **Responsive/RTL coverage:** measured mobile coverage is the toast at 390px;
   it is not every case at every breakpoint. Source-controlled dropdowns retain
   their 384px minimum width and custom queue rows retain source row geometry.
   Full RTL submenu/placement and mobile modal testing are not claimed.
6. **Assistive technology:** semantic/focus checks are browser evidence, not a
   screen-reader session or an exhaustive WCAG audit.
