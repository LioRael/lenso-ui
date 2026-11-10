import { cp, mkdir, readFile, readdir, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";
import { parseMarkdown } from "./markdown.ts";
import { walk, type DocumentNode, type Heading } from "./content.ts";
import { compileBodies } from "./body.ts";
import { highlightDocuments } from "./highlight.ts";
import { searchScopes, writeDataEntry, type PageData } from "./search.ts";
import { pageSeo, decoratePageHtml, writeSeo } from "./seo.ts";
import { frontmatter, pageMetadata, type PageMetadata } from "./metadata.ts";
import { preparePageHtml } from "./delivery.ts";
import {
  choices,
  defaultLabels,
  pageScope,
  parseVariants,
  sameScope,
  searchIndexUrl,
  type Scope,
  type VariantConfig,
} from "./variants.ts";

export type Page = PageMetadata & Scope & { path: string; source: string; component?: string };
export type RootExtension = {
  source: string;
  data?: string;
  imports: { source: string; names: string[] }[];
};
export type DocsConfig = VariantConfig & {
  name: string;
  pages: Page[];
  layout?: { source: string; component: string };
  root?: RootExtension;
  components: Record<string, { source: string; component: string }>;
  origin?: string;
};
export type Document = Page & {
  title: string;
  headings: Heading[];
  text: string;
  body?: DocumentNode[];
  links: string[];
  markdown?: string;
};
export type Site = { root: string; config: DocsConfig; documents: Document[] };
const framework = path.resolve(import.meta.dirname, "..");
const quote = JSON.stringify;
const constructor = (name: string, item: object) =>
  `${name}(${Object.entries(item)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(", ")})`;
const records = (name: string, items: object[]) =>
  `[${items.map((item) => constructor(name, item)).join(", ")}]`;
export const markdownUrl = (doc: Document) =>
  doc.markdown === undefined ? "" : `/_docs/markdown${doc.path === "/" ? "" : doc.path}/index.md`;

export function navigationGroups(documents: Document[]) {
  const groups: { id: string; title: string; items: { title: string; href: string }[] }[] = [];
  for (const doc of documents.filter((page) => page.nav !== false)) {
    const title = doc.group ?? "";
    let group = groups.at(-1);
    if (!group || group.title !== title) {
      group = { id: String(groups.length), title, items: [] };
      groups.push(group);
    }
    group.items.push({ title: doc.title, href: doc.path });
  }
  return groups;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function component(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z][A-Za-z0-9]*$/.test(value);
}
function sourcePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value !== "" &&
    !path.isAbsolute(value) &&
    !value.split(/[\\/]/).includes("..")
  );
}
export function parseConfig(value: unknown): DocsConfig {
  if (
    !record(value) ||
    typeof value["name"] !== "string" ||
    !value["name"].trim() ||
    !Array.isArray(value["pages"]) ||
    !value["pages"].length
  )
    throw new Error("docs.json requires a name and a nonempty pages array");
  const paths = new Set<string>();
  const variants = parseVariants(value);
  const identities = new Set<string>();
  const components: DocsConfig["components"] = {};
  if (value["components"] !== undefined) {
    if (!record(value["components"]))
      throw new Error("components must be a name-to-module mapping");
    for (const [name, entry] of Object.entries(value["components"])) {
      if (
        !component(name) ||
        !record(entry) ||
        !sourcePath(entry["source"]) ||
        !entry["source"].endsWith(".contract") ||
        (entry["component"] !== undefined && !component(entry["component"]))
      )
        throw new Error(`Invalid component registration: ${name}`);
      components[name] = {
        source: entry["source"],
        component: typeof entry["component"] === "string" ? entry["component"] : name,
      };
    }
  }
  let origin: string | undefined;
  if (value["origin"] !== undefined) {
    if (typeof value["origin"] !== "string")
      throw new Error("origin must be an absolute HTTP(S) origin");
    const url = new URL(value["origin"]);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    )
      throw new Error("origin must be an absolute HTTP(S) origin without a path or credentials");
    origin = url.origin;
  }
  const pages = value["pages"].map((page: unknown): Page => {
    if (
      !record(page) ||
      typeof page["path"] !== "string" ||
      !/^\/(?:[\p{L}\p{N}_-]+\/)*[\p{L}\p{N}_-]*$/u.test(page["path"]) ||
      (page["path"] !== "/" && page["path"].endsWith("/")) ||
      !sourcePath(page["source"])
    )
      throw new Error("Each page requires a literal URL path and relative source");
    const extension = path.extname(page["source"]);
    if (extension !== ".md" && extension !== ".contract")
      throw new Error(`Unsupported page: ${page["source"]}`);
    if (extension === ".contract" && !component(page["component"]))
      throw new Error(`Exact page requires a component name: ${page["source"]}`);
    const metadata = pageMetadata(page);
    if (paths.has(page["path"])) throw new Error(`Duplicate route: ${page["path"]}`);
    const scope = pageScope(page, variants);
    const identity = JSON.stringify([scope.id, scope.locale, scope.version]);
    if (identities.has(identity)) throw new Error(`Duplicate page variant: ${identity}`);
    identities.add(identity);
    if (extension === ".contract" && !metadata.title)
      throw new Error(`Exact page requires a title: ${page["source"]}`);
    paths.add(page["path"]);
    return {
      path: page["path"],
      ...metadata,
      ...scope,
      source: page["source"],
      ...(extension === ".contract" ? { component: String(page["component"]) } : {}),
    };
  });
  let layout: DocsConfig["layout"];
  if (value["layout"] !== undefined) {
    const candidate = value["layout"];
    if (
      !record(candidate) ||
      !sourcePath(candidate["source"]) ||
      !candidate["source"].endsWith(".contract") ||
      !component(candidate["component"])
    )
      throw new Error("layout requires a .contract source and component name");
    layout = { source: candidate["source"], component: candidate["component"] };
  }
  let root: RootExtension | undefined;
  if (value["root"] !== undefined) {
    const candidate = value["root"];
    if (
      !record(candidate) ||
      !sourcePath(candidate["source"]) ||
      !candidate["source"].endsWith(".contract") ||
      (candidate["data"] !== undefined &&
        (!sourcePath(candidate["data"]) || !candidate["data"].endsWith(".ts")))
    )
      throw new Error("root requires a .contract member source and an optional .ts data module");
    const uses = candidate["imports"] ?? [];
    if (!Array.isArray(uses)) throw new Error("root.imports must be an array");
    const imports = uses.map((use: unknown) => {
      if (
        !record(use) ||
        !sourcePath(use["source"]) ||
        !use["source"].endsWith(".contract") ||
        !Array.isArray(use["names"]) ||
        !use["names"].length ||
        !use["names"].every(
          (name: unknown) => typeof name === "string" && /^[A-Za-z][A-Za-z0-9_]*$/.test(name),
        )
      )
        throw new Error("Each root import requires a .contract source and identifier names");
      return { source: use["source"], names: use["names"].map(String) };
    });
    root = {
      source: candidate["source"],
      ...(typeof candidate["data"] === "string" ? { data: candidate["data"] } : {}),
      imports,
    };
  }
  return {
    ...variants,
    components,
    ...(origin ? { origin } : {}),
    name: value["name"],
    pages,
    ...(layout ? { layout } : {}),
    ...(root ? { root } : {}),
  };
}

