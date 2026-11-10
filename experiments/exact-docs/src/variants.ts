export const defaultLabels = {
  skipContent: "Skip to content",
  navigation: "Documentation",
  search: "Search documentation",
  noResults: "No pages found",
  searchLoading: "Searching documentation",
  contentLoading: "Loading page",
  contentError: "Page could not be loaded. Reload the page to try again.",
  searchError: "Search could not be loaded. Reload the page to try again.",
  pageActions: "Page actions",
  copyMarkdown: "Copy Markdown",
  openMarkdown: "Open Markdown",
  pagination: "Adjacent pages",
  previous: "Previous",
  next: "Next",
  toc: "On this page",
  language: "Language",
  version: "Version",
  unavailable: "Unavailable",
  archivedVersion: "You are reading an archived version.",
  deprecatedVersion: "You are reading a deprecated version.",
};
export type Labels = typeof defaultLabels;
export type Locale = { id: string; label: string; dir: "ltr" | "rtl"; labels: Labels };
export type Version = { id: string; label: string; status: "current" | "archived" | "deprecated" };
export type VariantConfig = {
  locales: Locale[];
  versions: Version[];
  defaultLocale: string;
  defaultVersion: string;
};
export type Scope = { id: string; locale: string; version: string };
export type Choice = { id: string; label: string; href: string; current: boolean; exact: boolean };

function mapping(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function entries(value: unknown, name: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || !value.length) throw new Error(`${name} must be a nonempty array`);
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (
      !mapping(item) ||
      typeof item["id"] !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(item["id"]) ||
      typeof item["label"] !== "string" ||
      !item["label"].trim()
    )
      throw new Error(`${name} entries require an id and label`);
    if (ids.has(item["id"])) throw new Error(`Duplicate ${name} id: ${item["id"]}`);
    ids.add(item["id"]);
    return { item, id: item["id"], label: item["label"] };
  });
}

export function parseVariants(value: Record<string, unknown>): VariantConfig {
  const locales = entries(value["locales"], "locales").map(({ item, id, label }): Locale => {
    try {
      Intl.getCanonicalLocales(id);
    } catch {
      throw new Error(`Invalid locale tag: ${id}`);
    }
    const dir = item["dir"] === undefined ? "ltr" : item["dir"];
    if (dir !== "ltr" && dir !== "rtl") throw new Error(`Invalid direction for locale ${id}`);
    const labels = { ...defaultLabels };
    const overrides = item["labels"];
    if (overrides !== undefined) {
      if (!mapping(overrides)) throw new Error(`Locale ${id} labels must be a mapping`);
      for (const key of Object.keys(defaultLabels) as (keyof Labels)[]) {
        if (overrides[key] === undefined) continue;
        if (typeof overrides[key] !== "string" || !overrides[key].trim())
          throw new Error(`Locale ${id} label ${key} must be a nonempty string`);
        labels[key] = overrides[key];
      }
    }
    return { id, label, dir, labels };
  });
  const versions = entries(value["versions"], "versions").map(({ item, id, label }): Version => {
    const status = item["status"] === undefined ? "current" : item["status"];
    if (status !== "current" && status !== "archived" && status !== "deprecated")
      throw new Error(`Invalid status for version ${id}`);
    return { id, label, status };
  });
  const defaultId = (key: string, axis: { id: string }[]) => {
    const id = value[key] === undefined ? (axis[0]?.id ?? "") : value[key];
    if (typeof id !== "string" || (axis.length ? !axis.some((item) => item.id === id) : id !== ""))
      throw new Error(`Unknown ${key}: ${String(id)}`);
    return id;
  };
  return {
    locales,
    versions,
    defaultLocale: defaultId("defaultLocale", locales),
    defaultVersion: defaultId("defaultVersion", versions),
  };
}

export function pageScope(page: Record<string, unknown>, config: VariantConfig): Scope {
  const id = page["id"] === undefined ? page["path"] : page["id"];
  if (typeof id !== "string" || !id.trim()) throw new Error("Page id must be a nonempty string");
  const locale = page["locale"] === undefined ? config.defaultLocale : page["locale"];
  const version = page["version"] === undefined ? config.defaultVersion : page["version"];
  if (
    typeof locale !== "string" ||
    (config.locales.length ? !config.locales.some((item) => item.id === locale) : locale !== "")
  )
    throw new Error(`Unknown page locale: ${String(locale)}`);
  if (
    typeof version !== "string" ||
    (config.versions.length ? !config.versions.some((item) => item.id === version) : version !== "")
  )
    throw new Error(`Unknown page version: ${String(version)}`);
  return { id, locale, version };
}

export const sameScope = (left: Scope, right: Scope) =>
  left.locale === right.locale && left.version === right.version;

export function choices<T extends Scope & { path: string; nav?: boolean }>(
  documents: T[],
  current: T,
  axis: "locale" | "version",
  options: { id: string; label: string }[],
): Choice[] {
  return options.map(({ id, label }) => {
    const scope = { ...current, [axis]: id };
    const pages = documents.filter((doc) => sameScope(doc, scope));
    const counterpart = pages.find((doc) => doc.id === current.id);
    const target = counterpart ?? pages.find((doc) => doc.nav !== false);
    return {
      id,
      label,
      href: target?.path ?? "",
      current: id === current[axis],
      exact: counterpart !== undefined,
    };
  });
}

export const searchIndexUrl = (scope: Scope) =>
  `/_docs/search/${scope.locale || "_default"}/${scope.version || "_default"}/index.json`;
