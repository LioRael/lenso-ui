import path from "node:path";

import { defineConfig } from "tsdown";

export default defineConfig({
  dts: false,
  entry: {
    index: path.resolve(import.meta.dirname, "src/index.ts"),
    "tokens.stylex": path.resolve(import.meta.dirname, "src/tokens.stylex.ts"),
  },
  format: "esm",
  outDir: path.resolve(import.meta.dirname, "dist"),
  platform: "neutral",
  report: false,
  tsconfig: path.resolve(import.meta.dirname, "tsconfig.json"),
});
