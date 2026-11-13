import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { rehypeHighlight } from "./rehype-highlight.ts";
import { remarkStructure } from "fumadocs-core/mdx-plugins/remark-structure";
import { buildContent, type DocsPage, type DocsTreeNode } from "./content.ts";
import { createDocumentationSource, type DocumentationPageMetadata } from "./source.ts";
import { normalizeMetadata } from "./metadata.ts";
import type { DocsConfig, ResolvedDocsConfig } from "./config.ts";
import type { HeadingTextNode } from "./heading-utils.ts";

export type HostPage = DocumentationPageMetadata & {
  id: string;
  markdown: string;
  /** Contained server-render module imported only by this document's exact route. */
  module?: string;
  compiled?: string;
  body?: string;
  searchText?: string | undefined;
  headings?: { title: string; id: string; depth: number }[] | undefined;
  structuredData?:
    | {
        headings: { id: string; content: string }[];
        contents: { heading?: string | undefined; content: string }[];
      }
    | undefined;
};

export interface HostRoute {
  path: string;
  module: string;
  locale?: string;
  props?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface HostRedirect {
  from: string;
  to: string;
  permanent?: boolean;
}

export interface HostSource {
  render?: "mdx" | "custom";
  pages: HostPage[];
  routes?: HostRoute[];
  redirects?: HostRedirect[];
  watchPaths?: string[];
  /** Source-owned outputs excluded from watching and content regeneration. */
  generatedPaths?: string[];
  search?: Record<string, string>;
  trees?: Record<string, DocsTreeNode[]>;
}

export interface SourceWatchCallbacks {
  onChange(changedPaths: string[]): void | Promise<unknown>;
  onError(error: unknown): void;
}

export interface SourceModule {
  /** Optional source-owned external inputs; runtime owns scheduling and disposal. */
  watchSource?(
    context: SourceWatchCallbacks & { root: string; config: DocsConfig },
  ): (() => void | Promise<void>) | Promise<() => void | Promise<void>>;
  prepare?(context: {
    root: string;
    config: DocsConfig;
    command: "dev" | "build";
    changedPaths?: string[];
    background?: boolean;
  }): void | Promise<void>;
  prepareBackground?(context: {
    root: string;
    config: DocsConfig;
    command: "dev" | "build";
  }): void | Promise<void>;
  loadSource(context: { root: string; config: DocsConfig }): HostSource | Promise<HostSource>;
}

interface ContentNode extends HeadingTextNode {
  depth?: number;
  children?: ContentNode[];
  data?: { hProperties?: Record<string, unknown> };
}
type ContentTree = ContentNode & { children: ContentNode[] };

let revision = 0;

const hasControl = (value: string): boolean =>
  [...value].some((character) => character.charCodeAt(0) < 32);

export async function localPath(
  root: string,
  relative: string,
  { directory = false, missing = false }: { directory?: boolean | null; missing?: boolean } = {},
): Promise<string> {
  if (
    typeof relative !== "string" ||
    !relative ||
    path.isAbsolute(relative) ||
    /[\\:]/u.test(relative) ||
    hasControl(relative) ||
    relative.split("/").some((part) => !part || part === "." || part === "..") ||
    [".lenso", "out", "node_modules", ".git"].includes(relative.split("/")[0]!)
  )
    throw new Error(`Expected a contained local path: ${relative}`);
  let file = root;
  for (const part of relative.split("/")) {
    file = path.join(file, part);
    let info;
    try {
      info = await lstat(file);
    } catch (error) {
      if (missing && (error as NodeJS.ErrnoException).code === "ENOENT")
        return path.join(root, relative);
      throw error;
    }
    if (info.isSymbolicLink())
      throw new Error(`Local source paths cannot contain symlinks: ${file}`);
  }
  const info = await lstat(file);
  const actual = path.relative(await realpath(root), await realpath(file));
  if (
    actual.startsWith(`..${path.sep}`) ||
    actual === ".." ||
    path.isAbsolute(actual) ||
    !(directory === null
      ? info.isDirectory() || info.isFile()
      : directory
        ? info.isDirectory()
        : info.isFile())
  )
    throw new Error(`Expected a regular contained ${directory ? "directory" : "file"}: ${file}`);
  return file;
}

export async function modulePath(
  root: string,
  relative: string,
  extensions = /\.(?:mjs|js|ts)$/u,
): Promise<string> {
  if (!extensions.test(relative))
    throw new Error(`Unsupported source module extension: ${relative}`);
  return localPath(root, relative);
}

export function routePath(value: string, basePath = ""): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\?#\s]/u.test(value) ||
    hasControl(value) ||
    value.startsWith("//")
  )
    throw new Error(`Unsafe documentation URL: ${value}`);
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new Error(`Invalid documentation URL escaping: ${value}`);
  }
  if (
    /[\\%?#\s]/u.test(decoded) ||
    hasControl(decoded) ||
    decoded
      .split("/")
      .slice(1, -1)
      .some((part) => !part) ||
    decoded.split("/").some((part) => part === "." || part === ".." || /[()[\]@]/u.test(part))
  )
    throw new Error(`Unsafe documentation URL: ${value}`);
  if (basePath && value !== basePath && !value.startsWith(`${basePath}/`))
    throw new Error(`Documentation URL must include basePath "${basePath}": ${value}`);
  const result = decoded.slice(basePath.length).replace(/\/$/u, "") || "/";
  if (["_lenso", "_next", "404"].includes(result.split("/")[1] ?? ""))
    throw new Error(`Reserved documentation URL: ${value}`);
  return result;
}

