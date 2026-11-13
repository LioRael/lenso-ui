import path from "node:path";

import { defineConfig } from "tsdown";

export default defineConfig({
  deps: {
    neverBundle: ["@ui-sdk/core", "@ui-sdk/react", "react"],
  },
  dts: false,
  entry: {
    "wheel-picker/wheel-picker": path.resolve(
      import.meta.dirname,
      "src/wheel-picker/wheel-picker.ts",
    ),
    "list/list": path.resolve(import.meta.dirname, "src/list/list.ts"),
    "model-control/model-control": path.resolve(
      import.meta.dirname,
      "src/model-control/model-control.ts",
    ),
    "swipe-actions/swipe-actions": path.resolve(
      import.meta.dirname,
      "src/swipe-actions/swipe-actions.ts",
    ),
    "swipe-actions/index": path.resolve(import.meta.dirname, "src/swipe-actions/index.tsx"),
    "section-index/section-index": path.resolve(
      import.meta.dirname,
      "src/section-index/section-index.ts",
    ),
    "section-index/index": path.resolve(import.meta.dirname, "src/section-index/index.tsx"),
    "sidebar/sidebar": path.resolve(import.meta.dirname, "src/sidebar/sidebar.ts"),
    "sidebar/index": path.resolve(import.meta.dirname, "src/sidebar/index.tsx"),
  },
  format: "esm",
  outDir: path.resolve(import.meta.dirname, "dist"),
  platform: "browser",
  report: false,
  tsconfig: path.resolve(import.meta.dirname, "tsconfig.json"),
});
