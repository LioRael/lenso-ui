import path from "node:path";
import { localPath, modulePath, routePath } from "./host.ts";
import type { HostPage, HostRedirect, HostRoute } from "./host.ts";
import type { DocsTreeNode } from "./content.ts";
import type { DocumentationSource } from "./source.ts";
import type { DocumentationLocale, ResolvedDocsConfig } from "./config.ts";

interface GeneratorHost {
  pages: readonly HostPage[];
  source: DocumentationSource<HostPage>;
  locales: DocumentationLocale[];
  defaultLocale: string;
  routes: (Omit<HostRoute, "locale"> & { locale: string })[];
  redirects: HostRedirect[];
  trees?: Record<string, DocsTreeNode[]> | undefined;
  searchRevision?: string;
}
type NavigationNode =
  | { type: "page"; name: string; url: string }
  | { type: "folder"; name: string; children: NavigationNode[]; index?: NavigationNode };

const json = (value: unknown): string =>
  JSON.stringify(value)!.replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028");

function importPath(file: string, target: string): string {
  const relative = path.relative(path.dirname(file), target).split(path.sep).join("/");
  return json(relative.startsWith(".") ? relative : `./${relative}`);
}

function customizationImport(file: string, target: string | undefined): string {
  return target
    ? `import * as customization from ${importPath(file, target)};`
    : "const customization = {};";
}

function treeNodes(nodes: readonly DocsTreeNode[], basePath: string): NavigationNode[] {
  return nodes.map((node) =>
    node.type === "page"
      ? { type: "page", name: node.title, url: node.url.slice(basePath.length) || "/" }
      : {
          type: "folder",
          name: node.title,
          children: treeNodes(node.children, basePath),
          ...(node.index ? { index: treeNodes([node.index], basePath)[0]! } : {}),
        },
  );
}

