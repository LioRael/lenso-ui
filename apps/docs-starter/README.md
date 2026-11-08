# Lenso Docs starter

Maintained workspace example of a content-only project. Edit `content/` and
`docs.config.ts`.

From the repository root, run `bun run dev:docs-starter`.

For a static build, run `bun run --filter @lenso/tokens build` and
`bun run --filter @lenso/docs build`, then
`bun run --filter @lenso/docs-starter build` and
`bun run --filter @lenso/docs-starter preview`.

See [the framework guide](../../packages/docs/README.md) for content conventions,
configuration and the packed-consumer verification command.
