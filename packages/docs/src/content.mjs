import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import {
  remarkStructure,
  remarkStructureDefaultOptions,
} from "fumadocs-core/mdx-plugins/remark-structure";
import { defineDocs, validatePageId } from "./config.mjs";
import { createDocumentationSource } from "./source.mjs";
import { isNonRenderingPrefix } from "./heading-utils.mjs";

// Symbols survive host copies without leaking source paths into serialized pages.
const sourceFile = Symbol.for("@lenso/docs/content/source-file");

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function nodeText(node) {
  if (["text", "inlineCode", "code"].includes(node.type)) return node.value;
  if (node.type === "image") return node.alt ?? "";
  return (node.children ?? []).map(nodeText).join("");
}

function pageNode(page) {
  return { type: "page", id: page.id, title: page.title, url: page.url };
}

function defaultTree(pages) {
  const tree = [];
  for (const page of pages) {
    const parts = page.id.split("/");
    const name = parts.pop();
    let children = tree;
    let folder;
    for (const part of parts) {
      folder = children.find((node) => node.type === "folder" && node.title === part);
      if (!folder) {
        folder = { type: "folder", title: part, children: [] };
        children.push(folder);
      }
      children = folder.children;
    }
    if (name === "index" && folder) folder.index = pageNode(page);
    else children.push(pageNode(page));
  }
  return tree;
}

