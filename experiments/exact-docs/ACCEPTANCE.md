# Framework acceptance

This acceptance keeps one Exact application and root memory across routes. It adds
no default theme or stylesheet. The main Fumadocs website is unaffected.

## Scope

- 100, 200 and 300 **total registered URLs**, across English/Chinese and v2/v1:
  25, 50 and 75 logical topics per scope. Each URL has its own Markdown source.
- Twenty-four paragraphs, four sections, source links, inline markup, a code block
  and deterministic per-paragraph identifiers per document.
- Chromium timings use gzip, fresh browser contexts, disabled cache, 80 ms latency,
  200,000 download bytes/second and 4× CPU slowdown. The largest fixture also gets
  functional checks in WebKit. See [SCALE.md](SCALE.md) for actual measurements.
- An independent `ReaderLayout` consumes the public Contract props and injections.
  It exercises groups, title/description, TOC, previous/next, raw-source actions,
  localized labels, version status and language/version choices without framework
  imports beyond the published Contract entry.

## Findings fixed

| Finding                                                                                                                  | Fix                                                                                                                                                        | Regression seam                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| The original 100-page build exceeded Exact's 64-level expression nesting limit.                                          | A flat route-name index selects metadata through a balanced expression. Logical path/locale/version/ID derive from that selected record.                   | Real 100/200/300-page compiler and browser runs, including the last scope in WebKit.                               |
| Navigation/groups/labels were repeated in every page constructor, causing excessive growth.                              | Store this data once per locale/version. Construct only the active page's metadata.                                                                        | Entry byte sizes and build times in the scale report; scope-isolated navigation/search and counterpart links.      |
| This Exact Web host updates title/description after navigation, but canonical and robots remained from the initial HTML. | Extend the existing metadata bridge to synchronize canonical and robots, including noindex and 404 pages. Export and browser metadata use the same policy. | Scope/version canonical checks plus index → noindex → index transitions and a real 404 in the custom-layout suite. |
| Keyboard page navigation left focus on the document body after the source link unmounted.                                | Move focus to the new layout's marked main region after keyboard navigation, without scrolling.                                                            | Enter on a page link ends at `data-docs-part="content"`; skip links and TOC remain native.                         |
| A failed scope `modulepreload` prevented ordinary reload recovery in WebKit.                                             | Remove speculative scope-index preloads; keep native imports after nonempty queries. Application/helper/CSS intent hints remain.                           | A controlled noncacheable 503, visible failure feedback, normal reload and successful search in both engines.      |

The index-preload fix deliberately trades speculative index overlap for verified
failure recovery. It adds no retry loop, alternate search engine or permission
change to application data sources.

## Reader and layout results

Chromium and WebKit verify:

- The custom layout renders its content slot and uses title, navigation, groups,
  labels, TOC, pagination, raw Markdown URL and native copy action. Copy uses a test
  clipboard rather than the system clipboard.
- Keyboard skip links enter the main region; TOC fragments scroll to their heading;
  keyboard page changes focus the new main region.
- Browser Back restores the position actually left after navigation focus. A
  separate unfragmented reading test restores a 1,500-pixel position. Exact owns
  routing, fragment handling and history scroll; no second scroll/history manager
  was introduced.
- Exact and fallback language/version changes, archived notices, Arabic RTL and
  canonical/language updates work with the custom layout.
- Root resource mutation state remains after multiple page/language/version
  changes. A delayed old-scope search reply cannot replace the new scope's results.
- Search pending, empty and failure feedback render through public injections;
  reload recovers after a controlled index request failure.
- Hidden noindex pages remain directly readable, update canonical/robots on entry
  and clear noindex when leaving. Unknown URLs return the generated 404.

`example/layouts/reader.contract` is an unstyled reference integration, not a theme.
The existing minimal layout remains available. Custom layouts opt into keyboard
main-focus behavior by marking their main region `data-docs-part="content"`; a
layout without that marker retains responsibility for focus behavior.

## Verification and limits

Run from this package with `EXACT_ROOT` and the matching `PLAYWRIGHT_MODULE`
documented in README:

```sh
bun test test/*.test.ts
bun run typecheck
bun run test:browser
bun run test:production
bun run test:acceptance
bun run test:scale
```

Functional acceptance at 300 URLs does not establish a production performance
budget. Markdown text and source now load as per-page data through native shared block
templates. Route metadata and custom Exact/widget code still belong to the shared
application. See [CONTENT_LOADING.md](CONTENT_LOADING.md) for the delivery change. [SCALE.md](SCALE.md) reports that cost rather than hiding it behind an
idle wait. Build timings are single local measurements; browser timings use three
samples by default. These fixtures do not establish visual accessibility under a
future theme, assistive-technology compatibility, device behavior, or support
beyond Web. No landing or publication is part of this acceptance.

## Page data follow-up

Markdown content is now loaded by page without replacing the root app. A dedicated
`test:content-loading` browser suite verifies that the first page reuses its HTML
checkpoint, unvisited page modules are not requested, delayed old replies cannot
replace the active page, cached replies need no additional request, and deferred
fragments work after the destination arrives. It also checks loading/error feedback,
disabled copy actions, reload recovery and root mutation state across these cases.

Async page data exposed a WebKit Back-position regression: an interim empty body
could collapse the document before scroll restoration. Resolved replies now return
synchronously from a page cache; Exact's native `kept` hook seeds the initial page.
The framework forwards a user's existing `kept` hook, verified by a fixture that
requires its source/args/value before a root mutation succeeds. Routing, fragments
and history restoration remain owned by Exact; no second scroll manager was added.

Native widget code and literal props stay in shared templates. Native custom Exact
pages remain eagerly compiled. These boundaries preserve execution and prop-type
contracts while moving Markdown prose and syntax token values out of the shared
entry. No theme or runtime Markdown compiler was introduced.
