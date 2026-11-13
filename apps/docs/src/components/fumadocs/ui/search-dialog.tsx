"use client";

import { type ReactNode } from "react";
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
  const cn = locale === "cn";
  return (
    <DocumentationSearch
      from={`/search/${locale}.json`}
      compact={compact}
      links={[
        [cn ? "快速开始" : "Quick start", `/${locale}/docs/react/getting-started/installation`],
        ["Button", `/${locale}/docs/react/components/button`],
        ["Input", `/${locale}/docs/react/components/input`],
        ["SearchField", `/${locale}/docs/react/components/search-field`],
        ["Select", `/${locale}/docs/react/components/select`],
        [cn ? "主题" : "Theming", `/${locale}/docs/react/getting-started/theming`],
      ]}
      labels={{
        placeholder: cn ? "搜索组件和指南" : "Search components and guides",
        hint: cn ? "输入组件名称或主题，查找相关文档。" : "Search by component name or topic.",
      }}
    >
      {children}
    </DocumentationSearch>
  );
}
