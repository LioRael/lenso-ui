import { readFile } from "node:fs/promises";
import path from "node:path";
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
export const getPage = (locale: Locale, slug: string) =>
  source.pages.find((page) => page.locale === locale && page.slug === canonicalSlug(slug));
export const readPage = (page: DocPage) => readFile(path.join(docsRoot, page.markdownFile), "utf8");

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
  const guides = section === "getting-started" || section === "tools";
  const pages = source.pages
    .filter(
      (page) =>
        page.locale === locale &&
        (guides
          ? /^react\/(?:getting-started|tools)(?:\/|$)/.test(page.slug)
          : page.slug === `react/${section}` || page.slug.startsWith(`react/${section}/`)),
    )
    .sort((a, b) => (a.navigationOrder ?? 0) - (b.navigationOrder ?? 0));
  const entries: { label: string; href?: string; description?: string }[] = [];
  let group: string | undefined;
  for (const page of pages) {
    if (page.navigationGroup && page.navigationGroup !== group) {
      group = page.navigationGroup;
      entries.push({ label: group });
    }
    entries.push({ label: page.title, href: pageUrl(page), description: page.description });
  }
  return entries;
}
