import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

export async function writeActivationReport(root, report) {
  const names = ["exactBefore", "exact", "matched"];
  const row = (label, key, kb = false) =>
    `| ${label} | ${names
      .map((name) => {
        const value = report.results[name].median[key];
        return kb ? (value / 1000).toFixed(1) : value.toFixed(1);
      })
      .join(" | ")} |`;
  const rows = [
    ["First counter action to paint, ms", "firstCounterMs"],
    ["Cold open to counter paint, ms", "coldOpenToCounterMs"],
    ["Script during counter activation, ms", "counterScriptMs"],
    ["First contentful paint, ms", "fcpMs"],
    ["Initial transfer, KB", "initialBytes", true],
    ["Counter bytes completed through paint, KB", "counterThroughPaintBytes", true],
    ["Counter bytes completed through network idle, KB", "counterTotalBytes", true],
    ["First search action to result, ms", "firstSearchMs"],
    ["Cold open to search result, ms", "coldOpenToSearchMs"],
    ["Total through first search, KB", "totalThroughSearchBytes", true],
    ["Repeat search, ms", "repeatSearchMs"],
    ["Destination body ready, ms", "coldNavMs"],
    ["Back body ready, ms", "backMs"],
  ]
    .map((args) => row(...args))
    .join("\n");
  const old = report.results.exactBefore.median,
    current = report.results.exact.median;
  const delta = (
    (100 * (old.firstCounterMs - current.firstCounterMs)) /
    old.firstCounterMs
  ).toFixed(1);
  const assets = {};
  for (const name of ["exactBefore", "exact"]) {
    assets[name] = {};
    for (const file of ["index.html", "app.js", "style.css"]) {
      const bytes = await Bun.file(path.join(report.outputs[name], file)).bytes();
      assets[name][file] = {
        raw: bytes.length,
        gzip: gzipSync(bytes).length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      };
    }
  }
  report.assets = assets;
  const assetRows = Object.keys(assets.exact)
    .map(
      (file) =>
        `| ${file} | ${assets.exactBefore[file].raw} / ${assets.exactBefore[file].gzip} | ${assets.exact[file].raw} / ${assets.exact[file].gzip} |`,
    )
    .join("\n");
  await Bun.write(
    path.join(root, ".cache/fumadocs/activation-results.json"),
    JSON.stringify(report, null, 2),
  );
  await Bun.write(
    path.join(root, "ACTIVATION.md"),
    `# Shared application activation

Measured ${report.date}, medians of ${report.conditions.runs} fresh-context trials. Saved Exact output and the current candidate are interleaved with the unchanged Fumadocs Core matched-search production fixture, reversing order on alternate rounds. All use gzip, disabled cache, 80 ms latency, 200,000 bytes/second download and 4× CPU slowdown. The same corpus contains 300 URLs: English/Chinese × v2/v1 × 75 pages. [FUMADOCS_COMPARISON.md](FUMADOCS_COMPARISON.md) describes the matched adapter and the broader static-site comparison.

## Where the counter waits

The earlier five-run comparison recorded an 808.8 ms first counter action. A separate CPU/network diagnostic recorded 891 ms with profiling enabled; those wall times are not interchangeable. In that capture, app.js transferred for 659 ms while an input-only module and the full stylesheet were also downloading. After the entry finished, approximately 120 ms passed before the queued click replayed and another 58 ms before the two-frame paint signal. CPU sampling was predominantly idle. These overlapping observations identify network scheduling as the main opportunity; they are not a per-function allocation of all 809 ms.

The old cold interaction downloaded about 86.6 KB of application code, 13.6 KB of input glue and 12.9 KB of stylesheet wire data. The page already contained a critical stylesheet. The SDK main module then awaited a full stylesheet before mounting, while the documentation delivery hints pulled its otherwise post-paint input module into the activation bandwidth budget.

## Changes

Input-only glue is left on Exact's own post-paint import path. The application, checkpoint adoption, click replay and root state are unchanged. Keyboard activation of a native button is tested with the input-module response deliberately blocked, and must still increment exactly once. Hints continue to fetch the application on control intent without starting root tasks.

The original SDK critical/full stylesheet sequence is retained. Stylesheet contents, stylesheet admission, fonts and the first static paint keep their existing behavior. No CSS is inlined by this change. An earlier experiment moved complete CSS into the HTML, but was rejected after its fast-network pass showed extra cold-start cost. This avoids trading lower-bandwidth interaction speed for larger initial HTML and additional startup work.

## Same-run results

| Metric | Exact before | Exact after | Fumadocs Core, matched search |
| --- | ---: | ---: | ---: |
${rows}

The first counter action improves ${delta}% in this run. The matched Fumadocs fixture keeps its React/Next client startup before the first action; Exact still defers application execution. Action-only timing and cold-open timing therefore answer different questions. The matched adapter uses the same substring scope and zero debounce, while retaining Fumadocs hook/result parsing. This does not reproduce Exact's resource/mutation/task systems or compare native hosts.

KB is decimal. Transfer is credited at response completion/cancellation; through-paint bytes describe completed responses, not every partial byte in flight at that instant. The input module still loads once and finishes after the counter paints in the throttled trace, so its cost is visible in the network-idle total. It is not removed or replaced. Small timing differences remain subject to local machine load; five samples are not a statistical guarantee.

Artifact payloads, raw / independently gzipped bytes:

| File | Before | After |
| --- | ---: | ---: |
${assetRows}

The shared application and SDK stylesheet hashes are retained in the JSON report. This is a delivery optimization, not removal of runtime features or a smaller application program.

## Verification

The saved and current pages pass pixel-identical comparisons at 1280 and 390 px widths, light and dark schemes, both reading and focused-search states: ${report.appearance?.pairs ?? 0} screenshot pairs. These checks concern the tested fixture, not every possible consumer theme. Production browser checks in Chromium and WebKit verify application/stylesheet hints without an input-module request or application activation on hover, keyboard replay while input glue is unavailable, single loading of the eventual input helper, scoped search and root mutation retention.

The same-run three-way harness verifies forward navigation, Back, a complete destination code marker, one root counter update, and root-state retention across language/version changes. Every search-result selection must navigate to another correct page; the matched fixture retains its counter as well. Additional controlled content-loading/custom-layout suites cover stale replies, failures and reload recovery, reading positions, SEO, RTL and root state. Unit/type checks, lint and formatting pass. No default theme or additional application is introduced.

## Reproduce

Use the Exact/Playwright setup from README. Save the output of this same fixture before changing the compiler, outside .cache/fumadocs. Rebuild only its Exact candidate with the normal buildSite/CLI entry; the pinned Fumadocs matched artifact is unchanged.

\x60\x60\x60sh
PROFILE_ACTION=counter bun bench/startup-profile.mjs .cache/activation-before-dist .cache/activation-profile/before
FUMA_ACTIVATION_BASELINE="$PWD/.cache/activation-before-dist" FUMA_MEASURE_ONLY=1 PERF_RUNS=5 bun run test:fumadocs
\x60\x60\x60

This baseline mode tests exactly saved Exact, current Exact and Fumadocs matched search. It does not overwrite the earlier four-way report. Raw slow-network samples and artifact hashes are in .cache/fumadocs/activation-results.json. Fast-network request evidence is saved as activation-fast-*-counter-network.json. Counter request evidence from future runs is prefixed activation-slow- or activation-fast- so the conditions remain separate. The diagnostic CPU profiles and phase timelines are under .cache/activation-profile. The final candidate diagnostic records 725 ms with sampling: app.js completes in 587 ms and input-glue starts later, 671 ms after app.js starts; input-glue finishes after the observed counter paint. This is a diagnostic trace, not another five-run median. CPU sampling has overhead and its readiness polling is frame-granular; use the unprofiled benchmark's observed DOM plus two-frame timings for latency claims.

${
  report.fastNetwork
    ? `## Fast-network follow-up

A separate five-run check uses 0 ms injected latency and 10,000,000 bytes/second download, keeping 4× CPU slowdown and disabled cache. First-counter medians: ${report.fastNetwork.results.exactBefore.median.firstCounterMs} ms before, ${report.fastNetwork.results.exact.median.firstCounterMs} ms after, ${report.fastNetwork.results.matched.median.firstCounterMs} ms matched Fumadocs. Cold-open-to-counter: ${report.fastNetwork.results.exactBefore.median.coldOpenToCounterMs} → ${report.fastNetwork.results.exact.median.coldOpenToCounterMs} ms. These are separate network conditions, not directly interchangeable with the main table. Full samples are in .cache/fumadocs/activation-fast-results.json. Add FUMA_ACTIVATION_FAST=1 to baseline mode to repeat this check.`
    : ""
}

${
  report.stylesheetExperiment
    ? `## Rejected stylesheet experiment

An earlier five-run pass also inlined the unchanged complete SDK CSS and removed the stylesheet-load gate. Under the slow network, its counter improved ${report.stylesheetExperiment.slowBefore} → ${report.stylesheetExperiment.slowAfter} ms, but FCP changed ${report.stylesheetExperiment.fcpBefore} → ${report.stylesheetExperiment.fcpAfter} ms and initial transfer grew by ${report.stylesheetExperiment.initialExtraBytes} bytes. On the fast network, cold-open-to-counter regressed ${report.stylesheetExperiment.fastColdBefore} → ${report.stylesheetExperiment.fastColdAfter} ms; script duration increased ${report.stylesheetExperiment.fastScriptBefore} → ${report.stylesheetExperiment.fastScriptAfter} ms. Eight screenshot pairs were pixel-identical, so appearance was not the reason for rejection. The delivery/CPU tradeoff was. The CSS-inlining implementation was removed; only input deferral remains. The exploratory passes are archived as activation-inline-results.json and activation-inline-fast-results.json under .cache/fumadocs.`
    : ""
}
`,
  );
}
