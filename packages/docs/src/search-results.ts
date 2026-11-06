import type { ReactSortedResult } from "fumadocs-core/search";

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
