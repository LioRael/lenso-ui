# Documentation host

`apps/docs` runs TanStack Start on Vite with the official Fumadocs MDX and StyleX
plugins. Node runs Vite; Bun owns dependency installation and workspace commands.
The application owns its bilingual routes, authored content, live examples and
API/contract projection. `@lenso/docs` owns shared presentation, article and
search components. Read their source configuration when changing integration:

- [Product Vite configuration](../../apps/docs/vite.config.ts).
- [Generation pipeline](../../apps/docs/scripts/README.md).
- [Framework contract and independent starter](../../packages/docs/README.md).

Daily development uses source aliases and the official StyleX development
runtime (`virtual:stylex:runtime`). Production extracts CSS with runtime injection
disabled. Retain an application CSS entry for extracted rules, and verify the
actual rendering document loads the generated CSS and semantic theme assets.
There are no registered StyleX or TypeScript dependency patches.

The framework initializer and standalone starter remain separately maintained.
The product app's Start integration does not establish that every framework
host can be swapped without adapting routing, generation and asset delivery.

Production acceptance includes the generated static export, installed-consumer
checks and relevant browser checks in [CONTRIBUTING.md](../../CONTRIBUTING.md).
A successful experimental counter or an old host-comparison timing does not
verify the complete product docs. The completed host-selection prototype and
its dated reports have been archived; current regressions belong in the owning
application or framework test suite.
