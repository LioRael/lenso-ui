/**
 * Scratch-only color batch verification. SPDX-License-Identifier: Apache-2.0
 * node color-build.fixture.mjs <existing-scratch-directory> <readonly-dependency-project>
 * Uses one physical dependency root and direct binaries; never installs packages.
 */
import assert from "node:assert/strict";
import { cp, mkdir, readdir, symlink, readFile, writeFile, realpath } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependenciesArgument] = process.argv.slice(2);
assert.ok(
  scratchArgument && dependenciesArgument,
  "Provide an existing scratch directory and readonly dependency project",
);
assert.equal(process.versions.node, "26.10.0", "Use Node 26.10.0");
assert.equal(
  spawnSync("pnpm", ["--version"], { encoding: "utf8" }).stdout.trim(),
  "12.9.1",
  "Use pnpm 12.9.1",
);
const scratch = await realpath(resolve(scratchArgument));
const dependencies = await realpath(resolve(dependenciesArgument));
for (const source of [project, dependencies])
  assert.ok(
    scratch !== source && !scratch.startsWith(`${source}/`),
    "Scratch must be outside both repositories",
  );
const validation = resolve(scratch, "color-validation");
await mkdir(validation);
const rootRequire = createRequire(resolve(dependencies, "package.json"));
const runReport = { node: process.version, pnpm: "12.9.1", steps: [], artifacts: {} };
async function run(file, args, cwd = validation, env = {}) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: "1", ...env },
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? done() : reject(new Error(`${file} exited ${code}`))));
  });
  runReport.steps.push({
    binary: relative(dependencies, file),
    args,
    cwd: relative(validation, cwd),
  });
}
async function links(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ([".cache", ".vite", ".vite-temp", ".pnpm", "@lenso"].includes(entry.name)) continue;
    const target = resolve(destination, entry.name);
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(source, entry.name), target);
    else await symlink(resolve(source, entry.name), target);
  }
  await mkdir(resolve(destination, "@lenso"), { recursive: true });
  for (const [alias, name] of [
    ["tokens", "styles"],
    ["ui", "react"],
  ]) {
    await symlink(resolve(validation, "packages", name), resolve(destination, "@lenso", alias));
  }
}
for (const name of ["styles", "react", "storybook", "standard"]) {
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/\/(?:node_modules|dist|storybook-static)(?:\/|$)/.test(path),
  });
}
for (const name of [
  "tsconfig.base.json",
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "third-party",
]) {
  await cp(resolve(project, name), resolve(validation, name), { recursive: true });
}
// Other already-present stories reference the offline payment-icons source.
await mkdir(resolve(validation, "apps/docs/src/demos/en/radio-group"), { recursive: true });
await cp(
  resolve(project, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
  resolve(validation, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
);
await links(resolve(dependencies, "node_modules"), resolve(validation, "node_modules"));
for (const name of ["styles", "react", "storybook"]) {
  await links(
    resolve(dependencies, "packages", name, "node_modules"),
    resolve(validation, "packages", name, "node_modules"),
  );
}
const tsc = resolve(dirname(rootRequire.resolve("typescript/package.json")), "bin/tsc");
for (const name of ["styles", "react"]) {
  const cwd = resolve(validation, "packages", name);
  const require = createRequire(resolve(dependencies, "packages", name, "package.json"));
  if (name === "styles")
    await run(resolve(cwd, "src/components/typography/generate-prose.mjs"), [], cwd);
  await run(
    resolve(dirname(require.resolve("tsdown/package.json")), "dist/run.mjs"),
    ["--config", "tsdown.config.ts"],
    cwd,
  );
  await run(
    tsc,
    [
      "-p",
      "tsconfig.build.json",
      "--declaration",
      "--emitDeclarationOnly",
      "--noEmit",
      "false",
      "--outDir",
      "dist",
    ],
    cwd,
  );
  await run(
    resolve(cwd, "scripts", name === "styles" ? "copy-css.mjs" : "copy-notices.mjs"),
    [],
    cwd,
  );
}
await run(tsc, ["-p", "packages/storybook/tsconfig.json", "--noEmit"]);
const storybookRequire = createRequire(resolve(dependencies, "packages/storybook/package.json"));
const staticRoot = resolve(scratch, "color-storybook-static");
await run(
  resolve(dirname(storybookRequire.resolve("storybook/package.json")), "dist/bin/dispatcher.js"),
  ["build", "--output-dir", staticRoot, "--disable-telemetry"],
  resolve(validation, "packages/storybook"),
);
async function treeHash(path) {
  const hash = createHash("sha256");
  async function visit(directory) {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else {
        hash.update(relative(path, file));
        hash.update(await readFile(file));
      }
    }
  }
  await visit(path);
  return hash.digest("hex");
}
for (const [name, path] of [
  ["tokensSource", resolve(validation, "packages/styles/src")],
  ["uiSource", resolve(validation, "packages/react/src")],
  ["tokensDist", resolve(validation, "packages/styles/dist")],
  ["uiDist", resolve(validation, "packages/react/dist")],
  ["storybookStatic", staticRoot],
])
  runReport.artifacts[name] = await treeHash(path);
await writeFile(resolve(scratch, "color-build.json"), `${JSON.stringify(runReport, null, 2)}\n`);
const uiRequire = createRequire(resolve(dependencies, "packages/react/package.json"));
await run(resolve(validation, "packages/storybook/stories/color-proof.mjs"), [], validation, {
  COLOR_STORYBOOK_STATIC: staticRoot,
  COLOR_PROOF_OUTPUT: scratch,
  PLAYWRIGHT_MODULE: resolve(dirname(uiRequire.resolve("playwright/package.json")), "index.mjs"),
});
console.log(
  `Fresh tokens/UI, strict Storybook TS, production build and color proof passed: ${scratch}`,
);
