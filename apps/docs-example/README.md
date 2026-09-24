# Lenso docs framework example

This is the first consumer of `@lenso/docs`. Its content uses the package's directory convention, and the Button reference imports a real `@lenso/ui` React component as an interactive island.

From the repository root, build dependencies and run `pnpm --filter @lenso/docs-example dev`. The default URL is `http://localhost:4321/start`. Set `LENSO_DOCS_BASE_PATH=/docs` during a build to verify deployment under a subpath.

The existing UI documentation application remains in `apps/docs` during migration.
