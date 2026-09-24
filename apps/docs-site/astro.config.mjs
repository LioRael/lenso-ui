import { defineConfig } from "astro/config";
import { lensoDocs, defineDocsConfig } from "@lenso/docs";
import stylex from "@stylexjs/unplugin/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  site: process.env.LENSO_DOCS_SITE ?? "https://ui.lenso.dev",
  vite: {
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    plugins: [stylex({ devMode: "full", useCSSLayers: true })],
  },
  integrations: lensoDocs(
    defineDocsConfig({
      title: "Lenso UI",
      description: "The Lenso UI component and design documentation.",
      basePath: process.env.LENSO_DOCS_BASE_PATH ?? "",
      tabs: [
        { label: "Start", path: "start" },
        { label: "Foundations", path: "foundations" },
        { label: "Components", path: "components" },
        { label: "Primitives", path: "primitives" },
        { label: "Patterns", path: "patterns" },
        { label: "Templates", path: "templates" },
        { label: "Guides", path: "guides" },
      ],
    }),
  ),
});
