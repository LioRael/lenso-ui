import path from "node:path";

import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    neverBundle: ["@base-ui/react", "@stylexjs/stylex", "@tanstack/react-table", "react"],
  },
  dts: false,
  entry: {
    "data-grid/index": path.resolve(import.meta.dirname, "src/data-grid/index.tsx"),
    "resize-handle/index": path.resolve(import.meta.dirname, "src/resize-handle/index.tsx"),
    "sidebar/index": path.resolve(import.meta.dirname, "src/sidebar/index.tsx"),
  },
  format: "esm",
  outDir: path.resolve(import.meta.dirname, "dist"),
  platform: "browser",
  report: false,
  tsconfig: path.resolve(import.meta.dirname, "tsconfig.json"),
});
