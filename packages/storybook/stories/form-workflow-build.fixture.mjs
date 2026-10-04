// Scratch-only fresh package build. Dependency project is strictly read-only.
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArg, dependenciesArg] = process.argv.slice(2);
if (!scratchArg || !dependenciesArg)
  throw new Error("Provide scratch and read-only dependency project");
if (process.versions.node !== "26.10.0") throw new Error("Use Node 26.10.0");
const scratch = resolve(scratchArg);
const dependencies = resolve(dependenciesArg);
const validation = resolve(scratch, "form-workflow-validation");
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
  ])
    await symlink(resolve(validation, "packages", name), resolve(destination, "@lenso", alias));
}
await mkdir(resolve(validation, "packages"), { recursive: true });
for (const name of ["styles", "react", "storybook", "standard"])
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !/\/(?:node_modules|dist|storybook-static)(?:\/|$)/.test(path),
  });
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml", "third-party"])
  await cp(resolve(project, name), resolve(validation, name), { recursive: true });
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
const storybookRequire = createRequire(resolve(dependencies, "packages/storybook/package.json"));
await run(
  resolve(dirname(storybookRequire.resolve("storybook/package.json")), "dist/bin/dispatcher.js"),
  [
    "build",
    "--output-dir",
    resolve(scratch, "form-workflow-storybook-static"),
    "--disable-telemetry",
  ],
  resolve(validation, "packages/storybook"),
);
const consumer = resolve(validation, "form-workflow-consumer");
await mkdir(consumer, { recursive: true });
await links(
  resolve(dependencies, "packages/storybook/node_modules"),
  resolve(consumer, "node_modules"),
);
for (const name of [
  "form-workflow-contract.fixture.tsx",
  "form-workflow-invalid.fixture.tsx",
  "form-workflow.stylex.ts",
])
  await cp(resolve(project, "packages/storybook/stories", name), resolve(consumer, name));
await writeFile(
  resolve(consumer, "index.html"),
  '<html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  resolve(consumer, "main.tsx"),
  `import {createRoot} from 'react-dom/client';
import '@lenso/tokens/styles.css';
import {FormWorkflowContract} from './form-workflow-contract.fixture';
import {FormWorkflowInvalidFixture} from './form-workflow-invalid.fixture';
document.documentElement.setAttribute('data-theme',new URLSearchParams(location.search).get('theme')||'light');
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('case')==='invalid'?<FormWorkflowInvalidFixture/>:<FormWorkflowContract/>);`,
);
await writeFile(
  resolve(consumer, "vite.config.mjs"),
  `import {defineConfig} from ${JSON.stringify(pathToFileURL(storybookRequire.resolve("vite")).href)};
import stylex from ${JSON.stringify(pathToFileURL(rootRequire.resolve("@lenso/stylex-build")).href)};
export default defineConfig({
base:'/contracts/',cacheDir:${JSON.stringify(resolve(scratch, "form-workflow-vite-cache"))},
plugins:[stylex.vite({metadata:[new URL(${JSON.stringify(pathToFileURL(rootRequire.resolve("@lenso/tokens/stylex-rules.json")).href)})],lightningcssOptions:{exclude:4},unstable_moduleResolution:{type:'commonJS',rootDir:process.cwd()}})],
build:{outDir:${JSON.stringify(resolve(scratch, "form-workflow-contract-static"))}}
});`,
);
await run(
  resolve(dirname(storybookRequire.resolve("vite/package.json")), "bin/vite.js"),
  ["build"],
  consumer,
);
console.log(`Fresh tokens/UI + strict Storybook TS + production build: ${scratch}`);
