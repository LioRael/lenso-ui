import { defineConfig } from "fumadocs-mdx/config";
import { remarkLensoDocument } from "./scripts/remark-lenso-document";
import { createHighlights } from "fumadocs-core/highlight/highlights";
import { rehypeCodeFromHighlighter } from "fumadocs-core/mdx-plugins/rehype-code.core";

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkLensoDocument],
    rehypeCodeOptions: false,
    rehypePlugins: [
      () =>
        rehypeCodeFromHighlighter(({ transformers }) =>
          createHighlights({ shikiTransformers: transformers }),
        ),
    ],
  },
});
