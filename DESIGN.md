# Source reconstruction

The visual reference is HeroUI **v3.2.6**, commit
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
- `apps/docs/content`: preserved upstream reference content and authored Lenso
  documentation, kept separate.
- `apps/docs/src`: the Lenso documentation application.
- `packages/docs`: content-only documentation compilation, shell and CLI.
- `packages/create-docs`: the content-project initializer.
- `apps/docs-starter`: an independent consumer of the documentation framework.

## Lenso product identity

Lenso owns its release versions, public names, installation instructions and
component contracts. HeroUI's pinned version records provenance; it is not a
Lenso version or a promise of API compatibility. The next UI/tokens candidate
is `0.9.0`. `Menu` replaces the public `Dropdown` name without a compatibility
export.

Published documentation describes actual Lenso exports, native interaction
contracts and supported build integrations. Upstream v2-to-v3 migration pages
are reference archives, not published Lenso pages. Navigation, search, copied
Markdown and tooling must use the same authored Lenso content.

Docs, CLI, MCP and skills consume one versioned contract generated from current
components, types and runnable examples. Do not maintain independent component
inventories or revive the removed DTCG catalog. Design policy starts as an
internal module; it complements oxlint and browser proof rather than duplicating
them or banning supported caller styles.

Keep applicable original copyright notices and concise modification notices on
derived files, with license copies and third-party attribution included in
distributions. Public documentation need not repeat upstream URLs or display a
derivation banner on every page. Provenance stays auditable without being the
product's user-facing identity.

Keep source typography, geometry, themes, shadows, state feedback and motion.
Use original OKLCH values and live `color-mix`; the previous DTCG-to-sRGB
generation graph is not retained. Theme CSS exposes the upstream public
variable names. Component styling is compiled StyleX, not a Tailwind facade.

## Interaction boundary

Base UI owns ordinary controls, navigation and overlays. Preserve its native
props, state attributes, refs, render composition and style callbacks.
React Aria Components owns date, time and color models, including supporting
parts that depend on those contexts. Native HTML owns noninteractive structure.

The documentation shell is an explicit exception: use Fumadocs UI and core
directly, including their native interactions and supplied CSS, with local
presentation overrides like the pinned reference. Do not maintain copies of
Fumadocs behavior merely to force the docs shell through Base UI. This exception
does not change the component library's Base UI and StyleX contracts. Static
deployment, authored Lenso content and exact Markdown copying remain required.

The standalone documentation framework uses the same Fumadocs exception. Its
content model owns route identities, navigation, headings, search and exact
Markdown exports. Lenso-specific API-reference and Demo generation stay in
`apps/docs`; they are not requirements of a generic consumer. The framework's
`presentation/` owns the extracted StyleX maps, Tabs, syntax highlighter and
responsive TOC; its assets own the same licensed Inter font. Consumers use that
compiled presentation without an application-source dependency. Ordinary
controls keep the source's native Base UI contracts; Fumadocs retains
navigation, search and heading observation. Product-specific release,
Theme Builder and language controls are not invented for generic sites.
All English and Chinese documentation pages consume the framework's source
lookup/navigation, compilation, site layout, search and article renderer.
The application supplies product routing, release/language/theme controls,
component-reference links, native API transforms, Demo registration and source
actions. These are explicit adapters and slots, not independent copies of the
generic frame or compiler. Product page components remain application-owned and
are mounted through explicit CLI route declarations; the CLI owns the Next host.
The shared document kinds are docs, component and api; executable customization
modules are trusted source and stay separate from serializable site config.
Package publication remains separately authorized.

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
