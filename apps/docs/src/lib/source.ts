import { componentCategories } from "./component-categories";
import { createDocumentationSource } from "@lenso/docs/source";
import authoredIndex from "../generated/lenso-docs-index.json";

export type Locale = "en" | "cn";
export interface DocPage {
  locale: Locale;
  slug: string;
  markdownFile: string;
  title: string;
  description: string;
  navigationGroup?: string;
  navigationOrder?: number;
  componentCategory?: string;
  examples: { name: string; file: string }[];
}
interface DocsIndex {
  formatVersion: 1;
  lensoVersion: string;
  sourceFamilyMapping: Record<string, string>;
  families: Record<string, { source?: string; native: string[]; related: string[] }>;
  pages: DocPage[];
}
export const docsIndex = authoredIndex as DocsIndex;
const exampleEntries = (locale: Locale): Record<string, { file: string; source: string }> =>
  Object.fromEntries(
    docsIndex.pages
      .filter((page) => page.locale === locale)
      .flatMap((page) =>
        page.examples.map((example) => [
          example.name,
          { file: example.file, source: `apps/docs/src/demos/${example.file}` },
        ]),
      ),
  );
export const source = {
  ...docsIndex,
  pages: docsIndex.pages.map((page) => ({ ...page, file: page.markdownFile })),
  examples: { en: exampleEntries("en"), cn: exampleEntries("cn") },
  relationships: Object.fromEntries(
    Object.entries(docsIndex.families).map(([family, metadata]) => [family, metadata.related]),
  ) as Record<string, string[]>,
};
export const isLocale = (value: string): value is Locale => value === "en" || value === "cn";
export const pageUrl = (page: Pick<DocPage, "locale" | "slug">) =>
  `/${page.locale}/docs/${page.slug}`;
export function canonicalSlug(slug: string) {
  const match = /^react\/components\/([^/]+)$/.exec(slug);
  return match && docsIndex.sourceFamilyMapping[match[1]!]
    ? `react/components/${docsIndex.sourceFamilyMapping[match[1]!]!}`
    : slug;
}
export function readPage(page: DocPage) {
  const files = import.meta.glob<string>("../../content/lenso/**/*.mdx", {
    query: "?raw",
    import: "default",
  });
  return files[`../../${page.markdownFile}`]!();
}

export const documentationSource = createDocumentationSource({
  locales: [
    { code: "en", label: "English", language: "en" },
    { code: "cn", label: "中文", language: "zh-CN" },
  ],
  pages: source.pages.map((page) => ({
    ...page,
    url: pageUrl(page),
    kind: page.slug.startsWith("react/components/") ? ("component" as const) : ("docs" as const),
    collection: /^react\/(?:getting-started|tools)(?:\/|$)/.test(page.slug)
      ? "getting-started"
      : (page.slug.split("/")[1] ?? "getting-started"),
    navigation: {
      order: page.navigationOrder ?? 0,
      ...(page.navigationGroup ? { group: page.navigationGroup } : {}),
    },
  })),
  readPage,
  canonicalSlug,
});

export const getPage = (locale: Locale, slug: string) => documentationSource.getPage(locale, slug);

export type DocSection = Pick<DocPage, "locale" | "slug" | "title"> & { href: string };
export function getSectionEntries(locale: Locale): DocSection[] {
  const sections = source.pages
    .filter(
      (page) =>
        page.locale === locale && /^react\/[^/]+$/.test(page.slug) && page.slug !== "react/tools",
    )
    .map((page) => ({ locale, slug: page.slug, title: page.title, href: pageUrl(page) }));
  return sections;
}

export function getNavigation(locale: Locale, section: string) {
  if (section === "components") {
    const pages = source.pages.filter((page) => page.locale === locale);
    const overview = pages.find((page) => page.slug === "react/components");
    return [
      ...(overview ? [{ label: overview.title, href: pageUrl(overview) }] : []),
      ...componentCategories.flatMap(([category, english, chinese]) => {
        const children = pages
          .filter((page) => page.componentCategory === category)
          .map((page) => ({ label: page.title, href: pageUrl(page) }));
        return children.length ? [{ label: locale === "cn" ? chinese : english, children }] : [];
      }),
    ];
  }
  return documentationSource
    .getNavigation(locale, section === "tools" ? "getting-started" : section)
    .map(({ title, url, description }) => ({
      label: title,
      ...(url ? { href: url } : {}),
      ...(description !== undefined ? { description } : {}),
    }));
}
