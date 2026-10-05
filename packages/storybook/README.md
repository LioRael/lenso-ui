# Component development

Storybook consumes built `@lenso/ui` exports and `@lenso/tokens/styles.css`.
Read [COVERAGE.md](./COVERAGE.md) for retained browser assertions and limitations.

```sh
pnpm dev:storybook
pnpm exec turbo run build --filter=@lenso/storybook
pnpm --filter @lenso/storybook test:browser navigation form overlay rtl
```

The workspace build prepares package dependencies and produces one
`storybook-static` artifact. The browser runner consumes it without rebuilding.
`STORYBOOK_STATIC` selects another existing artifact. Pass a family name such
as `calendar` to run its retained proof; omitting names runs all suites.
`pnpm test:production` is the normal production integration entrypoint, including
the single installed-package consumer.

Component behavior matrices live with components; docs-composition regressions
live in `packages/testing/integration`. Production Storybook checks cover the
additional composition, focus, theme and CSS-delivery boundary.
`Local/Contracts` contains form, invalid-form, navigation and RTL slider fixtures,
not additional upstream scenarios.

## Source reference and limits

`pinned-story-files.json` retains the upstream revision and original story paths.
The migration inventory's manual reviewed-family list and frozen adaptation
totals are retired. Current Storybook `index.json` describes runnable entries;
neither an entry nor an imported snippet proves complete source parity.

Keep actual source adaptations reviewable in `stories/`, with Apache-2.0
attribution. Use native Base UI contracts, bounded React Aria date/time/color
parts, native HTML and StyleX. Do not import the Next documentation registry
or unadapted upstream Tailwind snippets.

Full display/source-image replay is an explicit, network-dependent proof, not
a normal CI gate. It uses genuine original bytes rather than placeholders;
the intentionally invalid Avatar fallback image is scoped to its exact scenario.
The retained suites do not establish exhaustive visual parity, screen-reader
coverage, every breakpoint, or WCAG AA.
