# Lenso UI

[![Lenso UI: real React components, glass materials, light and dark themes, menu and color controls](docs/assets/readme-bento.png)](https://ui.lenso.dev)

A React interface system built with **StyleX**, native **Base UI** interactions,
semantic themes and shared glass materials. Its design principles are in
[DESIGN.md](DESIGN.md); retained third-party adaptations are documented in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Repository

| Location               | Responsibility                                     |
| ---------------------- | -------------------------------------------------- |
| `packages/ui`          | `@lenso/ui` component families                     |
| `packages/glass`       | `@lenso/glass` shared rendering and motion         |
| `packages/tokens`      | `@lenso/tokens` themes and StyleX maps             |
| `packages/docs`        | Content-only MDX documentation framework           |
| `packages/create-docs` | Documentation project initializer                  |
| `packages/primitives`  | Preserved headless package, unchanged              |
| `packages/devtools`    | Private docs contracts and source analysis         |
| `tests`                | Repository and installed-consumer verification     |
| `packages/storybook`   | Isolated stories and accessibility diagnostics     |
| `apps/docs`            | Authored Lenso documentation and runnable examples |
| `apps/docs-starter`    | Independent framework consumer example             |

The maintained ownership and file-placement rules are in
[Repository structure](docs/architecture/repository.md).

## Agent skills

Lenso's agent integration consists of two portable skills:

- [lenso-ui](.agents/skills/lenso-ui/SKILL.md): component selection, composition,
  themes, consumer setup and debugging.
- [lenso-ui-design](.agents/skills/lenso-ui-design/SKILL.md): page structure,
  visual references, responsive layout and rendered review.

Install both with your agent host's skill loader, or copy both directories into
its project-local skills directory, preserving references and licenses. They
read installed package declarations and matching documentation directly.
See the [skills guide](apps/docs/content/lenso/en/react/getting-started/skills.mdx)
for installation and example requests.

## Development

Use the Bun version pinned in `.mise.toml` and `package.json`. Documentation hosts, preserved primitives and npm publishing tooling use the pinned Node version.

```sh
bun install --frozen-lockfile
bun run dev:docs
bun run dev:docs-starter
bun run dev:storybook
```

For daily component, docs and visual iteration, default to `bun run dev:docs`
and keep its hot-reloading server running. Its initial dependency builds prepare
the dev environment. Production builds are acceptance checks for the conditions
in [CONTRIBUTING.md](CONTRIBUTING.md), rather than the normal preview loop.

Choose one development server:

- `bun run dev:docs`: the Lenso UI product documentation, at
  `/en/docs/react/getting-started` or `/cn/docs/react/getting-started`.
- `bun run dev:docs-starter`: the content-only framework example, at `/` and
  `/guides/`. These routes do not exist in the product documentation.

Use the URL printed by the command. Both docs servers default to port 3000;
stop the first before switching. The product app permits `localhost` and
`127.0.0.1` for development resources. Unknown routes return 404 in development;
production still exports static pages.

Product documentation runs on TanStack Start with official Fumadocs MDX and
StyleX Vite plugins. `@lenso/docs` supplies the shared layout, search and article
components; product controls and content/API projection remain in `apps/docs`.
Bun manages packages and scripts, and Node runs Vite. The content-only starter
exercises the documentation CLI, described in the
[framework guide](packages/docs/README.md).

Run affected local checks as described in [CONTRIBUTING.md](CONTRIBUTING.md).
The authoritative candidate CI verifies the exact commit before landing;
historical acceptance capsules are not a second gate.

Theme CSS supplies semantic color roles and dynamic color relationships. Import
`@lenso/tokens/styles.css` and follow the supported consumer integration in the
authored documentation. Concrete components compose typed StyleX maps with
native interaction props. The generated API reference describes current
exports rather than upstream prop aliases.

## Scope and evidence

The previous registry, DTCG token graph, compatibility adapters and Console
templates are replaced. This is not a drop-in upgrade. Public package names
remain `@lenso/ui` and `@lenso/tokens`, with the new workspace package
[`@lenso/glass`](packages/glass/README.md) providing their shared glass runtime;
`packages/primitives` remains unchanged. The glass package is not yet published.
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
https://ui.lenso.dev. `bun run --filter @lenso/ui-docs start` previews the static
export locally. Production configuration uses `LENSO_DOCS_SITE` for canonical
metadata and the protected `docs-production` environment's existing Cloudflare
credentials. Do not put credentials in source.

Landing is not authorization to publish packages or create release tags.
The manual `Release` workflow and current release scope are documented in
[RELEASE.md](RELEASE.md); publication remains separately authorized.

## License

Original Lenso work and primitives retain their MIT terms. Retained third-party
adaptations keep their applicable licenses and
[attribution](THIRD_PARTY_NOTICES.md). Distributions include the original license
texts and adaptation notices.
