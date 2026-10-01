# Lenso UI

A source reconstruction of HeroUI v3.2.6 using **StyleX**, **Base UI** and a
bounded **React Aria** implementation for date, time and color controls.
Linting and formatting use **oxlint + oxfmt**.

The previous Lenso UI implementation is replaced. Only the existing
`packages/primitives` package is preserved.

## Repository

```text
apps/
  docs/                 documentation content and application
packages/
  primitives/           preserved headless package
  react/                @lenso/ui React component families
  styles/               @lenso/tokens themes and StyleX component styles
  standard/             shared quality-tool conventions
  testing/              browser test infrastructure
  storybook/            component development
third-party/
  heroui/               source license and attribution
```

The reference source is
[`heroui-inc/heroui@e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`](https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
The adaptation is independent, not an official HeroUI release.

## Development

```sh
pnpm install
pnpm build:packages
pnpm dev:docs
pnpm dev:storybook
pnpm check
```

Theme CSS keeps source OKLCH and dynamic color relationships. The styles package
owns component StyleX maps; the React package owns interaction and composition.
There is no old DTCG token graph, registry or compatibility API.

## Status

The replacement package graph and documentation application build and run.
`pnpm check` passes, including 193 UI Chromium tests and the 11 unchanged
primitive tests. The documentation production build generates all 352
English/Chinese pages. Its separate browser proof checks native demos,
focus restoration, theme paint, search, locale navigation and mobile drawers.

All 72 component pages have local adaptations: 682 English references resolve
to 681 local demo modules. Interactive previews mount on the client, avoiding
hydration of time-dependent example state from a static documentation build.
Chinese pages currently reuse English previews and label that reuse explicitly;
the source-backed localization generator and its artifacts are not yet wired
into the runtime registry. Generated localization files are not counted as
live Chinese coverage.

Storybook records 126 source-adapted scenarios out of 583 pinned scenarios;
the remaining scope is listed in its coverage report. These counts do not
certify exhaustive behavior, upstream pixel parity, RTL or reduced-motion
coverage.
Some visible MDX API tables still preserve the upstream contract; replacing
them with the generated native reference remains incomplete. Treat those tables
as historical reference, not local API compatibility guarantees.
Known remaining component gaps include mobile Drawer body/footer scrolling,
noninteractive InputGroup prefix/suffix click-to-focus, and the ComboBox shell
and secondary appearance. Registration and passing tests do not mark those
contracts complete.

## Migrating from the previous architecture

This is not a drop-in upgrade. The old registry distribution, DTCG token graph,
compatibility adapters and Console templates are removed. Styled components
now live in `packages/react`, with their StyleX maps in `packages/styles`.
The public package names remain `@lenso/ui` and `@lenso/tokens`.

Use the current public exports and native interaction contracts rather than
assuming old prop aliases still work. Ordinary controls use Base UI contracts
such as `onClick`, `disabled` and `render`; date, time and color controls use
their React Aria contracts. The generated API reference describes the actual
local signatures. Import `@lenso/tokens/styles.css` for the source theme and
base styles; the former `@lenso/ui/styles.css` distribution is not retained.
The existing primitives package and its public contracts are unchanged.

The reconstruction lands source only. The old Changesets publication workflow
is retired; package publication and version tags require a separate owner
decision. See [CONTRIBUTING.md](CONTRIBUTING.md).

Run the production documentation proof in two terminals:

```sh
pnpm --filter @lenso/ui-docs build
pnpm --filter @lenso/ui-docs start
```

```sh
pnpm --filter @lenso/ui-docs test:browser
```

For another port, set `LENSO_DOCS_TEST_URL` for the browser command.
Remaining differences are recorded in the
[documentation shell adaptation](apps/docs/src/components/fumadocs/SOURCE.md),
[collection contracts](packages/react/src/components/list-box/COLLECTIONS.md),
[overlay evidence](packages/react/src/components/modal/RECOVERY.md), and
[Storybook coverage](packages/storybook/COVERAGE.md).

Source-exact action colors can fall below WCAG AA normal-text contrast.
The source appearance is retained rather than silently altered.

## License

HeroUI-derived work is Apache-2.0 with its [source attribution](third-party/heroui/NOTICE.md).
The preserved Lenso primitives retain their MIT license.

## Documentation deployment

Docs build as a static export in `apps/docs/out`. `pnpm --filter @lenso/ui-docs
start` previews that export locally, including the production redirect rules.

Every push to `main` runs `Verify reconstruction`. After verification and both
consumer builds pass, the workflow uploads the exact commit's docs artifact
and deploys it to the existing Cloudflare Pages project `lenso-ui`, serving
https://ui.lenso.dev. Candidate branches and pull requests never deploy. The
`docs-production` environment uses the existing `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` secrets; the token must have Pages deployment access.
The build sets `LENSO_DOCS_SITE=https://ui.lenso.dev` for canonical metadata,
robots and sitemap URLs. Re-run the failed deployment job to retry the same
verified artifact. This workflow does not publish npm packages.
