# Autocomplete demos and regressions

These demos adapt HeroUI v3.2.6 commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`; Apache-2.0 notices remain in the
modules. `_native.tsx` owns their shared local anatomy.

Base UI owns filtering, selection, controlled value/open state, focus, disabled
options and removable chips. The searchable input stays inside the popup.
SearchField presentation wraps the actual Autocomplete input; replacing it with
a separate SearchField input would replace the native keyboard/search owner.
Tag presentation composes onto native chips, not a second selection collection.

Chips, remove buttons, selection clear and the trigger are siblings, avoiding
nested buttons. The popup anchors to the whole field rather than the caret.
Labels/descriptions reference real elements. Required examples use named native
selection inputs, associated validation errors and real submitted values.

Asynchronous examples abort stale requests and show failures. Delayed location
search keeps its timer outside filtering. Virtualized examples retain indexed
options and highlight-driven scrolling for offscreen keyboard navigation.

## Focused regression helpers

`browser-proof.mjs` checks the selectable scenes: controlled values/open state,
filtering, clear/remove actions, form submission/validation, asynchronous races,
groups, virtualization and overflow. Its host supplies navigation to a built demo:

```js
import { proveAutocomplete, proveAutocompleteGeometry } from "./browser-proof.mjs";

await proveAutocomplete(page, (name) => openDemo(name));
await proveAutocompleteGeometry(page, (name) => openDemo(name));
```

`composition-proof.mjs` exports
`proveAutocompleteComposition(page, openDemo, capture)`. Its Default/MultipleSelect
matrix checks source-derived search chrome, tag geometry, keyboard actions, clear
focus and whole-field popup width across themes, desktop/mobile and LTR/RTL.
`openDemo` receives the scenario, theme and direction; `capture` can retain current
screenshots. Measurements wait for finite popup animation rather than disabling it.

These checks exist because mounting alone missed unpadded search chrome, square
chips and caret-sized popup anchors. The empty polite status must collapse with
results, retain padding for no matches, and collapse again after clearing.

Use the workspace's Node 26.10/pnpm 12.9 toolchain and current built source.
Results are run-specific ignored artifacts, not a source prerequisite or a
frozen acceptance record. Deterministic asynchronous responses prove lifecycle
handling, not external service uptime. These helpers do not certify upstream
pixel parity or replace the complete docs example matrix.
