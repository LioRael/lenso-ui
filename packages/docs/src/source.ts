import { normalizeMetadata } from "./metadata.ts";
import { headingText as extractHeadingText } from "./heading-utils.ts";
import type { HeadingTextNode } from "./heading-utils.js";

import type { DocumentationKind, DocumentationLocale } from "./document-model.js";
export const headingText: (node: HeadingTextNode) => string = extractHeadingText;

export interface DocumentationPageMetadata {
  slug: string;
  url: string;
  locale: string;
  title: string;
  description?: string;
  kind?: DocumentationKind;
  collection?: string;
  translationKey?: string;
  metadata?: Readonly<Record<string, unknown>>;
  navigation?: { group?: string; order?: number };
}

export interface DocumentationSource<Page extends DocumentationPageMetadata> {
  readonly pages: readonly Page[];
  readonly locales: readonly DocumentationLocale[];
  isLocale(code: string): boolean;
  getPage(locale: string, slug: string): Page | undefined;
  readPage(page: Page): Promise<string>;
  getAlternates(page: Page): (DocumentationLocale & { url: string })[];
  getNavigation(
    locale: string,
    collection?: string,
  ): {
    title: string;
    url?: string;
    description?: string;
  }[];
}

function fail(message: string): never {
  throw new Error(`Documentation source: ${message}`);
}

function text(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) fail(`${name} must be a non-empty string.`);
}

function route(value: string, name: string): void {
  text(value, name);
  if (!value.startsWith("/") || value.startsWith("//") || /[\\?#\s]/u.test(value))
    fail(`${name} must be a local absolute path without query or fragment.`);
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    fail(`${name} has invalid escaping.`);
  }
  if (
    decoded.split("/").some((segment) => segment === "." || segment === "..") ||
    decoded.includes("\\")
  )
    fail(`${name} must not traverse directories.`);
}

/**
 * Index adapters supply product metadata and source reading; this module owns
 * locale identity, lookup, alternates and grouped navigation for every host.
 */
export function createDocumentationSource<Page extends DocumentationPageMetadata>({
  pages,
  locales,
  readPage,
  canonicalSlug = (slug) => slug,
}: {
  pages: readonly Page[];
  locales: readonly DocumentationLocale[];
  readPage(page: NoInfer<Page>): Promise<string>;
  canonicalSlug?(slug: string): string;
}): DocumentationSource<Page> {
  if (!Array.isArray(pages) || !Array.isArray(locales) || !locales.length)
    fail("provide pages and at least one locale.");
  if (typeof readPage !== "function" || typeof canonicalSlug !== "function")
    fail("readPage and canonicalSlug must be functions.");
  const languages = new Map<string, DocumentationLocale>();
  for (const locale of locales) {
    for (const field of ["code", "label", "language"]) text(locale[field], `locale.${field}`);
    if (languages.has(locale.code)) fail(`duplicate locale "${locale.code}".`);
    languages.set(locale.code, Object.freeze({ ...locale }));
  }
  const identities = new Map<string, Map<string, Page>>();
  const translations = new Map<string, Map<string, Page>>();
  const urls = new Set<string>();
  const snapshot = pages.map((input) => {
    if (!languages.has(input.locale)) fail(`unknown locale "${input.locale}".`);
    if (typeof input.slug !== "string") fail("page.slug must be a string.");
    text(input.title, "page.title");
    if (input.translationKey !== undefined) text(input.translationKey, "page.translationKey");
    route(`/${input.slug}`, "page.slug");
    route(input.url, "page.url");
    if (!["docs", "component", "api"].includes(input.kind ?? "docs"))
      fail(`unsupported page kind "${input.kind}".`);
    const key = `${input.locale}:${input.slug}`;
    let localePages = identities.get(input.locale);
    if (!localePages) {
      localePages = new Map();
      identities.set(input.locale, localePages);
    }
    if (localePages.has(input.slug)) fail(`duplicate page "${key}".`);
    const translationKey = input.translationKey ?? input.slug;
    let translatedPages = translations.get(translationKey);
    if (!translatedPages) {
      translatedPages = new Map();
      translations.set(translationKey, translatedPages);
    }
    if (translatedPages.has(input.locale))
      fail(`duplicate translation "${translationKey}" in "${input.locale}".`);
    if (urls.has(input.url)) fail(`duplicate URL "${input.url}".`);
    if (input.navigation?.order !== undefined && !Number.isFinite(input.navigation.order))
      fail(`invalid navigation order for "${key}".`);
    const page = Object.freeze({
      ...input,
      kind: input.kind ?? "docs",
      ...(input.metadata !== undefined ? { metadata: normalizeMetadata(input.metadata) } : {}),
      ...(input.navigation ? { navigation: Object.freeze({ ...input.navigation }) } : {}),
    });
    localePages.set(input.slug, page);
    translatedPages.set(input.locale, page);
    urls.add(input.url);
    return page;
  });
  const source = {
    pages: Object.freeze(snapshot),
    locales: Object.freeze([...languages.values()]),
    isLocale: (code: string) => languages.has(code),
    getPage: (locale: string, slug: string) => identities.get(locale)?.get(canonicalSlug(slug)),
    readPage,
    getAlternates(page: Page) {
      return [...(translations.get(page.translationKey ?? page.slug)?.values() ?? [])].map(
        (candidate) => ({ ...languages.get(candidate.locale)!, url: candidate.url }),
      );
    },
    getNavigation(locale: string, collection?: string) {
      if (!languages.has(locale)) fail(`unknown locale "${locale}".`);
      const selected = snapshot
        .filter(
          (page) =>
            page.locale === locale && (collection === undefined || page.collection === collection),
        )
        .toSorted((a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0));
      const result: { title: string; url?: string; description?: string }[] = [];
      let group: string | undefined;
      for (const page of selected) {
        const currentGroup = page.navigation?.group;
        if (currentGroup && currentGroup !== group) {
          group = currentGroup;
          result.push({ title: currentGroup });
        }
        result.push({
          title: page.title,
          url: page.url,
          ...(page.description !== undefined ? { description: page.description } : {}),
        });
      }
      return result;
    },
  };
  return Object.freeze(source);
}
