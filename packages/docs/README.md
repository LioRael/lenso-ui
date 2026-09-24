# @lenso/docs

`@lenso/docs` supplies convention-based content indexing and navigation for Lenso documentation sites. It does not require Astro or Blume. The first consumer is the Next.js site in `apps/docs`; a future site can use the same conventions without copying its routes or product-specific demos.

A page lives at `contents/<tab>/<slug>/content.mdx`. `contents/<tab>/content.mdx` is that tab's overview. Each page has a `title` in frontmatter. An optional `contents/<tab>/meta.json` defines the sibling order and tab label:

```json
{ "title": "Components", "pages": ["button", "checkbox", "dialog"] }
```

`index` in `pages` refers to the tab overview. Pages omitted from `pages` sort by filename after the named pages. The generator rejects unknown metadata entries, duplicate routes, missing titles, and overrides for missing pages. Define tabs and the overview route in a small consumer script, then call `generateDocsManifest` from `@lenso/docs/generate` before the build. The resulting JSON is safe to import from client-side navigation and search code. It remains a generated artifact that is committed alongside content changes.

`defineDocsConfig`, `docsHref`, and `createDocsNavigation` are exported for sites that need tab and group navigation. If the generator receives `publicDir`, it also emits a search index and `llms.txt`; passing `site` adds an absolute sitemap. The Next.js consumer uses `@content-collections/next` to compile MDX and `output: "export"` to produce `apps/docs/out`. It owns the React shell, command-menu search, and demos; `@lenso/docs` deliberately does not own a rendering runtime.
