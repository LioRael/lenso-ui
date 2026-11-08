# Refresh and editable content lists

## Scope and ownership

Implemented RefreshControl and additive editing on List. The integrated Library
page composes refresh, section index, coordinated swipe actions, checkbox
selection, group-local reorder, delete/undo and entry details. This is a Web
implementation; this task does not establish native iOS visual or gesture parity.

See [list composition](../design/list-composition.md) and
[the migration note](../migrations/list-editing-refresh.md). Existing primitive
source and public APIs were not edited for this task.

## Evidence

| Check | Result | Scope |
| --- | --- | --- |
| Affected format and oxlint | Passed | Component, tokens, page, stories and regressions |
| UI, tokens and docs types | Passed | Includes UI tests and docs scripts |
| Targeted Bun DOM regressions | 14 passed | Static List, native selection, disabled rows, controlled rejection, section boundaries, reorder commit/cancel, refresh pending/error/retry, top/direction/cancel arbitration and existing swipe/wheel semantics |
| Docs script and library tests | 94 passed | Existing docs projection, API, source graph and related scripts |
| Integrated dev page | Passed | Chromium and WebKit, light/dark, 390×844; button refresh, same-scrollport index navigation, exclusive swipe actions, editing transition, batch delete/undo, keyboard and pointer reorder/cancellation, dialog dismissal and focus return; empty-list refresh and undo preserve newly added records |
| Touch input | Passed in Chromium CDP | Downward top pull adds one record; horizontal touch reveals actions without opening details or refreshing; upward touch retains native scrolling |
| Narrow editing review | Passed | Both engines/themes, 320×740, RTL, enlarged list text; no horizontal overflow and navigation title remains readable |
| Existing swipe/wheel browser suite | Passed on rerun | Both engines/themes; first run had an unreproduced WebKit wheel settled-scroll assertion while other checks were running |
| Installed consumer production test | Passed | Real tarballs, subpath/root exports, types, SSR and emitted CSS/JS including RefreshControl and editable List |
| Full docs generation/build | Blocked outside changed list implementation | SectionIndex story imports private `packages/ui/src/utils/materials/render.tsx` outside the allowed demo source root |

The installed-consumer check caught a nested StyleX conditional that worked with
source aliases but failed against bundled packages. Splitting it into independent
conditions fixed the actual production consumer compile. The browser review
caught the full-page navigation title being squeezed away at 320px; icon actions
with accessible labels now leave the title enough space.

Dev screenshots were inspected under `output/playwright/list-refresh/`, including
light/dark pages and the enlarged RTL editing state. Screenshot capture is opt-in
for the maintained test through `LIST_REFRESH_SCREENSHOTS`; its default run leaves
no artifacts. These captures are not pixel comparisons with native iOS.

React Doctor's changed scan also ran. Its List finding is component complexity;
its other reported lifecycle errors concern unchanged implementation in existing
components. The scan is advisory and does not replace the passing lint, types,
rendered checks or installed-consumer verification. It does not establish full
repository cleanliness or comprehensive coverage of newly added files.

## Reproduce

Start the existing docs development workflow and use its actual URL:

```sh
DOCS_URL=http://127.0.0.1:4312 bun run --filter @lenso/ui-docs test:list-refresh
bun test --preload ./tests/setup/dom.ts packages/ui/test/list-basic.dom.test.tsx packages/ui/test/list-refresh.dom.test.tsx packages/ui/test/swipe-wheel.dom.test.tsx
bun run --filter @lenso/ui-docs test:swipe-wheel
bun test --timeout 180000 tests/consumer/installed-consumer.test.ts
```

The consumer test consumes existing package build outputs; build the affected
packages first. The Library routes are `/en/list-lab` and `/cn/list-lab`.

## Remaining verification

No fresh physical iPhone run, native side-by-side comparison, release, publication
or landing was performed. Full docs static export remains unverified until the
independent SectionIndex example source graph is fixed. No exact native motion
or comprehensive contrast audit is claimed.

## Follow-up: action hover padding

The first rendered checks did not cover desktop hover geometry. List.Action had
zero padding while its parent owned the inset, so the hover background touched
the text. Action now owns its 16px inline padding; rows containing a sole action
remove their redundant inset. Action stretches to the row height, and the row
clips feedback at its outer group corners. Editing retains its existing control
insets. Ordinary content rows keep their 16px alignment.

`test:list-hover` covers ordinary and swipe rows in Chromium/WebKit and both
themes, checking hover color, internal text inset, row height, clipping and focus.
The Library integration regression is also rerun for selection, reordering and
swipe behavior after this change.
