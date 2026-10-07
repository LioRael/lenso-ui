# Lenso Docs starter

Maintained workspace example of a content-only project. Edit `content/` and
`docs.config.ts`.

From the repository root, run `pnpm dev:docs-starter`.

For a static build, run `pnpm --filter @lenso/tokens build` and
`pnpm --filter @lenso/docs build`, then
`pnpm --filter @lenso/docs-starter build` and
`pnpm --filter @lenso/docs-starter preview`.

See [the framework guide](../../packages/docs/README.md) for content conventions,
configuration and the packed-consumer verification command.
