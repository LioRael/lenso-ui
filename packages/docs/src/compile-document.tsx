import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import type { PluggableList } from "unified";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import remarkGfm from "remark-gfm";
import { headingText, isNonRenderingPrefix } from "./heading-utils.mjs";
import type { DocumentationHeading } from "./document-model";

/** Structural AST contract shared by Markdown and MDX JSX nodes. */
export interface DocumentationAstNode {
  type: string;
  value?: string;
  alt?: string;
  depth?: number;
  name?: string | null;
  children?: DocumentationAstNode[];
  attributes?: {
    type: string;
    name?: string;
    value?: unknown;
  }[];
  data?: {
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface DocumentationHeadingPolicy {
  id: (title: string) => string;
  include?: (title: string, depth: number) => boolean;
  /** A nonempty result owns this node's subtree, replacing ordinary heading collection there. */
  additional?: (node: DocumentationAstNode) => DocumentationHeading[];
}

export interface CompileDocumentOptions {
  markdown: string;
  components?: MDXComponents;
  remarkPlugins?: PluggableList;
  headingPolicy?: DocumentationHeadingPolicy;
  titleMode?: "preserve" | "remove-leading";
}

export interface CompiledDocument {
  content: ReactNode;
  headings: DocumentationHeading[];
  /** Exact authored input, including frontmatter and content replaced by plugins. */
  markdown: string;
  frontmatter: Record<string, unknown>;
}

export async function compileDocument({
  markdown,
  components,
  remarkPlugins = [],
  headingPolicy,
  titleMode = "preserve",
}: CompileDocumentOptions): Promise<CompiledDocument> {
  const parsed = matter(markdown);
  const headings: DocumentationHeading[] = [];
  // Slug state belongs to one compilation, including headings excluded from the TOC.
  const slugger = new GithubSlugger();
  const id = headingPolicy?.id ?? ((title: string) => slugger.slug(title));
  const include =
    headingPolicy?.include ?? ((_title: string, depth: number) => depth >= 2 && depth <= 4);
  const removeLeadingTitle = () => (tree: DocumentationAstNode) => {
    const index = tree.children?.findIndex((node) => !isNonRenderingPrefix(node)) ?? -1;
    if (
      titleMode === "remove-leading" &&
      tree.children?.[index]?.type === "heading" &&
      tree.children[index].depth === 1
    )
      tree.children.splice(index, 1);
  };
  const collectHeadings = () => (tree: DocumentationAstNode) => {
    function visit(node: DocumentationAstNode) {
      const additional = headingPolicy?.additional?.(node) ?? [];
      if (additional.length) {
        headings.push(
          ...additional.map((heading) => ({
            ...heading,
            title: heading.title.replace(/\[!toc\]/g, "").trim(),
          })),
        );
        return;
      }
      if (node.type === "heading" && node.depth !== undefined) {
        const title = headingText(node);
        const headingId = id(title);
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, id: headingId },
        };
        if (include(title, node.depth))
          headings.push({
            title: title.replace(/\[!toc\]/g, "").trim(),
            id: headingId,
            depth: node.depth,
          });
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
  };
  const { content } = await compileMDX({
    source: parsed.content,
    components,
    options: {
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, removeLeadingTitle, ...remarkPlugins, collectHeadings],
      },
    },
  });
  return { content, headings, markdown, frontmatter: parsed.data };
}
