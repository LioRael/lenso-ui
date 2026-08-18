# Lenso UI

Lenso UI is an independent React design system for Lenso products and community applications. It combines Base UI behavior, StyleX styling, DTCG design tokens, managed npm packages, and editable shadcn-compatible registry source.

The public package line in this repository is `0.2.0`. The project is still experimental: the package, token, registry, and material visual contracts are public surfaces, while the component inventory and consumer certification continue to grow. Unreleased changesets may be present after the `0.2.0` snapshot.

## Choose a distribution channel

| Channel                              | Use it when                                                   | Ownership after installation           |
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------------- |
| `@lenso/ui` and `@lenso/primitives`  | You want managed upgrades and the published component API     | Lenso UI manages the package source    |
| `https://ui.lenso.dev/r/{name}.json` | You need to edit a component or start from an editable Recipe | The Consumer owns the installed source |

Both channels are generated from the repository sources. The registry parity manifest records the source-to-registry file mapping and hashes.

## Install the managed packages

Use the package channel when you want managed component upgrades and the precompiled StyleX output:

```bash
pnpm add @lenso/ui @lenso/tokens @base-ui/react react react-dom
```

Import the token contract and component CSS once in the application shell. Components are exposed from named subpaths; there is no all-components root barrel:

```tsx
import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import { Button } from "@lenso/ui/button";

export function SaveButton() {
  return <Button>Save</Button>;
}
```

`@lenso/ui/preflight.css` is optional. It contains narrowly scoped platform and overlay-host rules, not a reset and not font assets.

Use `@lenso/primitives/sidebar` directly when you need the headless Sidebar state model without Lenso UI's visual layer:

```bash
pnpm add @lenso/primitives @base-ui/react react
```

The styled `@lenso/ui/sidebar` adapter uses that primitive internally and adds the Lenso UI StyleX contract.

Use `@lenso/primitives/resize-handle` for layout-independent splitter behavior, or `@lenso/ui/resize-handle` for the Linear-inspired visual adapter. Pane layout and persistence remain Consumer-owned.

## Install editable registry source

Use the registry channel when the Consumer needs to own and structurally change the installed source:

```bash
pnpm dlx shadcn@latest add https://ui.lenso.dev/r/setup.json
pnpm dlx shadcn@latest add https://ui.lenso.dev/r/button.json
```

The setup item installs the shared token bridge and its dependencies. The Consumer must configure a compatible StyleX compiler for the application and import the generated token CSS once:

```tsx
import "@lenso/tokens/styles.css";
```

Stable URLs resolve the current generated registry. Immutable release snapshots use a versioned path, for example `https://ui.lenso.dev/r/v/0.2.0/button.json`. A versioned snapshot is never rewritten; the stable alias is the channel for the current registry output.

## Public packages and current surface

- `@lenso/ui@0.2.0`: styled Foundation Components, each available from an explicit family subpath.
- `@lenso/primitives@0.2.0`: headless Product Primitives for Sidebar and Resize Handle behavior.
- `@lenso/tokens@0.2.0`: generated semantic CSS, TypeScript, StyleX, DTCG, contract, and Figma-map artifacts.
- `@lenso/fonts`: private optional font boundary; it is not part of the public fixed release group yet because its redistributable asset provenance is incomplete.

The current `@lenso/ui` subpaths are:

```text
avatar       breadcrumb   button        checkbox      combobox
command-menu csp-provider dialog        disclosure    icon-button
label        menu         page-header   popover       quick-link
radio        resize-handle select       sidebar       settings-row
status-marker surface      switch       tabs          text-field
theme-scope  tooltip      toast
```

The documentation site covers the component pages plus the current Surface, Sidebar, Page Header, Quick Link, and Settings Row patterns. The registry also exposes setup, Theme Scope, CSP Provider, Sidebar and Resize Handle primitives, and their styled adapters or Recipes.

## Themes and semantic tokens

Light and dark themes are complete defaults. `ThemeScope` applies a theme and optional partial semantic-token overrides to a subtree, including the body-level host used by portalled overlays:

```tsx
import { ThemeScope } from "@lenso/ui/theme-scope";

<ThemeScope theme="dark" overrides={{ "color.surface.canvas": "#101114" }}>
  <App />
</ThemeScope>;
```

Public CSS properties use complete, unbranded semantic names such as `--color-surface-canvas`. Consumers retain ownership of preference persistence, system-mode resolution, product assets, and product-specific theme composition. The token source and generated-artifact rules are documented in [`docs/architecture.md`](docs/architecture.md).

## Strict CSP

`CSPProvider` forwards Base UI's strict-CSP contract. Generate a unique nonce per server request, include it in `script-src` and `style-src-elem`, and pass the same value to the provider:

```tsx
import { CSPProvider } from "@lenso/ui/csp-provider";

<CSPProvider nonce={requestNonce}>
  <App />
</CSPProvider>;
```

If the application supplies the required external component styles itself, `disableStyleElements` prevents Base UI from creating inline style elements. It does not remove inline `style` attributes; those are governed separately by `style-src-attr`.

## Replace built-in icons

Built-in Lucide icons are defaults rather than product identity. Controls that provide one expose a `ReactNode` slot:

```tsx
<Dialog.Close icon={<MyCloseIcon aria-hidden />} />
<Button loadingIndicator={<MySpinner aria-hidden />}>Save</Button>
```

## Development

The repository pins Node `24.18.0` through the workspace toolchain and pnpm `11.5.0` through `package.json`.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
```

Useful focused commands:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @lenso/docs dev
```

`pnpm generate` updates token and registry artifacts from their source inputs. Run it after changing token sources or registry generation inputs, inspect the generated diff, and commit the generated outputs with the source change. `pnpm check` also runs the generated-artifact freshness check, so it should be run after the working tree has the intended generated state.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the change workflow, [`docs/architecture.md`](docs/architecture.md) for the repository model, [`MVP.md`](MVP.md) for the delivery contract, and [`docs/adr/`](docs/adr/) for accepted architecture decisions. The Next documentation application under `apps/docs` is both the public documentation site and the component lab; its MDX content, playground configurations, and demos are part of the product surface.
