# Contributing to Lenso UI

Read `AGENTS.md` and `DESIGN.md` before changing source. `DESIGN.md` records the design direction and component contracts.
Lenso product primitives live in `packages/primitives`. Consume SDK-provided
components directly; document public API changes and update their callers.

## Implementation and evidence

Use compiled StyleX for component styling and native UI SDK contracts for
all interactions. Date, time and color families compose native UI SDK parts
around pure internationalized value/state models; do not restore React Aria
interaction imports. Use oxlint and oxfmt.

Preserve applicable copyright, license and modification notices for retained
adaptations; see `THIRD_PARTY_NOTICES.md`. Preserve the MIT terms of the
retained primitives. Treat imported snippets as reference material, not proof
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

SDK-backed primitives temporarily use `exactOptionalPropertyTypes: false`, with
`strict: true` and `skipLibCheck: false` retained. This is an explicit supported
compiler configuration, not an exemption from typechecking or the candidate CI
gate. The reason, consumer limitation and restoration criteria are documented in
[the upstream compatibility report](docs/upstream-ui-sdk-types.md).

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

Agents share one development server and one browser tab per checkout, including
parallel tasks. The default docs port is 4310. Before starting a process, inspect
existing listeners and their working directories; reuse a healthy server serving
this checkout. Reuse its browser tab when showing another component. If the port
belongs to another project or checkout, leave that process alone and choose an
explicit port for this checkout. A failed shared dev server should be diagnosed
before starting a replacement.

Use dev for component, theme, animation and documentation iteration. A successful
production build alone is not a reason to start a static preview. Start one only
when verifying a production-specific property such as emitted CSS, SSR/hydration,
static routing or installed-package integration, or when the user requests it.
Keep isolated test servers and tabs temporary: close them when their check ends.
Leave only the requested dev entry open for the user. Stop only owned processes;
preserve a shared dev server while other tasks or the user still use it.

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
Run `DOCS_URL=<dev-url> bun run --filter @lenso/ui-docs test:moving-glass-preferences`
for Menu, Select and cascading-menu transparency/tint during motion in Chromium
and WebKit. It covers dynamic settings, closing, focus restoration and root
popup reversal/reduced motion. Glass package tests also run the native-paint DOM
regressions; these do not replace the rendered browser check.
Run `DOCS_URL=<dev-url> bun run --filter @lenso/ui-docs test:glass-contour`
for painted foreground continuity during control and pill Toast resizing, corner
changes, AlertDialog/ActionSheet entry and Sheet detent changes in Chromium and WebKit,
in both themes. Run `DOCS_URL=<dev-url> bun run --filter @lenso/ui-docs test:native-editor-rim`
for Input/TextArea sibling contours, native typing, text selection, textarea
resizing, refs, scrolling, read-only state, form submission and cleanup in both engines and themes.
Run `bun run --filter @lenso/ui-docs test:first-paint` for Tabs and glass control
geometry before and during hydration in Chromium and WebKit, in both themes.
It serves an isolated fixture through the docs development pipeline.
Run `bun run --filter @lenso/ui-docs test:tabs-overflow` for the horizontal Tabs
overflow menu, keyboard navigation, focus return, resizing and controlled state.
Run `bun run --filter @lenso/ui-docs test:mobile-navigation` against docs dev for
painted selected-tab text, docs TabBar minimization, expansion and fallback
paint ownership during scrolling and viewport resizing in Chromium and WebKit.
It also checks native blur and the current icon's trajectory during interrupted
motion, and focus restoration when reduced motion is enabled mid-transition.
Run `test:tab-bar-performance` separately from builds and other browser tests
for the docs composition at 390px and 4× Chromium CPU slowdown. It checks six
transition endpoints and a geometry-read budget, and reports layout/style work
and frame intervals. These timings are a local simulation, not iPhone FPS.
Run `test:upstream-glass` against docs dev for TabBar tap rebound, pressed
foreground rims and retained UI SDK Sheet scroll/gesture ownership. It checks
Chromium/WebKit light/dark, keyboard and reduced motion, desktop RTL, and
Chromium native touch arbitration. It does not establish physical-device parity.
Run `bun run --filter @lenso/ui-docs test:document-loading` against docs dev for
page-local MDX requests, delayed-module hydration and article continuity during
navigation and browser history. The generated index owns metadata; compiled MDX
bodies load on demand and the route must preload them before rendering.
Run `bun run --filter @lenso/ui-docs test:loading-budget` against docs dev for
script and decoded-JavaScript budgets (including development source maps),
unused-component isolation, deferred search, and on-demand code highlighting.
Development narrows named imports from known source barrels to their owning
modules, retaining aliases, initialization side effects and HMR. Production
continues to consume the built packages. Keep search closed and source panes
offscreen when comparing initial loading; record later interaction separately.

