import { existsSync, readdirSync } from "node:fs";
import stylex from "@lenso/stylex-build";
import { defineConfig } from "tsdown";

const componentRoot = "src/components";
const components = existsSync(componentRoot)
  ? readdirSync(componentRoot).flatMap((family) => {
      const entry = `${componentRoot}/${family}/index.ts`;
      return existsSync(entry) ? [entry] : [];
    })
  : [];

export default defineConfig({
  entry: Object.fromEntries(
    ["src/index.ts", "src/tokens.stylex.const.ts", ...components].map((source) => [
      source.replace(/^src\//, "").replace(/\.ts$/, ""),
      source,
    ]),
  ),
  outDir: "dist",
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  dts: false,
  plugins: [
    stylex.rolldown({
      emitMetadata: "stylex-rules.json",
      devMode: "off",
      // Lightning CSS Features.DirSelector: preserve dir, not a language approximation.
      lightningcssOptions: { exclude: 4 },
    }),
  ],
  clean: true,
});
