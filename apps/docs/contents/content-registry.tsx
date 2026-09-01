import { allDocs } from "content-collections";
import type { MDXContent } from "mdx/types";

import {
  getDocsPageForRoute,
  getDocsRouteParams,
  type DocsPage,
  type DocsSectionId,
} from "./catalog";

type GeneratedDocsDocument = (typeof allDocs)[number];

export interface DocsDocument {
  actions?: readonly [string, string];
  description: string;
  eyebrow?: string;
  layout: "component" | "document" | "overview";
  mdxContent: MDXContent;
  metadata?: readonly [string, string];
  section: DocsSectionId;
  slug: DocsPage;
  title: string;
}

function pair(value: string[] | undefined): readonly [string, string] | undefined {
  if (value?.length !== 2 || value[0] === undefined || value[1] === undefined) return undefined;
  return [value[0], value[1]];
}

function normalizeDocument(document: GeneratedDocsDocument): DocsDocument {
  const actions = pair(document.actions);
  const metadata = pair(document.metadata);

  return {
    description: document.description,
    layout: document.layout as "component" | "document" | "overview",
    mdxContent: document.mdxContent,
    section: document.section as DocsSectionId,
    slug: document.slug as DocsPage,
    title: document.title,
    ...(actions ? { actions } : {}),
    ...(document.eyebrow ? { eyebrow: document.eyebrow } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export const docsContentRegistry = new Map<DocsPage, DocsDocument>(
  allDocs.map(normalizeDocument).map((document) => [document.slug, document]),
);

export function getDocsDocument(section: string, slug: string): DocsDocument | undefined {
  const page =
    section === "start" && slug === "overview" ? "overview" : getDocsPageForRoute(section, slug);
  return page ? docsContentRegistry.get(page) : undefined;
}

export { getDocsRouteParams };
