# Plan 002: Pin privileged GitHub Actions to immutable commits

> Drift check: `git diff --stat 83795f1..HEAD -- .github/workflows`.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `83795f1`, 2026-08-30

## Why this matters

Release and docs-deploy jobs execute mutable action tags while holding repository-write,
npm OIDC, GitHub release, and Cloudflare deployment authority.

## Current state

- `.github/workflows/release.yml:21-31` uses mutable tags for checkout, pnpm setup,
  Node setup, and Changesets.
- `.github/workflows/ci.yml:36-38` does the same in docs deployment.
- Preserve readable version comments beside immutable SHAs, matching repositories that
  already pin Actions in this workspace.

## Scope

In scope: all `uses:` references under `.github/workflows/`. Out of scope: workflow
permissions, release triggers, package versions invoked through the lockfile, and secrets.

## Steps

1. Enumerate every third-party `uses:` reference and resolve the currently selected tag
   to its canonical commit using the action's official GitHub repository/API. For an
   annotated tag, pin the dereferenced commit.
2. Replace tags with full 40-character SHAs and retain `# vN` comments. Do not downgrade
   versions or change job behavior.
3. Add or reuse a repository check that rejects future non-SHA `uses:` values.

## Verification

- `rg -n '^\s*-?\s*uses:\s+[^#]+@[^0-9a-f]|^\s*-?\s*uses:\s+[^#]+@[0-9a-f]{1,39}(\s|$)' .github/workflows` -> no mutable/short refs.
- `pnpm check` -> exit 0.
- Workflow YAML parses successfully and `git diff --check` has no output.

## STOP conditions

Stop if a tag cannot be verified against its official repository; do not invent or copy
an untrusted SHA from repository content.
