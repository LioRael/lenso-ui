# Component development

This surface uses the rebuilt `@lenso/ui` and native theme CSS from
`@lenso/tokens/styles.css`. Read [COVERAGE.md](./COVERAGE.md) before treating
a story as upstream reconstruction evidence.

```sh
pnpm --filter @lenso/storybook dev
pnpm --filter @lenso/storybook build
pnpm --filter @lenso/storybook typecheck
pnpm exec oxlint --config packages/standard/oxlint.json --deny-warnings \
  packages/storybook/stories packages/storybook/.storybook packages/storybook/*.mjs
node packages/storybook/source-inventory.mjs
node packages/storybook/source-inventory.mjs --json
```

`source-inventory.mjs` retrieves the actual pinned HeroUI component story
files and named exports. It prints a source-linked inventory to stdout; it
does not copy upstream code into the application. Matching a local export
name alone never counts as source adaptation.

The JSON contract contains `source` (repository/version/commit), `files`
(filename/family/path/URL/sourceExports/scenarios) and `totals`. Every exact
source export has a scenario record containing `sourceExport`, `localFile`,
`localExport` and `status`. Unimplemented local fields are `null`. Status is
`unimplemented` or `adapted-unverified`; source review is not visual parity.
The offline directory argument must contain all 68 pinned story files.

After building, run the iframe smoke with an existing Playwright installation:

```sh
node packages/storybook/iframe-smoke.mjs \
  packages/storybook/storybook-static \
  /absolute/path/to/playwright/index.mjs
```

The smoke starts a loopback-only static server, mounts every story in light
and dark themes, checks actual component DOM, fails on runtime errors and
checks selected native props and StyleX geometry. Add a mount assertion when
adding a family. It does not substitute for source side-by-side comparison
or keyboard interaction proof.

For repeatable image-dependent checks, append `--replay-source-assets`.
This retrieves genuine source image bytes read-only from the original public
URLs, verifies image responses, caches them in memory and reports SHA-256
hashes. It does not replace images with placeholders or alter DOM `src` props.
Live-network availability is a separate check. The intentionally invalid
Avatar.Fallback URL is the only allowed failed request, scoped to its exact
story and URL; the resulting fallback must still become visible.

An optional comma-separated family filter selects a narrower run, for example
`InputGroup,TextField`. With no filter, every local story is mounted. Adding
families requires their native mount and scenario-specific workflow assertions,
especially for overlays and async collections; an index entry is not proof.

## Contribution boundary

Keep source story definitions reviewable in `stories/`. Adapt each actual
upstream scenario, including advanced scenarios, args and controls. Use
component-native Base UI contracts, bounded React Aria date/time/color parts,
native HTML and StyleX. Do not import the Next documentation registry,
upstream Tailwind classes, or unadapted source snippets.

The HeroUI source adaptations retain Apache-2.0 attribution. They are
modifications of the pinned component story files, not a compatibility layer
for the upstream interaction API.
