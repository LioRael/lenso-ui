# Prepared release: UI SDK migration 0.11.0

This release temporarily excludes `exactOptionalPropertyTypes` from the supported
TypeScript configuration for SDK-backed primitives. `strict` remains enabled and
primitive declaration checking remains enabled (`skipLibCheck: false`). Consumers
using exact optional properties may still encounter upstream declaration errors;
see [the compatibility report](docs/upstream-ui-sdk-types.md). Prepared versions
are not a publication receipt.

This release migrates React interactions to native UI SDK contracts while retaining
Lenso's StyleX appearance and Glass presentation. It includes the subsequent
material, menu, sheet, slider, wheel and popup placement corrections. These are
breaking API changes for consumers of UI 0.10.x and primitives 0.8.x.

This release uses the current official StyleX integration and component
architecture. Consumers upgrading from UI/Tokens 0.9.2 must still migrate the
removed raw-rule CSS integration described below.

Publish in dependency order:

| Package             | Version  | Scope                                                       |
| ------------------- | -------- | ----------------------------------------------------------- |
| `@lenso/tokens`     | `0.11.0` | Official StyleX declaration modules and current materials   |
| `@lenso/glass`      | `0.2.0`  | WebKit native paint and stable Menu/Select material handoff |
| `@lenso/primitives` | `0.9.0`  | Native SDK product primitives; removes redundant entries    |
| `@lenso/ui`         | `0.11.0` | Native UI SDK contracts and restored Lenso presentation     |
| `@lenso/docs`       | `0.3.0`  | Current documentation host and official StyleX integration  |
| `create-lenso-docs` | `0.3.0`  | Template pinned to Docs 0.3.0                               |

Retired Exact experiments are not part of this release.
The removed `@lenso/stylex-build` package is not restored or republished.

Upgrade UI and Tokens together. Configure the official StyleX Vite/Rolldown
plugin or Next Babel/PostCSS integration; remove imports of the retired
`stylex-rules.json` exports and standalone atomic CSS. Keep importing the
theme/base `styles.css` entry. Next applications must transpile the token and
documentation presentation modules and include their declaration sources in
StyleX scans. Existing projects using the retired integration require this
migration before upgrading. The remaining component migrations below still
apply when upgrading from the older registry packages.

Unstyled Command parts come directly from `@ui-sdk/react/command`.
Use `@lenso/ui/command` for Lenso presentation. The redundant
`@lenso/primitives/command` entry has been removed; migrate imports to the SDK's
named parts (`Command`, `CommandInput`, `CommandList`, `CommandItem`, and so on).
The unused DataGrid and ResizeHandle entries have also been removed. Sidebar, SectionIndex and SwipeActions expose native SDK parts from
`@lenso/primitives`; List, model controls and WheelPicker expose core definitions. Existing Lenso Table components
and the TanStack Table examples remain available.
Sidebar behavior now uses SDK core primitives and a `createParts` React adapter.
Import its framework-independent definition from `@lenso/primitives/sidebar/core`.
Replace Group/Provider/targetId integrations with native layout and a
`createSidebarController`; open callbacks now receive native change details.
Use data-open/data-closed and data-selected/data-nested for state styling;
navigation items render anchors.
UI pins the new primitives version in addition to Glass and Tokens. Docs pins
the matching UI, Glass and Tokens versions through the packed workspace manifests.

Publication remains a manual `Release` dispatch on an exactly verified `main`
commit, using input `0.11.0`, the protected `npm` environment, npm Trusted
Publishing and provenance. Check the publisher configuration for every package,
including the new Glass package, before approving the environment. The workflow
does not create Git tags or GitHub Releases. No npm publication is implied by
the prepared versions or by pushing the source commits.

The migration requires React 19.2 or newer. Replace former Base UI callbacks,
state fields and wrapper parts with native SDK APIs; there is no compatibility
layer or dependency patch. ContextMenu uses Root `compact` for its action bar and
Content `preview`, `bar`, `layout`, `previewAlign` and `dim` for presentation.
SDK `presentation` keeps its native popup/sheet meaning. See
[upstream declaration notes](docs/upstream-ui-sdk-types.md) for SDK type limitations.

# Unreleased: control and layout compatibility

