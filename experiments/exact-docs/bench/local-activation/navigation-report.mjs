import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../..");
const read = async (file) => JSON.parse(await Bun.file(path.join(root, file)).text());
const cohorts = {
  slow: await read(".cache/fumadocs/navigation-adaptive-slow-results.json"),
  fast: await read(".cache/fumadocs/navigation-adaptive-fast-results.json"),
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
const baselineArtifact = JSON.parse(
  await Bun.file(path.join(baseline, "local-activation.json")).text(),
);
assert.equal(artifact.input, baselineArtifact.input, "Compare the same native compiler input");
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
  ".gen/route-state.js",
  ".gen/launch-state.js",
  ".gen/router.js",
  ".gen/navigation.js",
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
  "route-state.mjs",
  "launch-state.mjs",
  "navigation-start-check.mjs",
  "navigation-profile.mjs",
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
  navigationStart: await read(".cache/local-activation/navigation-start-verification.json"),
};
const receipt = {
  date: new Date().toISOString(),
  artifact,
  cohorts,
  search,
  startupHTML: {
    baseline: await asset(path.join(baseline, "index.html")),
    candidate: await asset(path.join(candidate, "index.html")),
  },
  unconditionalPreparation: {
    slow: await read(".cache/fumadocs/navigation-final-slow-results.json"),
    fast: await read(".cache/fumadocs/navigation-final-fast-results.json"),
  },
  hashes,
  sources,
  verification,
  profiles: {
    before: await read(".cache/local-activation/navigation-before-profile.json"),
    after: await read(".cache/local-activation/navigation-adaptive-profile.json"),
  },
};
await Bun.write(
  path.join(import.meta.dirname, "navigation-results.json"),
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
  firstNavigationTotalBytes: "Bytes through first navigation",
  backMs: "Back after activated navigation",
  firstNavigationDocumentRequests: "Documents through first navigation",
  jsThroughSearch: "Script bytes through first search",
  coldNavBytes: "Target body/projection transfer after activation",
};
function table(report) {
  return [
    "| Median metric | Previous prototype | Parallel navigation | Fumadocs matched |",
    "| --- | ---: | ---: | ---: |",
    ...Object.entries(metrics).map(
      ([key, label]) =>
        `| ${label} | ${["exactBefore", "exact", "matched"].map((name) => (key === "firstNavigationScriptMs" && report.results[name].median.firstNavigationDocumentRequests > 1 ? "n/a (document reset)" : report.results[name].median[key])).join(" | ")} |`,
    ),
  ].join("\n");
}
function representative(profile) {
  const rows = profile.samples
    .map((sample) => {
      const time = (name) => sample.events.find((event) => event.name === name)?.time;
      return { sample, paint: time("paint-observed") - time("intent") };
    })
    .sort((a, b) => a.paint - b.paint);
  return rows[Math.floor(rows.length / 2)].sample;
}
function stages(profile) {
  const sample = representative(profile),
    time = (name) => sample.events.find((event) => event.name === name)?.time;
  const intent = time("intent"),
    owner = time("rootInitializations"),
    local = sample.events.find(
      (event) => event.name === "activationPhase" && event.detail === "local",
    ).time;
  const request = sample.events.find(
    (event) =>
      event.name === "data-start" &&
      event.detail?.name === "docsReadPage" &&
      event.detail.args[0] === "/guide-001",
  ).time;
  const ready = sample.events.find(
    (event) =>
      event.name === "data-ready" &&
      event.detail?.name === "docsReadPage" &&
      event.detail.args[0] === "/guide-001",
  ).time;
  const target = sample.resources.find((resource) => /\/body-1-/.test(resource.name));
  const ownerFiles = new Set(
    (profile.out === candidate ? artifact : baselineArtifact).searchClosure.map(
      (name) => "/" + name,
    ),
  );
  const dependencyEnd = Math.max(
    intent,
    ...sample.resources
      .filter((resource) => ownerFiles.has(resource.name))
      .map((resource) => resource.end),
  );
  return {
    intent: 0,
    dependencyEnd: dependencyEnd - intent,
    owner: owner - intent,
    local: local - intent,
    resourceRequest: request - intent,
    targetRequest: target.start - intent,
    targetResponseEnd: target.end - intent,
    typedReply: ready - intent,
    dom: time("dom-ready") - intent,
    paint: time("paint-observed") - intent,
  };
}
const stageBefore = stages(receipt.profiles.before),
  stageAfter = stages(receipt.profiles.after);
