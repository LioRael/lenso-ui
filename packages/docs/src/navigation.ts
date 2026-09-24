import { docsHref, routeSlug, type DocsConfig, type DocsMeta } from "./config";

export interface DocsEntry {
  id: string;
  data: { title: string; description?: string; draft?: boolean };
  body?: string;
}

export interface DocsNavPage {
  href: string;
  id: string;
  title: string;
  description?: string;
}

export interface DocsNavTab {
  href: string;
  label: string;
  path: string;
  pages: DocsNavPage[];
  groups: { key: string; title?: string; pages: DocsNavPage[] }[];
}

export interface DocsMetaEntry {
  directory: string;
  meta: DocsMeta;
}

export function createDocsNavigation(
  config: DocsConfig,
  entries: DocsEntry[],
  metadata: DocsMetaEntry[] = [],
): DocsNavTab[] {
  const pages = entries
    .filter((entry) => !entry.data.draft)
    .map((entry) => ({
      href: docsHref(config, entry.id),
      id: entry.id,
      title: entry.data.title,
      ...(entry.data.description ? { description: entry.data.description } : {}),
    }));
  const paths = new Map<string, string>();
  for (const page of pages) {
    const slug = routeSlug(page.id);
    const prior = paths.get(slug);
    if (prior) throw new Error(`Docs route collision: ${prior} and ${page.id}`);
    paths.set(slug, page.id);
  }

  const metaByDirectory = new Map(metadata.map(({ directory, meta }) => [directory, meta]));
  const order = new Map<string, number>();
  for (const { directory, meta } of metadata) {
    meta.pages?.forEach((name, index) => order.set(`${directory}/${name}`, index));
  }

  function comparePages(a: DocsNavPage, b: DocsNavPage): number {
    const aParts = a.id.split("/");
    const bParts = b.id.split("/");
    for (let index = 0; index < Math.min(aParts.length, bParts.length); index++) {
      if (aParts[index] === bParts[index]) continue;
      const parent = aParts.slice(0, index).join("/");
      const aOrder =
        aParts[index] === "index"
          ? -1
          : (order.get(`${parent}/${aParts[index]}`) ?? Number.MAX_SAFE_INTEGER);
      const bOrder =
        bParts[index] === "index"
          ? -1
          : (order.get(`${parent}/${bParts[index]}`) ?? Number.MAX_SAFE_INTEGER);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return aParts[index]!.localeCompare(bParts[index]!);
    }
    return aParts.length - bParts.length;
  }

  const navigation = config.tabs.map((tab) => {
    const path = tab.path.replace(/^\/+|\/+$/g, "");
    const tabPages = pages
      .filter((page) => routeSlug(page.id) === path || routeSlug(page.id).startsWith(`${path}/`))
      .sort(comparePages);
    if (!tabPages.length) throw new Error(`Docs tab has no pages: ${path}`);
    const index = tabPages.find((page) => routeSlug(page.id) === path);
    const groups: DocsNavTab["groups"] = [];
    for (const page of tabPages) {
      const parts = page.id.split("/");
      const groupIndex = parts.findIndex((part) => /^\(.+\)$/.test(part));
      const key = groupIndex < 0 ? "" : parts.slice(0, groupIndex + 1).join("/");
      const last = groups.at(-1);
      if (last?.key === key) last.pages.push(page);
      else
        groups.push({
          key,
          ...(key
            ? { title: metaByDirectory.get(key)?.title ?? parts[groupIndex]!.slice(1, -1) }
            : {}),
          pages: [page],
        });
    }
    return {
      href: index?.href ?? tabPages[0]!.href,
      label: tab.label,
      path,
      pages: tabPages,
      groups,
    };
  });

  const assigned = new Set(navigation.flatMap((tab) => tab.pages.map((page) => page.id)));
  for (const page of pages) {
    if (!assigned.has(page.id)) throw new Error(`Docs page is outside configured tabs: ${page.id}`);
  }
  return navigation;
}
