# @lenso/tokens

Generated primitive and semantic tokens for Lenso UI. `@lenso/tokens@0.2.0` publishes the resolved semantic token contract used by the package and registry channels.

The DTCG `src/foundation.json`, `src/semantic.json`, `src/themes/*.json`, and `src/lenso.resolver.json` documents are authoritative. Generated TypeScript, StyleX, CSS, manifests, and contract artifacts under `src/` must not be edited directly.

Semantic tokens remain the recommended choice for product UI and theme-aware components. Public color primitives are available for custom composition and precise palette control; consumers that bind primitives directly own their Light/Dark behavior.

## Consumer usage

Import the generated CSS once in the application shell:

```tsx
import "@lenso/tokens/styles.css";
```

The package also exports:

- `@lenso/tokens`: semantic token names, theme values, and related TypeScript types.
- `@lenso/tokens/tokens.stylex`: generated StyleX variables for source-owned components.
- `@lenso/tokens/contract.json`: public semantic contract metadata.
- `@lenso/tokens/figma-map.json`: token-to-Figma mapping metadata.
- `@lenso/tokens/consumer-theme`: a copyable adapter for Consumer-owned theme values.
- `@lenso/tokens/tokens.json`: resolved DTCG output.

Public CSS properties use complete, unbranded semantic paths such as `--color-surface-canvas` and `--space-4`. Consumers can override these properties within a `ThemeScope` without taking ownership of the primitive token graph.

## Source of truth

The authoritative inputs are `src/foundation.json`, `src/semantic.json`, `src/themes/light.json`, `src/themes/dark.json`, and `src/lenso.resolver.json`. The generated TypeScript, CSS, manifests, and StyleX bridges under `src/` are not hand-edited.

From the repository root, regenerate and verify the complete graph with:

```bash
pnpm generate
pnpm --filter @lenso/token-generator check-generated
```

The package is part of the Changesets fixed group with `@lenso/ui` and `@lenso/primitives`.