- SDK `data-slot` attributes remain SDK-owned. Lenso materials and selectors use
  `data-lenso-slot`; migrate custom selectors that targeted Lenso presentation names.
  Slider thumbs must be children of `Slider.Track`.
- List selection uses `value`, `defaultValue` and `onValueChange(value, details)`
  with key arrays. Replace `selectedKeys`, `defaultSelectedKeys` and
  `onSelectionChange`; callbacks can refuse changes with `details.cancel()`.
- SectionIndex, SwipeActions and WheelPicker expose native change details and
  controllers. Wheel changes distinguish scrolling, dragging and list navigation.
- Date, time, calendar and color fields expose cancellable `onValueChange` and
  serializable controllers/agent actions. Their callbacks retain date/time/color
  value models. Form reset restores the initial domain value.
- Picker disclosure uses native `open`, `defaultOpen` and cancellable
  `onOpenChange`; remove `isOpen` and value-model open/close calls. Position
  popovers with native `side` and `align` instead of `placement`.
- Picker `Dialog` wrappers are removed. Put content directly in `Popover`, name
  that native content with `aria-label` or `Title`, and use `Close` and
  `PopoverDescription` for native popup operations and naming.
- A composed ColorPicker owns channel values and change callbacks. Configure its
  color `space` on the root; nested Area, Slider and Swatches use that owner.
  Standalone controls create their own native ColorPicker. Swatch render state
  uses the SDK's `selected` property.

These are source changes; use the migration details for the version you consume.

- WebKit ordinary glass now uses native backdrop blur, tone and foreground rims
  instead of automatically copying marked page backgrounds. Menu and Select retain
  this material through movement, rest and submenus. Chromium keeps its moving
  material until fitted optics finish decoding. Interactions and motion paths
  are unchanged; copied-source refraction on WebKit is intentionally reduced.

- Direct documentation visits with a trailing slash preload their article before
  hydration, including Cloudflare's directory redirects. No migration is required.

- Menu, Select and cascading menus preserve `glassTransparency` and `glassTint`
  during opening and closing. Moving opaque surfaces hide native backdrop paints;
  clear and tinted appearances keep their selected blur and wash. Default motion
  and public APIs are unchanged; no consumer migration is required.

- TabBar minimization caches expanded geometry and suspends indicator work during
  contraction and expansion. Moving groups retain native glass blur and refit
  optical detail after settling. Reversals, reduced motion and focus restoration
  keep their existing contracts; no API migration is required.

- Documentation examples in closed disclosures and distant scenes load on demand.
  Playground source, appearance-panel controls and the original Markdown are
  deferred until use. Document route preparation runs concurrently with article
  preparation; the rendered article and API remain present through hydration.
  Material Playgrounds import their own implementation modules, so a Tabs visit
  does not load sibling Input, Slider or GlassMagnifier Playgrounds.

- Documentation search now loads its dialog and engine on first use. Live source
  highlighting starts when code becomes visible and loads only the requested
  language. Plain source remains selectable and copyable while highlighting
  loads. Development narrows source-barrel imports and prebundles the used
  third-party entrypoints; component imports and public APIs are unchanged.

- Documentation loads only the current MDX body and prepares it before rendering
  the article. Development prebundles the transitive icon library to avoid its
  per-icon request waterfall. Glass retains native blur until its replacement
  backdrop paints, and Tabs uses capsule corners before client measurement.
  Existing component props and imports require no migration.

- Tabs and SegmentedControl keep selected labels above the indicator in WebKit.
  Floating glass fallback paints follow their navigation owner during scrolling
  and browser-chrome changes. No API migration is required. Custom TabBar group
  styles must preserve the component's flex sizing for minimization to contract.

- Menu, Select and cascading submenu morphs now use native backdrop blur and
  simple CSS edges during motion. Content refraction and live rim painting are
  removed from these transitions; the existing fitted panel material returns
  after opening settles. Existing props, selection, focus and motion trajectories
  require no migration. Review custom optical overrides in both themes.
  Invisible closing tails and retained closed Select panels release their
  background paints; reopening restores the current material pose.
  Native paint stacks omit unused calibrated layers; WebKit also omits transparent
  normal tint layers. Geometry updates no longer rewrite an unchanged native-paint
  marker.

