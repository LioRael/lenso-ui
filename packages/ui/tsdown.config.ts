import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import preserveWatchOutput from "../../scripts/preserve-watch-output.js";
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
    agent: "src/agent.ts",
    "hooks/index": "src/hooks/index.ts",
    "icons/index": "src/icons/index.tsx",
    // Workspace Docs uses this private entry; it is not a package export.
    "utils/materials/render": "src/utils/materials/render.tsx",
    ...entry,
  },
  deps: {
    neverBundle: [
      "@ui-sdk/core",
      "@ui-sdk/react",
      "@lenso/glass",
      "@lenso/primitives",
      "@lenso/tokens",
      "react",
      "react-dom",
      "react-stately",
      "@internationalized/date",
    ],
  },
  dts: false,
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  outDir: "dist",
  platform: "browser",
  plugins: [preserveWatchOutput()],
});
