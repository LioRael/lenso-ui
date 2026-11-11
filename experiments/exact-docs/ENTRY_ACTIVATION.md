# Shared entry and early downloads

Measured 2026-11-11T11:48:42.372Z, medians of 5 interleaved, fresh-context trials with reversed order on alternate rounds. The saved baseline is the previous input-deferral candidate from [ACTIVATION.md](ACTIVATION.md), not the older 809 ms build. Fumadocs Core matched-search uses the unchanged production output and the same substring algorithm, scope and zero debounce. Versions and complete samples are in .cache/fumadocs/entry-results.json. All use the same 300 URLs (English/Chinese × v2/v1 × 75), gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown.

## What changed

Web route descriptions and scope navigation are now plain shared data behind a synchronous typed docsReadRoute resource. Contract no longer constructs one page value in each branch of a 300-way selector. Scope records are shared by reference in the data module. This resource does not fetch a file, and the initial current-page answer is included in the normal typed checkpoint. Destination page bodies remain lazy. Native generation retains its offline route and stack path.

The default preload policy is now render: HTML supplies low-priority module/style download hints as it streams. This does not import/evaluate the application. Exact still activates on a real interaction, adopts its checkpoint and replays the action. Root resources, mutations and tasks have one owner and do not start while merely reading. Control intent promotes existing hints instead of issuing duplicates. Input glue remains deferred; a nonempty query alone fetches the current search database. Set `"preload": "intent"` in docs.json to retain intent-only downloads. This option changes delivery only, not the application or its state model.

Earlier downloading reduces interaction-time waiting but spends bandwidth on reading visits. This is deliberate and separate from the smaller app.js. Through-paint/completed-response byte counters exclude partially downloaded responses in flight. The whole counter/search total and cold-open timings are included to keep that distinction visible. No total-byte reduction is claimed from moving a request earlier.

## Same-run comparison

| Metric                                          | Exact before | Exact after | Fumadocs Core matched |
| ----------------------------------------------- | -----------: | ----------: | --------------------: |
| First counter action to paint, ms               |        786.5 |       497.7 |                  80.6 |
| Cold open to counter paint, ms                  |       1130.6 |       812.5 |                1301.0 |
| First search action to result, ms               |        881.1 |       602.8 |                 405.7 |
| Cold open to search result, ms                  |       1235.9 |       935.7 |                1634.2 |
| First contentful paint, ms                      |        240.0 |       220.0 |                 268.0 |
| Completed transfer before search action, bytes  |      11761.0 |     25463.0 |              156124.0 |
| Total through first search, bytes               |     152757.0 |    146735.0 |              208814.0 |
| Completed transfer through counter paint, bytes |     111228.0 |    105206.0 |              156124.0 |
| Total through counter network idle, bytes       |     124794.0 |    118772.0 |              156124.0 |
| Script during counter activation, ms            |         26.5 |        29.6 |                   6.5 |
| Repeat search, ms                               |         41.6 |        46.5 |                  45.9 |
| Destination body ready, ms                      |        200.5 |       216.3 |                 197.2 |
| Back body ready, ms                             |         51.9 |        54.3 |                  31.3 |

Fumadocs starts its client before the measured action; Exact still starts on the action. Action-only and cold-open metrics answer different questions. The matched fixture retains its counter, but does not reproduce Exact resource/mutation/task semantics or native hosts. Five local trials are a bounded comparison, not a framework-wide ranking.

## Payload evidence

Raw / independently gzipped bytes:

| File              |         Before |          After |
| ----------------- | -------------: | -------------: |
| app.js            | 286512 / 86431 | 281800 / 79570 |
| index.html        |  77578 / 10219 |  83370 / 11008 |
| _docs/metadata.js |    3105 / 1203 |    3253 / 1253 |
| style.css         |  96077 / 12697 |  96077 / 12697 |
| .gen/app.js       | 106939 / 21257 |   41139 / 8045 |

Generated .gen/app.js is a diagnostic; its independently compressed size is not an additive allocation of the final bundle. A diagnostic rebundle identified generated application code, the reactive host, navigation projection and typed data admission as the main remaining inputs. They cannot be removed wholesale while supporting arbitrary custom Exact pages. The SDK checkout was not patched, runtime guards were not stripped, and no component was replaced with a benchmark-specific JavaScript counter.

This reduces application bytes and overlaps downloads with reading; it does not implement resumability or fine-grained activation islands. Those would require compiler/runtime support for code boundaries and shared root resources, plus replay/cancellation semantics across them. Automatically running the root earlier would also move user task side effects, so this change only downloads dependencies.

## Verification

Production Chromium/WebKit checks exercise both preload policies: reading prefetches app/style exactly once without application activation, input glue, search or body fetches; interaction reuses the downloads. Intent-only mode retains nested-route hints, delayed app activation and search overlap. Keyboard counter replay succeeds while input glue is blocked and remains exactly one increment after it arrives. Custom-layout/content suites cover pending pages, stale replies, failure recovery, fragments, SEO, RTL and root mutation retention. The comparison checks destination code content, forward/Back and root state across language/version searches. Screenshot parity covers 8 desktop/mobile, light/dark reading/focused pairs. Native generation unit coverage is retained; this Web change does not claim a fresh native device run.

## Reproduce

Use README's initialized Exact and Playwright environment. Preserve the previous output before rebuilding the same fixture. With its existing pinned Fumadocs outputs, from this package:

```sh
FUMA_ENTRY_COMPARISON=1 FUMA_ACTIVATION_BASELINE="$PWD/.cache/app-before-dist" FUMA_MEASURE_ONLY=1 PERF_RUNS=5 bun run test:fumadocs
```

This writes entry-results.json and ENTRY_ACTIVATION.md without overwriting the earlier activation/four-way reports. Add FUMA_ACTIVATION_FAST=1 for a separate fast-network pass. Request evidence is prefixed entry-slow- or entry-fast-.
