# Bounded collection stories

Verified 2026-10-01. Scope: `stories/table.stories.tsx`,
`stories/tag-group.stories.tsx`, collection-owned fixtures/StyleX/proofs, and
this report. No shared configuration, dependencies, inventory, documentation
demos, primitives, versions, or release files changed.

## Immutable source and exact exports

Both complete raw files were fetched and read before implementation from
HeroUI **3.2.6**, commit `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
`collection-proof.mjs` fetches both complete files again, verifies their SHA-256
and ordered export names, checks the local exports, and checks the actual
production Storybook index.

| Family                                                                                                                                                                        | Raw source SHA-256                                                 | Exact exports                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Table source](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/table/table.stories.tsx)            | `1e1a68f16786847c53b54e3047194fbbe93b2c698f7647e3f104aca6eac75026` | `Default`, `SecondaryVariant`, `EmptyStateDemo`, `DynamicCollection`, `DynamicWithSelection`, `ColumnResizing`, `AsyncLoading`, `Virtualization`, `ExpandableRows` |
| [TagGroup source](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/tag-group/tag-group.stories.tsx) | `35967eda4b84aa36514acd0e66ca2e956973c11bf1c56d2ce38948f01b91515b` | `Default`, `Sizes`, `Variants`, `Disabled`, `SelectionModes`, `Controlled`, `WithErrorMessage`, `WithPrefix`, `WithRemoveButton`, `WithListData`                   |

**9 + 10 = 19 story exports.** No advanced scene is an alias of `Default`.
Table keeps its source `variant` select control, options, source args, and
centered layout. TagGroup keeps its source title, centered layout, and autodocs.

Source adaptation is identified in every derived fixture/story. HeroUI work
retains Apache-2.0 authority and the repository's third-party notices.
Gravity UI icons are genuine offline vector paths retrieved through Iconify,
not substitute symbols or runtime icon requests. Their MIT/YANDEX notice is
`GRAVITY-ICONS-LICENSE.txt`. The rocket's redundant outer clipping group was
removed; its complete path and 16px coordinate space are retained.

## Implementation decisions

- Public native `Table` owns selection, sort activation, cell keyboard movement,
  resize handles, recursive expansion, loading sentinel, and fixed-row windowing.
  No ordinary RAC, Tailwind, upstream runtime adapter, or new dependency is imported.
- The original twelve users, IDs, email addresses, roles, statuses, avatar URLs,
  four columns, three-page/four-row pagination, six-row async batches, 1,500ms
  delay, file hierarchy/dates, and complete deterministic 1,000-user generator
  are preserved in `collection-data.fixtures.tsx`.
- Native collection `key`/`itemKey` replace source IDs; otherwise-unkeyed tags
  receive stable text-derived keys required by the public native API.
- TagGroup owns roving focus, selection, disabled handling, Delete/Backspace
  removal, and post-commit focus restoration. React state owns the source's
  controlled selection/data examples. The two custom framework groups share
  the same data owner, as upstream does.
- `collection-selection.fixtures.tsx` decorates the public
  `Table.SelectionCheckbox`, not a second checkbox state machine. Its actual
  input owns click, Space, checked state, focus, and selection. The controlled
  header owner supplies native `indeterminate`. Decorative siblings retain the
  source 16px control, primary/secondary backgrounds, radius, checkmark, mixed
  indicator, and field/focus theme variables.
- Story layout uses compiled StyleX and original public theme variables.
  The empty table's 600px minimum moves inside its bounded scroll viewport,
  rather than forcing a 600px outer page on a phone. Its outer width remains
  600px on desktop. Fixed tag widths are similarly capped by the phone viewport.
- Virtual cells use 42px geometry, including their padding/line height, not a
  42px window estimate over taller native rows. Header height is also 42px.

## Validation and concrete failures addressed

Existing component tests or source inventories cannot prove these previously
absent production stories render, preserve source data, or execute their named
advanced workflows. This scoped proof therefore verifies actual production
iframes, semantic/native state, keyboard behavior, data results, and geometry,
not class names or static export presence alone.

Final environment: **Node 24.18.0, pnpm 11.5.0**.

- Fresh token and UI bundles **and declarations** built in scratch.
- Strict Storybook TypeScript passed, including `strict`,
  `noUncheckedIndexedAccess`, and unused checks inherited from the project config.
- Scoped production Storybook build passed against those fresh distributions.
- oxlint: **0 errors, 0 warnings** on the eight owned code/proof files.
- oxfmt passed for those files.
- React Doctor: **100/100, no issues**, eight files. In the isolated scratch
  package, `--scope changed` correctly fell back to a full scoped-package scan;
  this is not a workspace score or a measured before/after regression score.
- **38 real desktop production iframe mounts: every story in light and dark.**
- **18 additional mobile table geometry mounts**, every table in both themes
  at 390px. Every document remained 390px wide; all nine scroll containers were
  bounded within the viewport and exposed their last column after scrolling.
- Zero browser `pageerror` events. Real images were loaded and their
  `naturalWidth` verified before screenshots.

Every row below runs in **both themes**:

| Story                                       | Actual workflow asserted                                                                                                                                                                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table Default / SecondaryVariant            | Ascending Member sort starts with Ava; Enter reverses sort and rows start with Sophia; native row and all selection; mixed header state; checked SVG opacity; 16px control geometry; Space toggles native checkbox once; visible 2px keyboard focus; horizontal cell arrows; next-page data/summary |
| EmptyStateDemo                              | Four native headers, actual empty content, spanning native cell                                                                                                                                                                                                                                     |
| DynamicCollection                           | Four source rows, Kate initially; next page starts with Emily; previous page returns                                                                                                                                                                                                                |
| DynamicWithSelection                        | Static native selection cells plus dynamic cells; selected Kate row; vertical cell arrow focus; source pagination                                                                                                                                                                                   |
| ColumnResizing                              | Named native separator; ArrowRight increases measured width; Home clamps Name to 160px; pointer drag increases actual column width                                                                                                                                                                  |
| AsyncLoading                                | Six source rows initially; scroll reveals sentinel; `aria-busy` loading; all twelve rows after the simulated delay; sentinel removed                                                                                                                                                                |
| Virtualization                              | `aria-rowcount=1001`; fewer than 40 mounted data rows; measured 42px header/rows; Ctrl+End focuses logical row 1000; bottom scrolling exposes exact `Benjamin Martinez` data; DOM stays bounded                                                                                                     |
| ExpandableRows                              | Initial Project at level 2; controlled nested expansion exposes Weekly Report at level 3; ArrowLeft collapses Project; parent collapse removes Project                                                                                                                                              |
| Tag Default / Sizes / Variants / WithPrefix | Every group selects its first row, moves roving focus with ArrowRight, selects second with Space, and clears first in single mode                                                                                                                                                                   |
| Disabled                                    | Locally disabled News cannot select; Home retains enabled Travel; disabled-key Travel is skipped between News and Gaming                                                                                                                                                                            |
| SelectionModes                              | Initial controlled single/multiple source selections; single replacement; multiple additive selection                                                                                                                                                                                               |
| Controlled                                  | Gaming adds to actual selected-key summary; Travel removal updates summary and `aria-selected`                                                                                                                                                                                                      |
| WithErrorMessage                            | Selecting Laundry clears the actual validation message; deselecting restores it                                                                                                                                                                                                                     |
| WithRemoveButton                            | Default remove click; next-row focus restoration; Delete removal; empty category state; both custom patterns update shared framework data                                                                                                                                                           |
| WithListData                                | Initial Fred selection; removal clears Fred and selected preview; Jane selection adds preview; Backspace removes Jane from data and preview                                                                                                                                                         |

The proof writes `collection-results.json`, all 38 desktop screenshots, all 18
mobile table screenshots, and six original avatar files to its scratch output.
Source avatar bytes are cached only in scratch and served at their unchanged
source URLs, preventing CDN transport failures from silently becoming fallbacks.
The result includes each asset URL, byte length, and SHA-256. These URLs are
mutable external assets, unlike the pinned story files.

## Scoped StyleX collision and integration risk

A real failed appearance assertion exposed a **compiler/consumer cascade
collision**, not a collection selection failure:

```css
/* Fresh package CSS: same generic opacity-zero hash, specificity (3,1,0). */
.xg01cxk:not(#\#):not(#\#):not(#\#) {
  opacity: 0;
}

