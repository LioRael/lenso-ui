# @lenso/ui

## 0.6.0

### Minor Changes

- 70f66f9: Add Light/Dark semantic roles and explicit compact navigation and stacked menu variants, with agent-facing guidance for choosing tokens and components. Preserve neutral defaults for non-Console products.
- 490061c: Remove the Page Header component and its current registry entry. Retire the Application Sidebar, Agent Page, and Page Layout documentation examples in favor of the Console Workspace template.

### Patch Changes

- c562f01: Give local content tabs a quieter text-and-rule style while keeping compact workspace tabs and improving their dark selected contrast.
- 6b79df2: Restore a tighter elevation hierarchy for panels and overlays, soften dark dialog and toast shadows, and align Text Area hover and focus treatment with Text Field.
- Lighten light-theme secondary buttons and control borders, and refine tooltip elevation in both themes.
- Updated dependencies [c562f01]
- Updated dependencies [70f66f9]
- Updated dependencies [6b79df2]
- Updated dependencies
  - @lenso/tokens@0.6.0
  - @lenso/primitives@0.6.0

## 0.5.0

### Minor Changes

- 77f2ddc: Add Text Area, Description List, Content State, Inline Alert, and Shimmer Text foundation components; deepen Text Field and Settings Row composition; and publish Settings Section and Prompt Composer registry recipes with complete Settings and Agent page templates.
- 36fcd8f: Keep Settings Row surfaces stable on hover and let consumers choose between non-activating titles and control-activating labels.
- f818d9f: Add Slider and Segmented Control components, refine Disclosure and Inline Alert defaults, and document coherent theme surface generation in Theme Lab.
- 5590fb9: Add a control-only Switch layout and use it for externally labelled Settings Rows so switch tracks align to the logical trailing edge.

### Patch Changes

- 784e1be: Add restrained, consistent interaction transitions across controls, overlays, disclosures, and status components.
- @lenso/primitives@0.5.0
  - @lenso/tokens@0.5.0

## 0.4.0

### Minor Changes

- 567af56: Add a Figma-aligned Page Layout template, expose a collapsible Sidebar section trigger, and refine Sidebar hover states to match Linear.

### Patch Changes

- Updated dependencies [567af56]
  - @lenso/tokens@0.4.0
  - @lenso/primitives@0.4.0

## 0.3.0

### Minor Changes

- 4328a44: Add an accessible, layout-independent Resize Handle primitive and a Linear-inspired styled adapter.

### Patch Changes

- Updated dependencies [4328a44]
  - @lenso/primitives@0.3.0
  - @lenso/tokens@0.3.0

## 0.2.1

### Patch Changes

- 3274fe0: Align component focus rings, offsets, control edges, and focus-visible states with the Linear reference and shared Figma library.
- fc0c9ec: Align text field default, hover, and focus-visible edges with the shared Figma specification in light and dark themes.
- c5c03b2: Align Menu and submenu elevation with the shared Popover overlay shadow in light and dark themes.
- 1192b88: Align Menu separators with the full-width Figma geometry and use a dedicated semantic color that remains visible on dark popovers.
- 1320bc6: Align item-aligned Select typography with its trigger and keep the selected option background transparent.
- 430b768: Align Combobox item anatomy and interaction states with Figma.
- 98d8ecb: Restore the hover background for the active item in item-aligned Select popups after pointer movement.
- Updated dependencies [3274fe0]
- Updated dependencies [fc0c9ec]
- Updated dependencies [1192b88]
  - @lenso/tokens@0.2.1
  - @lenso/primitives@0.2.1

## 0.2.0

### Minor Changes

- 47c0e73: Add the styled Select component with Popper and item-aligned positioning modes.

### Patch Changes

- @lenso/tokens@0.2.0