export async function generateHost(
  root: string,
  directory: string,
  config: ResolvedDocsConfig,
  host: GeneratorHost,
  {
    development,
    source,
    write,
  }: {
    development: boolean;
    source: string;
    write: (file: string, content: string) => Promise<void>;
  },
) {
  const customization = config.components
    ? await modulePath(root, config.components, /\.(?:[cm]?js|jsx|tsx|ts)$/u)
    : undefined;
  const rootCustomization = config.root
    ? await modulePath(root, config.root, /\.(?:[cm]?js|jsx|tsx|ts)$/u)
    : customization;
  const aliases: Record<string, string> = {};
  for (const [alias, relative] of Object.entries(config.aliases ?? {}))
    aliases[alias] = await localPath(root, relative, { directory: true });
  if (development)
    for (const entry of ["react", "client", "appearance"])
      aliases[`@lenso/docs/${entry}`] = path.join(source, `${entry}.ts`);
  const build = config.build ? await modulePath(root, config.build) : undefined;
  const viteConfig = path.join(directory, "vite.config.ts");
  const urls = [...host.pages.map((page) => page.url), ...host.routes.map((route) => route.path)];
  await write(
    viteConfig,
    `import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import stylex from "@stylexjs/unplugin/vite";
${build ? `import consumer from ${importPath(viteConfig, build)};` : "const consumer = {};"}
export default defineConfig(async (environment) => {
  const overrides = typeof consumer === "function" ? await consumer(environment) : consumer;
  return mergeConfig(overrides ?? {}, {
    root: ${json(directory)}, base: ${json(`${config.basePath}/`)},
    publicDir: ${json(path.join(directory, "public"))},
    cacheDir: ${json(path.join(directory, ".cache"))},
    server: { host: "127.0.0.1", port: 3000, strictPort: true, fs: { allow: [${json(root)}, ${json(path.resolve(source, ".."))}] } },
    resolve: { alias: ${json(aliases)}, dedupe: ["react", "react-dom", "fumadocs-core", "fumadocs-ui", "@tanstack/react-router"] },
    optimizeDeps: {
      noDiscovery: true,
      exclude: ["@lenso/docs", "@lenso/ui", "@lenso/tokens", "@lenso/glass", "@lenso/primitives"],
      include: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "@stylexjs/stylex", "@gravity-ui/icons", "culori", "@fuma-translate/react", "@lenso/ui > react-stately", "fumadocs-ui > next-themes",
        "fumadocs-ui/provider/tanstack", "fumadocs-ui/provider/base", "fumadocs-ui/contexts/search", "fumadocs-ui/contexts/i18n", "fumadocs-ui/contexts/tree", "fumadocs-ui/layouts/notebook/page", "fumadocs-ui/components/steps", "fumadocs-ui/utils/use-footer-items", "fumadocs-ui/components/toc", "fumadocs-ui/components/ui/collapsible", "fumadocs-ui/mdx", "fumadocs-core/framework", "fumadocs-core/framework/tanstack", "fumadocs-core/link", "fumadocs-core/toc", "fumadocs-core/search/client"],
    },
    ssr: { noExternal: [/^@lenso\\//, /^@ui-sdk\\//, "fumadocs-core", "fumadocs-ui"] },
    build: { target: "es2022" },
    environments: { client: { build: { outDir: "out" } } },
    plugins: [
      tanstackStart({
        router: { basepath: ${json(config.basePath || "/")} },
        prerender: { enabled: true, concurrency: 2, crawlLinks: false, autoStaticPathsDiscovery: false, autoSubfolderIndex: ${config.trailingSlash ?? true}, failOnError: true },
        pages: ${json([...urls.map((url) => ({ path: url })), { path: `${config.basePath}/404`, sitemap: { exclude: true }, prerender: { outputPath: "/404.html", autoSubfolderIndex: false } }])},
      }),
      stylex({ dev: environment.command === "serve", runtimeInjection: false, useCSSLayers: false, unstable_moduleResolution: { type: "commonJS" } }),
      react(),
    ],
  });
});
`,
  );
  await write(
    path.join(directory, "tsconfig.json"),
    json({
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        allowImportingTsExtensions: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        types: ["vite/client"],
        paths: Object.fromEntries(
          Object.entries(aliases).flatMap(([name, value]) => {
            const relative = path.relative(directory, value).split(path.sep).join("/");
            const target = relative.startsWith(".") ? relative : `./${relative}`;
            return name.startsWith("@lenso/docs/")
              ? [[name, [target]]]
              : [
                  [name, [target]],
                  [`${name}/*`, [`${target}/*`]],
                ];
          }),
        ),
      },
      include: [
        "src/**/*.ts",
        "src/**/*.tsx",
        "model.ts",
        "render.tsx",
        "vite.config.ts",
        "env.d.ts",
        "pages/**/*.tsx",
      ],
      exclude: ["node_modules"],
    }),
  );
  await write(path.join(directory, "env.d.ts"), 'declare module "virtual:stylex:runtime";\n');
  const trees: Record<string, unknown> = {};
  for (const locale of host.locales) {
    const children = host.trees?.[locale.code]
      ? treeNodes(host.trees[locale.code]!, config.basePath)
      : host.source.getNavigation(locale.code).map((node) => ({
          type: node.url ? "page" : "separator",
          name: node.title,
          ...(node.url ? { url: node.url.slice(config.basePath.length) || "/" } : {}),
        }));
    trees[locale.code] = { name: config.title, children };
  }
  for (const [index, page] of host.pages.entries()) {
    await write(path.join(directory, "documents", `${index}.md`), page.markdown);
    if (page.compiled !== undefined)
      await write(path.join(directory, "documents", `${index}.js`), page.compiled);
  }
  const pages = host.pages.map(
    ({
      compiled: _compiled,
      body: _body,
      searchText: _text,
      structuredData: _structure,
      markdown: _markdown,
      module: _module,
      ...page
    }) => page,
  );
  const languageAlternates = Object.fromEntries(
    host.pages.map((page) => [
      page.id,
      host.source.getAlternates(page).map(({ code, label, language, url }) => ({
        code,
        label,
        language,
        url,
      })),
    ]),
  );
  const alternates = Object.fromEntries(
    Object.entries(languageAlternates).map(([id, items]) => [
      id,
      Object.fromEntries(items.map(({ language, url }) => [language, url])),
    ]),
  );
  await write(
    path.join(directory, "model.ts"),
    `import type { ResolvedDocsConfig } from "@lenso/docs";
import type { DocumentationPageMetadata } from "@lenso/docs/source";
import type { DocumentationLocale } from "@lenso/docs/react";
import type { Root } from "fumadocs-core/page-tree";
export const config: ResolvedDocsConfig = ${json(config)};
export const pages: (DocumentationPageMetadata & { id: string; headings?: { title: string; id: string; depth: number }[] } & Record<string, unknown>)[] = ${json(pages)};
export const trees: Record<string, Root> = ${json(trees)};
export const alternates: Record<string, Record<string, string>> = ${json(alternates)};
export const languageAlternates: Record<string, (DocumentationLocale & { url: string })[]> = ${json(languageAlternates)};
export const searchRevision = ${json(host.searchRevision ?? "")};
`,
  );
  const hasBodies = host.pages.some((page) => page.compiled !== undefined);
  const render = path.join(directory, "render.tsx");
  await write(
    render,
    `import { config, pages, trees, searchRevision, languageAlternates } from "./model.ts";
import React from "react";
import { ${hasBodies ? "DocumentationPage" : "DocumentationPageLayout as DocumentationPage"} } from ${importPath(render, development ? path.join(source, hasBodies ? "view.tsx" : "page-layout.tsx") : path.join(source, "../dist/framework", hasBodies ? "view.js" : "page-layout.js"))};
${customizationImport(render, customization)}
type PageProps = Parameters<typeof DocumentationPage>[0];
export async function renderPage(id: string, markdown: string, documentModule: object = {}, Body?: PageProps["Body"]) {
  const page = { ...pages.find(page => page.id === id)!, markdown };
  const context = { config, page };
  const componentSource = Reflect.get(documentModule, "getComponents") !== undefined ||
    Reflect.get(documentModule, "default") !== undefined ? documentModule : customization;
  const getComponents = Reflect.get(componentSource, "getComponents");
  const customComponents = getComponents ? await getComponents(context) : Reflect.get(componentSource, "default");
  const siteSlots = await Reflect.get(customization as object, "getSiteSlots")?.(context);
  const siteOptions = await Reflect.get(customization as object, "getSiteOptions")?.(context);
  const pageOptions = await Reflect.get(customization as object, "getPageOptions")?.(context);
  const getDocument = Reflect.get(documentModule, "getDocument") ?? Reflect.get(customization as object, "getDocument");
  const document = await getDocument?.(context);
  if (!document && !Body) throw new Error('Documentation page "' + id + '" requires getDocument or a compiled Body.');
  return <DocumentationPage config={config} page={page as PageProps["page"]} tree={trees[page.locale]!}
    Body={Body} customComponents={customComponents} siteSlots={siteSlots} alternates={languageAlternates[page.id]}
    siteOptions={siteOptions} pageOptions={pageOptions} document={document} searchRevision={searchRevision} />;
}
`,
  );
  const rootFile = path.join(directory, "src/routes/__root.tsx");
  const styles: string[] = [];
  if ((config.stylesheet ?? "framework") === "framework")
    styles.push(path.join(source, "docs.css"));
  for (const relative of config.styles ?? []) styles.push(await localPath(root, relative));
  await write(
    rootFile,
    `import React, { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts, Link, useRouterState } from "@tanstack/react-router";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { DocumentationRoot } from ${importPath(rootFile, development ? path.join(source, "root.tsx") : path.join(source, "../dist/framework/root.js"))};
import { getDocumentationMessages } from ${importPath(rootFile, development ? path.join(source, "language.ts") : path.join(source, "../dist/framework/language.js"))};
import type { DocumentationRootOptions } from "@lenso/docs/react";
import { config } from "../../model.ts";
import fumaCSS from "fumadocs-ui/style.css?url";
${styles.map((target, index) => `import css${index} from ${importPath(rootFile, target + "?url")};`).join("\n")}
${customizationImport(rootFile, rootCustomization)}
const locales = ${json(host.locales)};
const rootOptions = Object.fromEntries(await Promise.all(locales.map(async locale => [locale.code,
  await Reflect.get(customization as object, "getRootOptions")?.({ config, locale }) as DocumentationRootOptions | undefined])));
function Providers({ children }: { children: React.ReactNode }) {
  return <RootProvider search={{ enabled: false }} theme={{ defaultTheme: "system", enableSystem: true }}>{children}</RootProvider>;
}
function DevStyleX() {
  useEffect(() => { if (import.meta.env.DEV) void import("virtual:stylex:runtime"); }, []);
  return import.meta.env.DEV ? <link rel="stylesheet" href={(config.basePath ?? "") + "/virtual:stylex.css"} /> : null;
}
export const Route = createRootRoute({
  head: ({ matches }) => {
    const metadata = rootOptions[getLocale(matches.at(-1)?.pathname ?? "/").code]?.metadata ?? {};
    const customMeta = Object.entries(metadata).flatMap(([name, content]) => typeof content === "string"
      ? [name === "title" ? { title: content } : { name: name === "applicationName" ? "application-name" : name, content }] : []);
    return { meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { title: config.title }, { name: "description", content: config.description }, ...customMeta],
      links: [{ rel: "stylesheet", href: fumaCSS }, ${styles.map((_, index) => `{ rel: "stylesheet", href: css${index} }`).join(", ")}] };
  },
  component: Root,
  notFoundComponent: NotFound,
});
export function NotFound() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const locale = getLocale(pathname);
  const messages = getDocumentationMessages(locale.language);
  return <main id="main-content" className="lenso-not-found"><h1>{messages.notFound}</h1><p>{messages.notFoundDescription}</p><Link to={locale.routePrefix || "/"}>{messages.backTo(config.title)}</Link></main>;
}
function getLocale(pathname: string) {
  // TanStack location and match paths already exclude the deployment prefix.
  return [...locales].sort((a, b) => b.routePrefix.length - a.routePrefix.length).find(locale => {
    const prefix = locale.routePrefix.replace(/\\/$/, "");
    return !prefix || pathname === prefix || pathname.startsWith(prefix + "/");
  }) ?? locales.find(locale => locale.code === ${json(host.defaultLocale)})!;
}
function Root() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const locale = getLocale(pathname);
  const options = rootOptions[locale.code];
  return <DocumentationRoot config={config} locale={locale} options={{ ...options, Providers: options?.Providers ?? Providers }} head={<><HeadContent /><DevStyleX /></>} scripts={<Scripts />}><Outlet /></DocumentationRoot>;
}
`,
  );
  await write(
    path.join(directory, "src/router.tsx"),
    `import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
  return createRouter({ routeTree, basepath: ${json(config.basePath || "/")}, trailingSlash: ${json(config.trailingSlash === false ? "never" : "always")}, scrollRestoration: true, defaultPreload: "intent" });
}
`,
  );
  function routeFile(url: string): { file: string; route: string } {
    const route = routePath(url, config.basePath);
    // Route tokens are escaped so authored dots, underscores and dollar signs stay literal.
    const segments = route
      .slice(1)
      .split("/")
      .filter(Boolean)
      .map((segment) => `[${segment}]`);
    return {
      file: path.join(
        directory,
        "src/routes",
        segments.length ? `${segments.join(".")}.tsx` : "index.tsx",
      ),
      route,
    };
  }
  for (const [index, page] of host.pages.entries()) {
    const { file, route } = routeFile(page.url);
    const component = path.join(directory, "pages", `${index}.tsx`);
    await write(
      component,
      `import React from "react";
${page.compiled !== undefined ? `import Body from ${importPath(component, path.join(directory, "documents", `${index}.js`))};` : ""}
import markdown from ${importPath(component, path.join(directory, "documents", `${index}.md?raw`))};
${page.module ? `import * as documentModule from ${importPath(component, page.module)};` : ""}
import { renderPage } from "../render.tsx";
const content = await renderPage(${json(page.id)}, markdown, ${page.module ? "documentModule" : "undefined"}${page.compiled !== undefined ? ", Body" : ""});
export default function Page() { return content; }
`,
    );
    await write(
      file,
      `import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
const Page = lazyRouteComponent(() => import(${importPath(file, component)}));
export const Route = createFileRoute(${json(route)})({
  codeSplitGroupings: [["loader", "component"]],
  loader: async () => { await Page.preload?.(); },
  head: () => ({ meta: [{ title: ${json(`${page.title} · ${config.title}`)} }, { name: "description", content: ${json(page.description ?? "")} }],
    links: ${json(config.siteUrl ? [{ rel: "canonical", href: new URL(page.url, config.siteUrl).href }, ...Object.entries(alternates[page.id]!).map(([hrefLang, url]) => ({ rel: "alternate", hrefLang, href: new URL(url, config.siteUrl).href }))] : [])} }),
  component: Page,
});
`,
    );
  }
  for (const route of host.routes) {
    const target = routeFile(route.path);
    await write(
      target.file,
      `import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomPage from ${importPath(target.file, route.module)};
export const Route = createFileRoute(${json(target.route)})({ head: () => ({ meta: [{ title: ${json(route.metadata?.["title"] ?? config.title)} }] }), component: Page });
function Page() { return <CustomPage {...${json(route.props ?? {})}} />; }
`,
    );
  }
  for (const redirect of host.redirects) {
    const target = routeFile(redirect.from);
    await write(
      target.file,
      `import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute(${json(target.route)})({ beforeLoad: () => { throw redirect({ href: ${json(redirect.to)}, statusCode: ${redirect.permanent ? 301 : 302} }); } });
`,
    );
  }
  const notFound = { file: path.join(directory, "src/routes/404.tsx"), route: "/404" };
  await write(
    notFound.file,
    `import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "./__root";
export const Route = createFileRoute(${json(notFound.route)})({ component: NotFound });
`,
  );
}