function visit(node: ContentNode, callback: (node: ContentNode) => void): void {
  callback(node);
  for (const child of node.children ?? []) visit(child, callback);
}

function nodeText(node: ContentNode): string {
  return node.value ?? (node.children ?? []).map(nodeText).join("");
}

async function compilePage(input: HostPage): Promise<HostPage> {
  if (typeof input.markdown !== "string")
    throw new Error(`Page "${input.id}" must supply markdown.`);
  const page = { ...input };
  const body = matter(page.markdown).content;
  const headings: NonNullable<HostPage["headings"]> = [];
  const text: string[] = [];
  function collect() {
    return (tree: ContentTree) => {
      const first = tree.children.findIndex((node) => node.type !== "html");
      if (tree.children[first]?.type === "heading" && tree.children[first].depth === 1)
        tree.children.splice(first, 1);
      const slugger = new GithubSlugger();
      visit(tree, (node) => {
        if (node.type === "heading") {
          const title = nodeText(node);
          const id = slugger.slug(title);
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
          if (node.depth !== undefined && node.depth >= 2 && node.depth <= 4)
            headings.push({ title, id, depth: node.depth });
        }
        if (["text", "inlineCode", "code"].includes(node.type) && node.value !== undefined)
          text.push(node.value);
      });
    };
  }
  if (!page.compiled) {
    // Virtual source pages are Markdown, not Node-evaluated application modules.
    const result = await compile(body, {
      format: "md",
      outputFormat: "program",
      rehypePlugins: [rehypeHighlight],
      remarkPlugins: [remarkGfm, collect, remarkStructure],
    });
    page.compiled = String(result);
    page.headings ??= headings;
    page.structuredData ??= result.data.structuredData as HostPage["structuredData"];
    page.searchText = [page.title, page.description, ...text].filter(Boolean).join(" ");
  }
  page.headings ??= [];
  page.structuredData ??= { headings: [], contents: [{ heading: undefined, content: body }] };
  return page;
}