- Replace `FieldGroup` with `Fieldset.Group`, and `TextField.Group` with a labelled
  `Fieldset` containing `Fieldset.Group`. Compatibility entries remain, but groups
  now form a continuous surface. Use a plain layout container for separate controls.
  `TextField` supplies row geometry inside a group; use `Fieldset.Row` for other
  settings and `layout="stacked"` for long or multiline text fields.
- Input, TextArea and InputGroup default to ordinary form surfaces. Set `glass`
  explicitly for floating inputs; adornments belong inside an InputGroup whose
  shell owns the material. Do not add a second material to its inner controls.
  Revisit overrides assuming 44px Input height: content fields now use 52px
  single-line height, 26px corners and 112px multiline minimum height.
- InputOTP uses 44px circular digit fields. Review fixed-width overrides; a
  six-digit row with a separator is 328px wide and contracts in narrow containers.
  Existing value, paste, form and composition contracts remain supported.
- Glass pressed-lighting and connected-optics changes require no prop or import
  migration. Review custom active colors, elastic clearance and elevation;
  explicit `--lenso-glass-panel-shadow` and `--lenso-glass-shadow` retain precedence.
  Use matching material recipes and `data-lenso-backdrop` sources for connected
  surfaces. Mixed recipes and unmarked WebKit fallbacks have optical differences.
- PageControl defaults to prominent small Glass; use `variant="plain"` to omit
  its capsule. Keyboard entry now uses one selected dot with arrow/Home/End
  navigation. Controlled owners must update `page` from `onPageChange`.
- SegmentedControl now shares Tabs presentation. Choose `size="lg"` for 46px
  segments; the small default is 28px rather than the initial 44px height.
  It retains radio/form semantics; use Tabs for associated content panels.
- WheelPicker's default viewport is 216px rather than 180px. Controlled owners
  manage accepted values and form reset. SwipeActions never executes a full-swipe
  action unless that action opts in through `fullSwipe`; applications own deletion,
  confirmation and undo.
- Editable List rows need stable `itemKey` and `textValue`; update application
  state from selection/reorder callbacks. Prefer integrated `startActions` and
  `endActions` for list rows. Set `--lenso-list-surface` at the shared ancestor for
  custom row colors. RefreshControl's Viewport must own scrolling; return the
  asynchronous work from `onRefresh` and disable refresh during editing.

# Unreleased: SectionIndex interaction

SectionIndex activates on primary pointer-down instead of pointer release and
captures the pointer immediately. Scrubbing reports each newly entered enabled
letter; the release click is suppressed. Consumers should not assume that
`onValueChange` waits for pointer-up. Keyboard and modified-click contracts are
unchanged. Its visible letter column is now compact and has no persistent
current-letter fill; the gesture strip remains 44px wide. Dark index text now
uses semantic tint (the default iOS 27 blue), while light appearance uses the
contrast-preserving tint-text role. Keep positioning and
scroll-spy state in the consuming application. This is a source change only.

# Unreleased: button and toggle families

`ToggleButton` now uses ordinary `Button` geometry and presentation, without
glass or elastic effects. Prefer `bordered`, `borderless` or `prominent`;
legacy `default` and `ghost` map to `bordered` and `borderless`. Replace toggles
that need glass with `GlassToggleButton`, exported from `@lenso/ui` and
`@lenso/ui/glass-toggle-button`. It retains native Toggle pressed-state,
keyboard, ref and render contracts and shares GlassButton material and sizes.

`ButtonGroup` accepts `GlassButton`; `ToggleButtonGroup` accepts
`GlassToggleButton`. Keep one button family per group. Configuration now reaches
wrapped members, including render-composed triggers. Group `prominent` works
for either family; ordinary variants are `bordered`/`borderless` and the glass
neutral variant is `default`. Joined members draw seams automatically;
`Separator` remains available but renders hidden, so remove manual separators.
`ButtonGroup.isDetached` joins the existing toggle group option for separated
controls. Joined glass members suppress individual elastic movement. Full-width
horizontal groups distribute members equally; vertical members fill the group.
Disabled groups disable all members, including members with `disabled={false}`.

Glass icon-only buttons now follow their requested size: sm/md/lg use
28/34/50px squares instead of always using 50px. Update layouts that relied on
the former fixed frame. These source changes are not a publication.

# Unreleased: official StyleX integration

