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

Use Node 24.18.0 and pnpm 11.5.0, as configured in `.mise.toml` and the root
`package.json`. Install from the lockfile:

```sh
pnpm install --frozen-lockfile
```

Run the current repository gate and production consumer builds:

```sh
pnpm check
pnpm --filter @lenso/ui-docs build
pnpm --filter @lenso/storybook build
```

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
SHA and its main CI result. Preserve unrelated work and never bypass failed or
missing required checks.

This landing delivers source only. Do not publish npm packages, create release
tags or invoke deployment as part of it. Package versions in the source tree
are not authorization to publish. Any future release or restored automation
requires a separate explicit owner decision, including versioning, publication
and migration requirements.
