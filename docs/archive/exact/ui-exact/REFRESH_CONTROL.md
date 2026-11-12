> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# RefreshControl for Exact Web

RefreshControl composes the shared Lenso RefreshControl recipes with Exact
native buttons and a canonical primitive Status derivative. It is an ordinary
scroll/feedback control; it adds no Glass surface or renderer. The primitive
packages and stock Exact pin remain unchanged.

## Controlled operation

`RefreshControlState` declares all of:

- `id`, `label`: root ID namespace and accessible group/viewport name.
- `status`: `idle`, `refreshing`, `complete` or `error`.
- `generation`: change for each accepted operation, including one that settles
  synchronously into the same status as its predecessor.
- `disabled`: blocks new operations and cancels an active pull.
- `threshold`: positive finite resisted distance in CSS pixels; source default 72.
- `height`: explicit root CSS height; use `auto` for unconstrained content or a
  bounded value such as `20rem` for a scrollable viewport.
- `refreshLabel`, `pullLabel`, `releaseLabel`, `refreshingLabel`, `completeLabel`,
  `errorLabel`: localized trigger, indicator, live-status and error text.

`RefreshControl(state, refresh)` supplies a text trigger and scroll viewport.
For richer content, compose `RefreshControlRoot(state, refresh)`,
`RefreshControlTrigger(state, refresh)` and `RefreshControlViewport(state)`.
The trigger takes a content slot; the viewport takes the scroll content slot.
Use the same state/ID namespace for all parts. Do not replace these parts with
bare wrappers: the controller needs their explicit native anatomy.

`refresh()` requests an operation. The application immediately acknowledges it
by updating `status`/`generation`, owns the asynchronous work, and reports its
success or failure. A pending request prevents duplicate activation until this
acknowledgement. Rejected requests reconcile after two animation frames. A delayed
operation acknowledgement is unsupported: acknowledge the start immediately and
settle the work later. There is no component-owned network request or second
canonical task value. Errors and error callbacks belong to the application.

The root example schedules a real 600ms deadline in an Exact root task. It can
complete or fail, offers explicit completion for repeatable interaction tests,
and invalidates its pending deadline when unmounted. An application using network
requests must similarly cancel or ignore stale results for an old generation.
Disabling blocks new requests while allowing the current result to settle.

## Touch, keyboard and feedback

Pulls start only at the viewport's top with one touch. The source eight-pixel
axis threshold rejects upward and horizontal movement. Vertical pulls resist at
one half of travel and cap at `threshold + 40`. Releasing an armed pull requests
refresh; cancellation, multiple touches, default-prevented events and short pulls
do not commit. Refreshing holds content at 56px; completion/error returns it.
Mouse dragging does not pull. The native trigger provides Enter/Space and touch
activation without requiring a gesture.

Inputs, textareas, selects, contenteditable regions, source list-selection /
reorder / swipe markers and their Exact control slots retain gesture ownership.
A vertical release suppresses the following pointer click for 350ms before the
stock router's document listener. Keyboard-generated clicks remain available.
Nested roots filter events and parts by their nearest root.

The named native button is disabled while unavailable/busy. The root exposes
`aria-busy`; the primitive-derived polite atomic status announces armed,
refreshing, completed and error messages, without announcing every partial pull.
Decorative indicator content is hidden from accessibility. A visible error
message supports retry. Source transform transitions use 180ms ease-out, zero
while dragging and under Reduced Motion. Unmount disconnects the observer,
window/viewport listeners and animation-frame reconciliation.

## Remaining coverage

The stock compiler does not admit a native paragraph/error tag or `hidden` on
these nodes. Error uses a box; literal data metadata and scoped StyleX hide
inactive parts before initialization. The initialized controller also applies
native hidden attributes. This retains the documented upstream semantic gap.
The blocked-hatch fixture covers idle, refreshing and error at 390px in the light
theme; the full initial caller-style/theme matrix remains open. Automatic part
context, general
native attributes/ref/render/event forwarding and the full caller-style matrix
remain open. Browser touch simulation does not qualify a physical iPhone,
WebKit continuous native pull, actual OS screen-reader announcements or source
motion parity. Native Exact adapters follow the Web catalog.

## Verification

An isolated stock Exact consumer includes the full current component source with
no RefreshControl exclusion. The package suite passes 74 tests / 293 assertions;
typechecking covers 128 files, with affected lint/format checks passing. The
consumer builds with the same six existing SDK diagnostics from other families.

Chromium 156 and WebKit 27.2 pass timed completion/failure, retry, synchronous
completion into the same status, duplicate suppression, disabled completion,
request rejection, native keyboard activation, draft preservation, old-deadline
cancellation and removal/remount. Synthetic touch fixtures cover threshold and
resistance, axis rejection, canceled/prevented/multiple-touch sequences, top-edge
scroll ownership, input/list/swipe exclusions and trailing-click suppression
before the stock router. The cleanup check makes a removed viewport eligible
again so its old busy state cannot mask a leaked listener.

Both engines pass native mobile-browser trigger taps. Chromium also passes a
continuous native touch pull from a list row; no WebKit continuous/native-device
claim follows. Twenty-four initialized captures cover complete/refreshing/error,
light/dark and 390/820px; geometry checks include bounded root/scroll viewport and
content offsets. Six blocked-hatch captures verify idle/refreshing/error feedback,
trigger geometry, content offsets, arrow/spinner/error visibility and canonical
live text. Both engines pass the existing navigation helper with the RefreshControl
window listener active. Page/console errors are empty. Representative initialized
and initial images were inspected.

Receipts live under `.cache/acceptance/refresh-control-events/`,
`refresh-control-duration-initial/` and `refresh-control-cleanup/`. Failed
Touch-constructor and duration-composition observations remain in their earlier
cohorts. Verification does not establish OS announcements, source motion parity,
performance improvement or full catalog/native completion.
