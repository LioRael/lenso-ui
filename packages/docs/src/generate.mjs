import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const normalize = (value) => value.replace(/^\/+|\/+$/g, "");

function frontmatter(source, file) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);
  const read = (key) => {
    const line = match[1].split(/\r?\n/).find((part) => part.startsWith(`${key}:`));
    if (!line) return undefined;
    const value = line.slice(key.length + 1).trim();
    return value.replace(/^['"]|['"]$/g, "");
  };
  const title = read("title");
  if (!title) throw new Error(`Missing title: ${file}`);
  return { title, description: read("description") ?? "" };
}

async function pagesIn(directory, segments = []) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isDirectory())
      result.push(...(await pagesIn(path.join(directory, item.name), [...segments, item.name])));
    else if (item.name === "content.mdx")
      result.push({ file: path.join(directory, item.name), segments });
  }
  return result;
}

/**
 * Generate a serializable navigation manifest from <section>/<page>/content.mdx.
 * The section's content.mdx is its overview. meta.json controls only ordering and labels.
 */
export async function generateDocsManifest({
  contentDir,
  outputFile,
  publicDir,
  site,
  tabs,
  rootPage = "start/overview",
  overrides = {},
}) {
  const root = normalize(rootPage);
  const sections = [];
  const search = [];
  const seenPaths = new Set();
  const seenPages = new Set();
  for (const [order, tab] of tabs.entries()) {
    const sectionDir = path.join(contentDir, tab.path);
    const files = await pagesIn(sectionDir);
    const meta = await readFile(path.join(sectionDir, "meta.json"), "utf8").then(
      JSON.parse,
      () => ({}),
    );
    const rank = new Map(
      (meta.pages ?? []).map((page, index) => [page === "index" ? "overview" : page, index]),
    );
    const items = [];
    for (const { file, segments } of files) {
      if (segments.length > 1) throw new Error(`Nested page path is unsupported: ${file}`);
      const slug = segments[0] ?? "overview";
      const id = `${tab.path}/${slug}`;
      const relativePath = id === root ? "/" : `/${id}`;
      if (seenPaths.has(relativePath) || seenPages.has(id))
        throw new Error(`Duplicate docs route: ${id}`);
      seenPaths.add(relativePath);
      seenPages.add(id);
      const source = await readFile(file, "utf8");
      const data = frontmatter(source, file);
      const override = overrides[id] ?? {};
      items.push({ href: relativePath, kind: "page", label: data.title, slug, ...override });
      search.push({
        href: relativePath,
        title: data.title,
        description: data.description,
        body: source.replace(/^---\r?\n[\s\S]*?\r?\n---/, "").trim(),
      });
    }
    if (items.length === 0) throw new Error(`Docs tab has no pages: ${tab.path}`);
    for (const name of rank.keys()) {
      if (!items.some((item) => item.slug === name))
        throw new Error(`meta.json references missing page: ${tab.path}/${name}`);
    }
    items.sort(
      (a, b) =>
        (rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
          (rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER) || a.slug.localeCompare(b.slug),
    );
    sections.push({
      id: tab.path,
      label: meta.title ?? tab.label,
      order: (order + 1) * 10,
      defaultOpen: Boolean(meta.defaultOpen ?? order === 0),
      items,
    });
  }
  for (const key of Object.keys(overrides)) {
    if (!seenPages.has(key)) throw new Error(`Override references missing page: ${key}`);
  }
  const manifest = { sections };
  await writeFile(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);
  if (publicDir) {
    await writeFile(path.join(publicDir, "search.json"), `${JSON.stringify(search)}\n`);
    const origin = site?.replace(/\/$/, "");
    if (origin) {
      const escapeXml = (value) =>
        value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
      const urls = search
        .map(({ href }) => `  <url><loc>${escapeXml(new URL(href, origin).href)}</loc></url>`)
        .join("\n");
      await writeFile(
        path.join(publicDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
    }
    await writeFile(
      path.join(publicDir, "llms.txt"),
      `# Documentation\n\n${search.map(({ href, title, description }) => `- [${title}](${href}): ${description}`).join("\n")}\n`,
    );
  }
  return manifest;
}
