# List editing and RefreshControl

List's existing static composition remains supported. Add `itemKey` and
`textValue` to rows that need selection, coordinated swipe actions or reordering.
Set `editing` on List; optionally control `selectedKeys` and handle
`onSelectionChange`. Handle `onReorder` to update the application array. Use a
children render function to replace navigation controls with content in editing.

Use `List.Section` inside a plain List for grouped content and group-local
sorting. ListBox remains the option-selection widget; migration to ListBox is
not required for editable content lists. Prefer List.Item's `startActions` and
`endActions` for integrated rows over nesting independent SwipeActions owners.
Standalone SwipeActions is still supported.

List and SwipeActions now share `--lenso-list-surface`. Custom row colors should
set this property at their shared ancestor to keep the moving cover opaque and
matched to the grouped background.

Import RefreshControl from `@lenso/ui` or `@lenso/ui/refresh-control`. Compose Root,
Viewport and Trigger, and return an asynchronous job from `onRefresh`. Viewport
must own scrolling. Disable it while editing; localize feedback labels and keep
Trigger available for keyboard users. No native overscroll API is required.
