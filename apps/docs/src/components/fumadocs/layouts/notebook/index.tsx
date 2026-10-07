"use client";

import type { ReactNode } from "react";
import { DocumentationSiteLayout } from "@lenso/docs/client";
import type { Locale, DocSection } from "@/lib/source";
import { createLensoSiteOptions } from "../../../docs-site-options";
import type { SearchEntry } from "../../ui/search-dialog";

export function DocsLayout(props: {
  locale: Locale;
  slug: string;
  version: string;
  repository: string;
  entries: SearchEntry[];
  sectionEntries: DocSection[];
  children: ReactNode;
}) {
  const { children, ...options } = props;
  return (
    <DocumentationSiteLayout {...createLensoSiteOptions(options)}>
      {children}
    </DocumentationSiteLayout>
  );
}
