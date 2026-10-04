# Navigation source-story implementation and evidence

## Scope and source

The seven navigation story files now contain **41 actual source-story exports**.
Source authority is HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`:

```text
https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/<family>/<family>.stories.tsx
```

All seven full upstream files were read. Export names were also compared
programmatically against freshly fetched pinned files during the final replay.
This is a React source-story reconstruction, not the documentation demo inventory.
In particular, the standalone and grouped HeroUI Native disclosures remain live
React stories. Their product text is upstream fixture/reference content, not a
claim about Lenso's architecture or a promise of a working App Store integration.

| Family           | Count | Exact case-sensitive exports                                                                                                                                                                                     |
| ---------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accordion        |     4 | `Default`, `SurfaceVariant`, `Custom`, `WithoutSeparator`                                                                                                                                                        |
| breadcrumbs      |     5 | `Default`, `Level3`, `Level2`, `CustomSeparator`, `Disabled`                                                                                                                                                     |
| disclosure       |     5 | `Default`, `Controlled`, `ProductDetails`, `InitiallyExpanded`, `Disabled`                                                                                                                                       |
| disclosure-group |     3 | `Default`, `Controlled`, `Showcase1`                                                                                                                                                                             |
| link             |     4 | `Default`, `CustomIcon`, `IconPlacement`, `UnderlineVariants`                                                                                                                                                    |
| pagination       |     8 | `Default`, `Sizes`, `WithEllipsis`, `SimplePrevNext`, `WithSummary`, `CustomIcons`, `Controlled`, `Disabled`                                                                                                     |
| tabs             |    12 | `Default`, `Overflow`, `Vertical`, `VerticalAlign`, `WithDisabledTab`, `WithDefaultSelectedTab`, `WithControlledSelectionTab`, `WithCustomStyle`, `WithSeparator`, `Showcase1`, `Secondary`, `SecondaryVertical` |

The two `Showcase1` display names retain the source's Apple showcase names.
Advanced exports render their own content, state and composition; they are not
aliases to `Default`.

Only these stories, navigation-owned fixtures/styles/licenses and this evidence
file were authored. Shared inventory, `reviewedFamilies`, component/style
packages, configuration and primitives were not changed.

## Interaction adaptations

- Source `isDisabled`, `isExpanded` and `allowsMultipleExpanded` story args and
  boolean controls are retained. The render boundary translates them to native
  `disabled`, `open` and `multiple`. No compatibility component API was added.
- Standalone disclosure uses native Collapsible state. Grouped disclosure uses
  native Accordion string values and array state. Source trigger slots become
  `Disclosure.Trigger render={<Button />}`; the composed element remains one
  native button rather than nested buttons.
- Group navigation retains the source's first-expanded-item ordering and
  first-item fallback when all items are closed.
- Tabs use native `value`, `defaultValue` and `onValueChange`. Source automatic
  activation is expressed with Base UI's `activateOnFocus`; the separate
  contract fixture also proves native manual activation and RTL operation.
- The native measured indicator is a single list sibling, not one indicator
  inside every tab. The existing measured scroller and scroll buttons are used.
- Base UI intentionally keeps disabled tabs arrow-focusable while blocking
  activation. This differs from React Aria's disabled-item skipping and is
  tested as the native contract, not hidden by a custom key handler.
- Camera values are consistently strings. The upstream camera example mixes
  numeric default/state keys with string item IDs; normalization makes the
  initial `200 mm` photo and later selections work.
- Pagination has real fragment `href`s. Controlled activation prevents default
  navigation, updates page/summary/ellipsis state and disables boundary links.
- Story styles are compiled StyleX; no upstream Tailwind or React Aria runtime
  is imported by these stories. Source Iconify identifiers/geometry are local
  native SVGs, with licenses in `stories/navigation-icons-LICENSE.txt`.
  HeroUI adaptations retain Apache-2.0 notices. Original Apple and QR image URLs
  are preserved; their trademark/content rights are not re-licensed.

## Executed checks

The final replay used installed, already-built packages from the delegated
readonly dependency checkout. Builds, copied source, generated consumer
configuration and caches were placed in scratch.

- Strict Storybook `tsc --noEmit`: passed, including the contract fixture.
- Production Storybook build: passed.
- Separate Vite production consumer build importing the public package exports:
  passed. This is not a source-only test harness.
- Repository-config oxlint: **0 warnings, 0 errors**, 13 navigation-owned TS/JS
  files.
- Repository-config oxfmt `--check`: passed for the same 13 files.
- Fresh pinned-source export comparison: **41 exact names**, matching both the
  local source exports and production Storybook index.
- **82 actual production iframe mounts**: every one of the 41 stories in light
  and dark, with positive root geometry and the actual document theme checked.
  No browser `pageerror` was observed.
- Focused replay assertions: accordion arrow focus and multiple expansion;
  standalone controlled/initial/disabled disclosure state and Space activation;
  grouped external navigation and arrow focus; breadcrumb current-page semantics;
  link href/target/disabled tabindex; controlled pagination Enter activation,
  summaries and first/last boundaries; controlled tab selection; disabled-tab
  nonactivation; measured overflow, End-key scrolling and previous-scroll-button
  operation; camera photo/zoom selection and indicator geometry; 390px tabs
  reflow and responsive hiding of Apple disclosure imagery.
- Production consumer assertions: native anchor and trigger refs; merged trigger
  and rendered Button refs; render composition; state-dependent style callback;
  direct native-part dynamic StyleX custom properties; RTL/manual tabs; visible
  keyboard focus ring; measured indicator position.

Original remote images failed direct Chromium transport in this environment.
The final replay used the smoke's explicit curl transport bridge, fetched the
original CDN bytes, and checked that every mounted image decoded. It does not
replace images, rewrite story URLs or vendor the assets. The camera selected
asset decoded successfully.

Representative screenshots were inspected: camera selection, light grouped
disclosure, dark Apple disclosure showcase, dark accordion and mobile tabs.
Both themes were mounted for every export, but **pixel-matched comparison
against a rendered upstream baseline was not executed**. Full visual, motion,
all-breakpoint and accessibility parity is not claimed. The source pagination
summary examples intentionally retain their 640px minimum width.

Antislop was applied during implementation using the pinned design direction:
source-specific surfaces, compact hierarchy and source motion, not invented
marketing content or generated art. Remaining source-only download/preview
buttons are reference fixtures, not asserted product integrations.

## Preserved out-of-scope package failure

The production consumer exposed a styled-render composition limitation. It is
kept in `stories/navigation-contract.fixture.tsx`, and
`stories/navigation-smoke.mjs` prints matched CSS rather than treating it as a
passing width assertion.

Minimal shape, within a `Disclosure` root:

```tsx
const styles = stylex.create({
  width: (width: number) => ({ width }),
});

