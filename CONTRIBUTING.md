# Contributing to Lenso UI

Read `AGENTS.md` and `DESIGN.md` before changing source. `DESIGN.md` records the design direction and component contracts.
Existing `packages/primitives` component source and public API remain unchanged; its tests and development tooling may evolve. The owner-authorized Command family is an additive exception.

## Implementation and evidence

Use compiled StyleX for component styling and native Base UI contracts for
all interactions. Date, time and color families compose native Base UI parts
around pure internationalized value/state models; do not restore React Aria
interaction imports. Use oxlint and oxfmt.

Preserve applicable copyright, license and modification notices for retained
adaptations; see `THIRD_PARTY_NOTICES.md`. Preserve the MIT terms of the
unchanged primitives. Treat imported snippets as reference material, not proof
of a runnable local example.

For changed behavior, identify the concrete failure and exercise the relevant
semantics, geometry, focus and keyboard operation. Record theme, responsive,
RTL and reduced-motion evidence where applicable. Document incomplete behavior
and visual coverage explicitly; neither an export nor a successful mount proves
full source parity. Keep generated documentation and styles consistent with
their sources by running their maintained generators.

Public API, import, CSS or behavior changes need migration notes explaining
what consumers must change. Material visual changes need the affected themes
and states recorded. Document supported behavior and remaining limitations
against the current implementation.

## Verification

Use Bun 1.4.4, as configured in `.mise.toml` and the root `package.json`.
Documentation hosts, preserved primitives and npm publishing tooling use Node 26.10.0.
Install from the lockfile:

```sh
bun install --frozen-lockfile
```

Common entrypoints:

```sh
bun run dev:docs              # generate metadata, then serve workspace sources with HMR
bun run dev:storybook         # prepare package builds, then start Storybook
bun run --filter @lenso/ui test
bun run --filter @lenso/ui typecheck
```

Start daily component, docs and visual iteration with `bun run dev:docs` from
the repository root. Keep that server running and review changes at its printed
URL. It generates metadata once and starts TanStack Start/Vite against workspace
sources; invoking bare Vite in `apps/docs` skips generation. Reuse a
healthy existing dev server. If it fails, inspect its output and fix the dev
failure before continuing the hot-reloading workflow.

The last two commands are a normal component iteration, after the initial
package build. They do not build the docs site. Docs development resolves UI,
tokens, glass and documentation modules directly to source. Story controls use
`apps/docs/tsconfig.story.json` to read component source types. Production builds
continue to consume package output and declarations. The Story panel uses
the headless provider with StyleX, without adding Tailwind tooling.
Docs development needs no package build watchers. Another session may clean or
rebuild package output for static acceptance while docs development continues.
Each Vite process owns its dependency and MDX caches. Generated files are replaced
atomically and unchanged content keeps its timestamp; publishing the generated
index does not restart the Vite configuration. Turbo generation tasks use the
incremental generators instead of restoring source artifacts from its cache,
which would bypass atomic publication. Static output directories are excluded
from development watching. The official Fumadocs MDX plugin tracks authored content, and Vite tracks
page-local examples and their raw source. Component edits do not trigger API
extraction or an additional documentation compiler. Run `generate:api` and
restart dev after changing the public prop contract.
Theme CSS, StyleX maps and component implementation changes reload from source.
Build packages when validating distribution or emitted declarations. Docs generation uses
`bun run --filter @lenso/ui-docs generate` when complete generated artifacts are
needed; developer-tool builds request only
`generate:contract`. Docs dev/build commands run the incremental generator once before Vite;
typecheck reads existing generated artifacts. Upstream import/sync is an explicit maintenance task,
not a normal development prerequisite.

While iterating, run format and lint on affected paths, the affected package's
typecheck, and the maintained regression tests for the change. Root script
changes also require `bun check --no-script -p tests/tsconfig.json` and their narrow
tests. Inspect current package scripts before choosing commands.

For the maintained docs browser check, keep dev running and use
`bun run --filter @lenso/ui-docs test:browser`. Set `DOCS_URL` to its printed
URL and `DOCS_HMR=1` to include a temporary, restored example edit.

For development stylesheet continuity, run
`DOCS_URL=<dev-url> bun run --filter @lenso/ui-docs test:hmr` against the running
server. It temporarily edits and restores homepage sources, slows stylesheet
requests, and checks every frame in Chromium and WebKit. It also verifies that
unchanged CSS does not rewrite active stylesheets and a failed request retains the old
styles. Run it without simultaneous edits to those homepage files.

