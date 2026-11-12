import { generatePrimitiveBridge } from "./primitive-bridge.js";
import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { build } from "vite";
import stylex from "@stylexjs/unplugin/vite";
import { initialCSS, type PresentationCase } from "./initial-css.js";

const root = path.resolve(import.meta.dirname, "..");
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: { out: { type: "string" }, "browser-only": { type: "boolean" } },
});
const output = path.resolve(root, values.out ?? "dist");
const source = (file: string) => path.resolve(root, "..", file);

await generatePrimitiveBridge(root);

await build({
  configFile: false,
  base: "./",
  root,
  plugins: [
    stylex({
      classNamePrefix: "lenso-exact-",
      dev: false,
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS" },
    }),
  ],
  resolve: {
    alias: [
      { find: /^@lenso\/glass\/fusion$/, replacement: source("glass/src/fusion-entry.ts") },
      { find: /^@lenso\/glass\/motion$/, replacement: source("glass/src/motion/index.ts") },
      { find: /^@lenso\/glass$/, replacement: source("glass/src/index.ts") },
      { find: /^@lenso\/tokens\/styles\.css$/, replacement: source("tokens/styles.css") },
      { find: /^@lenso\/tokens\/materials$/, replacement: source("tokens/src/materials/index.ts") },
      {
        find: /^@lenso\/tokens\/(.+)$/,
        replacement: source("tokens/src/components/$1/index.ts"),
      },
    ],
  },
  build: {
    outDir: output,
    lib: {
      entry: {
        web: path.join(root, "src/entry.ts"),
        presentation: path.join(root, "src/presentation.ts"),
      },
      formats: ["es"],
      fileName: (_format, name) => `${name}.js`,
      cssFileName: "web",
    },
  },
});
const compiled: { presentationCases(): PresentationCase[]; scrollShadowProperties: string } =
  await import(path.join(output, "presentation.js"));
const cases = compiled.presentationCases();
const registered = new Set(cases.map((entry) => entry.kind));
for (const file of ["index.contract", ...new Bun.Glob("components/**/*.contract").scanSync(root)]) {
  for (const match of (await Bun.file(path.join(root, file)).text()).matchAll(
    /data-lenso-kind="([a-z-]+)"/g,
  ))
    if (!registered.has(match[1] ?? ""))
      throw new Error(`Missing initial Lenso presentation: ${match[1]}`);
}
const css = Bun.file(path.join(output, "web.css"));
const atomic = `${await css.text()}\n${compiled.scrollShadowProperties}`;
await Bun.write(path.join(output, "web.atomic.css"), atomic);
const initial = initialCSS(atomic, cases);
await Bun.write(css, initial);
console.log(
  `Initial styles: ${cases.length} recipes, ${Buffer.byteLength(initial)} bytes (${Bun.gzipSync(initial).length} gzip)`,
);
if (!values["browser-only"]) {
  const declarations = Bun.spawn(
    ["bun", "run", "--bun", "tsc", "-p", "tsconfig.build.json", "--outDir", output],
    {
      cwd: root,
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await declarations.exited) !== 0) throw new Error("Exact adapter declarations failed");
}
await cp(path.join(root, "src/browser.js"), path.join(output, "browser.js"));
await mkdir(path.join(output, "notices"), { recursive: true });
await cp(source("../THIRD_PARTY_NOTICES.md"), path.join(output, "notices/THIRD_PARTY_NOTICES.md"));

await cp(path.join(root, "NOTICES.md"), path.join(output, "notices/EXACT_ADAPTATIONS.md"));
