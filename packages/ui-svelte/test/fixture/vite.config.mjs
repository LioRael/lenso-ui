import { svelte } from "@sveltejs/vite-plugin-svelte";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    }),
    svelte(),
  ],
  ssr: { noExternal: ["@lenso/ui-svelte", "@lenso/tokens", "@lenso/glass", "@ui-sdk/svelte"] },
  optimizeDeps: { exclude: ["@lenso/ui-svelte", "@lenso/tokens", "@lenso/glass", "@ui-sdk/core"] },
});