Tests print their results to the console and do not retain screenshots or
reports. Temporary build fixtures are removed after each run. If a
visual investigation needs an image, capture it as a separate explicit task
rather than adding a persistent output path to a test.

Run `bun run --filter @lenso/ui-docs test:dev-isolation` for development/build
isolation and bilingual code highlighting. It rejects development imports from
package `dist` directories, verifies Chromium and WebKit hydration, copying and code colors, and exercises index
publication and static HTML output while the server stays running.
Run `bun run --filter @lenso/ui-docs test:canvas-navigation` for the WebKit
PNG encoding regression: a pending encoding runs while document replacement is
held, then the test verifies exact pixels and the absence of resource errors.
Run `bun run --filter @lenso/ui-docs test:first-paint` for Tabs and glass control
geometry before and during hydration in Chromium and WebKit, in both themes.
It serves an isolated fixture through the docs development pipeline.
Run `bun run --filter @lenso/ui-docs test:tabs-overflow` for the horizontal Tabs
overflow menu, keyboard navigation, focus return, resizing and controlled state.

Run production builds for acceptance that depends on production behavior:
changed build/CSS delivery integration, static export or distribution, a
production-only regression, an explicitly requested production proof, or the
final candidate gate. State the reason and use the smallest relevant build or
fixture. Ordinary component, content and visual iteration uses dev;
documentation or policy-only edits need no production build. The
authoritative candidate workflow runs the complete repository gate and consumer
verification for the exact candidate SHA.

For generated docs StyleX assets, run `bun run --filter @lenso/ui-docs test:stylex-artifacts` after building docs. `bun run test:production` also validates already-built packages in an isolated installed consumer: exports, types, server rendering and emitted assets.

Automated tests use Bun and a simulated DOM. They do not establish real browser layout, painting, cross-browser compatibility or visual parity. For visual acceptance, inspect the affected states manually and describe the environment and scope of that inspection.

Use the narrowest useful checks while iterating, but require all applicable
checks to pass for the final candidate. Do not substitute a previous revision's
proof, a source-only snippet or a partial run for the requested acceptance
scope.

## Landing and release policy

The owner-approved reconstruction policy replaces the former Changesets
fixed-group release process. The removed registry, release-status tooling and
automatic publication workflow are retired; a Changeset is no longer required.
Migration notes, licenses and verification remain required.

For this reconstruction landing, the owner waived Delta Review approval.
This does not waive verification or any future hosting-required review.

Publish a signed candidate to `delta/verify/<short-sha>`. The
`Verify reconstruction` workflow must pass its `verify` job for that exact
push SHA before a non-force fast-forward to `origin/main`. Verify the landed
SHA and its main CI result. Main may reuse only trusted successful internal
candidate evidence and the verified docs artifact for that same SHA, workflow
and inputs; unavailable, stale or unverifiable evidence requires the full normal
verification path. A pull-request result is not trusted candidate evidence.
Preserve unrelated work and never bypass failed or missing required checks.

This landing delivers source only. Do not publish npm packages, create release
tags or invoke deployment as part of it. Package versions in the source tree
are not authorization to publish. Any future release or restored automation
requires a separate explicit owner decision, including versioning, publication
and migration requirements.

The owner subsequently authorized the 0.8.0 UI/styles release and manual CI
publication. See `RELEASE.md` for the migration and deferred scope. The manual
`Release` workflow uses npm Trusted Publishing from the `npm` environment and
requires successful verification of its exact main commit. It publishes only
`@lenso/tokens` and `@lenso/ui`; it does not restore Changesets or the former
fixed-group automatic release process.

### Running ordinary tests

`bun run test` runs Bun tests without building dependencies or regenerating source files. DOM tests use the shared preload in `tests/setup/dom.ts`; server tests run separately without browser globals. Tests do not retain screenshots or reports.

On a fresh checkout, first run `bun run build:packages` and `bun run --filter @lenso/ui-docs generate`; repeat the appropriate build or generation step after changing its inputs.

The production suite also builds `apps/docs-starter` through its real Next host.
This checks the independent documentation framework alongside the product docs;
unit tests of generated source alone do not verify that host's prerendering.

### Preserved primitive React interop

The two exact-file `react/refs` overrides in `.oxlintrc.json` cover preserved
Base UI `mergeProps` event callbacks and `composeRefs` commit callbacks. Neither
reads `ref.current` during render. They do not exempt other files or permit ref
reads in JSX. Other exceptions keep their concrete integration reason beside
the affected statement.
