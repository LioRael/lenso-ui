import path from "node:path";
import assert from "node:assert/strict";
const root = import.meta.dirname;
const data = await Bun.file(path.join(root, "results/results.json")).json();
assert.equal(data.results.length, data.rounds * 6, "Only complete cohorts may be reported");
for (const row of data.results)
  for (const panel of row.enabled.geometry) {
    assert.equal(panel.radius, "24px");
    assert.equal(panel.blur, "15.3px");
    assert.equal(panel.profile.trim(), "small");
  }
const med = (a) => {
  a.sort((x, y) => x - y);
  return a[Math.floor(a.length / 2)];
};
const fmt = (n) => Number(n).toFixed(1);
let text = `# React and Exact Glass comparison\n\nMeasured ${data.date}. Local production source builds; no shared implementation was changed for this experiment.\n\n## Conditions\n\n- Public React Glass and public Exact Contract Glass, sharing the same instrumented Glass engine source. Production React, no StrictMode. Browser screenshots are reviewed after optical initialization, not just DOM visibility.\n- 8 panels, each 260 × 120 CSS pixels, radius 24 px, glass-small profile, blur 15.3 px, light appearance, DPR 2, 1200 × 900 viewport. Same marked Backdrop source (one 6000 px gradient div), panel placement and control styling; geometry is asserted before every sample. The supported source-copy path visibly blurs in WebKit as well as Chromium.\n- Matched cohorts force liveBackdrop=false at the engine boundary, matching React Glass's current default. Exact-default retains liveBackdrop=true. This override only exists in the generated benchmark bundle.\n- ${data.rounds} fresh browser contexts per cohort and engine; cohort order rotates each round. Chromium uses 4× CPU throttling with cache disabled; WebKit has no CPU throttle. Requests use a local server with no network throttle. Compare within an engine, not between engines.\n- The application is loaded before enabling Glass. First-enable timing starts at the enable click and ends after all 8 rim images are assigned plus two animation frames. This is a presentation opportunity, not an instrumented GPU completion timestamp, and excludes initial document/application loading. Any UI hatch imported on the first enable is included in click-to-attach.\n- Scroll: a 3000 ms animation window, two up/down cycles over 3000 px, retaining every rAF interval observed; a slow final frame can overshoot the window. Interaction: 40 real pointer clicks, each updates all 8 labels, with a minimum 35 ms pause between updates. Click commit is DOM mutation latency; presentation adds two rAF callbacks.\n- Lifetime wrappers count actual attachGlass/release and internal attachOptics/cleanup calls, with WeakMap identities plus live DOM and Exact root identity checks. They are injected by the benchmark build plugin; package sources are untouched.\n\n## Results\n\nAll table values are medians across runs; times are ms. “Click p95” is the median of each run's 40-click p95. rAF gaps are a scheduling proxy, not GPU frame presentation or a full FPS measurement.\n\n`;
text +=
  "## Findings\n\nThis fixture does not show an overall Exact advantage. First enable is slower in both engines. Chromium has a larger pre-attach delay in Exact, and higher total style/layout work across 40 clicks. Small commit differences and the two-rAF presentation metric do not establish a general interaction win.\n\nWebKit's marked-source copy path has large rAF gaps in both frameworks. All 30 samples retain the same 8 DOM owners and optical bindings through scroll and 40 counter updates, with zero release/optics-stop calls while mounted. This does not qualify navigation retention.\n\n";
