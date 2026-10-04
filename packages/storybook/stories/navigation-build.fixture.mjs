// Scratch-only build recipe for the navigation proofs; never writes dependency checkouts.
// node navigation-build.fixture.mjs <scratch-directory> [readonly-dependency-project]
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const [scratchArgument, dependenciesArgument = project] = process.argv.slice(2);
if (!scratchArgument) throw new Error("Provide an empty scratch directory");
const scratch = resolve(scratchArgument);
const dependencies = resolve(dependenciesArgument);
const rootRequire = createRequire(resolve(dependencies, "package.json"));
const storybookRequire = createRequire(resolve(dependencies, "packages/storybook/package.json"));
async function links(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if ([".cache", ".vite", ".vite-temp", ".pnpm"].includes(entry.name)) continue;
    const target = resolve(destination, entry.name);
    if (entry.name.startsWith("@") && entry.isDirectory())
      await links(resolve(source, entry.name), target);
    else await symlink(resolve(source, entry.name), target);
  }
}
async function run(file, args, cwd) {
  await new Promise((done, reject) => {
    const child = spawn(process.execPath, [file, ...args], { cwd, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? done() : reject(new Error(`${file} exited ${code}`))));
  });
}
await mkdir(scratch, { recursive: true });
const validation = resolve(scratch, "navigation-validation");
await mkdir(resolve(validation, "packages"), { recursive: true });
for (const name of ["storybook", "standard"]) {
  await cp(resolve(project, "packages", name), resolve(validation, "packages", name), {
    recursive: true,
    filter: (path) => !path.includes("/node_modules") && !path.includes("/storybook-static"),
  });
}
for (const name of ["tsconfig.base.json", "package.json", "pnpm-workspace.yaml"]) {
  await cp(resolve(project, name), resolve(validation, name));
}
await links(resolve(dependencies, "node_modules"), resolve(validation, "node_modules"));
await links(
  resolve(dependencies, "packages/storybook/node_modules"),
  resolve(validation, "packages/storybook/node_modules"),
);
const tsc = resolve(dirname(rootRequire.resolve("typescript/package.json")), "bin/tsc");
await run(
  tsc,
  ["-p", resolve(validation, "packages/storybook/tsconfig.json"), "--noEmit"],
  validation,
);
const storybookCli = resolve(
  dirname(storybookRequire.resolve("storybook/package.json")),
  "dist/bin/dispatcher.js",
);
await run(
  storybookCli,
  ["build", "--output-dir", resolve(scratch, "navigation-storybook-static"), "--disable-telemetry"],
  resolve(validation, "packages/storybook"),
);
const consumer = resolve(scratch, "navigation-consumer");
await mkdir(consumer, { recursive: true });
await links(
  resolve(dependencies, "packages/storybook/node_modules"),
  resolve(consumer, "node_modules"),
);
for (const name of ["navigation-contract.fixture.tsx", "navigation.stylex.ts"]) {
  await cp(resolve(project, "packages/storybook/stories", name), resolve(consumer, name));
}
await writeFile(
  resolve(consumer, "index.html"),
  '<html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
await writeFile(
  resolve(consumer, "main.tsx"),
  `import {createRoot} from 'react-dom/client';
import '@lenso/tokens/styles.css';
import {NavigationContractFixture} from './navigation-contract.fixture';
createRoot(document.getElementById('root')!).render(<NavigationContractFixture />);`,
);
await writeFile(
  resolve(consumer, "vite.config.mjs"),
  `import {defineConfig} from ${JSON.stringify(pathToFileURL(storybookRequire.resolve("vite")).href)};
import stylex from ${JSON.stringify(pathToFileURL(rootRequire.resolve("@lenso/stylex-build")).href)};
export default defineConfig({
  base:'/contracts/',
  cacheDir:${JSON.stringify(resolve(scratch, "navigation-vite-cache"))},
  plugins:[stylex.vite({metadata:[new URL(${JSON.stringify(pathToFileURL(rootRequire.resolve("@lenso/tokens/stylex-rules.json")).href)})],lightningcssOptions:{exclude:4},unstable_moduleResolution:{type:'commonJS',rootDir:process.cwd()}})],
  build:{outDir:${JSON.stringify(resolve(scratch, "navigation-consumer-static"))}}
});`,
);
const viteCli = resolve(dirname(storybookRequire.resolve("vite/package.json")), "bin/vite.js");
await run(viteCli, ["build"], consumer);
console.log("Navigation Storybook and package consumer built in scratch.");
