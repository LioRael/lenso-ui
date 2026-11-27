import stylex from "@stylexjs/unplugin";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue(),
    stylex.vite({
      runtimeInjection: false,
      useCSSLayers: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    }),
  ],
  ssr: { noExternal: ["@lenso/ui-vue", "@lenso/tokens", "@lenso/glass"] },
});
