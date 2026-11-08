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
        links={[
          [cn ? "快速开始" : "Quick start", `/${locale}/docs/react/getting-started/installation`],
          ["Button", `/${locale}/docs/react/components/button`],
          ["Input", `/${locale}/docs/react/components/input`],
          ["SearchField", `/${locale}/docs/react/components/search-field`],
          ["Select", `/${locale}/docs/react/components/select`],
          [cn ? "主题" : "Theming", `/${locale}/docs/react/getting-started/theming`],
        ]}
        labels={{
          trigger: cn ? "搜索文档" : "Search documentation",
          input: cn ? "搜索文档" : "Find a page",
          placeholder: cn ? "搜索组件和指南" : "Search components and guides",
          close: cn ? "关闭搜索" : "Close search",
          clear: cn ? "清空搜索" : "Clear search",
          loading: cn ? "正在搜索…" : "Searching…",
          navigate: cn ? "选择" : "Navigate",
          select: cn ? "打开" : "Open",
          dismiss: cn ? "关闭" : "Close",
          hint: cn ? "输入组件名称或主题，查找相关文档。" : "Search by component name or topic.",
          suggestions: cn ? "快速访问" : "Quick access",
          results: cn ? "搜索结果" : "Results",
          page: cn ? "页面" : "Page",
          section: cn ? "章节" : "Section",
          openPage: cn ? "打开页面" : "Open page",
          openSection: cn ? "打开章节" : "Open section",
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
