> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Shared route data follow-up

Historical route/scope extraction measurement. The subsequent search-loading change and current comparison are in [SEARCH_STARTUP.md](SEARCH_STARTUP.md).

Measured 2026-11-10T23:35:48.422Z after the native Apple integration. The saved baseline is the same 300-page fixture built immediately before this extraction. Native builds and functional browser suites had finished before the timed comparison started. Results are medians of three fresh-context trials, interleaved with reversed implementation order on alternate rounds: gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown. [ASTRO_COMPARISON.md](ASTRO_COMPARISON.md) records both Astro modes and the full comparison limits. [STARTUP.md](STARTUP.md) retains the earlier metadata extraction measurements.

## Change

Each route previously repeated locale, language, reading direction, version, version status and search-index URL. These now live once per locale/version scope. The route record has six fields instead of fifteen: route, path, title, logical page ID, custom-page flag and scope. Markdown URLs are derived from the route path on Web and remain empty on native targets.

Previous/next links travel with the existing per-page body/metadata module. Their public injection types remain option<DocsLink>. While a destination is pending or failed, these bindings are none rather than links left over from another page. Initial HTML/checkpoint still includes the current page's links; activation makes no additional page request. Language, direction and version status remain immediately available from scope data. The same layout contract works for custom Exact pages.

The single root application, resources, mutations and tasks remain mounted. Native AppKit/UIKit builds retain offline data modules and visited page screens. No theme is added.

## Results

| Metric                                            | Before |  After |
| ------------------------------------------------- | -----: | -----: |
| Shared app.js raw bytes                           | 341157 | 286470 |
| Shared app.js gzip bytes                          |  92461 |  86416 |
| Generated application raw bytes, before bundling  | 161482 | 106890 |
| Generated application independently gzipped bytes |  27306 |  21238 |
| Transfer before interaction, bytes                |  11536 |  11544 |
| First search rendered, ms                         | 1018.2 |  984.2 |
| Additional first-search transfer, bytes           | 147026 | 140981 |
| Script during first search, ms                    |   28.3 |   26.5 |
| First counter interaction, ms                     |  811.8 |  789.4 |
| Additional first-counter transfer, bytes          | 119063 | 113018 |
| Repeat search rendered, ms                        |   36.9 |   34.7 |
| Cold destination body ready, ms                   |  162.3 |  178.8 |
| Additional cold-navigation transfer, bytes        |   1783 |   1809 |
| Back body ready, ms                               |   35.3 |   35.2 |
| Additional Back transfer, bytes                   |      0 |      0 |

The entry decreases 16.0% raw and 6.5% gzip. Each cold interaction downloads 6,045 fewer bytes. Generated application gzip is a diagnostic, not an additive allocation within app.js. Input glue remains 13,393 gzip bytes and the stylesheet 12,697 bytes. Initial HTML and a destination module grow slightly because pagination travels with page data.

First-search latency improves 3.3% and counter latency 2.8% in this run. Cold navigation is slower by 16.5 ms; three samples do not establish whether this is a persistent timing regression. The byte reduction is deterministic for these outputs. Timings reflect local host load as well as the controlled browser conditions, and no per-function CPU attribution is claimed.

Astro ClientRouter retains its persisted counter and measures 247.4 ms for first search and 64.5 ms for the counter; static Astro measures 251.6/63.3 ms but resets the counter during full-page navigation. Exact retains root state on forward navigation and Back. The Astro fixture does not reproduce Exact's resource/mutation/task or native runtime contracts. These results do not establish general product parity. Remaining startup work should examine the runtime/host, activation sequence and input glue rather than repeatedly moving small page fields.

## Verification and reproduction

Unit tests, package typecheck, affected lint and formatting pass. Production, custom-layout acceptance and controlled content-loading suites pass in Chromium and WebKit. New assertions check that pending pages expose no stale pagination, the raw-source URL remains usable while content loads, and a fast destination keeps its own adjacent links after an older reply resolves. Existing checks cover deferred fragments, cache reuse, root state, search failures, reload recovery, RTL, SEO, keyboard focus and reading position.

Both native builds and the shared native interaction specification pass again after this extraction on Apple Silicon macOS and arm64 iOS Simulator, including missing-page return. [NATIVE.md](NATIVE.md) records the tested scope and unverified platforms.

With the README's Exact/Playwright environment, from this package:

```sh
# Save the old output before editing, using a new directory outside .cache/comparison.
cp -R .cache/comparison/exact/dist .cache/routing-before-dist
EXACT_BASELINE_DIR="$PWD/.cache/routing-before-dist" bun run test:compare
```

The comparison recreates .cache/comparison, serves the saved baseline unchanged, and stores all samples and entry sizes in .cache/comparison/results.json. The baseline must be this same authored fixture. Do not rebuild it after changing the compiler.
