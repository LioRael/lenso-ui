# Lenso Docs

Write Markdown and MDX in a content directory and get the Lenso UI Docs reading
experience: the same notebook shell, typography, sidebar, responsive TOC, search,
Tabs, code frames and source actions. Both the product docs and standalone sites
use Vite, TanStack Start, Fumadocs and the official StyleX plugin.

## Create a site

Once the packages are released:

```sh
bun create lenso-docs my-docs
cd my-docs
bun install
bun run dev
```

Publication is separate from source development. To create a working project
from this checkout before publishing, run from the repository root:

```sh
bun run docs:create /absolute/path/my-docs
cd /absolute/path/my-docs
bun install
bun run dev
```

This builds and packs local dependencies into the new project's
`.lenso-packages/`, then configures ordinary file dependencies. The resulting
project has no workspace links or imports back into this checkout. Keep those
tarballs with the project until switching to released dependencies.
The initializer itself does not install dependencies or access the network.
Maintainers can also use `create-lenso-docs <directory> --packages <directory>`
with a directory containing one tarball each for Docs, UI, Tokens, Glass and
Primitives.

Bun 1.4.4 or later and Node.js 22.12 or later are required. This checkout validates
with Bun 1.4.4 and Node 26.10.0. Dev binds to `127.0.0.1:3000`; `--port` and
`--host` change the listener. Preview defaults to port 4173.

## Write content

```text
docs.config.ts
content/
  index.mdx
  guides/
    index.mdx
    installation.mdx
public/
  logo.svg
package.json
```

