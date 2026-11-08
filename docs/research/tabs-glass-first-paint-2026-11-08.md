# Tabs and glass first paint

## Finding and change

Before hydration, Tabs painted its shared indicator using default dimensions and
the first item's position. This was visibly wrong for a different initial
selection, custom tab height or list padding. An empty selection could also
paint a phantom indicator. The homepage's local height variable only addressed
one instance.

The shared Tabs styles now anchor the initial indicator to the active tab's
actual box, scoped to its list. The existing measured motion takes over when
the list is ready. Browsers without anchor scope use the selected tab's own
background until measurement. The homepage height workaround was removed.
Base UI selection, keyboard handling and refs remain unchanged; caller StyleX
overrides retain their final position in composition.

Slider's pre-script thumb rectangle was a hidden placeholder, not a visible
first-paint defect. Its existing native positioning script is retained.

## Verification

- Chromium and WebKit, light and dark: six Tabs configurations, including
  second/third initial selection, custom height and padding, vertical layout,
  RTL and empty selection. Checks cover server HTML with JavaScript disabled,
  delayed React entry, and animation frames through hydration. Custom indicator
  color and arrow-key selection also pass.
- The same fixture compares 23 boxes across Switch sizes and checked states,
  Slider, Glass, GlassButton, GlassToggleButton, GlassContainer and Toolbar.
  Visible Slider frames retain the correct value position. TabBar's selected
  third link retains its existing fallback geometry through hydration.
- Both engines: 13 actual documentation routes return 200; all 113 Tabs lists
  on those routes have correct initial selection geometry or hidden empty ink.
  Routes: tabs, tab-bar, slider, switch, glass, glass-button,
  glass-toggle-button, glass-container, toolbar, toggle-button-group,
  button-group, glass-magnifier and color-slider.
- Both engines: the homepage's initial indicator geometry and shaded backdrop
  remain correct before hydration and after switching away and returning.
- Package builds, affected typechecks and lint pass. Four existing Tabs DOM
  geometry tests pass. The installed consumer check passes exports, types,
  server rendering and production asset checks.
- React Doctor remains at 84 with 24 existing issues; no score regression.

Run `bun run --filter @lenso/ui-docs test:first-paint` to repeat the isolated
fixture and `bun run --filter @lenso/ui-docs test:home-showcase` with the docs
development server running to repeat the homepage check.

This verifies layout and the targeted homepage paint regression, not pixel
parity for every material or state. Real Safari/iOS and the older-browser
anchor fallback were not exercised. No release or deployment was performed.

## Horizontal overflow follow-up

Horizontal `Tabs.ListContainer` now uses a trailing chevron to reveal the tabs
that do not fit in the available width. It no longer creates an internal scroll
viewport. The active tab stays on the bar when a menu item is chosen or the
container shrinks. The original Base UI tab receives activation; its controlled
value, disabled state and panel association remain authoritative. Hidden tabs
are excluded from the pointer and optical controller's item list.

This follows the user's requested overflow interaction. Apple's current
[edit menu guidance](https://developer.apple.com/design/human-interface-guidelines/edit-menus)
describes a compact horizontal menu that expands through a trailing chevron.
Using that presentation for Tabs overflow is a Lenso convention, rather than a
claim about iOS 17 segmented controls. Vertical Tabs retain their existing
scrolling behavior.

`test:tabs-overflow` passes in Chromium and WebKit, light and dark, with LTR and
RTL layouts, disabled entries, keyboard opening and dismissal, selection and
focus return, resize in both directions, and controlled selection rejection.
The first-paint regression fixture is shared between these checks. Its browser
hot updates are disabled so concurrent development edits do not reload a test
in the middle of an interaction. Development previews retain hot updates.

The homepage check additionally covers 320px and 390px widths. It distinguishes
decorative WebKit backdrop-copy overflow from an actual scroll viewport: the
navigation cannot change its scroll offsets, and visible tabs remain within
its bounds. The existing first-paint and return-to-scene checks are retained.

Package builds, UI/docs typechecks, affected lint, the four Tabs DOM geometry
tests and installed consumer verification pass. Docs React Doctor remains at
84/100 with 24 issues. The UI scan reports 21 findings outside the changed Tabs
logic, including a cleanup finding in `utils/theme-scope.tsx`; these are not
resolved by this change. Real Safari/iOS has not been exercised.
