# Shared application startup

Historical metadata-extraction measurement. The subsequent route/scope extraction and current figures are in [ROUTING_STARTUP.md](ROUTING_STARTUP.md); the tables below describe the earlier compiler stage.

Measured 2026-11-10T21:40:32.411Z. Same-run saved 300-page output versus the current metadata extraction, with both Astro modes measured alongside them. The corpus is English/Chinese × v2/v1 × 75 topics. All browser figures are medians of three fresh contexts with gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown. Implementation order reverses on alternate rounds. Full Astro results, limits and reproduction are in [ASTRO_COMPARISON.md](ASTRO_COMPARISON.md).

## Entry analysis

Before this change, the cold counter's shared download consists predominantly of app.js, followed by the input bridge and stylesheet. Unlike search, that counter does not need a search index. The emitted native application stored each route's TOC constructors, canonical/robots/alternate SEO, locale/version choices and descriptions in the shared entry. The generated file alone was 435551 raw bytes; 161191 remain after extraction.

| File or diagnostic                                       | Before |  After |
| -------------------------------------------------------- | -----: | -----: |
| app.js raw bytes                                         | 596392 | 340902 |
| app.js gzip bytes                                        | 118266 |  92391 |
| Native generated application raw bytes, before bundling  | 435551 | 161191 |
| Native generated application independently gzipped bytes |  54480 |  27238 |
| Input bridge gzip bytes                                  |  13393 |  13393 |
| Stylesheet gzip bytes                                    |  12697 |  12697 |

The shared entry is 42.8% smaller raw and 21.9% smaller gzip. Independently gzipping the generated native source is a diagnostic, not an additive allocation of final bundle bytes. It must not be subtracted from app.js to claim a precise runtime contribution. File payload sizes exclude response headers; measured transfer includes them. Inspection of the saved generated source found 301 SEO string declarations (including the 404 fallback), totaling 111,451 raw bytes but only 5,025 bytes when gzipped together. Removing metadata also removes per-page constructor/binding code, so the benefit is larger than removing those SEO strings alone. This is emitted-code attribution, not a per-function CPU profile.

## Page metadata lifetime

The existing body module now also carries TOC, description, canonical/robots SEO, alternate links and locale/version counterpart choices. Custom Exact pages receive metadata modules with empty Markdown bodies; their executable code remains in the shared application. No extra metadata request is introduced. Complete static HTML and the current-page typed checkpoint remain available without activation; the native kept hook seeds the same synchronous page cache used by body values.

While a destination is pending or failed, the layout receives empty TOC and counterpart choices, description and Markdown. Old canonical/alternate metadata is removed, with noindex robots until the destination data arrives. Route language/direction are available immediately, including RTL. The metadata bridge observes the SEO attribute as well as context replacement, so a reply can update the existing context without a second navigation. Custom pages share the loading/error boundary. Resource failures keep documented reload recovery.

The single root application stays mounted. Root resources, mutations, tasks and memory remain intact. Route identity, shared scope navigation and labels, adjacent-page links, native templates and custom executable code remain shared. Public layout props/injections and portable IR/raw Markdown exports are preserved. The framework stays headless and the default theme is unchanged.

## Measured effect and tradeoffs

| Metric                                      | Before |  After |
| ------------------------------------------- | -----: | -----: |
| Initial transfer (bytes)                    |  11239 |  11526 |
| First search rendered (ms)                  | 1270.8 | 1091.2 |
| Additional first-search transfer (bytes)    | 172832 | 146956 |
| Script during first search (ms)             |   66.5 |   63.3 |
| First counter interaction (ms)              | 1051.2 |  901.1 |
| Additional first-counter transfer (bytes)   | 144869 | 118993 |
| Repeated search rendered (ms)               |   52.3 |   41.7 |
| Cold destination body ready (ms)            |  208.7 |  238.3 |
| Additional cold-navigation transfer (bytes) |   1473 |   1783 |
| Back body ready (ms)                        |   67.2 |     47 |
| Additional Back transfer (bytes)            |      0 |      0 |

The smaller entry reduces cold activation transfer. The current page's metadata moves into its checkpoint, slightly increasing initial HTML transfer; destination modules also become larger. Cold navigation and Back are included so that this tradeoff is visible. Local timings fluctuated with machine load; raw samples are retained and three samples are not a statistical guarantee. The saved output is not rebuilt during comparison. The final validation uses the Exact checkout's pinned Rust toolchain and an isolated invocation-local Cargo target to avoid an unrelated shared-cache build lock.

Astro's vanilla fixture remains substantially cheaper to activate and does not implement Exact's full typed resource/mutation/task systems. These results do not establish framework-wide parity. Further work should profile the remaining native runtime/host and route construction cost before another extraction; the remaining app entry, input bridge and stylesheet still dominate first interaction.

## Verification

Production content-loading checks pass in Chromium and WebKit: no body/metadata module at initial activation, no stale TOC/counterpart/canonical data, controlled slow replies, cache reuse, deferred fragments, root mutation retention, custom kept forwarding, errors and reload recovery. The delayed Arabic case checks language and RTL before its metadata arrives and after completion. Existing production and custom-layout acceptance suites pass in both engines, covering keyboard focus, Back reading position, language/version switches, RTL, SEO/noindex and root state. Unit tests, package typecheck, affected lint and format checks pass. Development browser checks also pass for Chromium/WebKit resource, mutation and task behavior; Chromium additionally checks live reload and failed-build preservation/recovery. The recovery fixture now waits for document replacement and pauses its replacement timer: an old live ticker could otherwise reach the target value before the new build was ready, or the new ticker could advance past the target before observation.

## Reproduce

With the README's Exact/Playwright environment, retain the old output of this same comparison fixture before changing the compiler:

```sh
cp -R .cache/comparison/exact/dist .cache/startup-before-dist
EXACT_BASELINE_DIR="$PWD/.cache/startup-before-dist" bun run test:compare
```

Use a new snapshot directory each time and keep it outside .cache/comparison, which the harness recreates. Current and saved builds receive identical browser conditions; .cache/comparison/results.json retains all numeric samples, entry sizes and build details. A saved output from an unrelated site is not a valid baseline.
