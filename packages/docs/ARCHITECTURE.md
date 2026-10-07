# Documentation framework interfaces

## One reading system, three document kinds

`docs`, `component` and `api` share document identity, locale, title, description,
navigation, heading anchors, source Markdown and the article layout. Kind is
metadata, not a separate router or an unrelated renderer.

- Ordinary documents need only Markdown/MDX.
- Component documents can compose `ComponentExample` and `ReferenceTable`, or
  register their own live examples and generated property reference.
- API documents can compose `ApiOperation`, `ReferenceTable` and `ApiResponses`,
  or adapt a generated specification into documents.

The built-in API blocks describe endpoints; they do not make requests, handle
credentials or generate pages from OpenAPI. Client-side examples are trusted
project code, not a sandbox.

## Source and compilation

Compilation units follow execution scope. `root` customization contains only
document-wide providers and metadata; it must not import document compilation or
preview registries. A generated source page can name its own contained server
`module`. The exact route imports that module directly and passes it to shared
rendering; no global page-to-loader table connects every page's code.

The Lenso adapter generates one server document unit per authored page. Only
preview-bearing pages get a client unit with named lazy demo references, resolved
through the locale manifest and actual MDX preview names. A guide without previews
imports no preview infrastructure. ComponentPreview receives its page's references
instead of looking up a name in an executable site-wide registry.

Shiki uses a cached core highlighter, two explicit themes and a bounded authored
language inventory, rather than its all-language registry. Unknown labels retain
plain-text fallback. Root-only rendering does not import that highlighter.

`@lenso/docs/source` exposes `createDocumentationSource`. A source adapter supplies
page metadata, locale definitions, source reading and optional alias policy.
The framework owns locale-aware identity, page lookup, alternates and grouped
navigation. Locale and slug are separate identity keys; a page cannot be found
through a different or unregistered locale.
Optional `translationKey` connects documents whose localized slugs differ.
Namespaced `metadata` carries custom JSON data without extending routing rules
or introducing executable hooks into frontmatter.

There are two real adapters:

- The standalone file adapter discovers and validates local `.md`/`.mdx` files.
- The Lenso adapter supplies its generated bilingual index and exact source
  readers. Component inventory, canonical aliases and generated API data are
  product policy, not framework requirements.

`@lenso/docs/server` exposes `compileDocument` for an existing Next host. Consumers
can supply MDX components, remark transforms and a heading policy. Transforms run
before heading collection; exact source Markdown is returned independently of
transformed rendering. Custom heading components must honor the supplied `id`.

The standalone CLI emits MDX ESM modules so source-relative component imports
remain resolvable by Next. The embedded compiler uses RSC evaluation. These are
different execution formats, not different document kinds. Heading-text and
non-rendering-prefix rules are shared; adapters can preserve existing anchors.
Embedded content uses registered MDX component names rather than source-relative
MDX ESM imports; the standalone ESM pipeline supports those imports.

## Presentation and customization

`@lenso/docs/client` contains only interactive site layout, navigation and search.
It does not import filesystem discovery or RSC compilation. `@lenso/docs/react`
exposes the article, MDX defaults, reference blocks and composition types.

`DocumentationSiteLayout` owns header structure, section navigation, sidebar,
mobile drawer, dismissal and focus behavior. Hosts supply brand and navigation
data. Named slots supply identity controls, search, desktop/mobile actions,
drawer actions and footer content without replacing the frame or tree behavior.
In an embedded host, it is used inside that host's document/theme providers.

Desktop sidebar state belongs to the navigation scope, not the current article
or the lifetime of a page component. Hosts should pass `navigationStateKey` as a
stable locale + collection identity (for example `en:components`); the brand URL
also namespaces this key. Without an explicit key the framework uses the brand
URL/title, the navigation URLs' common directory and the first navigation URL.
That fallback distinguishes menus/locales but cannot infer collection identity
for overlapping menus, so those hosts must provide the key.

Within a scope, actual desktop scroll events save the offset and nested branch
expansions retain their stable ancestry/URL (title for URL-less groups) identity.
The framework restores before paint, clamps to available menu content, and
keeps separate positions when changing scopes or using browser back. State is
tab-local session storage with a bounded 32-scope in-memory fallback when storage
is unavailable; no article-history-specific scroll override is introduced.
Hidden desktop geometry is not saved, and the mobile drawer does not participate
in this state. Restoring sidebar state never scrolls the document or automatically
reveals the selected article. A persistent host layout avoids structural remounts,
but is not required for this state rule.

`DocumentationSearch` owns native Fumadocs search UI and focus restoration.
Callers supply the static index URL, optional database initialization/tokenizer
and accessible labels. Empty-query suggestions are opt-in. Theme ownership is
separate: do not mount a second theme or enabled search provider.

For a standalone site, `docs.config.ts` can name a `components` module:

```ts
export default {
  title: "Project documentation",
  components: "docs-components.tsx",
};
```

That server-compatible module can export a default MDX component map, or
`getComponents(context)` and `getSiteSlots(context)`. The context contains config
and a runtime page projection: identity, locale, kind, headings and exact source,
not internal compiled code or search database data. Factories may return promises.
Registered widgets may be Client Components, but the factories themselves run
on the server. Local CSS imports can customize presentation; runtime theme CSS
variables remain the existing Lenso token contract.

No global plugin registry or implicit override order is involved: defaults are
created first, then the consumer's named components/slots override their regions.

## Current adoption and limits

The Lenso product site runs through `lenso-docs dev`, `build` and `preview`.
It supplies `docs.config.ts`, a Node source adapter, a server customization
module, a narrow build adapter and explicit product route components. The CLI
owns generated Next routes, locale root layouts, redirects, source artifacts,
static metadata and the development/build lifecycle. No manual `src/app`,
`next.config.ts` or application-owned root HTML layout is required.

The standalone starter proves ordinary, component and API documents, custom
server-side component/slot factories, source-relative client imports and a live
counter. Locale-aware file sources or generated sources are both CLI adapters;
each locale has a correct server-rendered HTML language and isolated search.
Custom source adapters can supply existing advanced search exports instead of
rebuilding an inappropriate index from generated API source.

Sources default to MDX program compilation. A source with `render: "custom"`
delegates rendering to `getDocument`; it does not also produce unused ESM body
modules. Raw Markdown is stored per page and loaded only for that page, not
embedded in one enormous generated module. This distinction prevents large
generated API catalogs from multiplying compilation and memory costs.

Automatic OpenAPI ingestion, authenticated request playgrounds and remote/CMS
sources remain separate future adapters.
