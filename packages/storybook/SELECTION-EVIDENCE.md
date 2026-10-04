# Selection Storybook batch

The four story files export the **64 original source cases**: Select 17,
ComboBox 19, Autocomplete 21 and ListBox 7. The final production proof mounted
all **128 light/dark variants**, opened all **126 enabled popups**, and passed
**31 focused checks**, with no failed checks or browser page errors.

This records source inventory, implemented workflows and live reconstruction
proof separately. It does **not** claim a 64-case upstream screenshot comparison.
There are no cases excluded for a known missing behavioral workflow or native
package blocker. Pixel-perfect source-complete visual declarations remain
unverified for the batch; export counts must not be used as that evidence.

## Authority and complete source files

HeroUI **v3.2.6**, commit `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
The complete raw story files, rather than documentation demo inventories, were
fetched and read. The proof verifies their SHA-256 hashes, compares every
case-sensitive export in source order, and verifies the production Storybook
index entries. No case is an alias of `Default`.

| Family       | Raw source                                                                                                                                                                                   | Bytes | SHA-256                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----: | ------------------------------------------------------------------ |
| Select       | [select.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/select/select.stories.tsx)                   | 32461 | `db0fb20b5cd4732adb0fba9e02b6503a59f0b2377acad107bc9e3de29911fb8f` |
| ComboBox     | [combo-box.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/combo-box/combo-box.stories.tsx)          | 32592 | `0b421789a72382d9fd21c8d025f2d022ddd43d49b307c01b9f38374ad407dd0c` |
| Autocomplete | [autocomplete.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/autocomplete/autocomplete.stories.tsx) | 65938 | `59678ac699363858b12cb2d5f466746838912c6301a778a1016a7475297827f9` |
| ListBox      | [list-box.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/list-box/list-box.stories.tsx)             | 15628 | `6f82cd82172feb2d8d98c610e6f3354d701bd75d609cf82e06324a3aaab9f981` |

### Exact exported cases

- **Select (17):** `Default`, `Variants`, `FullWidth`, `WithDescription`,
  `MultipleSelect`, `WithSections`, `WithDisabledOptions`, `WithClearButton`,
  `CustomIndicator`, `Required`, `CustomValue`, `CustomValueMultiple`,
  `Controlled`, `ControlledMultiple`, `ControlledOpenState`,
  `AsynchronousLoading`, `Disabled`.
- **ComboBox (19):** `Default`, `FullWidth`, `DefaultSelectedKey`,
  `WithDescription`, `WithSections`, `WithDisabledOptions`, `CustomIndicator`,
  `Required`, `CustomValue`, `Controlled`, `ControlledInputValue`,
  `AsynchronousLoading`, `CustomFiltering`, `AllowsCustomValue`, `Disabled`,
  `MenuTrigger`, `MultipleSelection`, `MultipleSelectionControlled`,
  `MultipleSelectionWithTags`.
- **Autocomplete (21):** `Default`, `WithClearButton`, `WithOnClearCallback`,
  `Variants`, `MultipleSelect`, `FullWidth`, `WithDescription`, `WithSections`,
  `WithDisabledOptions`, `CustomIndicator`, `Required`, `Controlled`,
  `ControlledOpenState`, `AsynchronousFiltering`, `Virtualization`, `Disabled`,
  `UserSelection`, `UserSelectionMultiple`, `LocationSearch`,
  `TagGroupSelection`, `EmailRecipients`.
- **ListBox (7):** `Default`, `WithSections`, `WithDisabledItems`, `MultiSelect`,
  `CustomCheckIcon`, `Controlled`, `Virtualization`.

## Native implementation and deliberate adaptations

These are private Storybook fixtures, not additions to the public packages:

- Non-DOM native roots receive values, items, disabled/required state and native
  callbacks. DOM field shells own layout; `className` is not passed to a
  non-DOM root. Native `Portal`, `Positioner`, popup, list, item, group and
  group-label parts own ordinary selection. All added layout is compiled
  StyleX, using existing component styles and theme variables.
- Autocomplete uses the native popup input and externally supplied
  `filteredItems`, not React Aria `Filter`, `Collection` or a compatibility
  prop adapter. Query clearing is a separate native button: it clears only the
  search query and retains the selected value. Selection clearing uses native
  `Clear`, including the source callback count/time display.
- Multiple-selection input and value chips share native `Chips` context,
  including the portalled popup input. Native chip removal supports pointer
  activation and ArrowLeft/Backspace operation. Chips are not nested buttons
  inside a trigger button. The explicit popup anchor includes the value/chip
  shell so the popup does not cover the tags.
- Native Select has no `Clear` part. `WithClearButton` uses an adjacent native
  button and a controlled value reset; clearing returns focus to the native
  trigger. This is an anatomy adaptation, not a missing clear workflow.
- Native ComboBox has no `allowsCustomValue` compatibility prop.
  `AllowsCustomValue` instead owns a bounded controlled workflow: Enter without
  a highlighted option, or blur, commits the trimmed custom item through native
  `items`/`value`; native selection still commits an existing item normally.
  The named native hidden input submits the committed ID through `FormData`.
  It is not merely an editable, uncommitted text input.
- Required fields use native `TextField`/`FieldError`, native required controls
  and `Form`. Source success/action text is rendered in inspectable live output
  instead of blocking browser `alert` dialogs.
- The original state, animal, country/group, user/avatar, city, tag, recipient
  and shortcut content is retained. Generated user IDs are serialized as strings
  for stable native values; the source's 1–1000 IDs, names and emails are retained.
  Default-selected combobox inputs display the selected label and show the full
  collection when that label is committed, rather than treating it as a query.
- Async loaders retain the source PokeAPI/SWAPI URLs and cursor workflows.
  A story-owned intersection sentinel observes the actual native scrolling
  container. Requests are aborted on replacement/unmount; generation checks
  prevent stale query results from replacing the active list. HTTP cursors are
  normalized to HTTPS. Errors are displayed rather than replaced with invented
  options. The location example retains its source 300ms simulated search state.
- Autocomplete windowing uses the public native `virtualized` contract,
  explicit item indices, highlight-driven scrolling and a 50px fixed-row window.
  ListBox uses its existing public collection windowing. Both render the source
  1000-user dataset with a 400px viewport. The source ListBox virtualization case
  remains non-selecting; it still supports keyboard navigation.
- Source desktop widths remain 256/300/380/400/220px as applicable. The wide
  fixture shells additionally constrain themselves to viewport width minus 32px
  on mobile. Source labels, descriptions, section headers, avatars, shortcuts,
  custom Gravity UI icons and surface shadow tokens are retained.

No UI, styles-package, primitives, documentation-demo, shared configuration,
inventory, generic smoke, dependency, version or release files were changed by
this batch.

## Verification

Final environment: **Node 24.18.0**, installed **pnpm 11.5.0**,
**Playwright 1.62.1**, Chromium **151.0.7922.34**.

- Fresh token and UI JS/declaration distributions, CSS and upstream notices
  built from copied sources in scratch.
- Strict Storybook TypeScript check passed against those fresh distributions.
- Production Storybook build passed; the proof served its static production
  iframe, not a development server.
- Scoped oxlint: **0 errors, 0 warnings**. Scoped oxfmt completed.
- Source-index and live mount/open checks: **64 exports, 128 mounts, 126 popups**.
  Disabled cases have no enabled popup trigger and are intentionally not forced
  open. Variants, required forms and menu-trigger cases open each enabled field,
  rather than just their first trigger.

The 31 focused checks cover both themes for:

| Workflow                              | Live proof                                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select keyboard and controlled values | ArrowDown/End/Enter commits Pennsylvania; controlled multiple deselection updates `texas`                                                           |
| Controlled open                       | External Open buttons, native popup visibility, Escape and closed-state feedback                                                                    |
| Default and controlled combobox input | Initial `Cat` label, complete default collection, Bird filtering/keyboard selection, controlled `panda` input                                       |
| Chip removal                          | ArrowLeft/Backspace removes the last native chip; pointer removal and later selection update controlled values                                      |
| Menu triggers                         | Focus opens the focus example; typing opens the input example; manual typing stays closed until ArrowDown                                           |
| Custom committed values               | Enter commits `Axolotl`; blur commits `Capybara`; choosing Cat commits `cat`; named `FormData` proves each                                          |
| Clear behavior                        | Select value reset and focus return; Autocomplete callback count; query-only clear retains California                                               |
| Rich data and geometry                | Five real avatar images decode; selected avatar is 16×16px; required forms and action surface are 256px; surface shadow is present                  |
| Recipients                            | Email filtering, selecting Alice and removing the native email chip                                                                                 |
| Groups and disabled options           | Three native groups; Cat/Kangaroo have native disabled semantics                                                                                    |
| Required forms                        | Empty submission rejected; selected `state`/`country` or `animal` values match native `FormData`; success output appears                            |
| ListBox selection/actions             | Controlled Space/ArrowDown operation; disabled delete action cannot replace the last enabled action                                                 |
| ListBox virtualization                | Fewer than 30 mounted options; End focuses position 1000 and scrolls beyond 49000px; Home restores position 1                                       |
| Autocomplete virtualization           | Keyboard highlights/mounts offscreen index 999 and selects Benjamin Martinez; email search reduces the window to three rows                         |
| Mobile geometry and opacity           | 390×844 viewport; bounded, anchored popups; no FullWidth document overflow; no opacity leak onto root/body ancestors in enabled or disabled stories |

The remaining focused check replays genuine async responses: scrolling loads the
next SWAPI/PokeAPI cursor; a delayed Luke response cannot replace the later Leia
query. Each proof run writes detailed failures, source hashes, response hashes,
browser version and popup geometry to its JSON report.

Observed mobile geometry in both themes:

| Family       | Field/trigger height | Popup width | Popup height |
| ------------ | -------------------: | ----------: | -----------: |
| Select       |                 36px |       256px |        228px |
| ComboBox     |                 36px |       256px |        252px |
| Autocomplete |                 36px |       256px |        292px |

Popup backgrounds resolved to source theme colors `oklch(1 0 0)` in light and
`oklch(0.2103 0.0059 285.89)` in dark.

### Reproduce without writing the dependency checkout

Run from the attached repository. Supply Node 24.18.0 and an existing readonly
dependency checkout. The builder rejects scratch paths inside either checkout.
All dependency links, package distributions, Storybook output and caches belong
to scratch; no repository symlinks or installation are required.

```sh
NODE24=/Users/leosouthey/.local/share/mise/installs/node/24.18.0/bin/node
DEPS=/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui
SCRATCH="$(mktemp -d)"