<Disclosure.Trigger
  xstyle={styles.width(280)}
  render={<Button variant="secondary" />}
  style={(state: { open: boolean }) => ({
    borderTopWidth: state.open ? 3 : 1,
    borderTopStyle: "solid" as const,
  })}
>
  Composed disclosure
</Disclosure.Trigger>;
```

After opening, expected width is **280px**; observed width was **175.031px**
(fit-content, font-dependent). The actual inline style was:

```css
--x-width: 280px;
border-top-width: 3px;
border-top-style: solid;
```

The matching width rule was `.xeq5yr9… { width: fit-content }`, observed twice.
The same dynamic style and callback on a direct native `Disclosure.Trigger`
computed **280px**, with `.x5lhr3w… { width: var(--x-width) }`.
The variable and callback survive, but the styled rendered Button replaces the
winning width class. Ref merging still passed. Parent owns diagnosis of this
component/package behavior; no component workaround or component edit was made.
Story-specific Button overrides are authored on the rendered Button itself.

## Replay

Use a fresh empty scratch destination. `DEPS` points at a checkout with installed
dependencies and built `@lenso/ui`/`@lenso/tokens`; it is read only by this recipe.
`PLAYWRIGHT_MODULE` is an absolute Playwright entry module if it is not resolvable
from the story directory.

```sh
node packages/storybook/stories/navigation-build.fixture.mjs \
  "$DELTA_SCRATCH_DIR/navigation-proof" "$DEPS"

NAVIGATION_VERIFY_PIN=1 NAVIGATION_ASSET_PROXY=1 \
node packages/storybook/stories/navigation-smoke.mjs \
  "$DELTA_SCRATCH_DIR/navigation-proof/navigation-storybook-static" \
  "$PLAYWRIGHT_MODULE" \
  "$DELTA_SCRATCH_DIR/navigation-proof/navigation-consumer-static"
```

`NAVIGATION_VERIFY_PIN=1` fetches and compares all seven pinned source files.
`NAVIGATION_ASSET_PROXY=1` is optional outside restricted browser environments;
it fetches only the original public Apple/QR assets and caches their bytes in
memory. With `DELTA_SCRATCH_DIR` set, representative screenshots are written
there. Neither proof fixture adds a Storybook story or modifies shared coverage.
