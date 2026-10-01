# Source reconstruction

The visual and structural authority is HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, from
https://github.com/heroui-inc/heroui.

This is a wholesale replacement. Only the existing `packages/primitives`
package is retained. Old Lenso tokens, UI adapters, compatibility aliases,
registry, generators, Console templates and documentation shell are removed.

## Source structure

- `packages/styles`: HeroUI themes and per-component StyleX style maps.
- `packages/react`: React components, with corresponding component directories.
- `packages/standard`: shared oxlint/oxfmt conventions.
- `packages/testing`: browser proof infrastructure.
- `packages/storybook`: component development surface.
- `apps/docs/content` and `apps/docs/src`: upstream documentation architecture
  and its implementation.

Keep source typography, geometry, themes, shadows, state feedback and motion.
Use original OKLCH values and live `color-mix`; the previous DTCG-to-sRGB
generation graph is not retained. Theme CSS exposes the upstream public
variable names. Component styling is compiled StyleX, not a Tailwind facade.

## Interaction boundary

Base UI owns ordinary controls, navigation and overlays. Preserve its native
props, state attributes, refs, render composition and style callbacks.
React Aria Components owns date, time and color models, including supporting
parts that depend on those contexts. Native HTML owns noninteractive structure.

Variants are component-specific typed StyleX maps. Concrete components compose
StyleX directly with native Base UI parts; no shared generic component factory
stands between their public props and the native interaction contract.
Use public Base UI `useRender` when a native HTML part needs render/ref composition.
Compose `xstyle` last and keep all `stylex.props` output, including runtime
custom properties. Where a native state-dependent `style` callback coexists with
those properties, merge the callback result without losing either source.
Keep loading actions focusable while blocking activation.

## Acceptance

Check source and reconstruction side by side, including both themes,
responsive geometry, keyboard/focus behavior, overflow, portalled themes,
RTL and reduced motion where applicable.

An exported component is not proof of source parity. A source snippet is not
a live example. Document incomplete behavior or visual coverage explicitly.
Exact upstream colors include known normal-text contrast failures; source
fidelity does not imply WCAG AA compliance.

HeroUI-derived work retains Apache-2.0 notices. Lenso's preserved primitives
retain their original MIT terms.