export async function loadHost(
  root: string,
  config: ResolvedDocsConfig,
  command: "dev" | "build",
  {
    previous,
    changedPaths = [],
    background = true,
  }: {
    previous?: { pages: readonly HostPage[] };
    changedPaths?: string[];
    background?: boolean;
  } = {},
) {
  root = path.resolve(root);
  const locales = config.locales ?? [
    { code: config.language, label: config.language, language: config.language, routePrefix: "" },
  ];
  const defaultLocale = config.defaultLocale ?? locales[0]!.code;
  let input: HostSource;
  let prepareBackground: (() => void | Promise<void>) | undefined;
  let watchSource:
    | ((
        callbacks: SourceWatchCallbacks,
      ) => (() => void | Promise<void>) | Promise<() => void | Promise<void>>)
    | undefined;
  const watchPaths = new Set<string>();
  if (config.source) {
    const file = await modulePath(root, config.source);
    const module: SourceModule = await import(`${file}?revision=${++revision}`);
    if (module.prepare) await module.prepare({ root, config, command, changedPaths, background });
    if (background && module.prepareBackground)
      prepareBackground = () => module.prepareBackground!({ root, config, command });
    if (command === "dev" && module.watchSource)
      watchSource = (callbacks) => module.watchSource!({ root, config, ...callbacks });
    if (typeof module.loadSource !== "function")
      throw new Error(`${config.source} must export loadSource({ root, config }).`);
    input = await module.loadSource({ root, config });
    watchPaths.add(config.source);
  } else {
    const pages: HostPage[] = [];
    const trees: Record<string, DocsTreeNode[]> = {};
    for (const locale of locales) {
      const contentDir = locale.contentDir ?? config.contentDir;
      const content = await buildContent(
        root,
        {
          title: config.title,
          contentDir,
          language: locale.code,
          basePath: `${config.basePath}${(locale.routePrefix ?? "").replace(/\/$/u, "")}`,
          ...(config.navigation ? { navigation: config.navigation } : {}),
        },
        previous ? { previous: previous.pages as readonly DocsPage[] } : {},
      );
      pages.push(
        ...content.pages.map((page) => ({
          ...page,
          id: locales.length > 1 ? `${locale.code}/${page.id}` : page.id,
        })),
      );
      trees[locale.code] = content.tree;
      watchPaths.add(contentDir);
    }
    input = { pages, trees };
  }
  if (!input || !Array.isArray(input.pages)) throw new Error("loadSource must return { pages }.");
  if (input.render !== undefined && !["mdx", "custom"].includes(input.render))
    throw new Error("Source render must be mdx or custom.");
  const ids = new Set<string>();
  const occupied = new Map<string, string>();
  function claim(url: string, owner: string): string {
    const route = routePath(url, config.basePath);
    if (occupied.has(route))
      throw new Error(
        `Documentation route collision at "${url}": ${occupied.get(route)} and ${owner}.`,
      );
    occupied.set(route, owner);
    return route;
  }
  const pages: HostPage[] = [];
  for (const inputPage of input.pages) {
    if (
      typeof inputPage.id !== "string" ||
      !inputPage.id.split("/").every((part) => /^[\p{L}\p{N}_-]+$/u.test(part)) ||
      ids.has(inputPage.id)
    )
      throw new Error(`Invalid or duplicate global page ID: ${inputPage.id}`);
    ids.add(inputPage.id);
    claim(inputPage.url, `page ${inputPage.id}`);
    const page = { ...inputPage };
    if (inputPage.module !== undefined) {
      page.module = await modulePath(root, inputPage.module, /\.(?:jsx|tsx|js|mjs|ts)$/u);
      watchPaths.add(inputPage.module);
    }
    if (input.render === "custom" && !page.module && !config.components)
      throw new Error(
        `Custom source page "${page.id}" requires a page module or a components module with getDocument.`,
      );
    const cached = previous?.pages.find(
      (old) => old.id === page.id && old.markdown === page.markdown,
    );
    pages.push(
      input.render === "custom"
        ? {
            ...page,
            headings: page.headings ?? [],
            structuredData: page.structuredData ?? { headings: [], contents: [] },
          }
        : page.compiled
          ? page
          : cached?.compiled
            ? {
                ...page,
                compiled: cached.compiled,
                headings: cached.headings,
                structuredData: cached.structuredData,
                searchText: cached.searchText,
              }
            : await compilePage(page),
    );
  }
  const source = createDocumentationSource({
    pages,
    locales,
    readPage: async (page) => page.markdown,
  });
  const routes: (HostRoute & { locale: string })[] = [];
  for (const route of input.routes ?? []) {
    claim(route.path, `custom route ${route.path}`);
    const locale = route.locale ?? defaultLocale;
    if (!source.isLocale(locale)) throw new Error(`Unknown custom route locale: ${locale}`);
    const module = await modulePath(root, route.module, /\.(?:jsx|tsx|js|mjs|ts)$/u);
    routes.push({
      ...route,
      locale,
      module,
      props: normalizeMetadata(route.props ?? {}),
      metadata: normalizeMetadata(route.metadata ?? {}),
    });
    watchPaths.add(route.module);
  }
  const redirects: HostRedirect[] = [];
  for (const redirect of input.redirects ?? []) {
    claim(redirect.from, `redirect ${redirect.from}`);
    routePath(redirect.to, config.basePath);
    if (redirect.permanent !== undefined && typeof redirect.permanent !== "boolean")
      throw new Error("Redirect permanent must be boolean.");
    redirects.push({ ...redirect, permanent: redirect.permanent ?? false });
  }
  for (const redirect of redirects) {
    const seen = new Set([routePath(redirect.from, config.basePath)]);
    let target = routePath(redirect.to, config.basePath);
    while (redirects.some((item) => routePath(item.from, config.basePath) === target)) {
      if (seen.has(target)) throw new Error(`Redirect cycle at ${redirect.from}`);
      seen.add(target);
      target = routePath(
        redirects.find((item) => routePath(item.from, config.basePath) === target)!.to,
        config.basePath,
      );
    }
  }
  for (const relative of input.watchPaths ?? []) {
    const file = await localPath(root, relative, { directory: null });
    watchPaths.add(path.relative(root, file));
  }
  for (const relative of watchPaths) {
    await localPath(root, relative, { directory: null });
  }
  const searchFiles: Record<string, string> = {};
  if (input.search !== undefined) {
    if (!input.search || typeof input.search !== "object" || Array.isArray(input.search))
      throw new Error("Source search must be a locale-to-local-JSON-file record.");
    for (const [code, relative] of Object.entries(input.search)) {
      if (!locales.some((locale) => locale.code === code))
        throw new Error(`Unknown search locale: ${code}`);
      if (typeof relative !== "string" || !relative.endsWith(".json"))
        throw new Error("Source search files must be local JSON files.");
      searchFiles[code] = await localPath(root, relative);
      watchPaths.add(relative);
    }
  }
  const generatedPaths = input.generatedPaths ?? [];
  for (const relative of generatedPaths)
    await localPath(root, relative, { directory: null, missing: true });
  const managed = (relative: string): boolean =>
    generatedPaths.some(
      (generated) => relative === generated || relative.startsWith(`${generated}/`),
    );
  return {
    prepareBackground,
    watchSource,
    generatedPaths,
    pages: source.pages,
    source,
    locales,
    defaultLocale,
    routes,
    redirects,
    trees: input.trees,
    watchPaths: [...watchPaths].filter((relative) => !managed(relative)),
    searchFiles,
  };
}
