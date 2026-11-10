# Modal for Exact Web

`Modal` uses the browser's native modal dialog, Exact commands and actions, and
shared Lenso modal tokens. It has no React dependency. The ordinary surface is
intentional; this implementation does not add a glass variant.

## Composition

Import the following from `@lenso/ui-exact`:

- `ModalState`, `Modal`, `ModalBackdrop`, `ModalViewport`, `ModalPopup`.
- `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`, `ModalIcon`.
- `ModalTrigger`, `ModalClose`, `ModalAction`, `ModalCloseIcon`.

See the [compiled consumer example](example/modal.contract) for runnable syntax,
including validation, successful save, nested dialogs and dynamic variants.
Exact currently requires every declared prop at a call site.

`ModalState` has the following required fields. Pass the same state to root,
backdrop, popup and body; slots keep the caller's lexical scope.

| Field         | Values / purpose                                         |
| ------------- | -------------------------------------------------------- |
| `id`          | Unique dialog ID; popup/body IDs append `-popup`/`-body` |
| `label`       | Accessible fallback label                                |
| `labelledBy`  | Title ID, or empty string when using `label`             |
| `describedBy` | Description IDs, or empty string when unused             |
| `dismiss`     | `any`, `closerequest`, `none`                            |
| `size`        | `xs`, `sm`, `md`, `lg`, `cover`, `full`                  |
| `placement`   | `auto`, `top`, `center`, `bottom`                        |
| `scroll`      | `inside`, `outside`                                      |
| `backdrop`    | `transparent`, `opaque`, `blur`                          |

Use root > backdrop, and root > viewport > popup. Place header, body, footer
and close controls inside the popup. The direct ancestry is used by native
closing styles. `ModalTitle(id, level)` supplies heading semantics;
`ModalDescription(id)` supplies description content. `ModalIcon()` accepts
children in the shared 40 px icon container.

## State and interaction ownership

The native host owns whether the dialog is open. `ModalTrigger` uses
`commandfor`/`show-modal`; `ModalClose` and `ModalCloseIcon` use the native close
command. Application actions can use Exact's `showModal(id)` and `close(id)`.
There is no second `open` boolean to synchronize. The dialog stays in its
original DOM/theme subtree while the browser renders it in the top layer.

`ModalTrigger` and `ModalClose` require `id`, `label`, `target`, `disabled`,
`size`, `variant`, plus rich children. Button sizes are `sm`, `md`, `lg`, with
`prominent`, `bordered`, `borderless` variants. `ModalAction` accepts `press`
instead of `target`; it invokes the application action without automatically
closing. The example keeps a failed save open and closes only after acceptance.
`ModalCloseIcon` requires `id`, `label`, `target`, `disabled`.

The browser handles initial focus, modal background isolation and ordinary
focus return. The hatch adds a boundary Tab loop, Escape cancellation for
`none`, outside-pointer dismissal for `any`, document scroll locking and
cleanup on removal. An outside dismissal requires both pointer down and up
outside the popup. `closerequest` allows Escape and explicit close controls;
`none` allows explicit close controls. Native focus traversal is retained
between the boundaries, with disabled/hidden elements and radio groups handled
by the boundary helper. Its Base UI adaptation is credited in [NOTICES.md](NOTICES.md).

Before the hatch loads, linked CSS and native command opening/closing work.
Scroll locking, the boundary loop and the outside-pointer helper require the
hatch. Do not treat a blocked hatch as the complete initialized interaction API.

## Browser acceptance

The installed consumer is compiled by the pinned Exact compiler. Chromium and
Playwright WebKit checks cover:

- Native commands and application actions; failed/successful save and retained draft.
- Accessible title/description, focus entry/return, forward/reverse Tab boundaries,
  hidden/disabled controls, radio-group boundaries and background focus isolation.
- Escape/dismissal policies, outside pointer behavior, disabled triggers, open-root
  removal and remount, and a nested dialog returning focus to its parent trigger.
- All sizes, placements, backdrops, both scroll modes, background scroll locking,
  responsive geometry, light/dark screenshots at 390/820 px and reduced motion.
- Enter/close/reopen frame traces under a transformed, clipped ancestor.

Motion is platform-dependent. Both engines animate entry. Chromium supports
native `overlay` transitions and retains the top layer during the verified
100 ms exit. The tested WebKit does not support that property and closes
immediately. The adapter gates the exit transition on support; it does not delay
native closing, move Exact-owned nodes or substitute a captured image.
The browser receipt includes `modalMotion`, and each engine writes a
`*-modal-motion.json` frame trace.

The family remains **partial**. WebKit exit motion, custom initial/final-focus
APIs, arbitrary portal containers, controlled open/change notifications and
classic-scrollbar compensation have not reached parity. Parent closing while
its nested child remains open is not covered by the current nested acceptance.
Playwright WebKit is not proof of physical Safari/iPhone acceptance. Native
Exact adapters are outside this Web implementation.
