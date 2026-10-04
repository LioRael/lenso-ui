// Scratch-only fresh distribution + strict Storybook production proof.
// node overlay-build.fixture.mjs <empty-scratch-directory> <readonly-dependency-project>
import { cp, mkdir, readdir, symlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependenciesArgument = project] = process.argv.slice(2);
if (!scratchArgument) throw new Error("Provide an empty scratch directory");
if (process.versions.node !== "24.18.0") throw new Error("Use Node 24.18.0");
const scratch = resolve(scratchArgument);
const dependencies = resolve(dependenciesArgument);
const validation = resolve(scratch, "overlay-validation");
const rootRequire = createRequire(resolve(dependencies, "package.json"));
async function run(file, args, cwd = validation) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? done() : reject(new Error(`${file} exited ${code}`))));
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
await mkdir(resolve(validation, "packages"), { recursive: true });
for (const name of ["styles", "react", "storybook", "standard"]) {
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/\/(?:node_modules|dist|storybook-static)(?:\/|$)/.test(path),
  });
}
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml", "third-party"])
  await cp(resolve(project, name), resolve(validation, name), { recursive: true });
// Shared choice stories import this existing offline source asset.
await mkdir(resolve(validation, "apps/docs/src/demos/en/radio-group"), { recursive: true });
await cp(
  resolve(project, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
  resolve(validation, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
);
await links(resolve(dependencies, "node_modules"), resolve(validation, "node_modules"));
for (const name of ["styles", "react", "storybook"])
  await links(
    resolve(dependencies, "packages", name, "node_modules"),
    resolve(validation, "packages", name, "node_modules"),
  );
const tsc = resolve(dirname(rootRequire.resolve("typescript/package.json")), "bin/tsc");
for (const name of ["styles", "react"]) {
  const cwd = resolve(validation, "packages", name);
  const require = createRequire(resolve(dependencies, "packages", name, "package.json"));
  if (name === "styles")
    await run(resolve(cwd, "src/components/typography/generate-prose.mjs"), [], cwd);
  const tsdown = resolve(dirname(require.resolve("tsdown/package.json")), "dist/run.mjs");
  await run(tsdown, ["--config", "tsdown.config.ts"], cwd);
  await run(
    tsc,
    ["-p", "tsconfig.build.json", "--emitDeclarationOnly", "--noEmit", "false", "--outDir", "dist"],
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
await run(
  resolve(dirname(storybookRequire.resolve("storybook/package.json")), "dist/bin/dispatcher.js"),
  ["build", "--output-dir", resolve(scratch, "overlay-storybook-static"), "--disable-telemetry"],
  resolve(validation, "packages/storybook"),
);
console.log(`Fresh tokens/UI + strict Storybook TS + production build: ${scratch}`);
