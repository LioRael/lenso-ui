# Toast visual correction

## Reference and scope

The reference is HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`:

- [Toast styles](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/toast.css)
- [Toast layout and composition](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/toast/toast.tsx)
- [Default width and spacing](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/toast/constants.ts)

This corrects Lenso's toast presentation, not its queue owner. Base UI continues
to own hover/focus expansion, height measurement, timers, dismissal and focus.
No changes are made to primitives or global theme tokens.

The visual direction remains the pinned source: compact notification surfaces,
semantic status colors, a scaled collapsed stack and readable separated cards
on expansion. Shadows identify the notification overlay, not decorative cards;
status icons distinguish message types. The newest toast is the focal point.
The 12px expanded gaps separate messages without interrupting pointer traversal.
For the scoped anti-template review, the direction is ENERGY 1 / RHYTHM 1 /
MOTION 1: restrained notification feedback, not new page choreography.

## Corrections

| Area                      | Previous behavior                                           | Corrected rule                                                                                      |
| ------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Hover/permanent expansion | Cards touched, with 0px gaps                                | Native accumulated heights plus 12px per preceding toast                                            |
| Collapsed rear content    | Sibling action remained visible; indicator snapped          | Content, indicator and action share the 200ms opacity transition                                    |
| Desktop default width     | 356px                                                       | 460px; caller `--toast-width` still overrides                                                       |
| Description               | Inherited 21px leading in the default theme                 | Explicit 14px type with 20px leading                                                                |
| Close control             | Uncentered caller glyph and incomplete shared styling       | Shared close-button presentation with a default 12px desktop / 14px mobile glyph                    |
| Close surface             | Desktop hover-capable media branch suppressed overlay color | Overlay at desktop sizes; default surface when the close itself is hovered                          |
| Close interaction         | Invisible/ending controls could remain pointer targets      | Reveal only for active front/expanded hover or focus; suppress interaction during exit and limiting |

### Consumer migration

No queue or placement API migration is required. Existing children, native
props, refs, `render`, style callbacks and last-applied `xstyle` remain supported.
Omit `Toast.Close` children to use the responsive default glyph; explicitly
provided children are left unchanged.

Consumers compensating for the previous default width or missing expanded gap
should remove those compensations. The desktop viewport retains Lenso's fixed
width model because absolutely positioned Base UI roots do not establish its
intrinsic width; this is not a new minimum-width API.

A custom close control that is deliberately always visible must override both
`opacity` and `pointerEvents` in its `xstyle`. The custom docs and Storybook
examples do this. Keyboard focus still reveals the ordinary close control.

## Evidence boundary

The expanded-gap browser reproduction failed with `[0, 0]` and passed with
`[12, 12]`. Existing coverage checked non-overlap, which admitted touching cards;
the maintained component and production checks now require the actual 12px gap.
The dismissal check also reproduced `pointer-events: auto` during native exit
before the reveal selectors excluded ending states.

Production Storybook checks exercise both themes, all six placements,
different message heights, collapsed content, close-icon geometry and surface,
cross-gap hovering, dismissal, permanent expansion and F6 entry. The 390px
check covers bounds, responsive close-icon size and reduced motion. Component
regressions additionally cover native queue behavior and logical RTL placement.

The production docs toast page has scoped live-example mount coverage:
88 mounts across English/Chinese, light/dark and 1440px/390px viewports, with
no missing toast examples or reported failures. This is mount/semantics/overflow
evidence, not a claim that every docs example action was exercised.

Rendered comparison used the published `@heroui/styles@3.2.6` compiled CSS
with matching toast content and source classes, alongside the production Lenso
iframe. The reference is static anatomy with explicit source layout offsets,
not a live upstream React queue or a pixel-exact animation comparison.
Temporary screenshots are review aids, not committed golden snapshots.

The scoped anti-template checks preserve the source's hierarchy, typography,
semantic palette, intentional overlay shadow and reduced-motion behavior;
no new copy, assets, decorative effects or fictitious claims were introduced.
Source-exact colors retain the contrast limitations recorded in `DESIGN.md`;
this change does not claim WCAG AA compliance or exhaustive HeroUI parity.
