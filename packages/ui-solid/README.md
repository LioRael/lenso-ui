# Lenso UI for Solid

`@lenso/ui-solid` is an experimental workspace package for Solid 2. It has
entry points for all 99 Lenso component families, with shared StyleX maps and
theme tokens. Interactive parts use `@ui-sdk/solid` and the shared Lenso core.
Components are available from the root or individual entries such as
`@lenso/ui-solid/select`.

## Set up a Vite app

Use Solid 2.0.3 or newer within Solid 2, matching versions of `solid-js` and
`@solidjs/web`, and `@solidjs/vite-plugin`. Add `@lenso/ui-solid` and
`@lenso/tokens` as direct dependencies using the workspace or local tarballs.
From the Lenso UI checkout, build the package and its dependencies with
`bunx turbo run build --filter=@lenso/ui-solid`. The Solid package is currently
available from source.

In your Vite config, register the StyleX plugin before the Solid plugin and
exclude UI SDK Core from Vite's dependency optimizer.

```js
import solid from "@solidjs/vite-plugin";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    }),
    solid(),
  ],
  ssr: { noExternal: ["@lenso/tokens", "@lenso/glass"] },
  optimizeDeps: { exclude: ["@ui-sdk/core"] },
});
```

For an SSR app with authored entries, use `solid({ ssr: true })`. The package
exposes JSX through the `solid` export condition so the app can compile it for
the browser and the server. Vite also bundles the tokens and Glass during SSR
so the StyleX plugin can compile their shared styles. In TypeScript, use `"jsx": "preserve"` and
`"jsxImportSource": "@solidjs/web"`.

Load this CSS from the app entry.

```css
@import "@lenso/tokens/styles.css";
@stylex;
```

## Compose the controls

```tsx
import { Button, Checkbox } from "@lenso/ui-solid";

export function Preferences() {
  return (
    <form>
      <Checkbox name="updates" defaultChecked>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          Product updates
        </Checkbox.Content>
      </Checkbox>
      <Button type="submit" variant="prominent">
        Save preferences
      </Button>
    </form>
  );
}
```

Button supports the `prominent`, `bordered`, and `borderless` variants, plus
`sm`, `md`, and `lg` sizes. Return a Promise from `onClick` for UI SDK's
pending behavior. Give icon-only buttons an accessible name.

Checkbox supports `defaultChecked` and controlled `checked` with
`onCheckedChange`. Use `"indeterminate"` for a mixed value. Supply `name` and
`value` to submit it in a native form.

Use `xstyle` for local StyleX overrides and `data-theme="light"` or
`data-theme="dark"` to scope appearance. Native Solid UI SDK props such as
`render`, `ref` and state-dependent `class` and `style` pass through.

## Responsive navigation

Wrap `Tabs.List` in `Tabs.ListContainer` to move tabs that exceed the available
width into a menu. The selected tab stays visible. Use `overflowLabel` to name
the menu in the page language.

Set `autoMinimize` on `TabBar` to follow page scrolling, or supply an element
or Solid accessor as `scrollTarget`. The bar expands at the top when minimizing
on downward scroll. Use `minimized` and `onMinimizedChange` for controlled state.

## Interactive tables

Use `columnKey` and `allowsSorting` on a column to emit sort changes from
`Table.Content`. Apply the descriptor to your data and pass the resulting rows
to `Table.Body`. Keyed rows support selection (including a mixed select-all
checkbox) and expandable detail rows. Resize columns with `Table.ColumnResizer`
and place `Table.LoadMore` at the end of a body to load another page on scroll.

Selection, sorting, expansion, and column widths support controlled values and
change callbacks. Static tables can continue to use native row and cell content.

## Current differences

Solid controls follow the native Solid UI SDK props. Date inputs and calendars
use ISO string values and ISO date tuples for ranges. The color editor uses UI
SDK's color model and its parts compose inside the picker.

Use `Table.Body virtualized={{ rowHeight, height, overscan }}` for a window of keyed rows.
Tree grids use `treeColumn` and a row's `childRows`. The table's `dragAndDrop`
callback handles keyboard and pointer reorder requests. `TagGroup.List` renders
keyed items and restores focus after the owner accepts a removal.

Compose `Calendar.YearPickerTrigger` and `Calendar.YearPickerGrid` to choose
a year within the calendar's bounds. The TabBar uses the shared Glass motion
bindings. Set `variant="pill"` on `Toast.Region` for intrinsic pill sizing.

Import reactive utilities from `@lenso/ui-solid/hooks`. Read
`useIsHydrated()`, `useMediaQuery()` and `useCSSVariable()` through their
returned accessors. List, overlay and theme state expose reactive properties.
Pass an element getter to `useMeasuredHeight`.

For a segmented date picker, compose `DateField` and `DatePicker.Segment`
inside the picker and control both with the same ISO value. The
[installed example](test/fixture/parity.tsx) exercises keyboard editing.

The [consumer fixture](test/fixture) builds both Vite targets from installed
tarballs and exercises development and production in Chromium and WebKit.

```sh
bunx turbo run build --filter=@lenso/ui-solid
bun test --timeout 180000 tests/consumer/solid-consumer.test.ts
```
