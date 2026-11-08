# Command

`@lenso/ui/command` is the styled Lenso Command component.
`@lenso/primitives/command` provides the unstyled interaction layer built on Base UI
Autocomplete. It manages query filtering, active items, keyboard navigation and
input/list accessibility. It does not create a dialog, fetch results, navigate
routes or install a global shortcut.

```tsx
import { Command } from "@lenso/ui/command";

const commands = ["Open file", "Create project", "Settings"];

<Command.Root items={commands}>
  <Command.Input aria-label="Find a command" />
  <Command.Empty>No matching commands.</Command.Empty>
  <Command.List>
    {(command: string) => (
      <Command.Item value={command} onSelect={runCommand}>
        {command}
      </Command.Item>
    )}
  </Command.List>
</Command.Root>;
```

This snippet illustrates the composition; the caller supplies `runCommand`.
The UI entrypoint supplies the surface, input, list, item and state styles.
Use `xstyle` to override presentation; it is applied after the defaults.
Use the primitives entrypoint for custom presentation with native Base UI
`className`, `style` and `render` composition. Both preserve refs and native props.
The styled Root adds a surface element; the primitive Root renders no element.

## Query and execution

- `items` supplies a flat collection. Render filtered entries through the
  `List` render function or `Collection`; static children are useful for
  externally filtered layouts but are not automatically hidden by query changes.
- `value`, `defaultValue` and `onValueChange` control the query. The first
  available item is highlighted by default; arrow navigation stays in the input.
- `Item` requires a unique `value`. `onSelect(value)` handles pointer or Enter
  activation. Execution leaves the query intact. Disabled items cannot execute;
  preventing the item's `onClick` default also cancels `onSelect`.
- For object items, provide `itemToStringValue` to define their searchable label.
  Use a custom `filter` for aliases or another matching policy. `filter={false}`
  preserves external search results and ordering without a second filtering pass.
- `onItemHighlighted` exposes the active value for a preview or action footer.
  It does not execute the item. `autoHighlight`, `keepHighlight` and
  `loopFocus` retain their Base UI contracts.

`Group`, `GroupLabel`, `Separator`, `Empty`, `Status` and `Clear` retain their
Base UI behavior. Use `data-highlighted` to style the active item;
`aria-selected` does not represent command activation.

## Dialog composition

Place Command inside a Base UI Dialog popup for a command palette. Dialog owns
open state, modal focus and focus restoration. The application owns shortcuts
such as Command-K and decides whether executing an item closes the dialog.
Command does not intercept Escape to dismiss a surrounding dialog; a consumer
with another input component may need to resolve that component's clear action.

The documentation search uses this composition. `@lenso/docs` keeps static
index loading, result compaction, query highlighting and route navigation.
Its public `DocumentationSearch` API is unchanged. The internal Fumadocs search
list and Radix dialog are replaced by Command and Base UI Dialog; consumers
with custom result styles should use `data-highlighted` rather than
`aria-selected=true`. Command is an authorized additive export in `@lenso/primitives`; existing primitive families are unchanged.

## Migrating the initial unstyled export

Consumers that supplied all presentation to the initial unstyled
`@lenso/ui/command` export should import from `@lenso/primitives/command`.
Keep the UI import to adopt Lenso defaults and use `xstyle` for overrides.
The UI package now depends on `@lenso/primitives`; publishing requires a
primitives version that includes the Command export.
