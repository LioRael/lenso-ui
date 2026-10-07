import stylex from "@lenso/stylex-build";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    presentation: "scripts/presentation.ts",
    tabs: "scripts/tabs.ts",
    highlight: "scripts/highlight.ts",
    toc: "scripts/toc.ts",
  },
  tsconfig: "tsconfig.presentation.json",
  outDir: "dist",
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  dts: false,
  deps: {
    neverBundle: [
      "@stylexjs/stylex",
      "@base-ui/react",
      "@gravity-ui/icons",
      "fumadocs-core",
      "fumadocs-ui",
      "react",
      "react-dom",
      "shiki",
    ],
  },
  plugins: [
    stylex.rolldown({
      emitMetadata: "stylex-rules.json",
      devMode: "off",
      lightningcssOptions: { exclude: 4 },
    }),
  ],
  clean: true,
});
