# Pinned action Storybook scenarios

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, Apache-2.0.
Each complete raw source was fetched and read at:

```text
https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/<family>/<family>.stories.tsx
```

These are runnable source-story adaptations, not imported documentation demos.
The six export inventories match the complete raw files, including export order.
The production Storybook index independently contains exactly these 42 stories.
No upstream source scenario is omitted.

## Reviewed exports

| Family            | Count | Exact exported names                                                                                                                                          |
| ----------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button            |     9 | `Default`, `WithLinkButton`, `Sizes`, `FullWidth`, `WithIcon`, `WithIconOnly`, `WithSpinner`, `WithLoadingState`, `WithSocialButton`                          |
| ButtonGroup       |     8 | `Default`, `Sizes`, `FullWidth`, `Variants`, `Disabled`, `WithIcons`, `WithoutSeparator`, `Examples`                                                          |
| CloseButton       |     3 | `Default`, `WithCustomIcon`, `Interactive`                                                                                                                    |
| ToggleButton      |     7 | `Default`, `Variants`, `Sizes`, `IconOnly`, `Controlled`, `Disabled`, `RealWorld`                                                                             |
| ToggleButtonGroup |    11 | `Default`, `Sizes`, `Orientation`, `AttachedVsDetached`, `FullWidth`, `SelectionMode`, `Controlled`, `Disabled`, `WithoutSeparator`, `WithLabels`, `Examples` |
| Toolbar           |     4 | `Default`, `Vertical`, `WithButtonGroup`, `Attached`                                                                                                          |

Raw source SHA-256:

```text
button              ea7c16ca508bd4e7ce819462de02e565a1c32f601df5ac3925d820146bfa1f48
button-group        a18c3772398c5d0f691ce76e96add90f99eabf9bf5d4f7088748a8b35e6e5f58
close-button        7dc06b890e837be1146268ead7d9ebea21c61b5d5b3eee840f3c3dd61e8f8640
toggle-button       44999d8d848022eef2a0839aa402d4c221b8efe754c503b9aec30e7df988ed26
toggle-button-group d8441af38203efd3c37c0b54f309a9d3d5138ccd124ed05c86ea33ec348127c2
toolbar             b47e9c18fd348d76a7e87d519edcc70a24a996d34d15d1c5e93c434322f95b7c
```

## Native adaptation decisions

- Source `isDisabled`, `isPending`, `onPress`, `defaultSelected`, `isSelected`
  and `onChange` become native `disabled`, `isLoading`, `onClick`,
  `defaultPressed`, `pressed` and `onPressedChange`. Story controls use native
  prop names while preserving source choices. The CloseButton singleton
  `variant: "default"` selector and default arg remain story-only and are
  stripped before rendering because the native CloseButton has no variants.
- Source `selectionMode` becomes `multiple`, with source single/multiple
  selector choices mapped to native booleans. Source key IDs become native
  toggle `value`s. Controlled Sets become ordered string arrays. Native event
  cancellation preserves both examples' `disallowEmptySelection`.
- Controls that upstream render functions ignore are still ignored here.
  In particular the source spinner and loading templates do not apply the
  disabled control, and the group and toolbar scenes do not forward story args.
- `WithLinkButton` remains a native anchor, composed from the library's
  compiled button maps, with the exact Google URL, target and rel. It is not
  an action with `role="button"` and is not forced through a generic dispatcher.
- Source loading remains focusable and nonactivatable. Its upload simulation
  retains the original 4500ms timeout and exact idle/pending content.
- The explicit enabled child in `ButtonGroup.Disabled` also declares
  `aria-disabled={false}` so the disabled ancestor's ARIA state does not
  contradict its real native `disabled={false}` override.
- Toolbar actions use native `Toolbar.Button` and `Toolbar.Separator`, so
  roving keyboard navigation crosses toggle and action groups. Action buttons
  explicitly compose the existing grouped button map because the local
  ButtonGroup context intentionally recognizes only direct Button children.
  The dropdown's rendered Button uses that same map.
- Dropdown source popover/menu anatomy becomes native Trigger, Portal,
  Positioner, Popup and Item composition, preserving bottom/end placement,
  the 290px maximum, all three item labels/descriptions and the source alert
  action. Native typeahead `label` preserves source `textValue`.
- Family fixtures factor only real repeated anatomy: the three-button group
  and the formatting/alignment toggle groups. Layout is compiled StyleX,
  including source 400px full-width examples and 14px compact icons.
- All source no-handler actions remain no-ops. No merge, clipboard, auth,
  payment, navigation or editing product behavior was invented.
- Source icon IDs, shapes, viewBoxes and brand colors are preserved as native
  SVG. The 34 new Gravity path strings were checked exactly against retrieved
  Iconify data; four existing shared Gravity icons are reused unchanged.
  SVG license notices are retained in `actions-icons.fixtures.tsx` and the
  existing Gravity notice. Typicons' LinkedIn shape remains CC BY-SA 4.0.

## Verification performed

