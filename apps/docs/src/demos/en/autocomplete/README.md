# Autocomplete reconstruction

All **24** English source archives have matching runnable `.tsx` modules here.
There are 25 TSX files including the shared, demo-local `_native.tsx` anatomy.
The archive's original named exports are retained; `default.tsx` retains its
original default export. No registration or manifest changes are needed.

Authority: HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
The modules adapt Apache-2.0 source; attribution is retained in the files.
The original Gravity icon and HeroUI avatar assets are used.

## SearchField / Tag composition correction

The shared EN `_native.tsx` owns this correction for all 24 demos. The actual
readonly pinned archive was compared, not a current upstream release:

- `apps/docs/src/demos/en/autocomplete/default.tsx`
- `apps/docs/src/demos/en/autocomplete/tag-group-selection.tsx`
- `packages/styles/components/autocomplete.css`
- `packages/styles/components/search-field.css`
- `packages/styles/components/tag.css` and `tag-group.css`

Source-derived geometry now replaces the former custom wrapper/chip geometry:

- Field/label gap: 4px rather than 8px.
- Popup search outer: nonshrinking wrapper with 12px inline / 4px block padding,
  replacing the unpadded sticky surface wrapper.
- Search group: 36px height, field radius/border, secondary default fill,
  no shadow and native focus ring.
- Search icon/input: 16px icon with 12px logical start margin and
  8px input inline padding, rather than wrapper-gap positioning.
- Search clear: persistent 20px slot, 8px logical end margin and 12px glyph;
  disabled/invisible while empty.
- List: source 320px maximum rather than the 420px demo override.
- Small tags: Tag maps supply 8px horizontal / 2px block padding,
  12px default radius and 12px/16px medium-weight text; the list gap is 6px.
- Selection clear: the core's native default 14px glyph replaces the
  demo-provided 16px glyph.

The SearchField style maps compose onto structural wrappers around the actual
`Autocomplete.Input`; replacing it with `SearchField.Input` would replace the
native combobox keyboard/search owner. Tag maps compose onto
`Autocomplete.Chip`, not a second selection collection. Native ChipRemove keeps
its existing 12px glyph and 24px pseudo-element hit target. Chips, clear and
caret remain sibling controls, with a whole-field popup anchor. The caret is
positioned at the logical trailing edge rather than consuming tag-list width.
Custom demo styles remain last; the core library, CN demos, build configuration,
dependencies, primitives and legal notices are unchanged by this correction.

### Current correction evidence

The [merged validation report](../../../../../../docs/final-merged-validation.md)
records successful current-source builds, typechecks, lint and formatting under
Node **24.18.0**, after canonical CN regeneration and the final Empty padding fix.
Earlier materialization and disk-capacity failures are retained separately.

`composition-proof.mjs` passed all 16 Default/MultipleSelect combinations in
light/dark, 1280px/390px and LTR/RTL, producing 32 actual screenshots. It checks
keyboard open/filter/select/Escape, search-clear focus, tag removal, selection
clear, source geometry and overflow. Measurements wait for the native popup's
finite animation to settle rather than disabling it.

The empty status stays mounted and polite: populated results leave it at zero
height, no matches retain the padded message, and clearing the query restores
zero height. The first option starts 6px after the search wrapper.

This focused run does not repeat the 24-demo behavioral suite, establish rendered
HeroUI pixel parity, or supply a React Doctor score.

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

## Historical verification (before the composition correction)

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
