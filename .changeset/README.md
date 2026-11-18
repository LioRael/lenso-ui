# Changesets

Add a changeset for public package changes with `bun run changeset`. Select the
affected packages, their semantic version bumps and a consumer-facing summary.
Infrastructure-only changes need no changeset. Keep migration details in
`RELEASE.md` when callers must change their code or configuration.

UI and Tokens version together; Docs and create-lenso-docs version together.
Glass and Primitives version independently. Exact workspace dependencies
propagate required downstream patches; an unchanged Primitives package is not
bumped just because UI changes. Private workspaces are not versioned or tagged.

After main verification succeeds, CI opens or updates a signed version PR with
versions, package changelogs, lockfile, initializer template and generated docs.
It explicitly dispatches full verification for that bot-created PR using the
repository token, without a PAT or bypassing branch protection.

Merge the version PR through the normal protected checks. Its successful main
verification requests publication through the existing protected `npm`
environment. Approval remains required. CI publishes with OIDC provenance and
records package-version tags only after all registry checks pass.

For a local preview, run `bun run version:packages` in a disposable checkout;
it consumes pending changesets. Do not commit preview output alongside the
changeset that generated it. See `RELEASE.md` for recovery and manual tag entry.
