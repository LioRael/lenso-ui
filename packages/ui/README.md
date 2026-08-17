# @lenso/ui

`@lenso/ui@0.2.0` is the managed package channel for Lenso UI's styled React Foundation Components. It targets React 19, uses Base UI for the underlying interaction primitives, and ships precompiled StyleX output.

## Install and import

```bash
pnpm add @lenso/ui @lenso/tokens @base-ui/react react react-dom
```

Load the token contract and component stylesheet once in the application shell, then import a family from its explicit subpath:

```tsx
import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import { Button } from "@lenso/ui/button";

export function SaveButton() {
  return <Button>Save</Button>;
}
```

The package intentionally does not expose an all-components root barrel. The published component exports are listed in the repository [README](../../README.md#public-packages-and-current-surface).

`@lenso/ui/preflight.css` is optional. It contains narrow platform and overlay-host rules; it is not a global reset and does not include font assets.

## Public behavior

- `ThemeScope` provides nested Light and Dark scopes, partial semantic-token overrides, and a themed host for portalled content.
- `CSPProvider` forwards Base UI's nonce and `disableStyleElements` contract for strict-CSP applications.
- Built-in Lucide icons are defaults. Components that expose an icon or loading-indicator slot accept Consumer-provided `ReactNode` values.
- `@lenso/ui/sidebar` is the styled adapter over `@lenso/primitives/sidebar`; use the primitive directly when you need a headless visual boundary.
- `Select.Positioner` supports `position="popper"` and `position="item-aligned"` for different overlay geometry needs.

For structural ownership, install the corresponding shadcn-compatible item from the [Lenso registry](https://ui.lenso.dev). Registry source is Consumer-owned; this package remains a managed dependency.

## Source and verification

Component source lives under `packages/ui/src`. Registry items are generated from that source by `tooling/registry-builder`; do not edit generated registry copies directly. Browser behavior and accessibility contracts are verified with Vitest Browser Mode, Playwright, and `axe-core`.

The package is part of the Changesets fixed group with `@lenso/primitives` and `@lenso/tokens`. See the repository [contributing guide](../../CONTRIBUTING.md) for the generation and release workflow.