Final verification used Node **24.18.0**, pnpm **11.5.0**, and a scratch-only
workspace copy. Dependencies were read-only links to the parent's installation;
workspace package links pointed to scratch packages, not the parent's builds.
Fresh styles and UI production builds preceded strict Storybook TypeScript
and production Storybook build. No repository dependency links were created.

Passed:

- Scoped standard `oxlint --deny-warnings`: no errors or warnings.
- Scoped standard `oxfmt --check`: all changed action files formatted.
- `git diff --check` for the story directory.
- Fresh `@lenso/tokens` and `@lenso/ui` production builds.
- Strict `@lenso/storybook` `tsc --noEmit`.
- Production `@lenso/storybook` build consuming those fresh library outputs.
- **84 actual Chromium iframe mounts**, all 42 stories in light and dark,
  with nonzero action geometry and no unexpected console or page errors.
- In each theme: disabled Button controls, a real anchor/link, focusable
  pending buttons, Enter/Space activation blocking and 4500ms loading reset.
- Disabled ButtonGroup native inheritance and its enabled-child override;
  contiguous group geometry; actual dropdown menu opening, 290px maximum and
  the `Selected: squash-and-merge` alert action.
- CloseButton Enter activation increments its accessible counter; disabled
  override prevents native activation.
- Controlled ToggleButton Space activation updates pressed state and status.
  Like, Save and initially pinned controls each toggle independently.
- Single selection replaces the prior selected alignment; multiple selection
  retains Bold and Underline while adding Italic; controlled status updates;
  all-group and individual disabled semantics; vertical Down-arrow navigation.
  The view and alignment examples refuse an empty selection.
- Toolbar Right-arrow navigation crosses Bold, Italic, Underline, Copy and
  Cut and wraps; Space toggles Bold. Vertical Down-arrow navigation crosses
  the formatting group into Undo. Vertical group layout stacks in order.
- All three full-width families measure 400px. At a 390px viewport source
  button heights are 36/40/44px. RTL group positions reverse. Reduced-motion
  button transition duration is zero.

The smoke script is deliberately scoped. Existing coverage did not prove
these source exports: the old Button stories were a legacy development matrix,
and the shared iframe runner has no mount contracts for the other five action
families. This script checks exact inventory plus concrete native behavior and
geometry, without modifying shared inventory or coverage ownership.

Rerun from the repository root after rebuilding packages and Storybook:

```sh
pnpm --filter @lenso/tokens build
pnpm --filter @lenso/ui build
pnpm --filter @lenso/storybook typecheck
pnpm --filter @lenso/storybook build
node packages/storybook/stories/actions-smoke.fixtures.mjs \
  packages/storybook/storybook-static \
  packages/react/node_modules/playwright/index.mjs
```

## Evidence limits

- These checks establish source inventory, reviewed composition, native
  behavior and scoped geometry, not pixel-identical upstream screenshot
  parity. No side-by-side upstream Storybook screenshot suite was run.
- Browser proof is Chromium, not Firefox or WebKit. RTL proof covers layout,
  not DirectionProvider-based reversed toolbar keyboard navigation.
- Responsive proof covers source button sizing, not every source row at every
  width. Fixed 400px examples and large no-wrap source rows intentionally
  retain source overflow on smaller viewports.
- Source no-handler actions are not real product integrations. The external
  Google destination was checked structurally, not navigated to.
- No upstream ref-specific story exists among these 42 exports; this work did
  not invent one or claim new exhaustive component-level ref/render coverage.
- Exact source colors and unlabeled source icon-only scenes are retained.
  This is not a WCAG AA claim or a contrast/accessibility remediation.
- Full workspace gates, docs builds and unrelated family coverage remain the
  parent's consolidation task. No shared configuration, source inventory,
  `reviewedFamilies`, shared smoke runner, component, styles package,
  primitives, release, version, publication or landing edits were made.
- React Doctor's optional latest-tool installation/audit was not run because
  the delegation explicitly excludes tool-install and audit broadening.

## Antislop DURING delivery check

Reading: source component-development scenes for library maintainers, HeroUI
visual language; ENERGY 2 / RHYTHM 1 / MOTION 1. The authority, not a new
marketing aesthetic, owns color, radius, typography, content and motion.

- Hard-gate PASS within the explicit source-reconstruction contract:
  real pinned content/assets, native keyboard behavior, two-theme mounts and
  build evidence. Source no-ops, fixed-width overflow, small target sizes and
  source contrast limitations are explicit owner-required exceptions, not
  silently changed or claimed compliant.
- Purpose-gate PASS: color, type, spacing and radius reproduce the pinned
  source; icons identify the source actions and brands; loading motion
  communicates pending state. No decorative assets or invented animation.
- Liveliness PASS for development scenes: each scene's action/group is its
  focal point; source gaps group alternatives; the source accent and rounded
  grouped-action motif are retained, not replaced by a generic page template.
- Craftsmanship/quality PASS within scope: all scene content is source-backed,
  actual stateful examples are exercised, no fake integrations or claims were
  added, and verification limits are recorded rather than called full parity.
