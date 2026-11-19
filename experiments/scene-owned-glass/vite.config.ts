import { defineConfig } from "vite";
import stylex from "@stylexjs/unplugin/vite";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../packages/primitives/package.json", import.meta.url));

export default defineConfig({
  root: import.meta.dirname,
  plugins: [stylex({ dev: true })],
  resolve: { alias: { "@ui-sdk/core": require.resolve("@ui-sdk/core") } },
  server: { host: "0.0.0.0", port: 4325, strictPort: true, allowedHosts: true },
});
