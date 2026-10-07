import { readFile } from "node:fs/promises";
import path from "node:path";
import { createDocumentationSource } from "@lenso/docs/source";
import { docsDirectory } from "./docs-directory.mjs";
import authoredIndex from "../generated/lenso-docs-index.json";
import reference from "../generated/api-reference.json";

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
  componentThumbnail?: string;
  examples: { name: string; file: string }[];
}
interface DocsIndex {
  formatVersion: 1;
  lensoVersion: string;
  sourceFamilyMapping: Record<string, string>;
  pages: DocPage[];
}
export const docsIndex = authoredIndex as DocsIndex;
const docsRoot = docsDirectory();
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
    Object.entries(reference.families).map(([family, contract]) => [
      family,
      Object.keys(reference.families).filter(
        (candidate) =>
          candidate !== family &&
          contract.parts.some((part) =>
            part.members.some((member) =>
              reference.families[candidate as keyof typeof reference.families].parts.some(
                (other) => other.name === `${part.name}${member}`,
              ),
            ),
          ),
      ),
    ]),
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
  return readFile(path.join(docsRoot, page.markdownFile), "utf8");
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

export async function getExample(name: string, locale: Locale) {
  const entry = source.examples[locale][name];
  if (!entry) return null;
  return {
    name,
    code: await readFile(path.join(docsRoot, "src/demos", entry.file), "utf8"),
    source: entry.source,
    aliasOf: undefined,
    excludedReason: undefined,
  };
}

export async function getNavigation(locale: Locale, section: string) {
  return documentationSource
    .getNavigation(locale, section === "tools" ? "getting-started" : section)
    .map(({ title, url, description }) => ({
      label: title,
      ...(url ? { href: url } : {}),
      ...(description !== undefined ? { description } : {}),
    }));
}
