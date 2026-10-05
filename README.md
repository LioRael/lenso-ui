# Lenso UI

React components styled with **StyleX**, using native **Base UI** interactions.
Date, time and color controls use **React Aria**. Quality tooling is
**oxlint + oxfmt**.

The visual reference is HeroUI v3.2.6 at
[`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`](https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
Lenso owns its public contracts and release versions; this is not an official
HeroUI release or a promise of API compatibility.

## Repository

| Location                | Responsibility                                     |
| ----------------------- | -------------------------------------------------- |
| `packages/react`        | `@lenso/ui` component families                     |
| `packages/styles`       | `@lenso/tokens` themes and StyleX maps             |
| `packages/stylex-build` | Raw StyleX consumer build integration              |
| `packages/primitives`   | Preserved headless package, unchanged              |
| `packages/standard`     | Shared quality-tool conventions                    |
| `packages/testing`      | Component/browser regression infrastructure        |
| `packages/storybook`    | Component development surface                      |
| `apps/docs`             | Authored Lenso documentation and reference archive |
| `third-party`           | Licenses, notices and source provenance            |

## Development

Use the Node and pnpm versions pinned in `.mise.toml` and `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev:docs
pnpm dev:storybook
```

Run affected local checks as described in [CONTRIBUTING.md](CONTRIBUTING.md).
The authoritative candidate CI verifies the exact commit before landing;
historical acceptance capsules are not a second gate.

Theme CSS retains source OKLCH and dynamic color relationships. Import
`@lenso/tokens/styles.css` and follow the supported consumer integration in the
authored documentation. Concrete components compose typed StyleX maps with
native interaction props. The generated API reference describes current
exports rather than upstream prop aliases.

## Scope and evidence

The previous registry, DTCG token graph, compatibility adapters and Console
templates are replaced. This is not a drop-in upgrade. Public package names
remain `@lenso/ui` and `@lenso/tokens`; `packages/primitives` remains unchanged.
See [DESIGN.md](DESIGN.md) for architecture and acceptance expectations.

Imported snippets are reference content, not working demos. Maintained tests
cover concrete regressions; Storybook registration, a passing build or a mounted
default does not establish exhaustive upstream parity. Report unverified themes,
keyboard workflows, responsive geometry, RTL and reduced-motion coverage.
Source-exact colors can fall below WCAG AA normal-text contrast.

## Landing, deployment and release

The signed exact-SHA landing workflow is documented in
[CONTRIBUTING.md](CONTRIBUTING.md). `Verify reconstruction` / `verify` remains
the authoritative candidate check. Main either validates trusted same-SHA
candidate evidence and its docs artifact or runs full verification.
Candidate branches and pull requests never deploy.

Docs export to `apps/docs/out`. After main verification, the workflow deploys
the verified artifact to the existing Cloudflare Pages project `lenso-ui` at
https://ui.lenso.dev. `pnpm --filter @lenso/ui-docs start` previews the static
export locally. Production configuration uses `LENSO_DOCS_SITE` for canonical
metadata and the protected `docs-production` environment's existing Cloudflare
credentials. Do not put credentials in source.

Landing is not authorization to publish packages or create release tags.
The manual `Release` workflow and current release scope are documented in
[RELEASE.md](RELEASE.md); publication remains separately authorized.

## License

HeroUI-derived work is Apache-2.0 with preserved
[attribution](third-party/heroui/NOTICE.md). The original Lenso primitives
retain their MIT terms. Distributions must contain the applicable original
licenses and adaptation notices.
