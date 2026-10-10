# Toolbar and toggle source alignment

Reference: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, specifically the Toolbar
documentation demos and the Toolbar, ToggleButton and ToggleButtonGroup CSS.
The docs use tertiary clipboard buttons; upstream Toolbar stories instead
use secondary buttons. The local representative stories follow the docs.

## Corrections

- Toggle variants own their complete background-state maps. Composing a later
  map with a null base background had erased default and selected backgrounds,
  affecting standalone toggles, toggle groups and toolbars.
- Toolbar buttons preserve classes injected by native Button render composition.
  Connected buttons also compose the surrounding ButtonGroup's geometry so
  activation does not shrink them apart.
- Icon-only Button render adapters explicitly use icon-only Toolbar buttons.
  The inner styled adapter has its own presentation props: omitting the flag
  allowed its text-button padding to override the caller's mobile icon width.
- Toolbar dividers use the source separator radius. Clipboard separators are
  children of the following button, so their absolute geometry stays local.

No public props were removed. Existing consumers using icon-only Button with
`render={<Toolbar.Button />}` should also pass `isIconOnly` to that render
adapter, as the updated English and Chinese demos do.

## Current evidence

- Tokens, UI, Storybook and docs typechecks pass; production docs and Storybook
  builds pass.
- `test:browser actions choice` passes: 84 action-story mounts and 100 choice
  mounts across both themes, with selection, disabled activation, keyboard,
  focus, responsive geometry, RTL and reduced-motion checks.
- Added checks cover default/ghost and selected hover colors, local clipboard
  divider geometry, 36px desktop/40px mobile icon sizing, and settled active
  scale of 1 for attached toolbar buttons.
- The Button/Toolbar native-render browser regression passes together with the
  existing element/callback render cases: injected caller styles, refs and
  activation are retained.
- The scoped production docs example proof passes for all four requested
  families in both locales: 272 mounts, zero missing references, no viewport
  overflow, no client errors and no checked semantic accessibility violations.
  Color-contrast checking is disabled in that maintained runner.
- Representative settled renders use published HeroUI 3.2.6 CSS compiled in
  scratch, mapped source state attributes and matching frame/font settings.
  Attached Toolbar, ToggleButton Variants and ToggleButtonGroup SelectionMode
  match measured dimensions, colors, radii and typography at 1200px/390px in
  light/dark themes. Current docs screenshots were also inspected.

The scratch comparison renders source styles on equivalent static anatomy.
It does not claim upstream React Aria runtime parity, every demo's pixel
identity, or WCAG AA compliance. The full repository candidate gate was not run;
no landing or publication was requested.
