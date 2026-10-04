// Scratch-only fresh package and Storybook build. Dependency checkout is read-only.
// PATH=<Node 24.18.0 bin>:$PATH node menu-toast-build.fixtures.mjs <empty-scratch> <dependency-checkout>
import assert from "node:assert/strict";
import { cp, mkdir, readdir, symlink } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

assert.equal(process.version, "v24.18.0");
assert.equal(execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim(), "11.5.0");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependencyArgument = project] = process.argv.slice(2);
assert(scratchArgument, "Provide an empty scratch directory");
const scratch = resolve(scratchArgument);
const dependency = resolve(dependencyArgument);
assert.notEqual(scratch, project);
assert.notEqual(scratch, dependency);
const validation = resolve(scratch, "menu-toast-validation");
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
  ]) {
    await symlink(resolve(validation, "packages", path), resolve(destination, "@lenso", name));
  }
}
async function run(command, args, cwd) {
  await new Promise((done, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? done() : reject(new Error(`${command} ${args.join(" ")} exited ${code}`)),
    );
  });
}
await mkdir(resolve(validation, "packages"), { recursive: true });
for (const name of ["styles", "react", "storybook", "standard"]) {
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:node_modules|dist|storybook-static)(?:\/|$)/.test(path),
  });
}
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml", "LICENSE"])
  await cp(resolve(project, name), resolve(validation, name));
await cp(resolve(project, "third-party"), resolve(validation, "third-party"), { recursive: true });
// Existing choice stories import the genuine docs payment SVG fixture.
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
for (const name of ["styles", "react"])
  await run("pnpm", ["run", "build"], resolve(validation, "packages", name));
const tsc = resolve(dirname(require.resolve("typescript/package.json")), "bin/tsc");
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
    resolve(scratch, "menu-toast-storybook-static"),
    "--disable-telemetry",
  ],
  resolve(validation, "packages/storybook"),
);
console.log(`PASS fresh tokens/UI, strict Storybook TS, production Storybook: ${scratch}`);
