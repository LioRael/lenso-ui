export interface DocsTab {
  label: string;
  path: string;
}

export interface DocsConfig {
  title: string;
  description?: string;
  basePath?: string;
  site?: string;
  tabs: DocsTab[];
}

export interface DocsMeta {
  title?: string;
  pages?: string[];
}

export function defineDocsConfig<T extends DocsConfig>(config: T): T {
  if (!config.title.trim()) throw new Error("Docs title cannot be empty");
  if (!config.tabs.length) throw new Error("Docs need at least one top-level tab");

  const seen = new Set<string>();
  for (const tab of config.tabs) {
    const path = trimSlashes(tab.path);
    if (!path || path.includes("/")) {
      throw new Error(`Tab path must be one URL segment: ${tab.path}`);
    }
    if (seen.has(path)) throw new Error(`Duplicate docs tab: ${path}`);
    seen.add(path);
  }

  return config;
}

export function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

export function docsHref(config: DocsConfig, id: string): string {
  const base = trimSlashes(config.basePath ?? "");
  const slug = routeSlug(id);
  return `/${[base, slug].filter(Boolean).join("/")}`;
}

export function routeSlug(id: string): string {
  const parts = trimSlashes(id)
    .split("/")
    .filter((part) => part && !/^\(.+\)$/.test(part));
  if (parts.at(-1) === "index") parts.pop();
  return parts.join("/");
}

export function defineDocsMeta<T extends DocsMeta>(meta: T): T {
  return meta;
}
