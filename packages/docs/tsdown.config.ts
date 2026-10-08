import { readFileSync } from "node:fs";
import stylex from "@lenso/stylex-build";
import { defineConfig } from "tsdown";

const presentation = defineConfig({
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

// Keep every React module separate: bundling the framework would erase the
// server/client boundary between the renderer and its interactive leaf modules.
const framework = defineConfig({
  entry: ["src/react.ts", "src/client.ts", "src/compile-document.tsx"],
  root: "src",
  outDir: "dist/framework",
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  unbundle: true,
  dts: false,
  clean: false,
  deps: { neverBundle: [/^[^./]/] },
  plugins: [
    {
      name: "lenso-docs-client-boundaries",
      // Ensure each interactive facade retains its original client boundary.
      // Preserve-modules output gives every facade one source module.
      renderChunk(code, chunk) {
        if (!chunk.facadeModuleId) return null;
        const source = readFileSync(chunk.facadeModuleId, "utf8");
        return /^\s*["']use client["'];/.test(source) && !/^\s*["']use client["'];/.test(code)
          ? { code: `"use client";\n${code}`, map: null }
          : null;
      },
    },
  ],
  suppressWarnings: [/Module level directives cause errors/],
});

export default defineConfig([presentation, framework]);
