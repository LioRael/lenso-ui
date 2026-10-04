import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [dependencyRoot, artifactDirectory] = process.argv.slice(2);
assert(dependencyRoot && artifactDirectory, "Supply readonly dependencies and artifacts");
const dependencies = resolve(dependencyRoot);
const artifacts = resolve(artifactDirectory);
await mkdir(artifacts, { recursive: true });
const require = createRequire(resolve(dependencies, "packages/testing/package.json"));
const viteRequire = createRequire(require.resolve("vite"));
const { transform } = await import(pathToFileURL(viteRequire.resolve("esbuild")).href);
const config = JSON.parse(await readFile(resolve(root, "packages/standard/oxlint.json"), "utf8"));
assert.equal(config.categories.correctness, "error");
assert.ok(config.plugins.includes("react"));
assert.deepEqual(config.overrides, [
  {
    files: [
      "**/packages/primitives/src/resize-handle/index.tsx",
      "**/packages/primitives/src/sidebar/index.tsx",
    ],
    rules: { "react/refs": "off" },
  },
]);
const positives = [
  "packages/primitives/src/resize-handle/index.tsx",
  "packages/primitives/src/sidebar/index.tsx",
  "packages/testing/tests/hooks.browser.test.tsx",
  "packages/react/src/components/list-box/windowed.tsx",
  "packages/react/src/utils/theme-scope.tsx",
  "apps/docs/src/demos/en/select/asynchronous-loading.tsx",
  "apps/docs/src/demos/en/combo-box/asynchronous-loading.tsx",
  "packages/storybook/stories/menu.stories.tsx",
  "packages/storybook/stories/selection.fixtures.tsx",
];
for (const filename of positives) {
  await transform(await readFile(resolve(root, filename), "utf8"), {
    loader: "tsx",
    sourcefile: filename,
    jsx: "automatic",
  });
}
const oxlint = resolve(dependencies, "node_modules/oxlint/bin/oxlint");
function lint(files) {
  return spawnSync(
    process.execPath,
    [
      oxlint,
      "--no-ignore",
      "--config",
      resolve(root, "packages/standard/oxlint.json"),
      "--deny-warnings",
      ...files,
    ],
    { cwd: root, encoding: "utf8" },
  );
}
const positive = lint(positives);
await writeFile(resolve(artifacts, "positive-lint.log"), positive.stdout + positive.stderr);
assert.equal(positive.status, 0, positive.stdout + positive.stderr);
const negativeFile = resolve(artifacts, "outside-boundary.tsx");
await writeFile(
  negativeFile,
  `
import { useEffect, useRef, useState } from "react";
export function RenderRef() {
  const value = useRef(0);
  return <output>{value.current}</output>;
}
export function ImmutableData({ value }: { value: { count: number } }) {
  value.count = 2;
  return <output>{value.count}</output>;
}
export function DerivedEffect({ value }: { value: number }) {
  const [derived, setDerived] = useState(0);
  useEffect(() => { setDerived(value); }, [value]);
  return <output>{derived}</output>;
}
`,
);
const negative = lint([negativeFile]);
await writeFile(resolve(artifacts, "negative-lint.log"), negative.stdout + negative.stderr);
assert.equal(negative.status, 1);
for (const rule of ["refs", "immutability", "set-state-in-effect"])
  assert.ok(negative.stdout.includes(`react(${rule})`), `Root must still reject ${rule}`);
console.log(
  `PASS ${positives.length} syntax/static positives; all three React correctness negative sentinels rejected`,
);
