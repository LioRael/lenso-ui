"use client";

import { useCallback, type ReactNode } from "react";
import { create } from "@orama/orama";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import { DocumentationSearch, DocumentationCompactSearchTrigger } from "@lenso/docs/client";

export interface SearchEntry {
  label: string;
  href?: string;
  status?: "new" | "new-dot" | "preview" | "updated";
  statusLabel?: string;
  children?: SearchEntry[];
  defaultOpen?: boolean;
}

export const CompactSearchTrigger = DocumentationCompactSearchTrigger;

export function SearchDialog({
  locale,
  compact = false,
  children,
}: {
  locale: string;
  compact?: boolean;
  children?: ReactNode;
}) {
  const initOrama = useCallback(
    () =>
      create({
        schema: { _: "string" },
        components: locale === "cn" ? { tokenizer: createTokenizer() } : undefined,
      }),
    [locale],
  );
  return (
    <DocumentationSearch
      from={`/search/${locale}.json`}
      initOrama={initOrama}
      compact={compact}
      labels={{ input: "Find a page" }}
      allowEmpty
    >
      {children}
    </DocumentationSearch>
  );
}
