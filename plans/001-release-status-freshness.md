# Plan 001: Generate and check current release-status documentation

> Drift check: `git diff --stat 83795f1..HEAD -- README.md docs/architecture.md apps/docs/contents/start/release-status/content.mdx package.json tooling packages/*/package.json`.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `83795f1`, 2026-08-30

## Why this matters

The fixed public package group is `0.4.0`, while the primary README and published
release-status page still advertise `0.2.0` and its immutable registry path.

## Current state

- `packages/ui`, `packages/primitives`, and `packages/tokens` manifests are `0.4.0`.
- `README.md:5,63-69`, release-status MDX, and `docs/architecture.md:102` say `0.2.0`.
- Existing generation/check scripts do not enforce release-doc freshness.

## Scope

In scope: those docs, one small deterministic check/generator under `tooling/`, and
package scripts/tests. Out of scope: publishing packages or changing package versions.

## Steps

1. Add a deterministic script that reads and verifies the Changesets fixed-group
   manifests agree, then updates or checks marked version slots in the three docs.
2. Refresh the slots to `0.4.0` and `/r/v/0.4.0/`; do not replace unrelated prose.
3. Add the check mode to `pnpm check` and test mismatch failure without mutating files.

## Verification

- `pnpm check` -> exit 0.
- Running the check after a temporary in-test mismatch -> nonzero in the automated test.
- `git diff --check` -> no output.

## STOP conditions

Stop if the three public manifests are not a fixed group on current HEAD; report their
versions instead of choosing one arbitrarily.
