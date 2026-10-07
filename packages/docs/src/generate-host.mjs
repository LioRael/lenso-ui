import path from "node:path";
import { localPath, modulePath, routePath } from "./host.mjs";

const json = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028");

function treeNodes(nodes, basePath) {
  return nodes.map((node) =>
    node.type === "page"
      ? { type: "page", name: node.title, url: node.url.slice(basePath.length) || "/" }
      : {
          type: "folder",
          name: node.title,
          children: treeNodes(node.children, basePath),
          ...(node.index ? { index: treeNodes([node.index], basePath)[0] } : {}),
        },
  );
}

export async function generateHost(root, directory, config, host, { development, source, write }) {
  const customization = config.components
    ? `import * as customization from ${json(await modulePath(root, config.components, /\.(?:[cm]?js|jsx|tsx|ts)$/u))};`
    : "const customization = {};";
  const rootCustomization = config.root
    ? `import * as customization from ${json(await modulePath(root, config.root, /\.(?:[cm]?js|jsx|tsx|ts)$/u))};`
    : customization;
  const aliases = {};
  for (const [alias, relative] of Object.entries(config.aliases ?? {}))
    aliases[alias] = await localPath(root, relative, { directory: true });
  const build = config.build ? await modulePath(root, config.build) : undefined;
  const protectedConfig = {
    output: development ? undefined : "export",
    distDir: ".next",
    basePath: config.basePath,
    trailingSlash: config.trailingSlash ?? true,
  };
  await write(
    path.join(directory, "next.config.mjs"),
    `
${build ? `import build from ${json(build)};` : "const build = {};"}
export default async function configuration(phase, context) {
  const consumer = (typeof build === "function" ? await build(phase, context) : build) ?? {};
  return {
    ...consumer,
    ...${json(protectedConfig)},
    output: ${development ? "undefined" : '"export"'},
    images: { ...consumer.images, unoptimized: true },
    reactStrictMode: true,
    transpilePackages: [...new Set(["@lenso/docs", ...(consumer.transpilePackages ?? [])])],
    experimental: { ...consumer.experimental, externalDir: true, globalNotFound: true },
    webpack(config, context) {
      const result = consumer.webpack ? consumer.webpack(config, context) ?? config : config;
      result.resolve ??= {};
      result.resolve.alias = { ...result.resolve.alias, ...${json(aliases)} };
      return result;
    }
  };
}\n`,
  );
  await write(
    path.join(directory, "tsconfig.json"),
    json({
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: Object.fromEntries(
          Object.entries(aliases).flatMap(([name, value]) => [
            [name, [value]],
            [`${name}/*`, [`${value}/*`]],
          ]),
        ),
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }),
  );
  const trees = {};
  for (const locale of host.locales) {
    const children = host.trees?.[locale.code]
      ? treeNodes(host.trees[locale.code], config.basePath)
      : host.source.getNavigation(locale.code).map((node) => ({
          type: node.url ? "page" : "separator",
          name: node.title,
          ...(node.url ? { url: node.url.slice(config.basePath.length) || "/" } : {}),
        }));
    trees[locale.code] = { name: config.title, children };
  }
  const imports = [];
  const bodies = [];
  for (const [index, page] of host.pages.entries()) {
    await write(path.join(directory, "pages", `${index}.md`), page.markdown);
    if (page.compiled !== undefined) {
      await write(path.join(directory, "pages", `${index}.mjs`), page.compiled);
      imports.push(`import page${index} from "./pages/${index}.mjs";`);
      bodies.push(`${json(page.id)}:page${index}`);
    }
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
  const alternates = Object.fromEntries(
    host.pages.map((page) => [
      page.id,
      Object.fromEntries(
        host.source.getAlternates(page).map((locale) => [locale.language, locale.url]),
      ),
    ]),
  );
  await write(
    path.join(directory, "model.mjs"),
    `${imports.join("\n")}
export const config = ${json(config)};
export const pages = ${json(pages)};
export const trees = ${json(trees)};
export const alternates = ${json(alternates)};
export const bodies = {${bodies.join(",")}};
`,
  );
  await write(
    path.join(directory, "render.jsx"),
    `
import { config, pages, trees, bodies, alternates } from "./model.mjs";
import { readFile } from "node:fs/promises";
import React from "react";
import { DocumentationPage } from ${json(path.join(source, "view.tsx"))};
${customization}
export function pageMetadata(id) {
  const page = pages.find(page => page.id === id);
  return { title: page.title, description: page.description,
    ...(config.siteUrl ? { alternates: { canonical: page.url, languages: alternates[id] } } : {}) };
}
export async function renderPage(id, documentModule = {}) {
  const index = pages.findIndex(page => page.id === id);
  const page = { ...pages[index], markdown: await readFile(${json(path.join(directory, "pages"))} + "/" + index + ".md", "utf8") };
  const context = { config, page };
  const componentSource = Reflect.get(documentModule, "getComponents") !== undefined ||
    Reflect.get(documentModule, "default") !== undefined ? documentModule : customization;
  const getComponents = Reflect.get(componentSource, "getComponents");
  const customComponents = getComponents
    ? await getComponents(context) : Reflect.get(componentSource, "default");
  const siteSlots = await Reflect.get(customization, "getSiteSlots")?.(context);
  const siteOptions = await Reflect.get(customization, "getSiteOptions")?.(context);
  const pageOptions = await Reflect.get(customization, "getPageOptions")?.(context);
  const getDocument = Reflect.get(documentModule, "getDocument") ?? Reflect.get(customization, "getDocument");
  const document = await getDocument?.(context);
  if (!document && !bodies[id])
    throw new Error('Documentation page "' + id + '" requires getDocument to return a document result or a compiled Body.');
  return <DocumentationPage config={config} page={page} tree={trees[page.locale]}
    Body={bodies[id]} customComponents={customComponents} siteSlots={siteSlots}
    siteOptions={siteOptions} pageOptions={pageOptions} document={document} />;
}
`,
  );
  const css = ['import "fumadocs-ui/style.css";'];
  if ((config.stylesheet ?? "framework") === "framework")
    css.push(
      `import ${json(path.join(source, "../dist/assets/stylex.css"))};`,
      `import ${json(path.join(source, "docs.css"))};`,
    );
  for (const relative of config.styles ?? [])
    css.push(`import ${json(await localPath(root, relative))};`);
  const groups = new Map(host.locales.map((locale, index) => [locale.code, `(locale-${index})`]));
  const active = new Set([
    ...host.pages.map((page) => page.locale),
    ...host.routes.map((route) => route.locale),
  ]);
  if (host.redirects.length) active.add(host.defaultLocale);
  for (const locale of host.locales.filter((locale) => active.has(locale.code))) {
    await write(
      path.join(directory, "app", groups.get(locale.code), "layout.jsx"),
      `
${css.join("\n")}
import { DocumentationRoot } from ${json(path.join(source, "root.tsx"))};
import { config } from "../../model.mjs";
${rootCustomization}
const locale = ${json(locale)};
const options = await Reflect.get(customization, "getRootOptions")?.({ config, locale });
export const metadata = {
  title: { default: config.title, template: "%s · " + config.title },
  description: config.description,
  ...(config.siteUrl ? { metadataBase: new URL(config.siteUrl) } : {}),
  ...options?.metadata
};
export default function Layout({ children }) {
  return <DocumentationRoot config={config} locale={locale} options={options}>{children}</DocumentationRoot>;
}
`,
    );
  }
  function pageFile(url, locale) {
    return path.join(
      directory,
      "app",
      groups.get(locale),
      routePath(url, config.basePath),
      "page.jsx",
    );
  }
  for (const page of host.pages) {
    const file = pageFile(page.url, page.locale);
    const relative = path
      .relative(path.dirname(file), path.join(directory, "render.jsx"))
      .split(path.sep)
      .join("/");
    await write(
      file,
      `${page.module ? `import * as documentModule from ${json(page.module)};\n` : ""}import { renderPage, pageMetadata } from ${json(relative.startsWith(".") ? relative : `./${relative}`)};
export function generateMetadata() { return pageMetadata(${json(page.id)}); }
export default function Page() { return renderPage(${json(page.id)}${page.module ? ", documentModule" : ""}); }\n`,
    );
  }
  for (const route of host.routes) {
    await write(
      pageFile(route.path, route.locale),
      `import CustomPage from ${json(route.module)};
export const metadata = ${json(route.metadata)};
export default function Page() { return <CustomPage {...${json(route.props)}} />; }\n`,
    );
  }
  for (const redirect of host.redirects) {
    const action = redirect.permanent ? "permanentRedirect" : "redirect";
    await write(
      pageFile(redirect.from, host.defaultLocale),
      `import { ${action} } from "next/navigation";
export default function Page() { ${action}(${json(redirect.to)}); }\n`,
    );
  }
  await write(
    path.join(directory, "app", "global-not-found.jsx"),
    `
import Link from "next/link";
import { config } from "../model.mjs";
export default function NotFound() {
  return <html lang=${json(host.locales.find((locale) => locale.code === host.defaultLocale).language)}>
    <body><main className="lenso-not-found"><h1>Page not found</h1>
    <p>This page does not exist.</p><Link href="/">Back to {config.title}</Link></main></body>
  </html>;
}\n`,
  );
}
