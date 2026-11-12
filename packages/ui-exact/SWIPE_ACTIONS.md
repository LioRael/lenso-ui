# SwipeActions for Exact Web

SwipeActions is an ordinary action surface using the shared Lenso swipe recipes.
It does not use Glass and has no complete headless equivalent in primitives-exact.
Exact application state owns the open side; the Web adapter requests changes and
owns only pointer tracking, presentation, focus return and listener lifetime.

## Composition

`SwipeActionsState` contains a unique `id`, `direction` (`ltr` or `rtl`),
`disabled`, and `openSide` (`start`, `end`, or the empty string for closed).
The root's `change` action receives the next open-side string. Consumers retain
that value in their own state. Editing mode can contribute to `disabled`.

Compose `SwipeActionsContent` from labelled `SwipeActionsTrigger` controls and a
`SwipeActionsBody`. Each trigger receives the same state, its logical side, an
accessible label and the change action. `SwipeActionsActions` receives that state
and side; hidden action groups are accessibility-hidden and become inert after
initialization. Before initialization their shared CSS hides them.

`SwipeActionsAction` takes state, a unique id, disabled, fullSwipe, variant,
change and press actions, plus rich child content. Variants are `default`, `tint`
and `danger`. Activation closes the surface and invokes the application action.
Full swipe is opt-in per action; the first enabled opted-in action on that side
is eligible. A normal reveal does not execute an action. Consumers are responsible
for confirmation or undo appropriate to their application.

The compiled [consumer](example/swipe-actions.contract) demonstrates both sides,
disabled actions, opt-in full swipe, editing, direction changes and remounting.
It uses the actual public Contract components rather than a substitute renderer.

## Interaction and ownership

Horizontal pointer motion reveals actions after an axis threshold; vertical
motion remains available for page scrolling. Logical start/end reverse in RTL.
Triggers and action buttons provide native keyboard and tap alternatives.
Escape from within the component closes it and returns focus when appropriate.
Executing a focused action returns focus to its side's trigger after state closes.
Reduced Motion removes the shared transform transition.

Inputs, textareas, selects, editable text, swipe controls and List selection or
reorder controls do not start a swipe. Disposal releases pointer capture,
observers and listeners and restores recorded inline presentation and inert state.
The adapter does not write its own alternative open-state store.

## Verification boundary

`test/swipe-browser.mjs` serves an isolated compiled consumer at its root URL and
checks the actual loaded script fingerprint. Run from the repository root:

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/swipe-browser.mjs
```

`PLAYWRIGHT_MODULE` can select an installed Playwright module with available
browsers; `LENSO_EXACT_TEST_ARTIFACTS` selects the evidence directory. The focused
suite is also integrated into the full browser driver.

Desktop coverage includes native keyboard actions, focus return, pointer reveal,
vertical-axis rejection, opt-in full swipe, disabled editing, RTL, Reduced Motion,
removal/remount and light/dark captures at 390/820 px. Both engines have native
browser tap checks. Chromium additionally uses native CDP touch input to verify
horizontal reveal without accidental action execution and vertical page scrolling.
WebKit drag injection and physical iOS gesture acceptance remain open. Dynamic
nested compositions, caller-style coverage and broader List integration also
remain separate acceptance work; this family is Partial.
