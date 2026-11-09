import path from "node:path";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import story from "@fumadocs/story/vite";
import stylex from "@stylexjs/unplugin/vite";
import { workspaceAliases } from "./scripts/workspace-aliases.ts";
import { sourceImports } from "./scripts/source-imports.ts";
const site = process.env["LENSO_DOCS_SITE"] ?? "http://localhost:3000";
export default defineConfig(({ command }) => {
  const development = command === "serve";
  const cache = path.resolve(import.meta.dirname, ".cache", `${command}-${process.pid}`);
  // Read build inputs without registering them as Vite config dependencies.
  const index: { pages: { locale: string; slug: string }[] } = JSON.parse(
    readFileSync(new URL("./src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
  );
  const pages = development
    ? []
    : [
        ...index.pages.map((page) => ({ path: `/${page.locale}/docs/${page.slug}` })),
        {
          path: "/404",
          sitemap: { exclude: true },
          prerender: { outputPath: "/404.html", autoSubfolderIndex: false },
        },
        { path: "/" },
        { path: "/en", sitemap: { exclude: true } },
        { path: "/cn" },
        { path: "/en/photos" },
        { path: "/cn/photos" },
        { path: "/en/glass-lab" },
        { path: "/cn/glass-lab" },
        { path: "/en/list-lab" },
        { path: "/cn/list-lab" },
      ];
  return {
    cacheDir: path.join(cache, "vite"),
    define: {
      "import.meta.env.LENSO_DOCS_SITE": JSON.stringify(site),
    },
    server: {
      host: "127.0.0.1",
      port: 3000,
      strictPort: true,
      watch: { ignored: ["**/out/**", "**/dist/**", "**/.cache/**", "**/.tanstack/**"] },
    },
    resolve: {
      alias: [
        ...(development ? workspaceAliases(import.meta.dirname) : []),
        { find: "@", replacement: path.resolve(import.meta.dirname, "src") },
        {
          find: /^@fumadocs\/story$/,
          replacement: path.join(
            path.dirname(require.resolve("@fumadocs/story/package.json")),
            "dist/index.browser.js",
          ),
        },
      ],
      dedupe: ["react", "react-dom", "fumadocs-core", "fumadocs-ui", "@tanstack/react-router"],
    },
    optimizeDeps: {
      noDiscovery: true,
      include: [
        "react",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@base-ui/react/*",
        "@internationalized/date",
        "react-stately/*",
        "@lenso/ui > react-stately",
        "@base-ui/react",
        "@stylexjs/stylex",
        "culori",
        "next-themes",
        "shiki",
        "nuqs/server",
        "@iconify/react",
        "m3-ripple",
        "fumadocs-ui/provider/tanstack",
        "fumadocs-ui/provider/base",
        "fumadocs-ui/contexts/search",
        "fumadocs-ui/contexts/i18n",
        "fumadocs-ui/contexts/tree",
        "fumadocs-ui/layouts/notebook/page",
        "fumadocs-ui/components/toc",
        "fumadocs-ui/components/ui/collapsible",
        "fumadocs-ui/mdx",
        "fumadocs-core/framework",
        "fumadocs-core/framework/tanstack",
        "fumadocs-core/link",
        "fumadocs-core/toc",
        "@fumadocs/story",
        "@fumadocs/story/vite/client",
        "@fumari/stf",
        "nuqs",
        "nuqs/adapters/tanstack-router",
      ],
    },
    ssr: {
      noExternal: [
        /^@lenso\//,
        /^@base-ui\//,
        "fumadocs-core",
        "fumadocs-ui",
        "@fumadocs/story",
        "@fumari/stf",
      ],
    },
    environments: {
      client: {
        build: {
          outDir: "out",
          rolldownOptions: {
            output: {
              codeSplitting: {
                groups: [
                  {
                    name: "react-runtime",
                    test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
                    priority: 20,
                  },
                  {
                    name: "router-runtime",
                    test: /node_modules[\\/]@tanstack[\\/](?:history|router-core|react-router|react-store|store)[\\/]/,
                    priority: 10,
                  },
                  {
                    name: "control-runtime",
                    test: /node_modules[\\/](?:@base-ui[\\/](?:utils[\\/]|react[\\/](?:esm[\\/])?(?:utils|internals|store|floating-ui-react)[\\/])|@floating-ui[\\/])/,
                  },
                ],
              },
            },
          },
        },
      },
    },
    plugins: [
      sourceImports({
        "@gravity-ui/icons": path.join(
          path.dirname(require.resolve("@gravity-ui/icons/package.json")),
          "esm/index.js",
        ),
        "@lenso/ui": path.resolve(import.meta.dirname, "../../packages/ui/src/index.ts"),
        "@lenso/docs/client": path.resolve(
          import.meta.dirname,
          "../../packages/docs/src/client.ts",
        ),
        "@lenso/docs/react": path.resolve(import.meta.dirname, "../../packages/docs/src/react.ts"),
      }),
      fumadocsMdx({ outDir: path.join(cache, "mdx") }),
      tanstackStart({
        sitemap: { enabled: true, host: site, outputPath: "sitemap.xml" },
        prerender: { enabled: true, concurrency: 2, crawlLinks: false, autoSubfolderIndex: true },
        pages,
      }),
      story({
        tsconfigPath: path.resolve(
          import.meta.dirname,
          development ? "tsconfig.story.json" : "tsconfig.json",
        ),
      }),
      stylex({
        dev: development,
        runtimeInjection: false,
        useCSSLayers: false,
        unstable_moduleResolution: { type: "commonJS" },
      }),
      react(),
    ],
  };
});
