import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../..");
const read = async (file) => JSON.parse(await Bun.file(path.join(root, file)).text());
const cohorts = {
  slow: await read(".cache/fumadocs/owner-final-slow-results.json"),
  fast: await read(".cache/fumadocs/owner-final-fast-results.json"),
};
for (const report of Object.values(cohorts)) {
  assert.equal(report.conditions.runs, 5);
  assert.equal(report.conditions.navigationFirst, true);
}
const candidate = cohorts.slow.outputs.exact,
  baseline = cohorts.slow.outputs.exactBefore;
assert.equal(cohorts.fast.outputs.exact, candidate);
assert.equal(cohorts.fast.outputs.exactBefore, baseline);
const artifact = JSON.parse(await Bun.file(path.join(candidate, "local-activation.json")).text());
async function asset(file) {
  const bytes = await Bun.file(file).bytes();
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
  };
}
const search = {};
for (const [name, directory] of Object.entries({ baseline, candidate })) {
  const meta = JSON.parse(await Bun.file(path.join(directory, "local-activation.json")).text());
  const files = {};
  for (const name of meta.searchClosure) files[name] = await asset(path.join(directory, name));
  search[name] = { files, gzipSum: Object.values(files).reduce((sum, row) => sum + row.gzip, 0) };
}
const hashes = {};
for (const file of [".gen/app.js", ".gen/rt.js", ".gen/ts-data.js"])
  hashes["input/" + file] = await asset(path.join(artifact.input, file));
for (const file of [
  "app.js",
  ".gen/local-root.js",
  ".gen/local-runtime.js",
  ".gen/destination-runtime.js",
  ".gen/pure-data.js",
  ".gen/unit-full-setup.js",
  ".gen/full-data.js",
])
  hashes[file] = await asset(path.join(candidate, file));
const sources = {};
for (const name of [
  "build.mjs",
  "partition.mjs",
  "destinations.mjs",
  "destination-runtime.js",
  "runtime.js",
  "counter-runtime.js",
  "navigation-bootstrap.js",
  "split-runtime.mjs",
])
  sources[name] = await asset(path.join(import.meta.dirname, name));
