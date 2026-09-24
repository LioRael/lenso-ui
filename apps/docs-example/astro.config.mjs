import { defineConfig } from "astro/config";
import { lensoDocs, defineDocsConfig } from "@lenso/docs";

export default defineConfig({
  site: "http://localhost:4321",
  integrations: lensoDocs(
    defineDocsConfig({
      title: "Lenso UI",
      description: "The Lenso UI component and design documentation.",
      basePath: process.env.LENSO_DOCS_BASE_PATH ?? "",
      tabs: [
        { label: "Start", path: "start" },
        { label: "Components", path: "components" },
      ],
    }),
  ),
});
