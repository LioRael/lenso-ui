# Pinned Storybook coverage

Authority: HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.

The actual upstream `packages/react/src/components/` inventory contains **68
story files and 583 named scenarios**. The rebuilt package's 84 component
families are not the upstream story inventory. Supporting compound parts
do not necessarily have standalone upstream stories.

## Reviewed source adaptations

Every name below is an actual upstream export, not an invented variant matrix.
Source links point to the pinned file. Definitions retain upstream scenario
content, controls and explicit sample values, with native interaction props,
native labels and compiled StyleX geometry.

| Source file                                                                                                                                                                     | Adapted upstream exports                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [input](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/input/input.stories.tsx)                               | Default, Variants, FullWidth, OnSurfaces                         |
| [meter](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/meter/meter.stories.tsx)                               | Default, Sizes, Colors, CustomValue, WithoutLabel                |
| [progress-bar](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/progress-bar/progress-bar.stories.tsx)          | Default, Sizes, Colors, Indeterminate, CustomValue, WithoutLabel |
| [progress-circle](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/progress-circle/progress-circle.stories.tsx) | Default, Sizes, Colors, Indeterminate, WithLabel                 |
| [skeleton](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/skeleton/skeleton.stories.tsx)                      | Default, Grid, SingleShimmer                                     |
| [spinner](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/spinner/spinner.stories.tsx)                         | Default, Colors, Sizes                                           |
| [textarea](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/textarea/textarea.stories.tsx)                      | Default, Variants, FullWidth                                     |

Additional complete source files, linked to their local adaptations:

- [Alert](stories/alert.stories.tsx): Default.
- [Avatar](stories/avatar.stories.tsx): Default, WithDelay, WithColors, Fallback, Sizes, Variants.
- [AvatarGroup](stories/avatar-group.stories.tsx): Default, Sizes, Colors, Variants, Max, WithCount, Grid, OverlapPlayground.
- [Badge](stories/badge.stories.tsx): Default, Sizes, Colors, WithContent, Placements, Variants, DotBadge.
- [Card](stories/card.stories.tsx): Default, Variants, Horizontal, WithAvatar, WithImages, WithForm.
- [Chip](stories/chip.stories.tsx): Default, Sizes, WithIcon, Statuses, Variants.
- [Fieldset](stories/fieldset.stories.tsx): Default.
- [InputGroup](stories/input-group.stories.tsx): Default, Variants, FullWidth, WithPrefixIcon, WithSuffixIcon, WithPrefixAndSuffix, WithTextPrefix, WithTextSuffix, WithIconPrefixAndTextSuffix, WithCopySuffix, WithIconPrefixAndCopySuffix, PasswordWithToggle, WithLoadingSuffix, WithKeyboardShortcut, WithBadgeSuffix, Required, Invalid, Disabled, WithTextArea, AllVariations.
- [Kbd](stories/kbd.stories.tsx): Default, WithSingleKey, WithMultipleKeys, KeyCombinations, LightVariant, NavigationKeys, SpecialKeys, ComplexShortcuts, InlineUsage, CustomContent.
- [ScrollShadow](stories/scroll-shadow.stories.tsx): Default, Variants, Orientation, HideScrollBar, CustomSize, VisibilityChange, WithCard.
- [Separator](stories/separator.stories.tsx): Default, Vertical, WithContent, Variants.
- [Surface](stories/surface.stories.tsx): Variants.
- [TextField](stories/textfield.stories.tsx): Default, FullWidth, WithTextArea, Required, WithDescription, Invalid, Disabled, InputTypes, Controlled, WithValidation.
- [Typography](stories/typography.stories.tsx): Default, HeadingScale, BodySizes, InlineCode, Alignment, WeightScale, MutedColor, Truncation, ArticleExample, ProseBlock, CompoundPrimitives.

