# @lenso/ui

## 0.12.0

### Minor Changes

- 46e0840: Update Swipe Actions to use capsule buttons and round the revealed edge of the row. Set `labelPlacement` on actions with an icon to display the label inline, beneath the capsule, or only as its accessible name. Existing calls need no changes.
- d000b05: Add `layout="vertical"` to TabBar for icon-only side navigation with accessible labels and an inset current-page indicator. Vertical groups do not use horizontal scroll minimization.

### Patch Changes

- 4b5db40: Reduce the white brightening layer on light menu panels so backdrop colors show through more clearly.
- a3804ec: Share TabBar and pill Toast motion, table windowing and drag and drop, list-data actions, menu preview placement, and icon shapes across framework adapters. React retains its existing component and hook entry points.
- 11d363d: Share tab overflow measurement and TabBar scroll tracking with the Solid components.
- fc7878f: Expose the sheet snap-point presentation tracker through `@lenso/primitives/sheet/core`. React and Vue can now share the same floating-to-attached transition and cleanup behavior.
- 11d363d: Share table column sizing with Solid, including fixed, percentage, fractional, and bounded column widths.
- 3d006ac: Enable press lift, vertical drag, and spring settling for the vertical TabBar selection indicator while retaining its resting inset and native link navigation.

  Vertical TabBars now honor `minimized`, `defaultMinimized`, and `autoMinimize`. Scroll minimization remains off unless enabled; consumers that share a controlled state across layouts can pass `false` in vertical mode to keep the rail expanded.

- Updated dependencies [4b5db40]
- Updated dependencies [a3804ec]
- Updated dependencies [c662474]
- Updated dependencies [11d363d]
- Updated dependencies [fc7878f]
- Updated dependencies [11d363d]
- Updated dependencies [46e0840]
- Updated dependencies [d000b05]
- Updated dependencies [3d006ac]
  - @lenso/tokens@0.12.0
  - @lenso/glass@0.3.0
  - @lenso/primitives@0.10.0

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