const verification = {
  destination: await read(".cache/local-activation/destination-verification.json"),
  plain: await read(".cache/local-activation/plain-verification.json"),
};
const receipt = {
  date: new Date().toISOString(),
  artifact,
  cohorts,
  search,
  hashes,
  sources,
  verification,
};
await Bun.write(
  path.join(import.meta.dirname, "ownership-results.json"),
  JSON.stringify(receipt, null, 2) + "\n",
);
const metrics = {
  fcpMs: "First contentful paint",
  firstCounterMs: "Counter first input",
  firstSearchMs: "Search first input",
  coldOpenToSearchMs: "Cold open to search results",
  firstNavigationMs: "Navigation as first interaction",
  coldOpenToNavigationMs: "Cold open to first destination",
  coldNavMs: "Navigation after search/counter activation",
  searchScriptMs: "Search script CPU",
  firstNavigationScriptMs: "First-navigation script CPU",
  backMs: "Back after activated navigation",
  firstNavigationDocumentRequests: "Documents through first navigation",
  jsThroughSearch: "Script bytes through first search",
  coldNavBytes: "Target body/projection transfer after activation",
};
function table(report) {
  return [
    "| Median metric | Previous prototype | New owner/projection | Fumadocs matched |",
    "| --- | ---: | ---: | ---: |",
    ...Object.entries(metrics).map(
      ([key, label]) =>
        `| ${label} | ${["exactBefore", "exact", "matched"].map((name) => (key === "firstNavigationScriptMs" && report.results[name].median.firstNavigationDocumentRequests > 1 ? "n/a (document reset)" : report.results[name].median[key])).join(" | ")} |`,
    ),
  ].join("\n");
}
const doc = `# Shared resource owner and destination projection

Measured November 12, 2026 (Asia/Shanghai). This is an opt-in compiler-output/runtime prototype for standard, static documentation. It preserves a single application root, remains headless, and does not change the default theme, the initialized SDK source or the public/default build path. It is not a claim that every Exact app's performance is solved.

## Architecture implemented

The copied native runtime is partitioned by lexical binding ownership, not only by output filenames. Mutable globals have one shared cell; functions import their owners directly. Case-safe generated module names avoid collisions such as Paint/paint on macOS. The original native transaction, rollback, resource ticket and settlement functions remain in use. A deferred host registry installs DOM/navigation/command/scheduler hooks when the complete Exact view is requested. A binding audit catches orphaned reactive names, including logical operands such as LateStore.

For generated, grant-free documentation data, the build emits a narrow executor for docsReadRoute, docsReadPage and docsSearchPages. It reuses the SDK's named/array conversion, strict shape checking, checkpoint seeding and kept values. The original generated source functions perform the queries; the substring algorithm, indexes and resource engine are unchanged. Store/module/native capabilities are rejected in this stage. Additional runtime data imports and unsupported root effects are refused, rather than silently omitted. When a full Exact view is requested, the original full data adapter and host runtime are installed over the same root/resources. General custom-source/root mutation/task apps still require the original path and independent acceptance.

Standard document navigation waits for the same typed Exact content resource to settle and directly projects the destination. The pre-rendered projection is an additional export of the same lazy body module used by the resource, so data and projection share one network request. It does not boot/adopt the old whole view first. The HTML is generated by Exact itself; no new stylesheet or theme renderer is introduced. Header/counter/search nodes persist, input attributes update with locale while query values remain owned by Exact, and document metadata continues through the existing reading/SEO integration.

The initial server-rendered page is retained as a projection, so Back can reuse the existing document without downloading its body again. The view host retains the last committed router snapshot for cancellation/failure recovery, uses browser history with scroll restoration, suppresses obsolete destinations and shares a single stylesheet load. Built-in Copy Markdown uses the displayed, already-validated resource value without forcing the full renderer; clipboard checks use a mock browser clipboard. Full view escalation remains available, but arbitrary custom layouts/pages and root side effects are not certified by this standard-document cohort.

A small link bootstrap also handles navigation before any control has activated the app. The original lazy SDK capture deliberately ignores anchors, so the prior prototype performed a complete document navigation for this case. The new path keeps one document. Modified/external/download/same-page reading links retain their browser handling before activation; failed entry import can fall back to browser navigation.

## Same-run conditions

300 URLs, 2 languages × 2 versions × 75 pages, 24 paragraphs plus code per page; five samples per implementation/action; alternating case order; Chromium; gzip; disabled cache; 4× CPU slowdown; same zero-debounce scoped substring search and unique paragraph token. Fumadocs/Core/UI/Next/React versions are pinned in the receipt. Fumadocs loads its client before the timed action, whereas Exact starts on interaction; cold-open totals are therefore included.

Two navigation metrics are deliberately separate: first interaction navigation has no prior search/counter activation; the existing coldNav metric measures an uncached target body after search/counter activation. The previous prototype may reload the document in the first case. Its cold-open total is measured from the original page time origin, not the replacement document's clock. Cross-document CDP script-duration differences reset and are not comparable; those table cells are marked n/a, with raw captures retained in the receipt.

## Slow cohort

80 ms latency; 200,000 bytes/s download. Timings are milliseconds, transfer metrics are HTTP encoded bytes, document counts are counts.

${table(cohorts.slow)}

## Fast cohort

0 ms added latency; 10,000,000 bytes/s download; still 4× CPU slowdown.

${table(cohorts.fast)}

## Acceptance decision

The standard-document prototype passes the functional and visual checks and substantially reduces the static search closure and activated navigation work. It is retained as opt-in, not promoted to the public/default compiler. On slow connections, navigation as the first action remains slower than Fumadocs after its client has initialized (${cohorts.slow.results.exact.median.firstNavigationMs} vs ${cohorts.slow.results.matched.median.firstNavigationMs} ms); cold-open totals favor this prototype, but do not erase that interaction delay. Fast cold-open-to-search slightly regresses against the preceding prototype (${cohorts.fast.results.exact.median.coldOpenToSearchMs} vs ${cohorts.fast.results.exactBefore.median.coldOpenToSearchMs} ms), and counter input remains slower than Fumadocs in both cohorts. These are measured limitations, not accepted claims of universal superiority.

The next integration boundary is an explicit supported compiler/runtime interface for independent resource ownership and view escalation, followed by arbitrary custom-page/data/task acceptance. This output transform is evidence for that architecture, not a stable SDK interface.

## Transfer accounting and remaining boundaries

The full recursive static search closure is ${search.baseline.gzipSum} gzip bytes before and ${search.candidate.gzipSum} after; these are sums of each compressed module, not app.js alone. Render preloading covers the resource/destination path. The small counter entry and its complete static dependency closure receive high priority; the larger search/resource preload stays low priority. This avoids placing indirect counter dependencies behind bulk downloads; first-paint effects remain visible in the measured rows. The complete renderer/data adapter is deferred until escalation. First-input search still needs its scoped index; this work does not remove network latency or claim a universal ranking from five local samples.

Destination body modules contain both native data and a pre-rendered projection, increasing bytes for an individual target compared with data alone. The measured navigation byte rows expose that tradeoff. Dynamic/custom components need native renderer escalation; no native macOS/iOS performance claim is made. Initialization ordering across arbitrary SDK versions is not certified: this transform is tied to the inspected SDK output and its receipt hashes.

The ordinary framework build without the benchmark counter was separately compiled and checked in Chromium/WebKit with its two root slots. This establishes applicability beyond the counter fixture, but does not constitute a general production rollout. The public/default compiler remains unchanged.

## Verification

Chromium and WebKit passed native root/getter/internal counter-node identity, resource getter/object identity, one root initialization, unchanged query state on navigation, latest-query replies, typed write rollback, obsolete reply suppression, malformed replies, strict rejection of undeclared data fields, resource failure recovery, native full-view promotion, locale/version changes, persistent widgets, first navigation without old-view boot, back/forward scroll restoration, concurrent route cancellation without ghost history entries, one stylesheet load, failed destination rollback/recovery and Copy Markdown. The benchmark additionally checks one document for the new first-navigation path, no search-index fetch for navigation/counter-only actions, broad scope/state behavior and eight reading/focus pixel comparisons. Root binding/core checks and targeted formatting/lint pass.

All raw samples, conditions, pinned versions, transitive assets, generated/source hashes and functional receipts are in [ownership-results.json](bench/local-activation/ownership-results.json). No deployment, upstream SDK patch, default-theme change or native-host qualification is included.

## Reproduce

Use an initialized Exact checkout and the pinned Playwright setup from README. Retain the preceding prototype output before building; the baseline here is the previous physical-split prototype, not the original full SDK build. From experiments/exact-docs:

\`\`\`sh
LOCAL_PARTITION=1 LOCAL_DESTINATION=1 EXACT_ROOT=/path/to/exact bun bench/local-activation/build.mjs /path/to/current/native/dist "$PWD/.cache/local-activation/complete"
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/destination-check.mjs .cache/local-activation/complete
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/verify.mjs .cache/local-activation/complete
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/resource-owner-check.mjs .cache/local-activation/complete
bun bench/local-activation/owner-binding-check.mjs .cache/local-activation/complete/.gen
bun bench/local-activation/core-check.mjs .cache/local-activation/complete/.gen/reactive-core.js
FUMA_MEASURE_ONLY=1 FUMA_ACTIVATION_BASELINE=/path/to/previous/dist FUMA_LOCAL_ACTIVATION="$PWD/.cache/local-activation/complete" FUMA_LOCAL_ACTIVATION_LABEL=owner-final FUMA_NAV_FIRST=1 PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat with FUMA_ACTIVATION_FAST=1 for the fast cohort.
bun bench/local-activation/ownership-report.mjs
\`\`\`
`;
await Bun.write(path.join(root, "OWNERSHIP_ACTIVATION.md"), doc);
console.log("Wrote ownership architecture report and exact measured receipts");
