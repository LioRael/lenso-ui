# Exact Docs

An independent, private prototype of a headless documentation framework for Web,
macOS and iOS
on [Expo Exact](https://github.com/expo/exact). It does not replace this repository's
Fumadocs site or depend on React, StyleX, Tailwind or Lenso UI.

The content compiler and CLI run in Bun. The generated website is a real Exact
application: Contract owns navigation, search and interactive pages. Markdown is
parsed into a portable content model with Bun's Markdown parser, then rendered as
shared native Contract block templates and per-page content data. A separate
semantic HTML renderer consumes the same model.
Exact pre-renders every registered route and its 404 page.

## Try the example

Use Bun 1.4.4 and an already initialized Exact checkout with its Web compiler and
dependencies. This prototype never installs Exact, changes toolchains or runs setup.

```sh
cd experiments/exact-docs
export EXACT_ROOT=/absolute/path/to/exact
bun install --frozen-lockfile --ignore-scripts
bun run validate
bun run dev
```

Open the printed local URL. The example includes English and Chinese documents,
an archived version, an embedded Contract counter and a root-data page with reads,
mutations and a route-gated timer.
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
links and Markdown heading targets. Web `build` uses Exact's production mode, which
omits development instrumentation and agent support. Local `dev` explicitly
retains development mode. `build` additionally invokes Exact's compiler and static
renderer, which check custom Contract pages. Output replacement is
limited to empty directories or output previously marked by Exact Docs. Generated
files live under `.exact-docs/` and `dist/`.

## Native Apple applications

On macOS with Xcode and an initialized Exact Apple toolchain:

```sh
bun docs.ts build --platform macos
bun docs.ts build --platform ios
bun docs.ts build --platform ios --run --sim "<existing simulator name or UDID>"
```

Native builds use Exact's AppKit/UIKit host directly. They package page values,
metadata and search indexes offline, with the same Contract templates, root
resources/mutations/tasks, custom pages and registered components. Web retains its
lazy page/search imports. Native generation is isolated under
`.exact-docs/app-macos` or `.exact-docs/app-ios`; it does not replace the Web app or
`dist/`. Exact manages the `.app` location, printed after a successful build.
Without `--run`, iOS builds do not install or boot a simulator. Native bundles use
Exact's local development configuration; these commands do not publish an app.

`app.json` may set `app.id`, `app.name` and `host.macos`/`host.ios` options; existing
host settings are preserved. Custom layouts/pages can inject `docsPlatform: string`
(`web`, `macos`, `ios`). Native generation adds only a scrolling root, without a
theme. The reference layout offers native Markdown copying; the static raw-source
URL is Web-only. SEO, sitemap and HTML metadata synchronization remain Web features.
Custom data modules still need native-compatible dependencies and grants.

`dev` remains the Web watcher. Re-run a native build to incorporate content edits.
Native data is bundled together; the Web startup measurements do not characterize
native loading or memory use. [NATIVE.md](NATIVE.md) records platform verification
and current limits.

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
data entry preserves this module's exports and forwards application source calls,
including host arguments, while handling the reserved `docsSearchPages` and
`docsReadPage` sources itself. The wrapper also uses Exact's `kept` hook to seed
page data from the current HTML checkpoint and forwards any user `kept` hook.
A generated data entry also exists without a root extension. Exact validates source
arguments and reply shapes.

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
`skipContent`, `navigation`, `search`, `searchLoading`, `searchError`,
`contentLoading`, `contentError`, `noResults`, `pageActions`, `copyMarkdown`,
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
images. Raw HTML and MDX are rejected; use registered embedded components or a Contract page
for custom behavior.

## Portable content and embedded components

`@lenso/exact-docs/content` exports the document node types, plain-text extraction
and traversal. `@lenso/exact-docs/markdown` parses Markdown into JSON data without
Contract syntax. The `renderers/exact` and `renderers/html` modules consume those
nodes independently. Builds export each Markdown body at
`/_docs/content/<route>/index.json` (the root is `/_docs/content/index.json`) with
`schemaVersion: 1` and `nodes`. This is a renderer boundary, not a native reader.

Code fences are tokenized at build time using Shiki grammars. Tokens retain their
source text, semantic category and grammar scopes. Exact emits `data-docs-token`
and `data-docs-language` markers; the HTML renderer emits equivalent markers.
There is no token palette, runtime highlighter or browser grammar download.
Unsupported languages retain plain code text.

Register components in `docs.json`:

```json
{
  "components": {
    "CounterDemo": { "source": "widgets/counter.contract", "component": "CounterDemo" }
  }
}
```

Then insert a fenced block whose language is `exact-component`:

````markdown
```exact-component
{"name":"CounterDemo","props":{"label":"Try it","initial":2},"children":"## Embedded counter\n\nThis Markdown becomes the native slot."}
```
````

`component` defaults to the registered name. Props accept JSON strings, finite
numbers and booleans; there are no executable expressions or event callbacks in
Markdown. Components own their Exact actions and can inject root bindings.
`children` is optional Markdown and contributes to headings, links and search.
Unknown components fail validation; Exact checks native prop contracts at build.
An alternate renderer must supply its own component adapter: the HTML renderer
throws when a component has no adapter.

## Search delivery and application state

Control focus, pointer approach or pointer-down starts fetch hints for the shared
application, input helper and full Exact host stylesheet in parallel. Hints do not
evaluate application modules, start root tasks or apply additional styling. There
is no idle prefetch. Reading without control intent does not fetch the application.
Search indexes use native imports after a nonempty query, without speculative
module preloads: a failed index preload prevented reload recovery in WebKit.

Live search imports a separate JavaScript index module for the current
`(locale, version)` only after a nonempty query. Empty queries load no index;
subsequent queries reuse the imported module. The static JSON indexes described
above remain available for external search adapters. The reference layout shows
pending and failure feedback, and custom layouts can inject `docsSearchPending`
and `docsSearchFailed` as booleans.

The compiler shares one layout across routes and derives metadata for the active
page. Markdown paragraphs, headings, links, tables, lists, code and component slots
use native block templates shared by structure. Text and syntax-token values, plus
the original Markdown, are emitted as separate page modules. There is no browser
Markdown parser or HTML injection path.

Each static URL still contains complete rendered Markdown and the current page's
Exact checkpoint. The initial page reuses that checkpoint during activation, without
requesting its page module. Later navigation imports only the destination page's
data. Resolved page replies are cached in the same application's data module;
Exact's `kept` hook seeds the initial reply. Cache hits return synchronously so
Back/Forward can restore reading positions without an intermediate empty page.
Neither page modules nor search indexes receive speculative module preloads.

Layouts and root resources, mutations, tasks and memory remain in one Exact app.
Custom Exact pages and embedded components' executable code remain compiled into
that shared app; their code is not dynamically compiled or loaded as independent
applications. Embedded component props stay literal in native templates to preserve
Exact's type checking, including restricted prop types. Their Markdown slot text is
page data. Template diversity and custom code can still increase the shared entry.

A destination page waiting for data shows `contentLoading`; a failed import shows
`contentError` and keeps navigation available. The prior page's prose and Markdown
source are never presented as the destination's content. Custom layouts can inject
`docsContentPending` and `docsContentFailed`; `docsMarkdown` is empty until the
current page's reply is ready. The reference and reader layouts disable Copy
Markdown while content is pending or failed. A normal reload recovers a failed
page through its complete static HTML and checkpoint.

The application runtime still has a first-activation cost. Page data splitting
reduces that cost's dependence on total prose volume; route/TOC metadata, native
runtime, templates and custom Exact code remain part of the shared entry.

## Document metadata and navigation

Markdown pages can start with YAML frontmatter:

```yaml
---
title: Authoring
description: Write documentation and interactive Exact pages.
group: Documentation
nav: true
search: true
noindex: false
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
public route or raw Markdown export. `noindex: true` excludes the page from the
sitemap and emits `noindex,follow`; it does not hide public content or exclude search.

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

## Search-engine metadata

Set `origin` in `docs.json` to the production HTTP(S) origin, such as
`https://docs.example.com`. It must have no path, credentials, query or fragment.
With it, builds emit absolute self-canonical URLs, `sitemap.xml` and `robots.txt`.
The sitemap includes indexable archived versions. Pages also emit robot directives
and alternate-language links for indexable counterparts sharing the same logical
ID and version, with `x-default` pointing to the default-language counterpart.
Without an origin, absolute URLs and sitemap/robots files are omitted.

The exported HTML sets document `lang` and `dir`. A small metadata bridge updates
these attributes and alternate links after Exact navigation; the native route head
owns titles and descriptions; the bridge also synchronizes canonical URLs and
robots directives because this Exact host only updates those fields during export. Custom Exact pages
participate using their configured metadata.

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

| Injected binding                        | Type               | Meaning                                                                 |
| --------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| `docsPlatform`                          | `string`           | `web`, `macos`, or `ios`                                                |
| `docsGroups`                            | `DocsGroup[]`      | Ordered groups with `id`, `title` and `items: DocsLink[]`               |
| `docsPrevious`, `docsNext`              | `option<DocsLink>` | Adjacent visible pages, or `none`                                       |
| `docsDescription`                       | `string`           | Resolved page description                                               |
| `docsMarkdown`                          | `string`           | Current ready Markdown, empty for Exact pages or pending/failed content |
| `docsMarkdownUrl`                       | `string`           | Static raw-source URL on Web, empty for native targets and Exact pages  |
| `docsSearchPending`, `docsSearchFailed` | `bool`             | Current search resource status                                          |

Multilingual/versioned contexts additionally provide:

| Injected binding                          | Type           | Meaning                                                                  |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `docsLocale`, `docsVersion`, `docsPageId` | `string`       | Current normalized scope and logical identity                            |
| `docsLocales`, `docsVersions`             | `DocsChoice[]` | Ordered `{id, label, href, current, exact}` switch choices               |
| `docsVersionStatus`                       | `string`       | `current`, `archived`, `deprecated`, or empty when versioning is omitted |
| `docsLabels`                              | `DocsLabels`   | Locale labels merged with English defaults                               |
| `docsSearchIndexUrl`                      | `string`       | Current scope's static search index on Web; empty on native              |

Import `DocsChoice` and `DocsLabels` from `@lenso/exact-docs/contract` as needed.
The original layout props remain unchanged; custom layouts opt into injections.

Import `DocsGroup` from `@lenso/exact-docs/contract` when using grouped navigation.
Layouts choose which bindings to inject. Existing layouts need no new props or
injections. Content status is available as optional `docsContentPending` / `docsContentFailed`
boolean injections. The context also preserves inherited root-extension bindings for
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
EXACT_ROOT=/absolute/path/to/exact bun experiments/exact-docs/test/production.mjs
EXACT_ROOT=/absolute/path/to/exact bun experiments/exact-docs/test/content-loading.mjs
```

The browser scripts use the docs workspace's Playwright installation.
`production.mjs` verifies that intent hints fetch once without activating the app,
search indexes remain query-triggered on nested routes, and root mutations persist
across navigation in Chromium and WebKit. `browser.mjs` retains development mode
for its native virtual-clock tests. Set
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
Both engines also check embedded-component keyboard interaction, syntax token
markers, lazy scope-module requests and language metadata after navigation. Unit
checks cover portable rendering, token text preservation, component boundaries
and SEO scope selection. These browser checks do not establish native behavior;
see NATIVE.md for the Apple verification scope.

Exact is pre-1.0. This adapter currently targets `host/web-js/build.mjs` with
`--render js`; upstream interface changes may require changes here.

## Reproducible loading comparison

[ASTRO_COMPARISON.md](ASTRO_COMPARISON.md) is the current 300-page comparison:
Exact page-data loading, Astro static navigation, and Astro ClientRouter with a
persisted counter. It measures cold search and a separate first counter action,
then destination/Back body readiness and retained state under identical network
and CPU limits. The Astro fixture implements the listed reading controls with
vanilla JavaScript; it does not reproduce Exact's resource/mutation/task system.

```sh
# From experiments/exact-docs, with EXACT_ROOT and PLAYWRIGHT_MODULE set as above:
(cd bench/astro && bun install --frozen-lockfile --ignore-scripts)
# Generate the corpus if .cache/scale/300 is absent:
SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale
bun run test:compare
```

The comparison writes disposable builds and samples under `.cache/comparison/`.
It does not edit the product example, source corpus, or default theme.

[STARTUP.md](STARTUP.md) records the shared-entry analysis and page-metadata
extraction. To measure a compiler change against the same comparison fixture,
save its output outside `.cache/comparison` before editing, then run:

```sh
cp -R .cache/comparison/exact/dist .cache/startup-before-dist
EXACT_BASELINE_DIR="$PWD/.cache/startup-before-dist" bun run test:compare
```

The saved output is served unchanged alongside the new build and both Astro
modes. Trials alternate implementation order between rounds; transferred bytes
and script durations accompany the timing samples.

[PERFORMANCE.md](PERFORMANCE.md) records a local Exact/Astro comparison of the same
nine-document reading/search workload before page-data splitting. It is a small Astro static fixture, not
Starlight or a feature-complete framework comparison. It records first paint,
transferred bytes, actual search-result paint and repeat search under stated
network/CPU limits. Development and release builds with and without intent hints
use the same measurement method; raw samples include request and long-task traces.

```sh
# From experiments/exact-docs, with EXACT_ROOT and PLAYWRIGHT_MODULE set as above:
(cd bench/astro && bun install --frozen-lockfile --ignore-scripts)
bun run test:performance
```

The benchmark uses its own pinned dependencies and lockfile. It writes generated
fixtures and raw samples under `.cache/performance/` and refreshes the report.
`PERF_RUNS` changes the number of samples (default 3, maximum 10). Benchmark-only
CSS belongs to the Astro comparison fixture; it is not a product theme.

To compare a future change against the current shared bundle, first run the benchmark
and save its nine-document output before editing:

```sh
cp -R .cache/performance/docs/dist .cache/bundle-before
BUNDLE_BASELINE_DIR="$PWD/.cache/bundle-before" bun run test:performance
```

Use a fresh snapshot directory for each comparison. `BUNDLE_BASELINE_DIR` must be
an output of the same synthetic fixture, not an arbitrary documentation site. The
extra column uses identical browser conditions and does not rebuild the snapshot.
The report includes raw/gzip entry sizes and CDP script/main-thread task durations.

## Framework acceptance

[ACCEPTANCE.md](ACCEPTANCE.md) records framework findings and reader/layout checks;
[SCALE.md](SCALE.md) records 100/200/300 total URLs across two languages and two
versions, including the remaining single-application activation cost.

```sh
bun run test:acceptance
bun run test:scale
```

Both use the same initialized Exact checkout and Playwright setup as the browser
checks above. Scale timings use Chromium with stated throttling; the largest
fixture also receives a WebKit functional check. These commands create disposable
fixtures rather than modifying the example or the main Fumadocs website.

`layouts/reader.contract` is a complete unstyled custom-layout example using the
public props and injections for groups, search feedback, TOC, pagination, raw-source
actions and language/version controls. Configure `layout` to use `ReaderLayout`.
It introduces no stylesheet or theme dependency. Custom layouts can mark their
focusable main region with `data-docs-part="content"`; keyboard page navigation
moves focus there with scrolling left to Exact. Same-page fragments and history
scroll restoration stay native. A layout without that marker retains ownership of
its focus behavior.

Route selection uses a balanced expression, so adding pages does not create a
linear chain beyond Exact's expression-depth limit. Navigation/groups/labels are
shared once per scope; metadata loads with the active page's body data. Page data loads individually while the root application remains mounted.

[CONTENT_LOADING.md](CONTENT_LOADING.md) explains page data delivery and the
same-run 300-page comparison. `bun run test:content-loading` checks cold SSR,
page-only requests, cached replies, delayed responses, widget/root state, user
`kept` forwarding, deferred fragments and failure recovery in Chromium/WebKit.
For a before/after scale comparison, retain the old 300-page output before changing
the compiler, then set `SCALE_BASELINE_DIR` to that directory for `test:scale`.
It must be the same synthetic fixture; the baseline is served without rebuilding.
