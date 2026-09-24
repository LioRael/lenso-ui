import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import type { AstroIntegration } from "astro";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { defineDocsConfig, trimSlashes, type DocsConfig } from "./config";

const configModule = "virtual:lenso-docs-config";
const metaModule = "virtual:lenso-docs-meta";

function findMetaFiles(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return findMetaFiles(path);
      return entry.isFile() && entry.name === "meta.ts" ? [path] : [];
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export function lensoDocs(input: DocsConfig): AstroIntegration[] {
  const options = defineDocsConfig(input);
  const base = trimSlashes(options.basePath ?? "");
  const prefix = base ? `/${base}` : "";

  const integration: AstroIntegration = {
    name: "@lenso/docs",
    hooks: {
      "astro:config:setup": ({ config, injectRoute, updateConfig }) => {
        const projectRoot = fileURLToPath(config.root);
        const contentRoot = join(projectRoot, "content", "docs");

        updateConfig({
          markdown: {
            shikiConfig: {
              themes: { light: "github-light", dark: "github-dark" },
            },
          },
          vite: {
            plugins: [
              {
                name: "lenso-docs-virtual-modules",
                resolveId(id) {
                  if (id === configModule || id === metaModule) return `\0${id}`;
                },
                load(id) {
                  if (id === `\0${configModule}`) {
                    return `export default ${JSON.stringify(options)};`;
                  }
                  if (id === `\0${metaModule}`) {
                    const files = findMetaFiles(contentRoot);
                    const imports = files.map(
                      (file, index) => `import meta${index} from ${JSON.stringify(file)};`,
                    );
                    const entries = files.map((file, index) => {
                      const directory = relative(contentRoot, file)
                        .replace(/\\/g, "/")
                        .replace(/\/?meta\.ts$/, "");
                      return `{ directory: ${JSON.stringify(directory)}, meta: meta${index} }`;
                    });
                    return `${imports.join("\n")}\nexport default [${entries.join(",")}];`;
                  }
                },
              },
            ],
          },
        });

        injectRoute({
          pattern: `${prefix}/[...slug]`,
          entrypoint: "@lenso/docs/routes/document.astro",
        });
        injectRoute({
          pattern: prefix || "/",
          entrypoint: "@lenso/docs/routes/landing.astro",
        });
        injectRoute({
          pattern: `${prefix}/search.json`,
          entrypoint: "@lenso/docs/routes/search.json.ts",
        });
        injectRoute({
          pattern: `${prefix}/sitemap.xml`,
          entrypoint: "@lenso/docs/routes/sitemap.xml.ts",
        });
        injectRoute({
          pattern: `${prefix}/llms.txt`,
          entrypoint: "@lenso/docs/routes/llms.txt.ts",
        });
      },
    },
  };

  return [mdx(), react(), integration];
}
