# Lenso UI Package Contract

## Outcome

Build an independent, public React design system for Lenso products and community applications. Lenso Console becomes a real downstream Consumer but does not define the library's product boundary.

The contract keeps one canonical source for both a managed npm package and
editable shadcn-compatible registry source while preserving the same component
API, visual contract, semantic themes, and Release Snapshot.

Package manifests, generated release artifacts, and release notes identify what
is published. This document defines the durable product and distribution
constraints without duplicating a current version or an internal completion
checklist.

## Public surfaces

```text
@lenso/ui          styled Foundation Components
@lenso/primitives  Lenso-owned headless Product Primitives
@lenso/tokens      DTCG source-derived semantic contract and artifacts
@lenso/fonts       reserved; public release deferred until provenance assets exist
@lenso registry    editable components, primitives, setup items, and Recipes
```

`@lenso/ui` depends on `@lenso/primitives` for the styled `Sidebar` adapter; the dependency remains one-way and the primitives package never depends on the styled UI package. Registry Recipes may compose either public surface. The MVP does not publish `@lenso/icons`; necessary defaults use exact `lucide-react` imports and every built-in icon remains replaceable through a `ReactNode` slot. See ADR-0034 for the Sidebar boundary.

## Repository shape

```text
apps/
  docs/

packages/
  ui/
  primitives/
  tokens/
  fonts/

registry/
  components/
  recipes/
  setup/

tooling/
  token-generator/
  registry-builder/
```

Framework installation projects are generated in temporary CI directories and are not retained as fixtures.

## Sources of truth

- Repository DTCG 2025.10 Format and Resolver JSON is the token authority.
- One deterministic resolved IR generates StyleX variables and themes, public CSS custom properties, TypeScript types, DTCG and CSS manifests, the Consumer adapter template, and the Figma mapping manifest.
- Figma is the canonical visual approval surface, not a writable token authority.
- Each code component maps to one Canonical Design Component by file key and node ID.
- One component implementation generates both npm and registry artifacts.

Public CSS custom properties are unbranded complete semantic paths such as `--color-surface-canvas`; short global names such as `--background` are prohibited. Primitive values and component-to-token mapping remain private.

## Runtime and API contract

- React 19 and ESM.
- Thin styled wrappers preserve Base UI composition and props as fully as practical.
- Named subpath exports only; no default exports and no all-components root barrel.
- Base UI state attributes remain intact. Lenso-owned structure uses `data-slot`, `data-variant`, and `data-size` only where needed.
- `className`, `style`, callbacks, refs, and Part props are forwarded; semantic variables are the durable package customization interface.
- Package Consumers requiring structural changes use the Registry channel and own the installed source.
- No mandatory global `LensoProvider`; Theme Scope, CSP, and component-domain providers remain independently composable.

## Theme and portal contract

- Complete Light and Dark default Themes.
- Complete custom Theme definitions fail generation when a semantic value is missing.
- Nested `overrides` may be partial and inherit from the nearest Theme Scope.
- A Portal honors an explicit Consumer container; otherwise it uses the nearest Theme Scope host and finally `document.body`.
- Console retains ownership of appearance persistence, system-mode resolution, assets, and product Theme Bundles.
- An optional narrow preflight stylesheet contains only documented overlay and platform host rules; no reset or font assets enter `@lenso/ui/styles.css`.

## Baseline product surface

1. Token generator, default themes, manifests, and StyleX/CSS output.
2. Button.
3. Text Field.
4. Dialog, including Portal, Theme Scope, CSP, keyboard, and focus behavior.
5. Sidebar Product Primitive, its styled `@lenso/ui/sidebar` adapter, and one styled Registry Recipe, including nested and simultaneous left/right sidebars.
6. Package and registry artifacts from the same canonical sources.
7. Next App Router documentation and Component Lab consumption.
8. Package export validation and shadcn Registry schema validation.

New Foundation Components must preserve the same package, Registry, theme, and
composition contracts.

## Styling, motion, and documentation

- StyleX is the styling system; package Consumers import one precompiled CSS asset.
- CSS handles ordinary interaction states, keyframes, and simple expansion.
- Motion is an optional bounded peer only for visual behaviors requiring layout measurement, shared layout, drag, velocity springs, complex presence, or sequencing.
- `@lenso/primitives` never depends on Motion or default CSS.
- The Next documentation product is also the Component Lab; Storybook and Ladle are not added.
- DialKit provides development-only parameter and timeline authoring. Approved values are committed into source and DialKit never enters public runtime artifacts.

## Toolchain

- Node 24 LTS and exact pnpm 11.5.
- Turborepo task orchestration.
- tsdown package builds, subject to real packed-artifact proof for StyleX CSS, ESM subpaths, declarations, client directives, and externalized peers.
- TypeScript 7 strict declarations.
- Oxfmt and Oxlint.
- Vitest 4 Node and Browser Mode with the Playwright provider.
- One root `pnpm check` entry point.

## Quality and accessibility

- Lenso UI is designed and tested to support applications conforming to WCAG 2.2 Level AA; it does not claim a component library alone makes an application conformant.
- Automated accessibility and keyboard behavior are release gates.
- Complex components receive periodic VoiceOver with Safari and NVDA with Chromium validation.
- Each component receives one curated Figma-approved Light/Dark state board rather than a Cartesian screenshot matrix.
- All production motion honors reduced-motion preferences.

## Distribution and releases

- Changesets releases all public packages as one fixed group and generates the matching Registry Snapshot.
- npm publication runs only through GitHub Actions Trusted Publishing with OIDC and provenance.
- `https://ui.lenso.dev/r/{name}.json` resolves current stable registry items.
- `https://ui.lenso.dev/r/v/{version}/{name}.json` is immutable.
- Public code, examples, and registry source use MIT; brands and third-party assets retain separate rights and notices.
- Public APIs, semantic tokens, registry item names, and material visual contracts follow SemVer.
