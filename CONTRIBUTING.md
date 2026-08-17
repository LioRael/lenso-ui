# Contributing to Lenso UI

This repository is a design-system monorepo. A change is complete only when the implementation, its generated distribution artifacts, the documentation surface, and the relevant verification evidence agree.

## Start locally

Use the pinned toolchain:

- Node `24.18.0`.
- pnpm `11.5.0`.
- React `19.2.x` and Base UI `1.7.x` for the public component packages.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm dev
```

`pnpm dev` starts the Next documentation site and component lab. To work only on the docs app:

```bash
pnpm --filter @lenso/docs dev
```

The component lab is the same Next application that publishes the documentation pages. Do not add Storybook or Ladle as a second component catalog.

## Repository map

| Path                                      | Responsibility                                        | Edit directly?                             |
| ----------------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `packages/ui/src`                         | Styled Foundation Components and visual adapters      | Yes                                        |
| `packages/primitives/src`                 | Headless Product Primitives                           | Yes                                        |
| `packages/tokens/src/foundation.json`     | Primitive token values                                | Yes                                        |
| `packages/tokens/src/semantic.json`       | Public semantic token roles                           | Yes                                        |
| `packages/tokens/src/themes/*.json`       | Complete Light and Dark theme values                  | Yes                                        |
| `packages/tokens/src/lenso.resolver.json` | DTCG resolution order and theme contexts              | Yes                                        |
| `registry/`                               | Generated shadcn-compatible distribution source       | Only the builder inputs and source recipes |
| `apps/docs/contents`                      | Public MDX documentation and playground configuration | Yes                                        |
| `apps/docs/components/docs`               | Shared docs shell, demos, and playground runtime      | Yes                                        |
| `docs/adr`                                | Durable architecture decisions                        | Yes, when a decision changes               |

The token and registry outputs are checked-in artifacts. Do not edit generated files to make a source change appear complete.

## Component workflow

For a new or changed styled component:

1. Update the component implementation and StyleX styles under `packages/ui/src/<family>/`.
2. Preserve the explicit subpath export in `packages/ui/package.json`; the package has no root component barrel.
3. Add or update source-local browser tests. Interactive components use Vitest Browser Mode with the Playwright provider; accessibility checks use `axe-core` where the component has a meaningful tree to audit.
4. Add or update the canonical registry specification in `tooling/registry-builder/src/cli.ts`. The builder reads the package source and emits the package-to-registry parity files.
5. Add the matching docs page under `apps/docs/contents/components`, `patterns`, or `primitives`. Register the page in `apps/docs/contents/catalog.ts` and add a playground configuration or demo when the page needs interactive controls.
6. Regenerate the token and registry outputs:

   ```bash
   pnpm generate
   ```

7. Inspect the generated diff, then run the focused package tests and the full verification commands.

For a headless Product Primitive, keep visual styling and default CSS out of `packages/primitives`. If a styled adapter is needed, put it in `packages/ui` and document the dependency explicitly. The current Sidebar is the reference shape: `@lenso/primitives/sidebar` owns state and behavior, while `@lenso/ui/sidebar` supplies the StyleX visual layer.

## Token workflow

The authoritative token graph is the DTCG source in `packages/tokens/src`. The generator resolves the graph and writes these artifacts:

- TypeScript semantic names and theme values.
- StyleX variables for package and registry consumers.
- Public semantic CSS.
- DTCG and contract manifests.
- The Figma mapping manifest.
- The Consumer-owned theme adapter template.

After changing a token source, run:

```bash
pnpm --filter @lenso/token-generator generate
pnpm --filter @lenso/token-generator test
pnpm generate
```

Review every generated representation together. Complete Light and Dark theme values are required; partial `ThemeScope` overrides are a runtime consumer feature, not a substitute for a complete default theme.

## Documentation workflow

Each public docs page is an MDX content file with frontmatter. The page slug must be present in `apps/docs/contents/catalog.ts`; the content-collection transform rejects unregistered pages.

Use the existing component pages as the writing and composition model:

- State what the component or pattern is for.
- Explain usage boundaries and accessibility behavior.
- Show the public subpath import and compound-part composition.
- Keep Consumer-owned content, routing, labels, and icons in the example.
- Describe package versus registry ownership when the page is a Recipe or adapter.

Format MDX with the repository formatter:

```bash
pnpm format:mdx
pnpm format:mdx:check
pnpm --filter @lenso/docs typecheck
```

The docs application imports `@lenso/tokens/styles.css` and `@lenso/ui/styles.css` once in its root layout. Demos should consume the public package subpaths, not private source files, so the component lab exercises the same API that Consumers install.

## Generated artifacts and freshness

The following are generated from source and must stay synchronized:

- `packages/tokens/src/index.ts`, `styles.css`, `tokens.json`, `contract.json`, `figma-map.json`, and the StyleX bridge.
- `registry/components`, `registry/setup/setup.json`, `registry/registry.json`, `registry/parity-manifest.json`, and `registry/tokens.stylex.ts`.
- `apps/docs/public/r`, including the stable registry output.

Run the freshness check after generation:

```bash
pnpm --filter @lenso/token-generator check-generated
```

It compares the generated paths with Git. A dirty generated path is evidence that generation has not been committed yet; it is not a reason to hand-edit or delete the output.

## Changesets and public changes

Add a Changeset for every public API, semantic token, registry item, or material visual-contract change:

```bash
pnpm changeset
```

The public fixed group is `@lenso/ui`, `@lenso/primitives`, and `@lenso/tokens`. Changesets releases them together. `@lenso/fonts` remains private until its asset provenance is complete. A registry source change is a public change even when the TypeScript API is unchanged.

Include a migration note when a Consumer must change imports, CSS, registry source, or behavior. For visual corrections, record the affected theme and state when that context matters.

## Verification

Use the narrowest useful check while iterating, then run the repository gate before handoff:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

`pnpm check` runs formatting, linting, generation, generated-artifact freshness, package typechecks, browser tests, and builds through Turbo. Browser tests may need the local Chromium installation used by the CI workflow:

```bash
pnpm --filter @lenso/ui exec playwright install chromium
```

For a docs-only change, at minimum run `pnpm format:check`, `pnpm --filter @lenso/docs typecheck`, and `pnpm --filter @lenso/docs build`; the full `pnpm check` remains the release gate.

## Release path

Release automation runs from `main` in `.github/workflows/release.yml`. Changesets versions the fixed public group, runs `pnpm version`, regenerates the immutable registry snapshot, and publishes through npm Trusted Publishing with provenance. The stable registry alias is generated on normal source changes; a versioned `/r/v/{version}/` snapshot is written only during the release snapshot step and is immutable.

Do not publish packages manually from a feature branch or rewrite an existing immutable registry snapshot. If the release state or package versions are unclear, inspect the package manifests, Changesets, Git tags, and generated release manifest together.

## Worktree hygiene

Read `AGENTS.md` before repository operations. Preserve unrelated dirty files, use a focused Worktrunk worktree for isolated work under the framework workspace, and never force-remove a dirty or active worktree. Keep implementation, generated output, docs, and changeset changes scoped to the task.
