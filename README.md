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
  stylex-build/         @lenso/stylex-build 0.1.0 raw StyleX build processing
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

This section describes the current source checkout, including work after the
published `0.8.0` release. These follow-up changes are not a new package release.
The replacement package graph and documentation application build and run.
Workspace verification includes component Chromium suites and the unchanged
primitive tests. The documentation production build generates 358 static
routes, including 352 English/Chinese documentation pages.

All 72 component pages have local adaptations: 682 English references resolve
to 681 local demo modules. Interactive previews mount on the client, avoiding
hydration of time-dependent example state from a static documentation build.
English and Chinese each have 682 references resolving to 681 unique modules.
The generated locale registry contains 649 source-backed translated Chinese
projections and 33 explicitly evidenced source-equivalent reuses. The 33
equivalents are explicit projections, not source-backed translations. Four
disclosure projections use separately
captured, hash-pinned public EN/CN source because the imported archive records
omit Native-product code; the immutable public-source captures are verified.
The React previews add neither a Native runtime nor App Store functionality.
The archive remains preserved, with 471 partial/difference reports retained;
these do not claim complete pixel or behavioral parity.

Storybook's [coverage report](packages/storybook/COVERAGE.md) records reviewed
adaptations against all 583 pinned scenarios, with separate browser evidence
for each batch and an explicit remaining inventory. These counts do not
certify exhaustive behavior, upstream pixel parity, RTL or reduced-motion
coverage.
Visible component API sections and Copy Markdown now use the generated native
reference. Archived source snippets remain historical reference, not local API
compatibility guarantees. Production proofs cover native API display/copy and
selected EN/CN interactions across both themes at desktop/mobile widths.

Follow-up fixes cover Drawer internal scrolling, InputGroup adornment focus,
ComboBox shell/secondary appearance, scoped disabled-state paint and invalid
compound-field outlines/focus rings, plus contextual date/time/color label
feedback. Button now preserves native render-injected classes; this does not
guarantee property-level priority between independently styled components
across a styled `render` boundary.
The Storybook batch reports retain these limits rather than
treating registration or passing workflow tests as full source fidelity.

The unpublished `@lenso/stylex-build` 0.1.0 package introduces raw package and
application StyleX processing in one pass. This is the current pipeline for the
cross-bundle specificity and stylesheet-order problem recorded in the historical
[compiled-priority experiments](packages/testing/tests/compiled-priority/README.md).
The frozen tool candidate independently passes the original three CSS-delivery
and raw-query regressions. The isolated current-source documentation candidate
builds 358 static pages on Node 24.18.0 and passes 38 docs unit tests, 136 locale
cases, 16 native API cases and 8 SSR stylesheet cases. Its registry accounts for
682 English and 682 Chinese references: 649 translated Chinese references,
33 source-equivalent reuses and none blocked. Exact source and evidence hashes
are recorded in [the docs acceptance capsule](apps/docs/test/final-source-acceptance.json).
The final isolated UI/Storybook candidate also passes 253 browser tests and
full strict types, builds all 583 source and 9 Local stories, and passes the
choice, overlay and selection production iframe proofs. Its exact source and
build hashes are recorded in
[the UI/Storybook capsule](packages/testing/tests/compiled-priority/final-ui-storybook-acceptance.json).
These gates do not certify exhaustive upstream parity and are not a release
or publication claim.

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
