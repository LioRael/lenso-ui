# Command

`@lenso/ui/command` styles the native UI SDK command with a Glass surface,
search header, result rows and action footer. The unstyled parts and controller
are available from `@ui-sdk/react/command`.

```tsx
<Command.Root>
  <Command.Header>
    <Command.InputGroup>
      <Command.SearchIcon />
      <Command.Input aria-label="Find a command" />
    </Command.InputGroup>
  </Command.Header>
  <Command.Viewport>
    <Command.Empty>No matching commands.</Command.Empty>
    <Command.List>
      <Command.Item value="settings" onSelect={() => openSettings()}>
        <Command.ItemText>Settings</Command.ItemText>
      </Command.Item>
    </Command.List>
  </Command.Viewport>
</Command.Root>
```

The caller supplies `openSettings`. This is a composition snippet; the runnable
documentation examples include their application handlers.

`query`, `defaultQuery` and `onQueryChange` control search text. `value` and
`onValueChange` control highlight. `Item.onSelect` executes a command while
leaving the query intact. SDK cancellation uses `details.cancel()`.

Composed items register themselves and filter automatically. Alternatively,
supply native `items` records and render a childless `List`. Do not provide both
root data and manually composed items. Use the SDK controller for imperative
query changes and page navigation; obsolete Clear/Collection adapters are absent.

`Header`, `InputGroup`, `Viewport`, `SectionLabel`, item content parts, `Footer`,
`Hint`, `Key`, `Action` and `ActionKey` are Lenso presentation. Native state and
render callbacks pass through unchanged; `xstyle` composes after default styles.

For a palette, compose UI SDK Dialog with `Command.Backdrop` and
`Command.Content`. Content owns a native DialogContent containing the command;
its `contentProps` configure that dialog surface. Dialog owns open state, modal
focus, Escape dismissal and focus restoration. Applications own shortcuts and
whether execution closes the dialog.
