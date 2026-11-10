# Exact Docs

An independent, private **Web-only prototype** of a headless documentation framework
on [Expo Exact](https://github.com/expo/exact). It does not replace this repository's
Fumadocs site or depend on React, StyleX, Tailwind or Lenso UI.

The content compiler and CLI run in Bun. The generated website is a real Exact
application: Contract owns navigation, search and interactive pages. Markdown is
parsed at build time with Bun's Markdown parser and emitted as Contract nodes.
Exact pre-renders every registered route and its 404 page.

## Try the example

Use Bun 1.4.4 and an already initialized Exact checkout with its Web compiler and
dependencies. This prototype never installs Exact, changes toolchains or runs setup.

```sh
cd experiments/exact-docs
export EXACT_ROOT=/absolute/path/to/exact
bun run validate
bun run dev
```

Open the printed local URL. The example has two Markdown pages, a local Contract
counter and a root-data page with reads, mutations and a route-gated timer.
`dev` watches project files, serializes rebuilds and reloads
the browser after a successful build. An invalid edit displays an error while
keeping the last successful preview; the next valid edit recovers automatically.
Compiler diagnostics stay in the terminal. The server binds to loopback only.

## CLI

The commands follow the local authoring workflow of a documentation CLI: create,
preview, validate and export. This is not an implementation of Mintlify's hosting,
MDX, authentication, API playground or deployment services.

```sh
bun src/cli.ts new /absolute/path/to/my-docs
cd /absolute/path/to/my-docs
bun run dev                 # default port 3000; --port is available on the CLI
bun run validate
bun run build               # static output in dist/
bun docs.ts dev --port 3100
bun docs.ts build --out public-docs
```

`new` refuses existing directories. Its local `docs.ts` runner points to this
prototype's absolute path; moving the framework requires updating that import.
There is no published npm package or global installation yet. A content project
does not need to be added to the Lenso workspace.

`validate` checks configuration, source existence, Markdown syntax, internal page
links and Markdown heading targets. `build` additionally invokes Exact's compiler
and static renderer, which check custom Contract pages. Output replacement is
limited to empty directories or output previously marked by Exact Docs. Generated
files live under `.exact-docs/` and `dist/`.

## Markdown and Exact pages

`docs.json` owns route metadata and navigation order. Routes are literal paths;
every Exact page names a component without required props.

```json
{
  "name": "My documentation",
  "pages": [
    { "path": "/", "title": "Introduction", "source": "index.md" },
    { "path": "/demo", "title": "Demo", "source": "demo.contract", "component": "Demo" }
  ]
}
```

```text
component Demo
  state count = 0
  action increment
    count = count + 1
  view
    button press=increment
      text `Count: ${count}`
```

Custom pages can import local Contract components and own state, derives and
actions. For resources, mutations and tasks, use the root extension below and
inject its values and actions into any page or custom layout.

## Root data extension

Exact owns resources, mutations and tasks at the application root. `root` adds
native Contract members to the generated root and connects its TypeScript data
module. Pages remain ordinary components; `provide` / `inject` carries data and
actions through the documentation layout without adding page props.

```json
{
  "root": {
    "source": "data/root.contract",
    "data": "data/source.ts",
    "imports": [{ "source": "data/models.contract", "names": ["Counter"] }]
  }
}
```

Merge this key into `docs.json`. Paths are relative to the documentation project.
`imports` lists named exports from local Contract modules. `data` is optional for
extensions that only need state and tasks. When present it must export `grants`
and `answer`, following Exact's data-source interface; local TypeScript imports
keep their relative paths. `appId` may also be exported. The generated application's
data entry re-exports this module; Exact validates source arguments and reply shapes.

`data/root.contract` is a **root-member fragment**, not a standalone component:
write the root's `state`, `derive`, `resource`, `mutation`, `task`, `action` and
`provide` declarations without an outer `component` or `view`. Keep declarations
at column zero, with their nested bodies indented normally. The framework inserts
them verbatim, indented inside `DocsApp`, before its generated view. Define shapes
and functions in the imported modules. Exact compiler errors in a fragment refer
to its inserted location in `.exact-docs/app/app.contract`.

For example, `data/models.contract` declares `shape Counter` with `value: number`,
and the member fragment can contain:

```text
state ticks = 0
resource counter = readCounter() as shape Counter else empty(value=0)
mutation saved as shape Counter refreshes counter
task ticker when docsPath == "/demo"
  every(1000, tick)
action tick
  ticks = ticks + 1
action saveCounter
  send saved = incrementCounter()
provide
  counterValue = counter.value
  counterLoading = pending(counter)
  saveFailed = failed(saved)
  saveCounter
  ticks
```

The custom page consumes these bindings through native Exact injection:

```text
component Demo
  inject
    counterValue: number
    counterLoading: bool
    saveFailed: bool
    saveCounter: action
    ticks: number
  view
    text `Counter: ${counterValue}`
    button press=saveCounter
      text "Save counter"
    text `Ticks: ${ticks}`
```

The runnable example implements successful reads, a mutation that refreshes its
resource, read/write failures and recovery, and a timer that can pause and resume.
Its data module keeps the counter in memory; it is not persistent storage.

`docsPath` is the registered path currently shown, or `""` for an unknown route.
Use it in a task's `when` condition to stop work when the reader leaves the page.
Root state lives for the current app session; navigating away does not reset it.
Resources also belong to that root and run independently of whether their page is
mounted. For a page-specific external read, pass route context to the source and
have it skip I/O when inactive. Ordinary root tasks can use Exact's `mount`, `when`
and `key` lifecycle syntax. Names beginning with `docs` / `Docs` are reserved for
the generated framework; use other names in extensions and imported declarations.

The existing `render=build` policy also applies to root resources. Their build-time
answers become static HTML. Use public build-safe data, or keep private/live
loading behind an explicit client interaction; request-time rendering is outside
this prototype. Changes to root member files, imported modules and the data source
rebuild the preview. A failed compile keeps the last successful generation.

## Languages and versions

Declare languages and versions in `docs.json`, then give each page a stable
logical `id`, a concrete URL and its content scope. Existing projects can omit
both dimensions and retain their URLs and behavior. Either dimension can also be
used independently.

```json
{
  "name": "My documentation",
  "locales": [
    { "id": "en", "label": "English" },
    { "id": "zh-CN", "label": "简体中文", "labels": { "search": "搜索文档" } }
  ],
  "versions": [
    { "id": "v2", "label": "v2", "status": "current" },
    { "id": "v1", "label": "v1", "status": "archived" }
  ],
  "defaultLocale": "en",
  "defaultVersion": "v2",
  "pages": [
    { "id": "home", "path": "/", "source": "en/index.md" },
    { "id": "home", "path": "/zh", "locale": "zh-CN", "source": "zh/index.md" },
    { "id": "home", "path": "/v1", "version": "v1", "source": "v1/index.md" }
  ]
}
```

Each declared dimension is a nonempty ordered array with unique IDs and nonempty
labels. Locale IDs are BCP 47 language tags. Version IDs can contain letters,
digits, dots, underscores, plus signs and hyphens, and start with a letter or digit.
The defaults use the first entry unless explicitly set. They supply omitted page
`locale` / `version` fields; URL selection remains explicit, without browser-language
negotiation or implicit prefix/redirect rules. When a dimension is omitted, its
normalized value is `""`.

Routing fields `id`, `locale` and `version` belong in `docs.json`. A missing `id`
defaults to the concrete path; assign the same explicit ID to translated or
versioned counterparts whose paths differ. Every concrete route must be unique,
and each `(id, locale, version)` tuple must be unique. Both Markdown and custom
Exact pages can be registered this way.

Navigation groups, Previous/Next and live search contain only the current
`(locale, version)` scope. Relative source links are resolved inside that scope,
including when one file is reused across scopes. Ambiguous relative targets fail
validation; use an explicit URL for intentional aliases. Absolute URL paths remain
explicit links and can intentionally cross scopes. Query-only and fragment-only
links stay on the current concrete page.

Switching one dimension preserves the other. The generated switch choices first
look for the same logical page ID in the target scope. If it is absent, they point
to the first `nav: true` page in configured order. If there is no navigable target,
the choice has an empty `href` and the reference layout displays unavailable text.
The choice's `exact` field distinguishes a counterpart from a landing-page fallback.
Switch links use the destination path without carrying query parameters or heading
fragments, since translated headings may have different IDs. Direct links, reload
and browser Back/Forward use the concrete URL as the content source of truth.

Versions support `current`, `archived` and `deprecated` statuses; the reference
layout shows a localizable notice for the latter two. To add a version, register
its version entry, copy the documents into an independent source directory and add
their page entries with matching logical IDs. Edits to a source shared by multiple
versions update every variant using that source. Status describes the documentation;
it does not disable custom-page actions.

Set locale `dir` to `"rtl"` for right-to-left content (`"ltr"` is the default).
The generated page-context element carries `lang` and CSS `direction`, including
for custom layouts. Locale `labels` can override any reference-layout string:
`skipContent`, `navigation`, `search`, `noResults`, `pageActions`, `copyMarkdown`,
`openMarkdown`, `pagination`, `previous`, `next`, `toc`, `language`, `version`,
`unavailable`, `archivedVersion`, `deprecatedVersion`. Missing labels use English.
Document prose, group names, page titles and dimension labels are authored content.

The root extension can read `docsLocale`, `docsVersion` and `docsPageId` alongside
`docsPath`, so data sources and route-gated tasks can use logical scope. Root state
still belongs to the app session; pass scope to source arguments and cache keys
when data needs language/version separation.

Builds emit `/_docs/variants.json` with normalized dimensions, defaults and public
page identity/URL metadata. Each rendered scope gets its own search file at
`/_docs/search/<locale>/<version>/index.json`, using `_default` for an omitted
dimension. `docsSearchIndexUrl` identifies that file for the current page. The
original `/search-index.json` remains a global export and now includes `id`,
`locale` and `version`; external search adapters should select or filter a scope.
Raw Markdown exports continue to use each page's concrete URL.

Optional `app.json` supplies Exact declarations such as hatches and data words;
the prototype supplies the Web host and adds its own data word. Local `assets/`
and `modules/` directories are staged for Exact. Installing and staging third-party
Exact packages is not automated yet.

Markdown supports headings with unique Unicode anchors, text, links, images,
lists, quotations, code and tables. Relative links to registered `.md` or
`.contract` files become route links. Use `assets/` or `/assets/` paths for local
images. Raw HTML and MDX are rejected; use a Contract page for custom behavior.

## Document metadata and navigation

Markdown pages can start with YAML frontmatter:

```yaml
---
title: Authoring
description: Write documentation and interactive Exact pages.
group: Documentation
nav: true
search: true
---
```

The same fields can be set on a page in `docs.json`; explicit configuration wins
over frontmatter. A Markdown title falls back to the first H1, then the route path.
Custom Exact pages still require a configured title. Descriptions appear in the
page's meta description, in the unstyled reference layout and in search text.
Frontmatter is removed before headings, text and document nodes are compiled.

Navigation follows configured page order. Consecutive pages with the same `group`
share a named navigation section; an absent or empty group is unlabelled. The
reference layout provides Previous and Next links in that same order, including
links between Markdown and custom Exact pages. `nav: false` excludes a page from
navigation and the Previous/Next sequence. `search: false` excludes it from both
the live search and `search-index.json`. Neither flag changes direct access to its
public route or raw Markdown export.

The reference layout offers Copy Markdown and Open Markdown on Markdown pages.
Copy uses Exact's native `copyText` command; no success message is claimed because
that command has no completion reply. Browser clipboard permissions still apply.
Builds also export the original source, including frontmatter, at
`/_docs/markdown/index.md` for `/`, and
`/_docs/markdown/<route>/index.md` for other pages. These are real static files,
served identically in dev and export. Custom Exact pages have no Markdown export.

Custom Exact pages own their heading IDs; they currently receive no generated TOC
and are indexed by their configured title only. Markdown pages are indexed by
their complete text. Search is a local case-insensitive substring search; the
generated `search-index.json` also exposes content for another search adapter.

## Headless layout and future themes

No framework stylesheet, colors, spacing scale, typography or decorative motion
is included. Exact's own host stylesheet and native control defaults still apply.
Code blocks retain whitespace. Markdown emphasis and code spans have part markers
without an added visual treatment; list markers are left to a future renderer/theme.

The default `DocsLayout` is an unstyled reference composition with landmarks,
navigation, a labelled search field, empty search feedback, a content slot and a
TOC. Replace the whole composition using another Contract component:

```json
{
  "layout": {
    "source": "layouts/minimal.contract",
    "component": "MinimalLayout"
  }
}
```

Merge that key into `docs.json`; the example includes the working component.
The layout imports `DocsLink` and `DocsHeading` from
`@lenso/exact-docs/contract` and accepts these props:

| Prop                                   | Type            | Purpose                                         |
| -------------------------------------- | --------------- | ----------------------------------------------- |
| `siteName`, `pageTitle`, `currentPath` | `string`        | Current page context                            |
| `navigation`                           | `DocsLink[]`    | Ordered `{title, href}` entries                 |
| `toc`                                  | `DocsHeading[]` | `{title, id, level}` Markdown headings          |
| `query`                                | `string`        | Current search input                            |
| `search`                               | `action`        | Input callback accepting the new string         |
| `results`                              | `DocsLink[]`    | Matching pages                                  |
| `slot`                                 | children        | Compiled Markdown or the custom Exact component |

The existing props remain unchanged. An intermediate generated page-context
component also provides optional native injection bindings for custom layouts:

| Injected binding           | Type               | Meaning                                                      |
| -------------------------- | ------------------ | ------------------------------------------------------------ |
| `docsGroups`               | `DocsGroup[]`      | Ordered groups with `id`, `title` and `items: DocsLink[]`    |
| `docsPrevious`, `docsNext` | `option<DocsLink>` | Adjacent visible pages, or `none`                            |
| `docsDescription`          | `string`           | Resolved page description                                    |
| `docsMarkdown`             | `string`           | Original Markdown source, or an empty string for Exact pages |
| `docsMarkdownUrl`          | `string`           | Static raw-source URL, or an empty string for Exact pages    |

Multilingual/versioned contexts additionally provide:

| Injected binding                          | Type           | Meaning                                                                  |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `docsLocale`, `docsVersion`, `docsPageId` | `string`       | Current normalized scope and logical identity                            |
| `docsLocales`, `docsVersions`             | `DocsChoice[]` | Ordered `{id, label, href, current, exact}` switch choices               |
| `docsVersionStatus`                       | `string`       | `current`, `archived`, `deprecated`, or empty when versioning is omitted |
| `docsLabels`                              | `DocsLabels`   | Locale labels merged with English defaults                               |
| `docsSearchIndexUrl`                      | `string`       | Current scope's static search index                                      |

Import `DocsChoice` and `DocsLabels` from `@lenso/exact-docs/contract` as needed.
The original layout props remain unchanged; custom layouts opt into injections.

Import `DocsGroup` from `@lenso/exact-docs/contract` when using grouped navigation.
Layouts choose which bindings to inject. Existing layouts need no new props or
injections. The context also preserves inherited root-extension bindings for
custom pages. This supplies behavior for the future Lenso UI theme; this package
continues to ship no default theme stylesheet.

Use absolute route paths for links and `currentPath + "#heading"` for fragments
inside a layout. Exact owns routing and browser history. Layout code owns its
semantics, focus behavior and empty states.

`data-docs-part` marks the reference layout and generated content, including
`root`, `header`, `navigation`, `search`, `content`, `toc`, `article`, `paragraph`,
`strong`, `emphasis`, `code`, `codespan`, `list`, `list-item`, `link`, table parts,
`navigation-group`, `description`, `page-actions` and `pagination`.
A later Lenso UI adapter can provide a Contract layout and presentation for these
parts without changing route metadata or the Markdown compiler. No Lenso theme is
included or claimed complete in this prototype.

## Verification

From the repository root:

```sh
bun test experiments/exact-docs/test/*.test.ts
bun check --no-script -p experiments/exact-docs/tsconfig.json
EXACT_ROOT=/absolute/path/to/exact bun experiments/exact-docs/test/browser.mjs
```

The browser script uses the docs workspace's Playwright installation. Set
`PLAYWRIGHT_MODULE` to another installed package with matching browser binaries
if necessary. It builds a fresh project, checks Chromium and WebKit content,
search, keyboard activation, deep links, reload and history. Both engines verify
grouping, description metadata, pagination and raw Markdown copying (through a
test clipboard, without changing the system clipboard). Export checks cover hidden
page access, search exclusion and exact raw-source files. Both engines also verify
root resource reads and failures, mutation refresh/refusal/recovery, and timer
pause/resume and route exit/re-entry using Exact's virtual clock. Chromium also
checks a custom layout, live edits to root members and the data module, failed-build
preservation and recovery.
Both browsers also cover exact and fallback language/version switching, localized
search and navigation, archived notices, missing content, deep links/history/reload,
and a right-to-left Arabic fixture. Unit coverage checks duplicate scope identities,
invalid defaults and relative links when source files are reused across scopes.
It does not establish native-platform support or performance.

Exact is pre-1.0. This adapter currently targets `host/web-js/build.mjs` with
`--render js`; upstream interface changes may require changes here.
