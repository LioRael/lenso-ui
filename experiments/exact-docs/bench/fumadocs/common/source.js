import { loader } from "fumadocs-core/source";
import pages from "../data/pages.json";

export const scopes = new Map();
for (const page of pages) {
  const key = `${page.locale}/${page.version}`;
  if (!scopes.has(key)) scopes.set(key, []);
  scopes.get(key).push(page);
}
export const sources = new Map(
  [...scopes].map(([key, items]) => {
    const files = [];
    const groups = new Set();
    for (const page of items) {
      const group = `group-${page.groupIndex}`;
      if (!groups.has(group)) {
        groups.add(group);
        files.push({
          type: "meta",
          path: `${group}/meta.json`,
          data: {
            title: page.group,
            defaultOpen: true,
            pages: items.filter((p) => p.groupIndex === page.groupIndex).map((p) => p.id),
          },
        });
      }
      files.push({
        type: "page",
        path: `${group}/${page.id}.mdx`,
        data: { title: page.title, description: page.description, page },
      });
    }
    const byId = new Map(items.map((page) => [page.id, page.path]));
    return [
      key,
      loader({ source: { files }, baseUrl: "/", url: (slugs) => byId.get(slugs.at(-1)) }),
    ];
  }),
);
export function getPage(slug = []) {
  const pathname = "/" + slug.join("/");
  const page = pages.find((page) => page.path === pathname);
  if (!page) return;
  const source = sources.get(`${page.locale}/${page.version}`);
  const resolved = source.getPages().find((item) => item.url === pathname);
  if (!resolved) throw Error(`Fumadocs source did not resolve ${pathname}`);
  return { page: resolved.data.page, tree: source.getPageTree() };
}
export { pages };
