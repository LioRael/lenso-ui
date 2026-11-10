import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { build } from "vite";
import stylex from "@stylexjs/unplugin/vite";

const root = path.resolve(import.meta.dirname, "..");
const source = (file: string) => path.resolve(root, "..", file);

await build({
  configFile: false,
  root,
  plugins: [
    stylex({
      dev: false,
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS" },
    }),
  ],
  resolve: {
    alias: [
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
    outDir: "dist",
    lib: {
      entry: path.join(root, "src/entry.ts"),
      formats: ["es"],
      fileName: () => "web.js",
      cssFileName: "web",
    },
  },
});
const declarations = Bun.spawn(["bun", "run", "--bun", "tsc", "-p", "tsconfig.build.json"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if ((await declarations.exited) !== 0) throw new Error("Exact adapter declarations failed");
await cp(path.join(root, "src/browser.js"), path.join(root, "dist/browser.js"));
await mkdir(path.join(root, "dist/notices"), { recursive: true });
await cp(
  source("../THIRD_PARTY_NOTICES.md"),
  path.join(root, "dist/notices/THIRD_PARTY_NOTICES.md"),
);
