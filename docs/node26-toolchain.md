# Node 26 toolchain migration

The owner requested Node 26 and the package-manager version installed on the
development machine. The maintained toolchain is now Node **26.10.0** and
pnpm **12.9.1**, pinned in `.mise.toml`, `package.json`, CI and the Land workflow.

## Consumer impact

- CLI, MCP and StyleX build-support contracts require `^26.10.0`. Upgrade Node
  before running these new tool artifacts; their previous Node 24 compatibility
  declaration no longer applies.
- Tool bundles target Node 26. The browser UI and token package versions are
  unchanged. This change does not authorize publishing the private CLI/MCP.
- Package and source verification scripts enforce the new maintained versions.
  Their old Node 24/pnpm 11 evidence remains historical; reproducing it requires
  the recorded source revision, not today's scripts.
- Node type declarations follow the Node 26 series. The lockfile is regenerated
  by pnpm 12, then verified with `pnpm install --frozen-lockfile`.
- `packages/primitives` remains byte-for-byte unchanged.

## Verification

Verify actual executable versions and install with `pnpm install --frozen-lockfile`.
Run affected local checks using `CONTRIBUTING.md`; consumer builds are relevant
when build integration changes. Landing requires a signed candidate and the
authoritative exact-SHA CI gate. Main may reuse verified trusted same-SHA evidence
or run full verification. Historical Node 24 results are not current proof.