You maintain content and configuration. The CLI generates the application,
router and compiler setup under `.lenso/`. No Vite configuration, route files,
StyleX setup or application entry point is required.

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "My Project",
  logo: "/logo.svg",
});
```

Configuration is optional. Defaults are title `Documentation`, content directory
`content`, language `en` and deployment at `/`. Directories determine navigation;
optional `navigation: [{ title: "Guides", pages: ["guides/index"] }]` controls
ordering. Pages outside explicit navigation still render and remain searchable.
Additional basic fields are `description`, `siteUrl`, `basePath` and `links` (a
record of labels and safe URLs). Use the deployment origin for `siteUrl` and a
separate `basePath`, such as `/manual`, for subdirectory hosting.

| File                             | Route                   |
| -------------------------------- | ----------------------- |
| `content/index.mdx`              | `/`                     |
| `content/guides/index.mdx`       | `/guides/`              |
| `content/guides/installation.md` | `/guides/installation/` |

Frontmatter supports `title`, `description`, `draft`, `kind` and JSON `metadata`.
A leading H1 supplies the title if frontmatter does not; when both exist they
must match. The shell renders it once. Draft pages are excluded from routes,
search, source exports and sitemap. Page ID segments allow letters, numbers,
underscores and hyphens.

Defaults include `Callout`, `Card`, `Cards`, `Tabs`, `Tab`, `Steps`, `Step`,
heading links, responsive tables and highlighted fenced code. Use native props:
a `Step` gets its heading from children, not a `title` prop. Import local React
components directly from MDX. Changes to Markdown, added/removed pages, local
components, public assets and config entries update during development. Imported
config helper modules use Bun's module cache; restart after changing a helper.

The `docs`, `component` and `api` kinds share one reading layout. Component pages
can use `ComponentExample` and `ReferenceTable`; API pages can use `ApiOperation`,
`ReferenceTable` and `ApiResponses`. These are authored reference blocks, not
TypeScript/OpenAPI generators or HTTP request clients.

## Customize a site

Set `components: "docs-components.tsx"` to register MDX components and named shell
slots. That module may export a default MDX component map or async
`getComponents(context)` and `getSiteSlots(context)` factories. The context
contains config and the current page's identity, locale, kind, headings,
metadata and exact source Markdown.

Advanced hooks are `getRootOptions`, `getSiteOptions`, `getPageOptions` and
`getDocument`. A separate `root` module keeps providers outside the document
import graph. Source pages may also select page-local customization modules.
Root `metadata` entries with string values become meta tags (`title` becomes the
document title); nested Next-specific metadata objects require adaptation.
Root providers, page components and presentation hooks execute in both SSR and
the browser. Keep filesystem access and generation in a `source` adapter, not
in a presentation module. Factories may be async but must produce deterministic
static presentation; they are evaluated once when their page module loads.

Local CSS imports and existing Lenso theme variables can customize appearance.
StyleX declarations in local React modules compile automatically. The default header uses a compact Glass search button, the product docs' shared
Glass theme picker/mode switch and Glass project links. A single collection has
no section-tab row or platform badge; explicit `sections` can add navigation.
MDX Tabs compose the public Lenso Tabs component. Product-specific controls such
as a release selector remain slots.

Use root-relative internal links without `basePath`, such as `/guides/`.
TanStack Router adds the deployment prefix. Markdown images and the configured
logo receive it automatically; native HTML asset URLs in custom JSX remain
author-owned.

Declare `locales` and `defaultLocale` for language-specific content directories,
HTML language, routes and search indexes. `language` alone sets the HTML language;
it does not create translated routes. The framework supports locale-specific
sources; a language-switch control is a consumer slot.

MDX, configuration and local components are trusted executable project code.
This is not a sandbox for uploaded or untrusted repositories. Source Markdown
and metadata are public build artifacts, never credential storage.

## Build and deploy

```sh
bun run build
bun run preview
```

Build prerenders published pages into `out/`, including HTML, client assets,
fonts, a real `404.html`, static search and byte-exact source Markdown. Search
loads on demand with no account or runtime service. `siteUrl` enables canonical
links, alternate links, sitemap and robots. The router awaits the current page's
module before SSR, so the article is readable with JavaScript disabled.

Deploy `out/` to a static host that serves directory indexes and uses `404.html`
for missing URLs. Mount it at `basePath` if configured. Preview serves the same
export, deep links and real 404 status codes. Set `trailingSlash: false` for
`.html` exports instead of directory indexes.

Development and production own separate `.lenso/dev/` and `.lenso/build/`
projects, so building does not overwrite a running preview. `.lenso/` and `out/`
are generated; nonempty foreign directories are never overwritten. Authored
content/public symlinks are unsupported. Public files cannot shadow routes or
reserved `_lenso`, `_next`, `assets`, 404 and generated metadata artifacts.

## Generated sources and embedding

A contained `source` module exports `loadSource({ root, config })` and optional
`prepare({ root, config, command })`. It supplies pages, trees, exact custom routes,
redirects, external watch inputs and optional advanced static search exports.
Generation runs in Bun, outside the browser. Sources with `render: "custom"`
supply page-local modules with `getDocument`; ordinary sources compile MDX.
See [ARCHITECTURE.md](ARCHITECTURE.md) for boundaries and customization.

Existing React hosts can compose `DocumentationSiteLayout` and
`DocumentationSearch` from `@lenso/docs/client`, and `DocumentationArticle` and
MDX defaults from `@lenso/docs/react`. The host owns routing and one framework,
theme and search provider. The article requires a notebook-compatible host grid
and supplies its page context and responsive TOC; it is not a complete site shell.

`createDocumentationSource` from `@lenso/docs/source` provides locale-aware lookup,
aliases, alternates and navigation. `compileDocument` from `@lenso/docs/server`
compiles trusted in-memory MDX with an explicit heading/TOC policy. It is a
server-only adapter; standalone pages use build-compiled ESM, including relative
MDX imports. Compilation remains outside client entry points.

Embedded builds must compile package StyleX declarations and import theme/font
styles using their framework's official StyleX integration. The standalone CLI
owns this setup automatically. The product application uses its own maintained
Vite config, content generation and product routes with the same shared reading UI.

## Migrate from the Next host

- Remove `--turbopack` from the dev script. Keep `lenso-docs dev`, `build`, `preview`.
- `build` modules now export a Vite config or config function, not `NextConfig`.
  Remove Next webpack/Turbopack rules and Babel/PostCSS StyleX scaffolding.
- Replace nested Next metadata objects with string meta entries or source-owned metadata.
- Presentation customization and MDX components must support SSR and the browser.
  Move filesystem-only work into source preparation. React Server Components
  are no longer the standalone execution model.
- Existing content, routes, basic configuration, static output and named slots
  retain their roles. Regenerate `.lenso/`; never migrate authored files into it.

## Verify

```sh
bun run --filter @lenso/docs typecheck
bun run --filter @lenso/docs test
bun run --filter create-lenso-docs test
bun run test:docs-framework
```

The framework gate builds real packages and tests a packed installation outside
the workspace, including dev updates, production/development isolation, export,
404s and a deployment prefix. Browser layout, hydration and interaction are
separate checks. [VISUAL.md](VISUAL.md) records earlier comparisons and their scope.

OpenAPI ingestion, authenticated request playgrounds, remote/CMS sources, AI
services and hosting are not built in.