These **21 source files account for 126 upstream scenarios**, with no omitted
advanced exports in those files. Card.WithImages, AvatarGroup.OverlapPlayground,
InputGroup.WithTextArea and the controlled/validation examples are distinct
source compositions and workflows, not aliases for their family's Default.

Six additional action files are now reviewed, contributing **42 scenarios**:
Button (9), ButtonGroup (8), CloseButton (3), ToggleButton (7),
ToggleButtonGroup (11), and Toolbar (4). Exact names, pinned source hashes,
native adaptations and verification limits are recorded in
[ACTIONS-EVIDENCE.md](stories/ACTIONS-EVIDENCE.md#reviewed-exports).

Navigation adds **41 scenarios** across Accordion (4), Breadcrumbs (5),
Disclosure (5), DisclosureGroup (3), Link (4), Pagination (8), and Tabs (12).
[Navigation evidence](NAVIGATION-EVIDENCE.md) records exact exports and the
remaining styled-render composition limitation.

Choices add **50 scenarios** across Checkbox (13), CheckboxGroup (6),
RadioGroup (10), Switch (14), SwitchGroup (3), and Slider (4).
[Choice evidence](CHOICE-EVIDENCE.md) separates these source adaptations from
nine retained local development states.

Overlays add **42 scenarios** across AlertDialog (13), Drawer (8), Modal (13),
Popover (5), and Tooltip (3). [Overlay evidence](OVERLAY-EVIDENCE.md) records
native dismissal-policy differences as well as actual popup verification.

Menus and toasts add **27 scenarios** across Menu (16, adapted from upstream Dropdown) and Toast (11).
[Menu/toast evidence](MENU-TOAST-EVIDENCE.md) records genuine long-press
handling, queue/timer behavior and the native F6 focus shortcut difference.

Selection adds **64 scenarios** across Select (17), ComboBox (19),
Autocomplete (21), and ListBox (7). [Selection evidence](SELECTION-EVIDENCE.md)
records genuine custom-value commits, async filtering and virtualization.

Form workflows add **35 scenarios** across SearchField (12), NumberField (14),
and InputOTP (9). [Form evidence](FORM-WORKFLOW-EVIDENCE.md) records native
clipboard, validation, locale and submission workflows, and the separate
shared invalid-outline fidelity gap.

Collections add **19 scenarios** across Table (9) and TagGroup (10).
[Collection evidence](COLLECTION-EVIDENCE.md) records native resizing,
1,000-row virtualization, loading, expansion, selection and removal.

Calendars add **46 scenarios** across Calendar (26) and RangeCalendar (20).
[Calendar evidence](CALENDAR-EVIDENCE.md) records native selection, constraints,
year/cell composition and Hindi/Indian locale verification with a single
physical model/provider dependency root.

Date/time adds **40 scenarios** across DateField (15), TimeField (13),
DatePicker (6), and DateRangePicker (6). [Date/time evidence](DATE-TIME-EVIDENCE.md)
records actual segment, form, locale, picker and range workflows.

Colors add **51 scenarios** across ColorArea (6), ColorField (13),
ColorPicker (5), ColorSlider (9), ColorSwatchPicker (10), and ColorSwatch (8).
[Color evidence](COLOR-EVIDENCE.md) records native models, alpha/channel editing,
validation and modal portal containment.

**583 reviewed adaptations across all 68 pinned source files; no source
scenario is absent from this inventory. This is not full visual or behavioral
parity certification.** Run `node packages/storybook/source-inventory.mjs`
from the repository root to obtain every exact upstream name, pinned source
link, adaptation and remaining scenario, or add `--json` for the explicit
filename-to-source-export contract. The source file list was captured from the
actual pinned recursive tree and is stored in `pinned-story-files.json`;
source exports are fetched from the immutable raw files. Fetching is bounded
and retried. An optional directory argument requires all 68 previously fetched
pinned `.stories.tsx` files; a partial cache fails instead of hiding coverage.
No fetched source is imported or saved into the application.

JSON statuses are `unimplemented` or `adapted-unverified`. The latter means
source adaptation was reviewed, not that visual or full interaction parity
has been accepted. Browser evidence is recorded separately below.

The old four-state Button matrix has been replaced by its nine reviewed source
scenarios. Checkbox and Switch now contain reviewed source adaptations and nine
separately named local development probes. Those local probes are not included
in source-adaptation counts.
All pinned source files now have reviewed adaptations. No Next-based documentation
registry or unadapted React Aria/Tailwind source is imported.

## Native adaptation differences

- Base UI meter/progress bounds use `min`/`max`, formatting uses `format`,
  and indeterminate progress uses `value={null}`.
- Meter and progress use their native contextual labels instead of a generic
  field label. The external progress-circle caption remains a native span.
- Input and textarea examples add accessible names to upstream placeholder-only
  controls.
- TextField control props move to the actual Input/TextArea. Manual invalid
  examples use native `FieldError match`; native validity-based examples retain
  the normal Field.Error lifecycle.
- Avatar fallback uses native `delay`, not upstream `delayMs`. Choice headings
  in the overlap playground label their groups via `aria-labelledby`; they do
  not leak a Field.Root label onto every checkbox/radio.
- Tooltip examples use explicit native Trigger/Portal/Positioner/Popup parts.
  Source `isPending` and `onPress` become native loading and click behavior.
- Typography prose and source presentation-only action buttons remain fixture
  content. They are not claims about Lenso architecture or implemented product
  workflows. Copy buttons without source handlers are not clipboard proof.
- ScrollShadow.Variants retains both upstream labels; the actual pinned source
  renders the same default ScrollShadow for both, without requesting a blur API.
- Source Gravity UI vectors use native SVG, with their MIT license preserved
  in `GRAVITY-ICONS-LICENSE.txt`.
- SingleShimmer uses the local Skeleton parent synchronization contract,
  replacing the upstream CSS descendant class. Animation/visual equivalence
  has not been compared side by side.
- Consumer StyleX uses `dev: false`, no CSS layers and Lightning CSS exclusion
  `4`, matching the package compiler. The theme toolbar sets native
  `data-theme`; no Tailwind runtime is involved.

## Recorded evidence

Against read-only installed package dependencies in a scratch validation
checkout:

- Storybook production build: passed.
- Storybook TypeScript check: passed.
- Standard oxlint configuration, `--deny-warnings`: passed.
- Standard oxfmt check for stories and validation scripts: passed.
- Chromium iframe smoke: **all 139 local stories mounted in both themes,
  278 mounts, no unexpected errors**. This includes the 126 source adaptations
  and the 13 unclaimed legacy development states.
- The complete run used `--replay-source-assets`: genuine source image bytes
  were fetched read-only from their original public URLs, checked as images,
  cached in memory and logged with SHA-256 hashes. Original DOM `src` props
  remain unchanged. The delayed-image case retains its declared delay.
- The deliberately invalid Avatar.Fallback image produced two expected failed
  requests, one per theme. The exception is scoped to that exact story and
  source URL, and the resulting `NA` fallback is asserted visible.
- Live-network runs encountered intermittent CDN connection closures. Asset
  replay provides deterministic component proof, not live-network availability
  or a pinned binary-image parity claim.
- Mounted prop assertions: custom meter value `750`, maximum `1000`, formatted
  output; indeterminate circular progress has no `aria-valuenow`; input and
  textarea variant examples each contain two actual controls.
- Mounted StyleX geometry assertions: spinner size widths strictly increase;
  the full-width input exceeds 350px in the upstream 400px container.
- Actual workflow assertions: TextField controlled character counts and
  invalid-to-valid error transitions; InputGroup password reveal/hide and
  pending submission clearing; AvatarGroup clip/optical controls; ScrollShadow
  visibility callback after scrolling to the end.

`iframe-smoke.mjs` reproduces these checks against a production build. It
requires an explicitly supplied installed Playwright module path; it does
not add or download dependencies.

The separate action runner recorded **84 light/dark iframe mounts** for its
42 scenarios after fresh styles/UI builds, strict Storybook TypeScript and a
production Storybook build. It also exercised loading activation blocking,
disabled overrides, toggle selection, dropdown actions and toolbar navigation.
These results do not extend the earlier 278-mount shared-runner result to the
new files. See [action evidence](stories/ACTIONS-EVIDENCE.md#verification-performed)
and `stories/actions-smoke.fixtures.mjs` for the actual scope and rerun command.

Navigation recorded **82 light/dark iframe mounts** and choices recorded
**100 light/dark iframe mounts**, each after fresh production builds and strict
TypeScript checks. Their scoped runners additionally exercise native keyboard,
controlled-state and geometry workflows. The choice RTL consumer covers
Slider Default/Range in both themes. These separate runs are not a consolidated
whole-Storybook smoke result or full upstream visual acceptance.

The overlay runner recorded **84 light/dark story combinations and 154 actual
popup openings**, including variants within a story. It verified closing and
focus return, controlled state, explicit dismissal policies, custom portals,
mobile forms/internal scrolling and motion. Ordinary AlertDialog default
Escape behavior remains native and is not claimed equivalent to upstream.

The menu/toast runner recorded **54 active light/dark iframe mounts** with
every menu opened and every toast case enqueued. It exercised keyboard,
selection, disabled items, nested submenus, pointer-hold cancellation,
promises, actions, queue limits, placements and permanent expansion.
Native toast viewport focus uses F6 rather than upstream's configurable Alt+T.

The selection runner recorded **128 production iframe mounts and 126 enabled
popup openings** in both themes, plus 31 focused checks for keyboard removal,
controlled values/open state, query clearing, required FormData, custom-value
commits, async cursor/race handling, offscreen virtualization, mobile anchoring
and ancestor opacity. Exhaustive RTL, reduced-motion, screen-reader and upstream
screenshot parity remain unverified for this batch.

The form runner recorded **70 desktop and 70 mobile light/dark mounts**.
Clipboard filtering, truncation, FormData, validation, pending/reset, locale
parsing, refs, keyboard steps, bounds and disabled constraints passed.
SearchField/NumberField invalid-state propagation works. The initially missing
unfocused danger outline has since been repaired in the shared group styles:
19 focused regressions verify unfocused outlines, focused danger rings,
state recovery and ancestor isolation. The original form evidence retains
the before-fix measurements rather than rewriting that historical result.

The collection runner recorded **38 production iframe workflows and 18 mobile
table geometry checks**, including reachable last columns. The repaired custom
resizer label is exercised by name. Native row-header markup and a documented
consumer/precompiled StyleX specificity collision remain fidelity limits, not
claims of upstream pixel parity or complete accessibility certification.

The calendar runner recorded **92 light/dark production mounts and 17 assertion
groups**, including date/range keyboard selection, controlled navigation,
unavailable/min/max dates, validation, year/cell rendering, Hindi/Indian era,
day/week controls and mobile scrolling. Fixed versus ambient dates are
distinguished; exhaustive RTL and upstream visual parity are not certified.

The date/time runner recorded **80 light/dark mounts and 20 enabled picker
openings**. The color runner recorded **102 light/dark mounts** and pointer,
keyboard, model/channel, form, picker, modal containment and selected
RTL/reduced-motion checks. The initially measured contextual label feedback
gap has since received a shared-style correction and focused date/time,
picker-alias and color-label regressions; historical batch evidence is retained.

Mounting, semantic attributes and these specific workflow/geometry assertions do not
prove upstream visual parity, controls-panel interaction, comprehensive keyboard behavior,
RTL, responsive layout, reduced motion or animation parity. Those acceptance
dimensions remain unrecorded.
