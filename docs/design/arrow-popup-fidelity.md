# Arrow and popup visual correction

## Reference

HeroUI v3.2.6 at `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` is the target.
Both exported arrows are 12×12 SVGs with the same curved path. Tooltip adds
the source `border/40` stroke; Popover is fill-only. Neither arrow has its own
shadow, mask or decorative border treatment.

- [Tooltip CSS](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/tooltip.css)
- [Tooltip composition and offsets](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/tooltip/tooltip.tsx)
- [Popover CSS](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/popover.css)
- [Popover composition](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/popover/popover.tsx)

## Cause and corrections

Upstream Tailwind preflight makes SVGs block-level. Lenso's local arrow SVG
was inline, so line-box baseline spacing displaced it within the native
positioning wrapper. The production Tooltip reproduction measured about
3.84px between the wrapper and SVG origins. Rotation moved the same error
onto other axes for the remaining placements.

The two arrow wrappers now use flex layout to remove that baseline spacing.
This is a local adapter correction, not a new global SVG reset. The original
glyph, fill, Tooltip stroke, popup shadows and radii are retained. Default
square glyphs now coincide with the native positioning box in all four
directions. Base UI continues to own collision handling, side state and
cross-axis coordinates.

Logical `inline-start` / `inline-end` sides now use the same native direction
context as positioning. Their edge, rotation and popup entry translation map
to the corresponding physical side in both LTR and RTL. Previously these
native side values fell through to the default bottom-edge arrow styling.

Popup typography is now explicit: Tooltip is 12px/16px, Popover 14px/20px.
Previously the default inherited line-height produced 18px and 21px leading.
Tooltip keeps 8px padding. Popover keeps Lenso's existing 16px Popup padding,
equivalent to the ordinary upstream outer Content plus padded inner Dialog;
this change does not introduce an upstream-compatible Dialog part.

Default Tooltip spacing is 7px when `Tooltip.Arrow` is mounted and 3px without
it. Arrow registration covers conditional children, component wrappers and
content supplied through native `render`, including StrictMode effect replay.
Popover defaults to 8px, matching its pinned React Aria dependency's default.

## Consumer migration

No part, trigger or dismissal API migration is required. Explicit `sideOffset`
values and functions retain native precedence, including `0`. Consumers
compensating for the old arrow baseline error or zero/default spacing should
remove those workarounds or keep an explicit offset when intentional.
Caller children, refs, render composition, style callbacks and last-applied
`xstyle` are preserved.

The Tooltip default follows a mounted `Tooltip.Arrow`; an arbitrary decorative
SVG outside that part does not change the default spacing.

Only Tooltip and Popover have genuine upstream exported Arrow counterparts.
Menu, Select, Toast, ComboBox and Autocomplete expose additional native Base UI
parts. This change neither invents default glyphs for them nor claims upstream
parity for those extensions.

## Evidence boundary

The browser regression first failed on the wrapper/SVG origin mismatch.
A separate render-owned-content regression reproduced the incorrect 3px
default before the registration provider covered the full native subtree.

Maintained browser coverage checks both themes and four physical sides,
surface fill and distinct stroke behavior, popup line heights, arrow geometry,
default and explicit spacing, conditional mounting, StrictMode, native
`render`, forwarded refs and a state-dependent style callback.
Logical-side coverage additionally checks LTR/RTL attachment and the rendered
tip's outward direction.

Production Storybook proof also checks the four arrow directions in both
themes, alongside the existing keyboard, focus return, dismissal, portal,
reduced-motion and mobile overlay scenarios.

Scoped production docs checks cover 96 live mounts for the two families across
English/Chinese, light/dark and 1440px/390px layouts, with no missing examples.
These checks establish mounting, semantics and overflow, not a click-through
of every docs example.

Rendered comparison uses published `@heroui/styles@3.2.6` CSS with the pinned
source classes and matching content. The 16 desktop cases compare popup
dimensions, leading, background, radius and shadow and provide temporary
screenshots of the joins. The reference reproduces source arrow positioning
statically; it is not a live upstream queue/overlay runtime or exhaustive
pixel/animation parity proof. Custom non-square arrow artwork remains caller
owned and is not included in that comparison.

Scoped design checks preserve the source hierarchy, semantic palette and
restrained interaction feedback: ENERGY 1 / RHYTHM 1 / MOTION 1. No extra
assets, gradients, masks, arrow shadows or copy were introduced. Source color
contrast limitations remain as documented in `DESIGN.md`; this is not a WCAG
AA compliance claim.
