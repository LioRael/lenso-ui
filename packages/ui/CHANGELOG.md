# @lenso/ui

## 0.12.0

### Minor Changes

- 46e0840: Update Swipe Actions to use capsule buttons and round the revealed edge of the row. Set `labelPlacement` on actions with an icon to display the label inline, beneath the capsule, or only as its accessible name. Existing calls need no changes.

### Patch Changes

- 4b5db40: Reduce the white brightening layer on light menu panels so backdrop colors show through more clearly.
- Updated dependencies [4b5db40]
- Updated dependencies [c662474]
- Updated dependencies [46e0840]
  - @lenso/tokens@0.12.0
  - @lenso/glass@0.3.0

## 0.11.5

### Patch Changes

- 94b7431: Release host-ref cleanup, resilient spring scheduling, worker-backed light
  contours and bounded backdrop copies. Preserve native focus and interaction
  contracts without changing public APIs or optical formulas.
- ca216d3: Update UI SDK to beta.8 and restore `exactOptionalPropertyTypes` support for
  `@lenso/primitives`, including its packed declarations. This does not change
  the supported TypeScript settings for the full `@lenso/ui` package.
- Updated dependencies [94b7431]
- Updated dependencies [ca216d3]
  - @lenso/glass@0.2.5
  - @lenso/primitives@0.9.2
  - @lenso/tokens@0.11.5
