"use client";
import { useCallback } from "react";
import { experimental_useSearch as useSearch } from "fumadocs-core/search/client";
import { BenchLink } from "./client";
export function Search({ scopeIndex }) {
  const run = useCallback(
    async (query) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const { default: index } = await import(
        /* webpackIgnore: true */ `/_search/substring-${scopeIndex}.js`
      );
      return index
        .filter((item) => item.text.includes(q))
        .map((item) => ({ id: item.href, url: item.href, type: "page", content: item.title }));
    },
    [scopeIndex],
  );
  const { search, onSearchChange, isLoading, data, error } = useSearch(run, { delayMs: 0 });
  return (
    <section aria-label="Search documentation" data-docs-part="search">
      <input
        type="search"
        aria-label="Search documentation"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {isLoading && <output>Searching documentation</output>}
      {error && <div role="alert">{error.message}</div>}
      {data?.items.map((item) => (
        <BenchLink key={item.id} href={item.url}>
          {item.content}
        </BenchLink>
      ))}
    </section>
  );
}