/* Original Storybook fixture CSS: (2,1,0) and (2,2,1). */
.xg01cxk:not(#\#):not(#\#) {
  opacity: 0;
}
.x1fev8rj:is(input:checked + * *):not(#\#):not(#\#) {
  opacity: 1;
}
```

The browser matched `input:checked + * *`, and the native checkbox was checked,
but computed SVG opacity stayed **0** because the imported three-ID base rule
beat the two-ID consumer checked rule.

The minimal scoped replacement removes the shared generic base-opacity class
from decorative SVGs and gives their base appearance a type selector:

```css
.x168hpbd:is(svg):not(#\#):not(#\#) {
  opacity: 0;
}
.x1fev8rj:is(input:checked + * *):not(#\#):not(#\#) {
  opacity: 1;
}
```

The matching `:is(span)` defaults similarly avoid shared generic control
background/border/outline base classes. No specificity escalation, global CSS,
shared compiler change, or alternate runtime state was added. The final proof
asserts actual checked opacity **1**, native Space selection, source **16×16**
geometry, mixed state, and visible **2px** focus in both themes.

This separate compiler-consumer integration risk is **not fixed globally** by
this bounded work and is not a reason to mark unrelated native scenes blocked.

## Parent fix, source differences, and evidence limits

- The parent repaired native `Table.ColumnResizer` label forwarding. The final
  scratch UI build staged only that reviewed parent `table.tsx` before compiling.
  Its SHA-256 was
  `e0163de562bcfaf09d91c1a7e9672a691d6f54cde736003c0013fc9c4fe7b0f1`.
  The proof now queries **Resize Name** and passes. **No resizer-label blocker
  remains.** The child did not edit the native component.
- Public `Table.Cell` always produces `td`, without `render` composition.
  Source row-header semantics are retained through `role="rowheader"` where
  needed, but exact native `th scope="row"` markup is unavailable through that
  API. This is a DOM-composition limit, not an advanced-workflow blocker.
- Upstream copy/view/edit/delete buttons have no action handlers. Their genuine
  controls, icons, and content are preserved, with accessible labels added.
  They are **not claimed as real business workflows**.
- No live HeroUI baseline application was mounted for pixel-diff comparison.
  Screenshots and source structure were inspected, but exact visual parity,
  all source checkbox animation curves/hover feedback, screen-reader output,
  RTL, reduced motion, and WCAG AA are **not certified** here.
- Mobile interaction replays for all tag scenes are not part of the 18 mobile
  table geometry samples. Desktop interaction proof covers all tags in both themes.
- The native UI/types were freshly built, but the Storybook TS/build/proof is
  deliberately scoped to these two families. Full-workspace integration is
  parent-owned. No publishing or landing was performed.

## Antislop during-work delivery check

Reading: source-authoritative component development for UI developers, HeroUI
visual language, **ENERGY 1 / RHYTHM 1 / MOTION 1**. Original status colors
communicate real source statuses; row composition separates identity, role, and
actions; spacing groups source controls; typography follows source hierarchy;
icons identify the original categories/actions rather than decorate new copy.

- **PASS, source/content authority:** complete immutable source, exact 19
  exports, genuine assets, unchanged source data; no invented product claims.
- **PASS, native behavior:** the workflow matrix records actual selection,
  sort, keyboard, loading, resizing, expansion, validation, and removal.
- **PASS, exercised theme/mobile boundaries:** all 38 desktop themed workflows
  and all 18 bounded mobile table geometry samples passed.
- **PASS, implementation discipline:** compiled StyleX, native public owners,
  fresh distributions, strict TS, production build, scoped lint/format.
- **EXPLICIT SOURCE EXCEPTIONS / NOT CERTIFIED:** source's inert action buttons,
  source contrast/tap-target choices, and unproved states/motion/RTL are not
  converted into a blanket functional/accessibility/visual PASS.

## Rerun without repository or parent dependency writes

Run from the attached repository. Supply a **new scratch directory** each build:

```sh
export PATH="$HOME/.local/share/mise/installs/node/24.18.0/bin:$PATH"
DEPS=/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui
SCRATCH="$(mktemp -d)"
pnpm --version # 11.5.0

# This catch-up variable is needed only while the child's core snapshot predates
# the parent's reviewed label fix. Omit it after normal workspace integration.
COLLECTION_NATIVE_TABLE_SOURCE="$DEPS/packages/react/src/components/table/table.tsx" \
  node packages/storybook/stories/collection-build.fixture.mjs "$SCRATCH/build" "$DEPS"

PLAYWRIGHT="$(node -e "console.log(require.resolve('playwright',{paths:['$DEPS/packages/react']}))")"
node packages/storybook/stories/collection-proof.mjs \
  "$SCRATCH/build/collection-storybook-static" "$PLAYWRIGHT" "$SCRATCH/proof"
```

The builder copies source into scratch, excludes old `dist` and `node_modules`,
links read-only third-party dependencies only there, and maps `@lenso/ui` and
`@lenso/tokens` to the **fresh scratch packages**, not parent distributions.
Caches and Storybook output stay in scratch. It rejects build output inside
either source/dependency repository. `collection-build.json` records the Node
version, scope, actual native table source hash, and whether the optional parent
fix was staged.
