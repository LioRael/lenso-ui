import preserveWatchOutput from "../../scripts/preserve-watch-output.js";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.test-styles.ts", "!src/**/generate-*.ts"],
  root: "src",
  unbundle: true,
  deps: { neverBundle: ["@stylexjs/stylex"] },
  outDir: "dist",
  format: "esm",
  outExtensions: () => ({ js: ".js" }),
  dts: false,
  plugins: [preserveWatchOutput()],
  clean: true,
});
