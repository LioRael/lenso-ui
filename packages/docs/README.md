# Lenso Docs

A content-only MDX documentation framework with the Lenso UI Docs presentation.
Next.js runs inside a generated
`.lenso/` directory; authors do not maintain an application, routing files or
a framework configuration. The shell uses Fumadocs notebook interactions and
the Lenso theme directly. The typography, frame, source controls, Tabs, code
highlighting and responsive TOC reuse the existing documentation's source.

This package provides the Lenso Docs source implementation and runtime. The existing Lenso UI
documentation application consumes its compilation, source lookup/navigation,
site layout, search and article renderer for both languages. Product controls,
custom page declarations and content/API generation remain application-owned adapters.

## Run the workspace example

From the repository root:

```sh
bun install --frozen-lockfile
bun run dev:docs-starter
```

To build and preview:

```sh
bun run --filter @lenso/tokens build
bun run --filter @lenso/docs build
bun run --filter @lenso/docs-starter build
bun run --filter @lenso/docs-starter preview
```

The standalone initializer is `create-lenso-docs`. Its generated dependency
targets `@lenso/docs` 0.1.0; use packed local packages until a release is
separately authorized. `bun run test:docs-framework` exercises that packed workflow
without publishing anything.

## Author a project

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

Once `@lenso/docs` is installed, set the project scripts to `lenso-docs dev`,
`lenso-docs build` and `lenso-docs preview`. The CLI requires Bun 1.4.4 or later. Its built-in Next.js host runs in
Node.js 20.9 or later; this workspace pins Node 26.10.0.
The starter declares [Next's modern browser targets](https://nextjs.org/docs/architecture/supported-browsers)
in `package.json` so Babel uses the same browser floor. Preserve or deliberately
replace that Browserslist configuration when customizing the project.
Servers bind to `127.0.0.1` by default. Use `--port` or `--host` to change that.
Development serves unknown routes as 404s without static-export parameter
validation; production builds still enumerate and export only published pages.
Only expose a development server on a trusted network.

```ts
import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Project documentation",
  description: "Installation and usage guides.",
  siteUrl: "https://docs.example.com",
  navigation: [
    { title: "Start", pages: ["index"] },
    { title: "Guides", pages: ["guides/index", "guides/installation"] },
  ],
});
```

Configuration is optional: its defaults are title `Documentation`, directory
`content`, language `en` and deployment at `/`. With no navigation config,
directories determine the navigation tree. Explicit navigation controls display
order; pages outside it are still rendered and searchable.

Additional fields are `logo` (root-relative or HTTPS URL), `basePath` (for example
`/manual`, without a trailing slash), `contentDir`, `language` (HTML language)
and `links` (a record of labels and URLs). The language setting does not create
translated routes. Keep `siteUrl` as the deployment origin and specify a
subdirectory through `basePath`.

Config entry edits reload during development. Imported configuration helper
modules retain Node's module cache; restart development after editing a helper.

Development hosts import the shipped framework TSX sources so a workspace package
rebuild cannot temporarily remove their entrypoints. Production keeps the compiled
framework entries. If a previously broken development build persists after a
restart, stop the server and move the generated `.lenso/.next` cache aside before
restarting; keep the authored configuration, content and generated host inputs.
Custom local components imported by MDX are watched by Next.js.

### Pages and components

`.md` and `.mdx` are supported. File paths determine routes:

| Source                            | Route                   |
| --------------------------------- | ----------------------- |
| `content/index.mdx`               | `/`                     |
| `content/guides/index.mdx`        | `/guides/`              |
| `content/guides/installation.mdx` | `/guides/installation/` |

Page ID path segments allow letters, numbers, underscores and hyphens.
Frontmatter supports `title`, `description`, `draft`, `kind` and `metadata`. `kind` is
`docs` (default), `component` or `api`; all three share routing, search, source
copying and the reading layout. A leading H1 supplies
the title when frontmatter does not; when both exist, they must match. The H1
is removed from the body because the shell renders the page title once.
Drafts are excluded from development and production pages, search, Markdown
exports and sitemap.

Defaults include `Callout`, `Card`, `Cards`, `Tabs`, `Tab`, `Steps`, `Step`,
highlighted fenced code, heading links and responsive tables. Tabs and the TOC
are compiled from the existing Lenso UI Docs; ordinary controls retain their
native Base UI behavior, while Fumadocs owns navigation, search and heading
observation.
Use native component props. A `Step` gets its heading from its children, not a
`title` prop. Import additional local React components directly in MDX.

Component pages can compose `ComponentExample` with real authored React children
and `ReferenceTable` with property records. API pages can compose `ApiOperation`
(method/path), `ReferenceTable` (parameters) and `ApiResponses` (status/body).
Author Markdown headings around these blocks for TOC entries. The framework does
not infer a component's TypeScript contract or make requests to documented APIs;
generated references and request clients belong to explicit adapters.

The starter includes all three kinds, a live local Counter component, property
and parameter tables, response documentation and a custom component/slot module.

### Custom components and site controls

Set `components: "docs-components.tsx"` in config. That trusted server module may
export a default MDX component map, or `getComponents(context)` and
`getSiteSlots(context)` factories. Use `DocumentationCustomizationContext` from
`@lenso/docs/react` for typing. Factories may be async and can choose components
by `context.page.kind`; registered widgets may themselves be Client Components.

The runtime page context includes identity, locale, kind, headings and exact
source Markdown, not internal compiled/search fields. Site slots customize named
header/drawer regions while retaining framework navigation and dismissal.
Use local CSS imports or the existing theme variables for appearance overrides;
adding raw `stylex.create` modules requires a configured StyleX consumer build.
Use the namespaced `metadata` record for custom JSON data consumed by these
factories; functions, dates and cycles are rejected. Metadata and source Markdown
are public build content, never a place for credentials.

Write root-relative internal links without `basePath`, such as `/guides/`.
Next's router supplies the deployment prefix. Markdown image paths and the
configured logo receive the asset prefix automatically. Custom JSX with native
HTML asset URLs remains author-owned.

MDX and configuration are executable, trusted project code. This framework is
not a sandbox for uploads or untrusted repositories.

## Embed in an existing Next application

Use `createDocumentationSource` from `@lenso/docs/source` to adapt indexed or
generated content. It owns locale-aware lookup, aliases, alternate URLs and
grouped navigation. Use `compileDocument` from `@lenso/docs/server` for MDX
compilation, custom remark transforms and an explicit heading-ID/TOC policy.
The original Markdown remains separate from transformed rendering.

Import interactive `DocumentationSiteLayout` and `DocumentationSearch` from
`@lenso/docs/client`. Supply brand, section/navigation data and named product
control slots. Search accepts a static index URL, optional tokenizer/database
initialization and accessible labels; empty-query suggestions are opt-in.
Keep the compiler and filesystem adapters out of client modules. Mount one theme
provider and one enabled search provider.

For incremental adoption, import `DocumentationArticle` from `@lenso/docs/react`.
It accepts `title`, optional `description`, `headings`, `locale`, and React
`children`, with optional `actions`, `beforeContent` and `footer` slots:

```tsx
import { DocumentationArticle } from "@lenso/docs/react";

<DocumentationArticle
  title={page.title}
  description={page.description}
  headings={headings}
  locale={locale}
  actions={sourceActions}
  beforeContent={referenceLinks}
  footer={adjacentPages}
>
  {compiledContent}
</DocumentationArticle>;
```

The host retains routing, MDX compilation, source-link policy and product
controls. `beforeContent` renders after the description and outside the prose
body, for host-owned reference links or other introductory controls.
This is a reading-column integration, not a context-free shell:
use one article in a notebook-compatible host grid. Its main/article IDs are
`main-content` and `nd-page`; the article supplies the Fumadocs page context and
its own responsive TOC, not a site navigation provider. Configure Next's
`transpilePackages` with `@lenso/docs` for the exported React source.

Import `@lenso/docs/font.css` and compile shipped declarations with the official
StyleX integration. PostCSS scans include this package's
`dist/presentation/**/*.js` and `@lenso/tokens/dist/**/*.js` alongside application
sources. Next transpiles both packages. The CLI host stages ordinary official
Babel/PostCSS configuration when no authored config exists. Authored configs
own their complete source inventory. The default framework stylesheet contains
`@stylex`; consumer stylesheets must supply it themselves. There is no separate
precompiled atomic stylesheet.

Presentation sources and font assets live in this package. Rebuild `@lenso/docs`
after changing presentation source before running either consumer; there is no
presentation watcher yet.

## Static deployment

### Generated sources, locales and product routes

Set `source` to a contained server module exporting `loadSource({ root, config })`.
An optional `prepare({ root, config, command })` runs generation before dev/build.
Return pages with globally unique IDs, locale codes, public URLs and exact source
Markdown. Configure `locales` and `defaultLocale` to generate locale-specific root
layouts and search; each locale can also point at a separate `contentDir` for
ordinary file-based sites.

The source may return exact custom `routes` (path/module/locale/JSON props/metadata),
exact `redirects`, and additional project-local `watchPaths`. Missing nested inputs
are watched through their parents, so recreation recovers after a failed generation.
Changes during generation receive one bounded catch-up; byte-identical rewrites
do not trigger an endless rebuild loop.

Use source `render: "custom"` with customization `getDocument` when an adapter
owns rendered content and headings. This avoids also generating unused MDX body
modules. Raw Markdown is loaded per page. A source can supply `search` as a map
from locale codes to contained advanced-static JSON exports for generated API
catalogs; otherwise the framework creates the indexes.

Customization also exposes `getRootOptions`, `getSiteOptions` and `getPageOptions`.
A separate `root` module keeps providers/metadata out of the document import graph.
For generated sources, each page may name a contained server `module`; its exact
route imports only that document unit. Use named client references in page-local
modules rather than one global dynamic-import registry.
A custom root Provider replaces, rather than duplicates, the default Provider.
Product route components need not author HTML/body or another Next route tree.
`build`, `aliases`, `styles` and `stylesheet: "consumer"` support explicit consumer
build integration; CLI-owned output directories, base path and export mode remain
authoritative. The Lenso product site is a maintained example of this configuration.

`lenso-docs build` writes `out/`, including prerendered HTML, client assets,
the search index and byte-exact source Markdown. Set `siteUrl` to generate
canonical URLs, `sitemap.xml` and `robots.txt`. Search is loaded on demand and
does not require an external account or runtime service.

Deploy `out/` with a static host that serves directory `index.html` files and
uses `404.html` for unknown routes. Mount it at `basePath` when configured.
`lenso-docs preview` serves that same export, including deep routes and real 404s.

`.lenso/` and `out/` are generated directories. Nonempty directories without
the framework's ownership marker are never overwritten. Content and public
asset symlinks are unsupported. Public files cannot replace generated pages
or reserved `_lenso`, `_next`, 404 and metadata assets.

## Verification and scope

```sh
bun run --filter @lenso/docs typecheck
bun run --filter @lenso/docs test
bun run --filter create-lenso-docs test
bun run test:docs-framework
```

Automated checks use Bun; browser layout and interaction require separate manual verification.

The visual target is the documentation's restrained notebook layout: ENERGY 1, RHYTHM 2, MOTION 1. Navigation, article and TOC establish the reading order. Motion is limited to native state feedback and respects reduced motion. The framework ships the same Inter font and compiler-readable StyleX presentation as the existing app. The application compiler reads shipped presentation modules; font and license assets remain in the package, without imports into `apps/docs`. Turbo tracks the package-owned source inputs.

Header product controls remain consumer-specific: the framework does not invent a product release selector, Theme Builder or language switcher for a single-language site. See [VISUAL.md](VISUAL.md) for historical comparisons and their scope.

Not included in this slice: an OpenAPI generator, authenticated request playgrounds, remote search, AI services, CMS editing or hosting. Lenso's API-reference and Demo generation remain owned by its documentation application.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the interfaces, two consumer modes and remaining adapter work. Both the product site and starter are CLI consumers; the product site uses generated bilingual sources and explicit custom routes.
