# @lenso/primitives

`@lenso/primitives@0.2.0` contains headless, style-free Product Primitives for Lenso UI. The current public surface is the composable Sidebar state and accessibility model:

```bash
pnpm add @lenso/primitives @base-ui/react react
```

```tsx
import { Sidebar } from "@lenso/primitives/sidebar";

export function AppShell() {
  return (
    <Sidebar.Root defaultOpen>
      <Sidebar.Panel>
        <Sidebar.Content>Navigation</Sidebar.Content>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}
```

`Sidebar` supports controlled and uncontrolled state, independent left and right panels, nested Roots, stable targeting, keyboard dismissal, and focus restoration. Its public API exposes behavior and semantic DOM only; it does not impose StyleX, theme tokens, default CSS, an animation runtime, persistence, or routing.

Use `@lenso/ui/sidebar` when you want the Lenso UI visual adapter. The registry also includes an editable Sidebar Recipe for Consumers that need structural ownership.

Source and browser tests live under `packages/primitives/src/sidebar`. See the repository [architecture guide](../../docs/architecture.md) for the dependency boundary and the [contributing guide](../../CONTRIBUTING.md) for changes and release verification.
