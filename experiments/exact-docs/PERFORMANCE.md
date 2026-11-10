# Documentation loading comparison

This nine-page snapshot predates the framework acceptance fixes. See [SCALE.md](SCALE.md) and [ACCEPTANCE.md](ACCEPTANCE.md) for current scale/behavior findings; rerun the benchmark for current nine-page timings.

Measured 2026-11-10T17:13:47.928Z. Astro 7.4.8, Bun 1.4.4, Chromium 156.0.8078.4.

A local synthetic reading/search fixture: nine documents, 48 paragraphs each, built from the same content model and build-time syntax tokens. Both expose navigation and case-insensitive substring search with a lazily imported index. Both are served as gzip-compressed static files from Bun. Each sample starts in a fresh browser context, with cache disabled, 80 ms latency, 200,000 download bytes/second and 4x CPU slowdown. Values are medians of 3 runs.

| Metric                                         | Previous release, intent hints | Exact development, no hints | Exact release, no hints | Exact release, intent hints | Astro static fixture |
| ---------------------------------------------- | -----------------------------: | --------------------------: | ----------------------: | --------------------------: | -------------------: |
| Script execution during first search (ms)      |                           30.9 |                        62.3 |                    61.5 |                        17.7 |                    1 |
| Main-thread tasks during first search (ms)     |                          150.2 |                       186.3 |                     175 |                       101.2 |                 24.4 |
| First contentful paint (ms)                    |                            228 |                         236 |                     216 |                         208 |                  168 |
| Transfer before search (gzip bytes)            |                           8919 |                        8952 |                    8804 |                        8891 |                 2301 |
| External scripts before search (gzip bytes)    |                            939 |                         939 |                     939 |                         939 |                 1256 |
| First search painted (ms)                      |                          869.5 |                       906.1 |                   912.6 |                       726.1 |                138.9 |
| Input event to search paint (ms)               |                          808.4 |                       860.6 |                   830.7 |                       701.6 |                117.9 |
| Repeat search painted (ms)                     |                           40.8 |                        38.8 |                    56.1 |                        48.8 |                 42.4 |
| Additional repeat-search transfer (gzip bytes) |                              0 |                           0 |                       0 |                           0 |                    0 |
| Additional first-search transfer (gzip bytes)  |                         119788 |                      107206 |                   99643 |                       99643 |                 1898 |

## Shared application bundle

| Build                          | app.js bytes | app.js gzip bytes |
| ------------------------------ | -----------: | ----------------: |
| Previous release, intent hints |       506133 |             91194 |
| Exact development, no hints    |       383674 |             76155 |
| Exact release, no hints        |       369201 |             71075 |
| Exact release, intent hints    |       369201 |             71075 |

The generated renderer previously expanded the complete documentation layout once per route. It now has one layout call site with derived metadata for only the active page. Root resources, mutations, tasks and navigation still belong to the same application; page entries have not been separated. Ordinary consecutive plain-text paragraphs use a keyed data loop, sharing rendering instructions while preserving paragraph boundaries. Duplicate text ends a run to keep keys unique; rich content and embedded components retain their ordinary Exact rendering.

The previous-release column, when present, serves an unchanged saved pre-optimization output under the same browser conditions. It has the same production mode and intent hints as the current release. Bundle byte counts cover app.js; transfer rows include CSS, helper modules, protocol overhead and the query-triggered index. Script and task durations are CDP metric deltas from just before input to observed result paint, including small automation/measurement costs; tasks include rendering and are not CPU profiles of individual functions.

## What the original 1.32 seconds contained

The original benchmark used Exact's development bundle. A separate resource/long-task recording reproduced roughly 620 ms of application download, followed by 145–150 ms of full-host stylesheet loading, then about 95–100 ms for the tiny scope index. The input helper arrived another 150–165 ms after its late request. These intervals overlap in part and must not be added as independent costs. Main-thread long tasks around activation were about 60–90 ms; the application download and serial discovery dominated. The application transferred about 108 KB including resource-timing overhead, versus about 2 KB for the scope index. The original request and long-task recordings are preserved in [bench/baseline.json](bench/baseline.json).

The original readiness measurement used Playwright locator polling, which can overshoot actual rendering. This harness now observes result mutations and waits for two animation frames, and separately reports input-event-to-paint time. The new development baseline and release variants use the same corrected method; compare those columns for the effects of this change, rather than attributing the entire difference from the historical 1.32 seconds to optimization.

## Changes and tradeoffs

Static exports now use Exact's production mode; local preview and virtual-clock browser checks explicitly retain development mode. The two release columns use identical app code; the no-hints variant removes only the HTML hint configuration. On focus, pointer approach or pointer-down at an Exact control, fetch hints start the application, input helper and full host stylesheet together. A nonempty search input can also hint its initial scope module while Exact boots. Modulepreload fetches/parses modules but does not evaluate them: root state, resources and tasks still start at Exact activation. There is no idle prefetch, and reading without control intent downloads no application or search index. The scope index remains query-triggered. Unchanged headless host CSS is only fetched early, not applied early.

All variants are measured with immediate input after initial load; no reading delay is inserted to hide the work. Intent hints can consume bandwidth before an eventual click, so compare total bytes as well as latency. The shared application and its first activation remain real costs. First-search transfer includes pending activation requests until network idle; repeat search starts after that settling period, checks a different result set and reports additional transferred bytes.

## Limits and reproduction

The Astro fixture is a small semantic-HTML implementation, not Starlight or a feature-complete copy of Exact Docs. Exact retains its native host CSS, metadata bridge, root resource model and application navigation. The fixture uses browser elements and a small search listener. Typography is approximately aligned, but DOM and host defaults differ. This compares the stated reading/search workload, not general framework or native performance. Inline scripts count toward HTML transfer; the external-script row excludes them. Resource timing and CDP transfer totals have different overhead accounting. Long-task entries report only tasks over 50 ms, not all execution time. Local timings and background activity affect samples.

Reproduce with `bun run test:performance` after installing isolated `bench/astro` dependencies and setting `EXACT_ROOT` and `PLAYWRIGHT_MODULE` as described in README. Raw samples include request and long-task timelines at [.cache/performance/results.json](.cache/performance/results.json). Set `BUNDLE_BASELINE_DIR` to a saved pre-change build output to include it in the same run. For a diagnostic trace of the current build alone, run `bun bench/profile.mjs`; `PROFILE_NO_HINTS=1` removes the hints for comparison.
