import solid from "@solidjs/vite-plugin";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    }),
    solid({ ssr: true }),
  ],
  ssr: { noExternal: ["@lenso/tokens", "@lenso/glass"] },
  optimizeDeps: { exclude: ["@ui-sdk/core"] },
});
