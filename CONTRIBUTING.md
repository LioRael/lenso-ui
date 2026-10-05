# Contributing to the reconstruction

Read `AGENTS.md` and `DESIGN.md` before changing source. HeroUI v3.2.6 at
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` is the reconstruction authority.
The former Lenso UI architecture is not a compatibility target.
`packages/primitives` remains outside the reconstruction boundary and must
remain byte-for-byte unchanged.

## Implementation and evidence

Use compiled StyleX for component styling and native Base UI contracts for
ordinary interactions. React Aria is limited to date, time and color families
and supporting parts that depend on those contexts. Use oxlint and oxfmt.

Preserve HeroUI Apache-2.0 notices and identify adaptations. Preserve the MIT
terms of the unchanged primitives. Treat imported snippets as reference
material, not proof of a runnable local example.

For changed behavior, identify the concrete failure and exercise the relevant
semantics, geometry, focus and keyboard operation. Record theme, responsive,
RTL and reduced-motion evidence where applicable. Document incomplete behavior
and visual coverage explicitly; neither an export nor a successful mount proves
full source parity. Keep generated documentation and styles consistent with
their sources by running their maintained generators.

Public API, import, CSS or behavior changes need migration notes explaining
what consumers must change. Material visual changes need the affected themes
and states recorded. This wholesale reconstruction replaces the former
packages, registry and token-generation graph; its README and family evidence
documents must state the replacement and its remaining limitations.

## Verification

Use Node 26.10.0 and pnpm 12.9.1, as configured in `.mise.toml` and the root
`package.json`. Install from the lockfile:

```sh
pnpm install --frozen-lockfile
```

Common entrypoints:

```sh
pnpm build                 # workspace production builds and their generated inputs
pnpm dev:docs              # prepare necessary packages/data, then start docs
pnpm dev:storybook         # prepare package builds, then start Storybook
pnpm --filter @lenso/ui test src/components/button
pnpm --filter @lenso/ui typecheck
```

The last two commands are a normal component iteration, after the initial
package build. They do not build the docs site. The root dev entrypoints
start UI/tokens watchers alongside the selected app, rather than watching
only an app that imports stale package output. Public API/documentation
changes additionally need the explicit generator below; no new generator
watch service is maintained. Theme CSS or declaration changes still need
`pnpm build:packages`; the dev watchers cover component implementation and
StyleX maps, not CSS copying or declaration emission. Docs generation uses
`pnpm --filter @lenso/ui-docs generate`; developer-tool builds request only
`generate:contract`. Direct docs dev/typecheck/build commands use the same
incremental generator. Upstream import/sync is an explicit maintenance task,
not a normal development prerequisite.

While iterating, run format and lint on affected paths, the affected package's
typecheck, and the maintained regression tests for the change. Root script
changes also require `pnpm exec tsc -p scripts/tsconfig.json` and their narrow
Node tests. Inspect current package scripts before choosing commands.

Run production docs or Storybook builds when their build integration changes,
not as a blanket requirement for documentation or policy-only edits. The
authoritative candidate workflow runs the complete repository gate and consumer
verification for the exact candidate SHA.

For Next explicit CSS integration changes, use
`pnpm --filter @lenso/stylex-build test:next`: the maintained small production
and browser fixture checks `prepareNext` delivery, including custom global
error styling on cold root-layout failure. The older `next-delivery.mjs` runner
is retired. This proof is pinned to Next `16.3.8` production/non-watch builds;
it does not certify dev/HMR or the docs application's full SSG build.

`pnpm test:production` builds one Storybook artifact, checks native RTL keyboard
geometry, installs already-built local tarballs, and runs the small Next CSS fixture.
These checks target production focus, themes and CSS delivery;
component behavior matrices belong to the component and docs integration suites.
Other family proofs remain available with
`pnpm --filter @lenso/storybook test:browser calendar` (or another suite name).
Calling that runner without suite names runs all retained scenarios, including
network-dependent source asset replay; it is not a normal iteration or CI gate.
Do not invoke the retired family fixture builders. The installed consumer
catches distribution/exports/CSS faults that workspace imports cannot expose.

Playwright proof children and the locale browser script use Node 26's native
type erasure: transpiler function-name helpers cannot cross Playwright's
browser-function serialization boundary. Their script TypeScript projects
enforce erasable syntax. Other typed scripts reuse the existing `tsx` runner.

For changed documentation interactions, start the built docs application using
`pnpm --filter @lenso/ui-docs start` and run
`pnpm --filter @lenso/ui-docs test:browser` against it. Set
`LENSO_DOCS_TEST_URL` when using a different address. Full live-example coverage
claims additionally require `pnpm --filter @lenso/ui-docs test:examples`; scoped
or partial runs must be reported as scoped or partial.

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
