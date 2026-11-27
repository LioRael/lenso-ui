# Lenso UI for Svelte

`@lenso/ui-svelte` is a Svelte 5 preview available from this workspace or local
tarballs. It exposes all 99 Lenso component families through the root and
individual entries such as `@lenso/ui-svelte/select`. It uses the shared Lenso
StyleX maps, tokens and Glass runtime. Interactive parts use the native Svelte
UI SDK and shared Lenso primitives.

## Set up a Vite app

Use Svelte 5.46.4 or newer within Svelte 5. Build the package and its
dependencies from this checkout with `bunx turbo run build --filter=@lenso/ui-svelte`.
Add `@lenso/ui-svelte` and `@lenso/tokens` as direct app dependencies. For a
standalone app, use local tarballs for those packages and for
`@lenso/glass` and `@lenso/primitives` from the same checkout.

Register StyleX before the Svelte plugin. Let Vite transform the workspace
packages during development and server rendering so StyleX can compile the
shared tokens.

```js
import { svelte } from "@sveltejs/vite-plugin-svelte";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    }),
    svelte(),
  ],
  ssr: { noExternal: ["@lenso/ui-svelte", "@lenso/tokens", "@lenso/glass", "@ui-sdk/svelte"] },
  optimizeDeps: { exclude: ["@lenso/ui-svelte", "@lenso/tokens", "@lenso/glass", "@ui-sdk/core"] },
});
```

Import this stylesheet from the app entry.

```css
@layer ui-sdk;
@import "@lenso/tokens/styles.css";
@stylex;
```

## Compose a form

```svelte
<script lang="ts">
  import { Button, Checkbox } from "@lenso/ui-svelte";

  let updates = $state(true);
</script>

<form method="post">
  <Checkbox name="updates" bind:checked={updates}>
    <Checkbox.Content>
      <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
      Product updates
    </Checkbox.Content>
  </Checkbox>
  <Button type="submit" variant="prominent">Save preferences</Button>
</form>
```

Use UI SDK's `bind:value`, `bind:checked` and `bind:open` where offered.
The matching `defaultValue`, `defaultChecked` and `defaultOpen` props set
initial state. Change callbacks receive SDK details and can call
`details.cancel()`. Render and state-dependent content use Svelte snippets.
Use `xstyle` for StyleX overrides or `class` and `style` for native attributes.
Set `data-theme="light"` or `data-theme="dark"` on the document or a subtree.

Wrap `Tabs.List` in `Tabs.ListContainer` for horizontal overflow. Use
`autoMinimize` and `scrollTarget` to opt TabBar into scroll-driven collapse.
Table supports keyed selection, sorting, expansion and resizable columns.
For data-driven headers and bodies, pass typed `column` and `row` snippets.
Calendar values use ISO dates and ISO date tuples. Color controls use the
Svelte SDK's native color values.

## Collections and motion

Use `Table.Body virtualized={{ height, rowHeight, overscan }}` with keyed
`items` and a `row(item)` snippet inside `Table.ScrollContainer`. Select-all
includes rows outside the render window. The window assumes one fixed-height
row per item.

Set `treeColumn` on `Table.Content`, match it with the cell's `columnKey`,
and use the row's `childRows` snippet for nested rows. In the tree column,
arrow keys open or close a branch and move between parent and child. Pass
`dragAndDrop` to request reorders or exchange drag data. A button with
`data-table-drag` starts a keyboard move with Enter or Space.

`TagGroup.List` accepts an `item(item)` snippet for controlled `items` or
`defaultItems`. Compose each keyed `Tag` with `itemKey` and `textValue`.
Selection and removal support keyboard operation. Controlled removal moves
focus after the owner removes the item.

Compose `CalendarYearPicker.Trigger` and `CalendarYearPicker.Grid` inside
`Calendar` or `RangeCalendar`. The picker shares the calendar's ISO month,
limits and cancelable callbacks. `Calendar.YearSelect` still exposes the
native select.

TabBar shares the Glass indicator, label optics and reversible collapse
motion with React. For animated notifications use
`<Toast.Region variant="pill" />`, or render each item with
`<Toast.Root variant="pill">` and the Toast parts. The pill follows intrinsic
content size while preserving the native action and close controls.
`Toast.Progress` and `Toast.Marquee` provide rolling percentages and
overflowing title motion.

The package remains a preview. Svelte props use native bindings and snippets
where the equivalent React component uses render props.

Import reactive utilities from `@lenso/ui-svelte/hooks`. Read
`useIsHydrated()`, `useMediaQuery()` and `useCSSVariable()` through their
returned accessors. List, overlay and theme state expose reactive properties.
Pass an element getter to `useMeasuredHeight`.

For a segmented date picker, compose `DateField` and `DatePicker.Segment`
inside the picker and control both with the same ISO value. The
[installed example](test/fixture/parity.svelte) exercises keyboard editing.

The [consumer fixture](test/fixture) installs packed artifacts, checks type
resolution, builds both Vite targets, and tests styles and interaction after
server rendering and hydration in Chromium and WebKit.

```sh
bunx turbo run build --filter=@lenso/ui-svelte
bun test --timeout 180000 tests/consumer/svelte-consumer.test.ts
```