const round = (n) => Math.round(n * 10) / 10;
const row = (name, key) => `| ${name} | ${round(stageBefore[key])} | ${round(stageAfter[key])} |`;
const doc = `# First-navigation dependency chain

Measured November 12, 2026 (Asia/Shanghai). Opt-in compiler-output/runtime experiment for 300 static documentation URLs (2 languages × 2 versions × 75 pages). Single application/root resources and headless output are retained. The default compiler, upstream SDK and default theme are unchanged. This cohort compares the previous shared-owner/projection prototype, this candidate and pinned Fumadocs with the same scoped substring algorithm and zero search debounce.

## Cause and architecture

The previous first navigation imported the owner, booted the root, then discovered the target body. The body incurred another network latency period after the shared code download. A separate dependency problem remained: the SDK router module contained both route state and browser projection; importing its pure route operations pulled shared DOM/focus/popover code into the initial owner closure.

The build now exposes lazy body handles for links already in the rendered page. On an eligible click, while owner code downloads are still pending, it starts importing only that destination alongside the original lazy entry and checkpoint. When every owner preload has already finished, it uses the direct native path; it does not infer network speed from a browser hint. No destination is fetched merely by reading or hovering, and no root/resource is executed speculatively. The existing source and projection subsequently import the same hashed module; its default body still goes through the original native data conversion, resource ticket, transaction and settlement machinery. One body request serves speculative loading, the typed resource and the projection. Rejected speculation is observed and leaves resource error handling/recovery in charge.

Native route state is physically moved out of browser projection. The extractor follows binding dependencies and writers, moving mutable route tables and fragment intents to a single owner; the original full router imports/re-exports those bindings. It does not maintain a second router or copy its history. Native launch URL parsing is also shared from a separate module. Browser projection/focus/time-view modules are excluded from the initial static graph and remain available for full-view escalation. The builder asserts that they cannot enter the resource-owner closure again.

The initial HTML includes handles only for links it already renders, rather than a global 300-page bootstrap manifest. Native scope maps and resource queries remain unchanged. This adds some HTML bytes, so FCP and cold-open totals are measured along with action latency. There is no target guess, benchmark-specific route prefetch or theme change.

## Dependency timing

The following are timestamps relative to the actual link click, from the median-paint sample of separate three-sample diagnostic captures at 80 ms latency, 200,000 bytes/s and 4× CPU slowdown. They are not the official five-run action medians below; diagnostic instrumentation and machine scheduling affect these absolute values. Data-start/ready events wrap the real native data adapter, and resource timings come from the browser.

| Boundary after click (ms) | Previous prototype | Candidate |
| --- | ---: | ---: |
${row("Last owner static dependency response completes", "dependencyEnd")}
${row("Owner module / checkpoint initialization starts", "owner")}
${row("Root boot completed; local view host starts", "local")}
${row("Native target resource asks", "resourceRequest")}
${row("Target module network request starts", "targetRequest")}
${row("Target module response completes", "targetResponseEnd")}
${row("Native checked reply is available", "typedReply")}
${row("Destination DOM is visible to observer", "dom")}
${row("Two animation-frame observation", "paint")}

For an owner whose code is still downloading, the important ordering change is target request before owner initialization, instead of after it. When the code is already downloaded, preparation deliberately stays on the native path. The baseline fails this ordering assertion. The candidate passes with one target request and no search-index/full-renderer request. Browser response-to-reply and reply-to-DOM spans include scheduling, module evaluation, conversion, native settlement and projection; they are elapsed time, not CPU attribution. The official benchmark records script CPU separately.

## Matched slow cohort

Five samples per implementation/action, alternating order, Chromium, disabled browser cache, gzip, 4× CPU slowdown; latency 80 ms, throughput 200,000 bytes/s. Timings are milliseconds, byte values are encoded HTTP bytes. First navigation is the first interaction, in a separate fresh context. Activated navigation happens after search/counter actions. Fumadocs initializes its client before the action, so cold-open totals are included.

${table(cohorts.slow)}

## Matched fast cohort

Five samples, no added latency, 10,000,000 bytes/s, still 4× CPU slowdown. Same corpus, algorithm and actions.

${table(cohorts.fast)}

## Acceptance and the fast-path correction

In the final slow cohort, first navigation changes from ${cohorts.slow.results.exactBefore.median.firstNavigationMs} to ${cohorts.slow.results.exact.median.firstNavigationMs} ms; matched Fumadocs is ${cohorts.slow.results.matched.median.firstNavigationMs} ms. On the fast cohort it changes from ${cohorts.fast.results.exactBefore.median.firstNavigationMs} to ${cohorts.fast.results.exact.median.firstNavigationMs} ms; matched Fumadocs is ${cohorts.fast.results.matched.median.firstNavigationMs} ms. These are local five-sample medians, not universal guarantees.

The first unconditional-preparation variant reduced slow navigation, but regressed fast first navigation (182.5 to 229.1 ms in that cohort). Its complete samples remain in the receipt. The final variant only prepares destinations while owner transfers are outstanding. The held-owner and fully-downloaded-owner branches are both covered directly. FCP and cold-open totals remain visible above; the added inline handles change initial HTML from ${receipt.startupHTML.baseline.gzip} to ${receipt.startupHTML.candidate.gzip} gzip bytes. This result remains opt-in; arbitrary application integration is not qualified.

## Code and acceptance boundaries

The recursive owner/search static graph changes from ${search.baseline.gzipSum} to ${search.candidate.gzipSum} gzip bytes, summing compressed modules. These figures include every static dependency, not only app.js, and exclude the lazily loaded target body and scoped search index. Script bytes through search and first-navigation transfers are captured in the raw receipt. The retained early-download policy continues to download owner code while reading; it does not execute the app until interaction.

This remains the grant-free generated static-document path. Arbitrary custom data, root mutation/task effects and custom layouts need their original full path and separate acceptance. Full-view promotion reinstalls the native host over the same root; it is not a general SDK/compiler release. No native macOS/iOS performance assertion is made.

## Verification

Chromium/WebKit passed an explicit held-owner regression: a first-click target request begins while the owner module is blocked; the counter remains usable; releasing the owner preserves the same root, counter and native content resource. Only one document and one body module request occur; no search index/full renderer is loaded. A failed speculative destination keeps the old URL/document and recovers on another route with the counter retained. A fully downloaded owner uses the direct native path and initializes the root once.

Existing Chromium/WebKit checks passed root/resource identity, typed rollback, stale replies, malformed source replies, strict shape errors, failure recovery, full-view escalation, language/version navigation, latest destination, history/scroll restoration, Copy Markdown and widget preservation. The ordinary two-slot framework build without the benchmark counter is independently checked. Reactive binding/core audits and affected formatting/lint checks pass. Both matched cohorts also verify scope/state behavior and eight pixel-identical reading/focus screenshots.

Raw samples, diagnostic boundaries, conditions, exact input/generated/source hashes, transitive asset sizes and functional receipts are in [navigation-results.json](bench/local-activation/navigation-results.json). The previous [owner/projection report](OWNERSHIP_ACTIVATION.md) remains a historical record; comparisons here rerun that frozen output in the same cohort.

## Reproduce

From experiments/exact-docs, preserve the previous output and use an initialized Exact checkout:

\`\`\`sh
LOCAL_PARTITION=1 LOCAL_DESTINATION=1 EXACT_ROOT=/path/to/exact bun bench/local-activation/build.mjs /path/to/native/dist "$PWD/.cache/local-activation/navigation-adaptive"
PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-start-check.mjs .cache/local-activation/navigation-adaptive
PERF_RUNS=3 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-profile.mjs /path/to/previous/complete .cache/local-activation/navigation-before-profile.json
NAV_EXPECT_OVERLAP=1 PERF_RUNS=3 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/local-activation/navigation-profile.mjs .cache/local-activation/navigation-adaptive .cache/local-activation/navigation-adaptive-profile.json
FUMA_MEASURE_ONLY=1 FUMA_ACTIVATION_BASELINE=/path/to/previous/complete FUMA_LOCAL_ACTIVATION="$PWD/.cache/local-activation/navigation-adaptive" FUMA_LOCAL_ACTIVATION_LABEL=navigation-adaptive FUMA_NAV_FIRST=1 PERF_RUNS=5 PLAYWRIGHT_MODULE=/path/to/playwright bun bench/fumadocs.mjs
# Repeat the last command with FUMA_ACTIVATION_FAST=1 for the fast cohort.
bun bench/local-activation/navigation-report.mjs
\`\`\`
`;
await Bun.write(path.join(root, "FIRST_NAVIGATION.md"), doc);
console.log("Wrote first-navigation architecture report and measured receipts");