After building docs, run
`bun run --filter @lenso/ui-docs test:production-loading` to check the static
export's JavaScript request, decoded-byte and gzip-byte budgets in Chromium and
WebKit. The test also checks homepage document-index isolation, interactive Tabs,
client navigation, search and source highlighting. Production groups shared
runtime helpers while keeping the application bootstrap outside those groups;
document loaders and bodies remain together in their lazy route. See the
[loading review](docs/research/docs-loading-tanstack-start-2026-11-09.md) for the
framework guidance, measurements and tradeoffs.

`test:deferred-content` checks development requests and first use of closed
examples, code, Markdown copying and appearance controls in Chromium and WebKit.
It also verifies that the API table remains present through hydration.
`test:loading-timing` measures a completed static export in three fresh Chromium
pages at 200,000 download bytes/second, 80 ms latency and 4× CPU slowdown. It
reports median first contentful paint, largest contentful paint before the first
interaction, Playground readiness and the first tab interaction. Run timing
comparisons separately from builds and other browser checks; these are local
simulations, not physical-device or public-CDN measurements. `DOCS_OUTPUT` can
select a separately saved export for a baseline comparison. The regular loading
regression enforces payload budgets rather than host-dependent millisecond limits.

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
requires successful verification of its exact main commit. It publishes the package set declared in `scripts/publish-packages.ts`, including
the matching Glass, primitives, documentation and initializer packages; it does not restore Changesets or the former
fixed-group automatic release process.

### Running ordinary tests

`bun run test` runs Bun tests without building dependencies or regenerating source files. DOM tests use the shared preload in `tests/setup/dom.ts`; server tests run separately without browser globals. Tests do not retain screenshots or reports.

On a fresh checkout, first run `bun run build:packages` and `bun run --filter @lenso/ui-docs generate`; repeat the appropriate build or generation step after changing its inputs.

The production suite also builds `apps/docs-starter` through its real Vite / TanStack Start host.
This checks the independent documentation framework alongside the product docs;
unit tests of generated source alone do not verify that host's prerendering.

### Preserved primitive React interop

The two exact-file `react/refs` overrides in `.oxlintrc.json` cover preserved
UI SDK `mergeProps` event callbacks and `composeRefs` commit callbacks. Neither
reads `ref.current` during render. They do not exempt other files or permit ref
reads in JSX. Other exceptions keep their concrete integration reason beside
the affected statement.

### CI scheduling and release preparation

The acceptance workflow runs the full repository check and documentation/consumer
production checks on separate runners. The documentation runner uses Turbo's
package dependency graph before building the site. The final `verify` job fails
unless both jobs succeed; candidate SHA and artifact trust rules still apply.
Only superseded PR runs are cancelled automatically. Main and candidate pushes
retain their evidence. No cross-run build-output cache is trusted by this gate.

Documentation deployment checks whether the commit is still main before fetching
the verified output or installing deployment tooling. The deploy job still uses
the protected docs environment and the artifact from its own successful gate.

Manual package releases validate exact-main verification, version and package
identities before requesting npm environment approval. Publication rechecks main
and verification after approval. Packages build through one Turbo dependency graph,
then all tarballs are validated before the first publish. OIDC provenance, ordered
publication and registry integrity checks remain required. Dispatching a release
still requires separate owner authorization.
