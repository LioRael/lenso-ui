# Exact + Lenso Glass: local Web prototype

Measured on 2026-11-10. The official Web hatch mounted the existing Lenso Glass renderer without changes to Exact runtime or Lenso component source. The tested desktop scene showed no meaningful frame-rate separation from its static DOM mirror. This does not establish a general framework speed ranking.

## Environment

- Exact source: `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`, with original Cargo manifest and lockfile verified against Git blob hashes.
- Rust 1.97.0, standard Cargo with no compiler wrappers; Bun 1.4.4, locked upstream dependencies including Rolldown 1.2.9.
- Apple M2 Pro, 16 GiB RAM; Chrome 156.0.8078.48, headed, ANGLE Metal on Apple M2 Pro.
- Viewport 390 × 844 CSS pixels, DPR 2. This is desktop Chrome at a narrow viewport, not an iPhone measurement.
- Ordinary desktop background activity continued. Three short repetitions provide descriptive samples, not a statistical equivalence test.

## Controlled comparison

The Contract scene contains 200 rows, each 80 px tall after the shared reset. Six independent 342 × 64 px surfaces have a 24 px corner radius. Cases enable either one or six surfaces, with an ordinary opaque face, CSS blur, or the same Lenso renderer. The CSS blur case is a common browser baseline, not a measurement of Exact’s built-in material recipe.

The plain Web arm is a DOM snapshot of Exact’s actual rendered page, with the same styles and dimensions, its runtime scripts removed, and a small direct DOM update handler. It is a static mirror benchmark, not a React comparison or a complete alternative application. Initial six-surface Lenso captures were pixel-identical; geometry and filter activation were also checked.

Each sample scrolls at 2,000 px/s for approximately four seconds, after material preparation and a 700 ms warm-up. Live cases schedule an update every 200 ms; each updates all 200 row labels. Scheduling produced 19–20 batches per sample. Every live sample verified that all rows received every scheduled batch. Arms are adjacent and their order reverses on the second round.

## Six-surface Lenso results

Values below are medians of three repetitions. Frame rate and p95 are requestAnimationFrame callback metrics. Task time is Chrome renderer main-thread TaskDuration per second, not total process CPU, GPU time, or power. JS heap is sampled without forced GC and excludes DOM/native/GPU allocations.

| Workload                      | Host       | Callback Hz | Callback p95 ms | Main-thread task ms/s | Sampled JS heap MiB |
| ----------------------------- | ---------- | ----------: | --------------: | --------------------: | ------------------: |
| Scroll                        | Exact      |        ≈120 |             9.3 |                  36.1 |                5.71 |
| Scroll                        | DOM mirror |        ≈120 |             9.3 |                  33.5 |                4.31 |
| Scroll + live updates         | Exact      |        ≈120 |             9.2 |                  59.1 |                6.70 |
| Scroll + live updates         | DOM mirror |        ≈120 |             9.3 |                  55.9 |                5.16 |
| Live updates, 4× CPU slowdown | Exact      |        ≈120 |             9.2 |                 152.4 |                6.06 |
| Live updates, 4× CPU slowdown | DOM mirror |        ≈120 |             9.2 |                 136.8 |                4.94 |

The normal live task-time ranges overlap: Exact 52.4–61.6 ms/s, mirror 52.6–57.3. At 4× slowdown they also overlap: Exact 148.1–183.6, mirror 131.6–174.5. Small median differences should not be treated as a stable causal overhead estimate, especially with background activity and the one-batch variation. The slowdown affects CPU execution; it does not emulate a specific mobile GPU.

All 84 samples completed without page errors. They cover 36 ordinary scroll samples, 36 live samples, and 12 six-surface CPU-slowdown samples. Per-run values and all scenario summaries are preserved in the artifact directory. Rates slightly above 120 in short windows are reported as approximately 120 here.

## Separate compositor diagnostics

One additional instrumented four-second live run per host recorded 479 `AnimationFrame::Presentation` events inside the marked interval and 477 `Display::FrameDisplayed` events. GPU swap events were also present. This supports active compositor submission/presentation rather than callback activity alone.

These traces were kept separate from the untraced task-time samples. They do not measure GPU shader execution time, physical input-to-photon latency, battery use, or thermal stability. Feedback callbacks can be batched; their arrival-time intervals must not be presented as panel frame pacing. The diagnostic runs were not repeated and do not support a comparative pacing ranking.

## Integration findings

- `hatch="glass"` and its `modules/web/index.js` lifecycle callbacks provide the DOM attachment point. The manifest must declare the hatch and any authored `data-*` words.
- The adapter compiles the existing StyleX material classes and calls `attachGlass`; no React host is needed for this decorative layer. Exact retains ownership of the Contract state and button action.
- Exact’s generated HTML omits explicit head/body end tags. The experiment server initially failed to insert the material stylesheet because it looked for `</head>`. That harness defect was fixed before the measured matrix; the visible effect and parity checks then passed.
- One setup-only CDP attachment failed after 29 scroll samples. Completed samples were retained; attachment was moved after navigation and the seven remaining samples were collected. No completed measurement was replaced. Original and resumed logs are retained.
- The six surfaces share geometry and optical-map cache entries. Fusion, shape deformation, drag latency, native controls, accessibility, dynamic removal/disposal, and production application integration were not evaluated.

## Validation and limits

Standard Rust 1.97 Cargo checks for `exact-web-js --bins` passed: `check`, 180 tests, and `clippy -- -D warnings`. Two initially missing upstream test fixtures were restored from the pinned Git objects; the unchanged tests then passed. This is not the full Exact workspace gate or a Lenso release check.

The fixture intentionally uses fixed light palette bands and an offscreen benchmark trigger. Its generated-app build reports palette/accessibility-width warnings; it is a controlled stimulus rather than a production screen.

No physical iPhone, Safari/WebKit, native Exact/UIKit comparison, native launch, sustained thermal run, or GPU energy measurement was performed. These results validate an initial Web mounting path and a bounded desktop workload.

## Evidence and reproduction

Local artifact directory: `/Users/leosouthey/.codex/visualizations/2026/11/10/01a1c474-4440-7663-9158-135122f4ec2c/exact-performance`. It contains the Contract source, hatch adapter, built bundles, mirror, paired screenshots, `parity.json`, per-run metric JSON files, `summary.json`, compressed complete trace files, `trace-analysis.json`, source/artifact hashes, and Cargo logs.

The artifact README gives the local server, capture, and measurement commands. Run measurement and trace commands sequentially. The existing Lenso checkout supplies Vite, StyleX and Playwright dependencies; rebuilding Exact uses its pinned source checkout and toolchain.
