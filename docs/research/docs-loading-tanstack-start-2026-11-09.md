# Documentation loading and TanStack Start

Date: 2026-11-09

## Scope and sources

This review uses the installed application (`@tanstack/react-start` 1.169.4,
`@tanstack/react-router` 1.170.46, Vite 8.3.5), its generated browser files,
and these official guides:

- [Start execution model](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
- [Router automatic code splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting)
- [Router preloading](https://tanstack.com/router/latest/docs/guide/preloading)
- [Start static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [Start deferred hydration](https://tanstack.com/start/latest/docs/framework/react/guide/deferred-hydration)
- [Start production checklist](https://tanstack.com/start/latest/docs/framework/react/guide/production-checklist)
- [Vite dependency prebundling](https://vite.dev/guide/dep-pre-bundling)
- [Vite production chunking](https://vite.dev/guide/build#chunking-strategy)
- [Rolldown manual code splitting](https://rolldown.rs/in-depth/manual-code-splitting)
- [Rolldown code splitting options](https://rolldown.rs/reference/OutputOptions.codeSplitting)

The current documentation can describe features newer than installed packages.
The installed Start client exports `Hydrate`, and the installed Rolldown types
support the chunk options used here. No framework upgrade is part of this change.

## Findings

The development request count is not a measurement of framework runtime size.
Vite serves source modules as native ESM in development. Linked workspace
packages and large export barrels can produce hundreds of separate requests.
Prebundling reduces third-party module fan-out; it does not change production
bundles. Source aliases are intentional here so StyleX and component edits stay
live without rebuilding packages. The explicit dependency list also avoids
discovering another dependency and reloading the page during a documentation
visit.

Production still had a separate problem. Before this review, the homepage had
140 modulepreload links, 105 of them pointing to files smaller than 5 KB. Its
entry's static dependency graph contained 94 files. The complete initial browser
load made 141 JavaScript requests. This is output fragmentation, not 141 separate
TanStack features.

The application was also importing document infrastructure on homepage visits:

| Owner                     | Unnecessary startup dependency                                       | Change                                                          |
| ------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Locale validation         | The complete document source and generated index                     | Keep locale validation in its own small module                  |
| Legacy `/docs/$` redirect | Document source imported by the route definition                     | Import canonicalization only when this redirect runs            |
| Document route loader     | The MDX import registry and document source in the main route bundle | Group this route's loader and component in one lazy route chunk |
| Production output         | Many separate shared runtime helpers                                 | Group React, routing and control helper runtimes separately     |

Automatic route component splitting was already operating. Adding another router
plugin or merely setting an automatic-splitting flag would not repair these
dependency boundaries.

## Applying the framework guidance

Start loaders are isomorphic. They run on the server during rendering and in the
browser during navigation. They are not server-only because their results were
prerendered. Start also hydrates the full document by default; static export does
not make an interactive page JavaScript-free. A `"use client"` directive is not
a mechanism for excluding other application modules from this browser bundle.

Router deliberately keeps loaders in the initial route definitions by default
to avoid delaying data fetching with another code request. This document route
is a concrete exception: its loader imports an entire MDX module registry, and
its data and component code are only useful on documentation visits. Grouping
`loader` and `component` together preserves one shared route download rather
than creating separate serial requests for each. The existing `intent` preload
policy can start that route on hover or touch. Ordinary lightweight loaders and
route guards retain the defaults.

The production groups target React, Router and control helper runtimes, not all
of `node_modules` or all components. Start's client bootstrap is deliberately
excluded from the Router group: it imports the virtual application router, so
capturing its dependencies recursively can also capture application code.
The groups retain the bundler's normal dependency and execution behavior.
Page bodies, MDX documents, search and language grammars keep their dynamic
import boundaries.

Request count must be checked with bytes. A discarded experiment merged the
whole initial dependency graph: the homepage fell to 18 requests, but gzip
JavaScript grew from 474,486 to 586,210 bytes. The output suggests that grouping
the startup graph pulled code across barrel-based feature boundaries; regardless
of the precise bundler phase responsible, this increased transfer cost.
Another discarded configuration disabled recursive dependency capture and
enabled strict execution wrapping; that made the UI barrel retain unrelated
controls and increased homepage gzip JavaScript to 643,178 bytes. Neither
configuration is retained.
The production regression now caps request count, decoded bytes and gzip bytes
together and verifies that homepage scripts contain no document source index.

Deferred hydration is an experimental option for expensive content that users
do not need immediately. The official guide specifically advises against
deferring primary navigation and immediately interactive hero content. This
change therefore retains immediate hydration of the homepage Tabs and site
controls. Search dialog code and offscreen language highlighting already load
on use. Further deferral should be tied to measured below-the-fold work rather
than wrapping the entire site shell.

## Verification method

The final production measurements matched in Chromium and WebKit:

| Page                             | JS requests before → after | Decoded JS bytes before → after | Gzip JS bytes before → after |
| -------------------------------- | -------------------------: | ------------------------------: | ---------------------------: |
| `/en`                            |                   141 → 75 |           1,498,364 → 1,150,989 |            474,486 → 407,899 |
| `/en/docs/react/components/tabs` |                  180 → 114 |           2,189,696 → 2,120,662 |            619,244 → 595,438 |

The homepage saves 47% of JavaScript requests, 23% of decoded JavaScript and
14% of compressed JavaScript. The Tabs document saves 37% of requests and about
4% of compressed JavaScript. The smaller document byte improvement matters:
most of that route's code is still required to render and hydrate its live
documentation. These results do not justify claiming an equivalent percentage
reduction in loading time or that the document page is now lightweight.

`test:production-loading` serves the completed static export on localhost with
gzip responses. Each measurement uses a fresh browser page with a desktop
viewport, closed search and offscreen source panes, and stops collecting after
network idle. It reports JavaScript response count, decoded bytes and compressed
body bytes. HTML, CSS, images and HTTP headers are not included in those byte
figures. Chromium and WebKit exercise homepage Tabs, client navigation into the
document route, first-use search, focus restoration and first-use highlighting.

The source-development loading check remains separate. Document loading tests
also delay the MDX response and verify initial hydration, article continuity,
navigation and history. Static export checks verify aliases and emitted StyleX
delivery. These local checks do not establish public-CDN behavior, physical
iPhone performance, or a production loading-time improvement under real network
conditions.

## Follow-up: loading document content on demand

The next pass separates work by the user action that needs it:

- The first Playground remains server-rendered and immediately interactive.
  Its source renderer and source files load when the Code panel opens, rather
  than on Playground mount. Live controls and source retain shared story context.
- Other live demos mount near the viewport. Closed native disclosures keep
  their examples unmounted. The observer uses the reserved example scene,
  including its area before a demo has children; observing an empty inner box
  was unreliable in WebKit. Source panes wait until actually visible.
- Material Playground implementations have separate source modules. Previously
  Tabs, Input, SearchField, Slider, Menu, Glass and GlassMagnifier were used
  exports of one module, shared by different routes. Importing Tabs therefore
  loaded dependencies of its sibling implementations. The old facade remains a
  re-export surface; each story imports its own implementation directly. An
  import-graph regression rejects cross-family coupling for Tabs.
- The appearance trigger remains part of initial navigation. Its list and
  slider panel load on open, with preparation on pointer or keyboard intent.
- Materials and semantic-color introductions no longer become static imports
  of every document route.
- Copy Markdown reads the original document only on demand. Neither the full
  raw Markdown nor its raw-document import registry belongs in initial route
  data. Clipboard writing starts during the click with a pending text Blob so
  fetching the source does not discard Safari's user activation.
- The Start router and current article prepare concurrently. React hydrates
  after both are ready, preserving the initial HTML. Immutable document loader
  data stays fresh for the lifetime of a static build instead of being read
  again immediately after hydration.

The API reference retains normal server rendering and hydration. An experiment
with the installed experimental `Hydrate` boundary made its server-rendered
table disappear before visibility activation in this integration. That failed
the continuity requirement and was removed; a smaller payload with missing
content is not an acceptable improvement.

`test:deferred-content` verifies these loading boundaries, first-use behavior,
Markdown copying, and API continuity in Chromium and WebKit. It complements
`test:document-loading`, which delays the MDX response and tests navigation and
history without a document-loading flash.

Timing uses three fresh Chromium contexts per export at 200,000 download
bytes/second, 80 ms latency and 4× CPU slowdown. Each export is served with gzip
on localhost. The original baseline medians were 1,860 ms FCP, 1,892 ms LCP before
the first interaction, 6,457 ms Playground readiness and 211 ms for the first
tab action. Readiness is the Playground's mounted-ready state followed by an
actual tab-selection check, not a claim about standard TTI or INP. Timing is run
without concurrent builds or other browser tests.

The final three-run baseline recheck and candidate medians were:

| Metric                        |        Baseline |       Candidate |
| ----------------------------- | --------------: | --------------: |
| Tabs initial gzip JS          |   595,438 bytes |   565,702 bytes |
| Tabs initial decoded JS       | 2,120,662 bytes | 2,022,631 bytes |
| Tabs gzip HTML                |   159,488 bytes |   113,244 bytes |
| Tabs decoded HTML             | 2,601,999 bytes | 2,178,401 bytes |
| Initial HTML + JS gzip bodies |   754,926 bytes |   678,946 bytes |
| FCP                           |        1,864 ms |        1,876 ms |
| LCP before first interaction  |        1,896 ms |        1,900 ms |
| Playground readiness          |        6,430 ms |        5,962 ms |
| First tab action              |          242 ms |          236 ms |

The payload checks matched in Chromium and WebKit. Timing is Chromium-only,
using the test server's local HTTP/1.1 gzip responses and desktop viewport.
The main readiness improvement is about 468 ms (7%); first paint and first
interaction time are effectively unchanged at this measurement precision.
Initial HTML + JS body bytes fall about 10%, while JavaScript alone falls about
5%. CSS, fonts and images are excluded from those byte totals. These results
are a bounded improvement, not evidence that the page is lightweight or that
physical phones and HTTP/2/3 CDNs will see the same elapsed times.
