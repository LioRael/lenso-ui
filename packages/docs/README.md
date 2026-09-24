# @lenso/docs

`@lenso/docs` is Lenso's convention-based documentation framework. It owns the documentation route, content index, navigation, search, and Console-inspired reading shell. Astro supplies the static build and MDX compiler; the framework does not depend on Blume.

The package is under development in this worktree and is not published. `apps/docs-site` is its public consumer. The former Next site remains in `apps/docs` temporarily for comparison; all 47 content pages and interactive examples have moved to the Astro site.

## Site contract

Create `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import { defineDocsConfig, lensoDocs } from "@lenso/docs";

export default defineConfig({
  site: "https://example.com",
  integrations: lensoDocs(
    defineDocsConfig({
      title: "Example docs",
      basePath: "/docs",
      tabs: [
        { label: "Start", path: "start" },
        { label: "Reference", path: "reference" },
      ],
    }),
  ),
});
```

Create `src/content.config.ts`:

```ts
export { collections } from "@lenso/docs/content";
```

Put Markdown or MDX at `content/docs/<tab>/<page>.mdx`. `index.mdx` is the tab landing page. Its frontmatter requires `title`; `description` is recommended for search and SEO. `draft: true` removes a page from routes and search.

The file path determines the URL. For example, `content/docs/start/quick-start.mdx` becomes `/docs/start/quick-start`. A folder such as `(guides)` groups pages in the sidebar without entering the URL. Two files that produce the same URL fail the build.

An optional `meta.ts` controls sibling order and a group heading:

```ts
import { defineDocsMeta } from "@lenso/docs";

export default defineDocsMeta({ title: "First steps", pages: ["index", "quick-start"] });
```

Use `<DocLink to="start/quick-start">Quick start</DocLink>` from `@lenso/docs/DocLink.astro` for internal links that must respect `basePath`. `CodeExample`, `Guidance`, and `GuidanceBlock` are available from their matching `@lenso/docs/*.astro` subpaths. MDX can import React examples and hydrate them with `client:load`. The consuming site installs `@astrojs/mdx`, `@astrojs/react`, `astro`, `react`, and `react-dom` alongside this package. The shell imports Lenso's token and UI stylesheets once.

The same content collection generates the static routes, contextual sidebar, `/docs/search.json`, `/docs/sitemap.xml`, and `/docs/llms.txt`. Search matches title, description, and document body. The header exposes it through a dialog and `⌘K` / `Ctrl+K`. Configure Astro's `site` URL for absolute sitemap links.

## Visual contract

The shell uses the Lenso semantic tokens in both themes. It borrows the Console's compact top navigation, quiet selected states, full-viewport layout, centered search at wide widths, and mobile navigation drawer. Console-specific assistant and workspace actions are not part of documentation navigation.

## Current scope

The public UI docs now exercise 47 pages, React component demos, navigation ordering, body search, base paths, static output, keyboard search, a mobile drawer, and Light/Dark styles. Later lenso-site adoption and multilingual routing remain separate work. The framework package has not been released.