for (const engine of ["chromium", "webkit"]) {
  text += `### ${engine} ${data.results.find((x) => x.engine === engine)?.version}\n\n| Cohort | Enable | Click to first attach | Attach to ready | Click commit p95 | Click presentation p95 | Scroll rAF p95 | Scroll gaps >25 ms (%) |\n|---|---:|---:|---:|---:|---:|---:|---:|\n`;
  for (const group of ["react", "exact-matched", "exact-default"]) {
    const a = data.results.filter((x) => x.engine === engine && x.group === group);
    text += `| ${group} | ${[(x) => x.enabled.total, (x) => x.enabled.toAttach, (x) => x.enabled.optics, (x) => x.interactions.commit.p95, (x) => x.interactions.paint.p95, (x) => x.scroll.frames.p95, (x) => (x.scroll.frames.over25 / x.scroll.frames.count) * 100].map((f) => fmt(med(a.map(f)))).join(" | ")} |\n`;
  }
  text += "\n";
  if (engine === "chromium") {
    text +=
      "Main-thread CPU work from CDP (includes benchmark overhead; excludes GPU/compositor work):\n\n| Cohort | Enable task | Scroll task | Scroll script | Interaction task | Interaction script | Interaction style + layout |\n|---|---:|---:|---:|---:|---:|---:|\n";
    for (const group of ["react", "exact-matched", "exact-default"]) {
      let a = data.results.filter((x) => x.engine === engine && x.group === group);
      text += `| ${group} | ${[(x) => x.initCPU.TaskDuration, (x) => x.scroll.cpu.TaskDuration, (x) => x.scroll.cpu.ScriptDuration, (x) => x.interactions.cpu.TaskDuration, (x) => x.interactions.cpu.ScriptDuration, (x) => x.interactions.cpu.LayoutDuration + x.interactions.cpu.RecalcStyleDuration].map((f) => fmt(med(a.map(f)))).join(" | ")} |\n`;
    }
    text += "\n";
  }
}
text +=
  "## First-enable dispersion\n\nMin–max across five runs (ms), exposing local scheduling variability:\n\n| Engine / cohort | Min | Max |\n|---|---:|---:|\n";
for (const engine of ["chromium", "webkit"])
  for (const group of ["react", "exact-matched", "exact-default"]) {
    const a = data.results
      .filter((x) => x.engine === engine && x.group === group)
      .map((x) => x.enabled.total);
    text += `| ${engine} / ${group} | ${fmt(Math.min(...a))} | ${fmt(Math.max(...a))} |\n`;
  }
text += "\n";
text +=
  "## Instance lifetime\n\n| Engine / cohort | attachGlass | release | optics start | optics stop | Unique DOM owners | Same DOM / Exact root |\n|---|---|---|---|---|---|---|\n";
for (const engine of ["chromium", "webkit"])
  for (const group of ["react", "exact-matched", "exact-default"]) {
    const a = data.results.filter((x) => x.engine === engine && x.group === group);
    const ranges = (k) => {
      let v = a.map((x) => x.lifetime[k]);
      return `${Math.min(...v)}–${Math.max(...v)}`;
    };
    text += `| ${engine} / ${group} | ${["attaches", "releases", "opticsStarts", "opticsStops", "unique"].map(ranges).join(" | ")} | ${a.every((x) => x.lifetime.sameDOM && x.lifetime.sameRoot) ? (group === "react" ? "DOM retained; root n/a" : "all retained") : "see raw results"} |\n`;
  }
text += `\n## Boundaries\n\nThese results cover stable mounted Glass with shared counter updates and programmatic document scrolling. They do not establish navigation, routing, conditional removal/reinsertion, resize, theme switching, custom backdropSource providers, native macOS/iOS performance, or a real device GPU ranking. A root-state guarantee alone does not prove Glass retention in those scenarios. The scrolling background is one marked CSS-gradient source, which exercises WebKit backdrop copying; it does not cover complex document, photo, or video capture.\n\nThe Exact cohort bundles its real broad UI hatch; React imports the real public Glass component. This is a consumer integration comparison, not a claim about the intrinsic speed of either framework. This measures activation after initial page load, not cold-page loading; a deferred UI hatch load still contributes to first-enable timing. A discarded pilot with an unmarked body background did not visibly blur in WebKit and is excluded from all tables. Local headless runs are sensitive to concurrent machine load; small differences should not be treated as wins.\n\n## Reproduce\n\nFrom the repository root:\n\n\`\`\`sh\nEXACT_ROOT=/path/to/initialized/exact bun experiments/glass-comparison/build.mjs\nPLAYWRIGHT_MODULE=/absolute/path/to/playwright WEBKIT_EXECUTABLE=/path/to/pw_run.sh bun experiments/glass-comparison/run.mjs\nbun experiments/glass-comparison/provenance.mjs\nbun experiments/glass-comparison/report.mjs\n\`\`\`\n\nFrozen asset SHA256 hashes and machine details: [results/provenance.json](results/provenance.json). Raw samples and lifetime events: [results/results.json](results/results.json). Round-zero screenshots are in results/. The build output is isolated under this experiment's .cache/. Preview servers and browsers started by the runner are closed on completion.\n`;
await Bun.write(path.join(root, "REPORT.md"), text);
console.log(text);
