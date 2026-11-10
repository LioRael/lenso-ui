# 300-page Astro comparison

Measured 2026-11-10T20:25:33.102Z. Astro 7.4.8, Bun 1.4.4, Chromium 156.0.8078.4.

Same 300 authored URLs: English/Chinese × v2/v1 × 75 topics, 24 paragraphs and one code block per page. Both render the same document IR and build-time syntax tokens. Both expose grouped scope navigation, language/version links, TOC, pagination, descriptions, raw-source actions, lazily imported per-scope substring search and a counter. Exact uses its normal page-data compiler plus a fixture-only root counter/layout; Astro uses semantic HTML, a small vanilla client script, and optionally its official ClientRouter with a persisted counter element. Neither product styling nor Exact's default theme is changed.

Values are medians of 3 fresh-context runs: gzip delivery from the same Bun static server, cache disabled, 80 ms latency, 200,000 download bytes/second and 4× CPU slowdown. Animations are disabled/reduced; link prefetch is explicitly disabled. No reading delay or idle application warmup is inserted. Search/counter trials start separately in fresh contexts. Render timing comes from observed DOM changes and two animation frames, reported through a binding that survives full-page navigation; it excludes locator-polling overshoot. Destination body readiness does not measure theme layout or viewport-specific meaningful paint.

| Metric                                      | Exact Docs | Astro static navigation | Astro ClientRouter |
| ------------------------------------------- | ---------: | ----------------------: | -----------------: |
| First contentful paint (ms)                 |        264 |                     244 |                220 |
| Transfer before interaction (bytes)         |      11239 |                    4843 |              10723 |
| First search rendered (ms)                  |     1249.5 |                   253.6 |              254.7 |
| Additional first-search transfer (bytes)    |     172832 |                   27963 |              27963 |
| Script during first search (ms)             |       89.9 |                     2.6 |                  4 |
| Repeat search rendered (ms)                 |       44.5 |                      46 |               41.7 |
| Additional repeat-search transfer (bytes)   |          0 |                       0 |                  0 |
| First counter interaction (ms)              |       1040 |                    93.4 |               94.6 |
| Additional first-counter transfer (bytes)   |     144869 |                       0 |                  0 |
| Cold destination body ready (ms)            |      220.4 |                   161.1 |              248.7 |
| Additional cold-navigation transfer (bytes) |       1473 |                    4874 |               3208 |
| Back body ready (ms)                        |       59.6 |                   138.3 |              175.8 |
| Additional Back transfer (bytes)            |          0 |                    4843 |               3177 |

## State and functional checks

The forward-navigation counter is Count: 1 for Exact, Count: 0 for static Astro, and Count: 1 for ClientRouter. Static Astro replaces the document; its counter resets on the destination. ClientRouter uses `transition:persist` and keeps its counter's memory; Exact retains its root state. These observations are asserted, not inferred from framework names. Each search returns only its scope, repeat search changes the result, counter changes once, destination/Back headings match, and uncaught browser errors fail the harness.

## Limits

This is a controlled reading/search/state fixture, not Starlight or a comparison of complete documentation products. Exact additionally carries its typed resource/mutation/task model and native control/runtime contracts. The Astro client only implements the stated controls; it does not reproduce those systems. Generated DOM and host CSS differ, despite approximately aligned benchmark typography. Both retain pre-rendered body HTML. Static versus client routing is shown separately because navigation and state semantics differ. No conclusion about general Astro parity, native targets, real devices or future Lenso UI appearance follows from these samples.

Astro receives HTML rendered from the common parsed/highlighted IR, so the recorded build durations are not comparable end-to-end Markdown pipeline timings and are excluded from the table. Runtime samples and build details are in [.cache/comparison/results.json](.cache/comparison/results.json). Build dependencies are isolated under bench/astro and pinned by its lockfile.

## Reproduce

With the Exact/Playwright setup documented in README, generate the corpus first if absent: `SCALE_PAGES=300 PERF_RUNS=1 bun run test:scale`. Install bench/astro from its existing frozen lockfile, then run `bun run test:compare`. `PERF_RUNS` accepts 1–10 (default 3). The harness creates disposable comparison projects under .cache/comparison and does not edit the source corpus or product example.

Astro navigation and persistence are configured according to its [official view-transitions documentation](https://docs.astro.build/en/guides/view-transitions/).
