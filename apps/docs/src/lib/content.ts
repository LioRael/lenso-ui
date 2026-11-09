import type { ComponentType } from "react";
import type { MDXComponents, MDXProps } from "mdx/types";
import type { DocumentationArticleProps } from "@lenso/docs/react";

interface DocumentModule {
  default: ComponentType<MDXProps>;
  getComponents(): MDXComponents;
  lensoHeadings: DocumentationArticleProps["headings"];
}

// The generated index already owns metadata. Import only the requested MDX body,
// rather than eagerly importing every document's frontmatter into the browser.
const entries = import.meta.glob<DocumentModule>("../../content/lenso/**/*.mdx");
const pages = new Map(
  Object.entries(entries).map(([path, load]) => {
    let pending: Promise<DocumentModule> | undefined;
    let loaded: (DocumentModule & { components: MDXComponents }) | undefined;
    return [
      path.slice("../../content/lenso/".length),
      {
        preload() {
          return (pending ??= load().then((module) => {
            loaded = { ...module, components: module.getComponents() };
            return loaded;
          }));
        },
        read() {
          if (!loaded) throw new Error(`Document must be preloaded: ${path}`);
          return loaded;
        },
      },
    ];
  }),
);

export const documents = {
  getPage(path: string) {
    return pages.get(path);
  },
};
