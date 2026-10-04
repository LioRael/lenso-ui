// Fresh builds and links stay in scratch. Dependency project is read-only.
// Node 24.18.0: node collection-build.fixture.mjs <empty-scratch> <dependency-project>
import { cp, mkdir, readdir, readFile, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

if (process.versions.node !== "24.18.0") throw new Error("Use Node 24.18.0");
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependenciesArgument] = process.argv.slice(2);
if (!scratchArgument || !dependenciesArgument)
  throw new Error("Supply scratch and read-only dependencies");
const scratch = resolve(scratchArgument);
const dependencies = resolve(dependenciesArgument);
if ([project, dependencies].some((root) => scratch === root || scratch.startsWith(root + sep)))
  throw new Error("Build output must be scratch, outside both source and dependency repositories");
const validation = resolve(scratch, "collection-validation");
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
  await symlink(resolve(validation, "packages/styles"), resolve(destination, "@lenso/tokens"));
  await symlink(resolve(validation, "packages/react"), resolve(destination, "@lenso/ui"));
}
await mkdir(resolve(validation, "packages"), { recursive: true });
for (const name of ["styles", "react", "standard"]) {
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/\/(?:node_modules|dist)(?:\/|$)/.test(path),
  });
}
// Optional catch-up of the parent's reviewed native fix, copied only into scratch.
const tableSource = resolve(validation, "packages/react/src/components/table/table.tsx");
if (process.env.COLLECTION_NATIVE_TABLE_SOURCE)
  await cp(process.env.COLLECTION_NATIVE_TABLE_SOURCE, tableSource);
const tableSourceHash = createHash("sha256")
  .update(await readFile(tableSource))
  .digest("hex");
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml", "third-party"])
  await cp(resolve(project, name), resolve(validation, name), { recursive: true });
const storybook = resolve(validation, "packages/storybook");
await mkdir(resolve(storybook, "stories"), { recursive: true });
for (const name of ["package.json", "tsconfig.json", ".storybook"])
  await cp(resolve(project, "packages/storybook", name), resolve(storybook, name), {
    recursive: true,
  });
for (const name of [
  "table.stories.tsx",
  "tag-group.stories.tsx",
  "collection.stylex.ts",
  "collection-data.fixtures.tsx",
  "collection-icons.fixtures.tsx",
  "collection-selection.fixtures.tsx",
])
  await cp(
    resolve(project, "packages/storybook/stories", name),
    resolve(storybook, "stories", name),
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
  await run(
    resolve(dirname(require.resolve("tsdown/package.json")), "dist/run.mjs"),
    ["--config", "tsdown.config.ts"],
    cwd,
  );
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
const require = createRequire(resolve(dependencies, "packages/storybook/package.json"));
await run(
  resolve(dirname(require.resolve("storybook/package.json")), "dist/bin/dispatcher.js"),
  ["build", "--output-dir", resolve(scratch, "collection-storybook-static"), "--disable-telemetry"],
  storybook,
);
await writeFile(
  resolve(scratch, "collection-build.json"),
  JSON.stringify(
    {
      node: process.versions.node,
      scopedStories: ["table", "tag-group"],
      freshPackages: ["tokens", "ui"],
      nativeTableSourceSha256: tableSourceHash,
      stagedParentTableFix: !!process.env.COLLECTION_NATIVE_TABLE_SOURCE,
      strictStorybookTypecheck: true,
      productionBuild: true,
    },
    null,
    2,
  ),
);
console.log(`Fresh tokens/UI, scoped strict TS and production Storybook: ${scratch}`);
