# Autocomplete demos and regressions

`_native.tsx` owns the shared local composition. Retained adaptations keep their
Apache-2.0 terms and original copyrights; see
[`THIRD_PARTY_NOTICES.md`](../../../../../../THIRD_PARTY_NOTICES.md).

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

`browser-proof.ts` checks the selectable scenes: controlled values/open state,
filtering, clear/remove actions, form submission/validation, asynchronous races,
groups, virtualization and overflow. Its host supplies navigation to a built demo:

```js
import { proveAutocomplete, proveAutocompleteGeometry } from "./browser-proof.ts";

await proveAutocomplete(page, (name) => openDemo(name));
await proveAutocompleteGeometry(page, (name) => openDemo(name));
```

Use the workspace's Bun 1.4.4 toolchain and current built source.
Results are run-specific ignored artifacts, not a source prerequisite or a
frozen acceptance record. Deterministic asynchronous responses prove lifecycle
handling, not external service uptime. These helpers do not certify upstream
pixel parity or replace the complete docs example matrix.
