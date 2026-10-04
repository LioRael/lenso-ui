import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { initAdvancedSearch } from "fumadocs-core/search/server";
import { structure } from "fumadocs-core/mdx-plugins/remark-structure";
import { remarkHeading } from "fumadocs-core/mdx-plugins/remark-heading";
import matter from "gray-matter";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { headingId } from "../src/lib/heading-id.mjs";
import { headingText, nativeApiFamily } from "../src/lib/native-api-section.ts";

const root = new URL("../", import.meta.url);

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

export async function createLocaleSearch(index, locale) {
  const indexes = await Promise.all(
    index.pages
      .filter((page) => page.locale === locale)
      .map(async (page) => {
        const content = await readFile(new URL(page.markdownFile, root), "utf8");
        const extracted = structure(
          matter(content).content,
          [authoredHeadingIds(nativeApiFamily(page.slug)), [remarkHeading, { customId: false }]],
          { types: ["heading", "paragraph"] },
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

export async function writeStaticSearch(index) {
  const directory = new URL("public/search/", root);
  await mkdir(directory, { recursive: true });
  for (const locale of ["en", "cn"]) {
    const server = await createLocaleSearch(index, locale);
    await writeFile(new URL(`${locale}.json`, directory), JSON.stringify(await server.export()));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeStaticSearch(
    JSON.parse(await readFile(new URL("src/generated/lenso-docs-index.json", root), "utf8")),
  );
}
