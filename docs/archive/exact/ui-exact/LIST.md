> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# List for Exact Web

`ListState` carries `id`, `label`, `variant` (grouped/plain), `direction`
(ltr/rtl) `disabled`, `editing` and `selectedKeys` (string array). Compose `List` with `ListItem(id, height)` using
regular/tall minimum row heights. `ListAction(state, id, disabled, press)` is a
native button that invokes the caller's Exact action. Root disabled state blocks
these action buttons; custom controls remain caller-owned.

`ListContent`, `ListTitle`, `ListDescription`, `ListLeading` and `ListTrailing`
compose row content. `ListSeparator` is decorative. `ListSection(id, title)`
provides a heading and a named nested list. IDs must be unique.
The [consumer example](example/list.contract) demonstrates disabled actions,
wrapping descriptions, sections and direction/surface changes.

Presentation reuses the existing list and surface tokens: 52px regular rows,
68px tall rows, grouped 26px corners, ordinary surfaces and native focus styling.
This family has no Glass lens. Exact's currently available box declarations use
list/listitem roles rather than literal ul/li elements; upstream is unchanged.

## Open coverage

This family remains Partial. Swipe actions and broader collection/focus integration
with nested controls still require implementation. It is not API-complete.
Native platform adapters and device/assistive-technology acceptance remain open.

## Browser evidence

The isolated compiled consumer passed Chromium and WebKit, checking 13 affected
presentation recipes per engine, named/nested list semantics, native Enter/Space
actions, disabled buttons, 52/68px minimum geometry, RTL and overflow. Sixteen
screenshots cover grouped/plain, light/dark and 390/820px. No page or console
errors were recorded. Receipt: `.cache/acceptance/list-acceptance.json`.
The full catalog browser suite was not rerun for this slice.

## Editing selection

`List` also receives `selectAll`, an Exact action. The root invokes this action
for Cmd/Ctrl+A only in editing mode, outside text inputs and only when enabled.
The caller derives all selectable keys from its collection, excluding disabled
items and preserving any already-selected disabled keys.

`ListEditItem(state, id, itemKey, label, disabled, height, change)` adds a native
checkbox in editing mode. `change` receives the complete next string array;
`selectedKeys` remains caller-owned. Stable keys are independent of labels and
DOM IDs. `ListAction` is disabled while editing. Plain `ListItem` remains an
unmanaged content row. Leaving editing mode preserves selection.

The previous browser receipt covers the initial structural slice. Editing
acceptance is tracked separately; it is not implied by that earlier receipt.

Editing selection now passes the isolated Chromium/WebKit consumer checks:
Space activation, scoped Cmd/Ctrl+A, disabled-item exclusion, root disable,
caller updates, selection persistence, round checkbox control and 16px row
insets. Accessible names remain on inputs without visible label duplication.
The final cohort contains 16 affected recipes per engine and 18 screenshots,
including two editing-state captures. Receipt:
`.cache/acceptance/list-edit-acceptance.json`. No page/console errors were recorded.

## Keyboard reorder requests

`ListReorderHandle(state, id, itemKey, label, disabled, reorder)` adds an editing
handle. Its `reorder` Exact action receives `(sourceKey, targetKey, position)`,
where position is before/after. The caller owns the collection and applies the
requested move; the adapter does not reorder DOM independently. Keys are passed
through individual input bridges without delimiter encoding.

Space/Enter begins a session, Up/Down selects an enabled target in the same
section, and Enter/Space confirms. Escape, blur, disable, leaving editing mode,
target removal or handle disposal cancel pending work. Live status and keyboard
instructions expose the interaction to accessibility APIs. Pointer dragging and bounded edge scrolling are described below. Physical touch
and broader collection/focus acceptance remain open; source parity is incomplete.

The keyboard reorder consumer passed Chromium and WebKit: deferred commit,
actual before/after order updates, Escape/blur cancellation, disable cancellation,
editing removal/remount and post-commit focus restoration. Nineteen affected
recipes per engine and 18 screenshots include the existing List regression.
Page/console errors are empty after the synchronous-update fix. Receipt:
`.cache/acceptance/list-reorder-acceptance.json`. Typecheck covers 78 files;
18 existing regression tests pass. The full catalog browser suite was not rerun.

## Pointer reorder

A primary pointer on a reorder handle captures the pointer and starts a pending
move. Movement of at least four pixels activates row translation and chooses a
nearby enabled target in the same section. Release requests before/after via the
same Exact action. Stationary presses leave the order unchanged. Escape,
pointer cancellation, lost capture, disabling, leaving editing mode and disposal
restore adapter-owned styles and release capture. The translated row uses the
source drag background, corner treatment and shadow; the target receives an inset
marker. A scrollable ancestor (or the document) scrolls at its edge, clamped to the
range measured at pointer down.

Browser fixtures use native mouse input for drag/commit and a synthetic
pointercancel event for that cancellation path. The edge-scroll fixture creates a
bounded scrolling list and checks movement through its original maximum, then
checks the bound remains stable across frames. These fixtures do not verify
physical touch or native application/device behavior.

The final pointer cohort passed Chromium and WebKit, including existing List
and keyboard reorder regression, 19 affected presentation recipes per engine,
20 screenshots and empty page/console error lists. The final compiled adapter
contains the opaque drag background and the captured scroll limit. Receipt:
`.cache/acceptance/list-pointer-acceptance.json`. Typecheck, affected format/lint
and 18 regression tests pass. Full catalog, physical touch and assistive
technology acceptance remain open.