Declarations now ship as JS modules and are compiled by the application's
official StyleX integration, including SSR builds. The private build package,
raw-rule JSON exports and standalone atomic CSS are removed. Use the official
Vite/Rolldown plugin or Next Babel/PostCSS. Include tokens and docs presentation
modules in PostCSS scans and transpile both packages in Next. Theme/base CSS
remains in `styles.css`. Existing consumer configuration requires migration.
This source change is not authorization to publish.

# Lenso UI 0.9.1 and Docs/tooling 0.1.0

## Unreleased Select refinement

Add `PopupButton` and the `@lenso/ui/popup-button` entry as a plain native button
using the owner-supplied iOS 27 Figma measurements. Compose it through
`Select.Trigger` or `Menu.Trigger`'s `render` prop when an overlay is needed;
selection, menu contents and motion belong to those owners. The preliminary
PopupButton Root/Item/List/Portal selection API is removed. Custom component
Select triggers now own their presentation, matching Menu's render composition.

Select trigger values and popup items now share typography and 44px row
geometry. Both opening modes use Menu's spring surface/content animation and
respect reduced motion. Overlapping popups morph from the trigger; anchored
popups expand from their anchor. Popup ancestors stay opaque so glass can
sample the backdrop during motion. No consumer prop changes are required: `Select.Positioner` retains
`alignItemWithTrigger={true}` by default; set it to `false` for an anchored
dropdown. The documentation playground now exposes both modes and starts with
a selected value so the overlapping text alignment can be reviewed.

## Release scope

This release publishes `@lenso/ui` and `@lenso/tokens` at `0.9.1`, plus the
first `0.1.0` releases of `@lenso/glass`, `@lenso/docs`, `create-lenso-docs`
and `@lenso/stylex-build`. Unchanged `@lenso/primitives@0.7.0` remains preserved.
CLI and MCP packages remain private.

Glass is published after tokens and before UI, with its LGPL notice and corresponding
source. The UI package pins this glass release; a subsequent tokens version requires
a matching new glass version.

UI/tokens include the current Popover, Tooltip, Toast and Input OTP fixes.
Docs provides content-only MDX compilation, the documentation shell and its
CLI. The initializer creates a content-only project. StyleX build support
provides package and consumer CSS processing.

Dispatch `release.yml` on `main` with version `0.9.1`. Publication retains the
exact-main verification gate, the protected `npm` environment, packed export
and dependency validation, OIDC provenance and registry integrity checks.
New package names require initial publication and per-package Trusted Publisher
configuration before CI can publish them using OIDC.

# Lenso UI 0.9.0

The owner authorized publishing `@lenso/ui@0.9.0` and
`@lenso/tokens@0.9.0` through the manual CI release workflow.
`@lenso/primitives@0.7.0` remains unchanged and is not published by this job.

## Changes since 0.8.0

- Remove the public Dropdown compatibility family; use the native `Menu`
  family instead.
- Preserve caller props during Button render composition, fix Drawer content
  scrolling and fixed sections, and focus the InputGroup control when clicking
  a noninteractive adornment.
- Refine date, time and color component composition, ComboBox appearance,
  windowed ListBox behavior and focus-ring geometry.
- Add typed theme configuration exports: `defineTheme`, `themeToVariables`,
  `themeToCSS` and `themeTokens`, with their corresponding public types.
- Expose `@lenso/tokens/theme.css` and `@lenso/tokens/stylex-rules.json` for
  supported consumer CSS integration.
- Update authored documentation and generated API/tooling contracts. The theme
  builder supports light/dark configuration, exports and typed share URLs.
  Documentation and local developer tools are not additional npm packages
  published by this release.

## Migration from 0.8.0

Update both packages together:

```sh
bun add @lenso/ui@0.9.0 @lenso/tokens@0.9.0
```

Keep importing `@lenso/tokens/styles.css` once for the default theme and
component styles. Applications compiling their own StyleX must follow the
current [consumer integration guide](apps/docs/content/lenso/en/react/getting-started/stylex.mdx).

Replace Dropdown imports and composition with the exported `Menu` parts.
There is no Dropdown alias; an old documentation URL redirect does not restore
the removed API. Check the current native UI SDK props and generated
TypeScript declarations rather than mechanically renaming an upstream API.

