# UI SDK controlled Drawer release position

Observed with `@ui-sdk/react` and `@ui-sdk/core` `0.1.0-beta.1` in Chromium.
This is a runtime issue, separate from the declaration errors recorded in
[upstream-ui-sdk-types.md](upstream-ui-sdk-types.md).

## Reproduction

The standalone [native fixture](../apps/docs/test/sdk-drawer-controlled-fixture.tsx)
imports only React and the public SDK Drawer entry. It contains no Lenso
components, materials, motion hooks or stylesheets. Mount it with a `#fixture`
element, using the docs Vite configuration.

1. Keep **Controlled snap points** checked and open the drawer at `0.25`.
2. Drag the handle upward and release at a larger snap point.
3. Compare the output, `data-snap-point`, computed `translate` and panel position.
4. Uncheck the option and repeat using SDK-owned snap state.

At a 720px viewport with a 658px panel, the controlled fixture reported snap
point `1` after release but retained `translate: 0px 478px` and a top edge of
540px, its former quarter-height stop. The uncontrolled fixture reported `1`,
settled at `translate: 0px`, and had the expected top edge of 62px.
A Lenso Sheet using controlled snap state also reproduced this mismatch.
This establishes the observed Chromium case; other engines are unverified.

## Local scope

The Sheet component retains the native controlled API. Its surface follows
native rendered motion; it does not correct the SDK's drag destination or
intercept pointer events. SDK dependencies are unmodified.

The documentation examples use SDK-owned snap state, observe
`onSnapPointChange` for their button labels, and call the public
`createDrawerController().setSnapPoint()` for their expand/collapse actions.
This keeps a single owner for snap state and exercises the SDK's existing
controller contract. It does not fix upstream controlled dragging; consumers
requiring a controlled `snapPoint` still encounter that issue.
