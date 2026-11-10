# AlertDialog for Exact Web

AlertDialog combines a native modal `dialog` with `role="alertdialog"`, shared
Lenso alert recipes and the existing medium glass renderer. The Contract owns
all content and the lens node; the hatch owns only presentation, focus-boundary
support and decorative optics. There is no React runtime.

## Parts and state

Import from `@lenso/ui-exact`:

- `AlertDialogState`, `AlertDialog`, `AlertDialogBackdrop`, `AlertDialogViewport`, `AlertDialogPopup`.
- `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogBody`, `AlertDialogFields`.
- `AlertDialogFooter`, `AlertDialogIcon`, `AlertDialogDefaultIcon`.
- `AlertDialogTrigger`, `AlertDialogClose`, `AlertDialogCloseIcon`, `AlertDialogAction`.

The [compiled example](example/alert-dialog.contract) implements a destructive
confirmation with text validation. Every declared prop is required by the
current Exact compiler. Root, backdrop and popup receive the same state:

| State field   | Values / purpose                                        |
| ------------- | ------------------------------------------------------- |
| `id`          | Unique native dialog ID; popup ID appends `-popup`      |
| `label`       | Accessible fallback label                               |
| `labelledBy`  | Title ID, or empty string when using the fallback label |
| `describedBy` | Description IDs, or empty string when unused            |
| `size`        | `xs`, `sm`, `md`, `lg`, `cover`                         |
| `placement`   | `auto`, `top`, `center`, `bottom`                       |
| `backdrop`    | `transparent`, `opaque`, `blur`                         |

Use root > backdrop and root > viewport > popup. Place header, body and footer
inside the popup. `AlertDialogTitle(id, level)` supplies heading semantics;
`AlertDialogDescription(id)` supplies description content. `AlertDialogFields()`
groups form content. These parts accept children, retaining the caller's scope.

`AlertDialogFooter(layout)` supports `auto`, `side-by-side` and `stacked`.
Automatic layout stacks when it has at least three direct children, matching
the shared recipe. `AlertDialogIcon(variant)` accepts custom children in a
40 px container; variants are `default`, `accent`, `success`, `warning`,
`danger`. Compose `AlertDialogDefaultIcon(variant)` inside it for the existing
Lenso informational, success, warning or danger glyph (20 px, decorative).

## Opening, cancellation and confirmation

The adapter suppresses Exact's stock alert title pseudo-element and resets its
100% input flex basis within Lenso alerts, preserving one visible title and the
shared 52 px field height. Both are checked before and after hatch initialization.

The native host owns open state. `AlertDialogTrigger` takes `id`, `label`,
`target`, `disabled`, `size`, `variant`, and rich children. It uses a native
`show-modal` command. Trigger sizes are `sm`/`md`/`lg`; button variants are
`prominent`/`bordered`/`borderless`. Exact actions may also call `showModal(id)`.

`AlertDialogClose` takes `id`, `label`, `target`, `disabled`, `initialFocus`,
and children. `initialFocus=true` authors native `autofocus`; choose one initial
focus target in a dialog. The example focuses the least destructive action,
while preserving the conventional header/body/footer order. `AlertDialogCloseIcon`
takes `id`, `label`, `target`, `disabled` and supplies its decorative close glyph.
Both use native close commands.

`AlertDialogAction` takes `id`, `label`, `press`, `disabled`, `variant` and children.
Its variants are `default`, `cancel`, `destructive`. The application action
explicitly calls `close(id)` after acceptance. This differs from the React
Base.Close wrapper's default automatic closing: a failed validation or save
must leave the confirmation open. The action does not mutate application data
or close on its own.

Clicking the backdrop does not dismiss an AlertDialog. Escape and explicit
close controls can close it. Native focus entry, background isolation and
focus return are supplemented by the same boundary Tab loop, document scroll
lock and removal cleanup as Modal. See [Modal boundaries](MODAL.md).

## Material and lifecycle

The popup composes `materialStyles.root`, alert size/popup recipes and accessible
material styles. Its decorative lens uses the shared small+medium liquid maps
and `attachGlass` with `glass-medium` and live geometry, matching the React
AlertDialog's compact material role. Optics attach while open and retire after
native exit; close/reopen cancels pending retirement.

Reduced transparency, forced colors, increased contrast preferences and the
nearest explicit `data-contrast="increased"` use an opaque surface and detach
the optics. Removing the preference restores the lens. Removing a Contract lens
cleans up observers, media listeners, timers and optics. Before hatch loading,
linked CSS supplies the lens's native fallback and native commands still work;
the full optical renderer initializes with the hatch.

This uses the existing renderer and retains its backdrop-replay limitations.
It does not establish that Exact fixes WebKit live glass rendering or improves
performance. Browser semantics and material initialization are separate evidence
from optical parity and device frame-time acceptance.

## Verification and remaining gates

The installed consumer suite covers native/action opening, accessible relations,
least-destructive initial focus, forward/reverse Tab boundaries, ignored backdrop
clicks, Escape and explicit close, retained input, failed/successful confirmation,
disabled triggers, removal/remount, all sizes/placements/backdrops/icon tones,
footer layout and automatic stacking, contrast/forced-color fallback and reduced
motion. Light/dark screenshots cover 390/820 px. Full browser checks also compare
all generated initial-style recipes against their compiled class branches.

Frame traces cover entry, exit and close/reopen interruption under a transformed,
clipped ancestor. Native top-layer exit transitions depend on `overlay` support;
WebKit's immediate-close limitation remains the same as Modal. The browser
receipt records the observed `alertDialogMotion` capabilities rather than
claiming equal motion support.

Rendered review remains a separate gate. A plain striped-background probe shows
that the current macOS WebKit Playwright screenshot backend omits backdrop blur,
including on a page without Exact. Native-window inspection of the same engine
and the compiled dark 390 px AlertDialog shows the expected background blur.
The earlier "too transparent" diagnosis from the incomplete screenshot is
therefore not established as a component defect. See [capture capability and
remaining acceptance boundaries](VISUAL_CAPTURE.md). One native window does not
establish full optical parity or complete the visual matrix.

The family remains **partial**: broader controlled-open/change notifications,
arbitrary portal containers, custom final-focus targets, detached triggers,
long-content/virtual-keyboard acceptance, exact optical parity and physical
Safari/iPhone/performance acceptance remain open. Native Exact adapters follow
Web completion. Existing Base UI adaptation attribution remains in [NOTICES.md](NOTICES.md).
