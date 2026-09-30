import { readFile } from "node:fs/promises";
import path from "node:path";
import sourceIndex from "../../content/source-index.json";
import { sourceConfig } from "../../source.config";

export type Locale = (typeof sourceConfig.locales)[number];
export interface DocPage {
  locale: Locale;
  slug: string;
  file: string;
  title: string;
  description: string;
  previews: string[];
}
interface DemoSource {
  file: string;
  exported: string;
  source: string;
  aliasOf?: string;
}
interface SourceIndex {
  pages: DocPage[];
  examples: Record<Locale, Record<string, DemoSource>>;
  relationships: Record<string, string[]>;
  unresolvedPreviews: { page: string; name: string }[];
  unregisteredSources: { locale: Locale; file: string; source: string }[];
  excludedExamples: { locale: Locale; name: string; source: string; reason: string }[];
}
export const source = sourceIndex as SourceIndex;
export const isLocale = (value: string): value is Locale => value === "en" || value === "cn";
export const pageUrl = (page: Pick<DocPage, "locale" | "slug">) =>
  `/${page.locale}/docs/${page.slug}`;
export const getPage = (locale: Locale, slug: string) =>
  source.pages.find((page) => page.locale === locale && page.slug === slug);
export const readPage = (page: DocPage) => readFile(path.join(process.cwd(), page.file), "utf8");

export async function getExample(name: string, locale: Locale) {
  const entry = source.examples[locale][name] ?? source.examples.en[name];
  if (!entry) return null;
  const example = JSON.parse(await readFile(path.join(process.cwd(), entry.file), "utf8")) as {
    code?: string;
    source: string;
    excludedReason?: string;
  };
  return { ...example, name, aliasOf: entry.aliasOf };
}

export async function getNavigation(locale: Locale, section: string) {
  const pages = source.pages.filter(
    (page) => page.locale === locale && page.slug.startsWith(`react/${section}`),
  );
  const metadata = JSON.parse(
    await readFile(
      path.join(
        process.cwd(),
        `${sourceConfig.directory}/${locale}/${sourceConfig.platform}/${section}/meta.json`,
      ),
      "utf8",
    ),
  ) as { pages?: string[] };
  const entries: { label: string; href?: string }[] = [];
  for (const item of metadata.pages ?? []) {
    if (item.startsWith("---")) {
      entries.push({ label: item.replace(/^---|---$/g, "") });
      continue;
    }
    if (item.startsWith("[")) continue;
    const file = `content/docs/${locale}/react/${section}/${item === "index" ? "index" : item}.mdx`;
    const page = pages.find((candidate) => candidate.file === file);
    if (page) entries.push({ label: page.title, href: pageUrl(page) });
  }
  const known = new Set(entries.map((entry) => entry.href));
  for (const page of pages) {
    if (!known.has(pageUrl(page))) entries.push({ label: page.title, href: pageUrl(page) });
  }
  return entries;
}
