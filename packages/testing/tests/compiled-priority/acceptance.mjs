// node acceptance.mjs <fresh ordinary proof mirror> <read-only dependency workspace> [--docs]
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const [mirrorArgument, dependenciesArgument, mode] = process.argv.slice(2);
assert(mirrorArgument && dependenciesArgument);
assert(mode === undefined || mode === "--docs");
const mirror = resolve(mirrorArgument);
const dependencies = resolve(dependenciesArgument);
assert(mirror.startsWith(resolve(project, "test-results") + sep));
assert(!mirror.startsWith(dependencies + sep));
const proof = JSON.parse(await readFile(resolve(mirror, "results.json")));
assert(!proof.packedConsumption, "Use an ordinary source proof mirror for the full source suite");
const require = createRequire(resolve(dependencies, "package.json"));
const packageRequire = (name) => createRequire(resolve(dependencies, name, "package.json"));
const binary = (resolver, name, file) =>
  resolve(dirname(resolver.resolve(`${name}/package.json`)), file);
const report = { basis: proof.sourceHashes, steps: [] };
async function run(name, file, args, cwd = mirror) {
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        CI: "1",
        STORYBOOK_DISABLE_TELEMETRY: "1",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    });
    child.on("error", reject);
    child.on("exit", done);
  });
  report.steps.push({ name, code });
  await writeFile(resolve(mirror, "acceptance.json"), JSON.stringify(report, null, 2));
  assert.equal(code, 0, `${name} failed; see the captured log`);
}
async function links(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ([".cache", ".vite", ".vite-temp", ".stylex", ".pnpm", "@lenso"].includes(entry.name))
      continue;
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(source, entry.name), resolve(destination, entry.name));
    else await symlink(resolve(source, entry.name), resolve(destination, entry.name));
  }
  if (source.endsWith("node_modules")) {
    await mkdir(resolve(destination, "@lenso"), { recursive: true });
    for (const [name, target] of [
      ["tokens", "styles"],
      ["ui", "react"],
      ["testing", "testing"],
      ["stylex-build", "stylex-build"],
    ])
      await symlink(resolve(mirror, "packages", target), resolve(destination, "@lenso", name));
  }
}
for (const directory of ["apps/docs", "packages/storybook", "scripts"]) {
  await cp(resolve(project, directory), resolve(mirror, directory), {
    recursive: true,
    filter: (file) =>
      !/\/(?:node_modules|dist|\.next|storybook-static|test-results)(?:\/|$)/.test(
        file.slice(project.length),
      ),
  });
}
await links(
  resolve(dependencies, "apps/docs/node_modules"),
  resolve(mirror, "apps/docs/node_modules"),
);
const tsc = binary(require, "typescript", "bin/tsc");
await run("tooling contract", resolve(mirror, "packages/stylex-build/tests/contract.test.mjs"), []);
for (const name of ["stylex-build", "styles", "react", "storybook"])
  await run(`strict ${name} TypeScript`, tsc, ["--noEmit"], resolve(mirror, "packages", name));
await run("source import tests", resolve(mirror, "scripts/source-imports.test.mjs"), []);
await run("reconstruction boundaries", resolve(mirror, "scripts/verify-reconstruction.mjs"), []);
await run(
  "native UI browser suite",
  binary(packageRequire("packages/react"), "vitest", "vitest.mjs"),
  ["run", "--config", "vitest.config.ts"],
  resolve(mirror, "packages/react"),
);
await run(
  "Storybook production",
  binary(packageRequire("packages/storybook"), "storybook", "dist/bin/dispatcher.js"),
  ["build", "--disable-telemetry"],
  resolve(mirror, "packages/storybook"),
);
const inventory = JSON.parse(
  await readFile(resolve(mirror, "packages/storybook/storybook-static/index.json")),
);
report.storybookStories = Object.values(inventory.entries).filter(
  (entry) => entry.type === "story",
).length;
report.sourceStories = Object.values(inventory.entries).filter(
  (entry) => entry.type === "story" && !entry.name.startsWith("Local "),
).length;
report.localProofStories = report.storybookStories - report.sourceStories;
assert.equal(report.sourceStories, 583);
assert.equal(report.localProofStories, 9);
await writeFile(resolve(mirror, "acceptance.json"), JSON.stringify(report, null, 2));
if (mode === "--docs") {
  await run(
    "prepare docs",
    resolve(mirror, "apps/docs/scripts/prepare-docs.mjs"),
    [],
    resolve(mirror, "apps/docs"),
  );
  await run(
    "docs Webpack production",
    binary(packageRequire("apps/docs"), "next", "dist/bin/next"),
    ["build", "--webpack"],
    resolve(mirror, "apps/docs"),
  );
}
