import { createDefaultImport, defineCollection, defineConfig } from "@content-collections/core";
import type { MDXContent } from "mdx/types";
import { z } from "zod";

import { getDocsPageItem, type DocsPage } from "./contents/catalog";

const docs = defineCollection({
  name: "docs",
  directory: "contents",
  include: "**/content.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    actions: z.tuple([z.string(), z.string()]).optional(),
    description: z.string().min(1),
    eyebrow: z.string().min(1).optional(),
    layout: z.enum(["component", "overview"]).default("component"),
    metadata: z.tuple([z.string(), z.string()]).optional(),
    title: z.string().min(1),
  }),
  transform: ({ _meta, ...frontmatter }) => {
    const parts = _meta.filePath.split(/[\\/]/).filter(Boolean);
    const section = parts[0];
    const slug = section === "start" ? "overview" : parts.at(-2);

    if (!section || !slug) {
      throw new Error(`Unable to derive docs route from ${_meta.filePath}`);
    }

    const page = getDocsPageItem(slug as DocsPage);
    if (!page) {
      throw new Error(`Docs content ${_meta.filePath} is missing from the navigation registry`);
    }

    return {
      ...frontmatter,
      mdxContent: createDefaultImport<MDXContent>(`@/contents/${_meta.filePath}`),
      section,
      slug: page.slug,
    };
  },
});

export default defineConfig({
  content: [docs],
});
