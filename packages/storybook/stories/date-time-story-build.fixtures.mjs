// Scratch-only validation; dependency checkout is read-only.
// Node 26.10.0, pnpm 12.9.1: node date-time-story-build.fixtures.mjs <empty-scratch> <dependency-checkout>
import assert from "node:assert/strict";
import { cp, mkdir, readdir, symlink, readFile, realpath } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

assert.equal(process.version, "v26.10.0");
assert.equal(execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim(), "12.9.1");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependencyArgument] = process.argv.slice(2);
assert(
  scratchArgument && dependencyArgument,
  "Provide empty scratch and read-only dependency checkout",
);
const scratch = resolve(scratchArgument);
const dependency = resolve(dependencyArgument);
assert.notEqual(scratch, project);
assert.notEqual(scratch, dependency);
await mkdir(scratch, { recursive: true });
assert.deepEqual(await readdir(scratch), [], "Scratch must be empty");
const validation = resolve(scratch, "date-time-story-validation");
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
  for (const [name, path] of [
    ["tokens", "styles"],
    ["ui", "react"],
    ["standard", "standard"],
  ])
    await symlink(resolve(validation, "packages", path), resolve(destination, "@lenso", name));
}
async function run(command, args, cwd) {
  await new Promise((done, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        STORYBOOK_DISABLE_TELEMETRY: "1",
        XDG_CACHE_HOME: resolve(scratch, "cache"),
      },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? done() : reject(new Error(`${command} exited ${code}`)),
    );
  });
}
for (const name of ["styles", "react", "storybook", "standard"])
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:node_modules|dist|storybook-static)(?:\/|$)/.test(path),
  });
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml", "LICENSE"])
  await cp(resolve(project, name), resolve(validation, name));
await cp(resolve(project, "third-party"), resolve(validation, "third-party"), { recursive: true });
await mkdir(resolve(validation, "apps/docs/src/demos/en/radio-group"), { recursive: true });
await cp(
  resolve(project, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
  resolve(validation, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
);
await links(resolve(dependency, "node_modules"), resolve(validation, "node_modules"));
for (const name of ["styles", "react", "storybook"])
  await links(
    resolve(dependency, "packages", name, "node_modules"),
    resolve(validation, "packages", name, "node_modules"),
  );
// Storybook's existing manifest intentionally stays untouched. Resolve the date boundary's
// existing packages from the UI dependency tree, never install or write into that tree.
await mkdir(resolve(validation, "packages/storybook/node_modules/@internationalized"), {
  recursive: true,
});
for (const name of ["@internationalized/date", "react-aria-components"]) {
  const source = resolve(dependency, "packages/react/node_modules", name);
  const target = resolve(validation, "packages/storybook/node_modules", name);
  try {
    assert.equal(await realpath(target), await realpath(source), `${name} has one physical root`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await symlink(source, target);
  }
}
const require = createRequire(resolve(dependency, "package.json"));
const tsc = resolve(dirname(require.resolve("typescript/package.json")), "bin/tsc");
// pnpm 11 auto-installs a workspace with no lock. Running scripts through pnpm would
// create a second physical RAC context root beside the manually linked dependencies.
// Execute the existing package build commands directly, with one dependency tree.
for (const name of ["styles", "react"]) {
  const cwd = resolve(validation, "packages", name);
  const manifest = JSON.parse(await readFile(resolve(cwd, "package.json"), "utf8"));
  const packageRequire = createRequire(resolve(dependency, "packages", name, "package.json"));
  const tsdownPackage = packageRequire.resolve("tsdown/package.json");
  const tsdownManifest = JSON.parse(await readFile(tsdownPackage, "utf8"));
  const tsdown = resolve(dirname(tsdownPackage), tsdownManifest.bin.tsdown);
  for (const command of manifest.scripts.build.split(" && ")) {
    const [binary, ...args] = command.split(/\s+/);
    assert(["node", "tsdown", "tsc"].includes(binary), `Unrecognized build command: ${command}`);
    await run(
      process.execPath,
      binary === "node" ? args : [binary === "tsdown" ? tsdown : tsc, ...args],
      cwd,
    );
  }
}
assert(
  !(await readdir(resolve(validation, "node_modules"))).includes(".pnpm"),
  "Validation must use only the read-only dependency checkout, not an auto-installed second tree",
);
await run(
  process.execPath,
  [tsc, "-p", resolve(validation, "packages/storybook/tsconfig.json"), "--noEmit", "--strict"],
  validation,
);
const storybookRequire = createRequire(resolve(dependency, "packages/storybook/package.json"));
const cli = resolve(
  dirname(storybookRequire.resolve("storybook/package.json")),
  "dist/bin/dispatcher.js",
);
await run(
  process.execPath,
  [
    cli,
    "build",
    "--output-dir",
    resolve(scratch, "date-time-storybook-static"),
    "--disable-telemetry",
  ],
  resolve(validation, "packages/storybook"),
);
console.log(`PASS fresh tokens/UI, strict Storybook TS, production Storybook: ${scratch}`);
