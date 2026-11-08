# Command

Import `Command` from `@lenso/primitives/command` for unstyled query filtering,
keyboard navigation and command execution. Root renders no element; native
Base UI `className`, `style`, refs and `render` composition remain available.
It has no dependency on Lenso UI, tokens or glass.

Supply a flat `items` collection and a render function to `List`; use
`itemToStringValue` for object labels and `filter={false}` for external search.
`Item.onSelect(value)` executes an action without replacing the query.
Input composition does not execute commands. Disabled and read-only controls
cannot execute actions. `Group`, `GroupLabel`, `Separator`, `Empty`, `Status`,
`Clear` and `Collection` retain their Base UI contracts.

Compose with Dialog when modal focus and dismissal are needed. Applications
own global shortcuts, search engines, navigation and when the palette closes.
For Lenso presentation import `Command` from `@lenso/ui/command`.
