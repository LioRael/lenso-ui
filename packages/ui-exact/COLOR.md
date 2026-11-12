# Color components for Exact Web

ColorSwatch and ColorSwatchPicker use the shared Lenso color styles and the same
pure `react-stately/Color` value model as the React library. The model's Color
export has no React runtime imports. Exact owns selection state and native radio
activation; the Web adapter normalizes equivalent color notations for display.
These are ordinary color-content controls, without a Glass material.

## Public composition

`ColorSwatch(id, color, label, size, shape)` displays a named image. Sizes are xs,
sm, md, lg and xl; shapes are circle and square. It composes a native color fill
over the shared transparency checkerboard. Explicit color content keeps its color
in both appearances. The stock compiler's literal-color warning is retained;
it describes intentional color samples rather than theme surfaces.

`ColorSwatchPickerState` contains id, label, value, name, disabled, required,
size, shape, layout and direction. Value is an empty string or a color supported
by the shared parser: hex including alpha, RGB, HSL or HSB syntax. Named CSS colors
and arbitrary CSS expressions are not a replacement for that model. Use canonical
hexa keys for state and item values when selection must agree before initialization;
notation equivalence is projected after the adapter initializes.

`ColorSwatchPicker(state)` contains explicit `ColorSwatchPickerItem` controls.
Each item takes the same state, unique id, color, label, disabled and a change
action. That action receives the selected item's declared color string. The
application retains the selected value; the adapter does not introduce another
selection store. Name should identify the native radio group uniquely.

Layouts are grid (a wrapping row), stack (a column), and palette (the shared
12-column palette). Direction is ltr or rtl. The native inputs derive from the
existing generated primitive Radio, preserving labels, disabled state and values.
The adapter provides consistent directional, Home and End navigation, while
native buttons/inputs own activation and browser tap behavior.

The [compiled consumer](example/color.contract) includes transparent samples,
disabled items, all five sizes, shape/layout/direction changes, equivalent RGB
updates and removal/remount. The standalone swatch and picker remain Partial:
rich/custom item content, inherited color context, custom indicators, caller-style
coverage, complete native form/reset behavior and native platform adapters remain
open. ColorField/InputGroup are tracked in [COLOR_FIELD.md](COLOR_FIELD.md). [ColorSlider](COLOR_SLIDER.md) is also implemented with remaining gates.
Area and the enclosing Picker remain pending.

## Verification

Run against an isolated compiled consumer output from the repository root:

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/color-browser.mjs
```

`PLAYWRIGHT_MODULE` selects an installed browser module when necessary;
`LENSO_EXACT_TEST_ARTIFACTS` chooses an evidence directory. The driver validates
the response fingerprint of the actual application script. The initial capture
blocks the Web adapter to compare native semantics, geometry, color and checkerboard
before and after initialization. Browser touch contexts use native taps; these
are not physical-device tests.

The pure model tests guard equivalent notation identity, alpha distinction,
empty value identity and rejection of invalid color values. A separate model
bundle dependency graph contains no React or React DOM runtime module. No
performance improvement is inferred from that dependency boundary.

[ColorArea](COLOR_AREA.md) adds primitive-backed two-axis editing with remaining
API, geometry, motion and device gates. ColorPicker has separate acceptance gates.

[ColorPicker](COLOR_PICKER.md) now provides an explicit composed popover API;
automatic context and broader open-state/native APIs remain open.
