import type { DocsConfig } from "./config.mjs";
import type { DocumentationKind } from "./document-model.js";

export interface DocsHeading {
  title: string;
  id: string;
  depth: number;
}
export interface DocsPage {
  id: string;
  slug: string;
  kind: DocumentationKind;
  locale: string;
  metadata?: Readonly<Record<string, unknown>>;
  url: string;
  title: string;
  description: string;
  markdown: string;
  body: string;
  compiled: string;
  headings: DocsHeading[];
  searchText: string;
  structuredData: {
    headings: { id: string; content: string }[];
    contents: { heading: string | undefined; content: string }[];
  };
}
export type DocsRuntimePage = Omit<DocsPage, "compiled" | "body" | "searchText" | "structuredData">;
export interface DocsPageNode {
  type: "page";
  id: string;
  title: string;
  url: string;
}
export interface DocsFolderNode {
  type: "folder";
  title: string;
  children: DocsTreeNode[];
  index?: DocsPageNode;
}
export type DocsTreeNode = DocsPageNode | DocsFolderNode;
export function buildContent(
  root: string,
  config: DocsConfig,
): Promise<{
  pages: DocsPage[];
  tree: DocsTreeNode[];
}>;
