# Pinned Storybook coverage

Authority: HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.

The actual upstream `packages/react/src/components/` inventory contains **68
story files and 583 named scenarios**. The rebuilt package's 85 component
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

**126 reviewed adaptations; 457 upstream scenarios remain unadapted. This is
not reconstruction completion.** Run `node packages/storybook/source-inventory.mjs`
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

Existing Button (4), Checkbox (4) and Switch (5) local states are useful
development probes, but are not counted as source adaptations merely because
some names match upstream. Their advanced source scenarios remain uncovered.
All other upstream story files remain unadapted. No Next-based documentation
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

Mounting, semantic attributes and these specific workflow/geometry assertions do not
prove upstream visual parity, controls-panel interaction, comprehensive keyboard behavior,
RTL, responsive layout, reduced motion or animation parity. Those acceptance
dimensions remain unrecorded.
