import { cp, mkdir, readFile, readdir, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";
import { parseMarkdown } from "./markdown.ts";
import { walk, type DocumentNode, type Heading } from "./content.ts";
import { renderContract } from "./renderers/exact.ts";
import { highlightDocuments } from "./highlight.ts";
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
  components: Record<string,{source:string;component:string}>;
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
  const components: DocsConfig["components"]={};
  if(value["components"]!==undefined) {
    if(!record(value["components"])) throw new Error("components must be a name-to-module mapping");
    for(const [name,entry] of Object.entries(value["components"])) {
      if(!component(name)||!record(entry)||!sourcePath(entry["source"])||!entry["source"].endsWith(".contract")||(entry["component"]!==undefined&&!component(entry["component"]))) throw new Error(`Invalid component registration: ${name}`);
      components[name]={source:entry["source"],component:typeof entry["component"]==="string"?entry["component"]:name};
    }
  }
  let origin:string|undefined;
  if(value["origin"]!==undefined) {
    if(typeof value["origin"]!=="string") throw new Error("origin must be an absolute HTTP(S) origin");
    const url=new URL(value["origin"]);
    if(!["http:","https:"].includes(url.protocol)||url.pathname!=="/"||url.search||url.hash||url.username||url.password) throw new Error("origin must be an absolute HTTP(S) origin without a path or credentials");
    origin=url.origin;
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
    ...(origin?{origin}:{}),
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
  for(const registration of Object.values(config.components)) await localFile(root,registration.source);
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
    for(const node of walk(compiled.nodes)) if(node.kind==="component"&&!config.components[node.name]) throw new Error(`${page.source}: unregistered component ${node.name}`);
    const title =
      page.title ??
      metadata.title ??
      compiled.headings.find((heading) => heading.level === 1)?.title ??
      page.path;
    documents.push({
      ...metadata,
      ...page,
      title,
      headings:compiled.headings,links:compiled.links,body:compiled.nodes,
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
export async function generateApp(site: Site) {
  const app = path.join(site.root, ".exact-docs/app");
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
  const embedded:Record<string,string>={};
  for(const [name,registration] of Object.entries(site.config.components)) {
    const alias=`DocsEmbed${Object.keys(embedded).length}`;embedded[name]=alias;
    imports.push(`use ${registration.component} as ${alias} from ${quote(`./site/${registration.source}`)}`);
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
    .map((doc, i) => `  page${i} ${quote(doc.path)} render=build`)
    .join("\n");
  const branches = site.documents.map((doc, i) => {
    const componentName = doc.component ? `DocsCustomPage${i}` : undefined;
    if (componentName)
      imports.push(
        `use ${doc.component} as ${componentName} from ${quote(`./site/${doc.source}`)}`,
      );
    return `        if entry.name == "page${i}"
          view navigationKey=entry.id.toString()
            head title=${quote(`${doc.title} | ${site.config.name}`)} description=${quote(doc.description ?? "")} canonical=${quote(site.config.origin?new URL(doc.path,site.config.origin).href:"")} robots=${quote(doc.noindex?"noindex,follow":"index,follow")}
            DocsContext${i}(query=docsQuery, search=docsSearch, results=docsResults, pending=pending(docsSearchReply), failed=failed(docsSearchReply))`;
  });
  const contexts = site.documents.map((doc, i) => {
    const scoped = site.documents.filter((candidate) => sameScope(candidate, doc));
    const visible = scoped.filter((candidate) => candidate.nav !== false);
    const navigation = visible.map((candidate) => ({
      title: candidate.title,
      href: candidate.path,
    }));
    const groups = navigationGroups(scoped);
    const groupValues = `[${groups.map((group) => `DocsGroup(id=${quote(group.id)}, title=${quote(group.title)}, items=${records("DocsLink", group.items)})`).join(", ")}]`;
    const locale = site.config.locales.find((item) => item.id === doc.locale);
    const version = site.config.versions.find((item) => item.id === doc.version);
    const position = visible.indexOf(doc);
    const neighbor = (offset: number) => {
      const other = position < 0 ? undefined : visible[position + offset];
      return other
        ? `some(DocsLink(title=${quote(other.title)}, href=${quote(other.path)}))`
        : "none";
    };
    return `component DocsContext${i}
  props
    query: string
    search: action
    results: DocsLink[]
    pending: bool
    failed: bool
  state docsGroups: DocsGroup[] = ${groupValues}
  state docsPrevious: option<DocsLink> = ${neighbor(-1)}
  state docsNext: option<DocsLink> = ${neighbor(1)}
  state docsLocales: DocsChoice[] = ${records("DocsChoice", choices(site.documents, doc, "locale", site.config.locales))}
  state docsVersions: DocsChoice[] = ${records("DocsChoice", choices(site.documents, doc, "version", site.config.versions))}
  state docsLabels: DocsLabels = ${constructor("DocsLabels", locale?.labels ?? defaultLabels)}
  provide
    docsGroups
    docsPrevious
    docsNext
    docsLocales
    docsVersions
    docsLabels
    docsLocale = ${quote(doc.locale)}
    docsVersion = ${quote(doc.version)}
    docsPageId = ${quote(doc.id)}
    docsVersionStatus = ${quote(version?.status ?? "")}
    docsSearchIndexUrl = ${quote(searchIndexUrl(doc))}
    docsSearchPending = pending
    docsSearchFailed = failed
    docsDescription = ${quote(doc.description ?? "")}
    docsMarkdown = ${quote(doc.markdown ?? "")}
    docsMarkdownUrl = ${quote(markdownUrl(doc))}
  view
    view lang=${quote(doc.locale || "en")} direction=${quote(locale?.dir ?? "ltr")} data-docs-part="context"
      ${layout ? "DocsCustomLayout" : "DocsLayout"}(siteName=${quote(site.config.name)}, pageTitle=${quote(doc.title)}, currentPath=${quote(doc.path)}, navigation=${records("DocsLink", navigation)}, toc=${records("DocsHeading", doc.headings)}, query=query, search=search, results=results)
        ${doc.component ? `DocsCustomPage${i}()` : `DocsPage${i}()`}
`;
  });
  const bodies = site.documents
    .filter((doc) => !doc.component)
    .map((doc) => {
      const i = site.documents.indexOf(doc);
      return `component DocsPage${i}\n  view\n    article data-docs-part="article"\n${(
        renderContract(doc.body??[],embedded) || 'text ""\n'
      )
        .split("\n")
        .filter(Boolean)
        .map((line) => `      ${line}`)
        .join("\n")}`;
    });
  const source = `${imports.join("\n")}

routes docsNav
${routes}
  notfound render=build

shape DocsSearchReply
  items: DocsLink[]

component DocsApp
  state docsQuery = ""
  derive docsPath = ${site.documents.map((doc, i) => `top(docsNav).name == "page${i}" ? ${quote(doc.path)} : `).join("")} ""
  derive docsLocale = ${site.documents.map((doc, i) => `top(docsNav).name == "page${i}" ? ${quote(doc.locale)} : `).join("")} ""
  derive docsVersion = ${site.documents.map((doc, i) => `top(docsNav).name == "page${i}" ? ${quote(doc.version)} : `).join("")} ""
  derive docsPageId = ${site.documents.map((doc, i) => `top(docsNav).name == "page${i}" ? ${quote(doc.id)} : `).join("")} ""
  resource docsSearchReply = docsSearchPages(docsQuery, docsLocale, docsVersion) as shape DocsSearchReply else empty()
  derive docsResults = docsSearchReply.items
  action docsSearch(value: string)
    docsQuery = value
  action docsFollow(url: string)
    docsNav = go(docsNav, url)
${rootMembers}
  view
    view navigationKey=top(docsNav).id.toString() navigate=docsFollow
      for entry in stack(docsNav).filter(item => item.id == top(docsNav).id) key=entry.id
${branches.join("\n")}
        if entry.name == "notfound"
          main navigationKey=entry.id.toString()
            head title="Page not found" status=404 robots="noindex,follow"
            h1
              text "Page not found"
            link href=${quote(site.documents[0]!.path)}
              text "Documentation home"

${contexts.join("\n\n")}
${bodies.join("\n\n")}
`;
  await Bun.write(path.join(app, "app.contract"), source);
  await writeDataEntry(site,app);
  const manifestFile = Bun.file(path.join(site.root, "app.json"));
  const manifest = (await manifestFile.exists()) ? await manifestFile.json() : {};
  if (!record(manifest)) throw new Error("app.json must be an object");
  const application = manifest["app"] ?? {};
  if (!record(application)) throw new Error("app.json app must be an object");
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
        host: { web: {} },
        data: [...new Set([...data, "docs-part", "docs-language", "docs-token"])],
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
  options: { exactRoot?: string; out?: string } = {},
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
  const child = Bun.spawn([process.execPath, builder, app, "--out", staging, "--render", "js"], {
    cwd: exactRoot,
    env: { ...process.env, EXACT_FEEDBACK: "0" },
    stdout: "inherit",
    stderr: "inherit",
  });
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
  for (const name of htmlFiles) {
    const file = Bun.file(path.join(staging, name));
    if (await file.exists()) await Bun.write(file, preparePageHtml(await file.text()));
  }
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
  }
  await Bun.write(path.join(staging, ".exact-docs-output"), "Exact Docs generated output\n");
  await rm(out, { recursive: true, force: true });
  await rename(staging, out);
  return { site, out };
}