export async function buildContent(root, input, { previous = [] } = {}) {
  const previousPages = new Map(previous.map((page) => [page.url, page]));
  const config = defineDocs(input);
  const directory = path.resolve(root, config.contentDir);
  let contentRoot;
  try {
    contentRoot = await realpath(directory);
  } catch (error) {
    throw new Error(
      `Create the content directory "${directory}" and add an index.md or index.mdx page.`,
      { cause: error },
    );
  }
  let segment = root;
  for (const part of config.contentDir.split("/")) {
    segment = path.join(segment, part);
    if ((await lstat(segment)).isSymbolicLink())
      throw new Error(`${segment}: content symlinks are unsupported; use a regular directory.`);
  }
  const files = [];
  const visited = new Set();
  async function scan(dir) {
    const actual = await realpath(dir);
    const relative = path.relative(contentRoot, actual);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`${dir}: symlinks must not escape the content directory.`);
    }
    if (visited.has(actual))
      throw new Error(`${dir}: cyclic or aliased content directory symlink.`);
    visited.add(actual);
    const entries = await readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const entry of entries) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        const target = await realpath(file);
        const rel = path.relative(contentRoot, target);
        if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
          throw new Error(`${file}: symlinks must not escape the content directory.`);
        }
        // Reject aliases rather than publish the same source under multiple identities.
        throw new Error(
          `${file}: content symlinks are unsupported; use a regular file or directory.`,
        );
      }
      if (entry.isDirectory()) await scan(file);
      else if (entry.isFile() && /\.mdx?$/u.test(entry.name)) files.push(file);
    }
  }
  await scan(directory);
  const pages = [];
  const routes = new Map();
  for (const file of files) {
    try {
      const id = validatePageId(
        path
          .relative(directory, file)
          .split(path.sep)
          .join("/")
          .replace(/\.mdx?$/u, ""),
      );
      const markdown = await readFile(file, "utf8");
      const previousPage = previousPages.get(
        `${config.basePath}/${id === "index" ? "" : id.replace(/\/index$/u, "") + "/"}`,
      );
      if (
        previousPage?.markdown === markdown &&
        previousPage.locale === config.language &&
        previousPage[sourceFile] === file
      ) {
        const slug = previousPage.slug;
        if (routes.has(slug))
          throw new Error(`duplicate route "/${slug}" also defined by ${routes.get(slug)}.`);
        routes.set(slug, file);
        pages.push({ ...previousPage, id });
        continue;
      }
      const { data, content: body } = matter(markdown);
      for (const key of Object.keys(data))
        if (!["title", "description", "draft", "kind", "metadata"].includes(key)) {
          throw new Error(
            `unsupported frontmatter field "${key}"; supported fields are title, description, draft, kind, metadata.`,
          );
        }
      for (const field of ["title", "description"]) {
        if (data[field] !== undefined && (typeof data[field] !== "string" || !data[field].trim())) {
          throw new Error(`frontmatter ${field} must be a non-empty string.`);
        }
      }
      if (data.draft !== undefined && typeof data.draft !== "boolean")
        throw new Error("frontmatter draft must be a boolean.");
      if (data.kind !== undefined && !["docs", "component", "api"].includes(data.kind))
        throw new Error("frontmatter kind must be docs, component or api.");
      if (data.draft === true) continue;
      const slug = id === "index" ? "" : id.replace(/\/index$/u, "");
      if (routes.has(slug))
        throw new Error(`duplicate route "/${slug}" also defined by ${routes.get(slug)}.`);
      routes.set(slug, file);
      const page = {
        [sourceFile]: file,
        id,
        slug,
        kind: data.kind ?? "docs",
        locale: config.language,
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
        url: `${config.basePath}/${slug ? `${slug}/` : ""}`,
        title: data.title ?? "",
        description: data.description ?? "",
        markdown,
        body,
        compiled: "",
        headings: [],
        searchText: "",
      };
      function collect() {
        return (tree) => {
          const leadingIndex = tree.children.findIndex((node) => !isNonRenderingPrefix(node));
          const leading = tree.children[leadingIndex];
          if (leading?.type === "heading" && leading.depth === 1) {
            const title = nodeText(leading);
            if (data.title !== undefined && data.title !== title)
              throw new Error(
                `frontmatter title "${data.title}" differs from leading H1 "${title}".`,
              );
            page.title ||= title;
            tree.children.splice(leadingIndex, 1);
          }
          page.title ||= id.split("/").pop().replace(/[-_]/gu, " ");
          const slugger = new GithubSlugger();
          const text = [];
          walk(tree, (node) => {
            if (node.type === "heading") {
              const title = nodeText(node);
              const headingId = slugger.slug(title);
              node.data = {
                ...node.data,
                hProperties: { ...node.data?.hProperties, id: headingId },
              };
              if (node.depth >= 2 && node.depth <= 4)
                page.headings.push({ title, id: headingId, depth: node.depth });
            }
            if (["text", "inlineCode", "code"].includes(node.type)) text.push(node.value);
            if (node.type === "image" && node.alt) text.push(node.alt);
          });
          page.searchText = [page.title, page.description, ...text]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/gu, " ")
            .trim();
        };
      }
      function resolveImports() {
        return (tree) => {
          walk(tree, (node) => {
            if (node.type !== "mdxjsEsm") return;
            for (const statement of node.data?.estree?.body ?? []) {
              const source = statement.source;
              if (typeof source?.value === "string" && /^\.\.?\//u.test(source.value)) {
                source.value = path.resolve(path.dirname(file), source.value);
                delete source.raw;
              }
            }
          });
        };
      }
      const compiled = await compile(
        { value: body, path: file },
        {
          format: file.endsWith(".mdx") ? "mdx" : "md",
          outputFormat: "program",
          jsx: false,
          remarkPlugins: [
            remarkGfm,
            collect,
            resolveImports,
            [
              remarkStructure,
              {
                types: [...remarkStructureDefaultOptions.types, "code"],
              },
            ],
          ],
        },
      );
      page.compiled = String(compiled);
      page.structuredData = compiled.data.structuredData;
      pages.push(page);
    } catch (error) {
      const position = error.line ? `:${error.line}:${error.column ?? 1}` : "";
      throw new Error(`${file}${position}: ${error.message}`, { cause: error });
    }
  }
  if (!pages.length)
    throw new Error(
      `No published pages in "${directory}". Add an .md or .mdx page without draft: true.`,
    );
  const byId = new Map(pages.map((page) => [page.id, page]));
  const tree =
    config.navigation === undefined
      ? defaultTree(pages)
      : config.navigation.map((group) => ({
          type: "folder",
          title: group.title,
          children: group.pages.map((id) => {
            const page = byId.get(id);
            if (!page)
              throw new Error(
                `Navigation group "${group.title}" references missing or draft page "${id}". Use a published content-relative page ID without its extension.`,
              );
            return pageNode(page);
          }),
        }));
  const source = createDocumentationSource({
    pages,
    locales: [{ code: config.language, label: config.language, language: config.language }],
    readPage: async (page) => page.markdown,
  });
  return { pages: source.pages, tree };
}
