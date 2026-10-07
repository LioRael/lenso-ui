import type { ComponentType, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import type { DocsConfig } from "./config.mjs";
import type { DocsHeading, DocsRuntimePage } from "./content.mjs";
import type { DocumentationSiteLayoutProps } from "./site-layout";
import type { DocumentationLocale } from "./document-model";
import type { DocumentationArticleProps } from "./article";

export interface DocumentationCustomizationContext {
  config: DocsConfig;
  page: DocsRuntimePage;
}

export interface DocumentationRootContext {
  config: DocsConfig;
  locale: DocumentationLocale;
}

export interface DocumentationRootOptions {
  Providers?: ComponentType<{ children: ReactNode; locale: string }>;
  bodyClassName?: string;
  skipLabel?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export type DocumentationSiteOptions = Partial<
  Omit<DocumentationSiteLayoutProps, "children" | "slots">
> & { slots?: DocumentationSiteLayoutProps["slots"] };

export type DocumentationPageOptions = Partial<
  Pick<DocumentationArticleProps, "actions" | "beforeContent" | "footer">
>;

export interface DocumentationDocumentResult {
  content: ReactNode;
  headings?: DocsHeading[];
}

export interface DocumentationCustomization {
  getRootOptions?(
    context: DocumentationRootContext,
  ): DocumentationRootOptions | Promise<DocumentationRootOptions>;
  getSiteOptions?(
    context: DocumentationCustomizationContext,
  ): DocumentationSiteOptions | Promise<DocumentationSiteOptions>;
  getPageOptions?(
    context: DocumentationCustomizationContext,
  ): DocumentationPageOptions | Promise<DocumentationPageOptions>;
  getDocument?(
    context: DocumentationCustomizationContext,
  ): DocumentationDocumentResult | Promise<DocumentationDocumentResult>;
  getComponents?(
    context: DocumentationCustomizationContext,
  ): MDXComponents | Promise<MDXComponents>;
  getSiteSlots?(
    context: DocumentationCustomizationContext,
  ): DocumentationSiteLayoutProps["slots"] | Promise<DocumentationSiteLayoutProps["slots"]>;
}
