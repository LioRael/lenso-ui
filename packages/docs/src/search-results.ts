import type { ReactSortedResult } from "fumadocs-core/search";

export type DocumentationSearchResult = ReactSortedResult & {
  summary?: ReactSortedResult["content"];
};

// Body matches describe their page; headings retain their own navigation target.
export function compactSearchResults(items: ReactSortedResult[], query: string) {
  const results: DocumentationSearchResult[] = [];
  let page: DocumentationSearchResult | undefined;
  for (const item of prioritizeSearchPages(items, query)) {
    if (item.type === "text" && page) {
      page.summary ??= item.content;
    } else {
      const result = { ...item };
      results.push(result);
      if (item.type === "page") page = result;
    }
  }
  return results;
}

export function prioritizeSearchPages(items: ReactSortedResult[], query: string) {
  const groups: ReactSortedResult[][] = [];
  for (const item of items) {
    if (item.type === "page" || !groups.length) groups.push([]);
    groups.at(-1)!.push(item);
  }
  const term = query.trim().toLocaleLowerCase();
  const rank = ([page]: ReactSortedResult[]) => {
    const title = typeof page?.content === "string" ? page.content.toLocaleLowerCase() : "";
    return title === term ? 0 : title.startsWith(term) ? 1 : 2;
  };
  return groups
    .sort((a, b) => rank(a) - rank(b))
    .flat()
    .slice(0, 20);
}
