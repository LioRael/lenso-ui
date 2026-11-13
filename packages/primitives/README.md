# @lenso/primitives

`@lenso/primitives` contains headless, style-free Product Primitives for Lenso UI. Its public surface is the composable Sidebar model:

```bash
pnpm add @lenso/primitives @ui-sdk/react @ui-sdk/core react
```

```tsx
import { Sidebar } from "@lenso/primitives/sidebar";

export function AppShell() {
  return (
    <Sidebar.Root aria-label="Workspace navigation" defaultOpen>
      <Sidebar.Panel aria-label="Workspace destinations">
        <Sidebar.Content>Navigation</Sidebar.Content>
      </Sidebar.Panel>
    </Sidebar.Root>
  );
}
```

`Sidebar` supports controlled and uncontrolled state, independent left and right panels, nested roots, native controllers, cancelable state changes, keyboard dismissal, and focus recovery. Its public API exposes behavior and semantic DOM only; it does not impose StyleX, theme tokens, default CSS, an animation runtime, persistence, or routing.

The framework-independent `sidebar` definition and controller are exported from
`@lenso/primitives/sidebar/core`; React parts are generated with SDK `createParts`.
Use `@lenso/ui/sidebar` for styled navigation inside a panel. The registry also includes an editable Sidebar Recipe for Consumers that need structural ownership.

Source and browser tests live under `packages/primitives/src/sidebar`. See the repository [component conventions](../../docs/design/component-conventions.md) for the dependency boundary and the [contributing guide](../../CONTRIBUTING.md) for changes and release verification.

Unstyled Command parts are available directly from `@ui-sdk/react/command`.
Use `@lenso/ui/command` for the Lenso presentation.

## Temporary TypeScript compatibility

UI SDK 0.1.0-beta.1 has a declaration incompatibility with
`exactOptionalPropertyTypes: true`. The supported configuration for these
SDK-backed primitives currently uses `strict: true` and
`exactOptionalPropertyTypes: false`; declaration checking can remain enabled
with `skipLibCheck: false`. Building Lenso with this setting does not repair
the upstream declarations for consumers that enable exact optional properties.

No dependency patch or runtime compatibility layer is included. Restore exact
optional property checking when an official SDK release passes both the strict
primitive build and the installed-consumer checks. Investigation and removal
criteria are recorded in [the compatibility report](../../docs/upstream-ui-sdk-types.md).
