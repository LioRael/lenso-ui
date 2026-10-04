// Build copied sources and distributions in scratch; installed dependencies are read-only.
// node selection-build.fixtures.mjs <empty-scratch-directory> <dependency-checkout>
import { cp, mkdir, readdir, symlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependencyArgument] = process.argv.slice(2);
if (!scratchArgument || !dependencyArgument)
  throw new Error("Supply scratch and readonly dependency checkout");
if (process.version !== "v24.18.0") throw new Error("Use Node 24.18.0");
const scratch = resolve(scratchArgument);
const dependencies = resolve(dependencyArgument);
if (
  scratch === source ||
  scratch.startsWith(`${source}/`) ||
  scratch === dependencies ||
  scratch.startsWith(`${dependencies}/`)
)
  throw new Error("Scratch must be outside the source and readonly dependency checkouts");
const project = resolve(scratch, "selection-validation");
const rootRequire = createRequire(resolve(dependencies, "package.json"));
const uiRequire = createRequire(resolve(dependencies, "packages/react/package.json"));
const sbRequire = createRequire(resolve(dependencies, "packages/storybook/package.json"));
async function links(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if ([".cache", ".vite", ".vite-temp", ".pnpm", ".bin", "@lenso"].includes(entry.name)) continue;
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(from, entry.name), resolve(to, entry.name));
    else await symlink(resolve(from, entry.name), resolve(to, entry.name));
  }
  if (!to.includes("/node_modules/@")) {
    await mkdir(resolve(to, "@lenso"), { recursive: true });
    await symlink(resolve(project, "packages/styles"), resolve(to, "@lenso/tokens"));
    await symlink(resolve(project, "packages/react"), resolve(to, "@lenso/ui"));
  }
}
async function run(file, args, cwd) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        XDG_CACHE_HOME: resolve(scratch, "cache"),
        VITE_CACHE_DIR: resolve(scratch, "vite-cache"),
      },
    });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? done() : reject(new Error(`${file}: ${code}`))));
  });
}
await mkdir(resolve(project, "packages"), { recursive: true });
for (const name of ["storybook", "standard", "styles", "react"]) {
  await cp(resolve(source, "packages", name), resolve(project, "packages", name), {
    recursive: true,
    filter: (path) =>
      !path.includes("/node_modules") &&
      !path.includes("/storybook-static") &&
      !path.includes("/dist"),
  });
}
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml"])
  await cp(resolve(source, name), resolve(project, name));
await cp(resolve(source, "third-party/heroui"), resolve(project, "third-party/heroui"), {
  recursive: true,
});
await mkdir(resolve(project, "apps/docs/src/demos/en/radio-group"), { recursive: true });
await cp(
  resolve(source, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
  resolve(project, "apps/docs/src/demos/en/radio-group/payment-icons.ts"),
);
await links(resolve(dependencies, "node_modules"), resolve(project, "node_modules"));
for (const name of ["storybook", "styles", "react"])
  await links(
    resolve(dependencies, "packages", name, "node_modules"),
    resolve(project, "packages", name, "node_modules"),
  );
const tsc = resolve(dirname(rootRequire.resolve("typescript/package.json")), "bin/tsc");
const tsdown = resolve(dirname(uiRequire.resolve("tsdown/package.json")), "dist/run.mjs");
await run(
  resolve(project, "packages/styles/src/components/typography/generate-prose.mjs"),
  [],
  resolve(project, "packages/styles"),
);
await run(tsdown, ["--config", "tsdown.config.ts"], resolve(project, "packages/styles"));
await run(
  tsc,
  ["-p", "tsconfig.build.json", "--emitDeclarationOnly", "--noEmit", "false", "--outDir", "dist"],
  resolve(project, "packages/styles"),
);
await run(
  resolve(project, "packages/styles/scripts/copy-css.mjs"),
  [],
  resolve(project, "packages/styles"),
);
await run(tsdown, ["--config", "tsdown.config.ts"], resolve(project, "packages/react"));
await run(
  tsc,
  ["-p", "tsconfig.build.json", "--emitDeclarationOnly", "--noEmit", "false", "--outDir", "dist"],
  resolve(project, "packages/react"),
);
await run(
  resolve(project, "packages/react/scripts/copy-notices.mjs"),
  [],
  resolve(project, "packages/react"),
);
await run(tsc, ["-p", "tsconfig.json", "--noEmit"], resolve(project, "packages/storybook"));
const cli = resolve(dirname(sbRequire.resolve("storybook/package.json")), "dist/bin/dispatcher.js");
await run(
  cli,
  ["build", "--output-dir", resolve(scratch, "selection-storybook-static"), "--disable-telemetry"],
  resolve(project, "packages/storybook"),
);
console.log(`Fresh tokens/UI + strict Storybook TS + production Storybook: ${scratch}`);
