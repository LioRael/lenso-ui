# Page data loading

This table records the earlier body-only extraction. Page modules now also carry
TOC, descriptions, canonical/robots/alternate SEO and locale/version switch
targets, including metadata for custom Exact pages. [STARTUP.md](STARTUP.md)
records that follow-up and its same-run Astro comparison. Custom executable code
still stays in the single application.

Measured 2026-11-10T19:32:56.885Z with Bun 1.4.4 and Chromium 156.0.8078.4.
The original saved 300-page output and the new output were served unchanged in one
benchmark run. Both use the same corpus: two languages × two versions × 75 logical
topics, with 24 paragraphs and a code block per page. Values are medians of three
fresh-context samples: gzip, cache disabled, 80 ms latency, 200,000 download
bytes/second and 4× CPU slowdown. No reading delay or idle application prefetch is
inserted. The saved baseline is not rebuilt during the comparison.

| Metric                                     | Previous inline bodies | Page data |
| ------------------------------------------ | ---------------------: | --------: |
| Shared app.js bytes                        |                5216521 |    595958 |
| Shared app.js gzip bytes                   |                 410387 |    118157 |
| Initial transfer bytes                     |                  10433 |     11213 |
| First-interaction transfer bytes           |                 464957 |    172720 |
| First search paint (ms)                    |                   3103 |      1168 |
| Script during first search (ms)            |                  373.1 |        44 |
| Main-thread tasks during first search (ms) |                  535.7 |     148.3 |

The shared gzip entry is about 71% smaller; first search is about 62% faster in
this fixture. Initial HTML/checkpoint transfer increases slightly. Combined initial
and first-interaction transfer falls from
475390 to
183933 bytes.
CDP script/task values include small measurement and automation costs and are not
per-function CPU profiles. Build timings and the current 100/200/300-page results
are in [SCALE.md](SCALE.md); timings are local measurements rather than general
framework guarantees.

## Delivery and state

The site remains one native Exact application. Its layout, route/TOC metadata,
root resources, mutations, tasks and memory remain mounted. Markdown values and
original source move into page modules. Native block templates are deduplicated
by structure and shared across pages; code tokens retain semantic markers without
a palette. No client Markdown parser, dynamic Contract compiler or HTML injection
renderer is added.

Every static route still contains its complete rendered body and current-page
checkpoint. On activation, Exact uses that checkpoint: no current or unvisited
page module is requested. Navigation imports only the destination's data. Metadata
uses the same request and cache as the body; no separate metadata request is added.
During a pending or failed destination, old TOC and switch targets are cleared,
canonical/alternate metadata is removed and robots becomes `noindex,follow` until
the new metadata arrives. Route language/direction remain available immediately.
Custom Exact pages use the same loading/error boundary for their metadata; their
code is still compiled into the shared application. The
earlier body-only 300-page fixture emitted 300 body modules, averaging about
1.35 KB gzip each. Current modules also include metadata; their transfer tradeoff
is measured in STARTUP.md. The tested initial activation downloads zero
body modules, and the subsequent three distinct destinations download exactly
three modules. Returning to a known page makes no further body request.

Resolved replies are cached in the application's data module. The native
`kept(source, args, value)` hook seeds the initial page from its checkpoint; existing
user hooks still receive their arguments. Cache hits return synchronously. This
fixes a WebKit reading-position regression where an async placeholder could
collapse the document before native Back restoration. No custom history or scroll
manager is installed.

Loading/error slots keep the rest of the layout usable. A body is shown only when
its path matches the current route, preventing old prose from appearing under the
new page title. Optional `docsContentPending` and `docsContentFailed` injections
let layouts control feedback; raw Markdown is empty while a destination is not
ready, and reference copy controls are disabled. Failed module loads use normal
reload recovery. Modules are imported normally rather than speculatively preloaded,
which preserves the verified WebKit failure-recovery behavior.

## Native boundaries

Custom Exact pages and embedded component executable code remain in the shared
application. Component props remain literal native expressions so constrained
prop types keep their existing compiler checks; Markdown slots are page data.
Root state is preserved; local page/widget state keeps Exact's existing route
lifetime. A growing variety of block structures can add shared templates, and
custom code can still dominate an application's size. This is page data loading,
not arbitrary lazy loading of Contract code or a native-platform acceptance claim.

The framework remains headless. Existing parts, syntax-token markers, raw Markdown
and portable IR exports remain available. No default theme is introduced.

## Checks and reproduction

`test:content-loading` passes in Chromium and WebKit. It exercises complete cold
SSR, zero initial body requests, widget interaction, root mutation retention,
controlled delayed replies, no stale body/copy data, cache reuse, deferred fragment
focus, failure/reload recovery and forwarding of a user's `kept` hook. The existing
production, custom-layout/reading and development recovery suites also pass.
Pure compiler coverage verifies that prose stays out of templates, duplicate
paragraphs keep distinct keys, nested code keeps token groups, and widget props
retain literal native typing.

From this package with the documented Exact/Playwright environment:

```sh
bun run test:content-loading
SCALE_BASELINE_DIR=/absolute/path/to/saved-300-page-output bun run test:scale
```

The baseline must be an output of the same synthetic fixture. Without it,
`test:scale` measures current builds only. Raw samples are retained at
[.cache/scale/results.json](.cache/scale/results.json).
