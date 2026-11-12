> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# 300-page Astro comparison

Measured 2026-11-11T09:32:13.130Z. Astro 7.4.8, Bun 1.4.4, Chromium 156.0.8078.4.

Same 300 authored URLs: English/Chinese × v2/v1 × 75 topics, 24 paragraphs and one code block per page. Both render the same document IR and build-time syntax tokens. Both expose grouped scope navigation, language/version links, TOC, pagination, descriptions, raw-source actions, lazily imported per-scope substring search and a counter. Exact uses its normal page-data compiler plus a fixture-only root counter/layout; Astro uses semantic HTML, a small vanilla client script, and optionally its official ClientRouter with a persisted counter element. Neither product styling nor Exact's default theme is changed.

Values are medians of 5 fresh-context runs, interleaved across implementations with reversed order on alternate rounds: gzip delivery from the same Bun static server, cache disabled, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown. Animations are disabled/reduced; link prefetch is explicitly disabled. No reading delay or idle application warmup is inserted. Search/counter trials start separately in fresh contexts. Render timing comes from observed DOM changes and two animation frames, reported through a binding that survives full-page navigation; it excludes locator-polling overshoot. Destination body readiness does not measure theme layout or viewport-specific meaningful paint.

| Metric                                      | Exact before | Exact Docs | Astro static navigation | Astro ClientRouter |
| ------------------------------------------- | -----------: | ---------: | ----------------------: | -----------------: |
| First contentful paint (ms)                 |          208 |        208 |                     176 |                180 |
| Transfer before interaction (bytes)         |        11544 |      11783 |                    4843 |              10723 |
| First search rendered (ms)                  |        997.7 |      929.7 |                     248 |              249.1 |
| Additional first-search transfer (bytes)    |       140981 |     140996 |                   27963 |              27963 |
| Script during first search (ms)             |         37.2 |       24.4 |                     1.5 |                3.6 |
| Repeat search rendered (ms)                 |         34.8 |       34.4 |                      38 |               40.7 |
| Additional repeat-search transfer (bytes)   |            0 |          0 |                       0 |                  0 |
| First counter interaction (ms)              |        822.3 |      799.2 |                    82.8 |               66.7 |
| Additional first-counter transfer (bytes)   |       113018 |     113033 |                       0 |                  0 |
| Cold destination body ready (ms)            |        186.8 |      190.7 |                   195.8 |              195.3 |
| Additional cold-navigation transfer (bytes) |         1809 |       1809 |                    4874 |               3208 |
| Back body ready (ms)                        |         43.9 |         44 |                   132.5 |              145.9 |
| Additional Back transfer (bytes)            |            0 |          0 |                    4843 |               3177 |

## State and functional checks

The forward-navigation counter is Count: 1 for Exact, Count: 0 for static Astro, and Count: 1 for ClientRouter. Static Astro replaces the document; its counter resets on the destination. ClientRouter uses `transition:persist` and keeps its counter's memory; Exact retains its root state. These observations are asserted, not inferred from framework names. Each search returns only its scope, repeat search changes the result, counter changes once, destination/Back headings match, and uncaught browser errors fail the harness.

## Shared entry

The final timing pass reused the built page/application and Astro artifacts, rebuilding only the metadata/loading bridge from final source. [SEARCH_STARTUP.md](SEARCH_STARTUP.md) records artifact verification and the standard full-build reproduction command.

The saved pre-change output is served unchanged in this run, without rebuilding it. Shared app.js raw/gzip bytes: 286470/86416 before, 286512/86431 after. Generated native application code before bundling: 106890 → 106939 raw bytes (21238 → 21257 independently gzipped). Those generated-file gzip values are diagnostic and not additive portions of the final entry. TOC, descriptions, canonical/robots/alternate SEO and locale/version counterpart choices now travel in the same lazy module as each page body, including custom Exact pages. Initial activation reuses the checkpoint; no new metadata request is added. Adjacent links also travel with page data. Route identity, shared scope navigation/language/version settings, layouts, templates and root state remain in the single application. On a nonempty search input, the current scope module starts loading alongside activation with a low-priority module script; Exact owns the resulting search resource and state. See [SEARCH_STARTUP.md](SEARCH_STARTUP.md) for this loading change, [ROUTING_STARTUP.md](ROUTING_STARTUP.md) for route/scope extraction and [STARTUP.md](STARTUP.md) for the earlier metadata stage.

## Limits

This is a controlled reading/search/state fixture, not Starlight or a comparison of complete documentation products. Exact additionally carries its typed resource/mutation/task model and native control/runtime contracts. The Astro client only implements the stated controls; it does not reproduce those systems. Generated DOM and host CSS differ, despite approximately aligned benchmark typography. Both retain pre-rendered body HTML. Static versus client routing is shown separately because navigation and state semantics differ. No conclusion about general Astro parity, native targets, real devices or future Lenso UI appearance follows from these samples.

Astro receives HTML rendered from the common parsed/highlighted IR, so the recorded build durations are not comparable end-to-end Markdown pipeline timings and are excluded from the table. Runtime samples and build details are in [.cache/comparison/results.json](.cache/comparison/results.json). Build dependencies are isolated under bench/astro and pinned by its lockfile.

## Reproduce

With the Exact/Playwright setup documented in README, generate the corpus first if absent: `SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale`. Install bench/astro from its existing frozen lockfile, then run `bun run test:compare`. `PERF_RUNS` accepts 1–10 (default 3). `EXACT_BASELINE_DIR` optionally points to an unchanged output of this same fixture saved before compiler changes; it must be outside .cache/comparison. The harness creates disposable comparison projects under .cache/comparison and does not edit the source corpus or product example.

Astro navigation and persistence are configured according to its [official view-transitions documentation](https://docs.astro.build/en/guides/view-transitions/).
