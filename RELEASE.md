# Unreleased: Base UI 1.9.0 adaptation

The workspace now pins `@base-ui/react@1.9.0`. Lenso package versions are
unchanged; this source update does not authorize publication.

- `Menu` exposes native `FilterProvider`, `Input`, `List`, `Clear`, `Empty`
  and `useFilter` composition. Native filtering remains an upstream preview
  API. Wrap each searchable menu root or submenu root in its own provider.
  Nonfilterable menus require no composition changes.
- Select, ComboBox and Autocomplete inherit the upstream async highlighting,
  collection performance and interaction fixes. Multiple-value contracts
  accept native readonly arrays. Highlight callbacks forward the originating
  event; pointer events may be `MouseEvent` or `PointerEvent`, and typing can
  report the reason `none`.
- Supplying `actionsRef` no longer opts Select, ComboBox or Autocomplete out of
  automatic popup unmounting. Consumers with externally controlled exit
  animations must call `eventDetails.preventUnmountOnClose()` while closing
  in `onOpenChange`, then `actionsRef.current?.unmount()` when finished.
  Do not add this opt-out for ordinary CSS transitions.
- Drawer inherits native gesture and virtual-keyboard fixes. Touch interaction
  regions can use `data-base-ui-swipe-ignore="x"` or `"y"` to ignore only that
  gesture axis. An empty attribute ignores both axes; mouse/pen pointer drags
  ignore a marked region regardless of its value. `Drawer.Content` retains its
  existing native swipe-exclusion semantics.

The performance improvements are upstream changes, not a local benchmark
claim. New filtering composition is documented separately from the preserved
upstream live-example inventory. `packages/primitives` source, API and tests
remain unchanged.

# Lenso UI 0.9.1 and Docs/tooling 0.1.0

This release publishes `@lenso/ui` and `@lenso/tokens` at `0.9.1`, plus the
first `0.1.0` releases of `@lenso/docs`, `create-lenso-docs` and
`@lenso/stylex-build`. Unchanged `@lenso/primitives@0.7.0` remains preserved.
CLI and MCP packages remain private.

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
pnpm add @lenso/ui@0.9.0 @lenso/tokens@0.9.0
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
exact main SHA. The maintained gate runs `pnpm check`, the production docs
build and `pnpm test:production`, including installed-tarball and Next CSS
consumer checks. The release job separately builds and validates both release
tarballs before publishing.

This is not a claim of exhaustive HeroUI visual parity, complete live-example
browser coverage or WCAG AA compliance. Imported snippets remain reference
content, not proof of working local demos. Source-exact colors retain known
normal-text contrast limitations. The historical deferred-work list below
records the 0.8.0 baseline, not a current 0.9.0 defect inventory.

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
- `@lenso/tokens@0.8.0`: HeroUI theme CSS and compiled StyleX component maps.
- `@lenso/primitives@0.7.0`: unchanged; not rebuilt or published by this release job.

## Migration

Install both updated packages together:

```sh
pnpm add @lenso/ui@0.8.0 @lenso/tokens@0.8.0
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
