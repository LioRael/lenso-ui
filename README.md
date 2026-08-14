# Lenso UI

Lenso UI is an independent React design system for Lenso products and community applications. It combines Base UI behavior, StyleX styling, DTCG design tokens, managed npm packages, and editable shadcn-compatible registry source.

The project is experimental and starts at `0.1.x`. Public APIs, semantic tokens, registry item names, and material visual contracts follow SemVer, but the component set is intentionally small while the first vertical slice is validated.

## Install from packages

Use the package channel when you want managed upgrades and the stable component structure:

```bash
pnpm add @lenso/ui @lenso/tokens @base-ui/react react react-dom
```

Import the token and component CSS once in your application shell, then import components through named subpaths:

```tsx
import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import { Button } from "@lenso/ui/button";

export function SaveButton() {
  return <Button>Save</Button>;
}
```

`@lenso/ui/preflight.css` is optional. It contains narrowly scoped platform and overlay host rules, not a reset or font assets.

## Install editable registry source

Use the registry channel when you want to own and structurally change the installed source:

```bash
pnpm dlx shadcn@latest add https://ui.lenso.dev/r/button.json
```

Install the generated theme contract and import it once in the application shell:

```bash
pnpm add @lenso/tokens
```

```tsx
import "@lenso/tokens/styles.css";
```

Stable URLs resolve the current release. Immutable snapshots use `https://ui.lenso.dev/r/v/0.1.0/{name}.json`. Registry installations are Consumer-owned copies; package installations remain managed dependencies. Both channels are generated from the same canonical source and recorded in `registry/parity-manifest.json`.

## Themes

Light and dark themes are complete defaults. A `ThemeScope` can theme any subtree, including portalled Dialog content:

```tsx
import { ThemeScope } from "@lenso/ui/theme-scope";

<ThemeScope theme="dark">
  <App />
</ThemeScope>;
```

Consumers can override public, unbranded semantic properties such as `--color-surface-canvas` on a scope. Product applications retain ownership of preference persistence, system-mode resolution, and theme selection.

## Strict CSP

`CSPProvider` forwards Base UI's strict-CSP contract. Generate a unique nonce per server request, include it in `script-src` and `style-src-elem`, and pass the same value to the provider. If the product supplies the required external component styles itself, `disableStyleElements` prevents Base UI from creating inline style elements. It does not remove inline `style` attributes; those are governed separately by `style-src-attr`.

```tsx
import { CSPProvider } from "@lenso/ui/csp-provider";

<CSPProvider nonce={requestNonce}>
  <App />
</CSPProvider>;
```

## Replace built-in icons

Built-in Lucide icons are defaults rather than identity. Every component control that supplies one exposes a `ReactNode` slot:

```tsx
<Dialog.Close icon={<MyCloseIcon aria-hidden />} />
<Button loadingIndicator={<MySpinner aria-hidden />}>Save</Button>
```

## Packages

- `@lenso/ui`: styled Foundation Components with precompiled StyleX CSS.
- `@lenso/primitives`: headless, style-free Product Primitives such as Sidebar.
- `@lenso/tokens`: DTCG-derived CSS, StyleX, TypeScript, and manifest artifacts.
- `@lenso/fonts`: reserved optional font integration boundary; deferred from the 0.1 public release until its provenance bundle is complete.
- Registry Recipes: editable product-grade compositions, including the styled Sidebar Recipe.

## Development

Node 24 and pnpm 11.5 are pinned by the repository.

```bash
pnpm install
pnpm check
pnpm smoke
pnpm dev
```

`pnpm smoke` packs the public packages and builds fresh temporary Next and Vite consumers. No framework fixtures are retained in the repository.

Architecture decisions live in `docs/adr`, and the current delivery contract is defined in `MVP.md`.
