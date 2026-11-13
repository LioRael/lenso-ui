# Documentation framework interfaces

## Shared reading system

The standalone CLI and the product documentation both use Vite, TanStack Start,
Fumadocs and official StyleX compilation. They share package-owned presentation,
site layout, search, article, responsive TOC and Lenso Tabs. Theme presets, the
Glass theme picker/provider, mode switch and header control styles are also
package-owned; product adapters re-export that implementation. Product content generation,
component/API extraction, custom routes and product-specific controls remain in
`apps/docs`; an ordinary site authors content and `docs.config.ts` only.

Generated hosts and the product site use TanStack Redact's full runtime through
its Vite plugin, after the React plugin. React imports and peer versions stay
unchanged. SSR dependencies are bundled so server rendering and browser hydration
use the same runtime. Rendering is synchronous, without React time slicing.
Embedded consumers of the React entries retain ownership of their runtime.

Search stays deferred during ordinary reading. Pointer intent, keyboard focus
or the search shortcut prepares the closed dialog and its locale/revision-specific
static database in parallel. The visible dialog reuses Fumadocs' URL-keyed cache.

`docs`, `component` and `api` are document kinds, not separate routers. They share
identity, locale, title, headings, navigation, Markdown source and reading layout.
Component and API blocks compose within that layout. TypeScript/OpenAPI ingestion
and request clients require explicit adapters.

## Source boundary

The file adapter discovers local Markdown/MDX, validates frontmatter and compiles
one ESM body per page. Relative component imports resolve from the authored file.
Headings and search data come from that compilation. Fenced code highlighting is
compiled into HTML, keeping its parser out of the page's client graph.

A contained source module may generate pages, exact product routes, redirects,
watch paths and advanced static search exports. It executes under Bun and may
access the filesystem. Optional prepare/background/watch hooks use the existing
serialized lifecycle; an edit during preparation receives one bounded catch-up.
A custom-rendered page selects its own contained module, or a shared customization
module, with `getDocument`. It does not emit an unused MDX body.

`createDocumentationSource` owns locale-aware lookup, aliases, alternate URLs and
navigation. Locale and slug remain separate identity keys. `translationKey`
connects translated pages whose localized slugs differ. Custom `metadata` is JSON,
not executable frontmatter.

`DocumentationI18nProvider` owns the active locale and supplies the same language
to Fumadocs, Lenso controls and framework messages. Generated roots install it;
embedded hosts, including the product documentation, consume the public provider.
Locale `language` selects English/Chinese messages, not the route code. Search
labels, navigation, pagination, page actions and appearance controls share that
selection. Content and search indexes remain source-owned per locale.

The shared language menu renders actual source alternates as navigation links,
including translated slugs and deployment prefixes. It does not invent missing
translations or rewrite the current URL. Generated pages include this menu in
desktop and drawer actions; embedded hosts pass their source alternates explicitly.

## Generated Vite host

The CLI owns `.lenso/dev/` and `.lenso/build/` separately. Each has its own Vite
config/cache, TanStack route tree, public mirror and page modules. Files are
written atomically only when bytes change. A production build can run alongside
development without rewriting the development graph.

The generator emits exact file routes with static head metadata and a page-local
lazy component. Loader and component share a split group. The loader preloads the
component before SSR, avoiding a suspended article that requires JavaScript to
become visible. Only that component imports its compiled body, source Markdown
and page-local customization. The common model contains metadata/navigation,
not document bodies or one global executable registry of every preview.

The generated root selects the HTML language by registered route prefix and
mounts the Fumadocs TanStack provider. It imports shared theme/font styles and
package presentation. Development includes the official StyleX virtual stylesheet
and update runtime, matching the product docs. Production extracts CSS and
prerenders only published pages plus a 404 document. Source artifacts and search
indexes are ready before route modules invalidate the development graph.

The optional build module exports Vite configuration. CLI defaults retain ownership
of root, deployment prefix and static client output. Aliases and local styles are
explicit config fields; authors do not maintain generated framework files.

## Presentation boundary

`@lenso/docs/client` contains interactive site layout, navigation and search,
without filesystem discovery or MDX compilation. `@lenso/docs/react` exposes the
article, MDX defaults, reference blocks and customization types. Embedded hosts
supply one framework/theme/search provider; standalone hosts generate them.

Named site slots customize header, search, desktop/mobile actions and drawer
regions while preserving navigation and dismissal. `getComponents`,
`getSiteSlots`, `getSiteOptions`, `getPageOptions`, `getDocument` and
`getRootOptions` may be async. Presentation factories are evaluated once at module
load in both SSR and the browser, so their modules must be universal and their
results deterministic. Put server-only generation in the source adapter.
Root customization stays separate from page-local renderers. A supplied Provider
replaces the default; it does not create a second theme or search owner.

The runtime page context contains identity, locale, kind, headings, metadata and
exact Markdown, not compiled/search internals. Local overrides replace named
components/slots directly; there is no global plugin registry or override chain.

The desktop sidebar preserves its own tab-local scroll and expansion state by
navigation scope, separately from document scroll and mobile drawers. Embedded
hosts with overlapping menus should supply a stable `navigationStateKey`.

`compileDocument` is an independent server-only in-memory MDX adapter with explicit
heading transforms; standalone pages instead use compiled ESM so source-relative
imports remain bundler-owned. Both preserve the exact source Markdown separately
from rendered content.

## Distribution and acceptance

The initializer creates a content project pinned to the framework version.
`--packages` copies packed local Lenso dependencies into the project for use before
publication. `bun run docs:create <directory>` builds and packs the checkout and
invokes that path. Neither requires workspace symlinks in the created project.

`lenso-docs build` stages a complete prerendered export and replaces only an owned
`out/`, retaining the previous export if replacement fails. Static preview serves
that export, configured redirects, deployment prefix and real missing-page status.
Public files cannot replace generated routes, search, source or metadata assets.

The packed-consumer regression verifies installation outside the repository,
content and component updates, added routes, concurrent development/build,
source fidelity, production assets, preview, 404 and base-path deployment.
Browser testing separately establishes responsive layout, themes, hydration,
search, keyboard behavior and interaction; unit tests do not establish those.
