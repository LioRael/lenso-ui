# Dropdown and Toast source evidence

## Authority and boundary

These are adaptations of the 17 Dropdown and 11 Toast example JSON records in
`apps/docs/content/examples/en`, pinned to HeroUI v3.2.6,
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` (Apache-2.0).
Every JSON `source` path exists and its `exported` name was checked with the Babel
TypeScript/JSX parser. Neither source archives nor the registry were changed.

The direction is source-component documentation for UI builders, using HeroUI's
neutral surfaces, semantic tones and restrained feedback:
ENERGY 2 / RHYTHM 2 / MOTION 2. Layout, icons, wording and timing serve the actual
pinned examples rather than adding marketing content or new scenarios.
The original avatar URL, custom SVG paths and native upstream icon exports are
retained. `DESIGN.md`'s source authority takes precedence over changing upstream
contrast or control geometry to meet an unrelated design target.

Ordinary interactions use the native Base UI-backed public components. There is
no ordinary React Aria runtime, utility-class styling, generic demo alias, or
replacement global toast API. Family-local helpers handle repeated presentation
and native portal/viewport composition.

## Executed browser evidence

Chromium used an isolated scratch harness copied from the read-only parent
dependency/source graph, not a modified parent checkout. Its consumer compiler
used StyleX `dev: false`, no StyleX CSS layers, LightningCSS `exclude: 4`,
automatic JSX, React deduplication and native menu/toast preoptimization.

- All 28 actual scenario exports mounted.
- All 17 menu triggers were opened at 1100 × 800 and 390 × 800 in light and dark:
  68 menu openings, with real labels, nonzero geometry and Escape dismissal.
- All 35 source toast trigger buttons were activated in those same four
  configurations: 140 activations, with real toast content and nonzero geometry.
  This includes the seven promise/manual-loading buttons, all six placements,
  all three queues, all variants and custom rendering examples.
- **Do not count the four Expanded activations as expansion proof.** They mount,
  enqueue messages and render, but permanent expansion requires the native API
  described below. Its known React warning was excluded explicitly when checking
  the other 204 activation logs; it was not treated as a clean result.

Sixteen additional native workflow checks passed without page exceptions:

| Workflow                           | Observed result                                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Default action keyboard operation  | ArrowDown selects the first item, Enter activates, menu closes, focus returns to trigger                        |
| Nested submenu keyboard operation  | ArrowRight opens both submenu levels; selecting Personal email closes the menu chain and restores trigger focus |
| Custom submenu indicators          | Hover opens More options and Email; Personal email is selectable                                                |
| Disabled item                      | `aria-disabled` is exposed; Enter cannot activate the disabled Delete file or dismiss the menu                  |
| Controlled checkbox state          | Italic can be added and Bold removed; displayed selection updates                                               |
| Single selection                   | Banana becomes checked, Apple becomes unchecked, and the selection survives reopening                           |
| Section-level selection            | Underline and Center update independently while Bold remains checked                                            |
| Long press                         | A short pointer click does not open; a held pointer opens; keyboard opening remains available                   |
| Controlled open state              | Status changes to open and back to closed after Escape                                                          |
| Invitation action                  | Dismiss removes the invitation                                                                                  |
| Promise upload                     | Loading spinner is replaced by the settled indicator and the filename/size success message                      |
| Promise rejection                  | Creating event becomes the actual network error with danger tone                                                |
| Manual loading error               | Saving changes becomes Failed to save with its description and no loading spinner                               |
| Persistent callback toast          | Closing appends the original message to history; Clear restores the empty state                                 |
| Queue capacity                     | A third notification exceeds limit 2; dismissing a visible toast promotes the limited item                      |
| Multiple-selection keyboard policy | Space selects and keeps the menu open; Enter selects and closes                                                 |

Single selection explicitly closes on click. Multiple selection keeps pointer
and Space operation open but closes on Enter, matching the source behavior.
Unchecked indicators remain mounted and hidden so selection does not shift
labels. Action labels are separated from description/shortcut accessible
descriptions, and source text values are preserved for keyboard matching.

Base UI permits keyboard focus on disabled items. The disabled check proves
activation blocking, **not** a claim that disabled items are skipped.

## Static checks

- Strict shared oxlint: zero warnings/errors across the 28 demos and two helpers.
- Shared oxfmt: the same 30 TSX files pass.
- Source path/export parser check: 17/17 Dropdown and 11/11 Toast matched.
- A local React Doctor scan reported no errors. Its source-subtree duplication
  warnings concern the intentionally distinct custom-indicator and disabled-item
  scenarios and their source siblings. They were not collapsed into generic
  aliases. The callback history key was made stable while retaining
  its original displayed content, timestamps, last-five limit and entrance timing.

## Outstanding acceptance

The original worker snapshot was blocked by the missing expansion contract.
Landing integration now maps this example's `expanded` setting to
`Toast.Viewport.alwaysExpanded`. It preserves Base UI's native hover/focus
state and applies a separate layout marker; it does not fake hover or replace
the native `data-expanded` state.

Two persisted Chromium regressions verify expanded geometry/content without
hover, the ordinary collapsed layout, and native hover-state transitions in
both modes. The full workspace check passes. A production docs replay also
passes 480 mount/semantic checks across the eight date/calendar/menu/toast
families, including the eleven Toast scenarios in four environment modes.
That replay does not repeat the original 208 action activations or establish
upstream pixel parity.

The browser evidence above is not a full pixel-diff against a running upstream
application, an exhaustive RTL/reduced-motion audit, or an AA contrast claim.
It does not prove the final Next documentation shell's registry or routing;
those are parent-owned integration checks.
