# Lenso UI documentation

This Next.js App Router site is the public documentation and component lab. Run `pnpm --filter @lenso/ui-docs dev` to preview it, or `pnpm --filter @lenso/ui-docs build` to generate the static `out/` directory.

Add pages at `contents/<section>/<slug>/content.mdx` with `title` and `description` frontmatter. `contents/<section>/content.mdx` is the section overview. Optional `meta.json` files order the pages; the path determines the route. `scripts/generate-docs.mjs` uses `@lenso/docs/generate` to refresh `contents/manifest.json` before dev, typecheck, and build. Include the manifest when committing content changes. React demos and the reading shell live under `components/docs/`.

The `public/r/` registry files come from `pnpm generate` at the workspace root. Never edit them by hand.
