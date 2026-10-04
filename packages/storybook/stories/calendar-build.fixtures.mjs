// Scratch-only fresh package builds; dependency checkout is read-only.
// PATH=<Node26.10.0-bin>:$PATH node calendar-build.fixtures.mjs <scratch> <dependency-checkout>
import assert from "node:assert/strict";
import { cp, mkdir, readFile, readdir, realpath, symlink, writeFile } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

assert.equal(process.version, "v26.10.0");
assert.equal(execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim(), "12.9.1");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependencyArgument] = process.argv.slice(2);
assert(scratchArgument && dependencyArgument, "Provide scratch and read-only dependency checkout");
const scratch = resolve(scratchArgument);
const dependency = resolve(dependencyArgument);
const validation = resolve(scratch, "calendar-validation");
assert.notEqual(scratch, project);
assert.notEqual(scratch, dependency);
assert(!scratch.startsWith(project + sep), "Scratch must be outside the source checkout");
assert(!scratch.startsWith(dependency + sep), "Scratch must be outside the dependency checkout");
const require = createRequire(resolve(dependency, "package.json"));
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
        PATH: `${resolve(cwd, "node_modules/.bin")}:${resolve(validation, "node_modules/.bin")}:${process.env.PATH}`,
        STORYBOOK_DISABLE_TELEMETRY: "1",
      },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? done() : reject(new Error(`${command} exited ${code}`)),
    );
  });
}
await mkdir(resolve(validation, "packages"), { recursive: true });
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
// These are existing UI model dependencies, not new package dependencies.
for (const name of ["@internationalized/date", "react-aria-components"]) {
  const destination = resolve(validation, "packages/storybook/node_modules", name);
  await mkdir(dirname(destination), { recursive: true });
  const modelRoot = await realpath(resolve(dependency, "packages/react/node_modules", name));
  const existingRoot = await realpath(destination).catch(() => null);
  if (existingRoot)
    assert.equal(existingRoot, modelRoot, `${name} direct dependency root mismatch`);
  else await symlink(modelRoot, destination);
}
// pnpm 11 run can auto-install a scratch workspace without its lockfile and split
// React Aria contexts between new copies and the read-only model links above.
// Execute the unchanged package scripts directly, with the same dependency bins.
const packageBuilds = {};
for (const name of ["styles", "react"]) {
  const cwd = resolve(validation, "packages", name);
  const manifest = JSON.parse(await readFile(resolve(cwd, "package.json"), "utf8"));
  packageBuilds[name] = manifest.scripts.build;
  await run("/bin/sh", ["-c", manifest.scripts.build], cwd);
}
const modelResolutions = {};
for (const name of ["@internationalized/date", "react-aria-components"]) {
  const provider = await realpath(resolve(validation, "packages/storybook/node_modules", name));
  const consumer = await realpath(resolve(validation, "packages/react/node_modules", name));
  assert.equal(provider, consumer, `${name} must have a single physical module instance`);
  modelResolutions[name] = { provider, consumer };
}
await writeFile(
  resolve(scratch, "calendar-build-proof.json"),
  JSON.stringify(
    {
      node: process.version,
      pnpm: "12.9.1",
      packageBuilds,
      modelResolutions,
      configuration: "Unchanged production Storybook config; no aliases/dedupe overrides.",
    },
    null,
    2,
  ) + "\n",
);
await run(
  process.execPath,
  [
    resolve(dirname(require.resolve("typescript/package.json")), "bin/tsc"),
    "-p",
    resolve(validation, "packages/storybook/tsconfig.json"),
    "--noEmit",
    "--strict",
  ],
  validation,
);
const sbRequire = createRequire(resolve(dependency, "packages/storybook/package.json"));
await run(
  process.execPath,
  [
    resolve(dirname(sbRequire.resolve("storybook/package.json")), "dist/bin/dispatcher.js"),
    "build",
    "--output-dir",
    resolve(scratch, "calendar-storybook-static"),
    "--disable-telemetry",
  ],
  resolve(validation, "packages/storybook"),
);
console.log(`PASS fresh tokens/UI, strict Storybook TS, production Storybook: ${scratch}`);
