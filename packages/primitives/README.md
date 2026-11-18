# @lenso/primitives

`@lenso/primitives` contains headless, style-free product primitives composed
with UI SDK. Sidebar supplies the composable React shell panel:

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

Other public entries provide SectionIndex and SwipeActions React parts and core
definitions (`/section-index`, `/swipe-actions` and their `/core` entries).
`/model-control`, `/list/core` and `/wheel-picker/core` provide shared domain
value, editable-list and wheel-picker primitives used by the styled UI families.
These core entries have no React runtime; they do not add replacement Command,
DataGrid or ResizeHandle component APIs.

Source and browser tests live under `packages/primitives/src/sidebar`. See the repository [component conventions](../../docs/design/component-conventions.md) for the dependency boundary and the [contributing guide](../../CONTRIBUTING.md) for changes and release verification.

Unstyled Command parts are available directly from `@ui-sdk/react/command`.
Use `@lenso/ui/command` for the Lenso presentation.

## TypeScript compatibility

With UI SDK 0.1.0-beta.8, these primitives use `strict: true`,
`exactOptionalPropertyTypes: true` and `skipLibCheck: false`. The installed-consumer
regression checks the packed declarations and SDK `createParts` calls under the
same settings. No dependency patch or runtime compatibility layer is included.

This support is scoped to `@lenso/primitives`, not every UI SDK component or the
full `@lenso/ui` package. Beta.8 still has exact-optional declaration issues in
Tooltip and Preferences. See [the compatibility report](../../docs/upstream-ui-sdk-types.md)
for the remaining limitations and historical investigation.