"$NODE24" packages/storybook/stories/selection-build.fixtures.mjs "$SCRATCH" "$DEPS"
SELECTION_REPLAY_DIR="$SCRATCH/replay" \
SELECTION_PROOF_OUTPUT="$SCRATCH/selection-results.json" \
  "$NODE24" packages/storybook/stories/selection-proof.mjs \
  "$SCRATCH/selection-storybook-static" "$DEPS"
```

The first run captures genuine response bytes. Reusing that replay directory
checks URL provenance and SHA-256 before replaying them. Cold-cache runs require
network access; recorded async success is **not** a claim of ongoing endpoint
availability. The proof never supplies generated avatars or invented API options.

Representative captured API SHA-256 values:

- PokeAPI initial page:
  `e7d7969da761b07ce4e0bff6fcd68acc738465d613faa64416498ae5085cf653`.
- PokeAPI offset 20:
  `ff3c93827f3bd87834f480d3c6fa98491ccdd85d916eb3300f1aa8ab8b559ff3`.
- SWAPI empty search:
  `33cb290b516144ec4063fe540307073308ac9f7455e9d9fd944a9c12c2e908bf`.
- SWAPI page 2:
  `6c1d0b714a4f7ddf7991444a475a89efeafe23547fa1ba2ad60fd8c219b9757f`.
- SWAPI Luke:
  `2f5186375d318b0780ff4232dade94a2f875df171570f8ae5d5d28a27ff9c594`.
- SWAPI Leia:
  `035b349fa8c6a7a60925475736f0ba2e58c7664cb758562242742c6c852df0ac`.

The original CDN avatar URLs are retained; their bytes are captured only in
scratch, not redistributed as new repository assets. The five decoded images
had SHA-256 values:

| Avatar     | SHA-256                                                            |
| ---------- | ------------------------------------------------------------------ |
| blue.jpg   | `defa32ddb23b6307c5cb8d701022186645dfcee057d2b0ba9ec1955dea22db70` |
| green.jpg  | `c48cdbaa2058ca5420edd44e17537d7f2cbaab72f5ae01e5738fa82f3d090ba1` |
| purple.jpg | `dfed184450806d7a0a9d72c650f73979ae15b522cb8e65fade232bb5ec55ca72` |
| red.jpg    | `81b92cb17f6c3c142a5cdb568904f7bb147d17fe3454737b9187aafca340412c` |
| orange.jpg | `8b15ec8c71b3a381b6c8117f340742e4f429ab0b65af5c3b220d01a700f0e08d` |

## Limits and licenses

- These production checks establish implemented native workflows and bounded
  geometry. They do not establish screenshot-by-screenshot upstream parity,
  exhaustive screen-reader behavior, RTL or reduced-motion coverage for this
  batch. No such coverage is counted here.
- React Doctor was run in the scratch Storybook copy. Without a Git baseline it
  scanned the whole copied Storybook and reported 81/100. Existing unrelated
  smoke/link/slider diagnostics were left outside scope. Its selection findings
  classified the pure `useFilter().contains` predicate as a render prop callback,
  and conditionally guarded loading resets inside `finally` as resets outside
  `finally`. Those were inspected; neither is an actual render side effect or a
  misplaced loading reset. This is not a claimed clean React Doctor regression
  score.
- Antislop was applied during implementation against the pinned source
  direction: existing neutral surfaces, typography, selected/focus accent and
  native interaction motion. No new marketing copy, decorative illustration,
  invented endpoint data or replacement theme was added. The bounded review
  checked working controls, light/dark states, mobile overflow, popup anchoring
  and keyboard/removal workflows. Known source contrast failures remain;
  source fidelity does not imply WCAG AA compliance.
- HeroUI-derived stories/data/layout retain Apache-2.0 attribution. Upstream
  notices remain in `third-party/heroui` and are copied into the scratch package
  distributions. Gravity UI SVG paths are MIT, Copyright (c) 2022 YANDEX LLC;
  the retained license is `GRAVITY-ICONS-LICENSE.txt`. The original external API
  and image URLs are identified separately from the adapted story source.
