# Unreleased: control and layout compatibility

These are source changes; use the migration details for the version you consume.

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
the removed API. Check the current native Base UI props and generated
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

Ordinary components use native Base UI props and composition, including
`disabled`, `onClick`, `render`, refs and state-style callbacks. Replace former
wrapper APIs such as `isDisabled`, `onPress` and `asChild` where the new native
contract requires it. Date, time and color components retain their specialized
React Aria contracts; do not apply an ordinary-control rename indiscriminately.

Use StyleX `xstyle` for component overrides and keep the consumer's StyleX
compiler settings compatible with the precompiled package: `dev: false`,
no CSS layers, and preserved native `:dir()` selectors. Former registry
recipes, token generators and styled component aliases are not compatibility
exports. Preserved headless data-grid/sidebar behavior remains available from
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
