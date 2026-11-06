"use client";

import { I18nProvider } from "fumadocs-ui/contexts/i18n";
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
    <I18nProvider
      locale={locale}
      translations={
        cn
          ? {
              "Search(search dialog)": "搜索",
              "Close Search(search dialog)(aria-label)": "关闭搜索",
            }
          : {}
      }
    >
      <DocumentationSearch
        from={`/search/${locale}.json`}
        compact={compact}
        labels={{
          trigger: cn ? "搜索文档" : "Search documentation",
          input: cn ? "搜索文档" : "Find a page",
          placeholder: cn ? "搜索组件和指南" : "Search components and guides",
          close: cn ? "关闭搜索" : "Close search",
          empty: cn ? "没有匹配的页面。" : "No matching pages.",
          error: cn
            ? "搜索加载失败，请关闭后重试。"
            : "Unable to load search. Close this dialog and try again.",
        }}
      >
        {children}
      </DocumentationSearch>
    </I18nProvider>
  );
}
