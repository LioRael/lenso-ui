import preserveWatchOutput from "../../scripts/preserve-watch-output.js";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "motion/index": "src/motion/index.ts",
    "react/index": "src/react/index.ts",
    "react/fusion-worker": "src/fusion-worker.ts",
  },
  deps: { neverBundle: ["@lenso/tokens", "react"] },
  dts: false,
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  outDir: "dist",
  platform: "browser",
  plugins: [preserveWatchOutput()],
});
