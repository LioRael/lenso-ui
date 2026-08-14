import path from "node:path";

import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    neverBundle: ["@base-ui/react", "react"],
  },
  dts: false,
  entry: {
    "sidebar/index": path.resolve(import.meta.dirname, "src/sidebar/index.tsx"),
  },
  format: "esm",
  outDir: path.resolve(import.meta.dirname, "dist"),
  platform: "browser",
  report: false,
  tsconfig: path.resolve(import.meta.dirname, "tsconfig.json"),
});
