# Lenso UI 0.8.0

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
