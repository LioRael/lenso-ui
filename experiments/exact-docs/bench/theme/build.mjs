import assert from "node:assert/strict";
import path from "node:path";
import { cp, mkdir, readdir, symlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { buildSite, loadSite } from "../../src/index.ts";
const root = path.resolve(import.meta.dirname, "../..");
const source = path.join(root, ".cache/scale/300"),
  cache = path.join(root, ".cache/theme-performance");
const sdk = path.resolve(process.env.EXACT_ROOT ?? "");
assert.ok(process.env.EXACT_ROOT, "Use an initialized Exact checkout");
await mkdir(cache, { recursive: true });
const corpus = await loadSite(source);
assert.equal(corpus.documents.length, 300);
const shim = path.join(cache, "sdk/host/web-js");
await mkdir(shim, { recursive: true });
// Add only a benchmark control to the default layout's existing content slot.
await Bun.write(
  path.join(shim, "build.mjs"),
  `import{readFileSync,writeFileSync}from'node:fs';import path from'node:path';import assert from'node:assert/strict';
const app=process.argv[2],file=path.join(app,'app.contract');let source=readFileSync(file,'utf8');
if(source.includes('use LensoDocsLayout,')){let count=0;source=source.replace(/^( {14}DocsContext\\([^\\n]*\\)\\n)/gm,line=>{count++;return line+'                button press=comparisonIncrement testId="comparison-counter"\\n                  text \x60Count: \x24{comparisonCount}\x60\\n';});assert.equal(count,1);writeFileSync(file,source);}
await import(${JSON.stringify(path.join(sdk, "host/web-js/build.mjs"))});`,
);
const times = {},
  outputs = {};
for (const [name, theme] of [
  ["exactHeadless", "headless"],
  ["exactTheme", "lenso"],
]) {
  const directory = path.join(cache, name);
  await mkdir(directory, { recursive: true });
  const input = JSON.parse(await Bun.file(path.join(source, "docs.json")).text());
  for (const page of input.pages) {
    await mkdir(path.dirname(path.join(directory, page.source)), { recursive: true });
    await cp(path.join(source, page.source), path.join(directory, page.source));
  }
  const config = {
    ...input,
    name: "Documentation comparison",
    theme,
    root: { source: "comparison-root.contract" },
  };
  delete config.layout;
  if (theme === "headless")
    config.layout = { source: "comparison-layout.contract", component: "ComparisonLayout" };
  await Bun.write(path.join(directory, "docs.json"), JSON.stringify(config));
  await Bun.write(
    path.join(directory, "comparison-root.contract"),
    "state comparisonCount = 0\naction comparisonIncrement\n  comparisonCount = comparisonCount + 1\nprovide\n  comparisonCount\n  comparisonIncrement\n",
  );
  await cp(
    path.join(root, "bench/comparison/exact-layout.contract"),
    path.join(directory, "comparison-layout.contract"),
  );
  const begin = performance.now();
  const built = await buildSite(directory, { exactRoot: path.join(cache, "sdk") });
  times[name] = Math.round(performance.now() - begin);
  outputs[name] = built.out;
}
const fuma = path.join(cache, "matchedUi"),
  templates = path.join(root, "bench/fumadocs");
await mkdir(path.join(fuma, "app/[[...slug]]"), { recursive: true });
try {
  await symlink(path.join(templates, "node_modules"), path.join(fuma, "node_modules"), "dir");
} catch (error) {
  if (error.code !== "EEXIST") throw error;
}
for (const file of ["package.json", "next.config.mjs", "postcss.config.mjs"])
  await cp(path.join(templates, file), path.join(fuma, file));
for (const file of await readdir(path.join(templates, "common")))
  await cp(
    path.join(templates, "common", file),
    path.join(fuma, file === "page.jsx" ? "app/[[...slug]]/page.jsx" : `app/${file}`),
  );
await cp(path.join(templates, "ui"), path.join(fuma, "app"), { recursive: true });
let provider = await Bun.file(path.join(fuma, "app/providers.jsx")).text();
provider = provider
  .replace('import("fumadocs-ui/components/dialog/search-default")', 'import("./search")')
  .replace("key={props.api}", "key={props.scopeIndex}")
  .replace(
    'options: { type: "static", api: `/_search/${index}.json` }',
    "options: { scopeIndex: index }",
  );
assert.ok(provider.includes("options: { scopeIndex: index }"));
await Bun.write(path.join(fuma, "app/providers.jsx"), provider);
await cp(path.join(import.meta.dirname, "search.jsx"), path.join(fuma, "app/search.jsx"));
await cp(path.join(root, ".cache/fumadocs/matched/data"), path.join(fuma, "data"), {
  recursive: true,
});
await cp(path.join(root, ".cache/fumadocs/matched/public"), path.join(fuma, "public"), {
  recursive: true,
});
const begin = performance.now();
const child = Bun.spawn(
  ["node", path.join(templates, "node_modules/next/dist/bin/next"), "build", "--webpack"],
  {
    cwd: fuma,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdout: "inherit",
    stderr: "inherit",
  },
);
if ((await child.exited) !== 0) throw Error("Matched Fumadocs UI build failed");
times.matchedUi = Math.round(performance.now() - begin);
outputs.matched = path.join(root, ".cache/fumadocs/matched/out");
outputs.matchedUi = path.join(fuma, "out");
const corpusHashes = [];
for (const doc of corpus.documents)
  corpusHashes.push({
    path: doc.path,
    sha256: createHash("sha256").update(doc.markdown).digest("hex"),
  });
const manifest = {
  sdk,
  outputs,
  buildTimes: times,
  corpus: corpusHashes,
  theme:
    "Unmodified default Lenso layout; a benchmark-only root counter is inserted into its content slot",
  controls: "Counter remains in root state in every implementation",
  search: "Scoped substring includes, zero debounce",
  builtAt: new Date().toISOString(),
};
await Bun.write(path.join(cache, "build.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Wrote themed performance builds", outputs);
