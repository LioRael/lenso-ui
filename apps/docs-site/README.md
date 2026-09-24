# Lenso UI documentation

This is the public Lenso UI documentation consumer of `@lenso/docs`. It contains 47 migrated pages and their interactive component examples.

From the repository root, build dependencies and run `pnpm --filter @lenso/ui-docs dev`. The default URL is `http://localhost:4321/start`. Set `LENSO_DOCS_BASE_PATH=/docs` during a build to verify deployment under a subpath. Production canonical URLs use `https://ui.lenso.dev`; `LENSO_DOCS_SITE` can override them for local tests.

The former Next application remains in `apps/docs` as a temporary comparison reference. The Astro site is the production target.
