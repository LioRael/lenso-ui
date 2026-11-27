# @lenso/tokens

## 0.12.0

### Minor Changes

- 46e0840: Update Swipe Actions to use capsule buttons and round the revealed edge of the row. Set `labelPlacement` on actions with an icon to display the label inline, beneath the capsule, or only as its accessible name. Existing calls need no changes.
- d000b05: Add `layout="vertical"` to TabBar for icon-only side navigation with accessible labels and an inset current-page indicator. Vertical groups do not use horizontal scroll minimization.

### Patch Changes

- 4b5db40: Reduce the white brightening layer on light menu panels so backdrop colors show through more clearly.
- a3804ec: Share TabBar and pill Toast motion, table windowing and drag and drop, list-data actions, menu preview placement, and icon shapes across framework adapters. React retains its existing component and hook entry points.
- 3d006ac: Enable press lift, vertical drag, and spring settling for the vertical TabBar selection indicator while retaining its resting inset and native link navigation.

  Vertical TabBars now honor `minimized`, `defaultMinimized`, and `autoMinimize`. Scroll minimization remains off unless enabled; consumers that share a controlled state across layouts can pass `false` in vertical mode to keep the rail expanded.

## 0.11.5

No changes in this release.