Theme configuration is additive. See the
[theming guide](apps/docs/content/lenso/en/react/getting-started/theming.mdx)
for semantic overrides and portal scope limitations. Theme builder links now
use individual query parameters; old `?theme=...` JSON links no longer restore
settings. Import saved JSON settings and use Share to generate a new link.

For upgrades from 0.7.x or earlier, also apply the architecture migration
recorded in the 0.8.0 section below.

## Verification scope and limitations

Publication requires successful `Verify reconstruction` verification of the
exact main SHA. The maintained gate runs `bun run check`, the production docs
build and `bun run test:production`, including installed-tarball and Next CSS
consumer checks. The release job separately builds and validates both release
tarballs before publishing.

This is not a claim of complete live-example browser coverage or WCAG AA
compliance. Imported snippets remain reference content, not proof of working
local demos. Some colors retain known normal-text contrast limitations. The
historical deferred-work list below records the 0.8.0 baseline, not a current
0.9.0 defect inventory.

## Publication

Dispatch `.github/workflows/release.yml` on `main` with version `0.9.0`.
The protected `npm` environment requires owner approval. After approval, CI
checks the exact main verification result, validates versions, exports,
dependencies and licenses in both tarballs, then publishes tokens before UI
with npm Trusted Publishing and provenance. It verifies registry integrity and
`latest` tags for both packages. No local npm token or manual `npm publish`
is required.

The workflow does not create Git tags or GitHub Releases and does not publish
primitives, CLI, MCP or build-tool packages.

# Lenso UI 0.8.0 release history

This release replaces the 0.7.x UI and token architecture. It is not a
drop-in update. The owner approved publishing the verified package baseline
before completing every upstream example and visual-parity check.

## Packages

- `@lenso/ui@0.8.0`: source-backed React components with native Base UI contracts.
- `@lenso/tokens@0.8.0`: theme CSS and compiled StyleX component maps.
- `@lenso/primitives@0.7.0`: unchanged; not rebuilt or published by this release job.

## Migration

Install both updated packages together:

```sh
bun add @lenso/ui@0.8.0 @lenso/tokens@0.8.0
```

Import the stylesheet once:

```tsx
import "@lenso/tokens/styles.css";
import { Button } from "@lenso/ui";

<Button disabled={false} onClick={() => save()}>
  Save
</Button>;
```

Ordinary components use native UI SDK props and composition, including
`disabled`, `onClick`, `render`, refs and state-style callbacks. Replace former
wrapper APIs such as `isDisabled`, `onPress` and `asChild` where the new native
contract requires it. Date, time and color components retain their specialized
React Aria contracts; do not apply an ordinary-control rename indiscriminately.

Use StyleX `xstyle` for component overrides and keep the consumer's StyleX
compiler settings compatible with the precompiled package: `dev: false`,
no CSS layers, and preserved native `:dir()` selectors. Former registry
recipes, token generators and styled component aliases are not compatibility
exports. Headless Sidebar behavior remains available from
`@lenso/primitives`; it does not restore the retired styled UI.

## Deferred work

Remaining date/color factory cleanup, Chinese live-example integration,
historical API-table replacement, Storybook scenario coverage and exhaustive
upstream visual comparison are not completion claims for 0.8.0. The known
Drawer content/footer scrolling, InputGroup adornment focus and ComboBox
appearance gaps remain tracked in the family evidence documents.

## Publication

The manual `Release` workflow reuses `.github/workflows/release.yml` and the
`npm` environment for npm Trusted Publishing. It requires a successful
`Verify reconstruction` run for the exact main commit, validates both package
versions and tarballs, publishes tokens before UI with provenance, then verifies
registry integrity and `latest` tags. No npm token is stored in the repository,
and this workflow never publishes primitives.

## Docs host migration

Standalone Lenso Docs now uses Vite / TanStack Start, matching the product docs.
Remove `--turbopack` from development scripts. A custom `build` module now exports
Vite configuration rather than NextConfig; remove old Next/Babel/PostCSS host
configuration. Presentation factories and MDX components execute during SSR and
in the browser; move filesystem work into source adapters. Authored content,
basic configuration, shared UI and static `out/` deployment remain supported.

Before publication, `bun run docs:create <directory>` creates an independent site
with packed local dependencies. See `packages/docs/README.md` for setup and
migration details. This workflow does not publish packages.
