"use client";
import { useStaticSearch } from "fumadocs-core/search/client/orama-static";
import { BenchLink } from "./client";
export function Search({ scopeIndex }) {
  const { search, onSearchChange, isLoading, data, error } = useStaticSearch({
    from: `/_search/${scopeIndex}.json`,
  });
  const items = data?.items.flatMap((item) => (item.type === "table" ? item.rows : [item])) ?? [];
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
      {items.map((item) => (
        <BenchLink key={item.id} href={item.url}>
          {item.content}
        </BenchLink>
      ))}
    </section>
  );
}
