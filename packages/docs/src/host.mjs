import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { remarkStructure } from "fumadocs-core/mdx-plugins/remark-structure";
import { buildContent } from "./content.mjs";
import { createDocumentationSource } from "./source.mjs";
import { normalizeMetadata } from "./metadata.mjs";

let revision = 0;

const hasControl = (value) => [...value].some((character) => character.charCodeAt(0) < 32);

export async function localPath(root, relative, { directory = false } = {}) {
  if (
    typeof relative !== "string" ||
    !relative ||
    path.isAbsolute(relative) ||
    /[\\:]/u.test(relative) ||
    hasControl(relative) ||
    relative.split("/").some((part) => !part || part === "." || part === "..") ||
    [".lenso", "out", "node_modules", ".git"].includes(relative.split("/")[0])
  )
    throw new Error(`Expected a contained local path: ${relative}`);
  let file = root;
  for (const part of relative.split("/")) {
    file = path.join(file, part);
    if ((await lstat(file)).isSymbolicLink())
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

export async function modulePath(root, relative, extensions = /\.(?:mjs|js|ts)$/u) {
  if (!extensions.test(relative))
    throw new Error(`Unsupported source module extension: ${relative}`);
  return localPath(root, relative);
}

export function routePath(value, basePath = "") {
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
  if (["_lenso", "_next", "404"].includes(result.split("/")[1]))
    throw new Error(`Reserved documentation URL: ${value}`);
  return result;
}

function visit(node, callback) {
  callback(node);
  for (const child of node.children ?? []) visit(child, callback);
}

function nodeText(node) {
  return node.value ?? (node.children ?? []).map(nodeText).join("");
}

async function compilePage(input) {
  if (typeof input.markdown !== "string")
    throw new Error(`Page "${input.id}" must supply markdown.`);
  const page = { ...input };
  const body = matter(page.markdown).content;
  const headings = [];
  const text = [];
  function collect() {
    return (tree) => {
      const first = tree.children.findIndex((node) => node.type !== "html");
      if (tree.children[first]?.type === "heading" && tree.children[first].depth === 1)
        tree.children.splice(first, 1);
      const slugger = new GithubSlugger();
      visit(tree, (node) => {
        if (node.type === "heading") {
          const title = nodeText(node);
          const id = slugger.slug(title);
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
          if (node.depth >= 2 && node.depth <= 4) headings.push({ title, id, depth: node.depth });
        }
        if (["text", "inlineCode", "code"].includes(node.type)) text.push(node.value);
      });
    };
  }
  if (!page.compiled) {
    // Virtual source pages are Markdown, not Node-evaluated application modules.
    const result = await compile(body, {
      format: "md",
      outputFormat: "program",
      remarkPlugins: [remarkGfm, collect, remarkStructure],
    });
    page.compiled = String(result);
    page.headings ??= headings;
    page.structuredData ??= result.data.structuredData;
    page.searchText = [page.title, page.description, ...text].filter(Boolean).join(" ");
  }
  page.headings ??= [];
  page.structuredData ??= { headings: [], contents: [{ heading: undefined, content: body }] };
  return page;
}

export async function loadHost(root, config, command) {
  root = path.resolve(root);
  const locales = config.locales ?? [
    { code: config.language, label: config.language, language: config.language, routePrefix: "" },
  ];
  const defaultLocale = config.defaultLocale ?? locales[0].code;
  let input;
  const watchPaths = new Set();
  if (config.source) {
    const file = await modulePath(root, config.source);
    const url = pathToFileURL(file);
    url.searchParams.set("revision", String(++revision));
    const module = await import(url.href);
    if (module.prepare) await module.prepare({ root, config, command });
    if (typeof module.loadSource !== "function")
      throw new Error(`${config.source} must export loadSource({ root, config }).`);
    input = await module.loadSource({ root, config });
    watchPaths.add(config.source);
  } else {
    const pages = [];
    const trees = {};
    for (const locale of locales) {
      const contentDir = locale.contentDir ?? config.contentDir;
      const content = await buildContent(root, {
        title: config.title,
        contentDir,
        language: locale.code,
        basePath: `${config.basePath}${(locale.routePrefix ?? "").replace(/\/$/u, "")}`,
        ...(config.navigation ? { navigation: config.navigation } : {}),
      });
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
  const ids = new Set();
  const occupied = new Map();
  function claim(url, owner) {
    const route = routePath(url, config.basePath);
    if (occupied.has(route))
      throw new Error(
        `Documentation route collision at "${url}": ${occupied.get(route)} and ${owner}.`,
      );
    occupied.set(route, owner);
    return route;
  }
  const pages = [];
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
    pages.push(
      input.render === "custom"
        ? {
            ...page,
            headings: page.headings ?? [],
            structuredData: page.structuredData ?? { headings: [], contents: [] },
          }
        : await compilePage(page),
    );
  }
  const source = createDocumentationSource({
    pages,
    locales,
    readPage: async (page) => page.markdown,
  });
  const routes = [];
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
  const redirects = [];
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
        redirects.find((item) => routePath(item.from, config.basePath) === target).to,
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
  const searchFiles = {};
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
  return {
    pages: source.pages,
    source,
    locales,
    defaultLocale,
    routes,
    redirects,
    trees: input.trees,
    watchPaths: [...watchPaths],
    searchFiles,
  };
}
