// Real Webpack compilation using the installed Next compiler and packed consumer tooling.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [mirrorArgument, dependenciesArgument] = process.argv.slice(2);
const mirror = resolve(mirrorArgument);
const project = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
assert(mirror.startsWith(resolve(project, "test-results") + sep));
const require = createRequire(resolve(dependenciesArgument, "apps/docs/package.json"));
const wp = require("next/dist/compiled/webpack/webpack");
const packedRequire = createRequire(resolve(mirror, "packages/testing/package.json"));
const { default: stylex } = await import(
  pathToFileURL(packedRequire.resolve("@lenso/stylex-build"))
);
const root = resolve(mirror, "webpack-consumer");
await mkdir(root, { recursive: true });
const serverSource = resolve(root, "server.stylex.ts");
await writeFile(
  serverSource,
  'import * as stylex from "@stylexjs/stylex"; export const server = stylex.create({cell:{minWidth:80}});',
);
const entry = resolve(root, "entry.js");
await writeFile(
  entry,
  'import * as stylex from "@stylexjs/stylex"; export const app=stylex.create({check:{opacity:{default:0,":hover":1}},padding:(value)=>({paddingTop:value})});',
);
const compiler = wp.webpack({
  name: "client",
  mode: "production",
  // Next supplies its own minimizer; its bundled Webpack's standalone default is not shipped.
  optimization: { minimize: false },
  context: root,
  entry,
  output: { path: resolve(root, "dist"), filename: "app.js" },
  cache: false,
  resolve: { modules: [resolve(mirror, "node_modules"), "node_modules"] },
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.thisCompilation.tap("theme-fixture", (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: "theme-fixture",
              stage: wp.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            () => {
              // Model extracted initial CSS, not an orphan asset invisible to consumers.
              for (const entry of compilation.entrypoints.values())
                entry.getEntrypointChunk().files.add("style.css");
              compilation.emitAsset(
                "style.css",
                new wp.webpack.sources.RawSource(":root{--theme:1}"),
              );
            },
          );
        });
      },
    },
    stylex.webpack({
      metadata: [packedRequire.resolve("@lenso/tokens/stylex-rules.json")],
      sources: [pathToFileURL(serverSource)],
    }),
  ],
});
try {
  const stats = await new Promise((done, reject) =>
    compiler.run((error, value) => (error ? reject(error) : done(value))),
  );
  assert(!stats.hasErrors(), stats.toString({ all: false, errors: true }));
  const css = await readFile(resolve(root, "dist/style.css"), "utf8");
  assert(css.includes("--theme"), "Theme CSS retained");
  assert.match(css, /min-width:\s*80px/, "Server-only declarations emitted by the client");
  assert.match(
    css,
    /padding-top:\s*var\(--x-paddingTop\)/,
    "Dynamic StyleX variable ABI preserved",
  );
  assert.match(css, /opacity:\s*1/, "Application conditional rules emitted");
  assert.match(css, /padding:\s*24px/, "Packed package raw rules included");
  console.log(
    "PASS: packed real Webpack consumer, package + app + server-only source, theme retained.",
  );
} finally {
  await new Promise((done, reject) => compiler.close((error) => (error ? reject(error) : done())));
}
