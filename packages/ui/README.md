# @lenso/ui

Precompiled Lenso UI Foundation Components for React 19. Import components from explicit subpaths and load both the semantic token contract and component CSS once in the application shell:

```tsx
import "@lenso/tokens/styles.css";
import "@lenso/ui/styles.css";
import { Button } from "@lenso/ui/button";
```

The optional `@lenso/ui/preflight.css` contains narrow platform and overlay host rules. It is not a global reset.

Use `ThemeScope` for nested Light or Dark subtrees and public semantic CSS properties for brand overrides. Built-in Lucide visuals are replaceable through component `ReactNode` slots, including `Dialog.Close`'s `icon` and Button's `loadingIndicator`.

Choose this package for managed component upgrades. Choose the shadcn-compatible registry when structural ownership is more important than managed updates. This `0.1.x` surface is experimental and follows the repository MVP contract.