async function localFile(root: string, source: string) {
  const file = await realpath(path.resolve(root, source));
  if (!file.startsWith(`${root}${path.sep}`)) throw new Error(`Source escapes project: ${source}`);
  return file;
}

export async function loadSite(directory: string): Promise<Site> {
  const root = await realpath(directory);
  const config = parseConfig(JSON.parse(await readFile(path.join(root, "docs.json"), "utf8")));
  if (config.layout) await localFile(root, config.layout.source);
  for (const registration of Object.values(config.components))
    await localFile(root, registration.source);
  if (config.root) {
    for (const source of [
      config.root.source,
      ...(config.root.data ? [config.root.data] : []),
      ...config.root.imports.map((use) => use.source),
    ])
      await localFile(root, source);
  }
  const documents: Document[] = [];
  for (const page of config.pages) {
    const source = await readFile(await localFile(root, page.source), "utf8");
    if (page.component) {
      documents.push({
        ...page,
        title: page.title!,
        headings: [],
        text: `${page.title} ${page.description ?? ""}`,
        links: [],
      });
      continue;
    }
    const { body, metadata } = frontmatter(source);
    const compiled = parseMarkdown(body, (href) => {
      if (href.startsWith("#") || href.startsWith("?")) return page.path + href;
      if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return href;
      const separator = href.search(/[?#]/);
      const file = separator < 0 ? href : href.slice(0, separator);
      const suffix = separator < 0 ? "" : href.slice(separator);
      const sourcePath = path.posix.normalize(
        path.posix.join(path.posix.dirname(page.source), file),
      );
      const targets = config.pages.filter(
        (candidate) =>
          sameScope(candidate, page) && path.posix.normalize(candidate.source) === sourcePath,
      );
      if (targets.length !== 1)
        throw new Error(
          `${page.source}: ${targets.length ? "ambiguous" : "unregistered"} relative page ${href} in ${page.locale}/${page.version}`,
        );
      return targets[0]!.path + suffix;
    });
    for (const node of walk(compiled.nodes))
      if (node.kind === "component" && !config.components[node.name])
        throw new Error(`${page.source}: unregistered component ${node.name}`);
    const title =
      page.title ??
      metadata.title ??
      compiled.headings.find((heading) => heading.level === 1)?.title ??
      page.path;
    documents.push({
      ...metadata,
      ...page,
      title,
      headings: compiled.headings,
      links: compiled.links,
      body: compiled.nodes,
      text: `${title} ${page.description ?? metadata.description ?? ""} ${compiled.text}`,
      markdown: source,
    });
  }
  for (const doc of documents)
    for (const href of doc.links) {
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      if (href.startsWith("//")) continue;
      const url = new URL(href, `https://docs.invalid${doc.path}`);
      const target = documents.find((item) => item.path === decodeURI(url.pathname));
      if (!target) throw new Error(`${doc.source}: broken link ${href}`);
      if (
        url.hash &&
        !target.component &&
        !target.headings.some((heading) => heading.id === decodeURIComponent(url.hash.slice(1)))
      )
        throw new Error(`${doc.source}: missing heading ${href}`);
    }
  return { root, config, documents };
}

/** Produces an ordinary Exact app; consumers can replace the layout, not the compiler. */
export type DocsPlatform = "web" | "macos" | "ios";

export async function generateApp(site: Site, platform: DocsPlatform = "web") {
  const app = path.join(site.root, ".exact-docs", platform === "web" ? "app" : `app-${platform}`);
  await rm(app, { recursive: true, force: true });
  await mkdir(app, { recursive: true });
  for (const entry of await readdir(site.root)) {
    if (entry.startsWith(".") || ["node_modules", "dist", "target"].includes(entry)) continue;
    await cp(path.join(site.root, entry), path.join(app, "site", entry), {
      recursive: true,
      filter: (source) =>
        !path
          .relative(site.root, source)
          .split(path.sep)
          .some(
            (part) => part.startsWith(".") || ["node_modules", "dist", "target"].includes(part),
          ),
    });
  }
  const contract = path.join(app, "node_modules/@lenso/exact-docs");
  await mkdir(contract, { recursive: true });
  await cp(path.join(framework, "contract/index.contract"), path.join(contract, "index.contract"));
  await Bun.write(
    path.join(contract, "package.json"),
    JSON.stringify({ name: "@lenso/exact-docs", exports: { "./contract": "./index.contract" } }),
  );
  const imports = [
    'use DocsLayout, DocsLink, DocsHeading, DocsGroup, DocsChoice, DocsLabels from "@lenso/exact-docs/contract"',
  ];
  const embedded: Record<string, string> = {};
  for (const [name, registration] of Object.entries(site.config.components)) {
    const alias = `DocsEmbed${Object.keys(embedded).length}`;
    embedded[name] = alias;
    imports.push(
      `use ${registration.component} as ${alias} from ${quote(`./site/${registration.source}`)}`,
    );
  }
  const extension = site.config.root;
  for (const use of extension?.imports ?? [])
    imports.push(`use ${use.names.join(", ")} from ${quote(`./site/${use.source}`)}`);
  const rootMembers = extension
    ? (await readFile(path.join(site.root, extension.source), "utf8"))
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")
    : "";
  const layout = site.config.layout;
  if (layout)
    imports.push(
      `use ${layout.component} as DocsCustomLayout from ${quote(`./site/${layout.source}`)}`,
    );
  const routes = site.documents
    .map((doc, i) => `  page${i} ${quote(doc.path)}${platform === "web" ? " render=build" : ""}`)
    .join("\n");
  const content = compileBodies(site.documents, embedded);
  const branches = site.documents.flatMap((doc, i) => {
    if (!doc.component) return [];
    const componentName = doc.component ? `DocsCustomPage${i}` : undefined;
    if (componentName)
      imports.push(
        `use ${doc.component} as ${componentName} from ${quote(`./site/${doc.source}`)}`,
      );
    return `                  if page.route == "page${i}"
                    DocsCustomPage${i}()`;
  });
  const scopePages = searchScopes(site);
  const scopes = scopePages.map((scope, i) => {
    const scoped = site.documents.filter((candidate) => sameScope(candidate, scope));
    const navigation = scoped
      .filter((candidate) => candidate.nav !== false)
      .map((candidate) => ({ title: candidate.title, href: candidate.path }));
    const groups = navigationGroups(scoped);
    const groupValues = `[${groups.map((group) => `DocsGroup(id=${quote(group.id)}, title=${quote(group.title)}, items=${records("DocsLink", group.items)})`).join(", ")}]`;
    const labels =
      site.config.locales.find((locale) => locale.id === scope.locale)?.labels ?? defaultLabels;
    return `  state docsScope${i}: DocsScopeData = DocsScopeData(navigation=${records("DocsLink", navigation)}, groups=${groupValues}, labels=${constructor("DocsLabels", labels)})`;
  });
  const pageData = new Map<string, PageData>();
  const pages = site.documents.map((doc, i) => {
    const scoped = site.documents.filter((candidate) => sameScope(candidate, doc));
    const visible = scoped.filter((candidate) => candidate.nav !== false);
    const scope = scopePages.findIndex((candidate) => sameScope(candidate, doc));
    const seo = pageSeo(doc, site);
    const version = site.config.versions.find((item) => item.id === doc.version);
    const position = visible.indexOf(doc);
    const neighbor = (offset: number) => {
      const other = position < 0 ? undefined : visible[position + offset];
      return other
        ? `some(DocsLink(title=${quote(other.title)}, href=${quote(other.path)}))`
        : "none";
    };
    pageData.set(doc.path, {
      ...content.pages.get(doc.path)!,
      description: doc.description ?? "",
      canonical: seo.canonical,
      robots: seo.robots,
      seo: JSON.stringify(seo),
      toc: doc.headings,
      locales: choices(site.documents, doc, "locale", site.config.locales),
      versions: choices(site.documents, doc, "version", site.config.versions),
    });
    return `DocsPageData(route="page${i}", path=${quote(doc.path)}, title=${quote(doc.title)}, locale=${quote(doc.locale)}, language=${quote(seo.lang)}, direction=${quote(seo.dir)}, version=${quote(doc.version)}, pageId=${quote(doc.id)}, versionStatus=${quote(version?.status ?? "")}, searchIndexUrl=${quote(platform === "web" ? searchIndexUrl(doc) : "")}, custom=${Boolean(doc.component)}, markdownUrl=${quote(platform === "web" ? markdownUrl(doc) : "")}, scope=docsScope${scope}, previous=${neighbor(-1)}, next=${neighbor(1)})`;
  });
  const context = `shape DocsScopeData
  navigation: DocsLink[]
  groups: DocsGroup[]
  labels: DocsLabels

shape DocsPageData
  route: string
  path: string
  title: string
  locale: string
  language: string
  direction: string
  version: string
  pageId: string
  versionStatus: string
  searchIndexUrl: string
  custom: bool
  markdownUrl: string
  scope: DocsScopeData
  previous: option<DocsLink>
  next: option<DocsLink>

component DocsContext
  props
    page: DocsPageData
    content: DocsContent
    contentPending: bool
    contentFailed: bool
    query: string
    search: action
    results: DocsLink[]
    pending: bool
    failed: bool
  slot
  derive current = content.path == page.path
  provide
    docsPlatform = ${quote(platform)}
    docsGroups = page.scope.groups
    docsPrevious = page.previous
    docsNext = page.next
    docsLocales = current ? content.locales : []
    docsVersions = current ? content.versions : []
    docsLabels = page.scope.labels
    docsLocale = page.locale
    docsVersion = page.version
    docsPageId = page.pageId
    docsVersionStatus = page.versionStatus
    docsSearchIndexUrl = page.searchIndexUrl
    docsSearchPending = pending
    docsSearchFailed = failed
    docsDescription = current ? content.description : ""
    docsMarkdown = content.path == page.path ? content.markdown : ""
    docsContentPending = contentPending
    docsContentFailed = contentFailed
    docsMarkdownUrl = page.markdownUrl
  view
    view lang=page.language direction=page.direction data-docs-part="context" data-docs-seo=(current ? content.seo : "")
      ${layout ? "DocsCustomLayout" : "DocsLayout"}(siteName=${quote(site.config.name)}, pageTitle=page.title, currentPath=page.path, navigation=page.scope.navigation, toc=(current ? content.toc : []), query=query, search=search, results=results)
        children
`;
  function selectPage(start: number, end: number): string {
    if (end - start === 1) return `some(${pages[start]})`;
    const middle = Math.floor((start + end) / 2);
    return `(docsPageIndex < ${middle} ? ${selectPage(start, middle)} : ${selectPage(middle, end)})`;
  }
  const source = `${imports.join("\n")}

routes docsNav
${routes}
  notfound${platform === "web" ? " render=build" : ""}

shape DocsSearchReply
  items: DocsLink[]

component DocsApp
${scopes.join("\n")}
  state docsRouteNames: string[] = ${quote(site.documents.map((_, i) => `page${i}`))}
  derive docsPageIndex = docsRouteNames.indexOf(top(docsNav).name)
  derive docsPage = docsPageIndex < 0 ? none : ${selectPage(0, pages.length)}
  state docsQuery = ""
  derive docsPath = match docsPage { case some(page) => page.path, case none => "" }
  derive docsLocale = match docsPage { case some(page) => page.locale, case none => "" }
  derive docsVersion = match docsPage { case some(page) => page.version, case none => "" }
  derive docsPageId = match docsPage { case some(page) => page.pageId, case none => "" }
  resource docsContent = docsReadPage(docsPath) as shape DocsContent else empty()
  resource docsSearchReply = docsSearchPages(docsQuery, docsLocale, docsVersion) as shape DocsSearchReply else empty()
  derive docsResults = docsSearchReply.items
  action docsSearch(value: string)
    docsQuery = value
  action docsFollow(url: string)
${
  platform === "web"
    ? "    docsNav = go(docsNav, url)"
    : `    if stack(docsNav).filter(entry => entry.url == url).length > 0
      docsNav = go(docsNav, url)
    else
      docsNav = push(docsNav, url)`
}
${rootMembers}
  view
    ${platform === "web" ? "view" : 'scroll flex=1 min-height=0 height="100%" navigationBack=""'} navigationKey=top(docsNav).id.toString() navigate=docsFollow testId="docs-app"
      for entry in stack(docsNav).filter(item => item.id == top(docsNav).id) key=entry.id
        match docsPage
          case some(page)
            view navigationKey=entry.id.toString()
              head title=(page.title + ${quote(` | ${site.config.name}`)}) description=(docsContent.path == page.path ? docsContent.description : "") canonical=(docsContent.path == page.path ? docsContent.canonical : "") robots=(docsContent.path == page.path ? docsContent.robots : "noindex,follow")
              DocsContext(page=page, content=docsContent, contentPending=(docsContent.path != page.path and not failed(docsContent)), contentFailed=(docsContent.path != page.path and failed(docsContent)), query=docsQuery, search=docsSearch, results=docsResults, pending=pending(docsSearchReply), failed=failed(docsSearchReply))
                if docsContent.path == page.path
${branches.join("\n")}
                  if not page.custom
                    DocsBody(body=docsContent)
                else if failed(docsContent)
                  text page.scope.labels.contentError role="alert" data-docs-part="content-error"
                else
                  text page.scope.labels.contentLoading role="status" data-docs-part="content-loading"
          case none
            view
        if entry.name == "notfound"
          main navigationKey=entry.id.toString() data-docs-part="content" tabindex=-1 data-docs-seo=${quote(JSON.stringify(pageSeo(undefined, site)))}
            head title="Page not found" status=404 robots="noindex,follow"
            h1
              text "Page not found"
            link href=${quote(site.documents[0]!.path)}
              text "Documentation home"

${context}
${content.contract}
`;
  await Bun.write(path.join(app, "app.contract"), source);
  await writeDataEntry(site, app, pageData, platform);
  const manifestFile = Bun.file(path.join(site.root, "app.json"));
  const manifest = (await manifestFile.exists()) ? await manifestFile.json() : {};
  if (!record(manifest)) throw new Error("app.json must be an object");
  const application = manifest["app"] ?? {};
  if (!record(application)) throw new Error("app.json app must be an object");
  const host = manifest["host"] ?? {};
  if (!record(host)) throw new Error("app.json host must be an object");
  const data = manifest["data"] ?? [];
  if (!Array.isArray(data) || !data.every((word: unknown) => typeof word === "string"))
    throw new Error("app.json data must be a string array");
  await Bun.write(
    path.join(app, "app.json"),
    JSON.stringify(
      {
        ...manifest,
        name: site.config.name,
        app: { id: "dev.lenso.exactdocs", name: site.config.name, ...application },
        host: { ...host, [platform]: host[platform] ?? {} },
        data: [...new Set([...data, "docs-part", "docs-language", "docs-token", "docs-seo"])],
      },
      null,
      2,
    ),
  );
  for (const directory of ["assets", "modules"]) {
    try {
      await cp(path.join(site.root, directory), path.join(app, directory), { recursive: true });
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
  }
  return app;
}

export async function buildSite(
  directory: string,
  options: { exactRoot?: string; out?: string; development?: boolean } = {},
) {
  const site = await loadSite(directory);
  await highlightDocuments(site.documents);
  const exactRoot = options.exactRoot ?? process.env["EXACT_ROOT"];
  if (!exactRoot)
    throw new Error("Set EXACT_ROOT to an initialized expo/exact checkout (see README)");
  const builder = path.resolve(exactRoot, "host/web-js/build.mjs");
  if (!(await Bun.file(builder).exists()))
    throw new Error(`Exact Web builder not found: ${builder}`);
  const out = path.resolve(options.out ?? path.join(site.root, "dist"));
  if (
    out === site.root ||
    !out.startsWith(`${site.root}${path.sep}`) ||
    out === path.join(site.root, ".exact-docs") ||
    out.startsWith(path.join(site.root, ".exact-docs/app")) ||
    site.config.pages.some((page) =>
      path.resolve(site.root, page.source).startsWith(`${out}${path.sep}`),
    )
  )
    throw new Error("Output must be a separate directory inside the docs project");
  await mkdir(path.dirname(out), { recursive: true });
  const outputParent = await realpath(path.dirname(out));
  if (outputParent !== site.root && !outputParent.startsWith(`${site.root}${path.sep}`))
    throw new Error("Output escapes project through a symlink");
  try {
    const contents = await readdir(out);
    if (contents.length && !(await Bun.file(path.join(out, ".exact-docs-output")).exists()))
      throw new Error(`Refusing to replace a directory not created by Exact Docs: ${out}`);
    if (!(await realpath(out)).startsWith(`${site.root}${path.sep}`))
      throw new Error("Output escapes project through a symlink");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
  const app = await generateApp(site);
  const staging = path.join(site.root, ".exact-docs", `build-${crypto.randomUUID()}`);
  const child = Bun.spawn(
    [
      process.execPath,
      builder,
      app,
      "--out",
      staging,
      "--render",
      "js",
      ...(options.development ? [] : ["--production"]),
    ],
    {
      cwd: exactRoot,
      env: { ...process.env, EXACT_FEEDBACK: "0" },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await child.exited) !== 0) {
    await rm(staging, { recursive: true, force: true });
    throw new Error("Exact build failed; see compiler diagnostics above");
  }
  const htmlFiles = new Set([
    "index.html",
    "404.html",
    "shell.html",
    ...site.documents.map((doc) => path.join(doc.path.slice(1), "index.html")),
  ]);
  const files = await readdir(staging);
  const modules = files
    .filter((file) => /^(app|input-glue-[\w-]+|frames-[\w-]+)\.js$/.test(file))
    .map((file) => `./${file}`);
  const styles = files.includes("style.css") ? ["./style.css"] : [];
  for (const name of htmlFiles) {
    const file = Bun.file(path.join(staging, name));
    const doc = site.documents.find((item) => path.join(item.path.slice(1), "index.html") === name);
    if (await file.exists())
      await Bun.write(
        file,
        decoratePageHtml(
          preparePageHtml(await file.text(), {
            modules,
            styles,
          }),
          doc,
          site,
        ),
      );
  }
  await writeSeo(site, staging);
  const index = site.documents
    .filter((doc) => doc.search !== false)
    .map((doc) => ({
      id: doc.id,
      locale: doc.locale,
      version: doc.version,
      title: doc.title,
      href: doc.path,
      text: doc.text,
      headings: doc.headings,
    }));
  await Bun.write(path.join(staging, "search-index.json"), JSON.stringify(index));
  const scopes = new Map(
    site.documents.map((doc) => [JSON.stringify([doc.locale, doc.version]), doc]),
  );
  for (const doc of scopes.values())
    await Bun.write(
      path.join(staging, searchIndexUrl(doc).slice(1)),
      JSON.stringify(index.filter((item) => sameScope(item, doc))),
    );
  await Bun.write(
    path.join(staging, "_docs/variants.json"),
    JSON.stringify({
      locales: site.config.locales,
      versions: site.config.versions,
      defaultLocale: site.config.defaultLocale,
      defaultVersion: site.config.defaultVersion,
      pages: site.documents.map((doc) => ({
        id: doc.id,
        locale: doc.locale,
        version: doc.version,
        path: doc.path,
        title: doc.title,
        searchIndex: searchIndexUrl(doc),
        markdown: markdownUrl(doc),
      })),
    }),
  );
  for (const doc of site.documents) {
    if (doc.markdown !== undefined)
      await Bun.write(path.join(staging, markdownUrl(doc).slice(1)), doc.markdown);
    if (doc.body)
      await Bun.write(
        path.join(staging, `_docs/content${doc.path === "/" ? "" : doc.path}/index.json`),
        JSON.stringify({ schemaVersion: 1, nodes: doc.body }),
      );
  }
  await Bun.write(path.join(staging, ".exact-docs-output"), "Exact Docs generated output\n");
  await rm(out, { recursive: true, force: true });
  await rename(staging, out);
  return { site, out };
}

export { buildNative } from "./native.ts";
