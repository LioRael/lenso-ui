import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { initAdvancedSearch } from "fumadocs-core/search/server";
import { remarkStructure } from "fumadocs-core/mdx-plugins/remark-structure";
import { remarkHeading } from "fumadocs-core/mdx-plugins/remark-heading";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { VFile } from "vfile";
import matter from "gray-matter";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { headingId } from "../src/lib/heading-id.mjs";
import { headingText, nativeApiFamily } from "../src/lib/native-api-section.ts";

const root = new URL("../", import.meta.url);

// Generated native API tables are deliberately absent from the search records.
// Avoid constructing thousands of GFM table nodes only to discard them later.
// Keep authored prose, code, headings and tables outside the native API section.
export function searchMarkdown(markdown, family) {
  if (!family) return markdown;
  let api = false;
  let fence;
  return markdown
    .split("\n")
    .map((line) => {
      const boundary = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (boundary) {
        if (!fence) fence = boundary[0];
        else if (boundary[0] === fence) fence = undefined;
      }
      if (fence || boundary) return line;
      const heading = /^##\s+(.+)$/.exec(line);
      if (heading) api = /^(?:API Reference|API 参考)\s*$/.test(heading[1]);
      return api && /^\|.*\|\s*$/.test(line) ? "" : line;
    })
    .join("\n");
}

export function authoredHeadingIds(family) {
  return () => (tree) => {
    let api = false;
    for (const node of tree.children) {
      if (node.type !== "heading") continue;
      const title = headingText(node);
      if (node.depth <= 2)
        api = Boolean(family) && /^(?:API Reference|API 参考)$/i.test(title.trim());
      if (api && node.depth >= 4) {
        // Callback-state headings are rendered without IDs by NativeApiReference.
        node.type = "paragraph";
        continue;
      }
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = api
        ? node.depth === 2
          ? `native-api-${family}`
          : `api-${family}-${title.trim()}`
        : headingId(title);
    }
  };
}

export function searchStructure(markdown, family) {
  const processor = remark()
    .use(remarkGfm)
    .use(authoredHeadingIds(family))
    .use(remarkHeading, { customId: false })
    .use(remarkHeading)
    .use(remarkStructure, { types: ["heading", "paragraph"] });
  const file = new VFile(markdown);
  // Fuma's structure() also stringifies the entire document after extraction.
  // Search only needs its unchanged official plugin's data, so stop after run.
  processor.runSync(processor.parse(file), file);
  return file.data.structuredData;
}

export async function createLocaleSearch(index, locale) {
  const indexes = await Promise.all(
    index.pages
      .filter((page) => page.locale === locale)
      .map(async (page) => {
        const content = await readFile(new URL(page.markdownFile, root), "utf8");
        const extracted = searchStructure(
          searchMarkdown(matter(content).content, nativeApiFamily(page.slug)),
          nativeApiFamily(page.slug),
        );
        return {
          id: `/${locale}/docs/${page.slug}`,
          title: page.title,
          description: page.description,
          url: `/${locale}/docs/${page.slug}`,
          // Keep Fuma's paragraph records and owning canonical heading. Aggregating
          // an entire page into one text row hides deep matches in a bounded dialog.
          // Thousands of native API table cells remain displayed/copied, not indexed.
          structuredData: extracted,
        };
      }),
  );
  return initAdvancedSearch({
    indexes,
    tokenizer: locale === "cn" ? createTokenizer() : undefined,
    search: { limit: 60 },
  });
}

export async function writeStaticSearch(index, { locales = ["en", "cn"] } = {}) {
  const directory = new URL("public/search/", root);
  await mkdir(directory, { recursive: true });
  for (const locale of locales) {
    const server = await createLocaleSearch(index, locale);
    await writeFile(new URL(`${locale}.json`, directory), JSON.stringify(await server.export()));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeStaticSearch(
    JSON.parse(await readFile(new URL("src/generated/lenso-docs-index.json", root), "utf8")),
  );
}
