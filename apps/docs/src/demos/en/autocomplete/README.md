# Autocomplete reconstruction

All **24** English source archives have matching runnable `.tsx` modules here.
There are 25 TSX files including the shared, demo-local `_native.tsx` anatomy.
The archive's original named exports are retained; `default.tsx` retains its
original default export. No registration or manifest changes are needed.

Authority: HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
The modules adapt Apache-2.0 source; attribution is retained in the files.
The original Gravity icon and HeroUI avatar assets are used.

## Native interaction adaptations

- Base UI owns selection, filtering, popup search, focus, controlled value/open
  state, disabled options and removable chips. The searchable input is inside
  the popup; no React Aria compatibility layer is used.
- Chips, their remove buttons, the clear button and the native trigger are
  siblings inside `Autocomplete.InputGroup`, avoiding nested buttons. The
  positioner explicitly anchors to that whole group, not the small caret button.
- Labels and descriptions reference actual elements. Option detail text uses
  ordinary spans; groups have explicit label IDs. There are no artificial Field
  roots around the demos.
- `required.tsx` uses native named selection inputs, real `required` props,
  submit validation, associated errors and `aria-invalid`. Successful submission
  retains the source confirmation alert.
- Asynchronous filtering retains the source Star Wars endpoint and loading
  feedback. AbortController prevents stale or unmounted requests from committing.
  Fetch failures are shown instead of leaving a permanent spinner.
- Location search retains all source cities and the 300ms pending state. The
  timer is outside the filter predicate, avoiding source render-time state updates.
- Virtualization retains 1,000 source users, 50px rows and name/email filtering.
  Native `virtualized` mode, indexed options and highlight-driven scrolling keep
  offscreen keyboard navigation functional. At most 14 options are mounted.

## Verification

Executed against the parent's readonly installed dependency graph using a scratch
Vite production consumer. Both packages and demo styles were compiled with
`dev: false`, CSS layers disabled and LightningCSS `exclude: 4`; imported Next
TSX used automatic JSX.

- Strict TypeScript with `noUncheckedIndexedAccess`: passed for all 25 TSX files.
- Shared standard oxlint: zero warnings/errors across all demo and proof code.
- Shared standard oxfmt: passed.
- Real headless Chromium: **24/24** modules mounted, zero runtime exceptions.
- Behavioral proof passed: keyboard filtering/selection, search-clear focus,
  controlled value/multiple/open, currency custom value/code search, role search,
  disabled roots/options, email recipients, keyboard tag removal, actual form
  values/required errors/successful submit, async response race, delayed location
  search, associated section groups, virtual scrolling and keyboard navigation
  beyond the initially mounted window.
- Geometry proof passed: **96** mounts across light/dark and 390px/1280px
  viewports; no page/popup horizontal overflow. Multi-recipient popup width stayed
  equal to the whole field after the caret trigger shrank.

`browser-proof.mjs` preserves the behavioral and geometry assertions. A built,
isolated demo host supplies navigation:

```js
import { proveAutocomplete, proveAutocompleteGeometry } from "./browser-proof.mjs";

await proveAutocomplete(page, (name) => openDemo(name));
await proveAutocompleteGeometry(page, (name) => openDemo(name));
```

The async behavior test intercepts the source endpoint with deterministic
responses; this proves request/response/cancellation behavior, not third-party
service uptime. Screenshots were inspected for mobile recipient/chip layout.
Pixel-identical upstream side-by-side comparison, RTL, reduced-motion and real
endpoint availability are not claimed by this evidence.

React Doctor's local file scan (telemetry and supply-chain requests disabled)
reported no errors. Its remaining warnings concern the common anatomy's
conditional branches, abort-guarded async effect completion, and intentionally
preventing navigation on the source example's form submit. The state-initializer
warning was corrected.
