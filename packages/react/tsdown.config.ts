import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import stylex from "@stylexjs/unplugin/rolldown";
import { defineConfig } from "tsdown";

const components = path.resolve(import.meta.dirname, "src/components");
const entry = Object.fromEntries(
  readdirSync(components, { withFileTypes: true })
    .filter(
      (item) => item.isDirectory() && existsSync(path.join(components, item.name, "index.ts")),
    )
    .map((item) => [`components/${item.name}/index`, path.join(components, item.name, "index.ts")]),
);

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "icons/index": "src/icons/index.tsx",
    ...entry,
  },
  deps: {
    neverBundle: [
      "@base-ui/react",
      "@lenso/tokens",
      "react",
      "react-dom",
      "react-aria",
      "react-aria-components",
      "react-stately",
      "@internationalized/date",
    ],
  },
  dts: false,
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  outDir: "dist",
  platform: "browser",
  plugins: [
    stylex({
      dev: false,
      devMode: "off",
      useCSSLayers: false,
      // Lightning CSS Features.DirSelector: preserve dir, not a language approximation.
      lightningcssOptions: { exclude: 4 },
    }),
  ],
});
