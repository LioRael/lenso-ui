# ComboBox live examples

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Each scenario was audited against
its actual `apps/docs/content/examples/en/combo-box/<name>.json` source.
HeroUI adaptations retain Apache-2.0 attribution.

## Source inventory

Every row has a corresponding local `<name>.tsx` and preserves the source's
named export. All 20 mounted in Chromium without an uncaught page error.

| Source scenario          | Export                 | Distinct live behavior or composition                               |
| ------------------------ | ---------------------- | ------------------------------------------------------------------- |
| `default`                | `Default`              | Six original animal IDs and labels, searchable collection           |
| `default-selected-key`   | `DefaultSelectedKey`   | Cat selected through native `defaultValue`                          |
| `disabled`               | `Disabled`             | Disabled input and trigger, Cat selected                            |
| `with-description`       | `WithDescription`      | Original description linked to the input                            |
| `full-width`             | `FullWidth`            | Three animals, full-width field in the original 400px container     |
| `render-function`        | `RenderFunction`       | Native render composition with `data-custom="foo"`                  |
| `with-disabled-options`  | `WithDisabledOptions`  | Original six options, Cat and Kangaroo disabled                     |
| `custom-filtering`       | `CustomFiltering`      | Five original animals and case-insensitive substring predicate      |
| `controlled`             | `Controlled`           | Controlled selected animal and live selected-name output            |
| `controlled-input-value` | `ControlledInputValue` | Controlled input and live input-value output                        |
| `allows-custom-value`    | `AllowsCustomValue`    | Unlisted input retained after blur                                  |
| `custom-indicator`       | `CustomIndicator`      | Original Gravity UI expand icon at 12px                             |
| `menu-trigger`           | `MenuTrigger`          | Separate focus, input-edit and manual opening policies              |
| `multiple-selection`     | `MultipleSelection`    | Native multiple values, chips, and native removal                   |
| `required`               | `Required`             | Named required field, native validation error and submit action     |
| `on-surface`             | `OnSurface`            | Original 320px surface, 24px padding/radius, required form          |
| `custom-styles`          | `CustomStyles`         | Three frameworks, source custom group/popover/item styles           |
| `custom-value`           | `CustomValue`          | All five original users, avatar URLs, fallbacks and email addresses |
| `with-sections`          | `WithSections`         | All 12 original countries, three named groups and separators        |
| `asynchronous-loading`   | `AsynchronousLoading`  | Original SWAPI endpoint, search, cancellation and cursor pagination |

## Native adaptations

- Base UI Root has no DOM node or `render` prop. `RenderFunction` composes the
  native InputGroup rather than fabricating a DOM-rendering Root API.
- Source selected keys become native values with explicit string-label and
  form-value mappings. Animal IDs remain unchanged.
- Source focus opening uses controlled native `open` events. The manual policy
  rejects input-change opening but permits trigger and arrow-key opening.
- Multiple selection uses native `Chips`, `Chip` and `ChipRemove`, not an
  independent selection model.
- Async loading uses abortable fetch instead of React Stately. The response's
  next cursor is upgraded from HTTP to HTTPS. An intersection sentinel loads
  subsequent pages; a real load-more button is available as a keyboard fallback.
- Required forms use the public TextField's native Field context and FieldError
  validation linkage. Labels and descriptions are associated with actual inputs.
- All layout and custom appearance rules are compiled StyleX. There are no
  ordinary React Aria imports or unstyled Tailwind utility strings.

## Verification

The isolated checkout does not require synchronized dependencies. Verification
used a disposable scratch copy of these modules and read-only parent
`apps/docs/node_modules`, including built `@lenso/ui` and `@lenso/tokens`
consumers. No parent configuration or dependency files were changed.

- Strict TypeScript: passed with `strict: true`, `noEmit: true`,
  `moduleResolution: "Bundler"` and automatic React JSX.
- Shared oxlint: zero warnings and errors across the 22 TS/TSX files.
- Shared oxfmt: formatted and checked the owned directory.
- Vite/StyleX: `dev: false`, no CSS layers, LightningCSS `exclude: 4`, and
  explicitly automatic JSX.
- Chromium: mounted all 20 and opened every enabled popup; no uncaught page
  errors. Repeated all 20 at 320px with dark theme and RTL; no horizontal
  document overflow.
- Native multiple selection: selected Cat and Dog, closed the popup, removed
  Cat through its native remove button, and confirmed Dog remained selected.
- Async search: intercepted the actual SWAPI URL, entered Luke, and confirmed
  only Luke Skywalker appeared. Clearing the search exercised automatic cursor
  pagination and appended Darth Vader through an HTTPS next-page request.
- Validation: empty submit produced `aria-invalid="true"` and a linked error;
  selecting Cat allowed the original successful-submit alert.
- Focus policies: focus opened the first example; focus alone did not open the
  input-edit example; typing opened it. Typing did not open the manual example,
  while ArrowDown did.
- Controlled keyboard selection: searched Dog, selected with ArrowDown/Enter,
  and confirmed the live controlled output updated.
- Sections: searching Japan retained the Asia group and one matching option.
- User composition: Martha's email appeared in the option and selecting it
  set the input to Martha.
- Other checks: Cat's native disabled-option semantics, the custom rendered DOM
  attribute, unlisted Axolotl text retained on blur, and 400px full-width geometry.

Async evidence is deterministic browser interception, not a claim that the
external API is always available. There is no pixel-diff comparison against
upstream screenshots, and this proof does not establish WCAG contrast compliance.

## Component-owner follow-up

Two visual API gaps were reported through the parent to the component owner:

1. The current ComboBox input owns its border, background, radius and shadow,
   while InputGroup is only a positioning wrapper. Source `CustomStyles`
   expects its custom InputGroup surface/ring to surround a transparent input.
   The source group styles are present here; component-level field composition
   must make them visible without demo-specific implementation workarounds.
2. `OnSurface` needs the source secondary input appearance. Styling only the
   current InputGroup background is occluded by the input background. A public
   source-authoritative appearance contract is needed on the native compound.

Behavioral verification passed. Full visual parity for these two examples
remains dependent on those component fixes; it is not claimed by this report.
